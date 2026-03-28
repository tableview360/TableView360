'use client';

import {
  t as i18nT,
  localePath,
  languages,
  type LangCode,
} from '../../lib/i18n';
import Logo from '../ui/Logo';
import {
  InstagramIcon,
  FacebookIcon,
  TwitterIcon,
  LinkedInIcon,
  GlobeIcon,
} from '../icons';

interface FooterProps {
  lang: LangCode;
}

const socialLinks = [
  {
    icon: <InstagramIcon className="w-5 h-5" />,
    href: 'https://instagram.com/tableview360',
    label: 'Instagram',
  },
  {
    icon: <FacebookIcon className="w-5 h-5" />,
    href: 'https://facebook.com/tableview360',
    label: 'Facebook',
  },
  {
    icon: <TwitterIcon className="w-5 h-5" />,
    href: 'https://x.com/tableview360',
    label: 'X (Twitter)',
  },
  {
    icon: <LinkedInIcon className="w-5 h-5" />,
    href: 'https://linkedin.com/company/tableview360',
    label: 'LinkedIn',
  },
];

export default function Footer({ lang }: FooterProps) {
  const t = (key: string) => i18nT(key, lang);
  const path = (p: string) => localePath(p, lang);

  const changeLanguage = (lng: LangCode) => {
    const currentPath =
      typeof window !== 'undefined' ? window.location.pathname : '/';
    window.location.assign(localePath(currentPath, lng));
  };

  const navLinks = [
    { label: t('footer.nav.home'), href: path('/') },
    { label: t('footer.nav.restaurants'), href: path('/restaurants') },
    { label: t('FAQ'), href: path('/faq') },
    { label: t('footer.nav.blog'), href: path('/blog') },
    { label: t('Contact Us'), href: path('/contact-us') },
  ];

  const legalLinks = [
    { label: t('Terms of Service'), href: path('/terms') },
    { label: t('Privacy / GDPR'), href: path('/privacy') },
  ];

  return (
    <footer className="bg-gradient-to-br from-slate-950 to-slate-900 border-t border-slate-700/30 text-slate-300">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Column 1: Logo + description + social */}
          <div className="space-y-6">
            <Logo size="md" lang={lang} />
            <p className="text-slate-400 text-sm leading-relaxed">
              {t('footer.description')}
            </p>

            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h3 className="text-slate-50 font-semibold text-sm uppercase tracking-wider mb-4">
              {t('footer.navigation')}
            </h3>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-slate-400 hover:text-indigo-400 transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div>
            <h3 className="text-slate-50 font-semibold text-sm uppercase tracking-wider mb-4">
              {t('footer.legal')}
            </h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-slate-400 hover:text-indigo-400 transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-slate-500 text-center sm:text-left">
            © {new Date().getFullYear()} TableView360.{' '}
            {t('All rights reserved.')}
            <span className="block sm:inline sm:ml-2 text-slate-600">
              {t('footer.productOf')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <GlobeIcon className="w-4 h-4 text-slate-500" />
            <div className="flex gap-1">
              {languages.map((lo) => (
                <button
                  key={lo.code}
                  onClick={() => changeLanguage(lo.code)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                    lang === lo.code
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  {lo.flag} {lo.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
