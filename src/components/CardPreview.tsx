import { useState } from 'react';
import { xhsThemes } from '../themes/xhsThemes';
import { compileSimpleMarkdown } from '../utils/markdown';
import { exportAllCards } from '../utils/exporter';
import { Download, RefreshCw } from 'lucide-react';
import { EmptyState } from './EmptyState';

interface CardPreviewProps {
  slides: string[];
  themeId: string;
  onThemeChange: (id: string) => void;
}

export function CardPreview({
  slides,
  themeId,
  onThemeChange
}: CardPreviewProps) {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const currentTheme = xhsThemes.find(t => t.id === themeId) || xhsThemes[0];
  const aspectClass = 'aspect-[3/4]';
  const platformLabel = '图文卡片 (3:4)';

  const handleExport = async () => {
    if (slides.length === 0) return;
    setExporting(true);
    setProgress({ current: 0, total: slides.length });

    const success = await exportAllCards(slides.length, 'xhs-card-preview', (current, total) => {
      setProgress({ current, total });
    });

    setExporting(false);
    if (!success) {
      alert('批量导出失败，请检查浏览器权限或重试。');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* 顶部控制栏 */}
      <div className="flex flex-wrap gap-3 items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">

        {/* 主题选择 */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">卡片风格:</span>
          <select
            value={themeId}
            onChange={(e) => onThemeChange(e.target.value)}
            className="text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            {xhsThemes.map(theme => (
              <option key={theme.id} value={theme.id}>
                {theme.name}
              </option>
            ))}
          </select>
        </div>

        {/* 导出按钮 */}
        <button
          onClick={handleExport}
          disabled={exporting || slides.length === 0}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 shadow-sm ${
            exporting
              ? 'bg-amber-500 text-white cursor-wait'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
        >
          {exporting ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>打包中 ({progress.current}/{progress.total})</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              <span>下载图片包 (ZIP)</span>
            </>
          )}
        </button>
      </div>

      {/* 卡片列表 */}
      <div className={`flex-1 flex flex-col overflow-y-auto bg-gray-50/50 p-6 ${slides.length === 0 ? 'justify-center' : ''}`}>

        {/* 视口展示区：缩略图列表（自适应屏幕宽度） */}
        {slides.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-6 max-w-sm mx-auto w-full pb-8">
            {slides.map((content, index) => (
              <div key={index} className="flex flex-col gap-2">
                <div className="text-xxs font-bold text-gray-400 ml-1">SLIDE {index + 1} ({platformLabel})</div>
                
                {/* 3:4 卡片模拟缩略图 */}
                <div
                  id={`xhs-card-preview-${index}`}
                  className={`w-full ${aspectClass} rounded-2xl bg-gradient-to-br ${currentTheme.bgGradient} ${currentTheme.textColor} p-6 flex flex-col justify-between shadow-md border border-gray-100 relative ${currentTheme.borderColor || ''}`}
                >

                  {/* 缩略图正文内容自适应缩放 */}
                  <div className={`flex-1 flex flex-col justify-center my-3 card-content-thumbnail-body ${currentTheme.fontFamily}`}>
                    <SlideRenderer content={content} themeId={themeId} />
                  </div>

                  {/* 页脚 */}
                  <div className="flex justify-between items-center text-gray-400/80 text-[10px] border-t border-gray-300/20 pt-2">
                    <span>#干货分享</span>
                    <span className="font-mono">{index + 1} / {slides.length}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

// 卡片内容渲染子组件
function SlideRenderer({ content, themeId }: { content: string; themeId: string }) {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const currentTheme = xhsThemes.find(t => t.id === themeId) || xhsThemes[0];
  // 封面识别逻辑：如果首行是 # H1，且整页内容行数 <= 2 行，则为封面样式
  const isCover = lines[0]?.startsWith('# ') && lines.length <= 2;

  if (isCover) {
    const title = lines[0].replace(/^#\s+/, '');
    const subtitle = lines[1] || '';
    return (
      <div className="flex-1 flex flex-col justify-center items-center text-center p-2">
        <h1 className="font-black leading-tight tracking-tight text-center text-balance text-2xl mb-2">
          {title}
        </h1>
        {subtitle && (
          <p className="font-semibold opacity-85 text-sm">
            {subtitle}
          </p>
        )}
      </div>
    );
  }

  // 正常内容卡片，解析 Markdown HTML
  const html = compileSimpleMarkdown(content);
  const blockquoteBg = currentTheme.id === 'tech-dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)';

  // 注入微调的渲染样式
  return (
    <div
      className="flex-1 flex flex-col justify-center text-left select-none max-w-full overflow-hidden thumbnail-renderer"
      style={{
        fontSize: '15px',
        lineHeight: '1.5',
        gap: '6px',
        ['--md-primary-color' as any]: currentTheme.primaryColor,
        ['--blockquote-background' as any]: blockquoteBg,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .thumbnail-renderer {
          --md-font-size: 15px;
        }

        /* 一级标题 - 复制自公众号 */
        .thumbnail-renderer h1 {
          display: table;
          padding: 0 1em;
          border-bottom: 0.13em solid var(--md-primary-color);
          margin: 1.5em auto 0.8em;
          font-size: calc(var(--md-font-size) * 1.25);
          font-weight: bold;
          text-align: center;
          color: inherit;
        }

        /* 二级标题 - 复制自公众号 */
        .thumbnail-renderer h2 {
          display: table;
          padding: 0 0.4em;
          margin: 1.5em auto 0.8em;
          color: #fff;
          background: var(--md-primary-color);
          font-size: calc(var(--md-font-size) * 1.2);
          font-weight: bold;
          text-align: center;
          border-radius: 0.25em;
        }

        .thumbnail-renderer h2 strong {
          color: inherit !important;
        }

        /* 三级标题 - 复制自公众号 */
        .thumbnail-renderer h3 {
          padding-left: 0.5em;
          border-left: 0.2em solid var(--md-primary-color);
          margin: 1.2em 0 0.6em;
          font-size: calc(var(--md-font-size) * 1.15);
          font-weight: bold;
          line-height: 1.2;
          text-align: left;
          color: inherit;
        }

        /* 四五六级标题 - 复制自公众号 */
        .thumbnail-renderer h4,
        .thumbnail-renderer h5,
        .thumbnail-renderer h6 {
          margin: 1.2em 0 0.6em;
          color: var(--md-primary-color);
          font-size: var(--md-font-size);
          font-weight: bold;
        }

        /* 段落 - 复制自公众号 */
        .thumbnail-renderer p {
          margin: 0.8em 0;
          letter-spacing: 0.05em;
          font-size: var(--md-font-size);
          line-height: 1.6;
          color: inherit;
        }

        /* 引用块 - 复制自公众号 */
        .thumbnail-renderer blockquote {
          font-style: normal;
          padding: 0.8em 1em;
          border-left: 0.25em solid var(--md-primary-color);
          border-radius: 0.38em;
          color: inherit;
          background: var(--blockquote-background);
          margin: 0.8em 0;
        }

        .thumbnail-renderer blockquote > p {
          display: block;
          font-size: var(--md-font-size);
          color: inherit;
          margin: 0;
        }

        /* 强调加粗 - 复制自公众号 */
        .thumbnail-renderer strong {
          color: var(--md-primary-color);
          font-weight: bold;
        }

        /* 列表 - 复制自公众号 */
        .thumbnail-renderer ul {
          list-style-type: circle;
          padding-left: 1.5em;
          margin: 0.8em 0;
        }
        .thumbnail-renderer ol {
          list-style-type: decimal;
          padding-left: 1.5em;
          margin: 0.8em 0;
        }
        .thumbnail-renderer li {
          margin: 0.3em 0;
          font-size: var(--md-font-size);
          color: inherit;
        }

        /* 行内代码 */
        .thumbnail-renderer code {
          font-size: 90%;
          color: #d14;
          background: rgba(27, 31, 35, 0.05);
          padding: 3px 5px;
          border-radius: 0.25em;
        }
      `}} />
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
