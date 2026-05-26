import { useState, useEffect, useRef } from 'react';
import { compileMarkdownToWechat } from '../utils/markdown';
import { copyHtmlToClipboardWithJuice } from '../utils/clipboard';
import { wechatThemes, mapThemeId, baseCSSContent } from '../themes/wechatThemes';
import { wrapCSSWithScope, themeInjector, processCSS } from '../utils/themeManager';
import { Clipboard, Check } from 'lucide-react';
import { EmptyState } from './EmptyState';

interface WeChatPreviewProps {
  content: string;
  themeId: string;
  onThemeChange: (id: string) => void;
}

export function WeChatPreview({ content, themeId, onThemeChange }: WeChatPreviewProps) {
  const [copied, setCopied] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  
  // 转换兼容性的主题ID
  const mappedThemeId = mapThemeId(themeId);

  // 编译获取微信预览的 HTML (包含基础类名)
  const compiledHtml = compileMarkdownToWechat(content, mappedThemeId);

  // 当主题发生变化时，动态注入该主题对应的作用域 CSS
  useEffect(() => {
    const theme = wechatThemes.find(t => t.id === mappedThemeId) || wechatThemes[0];
    const variablesCSS = `
.wechat-preview-container {
  --md-primary-color: ${theme.primaryColor};
  --md-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --md-font-size: 16px;
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --blockquote-background: #f7f7f7;
}
    `.trim();

    const fullCSS = baseCSSContent + '\n' + theme.css;
    const scopedCSS = variablesCSS + '\n\n' + wrapCSSWithScope(fullCSS, '.wechat-preview-container');
    themeInjector.inject(processCSS(scopedCSS));
  }, [mappedThemeId]);

  const isContentEmpty = !content || content.trim().length === 0;

  const handleCopy = async () => {
    if (!previewRef.current || isContentEmpty) return;

    const theme = wechatThemes.find(t => t.id === mappedThemeId) || wechatThemes[0];
    const fullCSS = baseCSSContent + '\n' + theme.css;

    // 执行 Juice 样式内联与净化复制
    const success = await copyHtmlToClipboardWithJuice(
      previewRef.current,
      fullCSS,
      theme.primaryColor
    );

    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      alert('复制失败，请尝试手动全选复制预览区内容。');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* 顶部控制栏 */}
      <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-b border-gray-200">
        {/* 主题选择 */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">排版主题:</span>
          <select
            value={mappedThemeId}
            onChange={(e) => onThemeChange(e.target.value)}
            className="text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            {wechatThemes.map(theme => (
              <option key={theme.id} value={theme.id}>
                {theme.name}
              </option>
            ))}
          </select>
        </div>

        {/* 复制按钮 */}
        <button
          onClick={handleCopy}
          disabled={copied || isContentEmpty}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 shadow-sm ${
            copied
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
              : isContentEmpty
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>已复制到剪贴板</span>
            </>
          ) : (
            <>
              <Clipboard className="w-3.5 h-3.5" />
              <span>一键复制到公众号</span>
            </>
          )}
        </button>
      </div>

      {/* 预览展示区 */}
      <div className={`wechat-preview-scroll-container flex-1 p-6 overflow-y-auto bg-gray-50/50 ${isContentEmpty ? 'flex flex-col justify-center' : ''}`}>
        {isContentEmpty ? (
          <EmptyState />
        ) : (
          <div 
            ref={previewRef}
            className="wechat-preview-container bg-white p-5 rounded-lg shadow-sm border border-gray-100 min-h-full max-w-[375px] w-full mx-auto select-text"
            style={{ wordBreak: 'break-all' }}
            dangerouslySetInnerHTML={{ __html: compiledHtml }}
          />
        )}
      </div>
    </div>
  );
}
