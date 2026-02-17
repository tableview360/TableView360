import { Link } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import UserMenu from './UserMenu';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';

interface Profile {
  username: string | null;
  full_name: string | null;
}

interface NavLinksProps {
  isLoading: boolean;
  user: User | null;
  profile: Profile | null;
  handleSignOut: () => void;
  isMobile?: boolean;
  closeMenu?: () => void;
}

const NavLinks = ({
  isLoading,
  user,
  profile,
  handleSignOut,
  isMobile,
  closeMenu,
}: NavLinksProps) => {
  const { t } = useTranslation();
  const { getLocalizedPath } = useLanguage();

  const navLinks = [
    { name: t('nav.home'), href: getLocalizedPath('/') },
    { name: t('nav.products'), href: getLocalizedPath('/productos') },
    { name: t('nav.about'), href: getLocalizedPath('/nosotros') },
    { name: t('nav.contact'), href: getLocalizedPath('/contacto') },
  ];

  const baseClass = isMobile
    ? 'text-slate-300 no-underline py-3 text-base font-medium border-b border-slate-400/10 hover:text-slate-50 transition-colors'
    : 'text-slate-300 no-underline text-[0.95rem] font-medium transition-colors duration-200 hover:text-slate-50';

  return (
    <nav
      className={
        isMobile
          ? 'flex flex-col px-6 py-4 pb-6 gap-2 border-t border-slate-400/10'
          : 'hidden md:flex items-center gap-8'
      }
    >
      {navLinks.map((link) => (
        <Link
          key={link.name}
          to={link.href}
          className={baseClass}
          onClick={closeMenu}
        >
          {link.name}
        </Link>
      ))}

      {!isLoading && !user && (
        <>
          <Link
            to={getLocalizedPath('/login')}
            className={baseClass}
            onClick={closeMenu}
          >
            {t('nav.signin')}
          </Link>
          <Link
            to={getLocalizedPath('/register')}
            className={
              isMobile
                ? 'text-slate-300 no-underline py-3 text-base font-medium border border-slate-600 rounded-lg text-center hover:text-slate-50 transition-colors'
                : 'text-slate-300 no-underline text-[0.95rem] font-medium transition-colors duration-200 hover:text-slate-50 border border-slate-600 px-4 py-2 rounded-lg'
            }
            onClick={closeMenu}
          >
            {t('nav.signup')}
          </Link>
        </>
      )}

      {!isLoading && user && (
        <UserMenu
          user={user}
          profile={profile}
          handleSignOut={handleSignOut}
          isMobile={isMobile}
          closeMenu={closeMenu}
        />
      )}

      {!isMobile && (
        <Link
          to={getLocalizedPath('/demo')}
          className="bg-gradient-to-br from-indigo-500 to-violet-500 text-white px-5 py-2.5 rounded-lg no-underline font-semibold text-sm shadow-[0_4px_15px_rgba(99,102,241,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(99,102,241,0.5)]"
        >
          {t('nav.demo')}
        </Link>
      )}

      {isMobile && (
        <Link
          to={getLocalizedPath('/demo')}
          className="bg-gradient-to-br from-indigo-500 to-violet-500 text-white py-3.5 rounded-lg no-underline font-semibold text-center mt-2"
          onClick={closeMenu}
        >
          {t('nav.demo')}
        </Link>
      )}
    </nav>
  );
};

export default NavLinks;
