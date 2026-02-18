import { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const SUPPORTED_LANGUAGES = ['en', 'es'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

export const isValidLanguage = (
  lang: string | undefined
): lang is SupportedLanguage => {
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
};

export const useLanguage = (enabled = true) => {
  const { lang } = useParams<{ lang?: string }>();
  const { i18n } = useTranslation();
  const location = useLocation();

  const currentLang = isValidLanguage(lang) ? lang : DEFAULT_LANGUAGE;

  useEffect(() => {
    if (!enabled) return; // si no está habilitado (standalone), no hace nada

    if (i18n.language !== currentLang) {
      i18n.changeLanguage(currentLang);
    }
  }, [currentLang, i18n, enabled]);

  const getLocalizedPath = (path: string, targetLang?: SupportedLanguage) => {
    const language = targetLang || currentLang;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    if (language === DEFAULT_LANGUAGE) return cleanPath;
    return `/${language}${cleanPath}`;
  };

  const getPathForLanguage = (targetLang: SupportedLanguage) => {
    let currentPath = location.pathname;
    for (const lng of SUPPORTED_LANGUAGES) {
      if (lng !== DEFAULT_LANGUAGE && currentPath.startsWith(`/${lng}`)) {
        currentPath = currentPath.slice(lng.length + 1) || '/';
        break;
      }
    }
    return getLocalizedPath(currentPath, targetLang);
  };

  return {
    currentLang,
    getLocalizedPath,
    getPathForLanguage,
    isDefaultLang: currentLang === DEFAULT_LANGUAGE,
  };
};
