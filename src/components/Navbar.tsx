import { useState, useEffect, useRef } from 'react';
import { languages, t, localePath, type LangCode } from '../lib/i18n';

interface Props {
  user: boolean;
  role: string | null;
  lang: LangCode;
}

export default function Navbar({ user, role, lang }: Props) {
  const [langOpen, setLangOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  }

  const currentLangObj = languages.find((l) => l.code === lang) || languages[0];

  const navLinks = (mobile: boolean) => {
    const cls = mobile
      ? 'text-slate-300 no-underline py-3 text-base font-medium border-b border-slate-700/30'
      : 'text-slate-400 no-underline text-[0.95rem] font-medium hover:text-slate-200 transition-colors';

    return (
      <>
        {user && role === 'admin' && (
          <a href={localePath('/cms', lang)} className={cls} onClick={() => setMenuOpen(false)}>
            {t('nav.cms', lang)}
          </a>
        )}
        {user && role === 'restaurant' && (
          <a href={localePath('/dashboard', lang)} className={cls} onClick={() => setMenuOpen(false)}>
            {t('nav.dashboard', lang)}
          </a>
        )}
        {user && (
          <a href={localePath('/restaurantes', lang)} className={cls} onClick={() => setMenuOpen(false)}>
            {t('nav.restaurants', lang)}
          </a>
        )}
        {!user && (
          <>
            <a href={localePath('/login', lang)} className={cls} onClick={() => setMenuOpen(false)}>
              {t('nav.signin', lang)}
            </a>
            <a
              href={localePath('/registro', lang)}
              className={
                mobile
                  ? 'text-slate-300 no-underline py-3 text-base font-medium border border-slate-600 rounded-lg text-center hover:text-slate-50 transition-colors'
                  : 'text-slate-300 no-underline text-[0.95rem] font-medium border border-slate-600 rounded-lg px-4 py-1.5 hover:text-slate-50 hover:border-violet-400/60 transition-colors'
              }
              onClick={() => setMenuOpen(false)}
            >
              {t('nav.signup', lang)}
            </a>
          </>
        )}
        {user && (
          <button
            onClick={handleLogout}
            className={
              mobile
                ? 'text-slate-400 py-3 text-base font-medium text-left'
                : 'rounded-lg bg-slate-800 px-4 py-1.5 text-[0.95rem] font-medium text-slate-300 transition hover:bg-slate-700'
            }
          >
            {t('nav.logout', lang)}
          </button>
        )}
      </>
    );
  };

  return (
    <nav className="border-b border-slate-700/50 bg-slate-900/95 backdrop-blur-xl px-6 py-4 relative z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Logo */}
        <a href={localePath('/', lang)} className="flex items-center gap-2 no-underline">
          <span className="text-3xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 bg-clip-text drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" style={{ WebkitTextFillColor: 'transparent' }}>◈</span>
          <span className="text-xl font-bold">
            <span className="text-white">TableView</span>
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-500 bg-clip-text" style={{ WebkitTextFillColor: 'transparent' }}>360</span>
          </span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks(false)}

          {/* Language selector */}
          <div ref={langRef} className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700/40 bg-slate-800/60 px-3 py-1.5 text-sm text-slate-300 transition hover:border-slate-600"
            >
              <span>{currentLangObj.flag}</span>
              <span>{currentLangObj.code.toUpperCase()}</span>
              <svg className={`w-4 h-4 transition-transform ${langOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {langOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-xl border border-slate-700/50 bg-slate-800/90 backdrop-blur-xl shadow-2xl overflow-hidden z-50">
                {languages.map((l) => (
                  <a
                    key={l.code}
                    href={localePath(typeof window !== 'undefined' ? window.location.pathname : '/', l.code as LangCode)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition ${
                      lang === l.code
                        ? 'bg-violet-500/10 text-violet-400'
                        : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span className="text-lg">{l.flag}</span>
                    <span>{l.label}</span>
                    {lang === l.code && (
                      <svg className="w-4 h-4 ml-auto text-violet-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-[5px] p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span className={`block w-6 h-0.5 bg-slate-300 transition-all ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
          <span className={`block w-6 h-0.5 bg-slate-300 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-slate-300 transition-all ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden absolute left-0 right-0 top-full border-b border-slate-700/50 bg-slate-900/95 backdrop-blur-xl px-6 py-4 flex flex-col gap-1 z-50">
          {navLinks(true)}

          {/* Mobile language selector */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-700/30 mt-2">
            {languages.map((l) => (
              <a
                key={l.code}
                href={localePath(typeof window !== 'undefined' ? window.location.pathname : '/', l.code as LangCode)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm no-underline transition ${
                  lang === l.code
                    ? 'bg-violet-500/10 text-violet-400 border border-violet-500/30'
                    : 'text-slate-400 border border-slate-700/40 hover:bg-slate-800'
                }`}
              >
                <span>{l.flag}</span>
                <span>{l.label}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
