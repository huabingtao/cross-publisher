export const SELECTOR_MAPPING: Record<string, string> = {
  // GFM Alert Related
  blockquote_note: 'markdown-alert-note',
  blockquote_tip: 'markdown-alert-tip',
  blockquote_info: 'markdown-alert-info',
  blockquote_important: 'markdown-alert-important',
  blockquote_warning: 'markdown-alert-warning',
  blockquote_caution: 'markdown-alert-caution',
  
  blockquote_title: 'alert-title',
  blockquote_title_note: 'alert-title-note',
  blockquote_title_tip: 'alert-title-tip',
  blockquote_title_info: 'alert-title-info',
  blockquote_title_important: 'alert-title-important',
  blockquote_title_warning: 'alert-title-warning',
  blockquote_title_caution: 'alert-title-caution',

  blockquote_p: 'alert-content',
  blockquote_p_note: 'alert-content-note',
  blockquote_p_tip: 'alert-content-tip',
  blockquote_p_info: 'alert-content-info',
  blockquote_p_important: 'alert-content-important',
  blockquote_p_warning: 'alert-content-warning',
  blockquote_p_caution: 'alert-content-caution',

  // Code Block and inline code
  code_pre: 'code-block',
  codespan: 'code-inline',
  listitem: 'listitem',
};

export function wrapCSSWithScope(css: string, scope: string = '#output'): string {
  return css.replace(
    /([^{}]+)\{([^}]*)\}/g,
    (match, selectors, properties) => {
      const trimmedSelectors = selectors.trim();
      if (trimmedSelectors.startsWith('@') || trimmedSelectors.startsWith(':root')) {
        return match;
      }

      const wrappedSelectors = selectors
        .split(',')
        .map((selector: string) => {
          let trimmed = selector.trim();

          if (trimmed.startsWith(scope)) {
            return trimmed;
          }

          if (!trimmed) {
            return trimmed;
          }

          const baseSelector = trimmed.split(/[\s>+~:[]/, 1)[0].trim();

          if (baseSelector && SELECTOR_MAPPING[baseSelector]) {
            trimmed = trimmed.replace(baseSelector, `.${SELECTOR_MAPPING[baseSelector]}`);
          }

          const headingMatch = trimmed.match(/^(h[1-6])(\s|$|::|[:[])/);
          if (headingMatch) {
            return `${scope} section ${trimmed}`;
          }

          return `${scope} ${trimmed}`;
        })
        .filter(Boolean)
        .join(',\n');

      return `${wrappedSelectors} {${properties}}`;
    }
  );
}

// CSS 运行时处理工具（移植自 doocs/md）
function extractCSSVariables(css: string): Map<string, string> {
  const vars = new Map<string, string>();
  const regex = /--([\w-]+)\s*:\s*([^;}\n]+)/g;
  for (const match of css.matchAll(regex)) {
    vars.set(`--${match[1]}`, match[2].trim());
  }
  return vars;
}

const UNITS = 'px|em|rem|vw|vh|vmin|vmax|%|pt|pc|cm|mm|in|ex|ch';
const NUM = '(-?[\\d.]+)';
const UNIT_VAL = `(-?[\\d.]+)(${UNITS})?`;

function round(n: number): number {
  return Math.round(n * 10000) / 10000;
}

function evaluateCalcInner(expr: string): string {
  // 乘法：Xunit * N 或 N * Xunit
  const mul = expr.match(new RegExp(`^${UNIT_VAL}\\s*\\*\\s*${UNIT_VAL}$`));
  if (mul) {
    const [, a, ua, b, ub] = mul;
    if (!ua !== !ub) {
      const unit = ua || ub;
      const result = round(parseFloat(a) * parseFloat(b));
      return `${result}${unit}`;
    }
  }

  // 除法：Xunit / N
  const div = expr.match(new RegExp(`^${UNIT_VAL}\\s*/\\s*${NUM}$`));
  if (div) {
    const [, a, unit, b] = div;
    const result = round(parseFloat(a) / parseFloat(b));
    return `${result}${unit ?? ''}`;
  }

  // 加减：同单位
  const addSub = expr.match(new RegExp(`^${UNIT_VAL}\\s*([+-])\\s*${UNIT_VAL}$`));
  if (addSub) {
    const [, a, ua, op, b, ub] = addSub;
    if (ua === ub) {
      const result = round(op === '+' ? parseFloat(a) + parseFloat(b) : parseFloat(a) - parseFloat(b));
      return `${result}${ua ?? ''}`;
    }
  }

  return `calc(${expr})`;
}

export function processCSS(css: string): string {
  // 1. 提取变量
  const vars = extractCSSVariables(css);

  // 2. 迭代替换 var() 引用
  const varRegex = /var\(\s*(--[\w-]+)\s*(?:,([^()]*(?:\([^()]*\)[^()]*)*))?\)/g;
  let result = css;
  let prev = '';
  let iterations = 0;
  while (result !== prev && iterations < 10) {
    prev = result;
    result = result.replace(varRegex, (_, varName: string, fallback?: string) => {
      const val = vars.get(varName);
      if (val !== undefined) return val;
      return fallback ? fallback.trim() : `var(${varName})`;
    });
    iterations++;
  }

  // 3. 化简 calc()
  const calcRegex = /calc\(([^()]+)\)/g;
  prev = '';
  iterations = 0;
  while (result !== prev && iterations < 10) {
    prev = result;
    result = result.replace(calcRegex, (_, inner: string) => evaluateCalcInner(inner.trim()));
    iterations++;
  }

  return result;
}

export class ThemeInjector {
  private styleElement: HTMLStyleElement | null = null;
  private readonly styleId = 'md-theme';

  inject(cssContent: string): void {
    if (!this.styleElement) {
      this.styleElement = document.getElementById(this.styleId) as HTMLStyleElement;
      if (!this.styleElement) {
        this.styleElement = document.createElement('style');
        this.styleElement.id = this.styleId;
        document.head.appendChild(this.styleElement);
      }
    }
    this.styleElement.textContent = cssContent;
  }

  remove(): void {
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }
  }
}

export const themeInjector = new ThemeInjector();
export default themeInjector;
