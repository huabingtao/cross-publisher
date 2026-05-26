import baseCSS from './base.css?raw';
import defaultCSS from './default.css?raw';

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
    name: '经典主题',
    css: defaultCSS,
    primaryColor: '#07c160'
  }
];

export function mapThemeId(_themeId: string): string {
  return 'default';
}
