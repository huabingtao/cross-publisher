import juice from 'juice';
import hljsCSS from 'highlight.js/styles/github.css?raw';

export async function copyHtmlToClipboard(html: string, plainText: string): Promise<boolean> {
  try {
    // 现代浏览器使用 Clipboard API
    const htmlBlob = new Blob([html], { type: 'text/html' });
    const plainBlob = new Blob([plainText], { type: 'text/plain' });

    const clipboardItem = new ClipboardItem({
      'text/html': htmlBlob,
      'text/plain': plainBlob
    });

    await navigator.clipboard.write([clipboardItem]);
    return true;
  } catch (err) {
    console.warn('Modern Clipboard API failed, attempting fallback...', err);
    return fallbackCopyHtml(html);
  }
}

function fallbackCopyHtml(html: string): boolean {
  try {
    // 兼容旧版浏览器和某些 WebView 的 document.execCommand 回退方案
    const container = document.createElement('div');
    container.innerHTML = html;
    container.style.position = 'fixed';
    container.style.pointerEvents = 'none';
    container.style.opacity = '0';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    const selection = window.getSelection();
    selection?.removeAllRanges();
    
    const range = document.createRange();
    range.selectNodeContents(container);
    selection?.addRange(range);

    const success = document.execCommand('copy');
    selection?.removeAllRanges();
    document.body.removeChild(container);

    return success;
  } catch (err) {
    console.error('Fallback copy rich text failed:', err);
    return false;
  }
}

function modifyHtmlStructure(htmlString: string): string {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlString;

  // 移动 `li > ul` 和 `li > ol` 到 `li` 后面（微信编辑器兼容）
  tempDiv.querySelectorAll('li > ul, li > ol').forEach((originalItem) => {
    originalItem.parentElement!.insertAdjacentElement('afterend', originalItem);
  });

  return tempDiv.innerHTML;
}

function solveWeChatImage(element: HTMLElement) {
  const images = element.getElementsByTagName('img');

  Array.from(images).forEach((image) => {
    const width = image.getAttribute('width');
    const height = image.getAttribute('height');

    if (width) {
      image.removeAttribute('width');
      image.style.width = /^\d+$/.test(width) ? `${width}px` : width;
    }

    if (height) {
      image.removeAttribute('height');
      image.style.height = /^\d+$/.test(height) ? `${height}px` : height;
    }
  });
}

function createEmptyNode(): HTMLElement {
  const node = document.createElement('p');
  node.style.fontSize = '0';
  node.style.lineHeight = '0';
  node.style.margin = '0';
  node.innerHTML = '&nbsp;';
  return node;
}

export async function copyHtmlToClipboardWithJuice(
  element: HTMLElement,
  themeCSS: string,
  primaryColor: string
): Promise<boolean> {
  const originalHtml = element.innerHTML;
  const originalText = element.textContent || '';

  try {
    // 1. 处理 CSS，移除作用域前缀供 juice 使用
    let cleanThemeCSS = themeCSS
      .replace(/#output\s*\{/g, 'body {')
      .replace(/#output\s+/g, '')
      .replace(/^#output\s*/gm, '');

    const styleBlock = `<style>${cleanThemeCSS}</style><style>${hljsCSS}</style>`;

    // 2. 将样式合并到 HTML 内部
    element.innerHTML = styleBlock + element.innerHTML;

    // 3. 使用 Juice 合并样式为内联样式
    let inlined = juice(element.innerHTML, {
      inlinePseudoElements: true,
      preserveImportant: true,
      resolveCSSVariables: false,
    });

    // 4. 处理嵌套列表 HTML 结构
    inlined = modifyHtmlStructure(inlined);

    element.innerHTML = inlined;

    // 5. 处理样式和颜色变量替换
    element.innerHTML = element.innerHTML
      .replace(/([^-])top:(.*?)em/g, '$1transform: translateY($2em)')
      .replace(/hsl\(var\(--foreground\)\)/g, '#3f3f3f')
      .replace(/var\(--blockquote-background\)/g, '#f7f7f7')
      .replace(/var\(--md-primary-color\)/g, primaryColor)
      .replace(/--md-primary-color:.+?;/g, '')
      .replace(/--md-font-family:.+?;/g, '')
      .replace(/--md-font-size:.+?;/g, '')
      .replace(
        /<span class="nodeLabel"([^>]*)><p[^>]*>(.*?)<\/p><\/span>/g,
        '<span class="nodeLabel"$1>$2</span>'
      )
      .replace(
        /<span class="edgeLabel"([^>]*)><p[^>]*>(.*?)<\/p><\/span>/g,
        '<span class="edgeLabel"$1>$2</span>'
      );

    // 6. 处理图片自适应大小
    solveWeChatImage(element);

    // 7. 添加空白节点，兼容 SVG 复制
    const beforeNode = createEmptyNode();
    const afterNode = createEmptyNode();
    element.insertBefore(beforeNode, element.firstChild);
    element.appendChild(afterNode);

    // 8. 兼容 Mermaid / SVG 图表
    const nodes = element.querySelectorAll('.nodeLabel');
    nodes.forEach((node) => {
      const parent = node.parentElement!;
      const xmlns = parent.getAttribute('xmlns')!;
      const style = parent.getAttribute('style')!;
      const section = document.createElement('section');
      section.setAttribute('xmlns', xmlns);
      section.setAttribute('style', style);
      section.innerHTML = parent.innerHTML;

      const grand = parent.parentElement!;
      grand.innerHTML = '';
      grand.appendChild(section);
    });

    // fix: mermaid 部分文本颜色被 stroke 覆盖
    element.innerHTML = element.innerHTML.replace(
      /<tspan([^>]*)>/g,
      '<tspan$1 style="fill: #333333 !important; color: #333333 !important; stroke: none !important;">'
    );

    // fix: infographic-diagram 兼容
    element.querySelectorAll('.infographic-diagram').forEach((diagram) => {
      diagram.querySelectorAll('text').forEach((textElem) => {
        const dominantBaseline = textElem.getAttribute('dominant-baseline');
        const variantMap = {
          'alphabetic': '',
          'central': '0.35em',
          'middle': '0.35em',
          'hanging': '-0.55em',
          'ideographic': '0.18em',
          'text-before-edge': '-0.85em',
          'text-after-edge': '0.15em',
        };
        if (dominantBaseline) {
          textElem.removeAttribute('dominant-baseline');
          const dy = variantMap[dominantBaseline as keyof typeof variantMap];
          if (dy) {
            textElem.setAttribute('dy', dy);
          }
        }
      });
    });

    const finalHtml = element.innerHTML;

    // 9. 写入剪贴板
    const success = await copyHtmlToClipboard(finalHtml, originalText);
    return success;
  } catch (err) {
    console.error('Juiced copy rich text failed:', err);
    return false;
  } finally {
    // 10. 恢复预览区的原始 innerHTML
    element.innerHTML = originalHtml;
  }
}
