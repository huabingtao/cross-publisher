import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { wrapCSSWithScope, processCSS, ThemeInjector } from './themeManager';

describe('themeManager utilities', () => {
  describe('wrapCSSWithScope', () => {
    it('should scope simple selector to target class scope', () => {
      const css = 'p { color: red; }';
      const result = wrapCSSWithScope(css, '.wechat-preview-container');
      expect(result).toContain('.wechat-preview-container p { color: red; }');
    });

    it('should map base selectors based on SELECTOR_MAPPING', () => {
      const css = 'listitem { padding: 4px; }';
      const result = wrapCSSWithScope(css, '.wechat-preview-container');
      expect(result).toContain('.wechat-preview-container .listitem { padding: 4px; }');
    });

    it('should scope heading selectors with standard nested section tags', () => {
      const css = 'h2 { font-size: 20px; }';
      const result = wrapCSSWithScope(css, '.wechat-preview-container');
      expect(result).toContain('.wechat-preview-container section h2 { font-size: 20px; }');
    });

    it('should leave @media or :root rules unchanged', () => {
      const css = '@media (max-width: 600px) { p { font-size: 14px; } }';
      const result = wrapCSSWithScope(css, '.wechat-preview-container');
      expect(result).toContain(css);
    });
  });

  describe('processCSS', () => {
    it('should resolve simple CSS variables', () => {
      const css = ':root { --my-color: #333; } p { color: var(--my-color); }';
      const result = processCSS(css);
      expect(result).toContain('p { color: #333; }');
    });

    it('should support fallback variables', () => {
      const css = 'p { color: var(--non-existent, blue); }';
      const result = processCSS(css);
      expect(result).toContain('p { color: blue; }');
    });

    it('should evaluate calc multipliers', () => {
      const css = 'p { width: calc(2rem * 3); }';
      const result = processCSS(css);
      expect(result).toContain('p { width: 6rem; }');
    });

    it('should evaluate calc dividers', () => {
      const css = 'p { width: calc(100px / 4); }';
      const result = processCSS(css);
      expect(result).toContain('p { width: 25px; }');
    });

    it('should evaluate calc additions/subtractions with matching units', () => {
      const css = 'p { width: calc(20px + 30px); }';
      const result = processCSS(css);
      expect(result).toContain('p { width: 50px; }');
    });
  });

  describe('ThemeInjector', () => {
    let injector: ThemeInjector;

    beforeEach(() => {
      injector = new ThemeInjector();
    });

    afterEach(() => {
      injector.remove();
    });

    it('should dynamically inject style tags in document.head', () => {
      const cssContent = '.test-class { font-weight: bold; }';
      injector.inject(cssContent);

      const styleEl = document.getElementById('md-theme') as HTMLStyleElement;
      expect(styleEl).not.toBeNull();
      expect(styleEl.textContent).toBe(cssContent);
    });

    it('should update content when calling inject multiple times', () => {
      injector.inject('.c1 { color: red; }');
      injector.inject('.c2 { color: blue; }');

      const styleEl = document.getElementById('md-theme') as HTMLStyleElement;
      expect(styleEl.textContent).toBe('.c2 { color: blue; }');
    });

    it('should remove style tag from DOM', () => {
      injector.inject('.class { margin: 10px; }');
      injector.remove();

      const styleEl = document.getElementById('md-theme');
      expect(styleEl).toBeNull();
    });
  });
});
