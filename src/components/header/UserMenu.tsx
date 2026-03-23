import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import DropdownArrow from '../../components/icons/DropdownArrow';

interface Profile {
  username: string | null;
  full_name: string | null;
}

interface UserMenuProps {
  user: User;
  profile: Profile | null;
  handleSignOut: () => void;
  isMobile?: boolean;
  closeMenu?: () => void;
}

const UserMenu = ({
  user,
  profile,
  handleSignOut,
  isMobile,
  closeMenu,
}: UserMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const { getLocalizedPath } = useLanguage();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isMobile) {
    return (
      <>
        <div className="py-3 border-b border-slate-400/10">
          <p className="text-sm text-slate-400">Signed in as</p>
          <p className="text-base font-medium text-slate-200">
            {profile?.username || profile?.full_name || user.email}
          </p>
        </div>
        <Link
          to={getLocalizedPath('/settings')}
          className="text-slate-300 no-underline py-3 text-base font-medium border-b border-slate-400/10 hover:text-slate-50 transition-colors"
          onClick={closeMenu}
        >
          {t('nav.settings')}
        </Link>
        <button
          onClick={handleSignOut}
          className="text-red-400 py-3 text-base font-medium border-b border-slate-400/10 hover:text-red-300 transition-colors bg-transparent border-none cursor-pointer text-left"
        >
          {t('nav.signout')}
        </button>
      </>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-slate-300 hover:text-slate-50 transition-colors bg-transparent border-none cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-semibold">
          {profile?.username?.[0]?.toUpperCase() ||
            profile?.full_name?.[0]?.toUpperCase() ||
            'U'}
        </div>
        <span className="text-[0.95rem] font-medium">
          {profile?.username || profile?.full_name || 'User'}
        </span>
        <DropdownArrow isOpen={isOpen} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-[1001]">
          <div className="px-4 py-3 border-b border-slate-700">
            <p className="text-sm text-slate-400">Signed in as</p>
            <p className="text-sm font-medium text-slate-200 truncate">
              {user.email}
            </p>
          </div>
          <Link
            to={getLocalizedPath('/settings')}
            className="flex items-center gap-2 px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-slate-50 transition-colors no-underline"
          >
            {t('nav.settings')}
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-4 py-3 text-red-400 hover:bg-slate-700 hover:text-red-300 transition-colors bg-transparent border-none cursor-pointer text-left"
          >
            {t('nav.signout')}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
