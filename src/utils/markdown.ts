import { Marked, Renderer } from 'marked';
import { wechatThemes } from '../themes/wechatThemes';

// 创建针对特定主题的自定义微信 Markdown 解析器
export function compileMarkdownToWechat(markdown: string, themeId: string): string {
  const theme = wechatThemes.find(t => t.id === themeId) || wechatThemes[0];
  
  const renderer = new Renderer();

  // 重写标题渲染，注入内联 CSS
  renderer.heading = function({ text, depth }) {
    let style = '';
    if (depth === 1) {
      style = theme.h1;
    } else if (depth === 2) {
      style = theme.h2;
    } else {
      style = theme.h3;
    }
    return `<h${depth} style="${style}">${text}</h${depth}>`;
  };

  // 重写段落渲染
  renderer.paragraph = function({ text }) {
    return `<p style="${theme.p}">${text}</p>`;
  };

  // 重写引用渲染
  renderer.blockquote = function({ text }) {
    return `<blockquote style="${theme.blockquote}">${text}</blockquote>`;
  };

  // 重写代码块渲染
  renderer.code = function({ text }) {
    return `<pre style="${theme.pre}"><code class="wechat-code-block">${text}</code></pre>`;
  };

  // 重写行内代码渲染
  renderer.codespan = function({ text }) {
    return `<code style="${theme.code}">${text}</code>`;
  };

  // 重写加粗渲染
  renderer.strong = function({ text }) {
    return `<strong style="${theme.strong}">${text}</strong>`;
  };

  // 重写链接渲染
  renderer.link = function({ href, title, text }) {
    return `<a href="${href}" title="${title || ''}" style="${theme.link}">${text}</a>`;
  };

  // 重写列表项渲染
  renderer.list = function({ items, ordered }) {
    const listTag = ordered ? 'ol' : 'ul';
    const listStyle = ordered ? theme.ol : theme.ul;
    let listContent = '';
    items.forEach((item) => {
      // 这里的 item.text 可能包含内联标签，我们需要确保它的样式被 li 包装
      listContent += `<li style="${theme.li}">${item.text}</li>`;
    });
    return `<${listTag} style="${listStyle}">${listContent}</${listTag}>`;
  };

  const markedInstance = new Marked({ renderer });
  
  // 编译 Markdown，并包裹在全局主题样式的 div 容器中
  const rawHtml = markedInstance.parse(markdown) as string;
  return `<div style="${theme.global}">${rawHtml}</div>`;
}

// 通用的简单 Markdown 转 HTML 解析器，用于普通卡片内部内容渲染
export function compileSimpleMarkdown(markdown: string): string {
  const markedInstance = new Marked();
  return markedInstance.parse(markdown) as string;
}

// 将 Markdown 按分页符 (---) 拆分成幻灯片数组
export function splitIntoSlides(markdown: string): string[] {
  if (!markdown) return [];
  // 匹配水平分割线，支持 \r\n，前后可带空格
  const separatorRegex = /\r?\n\s*(?:---|===|\*\*\*|___)\s*\r?\n/g;
  return markdown
    .split(separatorRegex)
    .map(slide => slide.trim())
    .filter(slide => slide.length > 0);
}
