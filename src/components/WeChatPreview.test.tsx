import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { WeChatPreview } from './WeChatPreview';
import { copyHtmlToClipboardWithJuice } from '../utils/clipboard';
import { wechatThemes } from '../themes/wechatThemes';

// 模拟 clipboard 工具
vi.mock('../utils/clipboard', () => ({
  copyHtmlToClipboardWithJuice: vi.fn(() => Promise.resolve(true)),
}));

describe('WeChatPreview Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render theme dropdown and copy button', () => {
    render(<WeChatPreview content="Some content" themeId="default" onThemeChange={vi.fn()} />);

    expect(screen.getByText('排版主题:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '一键复制到公众号' })).toBeInTheDocument();
  });

  it('should render EmptyState when content is empty', () => {
    render(<WeChatPreview content="" themeId="default" onThemeChange={vi.fn()} />);

    // should display the EmptyState text and illustration
    expect(screen.getByText('排版引擎就绪，静候佳作')).toBeInTheDocument();
    // the copy button should be disabled
    const copyButton = screen.getByRole('button', { name: '一键复制到公众号' });
    expect(copyButton).toBeDisabled();
    expect(copyButton).toHaveClass('cursor-not-allowed');
  });

  it('should call copyHtmlToClipboardWithJuice when copy button is clicked', async () => {
    render(<WeChatPreview content="## Title\nParagraph text" themeId="default" onThemeChange={vi.fn()} />);

    const copyButton = screen.getByRole('button', { name: '一键复制到公众号' });
    expect(copyButton).not.toBeDisabled();

    await act(async () => {
      fireEvent.click(copyButton);
    });

    // Assert that the mocked function copyHtmlToClipboardWithJuice was called
    expect(copyHtmlToClipboardWithJuice).toHaveBeenCalledTimes(1);
  });

  it('should trigger onThemeChange when another theme is selected', () => {
    // 临时推入一个测试主题，使 select 下拉菜单中能有该选项
    if (!wechatThemes.some(t => t.id === 'grace')) {
      wechatThemes.push({
        id: 'grace',
        name: '优雅黄',
        css: '',
        primaryColor: '#e2a100'
      });
    }

    const handleThemeChange = vi.fn();
    render(<WeChatPreview content="Content" themeId="default" onThemeChange={handleThemeChange} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'grace' } });

    expect(handleThemeChange).toHaveBeenCalledTimes(1);
    expect(handleThemeChange).toHaveBeenCalledWith('grace');
  });
});
