import { useState, useEffect } from 'react';

/**
 * 本地存储持久化 Hook (草稿箱功能支持)
 * @param key 存储的 key 名
 * @param initialValue 默认初始值
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn('读取 localStorage 失败：', key, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn('写入 localStorage 失败：', key, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
