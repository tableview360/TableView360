import { useCallback } from 'react';
import { localePath, defaultLang, type LangCode } from '../lib/i18n';

export type SupportedLanguage = LangCode;

/**
 * Detects the current language from the URL pathname.
 */
function detectLang(): LangCode {
  if (typeof window === 'undefined') return defaultLang;
  const first = window.location.pathname.split('/')[1];
  if (first === 'es') return 'es';
  if (first === 'en') return 'en';
  return defaultLang;
}

export function useLanguage() {
  const currentLang = detectLang();

  const getLocalizedPath = useCallback(
    (path: string) => localePath(path, currentLang),
    [currentLang],
  );

  const getPathForLanguage = useCallback(
    (lang: LangCode) => {
      const current =
        typeof window !== 'undefined' ? window.location.pathname : '/';
      return localePath(current, lang);
    },
    [],
  );

  return { currentLang, getLocalizedPath, getPathForLanguage };
}
