/**
 * Chrome 国际化工具
 * 直接使用 Chrome 的 i18n API 读取 _locales 中的翻译
 */

type MessageKey = string;

/**
 * 获取翻译文本
 * @param key 翻译键名
 * @param substitutions 替换参数
 * @returns 翻译文本
 */
export const t = (key: MessageKey, substitutions?: string | string[]): string => {
  try {
    // @ts-ignore Chrome API
    return chrome.i18n.getMessage(key, substitutions) || key;
  } catch {
    // 开发环境或非插件环境下的降级方案
    return key;
  }
};

/**
 * 获取当前语言
 * @returns 语言代码，如 'zh_CN', 'en'
 */
export const getCurrentLanguage = (): string => {
  try {
    // @ts-ignore Chrome API
    return chrome.i18n.getUILanguage?.() || 'en';
  } catch {
    return 'en';
  }
};

/**
 * 检查是否为中文
 */
export const isChineseLocale = (): boolean => {
  const lang = getCurrentLanguage();
  return lang.startsWith('zh');
};
