import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

let memoCanvas: HTMLCanvasElement | null = null;
let memoCanvasCtx: CanvasRenderingContext2D | null = null;

/**
 * 使用 Canvas 2D 绘图上下文将任意浏览器支持的 CSS 颜色字符串（如 oklch, oklab, color, hwb 等）转换为标准的 rgba 格式。
 * 这样做可以保证即使在广色域浏览器（会将 fillStyle 序列化为 color() 或 oklch()）上，也能通过 getImageData 输出 html2canvas 兼容的 rgba(...)。
 */
function convertToRgb(colorStr: string): string {
  if (!colorStr) return '';
  if (!memoCanvasCtx) {
    memoCanvas = document.createElement('canvas');
    memoCanvas.width = 1;
    memoCanvas.height = 1;
    memoCanvasCtx = memoCanvas.getContext('2d', { willReadFrequently: true });
  }
  if (memoCanvasCtx) {
    memoCanvasCtx.clearRect(0, 0, 1, 1);
    memoCanvasCtx.fillStyle = colorStr;
    memoCanvasCtx.fillRect(0, 0, 1, 1);
    const data = memoCanvasCtx.getImageData(0, 0, 1, 1).data;
    const r = data[0];
    const g = data[1];
    const b = data[2];
    const a = data[3] / 255;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  return colorStr;
}

/**
 * 转换 CSS 样式值中的所有现代颜色函数，并移除渐变中的插值空间标识（如 in oklab,）
 */
function replaceColorFunctions(styleVal: string): string {
  if (!styleVal) return '';
  // 匹配 oklch(), oklab(), color(), hwb(), lab(), lch() 等现代颜色函数
  let result = styleVal.replace(/(oklch|oklab|color|hwb|lab|lch)\([^)]+\)/g, (match) => {
    return convertToRgb(match);
  });
  result = result
    .replace(/in oklab,\s*/g, '')
    .replace(/in oklch,\s*/g, '');
  return result;
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
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById(`${elementIdPrefix}-${i}`);
          if (clonedElement) {
            const allElements = [clonedElement, ...Array.from(clonedElement.getElementsByTagName('*'))] as HTMLElement[];
            allElements.forEach((el) => {
              const win = el.ownerDocument?.defaultView || window;
              const style = win.getComputedStyle(el);

              // 检查并替换所有可能使用到现代颜色的 CSS 属性
              const colorProps = [
                'color',
                'backgroundColor',
                'borderColor',
                'borderTopColor',
                'borderRightColor',
                'borderBottomColor',
                'borderLeftColor',
                'backgroundImage',
                'background',
                'boxShadow',
                'textShadow',
                'outlineColor',
                'fill',
                'stroke'
              ];

              colorProps.forEach((prop) => {
                const val = (style as any)[prop];
                if (val && (
                  val.includes('oklch') ||
                  val.includes('oklab') ||
                  val.includes('color(') ||
                  val.includes('hwb(') ||
                  val.includes('lab(') ||
                  val.includes('lch(')
                )) {
                  const converted = replaceColorFunctions(val);
                  (el.style as any)[prop] = converted;
                }
              });
            });
          }
        }
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
