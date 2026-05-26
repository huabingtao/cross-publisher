import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

if (typeof window !== 'undefined') {
  // 模拟 clipboard API
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: vi.fn(() => Promise.resolve()),
      write: vi.fn(() => Promise.resolve()),
    },
    writable: true,
  });

  // 模拟 Canvas 2D getContext 行为，以适配我们 exporter.ts 中利用 Canvas 转换颜色的逻辑
  const mockGetContext = vi.fn().mockImplementation((contextId: string) => {
    if (contextId === '2d') {
      return {
        clearRect: vi.fn(),
        fillRect: vi.fn(),
        getImageData: vi.fn().mockReturnValue({
          data: new Uint8ClampedArray([0, 0, 0, 255]), // 默认返回 alpha 不为 0 的颜色像素
        }),
        fillStyle: 'transparent',
      };
    }
    return null;
  });
  
  HTMLCanvasElement.prototype.getContext = mockGetContext as any;
}
