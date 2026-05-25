import { useState } from 'react';
import { Editor } from './components/Editor';
import { WeChatPreview } from './components/WeChatPreview';
import { CardPreview } from './components/CardPreview';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useEnvironment } from './hooks/useEnvironment';
import { splitIntoSlides } from './utils/markdown';
import { BookOpen, Share2, PenTool, Eye, Smartphone } from 'lucide-react';

const DEFAULT_CONTENT = `# 🚀 欢迎使用多平台发布中心！
这是一个专门为您定制的 **一站式多平台内容排版与卡片工具**。

在这里，您可以只写一篇 Markdown 稿件，然后自动适配并分发到：
1. **微信公众号** (极致简约排版，一键复制粘贴)
2. **小红书图文** (利用水平分割线自动转化为高清卡片幻灯片)
3. **抖音图文** (自动适配 9:16 满屏高清卡片)

---
# 📸 如何生成小红书/抖音卡片？
在段落之间加入三个减号「\`---\`」作为分页符，系统就会自动为你生成多张精美图片。

*   **实时预览**：在右侧小红书/抖音页签查看最终生成的卡片样式。
*   **风格控制**：在右侧控制栏一键切换“马卡龙粉紫”、“极简杂志”、“极客暗黑”等多种精美模板。
*   **一键打包**：点击右上角“下载图片包”，瞬间在前端生成所有高清 PNG 并压缩成 zip 下载。

---
# 📝 微信公众号排版指南
如果想发布到微信公众号，您需要：

1. 在右侧切换到 **“公众号”** 标签页。
2. 选取心仪的排版主题（如清新绿、雅致黄、科技蓝）。
3. 点击右上方 **“一键复制到公众号”**。
4. 打开公众号编辑后台，直接进行粘贴 (\`Ctrl + V\` 或 \`Cmd + V\`)。
5. 完美保留所有字体颜色、间距、引用框和加粗样式！
`;

const DEFAULT_AUTHOR = {
  name: '自媒体大咖',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
};

function App() {
  const [content, setContent] = useLocalStorage<string>('publisher_content_v1', DEFAULT_CONTENT);
  const [wechatThemeId, setWechatThemeId] = useLocalStorage<string>('wechat_theme_id_v1', 'macaron-green');
  const [xhsThemeId, setXhsThemeId] = useLocalStorage<string>('xhs_theme_id_v1', 'gradient-pink');
  const [authorInfo, setAuthorInfo] = useLocalStorage<{ name: string; avatar: string }>('author_info_v1', DEFAULT_AUTHOR);
  
  // 核心平台状态: 'wechat' | 'xhs' | 'douyin'
  const [activePlatform, setActivePlatform] = useState<'wechat' | 'xhs' | 'douyin'>('wechat');

  // 移动端/微信小程序 WebView 特有状态: 'edit' | 'preview' (在手机上分屏不便，采用底部 Tab 切换)
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');

  const { isPc, isWechatMini, isMobile } = useEnvironment();
  
  // 解析获取卡片幻灯片列表
  const slides = splitIntoSlides(content);

  // 统一平台切换逻辑
  const handlePlatformChange = (platform: 'xhs' | 'douyin') => {
    setActivePlatform(platform);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans select-none text-gray-800">
      
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
                <Share2 className="w-4 h-4" />
                <span>小红书图文</span>
              </button>
              <button
                onClick={() => setActivePlatform('douyin')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activePlatform === 'douyin' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>抖音图文</span>
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
                  authorInfo={authorInfo}
                  onAuthorChange={setAuthorInfo}
                  activePlatform={activePlatform === 'douyin' ? 'douyin' : 'xhs'}
                  onPlatformChange={handlePlatformChange}
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
                小红书卡片
              </button>
              <button
                onClick={() => setActivePlatform('douyin')}
                className={`px-3 py-1 rounded-full text-xxs font-bold shrink-0 ${
                  activePlatform === 'douyin' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                抖音卡片
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
                authorInfo={authorInfo}
                onAuthorChange={setAuthorInfo}
                activePlatform={activePlatform === 'douyin' ? 'douyin' : 'xhs'}
                onPlatformChange={handlePlatformChange}
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
