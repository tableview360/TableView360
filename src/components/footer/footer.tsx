import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  const pages = [
    { name: t('FAQ'), href: '/faq' },
    { name: t('Terms of Service'), href: '/terms' },
    { name: t('Privacy / GDPR'), href: '/privacy' },
    { name: t('Contact Us'), href: '/contacto' },
  ];

  return (
    <footer className="bg-slate-900 border-t border-slate-700/50 text-slate-300">
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Logo o nombre */}
        <div className="text-white font-bold text-xl">TableView360</div>

        {/* Links */}
        <div className="flex flex-wrap justify-center md:justify-start gap-4">
          {pages.map((page) => (
            <Link
              key={page.href}
              to={page.href}
              className="hover:text-indigo-400 transition-colors duration-200"
            >
              {page.name}
            </Link>
          ))}
        </div>

        {/* Derechos */}
        <div className="text-sm text-slate-500 text-center md:text-right">
          © {new Date().getFullYear()} TableView360. {t('All rights reserved.')}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
