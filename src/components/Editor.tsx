
interface EditorProps {
  content: string;
  onChange: (value: string) => void;
}

export function Editor({ content, onChange }: EditorProps) {
  // 计算字数和行数
  const wordCount = content.replace(/\s/g, '').length;
  const lineCount = content.split('\n').length;
  
  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* 状态栏头部 */}
      <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs text-gray-500 font-medium">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block animate-pulse"></span>
          <span>编辑器模式: Markdown</span>
        </div>
        <div className="flex gap-4">
          <span>字数: {wordCount}</span>
          <span>行数: {lineCount}</span>
        </div>
      </div>

      {/* 编辑区域 */}
      <textarea
        className="flex-1 w-full p-6 resize-none font-mono text-sm leading-relaxed text-gray-800 focus:outline-none focus:ring-0 placeholder-gray-400 bg-white"
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`在此处输入 Markdown 格式的文章...

支持的排版：
# 一级标题 (公众号主标题)
## 二级标题 (公众号分栏标题)
### 三级标题

**加粗文字**
* 列表项A
* 列表项B

> 这是引用内容

---
小红书与抖音卡片：
上面使用三个减号「---」代表新的一页，系统会自动生成新的图片卡片。
`}
      />

      {/* 页脚说明 */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xxs text-gray-400 select-none">
        提示：输入 <code>---</code> 可以插入卡片分页线。
      </div>
    </div>
  );
}
