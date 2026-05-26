import { describe, it, expect } from 'vitest';
import { splitIntoSlides, compileSimpleMarkdown, compileMarkdownToWechat } from './markdown';

describe('markdown utilities', () => {
  describe('splitIntoSlides', () => {
    it('should split markdown content by separator ---', () => {
      const content = 'Slide 1\n---\nSlide 2\n---\nSlide 3';
      const result = splitIntoSlides(content);
      expect(result).toEqual(['Slide 1', 'Slide 2', 'Slide 3']);
    });

    it('should split markdown content by separator === or *** or ___', () => {
      const content = 'Slide 1\n===\nSlide 2\n***\nSlide 3\n___\nSlide 4';
      const result = splitIntoSlides(content);
      expect(result).toEqual(['Slide 1', 'Slide 2', 'Slide 3', 'Slide 4']);
    });

    it('should return empty array for empty input', () => {
      expect(splitIntoSlides('')).toEqual([]);
      expect(splitIntoSlides('   \n   ')).toEqual([]);
    });

    it('should filter out empty slides', () => {
      const content = '\n---\nSlide 1\n---\n\n---\nSlide 2';
      const result = splitIntoSlides(content);
      expect(result).toEqual(['Slide 1', 'Slide 2']);
    });
  });

  describe('compileSimpleMarkdown', () => {
    it('should compile basic markdown syntax to HTML', () => {
      const md = '# Header\nThis is **bold** text.';
      const html = compileSimpleMarkdown(md);
      expect(html).toContain('<h1>Header</h1>');
      expect(html).toContain('<strong>bold</strong>');
    });
  });

  describe('compileMarkdownToWechat', () => {
    it('should compile markdown with WeChat classes', () => {
      const md = '# Header 1\nParagraph text.';
      const html = compileMarkdownToWechat(md, 'default');
      expect(html).toContain('class="h1"');
      expect(html).toContain('class="p"');
    });

    it('should process ordered and unordered lists with classes', () => {
      const md = '- Item 1\n- Item 2';
      const html = compileMarkdownToWechat(md, 'default');
      expect(html).toContain('class="ul"');
      expect(html).toContain('class="listitem"');
    });

    it('should extract external links and append citations', () => {
      const md = '[Google](https://google.com)';
      const html = compileMarkdownToWechat(md, 'default');
      // Should create footnote marker and citations block
      expect(html).toContain('<sup>[1]</sup>');
      expect(html).toContain('class="footnotes"');
      expect(html).toContain('https://google.com');
    });
  });
});
