import { useState, useEffect } from 'react';
import { Editor } from './components/Editor';
import { WeChatPreview } from './components/WeChatPreview';
import { CardPreview } from './components/CardPreview';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useEnvironment } from './hooks/useEnvironment';
import { splitIntoSlides } from './utils/markdown';
import { BookOpen, Share2, PenTool, Eye, Image } from 'lucide-react';

import defaultMarkdownContent from './assets/example/markdown.md?raw';

function App() {
  const [content, setContent] = useLocalStorage<string>('publisher_content_v1', defaultMarkdownContent);
  const [wechatThemeId, setWechatThemeId] = useLocalStorage<string>('wechat_theme_id_v1', 'default');
  const [xhsThemeId, setXhsThemeId] = useLocalStorage<string>('xhs_theme_id_v1', 'gradient-pink');
  
  // 核心平台状态: 'wechat' | 'xhs'
  const [activePlatform, setActivePlatform] = useState<'wechat' | 'xhs'>('wechat');

  // 移动端/微信小程序 WebView 特有状态: 'edit' | 'preview' (在手机上分屏不便，采用底部 Tab 切换)
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');

  const { isPc, isWechatMini, isMobile } = useEnvironment();

  // 高性能、防闪烁的 DOM 级同步滚动 (仅在 PC 端的微信公众号 tab 激活时生效)
  useEffect(() => {
    if (!isPc || activePlatform !== 'wechat') return;

    // 延迟一小段时间以确保 React DOM 节点渲染就位
    const timer = setTimeout(() => {
      const textarea = document.querySelector('.markdown-editor-textarea') as HTMLTextAreaElement;
      const previewContainer = document.querySelector('.wechat-preview-scroll-container') as HTMLDivElement;

      if (!textarea || !previewContainer) return;

      const handleScroll = () => {
        const totalScrollHeight = textarea.scrollHeight - textarea.clientHeight;
        if (totalScrollHeight > 0) {
          const percentage = textarea.scrollTop / totalScrollHeight;
          const targetScrollHeight = previewContainer.scrollHeight - previewContainer.clientHeight;
          previewContainer.scrollTop = percentage * targetScrollHeight;
        }
      };

      textarea.addEventListener('scroll', handleScroll, { passive: true });
      
      // 初始做一次同步
      handleScroll();

      return () => {
        textarea.removeEventListener('scroll', handleScroll);
      };
    }, 100);

    return () => clearTimeout(timer);
  }, [activePlatform, isPc]);

  // 解析获取卡片幻灯片列表
  const slides = splitIntoSlides(content);


  return (
    <div className="h-screen bg-gray-50 flex flex-col font-sans select-none text-gray-800 overflow-hidden">
      
      {/* 头部导航导航栏 */}
      <header className="bg-white border-b border-gray-200/80 px-6 py-4 flex justify-between items-center shrink-0 shadow-xs z-10">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-md shadow-indigo-200">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-none">多平台发布中心</h1>
            <p className="text-[10px] text-gray-400 mt-1">V1.0.0 免安装极速排版发文工具</p>
          </div>
        </div>

        {/* 状态指示器 */}
        <div className="flex items-center gap-3">
          {isWechatMini && (
            <span className="bg-emerald-50 text-emerald-600 border border-emerald-250 px-2 py-0.5 rounded-full text-[10px] font-bold">
              微信小程序模式
            </span>
          )}
          {isMobile && !isWechatMini && (
            <span className="bg-blue-50 text-blue-600 border border-blue-250 px-2 py-0.5 rounded-full text-[10px] font-bold">
              手机网页模式
            </span>
          )}
          {isPc && (
            <span className="bg-indigo-50 text-indigo-600 border border-indigo-250 px-2 py-0.5 rounded-full text-[10px] font-bold">
              PC 桌面专业版
            </span>
          )}
        </div>
      </header>

      {/* PC 端双栏布局 */}
      {isPc ? (
        <main className="flex-1 flex overflow-hidden p-6 gap-6 max-w-7xl mx-auto w-full">
          {/* 左侧编辑器 */}
          <section className="flex-1 h-full min-w-[450px]">
            <Editor content={content} onChange={setContent} />
          </section>

          {/* 右侧预览区 */}
          <section className="flex-1 h-full flex flex-col min-w-[450px]">
            
            {/* 顶部分类页签 */}
            <div className="flex bg-gray-200/60 p-1 rounded-xl mb-4 self-start">
              <button
                onClick={() => setActivePlatform('wechat')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activePlatform === 'wechat' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>微信公众号</span>
              </button>
              <button
                onClick={() => setActivePlatform('xhs')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activePlatform === 'xhs' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Image className="w-4 h-4" />
                <span>图文</span>
              </button>
            </div>

            {/* 预览组件切换 */}
            <div className="flex-1 overflow-hidden">
              {activePlatform === 'wechat' ? (
                <WeChatPreview
                  content={content}
                  themeId={wechatThemeId}
                  onThemeChange={setWechatThemeId}
                />
              ) : (
                <CardPreview
                  slides={slides}
                  themeId={xhsThemeId}
                  onThemeChange={setXhsThemeId}
                />
              )}
            </div>
          </section>
        </main>
      ) : (
        /* 移动端/小程序 WebView 下的布局（单栏，底部Tab切换） */
        <main className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* 移动端预览模式下的平台页签切换 */}
          {mobileTab === 'preview' && (
            <div className="bg-white px-4 py-2 border-b border-gray-100 flex gap-2 shrink-0 overflow-x-auto">
              <button
                onClick={() => setActivePlatform('wechat')}
                className={`px-3 py-1 rounded-full text-xxs font-bold shrink-0 ${
                  activePlatform === 'wechat' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                公众号排版
              </button>
              <button
                onClick={() => setActivePlatform('xhs')}
                className={`px-3 py-1 rounded-full text-xxs font-bold shrink-0 ${
                  activePlatform === 'xhs' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                图文卡片
              </button>
            </div>
          )}

          {/* 核心工作展示区 */}
          <div className="flex-1 p-4 overflow-hidden">
            {mobileTab === 'edit' ? (
              <Editor content={content} onChange={setContent} />
            ) : activePlatform === 'wechat' ? (
              <WeChatPreview
                content={content}
                themeId={wechatThemeId}
                onThemeChange={setWechatThemeId}
              />
            ) : (
              <CardPreview
                slides={slides}
                themeId={xhsThemeId}
                onThemeChange={setXhsThemeId}
              />
            )}
          </div>

          {/* 移动端底部导航栏 */}
          <footer className="bg-white border-t border-gray-200 px-6 py-2 flex justify-around items-center shrink-0 shadow-lg shadow-gray-200">
            <button
              onClick={() => setMobileTab('edit')}
              className={`flex flex-col items-center gap-0.5 py-1 ${
                mobileTab === 'edit' ? 'text-indigo-600' : 'text-gray-400'
              }`}
            >
              <PenTool className="w-5 h-5" />
              <span className="text-[10px] font-bold">写作编辑</span>
            </button>
            <button
              onClick={() => setMobileTab('preview')}
              className={`flex flex-col items-center gap-0.5 py-1 ${
                mobileTab === 'preview' ? 'text-indigo-600' : 'text-gray-400'
              }`}
            >
              <Eye className="w-5 h-5" />
              <span className="text-[10px] font-bold">效果预览</span>
            </button>
          </footer>
        </main>
      )}
    </div>
  );
}

export default App;
