import { useEffect, useState } from 'react';

export interface EnvState {
  isPc: boolean;
  isWechatMini: boolean;
  isMobile: boolean;
}

/**
 * 平台环境检测 Hook
 * 用于识别：PC浏览器、移动端手机浏览器、微信小程序内置 Webview
 */
export function useEnvironment(): EnvState {
  const [env, setEnv] = useState<EnvState>({
    isPc: true,
    isWechatMini: false,
    isMobile: false,
  });

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    
    // 1. 检测是否在微信客户端内
    const isWechat = ua.indexOf('micromessenger') !== -1;
    
    // 2. 检测是否在微信小程序 webview 运行环境
    const isMiniProgram = 
      ua.indexOf('miniprogram') !== -1 || 
      (window as any).__wxjs_environment === 'miniprogram';

    // 3. 检测是否为移动端手机浏览器
    const isMobile = /iphone|ipad|ipod|android/i.test(ua);

    setEnv({
      isPc: !isMobile,
      isWechatMini: isWechat && isMiniProgram,
      isMobile,
    });
  }, []);

  return env;
}
