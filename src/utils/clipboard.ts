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
