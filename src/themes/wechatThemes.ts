import baseCSS from './base.css?raw';
import defaultCSS from './default.css?raw';
import graceCSS from './grace.css?raw';
import simpleCSS from './simple.css?raw';

export interface WechatTheme {
  id: string;
  name: string;
  css: string;
  primaryColor: string;
}

export const baseCSSContent = baseCSS;

export const wechatThemes: WechatTheme[] = [
  {
    id: 'default',
    name: '经典绿',
    css: defaultCSS,
    primaryColor: '#07c160'
  },
  {
    id: 'grace',
    name: '优雅褐',
    css: graceCSS,
    primaryColor: '#b45309'
  },
  {
    id: 'simple',
    name: '极客蓝',
    css: simpleCSS,
    primaryColor: '#2563eb'
  }
];

export function mapThemeId(themeId: string): string {
  if (themeId === 'macaron-green') return 'default';
  if (themeId === 'elegant-amber') return 'grace';
  if (themeId === 'cool-blue') return 'simple';
  return themeId;
}
