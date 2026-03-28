'use client';

import Link from 'next/link';
import { t, type LangCode } from '../../lib/i18n';
import { useLanguage } from '../../hooks/useLanguage';

interface NavLinksProps {
  lang: LangCode;
  isMobile?: boolean;
  closeMenu?: () => void;
}

export default function NavLinks({
  lang,
  isMobile,
  closeMenu,
}: NavLinksProps) {
  const { getLocalizedPath } = useLanguage();

  const navLinks = [
    { name: t('nav.home', lang), href: getLocalizedPath('/') },
    { name: t('nav.restaurants', lang), href: getLocalizedPath('/restaurants') },
    { name: t('nav.prices', lang), href: getLocalizedPath('/prices') },
    { name: t('nav.about', lang), href: getLocalizedPath('/about-us') },
    { name: t('nav.contact-us', lang), href: getLocalizedPath('/contact-us') },
  ];

  const baseClass = isMobile
    ? 'text-slate-300 no-underline py-3 text-base font-medium border-b border-slate-400/10 hover:text-slate-50 transition-colors'
    : 'text-slate-300 no-underline text-[0.95rem] font-medium transition-colors duration-200 hover:text-slate-50';

  return (
    <nav
      className={
        isMobile
          ? 'flex flex-col px-6 py-4 pb-6 gap-2 border-t border-slate-400/10'
          : 'hidden md:flex items-center gap-4'
      }
    >
      {/* Links principales */}
      {navLinks.map((link) => (
        <Link
          key={link.name}
          href={link.href}
          className={baseClass}
          onClick={closeMenu}
        >
          {link.name}
        </Link>
      ))}
    </nav>
  );
}