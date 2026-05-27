import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { CardPreview } from './CardPreview';
import { exportAllCards } from '../utils/exporter';

// 模拟 exporter 工具
vi.mock('../utils/exporter', () => ({
  exportAllCards: vi.fn(() => Promise.resolve(true)),
}));

describe('CardPreview Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render theme dropdown and download button', () => {
    render(<CardPreview slides={['Slide 1']} themeId="gradient-pink" onThemeChange={vi.fn()} />);

    expect(screen.getByText('卡片风格:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '下载图片包 (ZIP)' })).toBeInTheDocument();
  });

  it('should render EmptyState when slides is empty', () => {
    render(<CardPreview slides={[]} themeId="gradient-pink" onThemeChange={vi.fn()} />);

    expect(screen.getByText('排版引擎就绪，静候佳作')).toBeInTheDocument();
    const downloadButton = screen.getByRole('button', { name: '下载图片包 (ZIP)' });
    expect(downloadButton).toBeDisabled();
  });

  it('should call exportAllCards when download button is clicked', async () => {
    render(<CardPreview slides={['Slide 1', 'Slide 2']} themeId="gradient-pink" onThemeChange={vi.fn()} />);

    const downloadButton = screen.getByRole('button', { name: '下载图片包 (ZIP)' });
    expect(downloadButton).not.toBeDisabled();

    await act(async () => {
      fireEvent.click(downloadButton);
    });

    expect(exportAllCards).toHaveBeenCalledTimes(1);
    expect(exportAllCards).toHaveBeenCalledWith(2, 'xhs-card-preview', expect.any(Function));
  });

  it('should trigger onThemeChange when theme dropdown is changed', () => {
    const handleThemeChange = vi.fn();
    render(<CardPreview slides={['Slide 1']} themeId="gradient-pink" onThemeChange={handleThemeChange} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'tech-dark' } });

    expect(handleThemeChange).toHaveBeenCalledTimes(1);
    expect(handleThemeChange).toHaveBeenCalledWith('tech-dark');
  });
});
