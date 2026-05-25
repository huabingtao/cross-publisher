export interface WechatTheme {
  id: string;
  name: string;
  global: string;
  h1: string;
  h2: string;
  h3: string;
  p: string;
  blockquote: string;
  code: string;
  pre: string;
  ul: string;
  ol: string;
  li: string;
  strong: string;
  link: string;
}

export const wechatThemes: WechatTheme[] = [
  {
    id: 'macaron-green',
    name: '清新马卡龙绿',
    global: 'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 16px; color: #2f2f2f; line-height: 1.6; letter-spacing: 0.05em;',
    h1: 'font-size: 1.4em; font-weight: bold; color: #07c160; border-bottom: 2px solid #07c160; padding-bottom: 6px; margin: 1.5em 0 0.8em 0;',
    h2: 'font-size: 1.25em; font-weight: bold; color: #07c160; border-left: 4px solid #07c160; padding-left: 8px; margin: 1.4em 0 0.8em 0;',
    h3: 'font-size: 1.1em; font-weight: bold; color: #16a34a; margin: 1.3em 0 0.8em 0;',
    p: 'font-size: 16px; margin: 1em 0; color: #3e3e3e; text-align: justify;',
    blockquote: 'border-left: 4px solid #bbf7d0; background-color: #f0fdf4; padding: 12px 16px; margin: 1.2em 0; color: #166534; border-radius: 4px;',
    code: 'font-family: Consolas, Monaco, monospace; font-size: 0.9em; background-color: #f3f4f6; color: #e11d48; padding: 2px 6px; border-radius: 4px;',
    pre: 'font-family: Consolas, Monaco, monospace; font-size: 14px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; overflow-x: auto; margin: 1.5em 0;',
    ul: 'list-style-type: disc; padding-left: 20px; margin: 1em 0;',
    ol: 'list-style-type: decimal; padding-left: 20px; margin: 1em 0;',
    li: 'margin: 0.5em 0; color: #3e3e3e;',
    strong: 'color: #07c160; font-weight: bold;',
    link: 'color: #07c160; text-decoration: underline;'
  },
  {
    id: 'elegant-amber',
    name: '雅致琥珀黄',
    global: 'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Georgia, serif; font-size: 16px; color: #333333; line-height: 1.65; letter-spacing: 0.03em;',
    h1: 'font-size: 1.45em; font-weight: bold; color: #b45309; text-align: center; border-bottom: 1px dashed #b45309; padding-bottom: 8px; margin: 1.5em 0 0.8em 0;',
    h2: 'font-size: 1.25em; font-weight: bold; color: #b45309; border-bottom: 2px solid #fef3c7; padding-bottom: 4px; display: inline-block; margin: 1.4em 0 0.8em 0;',
    h3: 'font-size: 1.1em; font-weight: bold; color: #d97706; margin: 1.3em 0 0.8em 0;',
    p: 'font-size: 16px; margin: 1em 0; color: #4b5563; text-align: justify;',
    blockquote: 'border-left: 4px solid #f59e0b; background-color: #fffbeb; padding: 12px 16px; margin: 1.2em 0; color: #78350f; border-radius: 2px;',
    code: 'font-family: Consolas, Monaco, monospace; font-size: 0.9em; background-color: #fffbeb; color: #b45309; padding: 2px 6px; border-radius: 2px;',
    pre: 'font-family: Consolas, Monaco, monospace; font-size: 14px; background-color: #fafaf9; border-left: 4px solid #d97706; padding: 16px; overflow-x: auto; margin: 1.5em 0;',
    ul: 'list-style-type: circle; padding-left: 20px; margin: 1em 0;',
    ol: 'list-style-type: decimal; padding-left: 20px; margin: 1em 0;',
    li: 'margin: 0.5em 0; color: #4b5563;',
    strong: 'color: #92400e; font-weight: bold;',
    link: 'color: #d97706; text-decoration: underline;'
  },
  {
    id: 'cool-blue',
    name: '极客科技蓝',
    global: 'font-family: system-ui, -apple-system, sans-serif; font-size: 16px; color: #1f2937; line-height: 1.6; letter-spacing: 0.02em;',
    h1: 'font-size: 1.4em; font-weight: 800; color: #1d4ed8; text-transform: uppercase; margin: 1.6em 0 0.8em 0;',
    h2: 'font-size: 1.25em; font-weight: 700; color: #2563eb; background: linear-gradient(to right, #dbeafe, transparent); padding: 6px 12px; border-radius: 4px; margin: 1.4em 0 0.8em 0;',
    h3: 'font-size: 1.1em; font-weight: bold; color: #3b82f6; margin: 1.3em 0 0.8em 0;',
    p: 'font-size: 16px; margin: 1em 0; color: #374151; text-align: justify;',
    blockquote: 'border-left: 4px solid #3b82f6; background-color: #eff6ff; padding: 12px 16px; margin: 1.2em 0; color: #1e40af; border-radius: 4px;',
    code: 'font-family: monospace; font-size: 0.95em; background-color: #f3f4f6; color: #2563eb; padding: 2px 4px; border-radius: 2px;',
    pre: 'font-family: monospace; font-size: 14px; background-color: #1e293b; color: #f8fafc; border-radius: 8px; padding: 16px; overflow-x: auto; margin: 1.5em 0;',
    ul: 'list-style-type: square; padding-left: 20px; margin: 1em 0;',
    ol: 'list-style-type: decimal; padding-left: 20px; margin: 1em 0;',
    li: 'margin: 0.5em 0; color: #374151;',
    strong: 'color: #1d4ed8; font-weight: bold;',
    link: 'color: #2563eb; text-decoration: underline;'
  }
];
