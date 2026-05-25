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
