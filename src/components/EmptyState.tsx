import { PenTool } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({
  title = '排版引擎就绪，静候佳作',
  description = '在左侧编辑器中输入或粘贴您的 Markdown 内容，右侧将实时呈现高颜值的排版效果。支持一键复制到公众号，或批量导出小红书/抖音图文卡片。'
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 min-h-[400px] h-full max-w-md mx-auto animate-fade-in">
      <div className="relative group mb-6">
        {/* 背景渐变发光，带来高级感 */}
        <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 opacity-20 blur-xl group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
        {/* 3D 风格插图 */}
        <img
          src="/empty-state.png"
          alt="等待创作..."
          className="relative w-52 h-52 object-contain rounded-3xl transform transition-all duration-500 hover:scale-105 select-none"
        />
      </div>

      <h3 className="text-base font-bold text-gray-800 tracking-wide mb-2.5 flex items-center gap-2 justify-center">
        <PenTool className="w-4 h-4 text-indigo-500" />
        {title}
      </h3>

      <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
        {description}
      </p>
    </div>
  );
}
