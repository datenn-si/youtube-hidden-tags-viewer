export const locales = {
  en: {
    tags: 'Tags',
    copyAll: 'Copy all',
    copied: 'Copied ✓',
    copyFailed: 'Copy failed',
  },
  ja: {
    tags: 'タグ',
    copyAll: 'すべてコピー',
    copied: 'コピーしました ✓',
    copyFailed: 'コピー失敗',
  },
} as const;

export type Locale = keyof typeof locales;

type Messages = (typeof locales)[Locale];

const FALLBACK: Locale = 'en';

function detectLocale(): Locale {
  const lang = (document.documentElement.lang || navigator.language || FALLBACK).toLowerCase();
  if (lang in locales) return lang as Locale;
  const primary = lang.split('-')[0];
  if (primary in locales) return primary as Locale;
  return FALLBACK;
}

export const t: Messages = locales[detectLocale()];
