import { useState } from 'react';
import { xhsThemes } from '../themes/xhsThemes';
import { compileSimpleMarkdown } from '../utils/markdown';
import { exportAllCards } from '../utils/exporter';
import { Download, Smartphone, LayoutGrid, Award, RefreshCw } from 'lucide-react';

interface CardPreviewProps {
  slides: string[];
  themeId: string;
  onThemeChange: (id: string) => void;
  authorInfo: { name: string; avatar: string };
  onAuthorChange: (info: { name: string; avatar: string }) => void;
  activePlatform: 'xhs' | 'douyin';
  onPlatformChange: (platform: 'xhs' | 'douyin') => void;
}

export function CardPreview({
  slides,
  themeId,
  onThemeChange,
  authorInfo,
  onAuthorChange,
  activePlatform,
  onPlatformChange
}: CardPreviewProps) {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [editAuthor, setEditAuthor] = useState(false);

  const currentTheme = xhsThemes.find(t => t.id === themeId) || xhsThemes[0];
  const aspectClass = activePlatform === 'xhs' ? 'aspect-[3/4]' : 'aspect-[9/16]';
  const platformLabel = activePlatform === 'xhs' ? '小红书 (3:4)' : '抖音图文 (9:16)';

  const handleExport = async () => {
    if (slides.length === 0) return;
    setExporting(true);
    setProgress({ current: 0, total: slides.length });

    const success = await exportAllCards(slides.length, 'xhs-card-render', (current, total) => {
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
        {/* 平台切换 */}
        <div className="flex bg-gray-200 p-0.5 rounded-lg">
          <button
            onClick={() => onPlatformChange('xhs')}
            className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activePlatform === 'xhs' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>小红书</span>
          </button>
          <button
            onClick={() => onPlatformChange('douyin')}
            className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activePlatform === 'douyin' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>抖音</span>
          </button>
        </div>

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

      {/* 作者栏配置与卡片列表 */}
      <div className="flex-1 flex flex-col overflow-y-auto bg-gray-50/50 p-6">
        
        {/* 作者信息编辑区 */}
        <div className="max-w-md mx-auto w-full mb-6 bg-white p-4 rounded-xl border border-gray-200/60 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-gray-700 flex items-center gap-1">
              <Award className="w-4 h-4 text-indigo-500" />
              水印与IP配置
            </span>
            <button
              onClick={() => setEditAuthor(!editAuthor)}
              className="text-xxs text-indigo-600 font-semibold hover:underline"
            >
              {editAuthor ? '保存' : '修改配置'}
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <img src={authorInfo.avatar} className="w-10 h-10 rounded-full border border-gray-200" alt="Avatar" />
            <div>
              <div className="text-xs font-bold text-gray-800">{authorInfo.name}</div>
              <div className="text-xxs text-gray-400">页眉展示 IP 水印</div>
            </div>
          </div>

          {editAuthor && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="作者昵称"
                  value={authorInfo.name}
                  onChange={(e) => onAuthorChange({ ...authorInfo, name: e.target.value })}
                  className="flex-1 text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  placeholder="头像图片URL"
                  value={authorInfo.avatar}
                  onChange={(e) => onAuthorChange({ ...authorInfo, avatar: e.target.value })}
                  className="flex-1 text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <span className="text-[10px] text-gray-400">提示：头像推荐使用支持跨域的 HTTPS 图床 URL。</span>
            </div>
          )}
        </div>

        {/* 隐藏的真实分辨率渲染挂载区 (1200px x 1600px / 9:16) */}
        {/* 必须正常渲染并移出视口，否则 html2canvas 无法生成 */}
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          {slides.map((content, index) => {
            const width = 1200;
            const height = activePlatform === 'xhs' ? 1600 : 2133; // 3:4 vs 9:16
            return (
              <div
                key={index}
                id={`xhs-card-render-${index}`}
                style={{ width: `${width}px`, height: `${height}px` }}
                className={`bg-gradient-to-br ${currentTheme.bgGradient} ${currentTheme.textColor} p-16 flex flex-col justify-between overflow-hidden relative ${currentTheme.borderColor || ''}`}
              >
                {/* 页眉 */}
                <div className="flex items-center gap-4">
                  <img src={authorInfo.avatar} className="w-16 h-16 rounded-full border-2 border-white/50" />
                  <span className="font-extrabold text-2xl tracking-wide">{authorInfo.name}</span>
                </div>

                {/* 内容 */}
                <div className={`flex-1 flex flex-col justify-center my-12 text-4xl leading-relaxed card-content-render-body ${currentTheme.fontFamily}`}>
                  <SlideRenderer content={content} />
                </div>

                {/* 页脚 */}
                <div className="flex justify-between items-center text-gray-500/80 text-2xl border-t border-gray-400/20 pt-6">
                  <span className="font-semibold">#干货分享</span>
                  <span className="font-mono font-bold">{index + 1} / {slides.length}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 视口展示区：缩略图列表（自适应屏幕宽度） */}
        {slides.length === 0 ? (
          <div className="flex-1 flex flex-col justify-center items-center text-center p-8 bg-white border border-dashed border-gray-300 rounded-xl">
            <LayoutGrid className="w-12 h-12 text-gray-350 mb-3" />
            <p className="text-sm font-semibold text-gray-600">暂无卡片预览</p>
            <p className="text-xs text-gray-400 mt-1">在左侧输入内容，或者使用「---」增加分页线。</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 max-w-sm mx-auto w-full pb-8">
            {slides.map((content, index) => (
              <div key={index} className="flex flex-col gap-2">
                <div className="text-xxs font-bold text-gray-400 ml-1">SLIDE {index + 1} ({platformLabel})</div>
                
                {/* 3:4 / 9:16 卡片模拟缩略图 */}
                <div
                  className={`w-full ${aspectClass} rounded-2xl bg-gradient-to-br ${currentTheme.bgGradient} ${currentTheme.textColor} p-6 flex flex-col justify-between shadow-md border border-gray-100 relative ${currentTheme.borderColor || ''}`}
                >
                  {/* 页眉 */}
                  <div className="flex items-center gap-2">
                    <img src={authorInfo.avatar} className="w-6 h-6 rounded-full border border-white/50" />
                    <span className="font-bold text-[10px] tracking-wide">{authorInfo.name}</span>
                  </div>

                  {/* 缩略图正文内容自适应缩放 */}
                  <div className={`flex-1 flex flex-col justify-center my-3 text-[14px] leading-relaxed card-content-thumbnail-body ${currentTheme.fontFamily}`}>
                    <SlideRenderer content={content} isThumbnail />
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
function SlideRenderer({ content, isThumbnail = false }: { content: string; isThumbnail?: boolean }) {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  // 封面识别逻辑：如果首行是 # H1，且整页内容行数 <= 2 行，则为封面样式
  const isCover = lines[0]?.startsWith('# ') && lines.length <= 2;

  if (isCover) {
    const title = lines[0].replace(/^#\s+/, '');
    const subtitle = lines[1] || '';
    return (
      <div className="flex-1 flex flex-col justify-center items-center text-center p-2">
        <h1 className={`font-black leading-tight tracking-tight text-center ${isThumbnail ? 'text-lg mb-1' : 'text-5xl mb-4'} text-balance`}>
          {title}
        </h1>
        {subtitle && (
          <p className={`font-semibold opacity-85 ${isThumbnail ? 'text-xs' : 'text-2xl'}`}>
            {subtitle}
          </p>
        )}
      </div>
    );
  }

  // 正常内容卡片，解析 Markdown HTML
  const html = compileSimpleMarkdown(content);

  // 注入微调的渲染样式
  return (
    <div
      className={`flex-1 flex flex-col justify-center text-left select-none max-w-full overflow-hidden ${
        isThumbnail ? 'thumbnail-renderer gap-1' : 'render-renderer gap-4'
      }`}
      style={{
        // 缩略图下对字体大小和列表样式进行重置，防内容溢出
        fontSize: isThumbnail ? '9px' : 'inherit',
        lineHeight: isThumbnail ? '1.3' : 'inherit'
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .render-renderer h2 { font-size: 2.25rem; font-weight: 800; margin-bottom: 1rem; color: inherit; }
        .render-renderer h3 { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.8rem; color: inherit; }
        .render-renderer p { margin-bottom: 0.8rem; }
        .render-renderer ul { list-style-type: disc; padding-left: 2rem; margin: 0.8rem 0; }
        .render-renderer ol { list-style-type: decimal; padding-left: 2rem; margin: 0.8rem 0; }
        .render-renderer li { margin: 0.4rem 0; }
        .render-renderer blockquote { border-left: 6px solid currentColor; padding-left: 1rem; opacity: 0.8; font-style: italic; margin: 1rem 0; }
        .render-renderer strong { font-weight: bold; }
        
        .thumbnail-renderer h2 { font-size: 11px; font-weight: 800; margin-bottom: 0.2rem; }
        .thumbnail-renderer h3 { font-size: 10px; font-weight: 700; margin-bottom: 0.2rem; }
        .thumbnail-renderer p { margin-bottom: 0.2rem; }
        .thumbnail-renderer ul { list-style-type: disc; padding-left: 1rem; margin: 0.2rem 0; }
        .thumbnail-renderer ol { list-style-type: decimal; padding-left: 1rem; margin: 0.2rem 0; }
        .thumbnail-renderer li { margin: 0.1rem 0; }
        .thumbnail-renderer blockquote { border-left: 2px solid currentColor; padding-left: 0.4rem; font-style: italic; margin: 0.2rem 0; }
        .thumbnail-renderer strong { font-weight: bold; }
      `}} />
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
