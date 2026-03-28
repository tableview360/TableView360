'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import DropdownArrow from '../../components/icons/DropdownArrow';
import { useRouter } from 'next/navigation';
import { localePath, t, type LangCode } from '../../lib/i18n';

interface Profile {
  username: string | null;
  full_name: string | null;
}

interface UserMenuProps {
  lang: LangCode;
  user: User | null; // ahora puede ser null
  profile: Profile | null;
  userRole?: string | null;
  handleSignOut: () => void;
  isMobile?: boolean;
  closeMenu?: () => void;
}

export default function UserMenu({
  lang,
  user,
  profile,
  userRole,
  handleSignOut,
  isMobile,
  closeMenu,
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const goTo = (path: string) => {
    router.push(path);
    closeMenu?.();
  };
  const loginPath = localePath('/login', lang);
  const registerPath = localePath('/register', lang);
  const dashboardPath = localePath('/dashboard', lang);

  const loginTabDesktopClass =
    'text-slate-300 no-underline text-[0.95rem] font-medium transition-colors duration-200 hover:text-slate-50';
  const registerTabDesktopClass =
    'text-slate-300 text-[0.95rem] font-medium hover:text-slate-50 border border-slate-600 px-4 py-2 rounded-lg';

  const loginTabMobileClass =
    'text-slate-300 no-underline py-3 text-base font-medium border-b border-slate-400/10 hover:text-slate-50 transition-colors';
  const registerTabMobileClass =
    'text-slate-300 py-3 text-base font-medium border border-slate-600 rounded-lg text-center hover:text-slate-50 transition-colors';

  if (!user) {
    if (isMobile) {
      return (
        <>
          <Link
            href={loginPath}
            className={loginTabMobileClass}
            onClick={closeMenu}
          >
            {t('nav.signin', lang)}
          </Link>
          <Link
            href={registerPath}
            className={registerTabMobileClass}
            onClick={closeMenu}
          >
            {t('nav.signup', lang)}
          </Link>
        </>
      );
    }

    return (
      <div className="flex items-center gap-4">
        <Link href={loginPath} className={loginTabDesktopClass}>
          {t('nav.signin', lang)}
        </Link>
        <Link href={registerPath} className={registerTabDesktopClass}>
          {t('nav.signup', lang)}
        </Link>
      </div>
    );
  }

  if (isMobile) {
    return (
      <>
        <div className="py-3 border-b border-slate-400/10">
          <p className="text-sm text-slate-400">Signed in as</p>
          <p className="text-base font-medium text-slate-200">
            {profile?.username || profile?.full_name || user?.email}
          </p>
        </div>

        <button
          onClick={() => goTo('/settings')}
          className="text-slate-300 py-3 text-base font-medium border-b border-slate-400/10 hover:text-slate-50 text-left"
        >
          Settings
        </button>
        {(userRole === 'restaurant' || userRole === 'admin') && (
          <button
            onClick={() => goTo(dashboardPath)}
            className="text-slate-300 py-3 text-base font-medium border-b border-slate-400/10 hover:text-slate-50 text-left"
          >
            {userRole === 'admin' ? 'Admin Panel' : 'Dashboard'}
          </button>
        )}

        <button
          onClick={() => {
            closeMenu?.();
            handleSignOut();
          }}
          className="text-red-400 py-3 text-base font-medium border-b border-slate-400/10 hover:text-red-300 text-left"
        >
          Sign out
        </button>
      </>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer flex items-center gap-2 text-slate-300 hover:text-slate-50"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-semibold">
          {profile?.username?.[0]?.toUpperCase() ||
            profile?.full_name?.[0]?.toUpperCase() ||
            'U'}
        </div>

        <span className="text-sm font-medium">
          {profile?.username || profile?.full_name || 'User'}
        </span>

        <DropdownArrow isOpen={isOpen} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-[1001]">
          <div className="px-4 py-3 border-b border-slate-700">
            <p className="text-sm text-slate-400">Signed in as</p>
            <p className="text-sm font-medium text-slate-200 truncate">
              {user?.email}
            </p>
          </div>

          <button
            onClick={() => goTo('/settings')}
            className="cursor-pointer w-full text-left px-4 py-3 text-slate-300 hover:bg-slate-700"
          >
            Settings
          </button>
          {(userRole === 'restaurant' || userRole === 'admin') && (
            <button
              onClick={() => goTo(dashboardPath)}
              className="cursor-pointer w-full text-left px-4 py-3 text-slate-300 hover:bg-slate-700"
            >
              {userRole === 'admin' ? 'Admin Panel' : 'Dashboard'}
            </button>
          )}

          <button
            onClick={() => {
              setIsOpen(false);
              handleSignOut();
            }}
            className="cursor-pointer w-full text-left px-4 py-3 text-red-400 hover:bg-slate-700"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}