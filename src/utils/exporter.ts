import { domToJpeg, waitUntilLoad } from 'modern-screenshot';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// 辅助函数：将图片 URL 转换为 Base64
// 1. 优先尝试直接 fetch（针对阿里云 OSS 等本身已开启 CORS 的域名，速度最快且最安全）
// 2. 失败后退回到主要代理（corsproxy.io）
// 3. 再次失败退回到备选代理（allorigins.win）
// 4. 均失败则退回到直接 URL 引用
async function toDataURL(url: string): Promise<string> {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return url;
  }
  
  // 1. 优先直接 fetch
  try {
    const response = await fetch(url);
    if (response.ok) {
      const blob = await response.blob();
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
  } catch (e) {
    console.warn(`Direct fetch failed for ${url} (possibly CORS blocked), trying proxies...`, e);
  }
  
  // 2. 尝试使用 corsproxy.io 代理
  try {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error(`HTTP status ${response.status}`);
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn(`corsproxy.io failed for ${url}, trying allorigins.win...`, e);
    
    // 3. 尝试使用备用代理 allorigins.win
    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error(`HTTP status ${response.status}`);
      const blob = await response.blob();
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (err2) {
      console.error(`All CORS proxies failed for ${url}. Falling back to direct URL.`, err2);
      return url;
    }
  }
}

/**
 * 批量导出 DOM 节点为 PNG 压缩包
 * @param slidesCount 卡片页数
 * @param elementIdPrefix DOM 节点 ID 前缀，如 `xhs-card`
 * @param onProgress 进度回调函数
 */
export async function exportAllCards(
  slidesCount: number,
  elementIdPrefix: string,
  onProgress?: (current: number, total: number) => void
): Promise<boolean> {
  try {
    const zip = new JSZip();
    const folder = zip.folder("publisher-images");

    if (!folder) {
      throw new Error("创建 ZIP 文件夹失败");
    }

    for (let i = 0; i < slidesCount; i++) {
      const cardElement = document.getElementById(`${elementIdPrefix}-${i}`);
      if (!cardElement) continue;

      // 动态计算缩放比例，将预览的实际宽度放大至正好为 1200px
      const elementWidth = cardElement.offsetWidth || 384;
      const targetScale = 1200 / elementWidth;

      // 调用进度回调
      if (onProgress) {
        onProgress(i + 1, slidesCount);
      }

      // 克隆 DOM 节点到视口外以避免画面闪烁，并在此克隆体上修改导出样式
      const clonedElement = cardElement.cloneNode(true) as HTMLElement;
      clonedElement.style.position = 'fixed';
      clonedElement.style.top = '-9999px';
      clonedElement.style.left = '-9999px';
      clonedElement.style.width = `${elementWidth}px`;
      clonedElement.style.height = `${cardElement.offsetHeight}px`;

      // 移除预览特有的圆角 and 投影阴影，导出干净的直角原图
      clonedElement.classList.remove('rounded-2xl', 'shadow-md');
      clonedElement.style.borderRadius = '0';
      clonedElement.style.boxShadow = 'none';

      // 只有当主题没有自定义边框时，才移除默认的预览浅灰色边框
      const hasCustomBorder = clonedElement.className.includes('border-') && !clonedElement.className.includes('border-gray-100');
      if (!hasCustomBorder) {
        clonedElement.classList.remove('border', 'border-gray-100');
        clonedElement.style.border = 'none';
      } else {
        // 移除预览浅灰色边框类，保留主题的自定义边框类
        clonedElement.classList.remove('border-gray-100');
      }

      // 找到所有的 img 标签，并并行将它们转换为 Base64 格式，规避跨域限制且不需要在截图时发出网络请求
      const imgs = Array.from(clonedElement.querySelectorAll('img'));
      await Promise.all(
        imgs.map(async (img) => {
          const src = img.getAttribute('src');
          if (src) {
            const dataUrl = await toDataURL(src);
            img.setAttribute('src', dataUrl);
            img.removeAttribute('crossorigin');
          }
        })
      );

      document.body.appendChild(clonedElement);

      let blob: Blob | null = null;
      try {
        // 1. 等待克隆 DOM 树中的图片和字体等全部媒体资源加载完毕
        await waitUntilLoad(clonedElement);

        // 2. 使用专门的 domToJpeg 方法导出 JPEG 数据 URL
        const dataUrl = await domToJpeg(clonedElement, {
          scale: targetScale,
          backgroundColor: '#ffffff',
          quality: 0.95,
        });

        // 3. 将数据 URL 转换为 Blob 文件
        blob = await fetch(dataUrl).then((res) => res.blob());
      } catch (err) {
        console.error(`导出第 ${i + 1} 页卡片失败:`, err);
      } finally {
        document.body.removeChild(clonedElement);
      }

      if (blob) {
        // 按照页码顺序加入压缩包
        folder.file(`card-slide-${i + 1}.jpg`, blob);
      }
    }

    // 打包压缩包数据
    const content = await zip.generateAsync({ type: "blob" });

    // 触发浏览器下载
    saveAs(content, "发布作品图文卡片包.zip");
    return true;
  } catch (err) {
    console.error("批量打包导出图片失败:", err);
    return false;
  }
}
