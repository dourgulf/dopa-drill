// Locale selection and message lookup. Catalogues are keyed by stable message IDs.
import { localizeProblemZhCN } from './locales/problems-zh-CN.js';
export const DEFAULT_LOCALE = 'ja';
export const SUPPORTED_LOCALES = ['ja', 'zh-CN'];

export function resolveLocale(value) {
  if (typeof value !== 'string') return DEFAULT_LOCALE;
  const tag = value.toLowerCase();
  if (tag === 'ja' || tag.startsWith('ja-')) return 'ja';
  if (tag === 'zh' || /^(zh-cn|zh-sg|zh-hans)(-|$)/.test(tag)) return 'zh-CN';
  return DEFAULT_LOCALE;
}

// Localize only a display copy: review and mastery data keep their canonical
// source text, so changing languages never changes a saved problem's identity.
export function localizeProblem(problem, locale) {
  return resolveLocale(locale) === 'zh-CN' ? localizeProblemZhCN(problem) : problem;
}

export function createI18n(catalogues, initialLocale = DEFAULT_LOCALE) {
  let locale = resolveLocale(initialLocale);
  return {
    get locale() { return locale; },
    setLocale(value) { locale = resolveLocale(value); return locale; },
    t(key, variables = {}) {
      const message = catalogues[locale]?.[key] ?? catalogues[DEFAULT_LOCALE]?.[key];
      if (typeof message !== 'string') return key;
      return message.replace(/\{([\w]+)\}/g, (match, name) => Object.hasOwn(variables, name) ? String(variables[name]) : match);
    },
  };
}
