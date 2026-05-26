import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState Component', () => {
  it('should render the illustration image', () => {
    render(<EmptyState />);
    const image = screen.getByAltText('等待创作...');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/empty-state.png');
  });

  it('should render default title and description', () => {
    render(<EmptyState />);
    expect(screen.getByText('排版引擎就绪，静候佳作')).toBeInTheDocument();
    expect(screen.getByText(/在左侧编辑器中输入或粘贴您的 Markdown 内容/)).toBeInTheDocument();
  });

  it('should render custom title and description props', () => {
    render(<EmptyState title="Custom Title" description="Custom Description" />);
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom Description')).toBeInTheDocument();
  });
});
