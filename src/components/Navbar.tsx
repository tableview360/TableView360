import { useState, useEffect, useRef } from 'react';
import { languages, t, localePath, type LangCode } from '../lib/i18n';

interface Props {
  user: boolean;
  role: string | null;
  lang: LangCode;
  username?: string | null;
  avatarUrl?: string | null;
}

export default function Navbar({
  user,
  role,
  lang,
  username,
  avatarUrl,
}: Props) {
  const [langOpen, setLangOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  }

  const initial = username?.[0]?.toUpperCase() || 'U';
  const currentLangObj = languages.find((l) => l.code === lang) || languages[0];

  // Only role-based nav links (no user section here — handled separately)
  const navLinks = (mobile: boolean) => {
    const cls = mobile
      ? 'text-slate-300 no-underline py-3 text-base font-medium border-b border-slate-700/30'
      : 'text-slate-400 no-underline text-[0.95rem] font-medium hover:text-slate-200 transition-colors';

    return (
      <>
        {user && role === 'admin' && (
          <a
            href={localePath('/cms', lang)}
            className={cls}
            onClick={() => setMenuOpen(false)}
          >
            {t('nav.cms', lang)}
          </a>
        )}
        {user && role === 'restaurant' && (
          <a
            href={localePath('/dashboard', lang)}
            className={cls}
            onClick={() => setMenuOpen(false)}
          >
            {t('nav.dashboard', lang)}
          </a>
        )}
        {user && (
          <a
            href={localePath('/restaurantes', lang)}
            className={cls}
            onClick={() => setMenuOpen(false)}
          >
            {t('nav.restaurants', lang)}
          </a>
        )}
        {!user && (
          <>
            <a
              href={localePath('/login', lang)}
              className={cls}
              onClick={() => setMenuOpen(false)}
            >
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
      </>
    );
  };

  return (
    <nav className="border-b border-slate-700/50 bg-slate-900/95 backdrop-blur-xl px-6 py-4 relative z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Logo */}
        <a
          href={localePath('/', lang)}
          className="flex items-center gap-2 no-underline"
        >
          <span
            className="text-3xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 bg-clip-text drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]"
            style={{ WebkitTextFillColor: 'transparent' }}
          >
            ◈
          </span>
          <span className="text-xl font-bold">
            <span className="text-white">TableView</span>
            <span
              className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-500 bg-clip-text"
              style={{ WebkitTextFillColor: 'transparent' }}
            >
              360
            </span>
          </span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks(false)}

          {/* Desktop user dropdown */}
          {user && (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 bg-transparent border-none cursor-pointer text-slate-300 hover:text-slate-50 transition-colors"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={username || 'U'}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-semibold">
                    {initial}
                  </div>
                )}
                <span className="text-[0.95rem] font-medium">
                  {username || t('nav.user_fallback', lang)}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-slate-800 border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden z-[1001]">
                  <div className="px-4 py-3 border-b border-slate-700/50">
                    <p className="text-sm font-semibold text-slate-100 truncate">
                      {username || 'Usuario'}
                    </p>
                  </div>
                  <a
                    href={localePath('/profile', lang)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-slate-50 transition-colors no-underline"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <span>👤</span> {t('nav.profile', lang)}
                  </a>
                  <a
                    href={localePath('/mis-reservas', lang)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-slate-50 transition-colors no-underline"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <span>📅</span> {t('nav.my_reservations', lang)}
                  </a>
                  <div className="border-t border-slate-700/50">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-400 hover:bg-slate-700 hover:text-red-300 transition-colors bg-transparent border-none cursor-pointer text-left"
                    >
                      <span>🚪</span> {t('nav.logout', lang)}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Language selector */}
          <div ref={langRef} className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700/40 bg-slate-800/60 px-3 py-1.5 text-sm text-slate-300 transition hover:border-slate-600"
            >
              <span>{currentLangObj.flag}</span>
              <span>{currentLangObj.code.toUpperCase()}</span>
              <svg
                className={`w-4 h-4 transition-transform ${langOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {langOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-xl border border-slate-700/50 bg-slate-800/90 backdrop-blur-xl shadow-2xl overflow-hidden z-50">
                {languages.map((l) => (
                  <a
                    key={l.code}
                    href={localePath(
                      typeof window !== 'undefined'
                        ? window.location.pathname
                        : '/',
                      l.code as LangCode
                    )}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition ${
                      lang === l.code
                        ? 'bg-violet-500/10 text-violet-400'
                        : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span className="text-lg">{l.flag}</span>
                    <span>{l.label}</span>
                    {lang === l.code && (
                      <svg
                        className="w-4 h-4 ml-auto text-violet-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
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
          <span
            className={`block w-6 h-0.5 bg-slate-300 transition-all ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`}
          />
          <span
            className={`block w-6 h-0.5 bg-slate-300 transition-all ${menuOpen ? 'opacity-0' : ''}`}
          />
          <span
            className={`block w-6 h-0.5 bg-slate-300 transition-all ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`}
          />
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden absolute left-0 right-0 top-full border-b border-slate-700/50 bg-slate-900/95 backdrop-blur-xl px-6 py-4 flex flex-col gap-1 z-50">
          {navLinks(true)}

          {/* Mobile user section */}
          {user && (
            <>
              <div className="flex items-center gap-3 py-3 border-b border-slate-700/30">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={username || 'U'}
                    className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    {initial}
                  </div>
                )}
                <span className="text-base font-medium text-slate-200 truncate">
                  {username || t('nav.user_fallback', lang)}
                </span>
              </div>
              <a
                href={localePath('/profile', lang)}
                className="text-slate-300 no-underline py-3 text-base font-medium border-b border-slate-700/30 hover:text-slate-50 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                👤 {t('nav.profile', lang)}
              </a>
              <a
                href={localePath('/mis-reservas', lang)}
                className="text-slate-300 no-underline py-3 text-base font-medium border-b border-slate-700/30 hover:text-slate-50 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                📅 {t('nav.my_reservations', lang)}
              </a>
              <button
                onClick={handleLogout}
                className="text-red-400 py-3 text-base font-medium text-left bg-transparent border-none cursor-pointer hover:text-red-300 transition-colors"
              >
                🚪 {t('nav.logout', lang)}
              </button>
            </>
          )}

          {/* Mobile language selector */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-700/30 mt-2">
            {languages.map((l) => (
              <a
                key={l.code}
                href={localePath(
                  typeof window !== 'undefined'
                    ? window.location.pathname
                    : '/',
                  l.code as LangCode
                )}
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
