import { Marked, Renderer } from 'marked';
import hljs from 'highlight.js';
import DOMPurify from 'isomorphic-dompurify';

// 创建针对特定主题的自定义微信 Markdown 解析器（完全抄自 doocs/md）
export function compileMarkdownToWechat(markdown: string, _themeId: string): string {
  const footnotes: [number, string, string][] = [];
  let footnoteIndex = 0;
  const listOrderedStack: boolean[] = [];
  const listCounters: number[] = [];

  function addFootnote(title: string, link: string): number {
    const existing = footnotes.find(([, , l]) => l === link);
    if (existing) return existing[0];
    footnotes.push([++footnoteIndex, title, link]);
    return footnoteIndex;
  }

  function styledContent(styleLabel: string, content: string, tagName?: string, style?: string): string {
    const tag = tagName ?? styleLabel;
    const className = `${styleLabel.replace(/_/g, '-')}`;
    const headingAttr = /h\d/.test(tag) ? ' data-heading="true"' : '';
    const styleAttr = style ? ` style="${style}"` : '';
    return `<${tag} class="${className}"${headingAttr}${styleAttr}>${content}</${tag}>`;
  }

  const renderer = new Renderer();

  // Custom Marked Renderers
  renderer.heading = function(this: any, token: any) {
    const text = this.parser.parseInline(token.tokens);
    return styledContent(`h${token.depth}`, text);
  };

  renderer.paragraph = function(this: any, token: any) {
    const text = this.parser.parseInline(token.tokens);
    const isFigureImage = text.includes('<figure') && text.includes('<img');
    const isEmpty = text.trim() === '';
    if (isFigureImage || isEmpty) return text;
    return styledContent('p', text);
  };

  renderer.blockquote = function(this: any, token: any) {
    const text = this.parser.parse(token.tokens);
    return styledContent('blockquote', text);
  };

  // highlight.js helper
  function formatHighlightedCode(html: string, preserveNewlines = false): string {
    let formatted = html;
    formatted = formatted.replace(
      /(<span[^>]*>[^<]*<\/span>)(\s+)(<span[^>]*>[^<]*<\/span>)/g,
      (_, span1, spaces, span2) => span1 + span2.replace(/^(<span[^>]*>)/, `$1${spaces}`)
    );
    formatted = formatted.replace(
      /(\s+)(<span[^>]*>)/g,
      (_, spaces, span) => span.replace(/^(<span[^>]*>)/, `$1${spaces}`)
    );
    formatted = formatted.replace(/\t/g, '    ');
    if (preserveNewlines) {
      formatted = formatted
        .replace(/\r\n/g, '<br/>')
        .replace(/\n/g, '<br/>')
        .replace(/(>[^<]+)|(^[^<]+)/g, (str) => str.replace(/\s/g, '&nbsp;'));
    } else {
      formatted = formatted.replace(/(>[^<]+)|(^[^<]+)/g, (str) => str.replace(/\s/g, '&nbsp;'));
    }
    return formatted;
  }

  function highlightAndFormatCode(text: string, language: string, showLineNumber: boolean): string {
    let highlighted = '';
    const hasLang = hljs.getLanguage(language);
    const actualLang = hasLang ? language : 'plaintext';
    
    if (showLineNumber) {
      const rawLines = text.replace(/\r\n/g, '\n').split('\n');
      const highlightedLines = rawLines.map((lineRaw) => {
        const lineHtml = hljs.highlight(lineRaw, { language: actualLang }).value;
        const formatted = formatHighlightedCode(lineHtml, false);
        return formatted === '' ? '&nbsp;' : formatted;
      });

      const lineNumbersHtml = highlightedLines
        .map((_, idx) => `<section style="padding:0 10px 0 0;line-height:1.75">${idx + 1}</section>`)
        .join('');
      const codeInnerHtml = highlightedLines.join('<br/>');
      const codeLinesHtml = `<div style="white-space:pre;min-width:max-content;line-height:1.75">${codeInnerHtml}</div>`;
      const lineNumberColumnStyles = `text-align:right;padding:8px 0;border-right:1px solid rgba(0,0,0,0.04);user-select:none;background:var(--code-bg,transparent);`;

      highlighted = `
        <section style="display:flex;align-items:flex-start;overflow-x:hidden;overflow-y:auto;width:100%;max-width:100%;padding:0;box-sizing:border-box">
          <section class="line-numbers" style="${lineNumberColumnStyles}">${lineNumbersHtml}</section>
          <section class="code-scroll" style="flex:1 1 auto;overflow-x:auto;overflow-y:visible;padding:8px;min-width:0;box-sizing:border-box">${codeLinesHtml}</section>
        </section>
      `;
    } else {
      const rawHighlighted = hljs.highlight(text, { language: actualLang }).value;
      highlighted = formatHighlightedCode(rawHighlighted, true);
    }
    return highlighted;
  }

  const macCodeSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" width="45px" height="13px" viewBox="0 0 450 130">
      <ellipse cx="50" cy="65" rx="50" ry="52" stroke="rgb(220,60,54)" stroke-width="2" fill="rgb(237,108,96)" />
      <ellipse cx="225" cy="65" rx="50" ry="52" stroke="rgb(218,151,33)" stroke-width="2" fill="rgb(247,193,81)" />
      <ellipse cx="400" cy="65" rx="50" ry="52" stroke="rgb(27,161,37)" stroke-width="2" fill="rgb(100,200,86)" />
    </svg>
  `.trim();

  renderer.code = function(token: any) {
    const lang = token.lang ? token.lang.split(' ')[0] : 'plaintext';
    const highlighted = highlightAndFormatCode(token.text, lang, true);
    const span = `<span class="mac-sign" style="padding: 10px 14px 0; display: flex;">${macCodeSvg}</span>`;
    const code = `<code class="language-${lang}">${highlighted}</code>`;
    return `<pre class="hljs code__pre">${span}${code}</pre>`;
  };

  renderer.codespan = function(token: any) {
    const escapedText = token.text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/`/g, '&#96;');
    return styledContent('codespan', escapedText, 'code');
  };

  renderer.list = function(this: any, token: any) {
    listOrderedStack.push(token.ordered);
    listCounters.push(Number(token.start || 1));

    const html = token.items.map((item: any) => this.listitem(item)).join('');

    listOrderedStack.pop();
    listCounters.pop();

    return styledContent(token.ordered ? 'ol' : 'ul', html);
  };

  renderer.listitem = function(this: any, token: any) {
    const ordered = listOrderedStack[listOrderedStack.length - 1];
    const idx = listCounters[listCounters.length - 1];
    listCounters[listCounters.length - 1] = idx + 1;
    const prefix = ordered ? `${idx}. ` : '• ';

    let content: string;
    try {
      content = this.parser.parseInline(token.tokens);
    } catch {
      content = this.parser.parse(token.tokens).replace(/^<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/, '$1');
    }
    return styledContent('listitem', `${prefix}${content}`, 'li');
  };

  renderer.image = function(token: any) {
    let widthAttr = '';
    let heightAttr = '';
    let altText = token.text;

    const sizeMatch = token.text.match(/\|(\d+)(?:x(\d+))?$/);
    if (sizeMatch) {
      altText = token.text.replace(/\|(\d+)(?:x(\d+))?$/, '');
      widthAttr = sizeMatch[1] ? ` width="${sizeMatch[1]}"` : '';
      heightAttr = sizeMatch[2] ? ` height="${sizeMatch[2]}"` : '';
    }

    return `<figure><img src="${token.href}"${token.title ? ` title="${token.title}"` : ''}${widthAttr}${heightAttr} alt="${altText}"/></figure>`;
  };

  renderer.link = function(this: any, token: any) {
    const parsedText = this.parser.parseInline(token.tokens);
    const MP_WEIXIN_LINK_REGEX = /^https?:\/\/mp\.weixin\.qq\.com/;
    if (MP_WEIXIN_LINK_REGEX.test(token.href)) {
      return `<a href="${token.href}" title="${token.title || token.text}">${parsedText}</a>`;
    }
    if (token.href === token.text) {
      return parsedText;
    }
    const ref = addFootnote(token.title || token.text, token.href);
    return `<a href="${token.href}" title="${token.title || token.text}">${parsedText}<sup>[${ref}]</sup></a>`;
  };

  renderer.strong = function(this: any, token: any) {
    return styledContent('strong', this.parser.parseInline(token.tokens));
  };

  renderer.em = function(this: any, token: any) {
    return styledContent('em', this.parser.parseInline(token.tokens));
  };

  renderer.table = function(this: any, token: any) {
    const headerRow = token.header
      .map((cell: any) => {
        const text = this.parser.parseInline(cell.tokens);
        return styledContent('th', text, undefined, `text-align: ${cell.align || 'left'}`);
      })
      .join('');
    const body = token.rows
      .map((row: any) => {
        const rowContent = row.map((cell: any) => this.tablecell(cell)).join('');
        return styledContent('tr', rowContent);
      })
      .join('');
    return `
      <section style="max-width: 100%; overflow: auto; -webkit-overflow-scrolling: touch">
        <table class="preview-table">
          <thead>${headerRow}</thead>
          <tbody>${body}</tbody>
        </table>
      </section>
    `;
  };

  renderer.tablecell = function(token: any) {
    const text = this.parser.parseInline(token.tokens);
    return styledContent('td', text, undefined, `text-align: ${token.align || 'left'}`);
  };

  renderer.hr = function(token: any) {
    const raw = token.raw.trim();
    let variant = 'dash';
    if (raw.includes('*')) variant = 'star';
    else if (raw.includes('_')) variant = 'underscore';
    return `<hr class="hr hr-${variant}">`;
  };

  const markedInstance = new Marked({ renderer, breaks: true });
  let html = markedInstance.parse(markdown) as string;

  html = DOMPurify.sanitize(html, { ADD_TAGS: ['mp-common-profile'] });

  if (footnotes.length > 0) {
    const footnoteList = footnotes
      .map(([index, title, link]) =>
        link === title
          ? `<code style="font-size: 90%; opacity: 0.6;">[${index}]</code>: <i style="word-break: break-all">${title}</i><br/>`
          : `<code style="font-size: 90%; opacity: 0.6;">[${index}]</code> ${title}: <i style="word-break: break-all">${link}</i><br/>`
      )
      .join('\n');
    html += styledContent('h4', '引用链接');
    html += styledContent('footnotes', footnoteList, 'p');
  }

  html += `
    <style>
      .preview-wrapper pre::before {
        position: absolute;
        top: 0;
        right: 0;
        color: #ccc;
        text-align: center;
        font-size: 0.8em;
        padding: 5px 10px 0;
        line-height: 15px;
        height: 15px;
        font-weight: 600;
      }
      h2 strong {
        color: inherit !important;
      }
    </style>
  `;

  return styledContent('container mx-auto', html, 'section');
}

// 通用的简单 Markdown 转 HTML 解析器，用于普通卡片内部内容渲染
export function compileSimpleMarkdown(markdown: string): string {
  const markedInstance = new Marked();
  return markedInstance.parse(markdown) as string;
}

// 将 Markdown 按分页符 (---) 拆分成幻灯片数组
export function splitIntoSlides(markdown: string): string[] {
  if (!markdown) return [];
  const separatorRegex = /\r?\n[ \t]*(?:---|===|\*\*\*|___)[ \t]*\r?\n/g;
  return markdown
    .split(separatorRegex)
    .map(slide => slide.trim())
    .filter(slide => slide.length > 0);
}
