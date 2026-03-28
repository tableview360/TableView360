'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // ✅ CAMBIO
import { useLanguage, type SupportedLanguage } from '../../hooks/useLanguage';
import { GlobeIcon, DropdownArrow, CheckIcon } from '../icons';
import { t, type LangCode } from '../../lib/i18n';

interface LanguageSelectorProps {
  lang: LangCode; // ✅ recibimos el idioma
}


const LanguageSelector = ( {lang}: LanguageSelectorProps) => {

  const languages: { code: SupportedLanguage; label: string; flag: string }[] = [
    { code: 'en', label: t('English', lang), flag: '🇬🇧' },
    { code: 'es', label: t('Español', lang), flag: '🇪🇸' },
  ];
  const { currentLang, getPathForLanguage } = useLanguage();
  const router = useRouter(); // ✅ CAMBIO

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentLangData =
    languages.find((l) => l.code === currentLang) || languages[0];

  const changeLanguage = (lng: SupportedLanguage) => {
    const newPath = getPathForLanguage(lng);

    router.push(newPath); // ✅ CAMBIO
    router.refresh(); // 🔥 importante para SSR

    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:text-slate-50 hover:border-slate-600 transition-all"
      >
        <GlobeIcon />
        <span className="text-sm font-medium">
          {currentLangData.code.toUpperCase()}
        </span>
        <DropdownArrow isOpen={isOpen} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-slate-800 border border-slate-700 shadow-xl z-[1001]">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`cursor-pointer flex items-center gap-3 w-full px-4 py-3 text-left ${
                currentLang === lang.code
                  ? 'bg-indigo-500/20 text-indigo-300'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-slate-50'
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="text-sm font-medium">{lang.label}</span>
              {currentLang === lang.code && <CheckIcon />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;