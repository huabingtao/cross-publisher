import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Editor } from './Editor';

describe('Editor Component', () => {
  it('should render correct initial content, word count, and line count', () => {
    const content = 'Hello\nWorld'; // 10 chars (excluding spaces/newlines is 10, wait: 'HelloWorld' is 10 chars), 2 lines
    render(<Editor content={content} onChange={vi.fn()} />);

    const textarea = screen.getByPlaceholderText(/在此处输入 Markdown 格式的文章/) as HTMLTextAreaElement;
    expect(textarea.value).toBe(content);
    expect(screen.getByText('字数: 10')).toBeInTheDocument();
    expect(screen.getByText('行数: 2')).toBeInTheDocument();
  });

  it('should trigger onChange callback when text is entered', () => {
    const handleChange = vi.fn();
    render(<Editor content="" onChange={handleChange} />);

    const textarea = screen.getByPlaceholderText(/在此处输入 Markdown 格式的文章/);
    fireEvent.change(textarea, { target: { value: 'New text content' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('New text content');
  });
});
