import { useState, useEffect, useRef } from 'react';
import { compileMarkdownToWechat } from '../utils/markdown';
import { copyHtmlToClipboardWithJuice } from '../utils/clipboard';
import { wechatThemes, mapThemeId, baseCSSContent } from '../themes/wechatThemes';
import { wrapCSSWithScope, themeInjector } from '../utils/themeManager';
import { Clipboard, Check, Sparkles } from 'lucide-react';

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
    const fullCSS = baseCSSContent + '\n' + theme.css;
    const scopedCSS = wrapCSSWithScope(fullCSS, '.wechat-preview-container');
    themeInjector.inject(scopedCSS);
  }, [mappedThemeId]);

  const handleCopy = async () => {
    if (!previewRef.current) return;

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
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 shadow-sm ${
            copied
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
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

      {/* 提示条 */}
      <div className="flex items-center gap-1 px-4 py-2 bg-indigo-50 border-b border-indigo-100 text-xxs text-indigo-700 font-medium select-none">
        <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
        <span>复制成功后，直接在微信公众号后台编辑框内进行粘贴 (Ctrl+V) 即可完整保留格式！</span>
      </div>

      {/* 预览展示区 */}
      <div className="flex-1 p-6 overflow-y-auto bg-gray-50/50">
        <div 
          ref={previewRef}
          className="wechat-preview-container bg-white p-8 rounded-lg shadow-sm border border-gray-100 min-h-full max-w-[677px] mx-auto select-text"
          style={{ wordBreak: 'break-all' }}
          dangerouslySetInnerHTML={{ __html: compiledHtml }}
        />
      </div>
    </div>
  );
}
