import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

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

      // 调用进度回调
      if (onProgress) {
        onProgress(i + 1, slidesCount);
      }

      // 将指定 DOM 节点转化为 Canvas
      const canvas = await html2canvas(cardElement, {
        scale: 2,              // 放大2倍获取高清图片 (1200x1600px -> 2400x3200px)
        useCORS: true,         // 支持加载跨域网络图片（例如微信头像）
        backgroundColor: null,  // 支持透明背景
        logging: false,
      });

      // 将 canvas 转为 png 格式的 Blob
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/png');
      });

      if (blob) {
        // 按照页码顺序加入压缩包
        folder.file(`card-slide-${i + 1}.png`, blob);
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
