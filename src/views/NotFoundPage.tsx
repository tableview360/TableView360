import { useTranslation } from 'react-i18next';
import '../i18n';

interface NotFoundPageProps {
  standalone?: boolean;
}

const SimpleHeader = () => (
  <header className="fixed top-0 left-0 right-0 z-[1000] bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border-b border-slate-400/10 shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <a
        href="/"
        className="flex items-center gap-2 no-underline text-slate-50"
      >
        <span className="text-3xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]">
          ◈
        </span>
        <span className="text-2xl font-bold tracking-tight">
          TableView
          <span className="bg-gradient-to-br from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            360
          </span>
        </span>
      </a>
    </div>
  </header>
);

const NotFoundPage = ({ standalone = false }: NotFoundPageProps) => {
  const { t } = useTranslation();

  const content = (
    <section className="max-w-7xl mx-auto py-24 px-6 text-center min-h-[70vh] flex flex-col items-center justify-center">
      <h1 className="text-[5rem] font-bold mb-6 bg-gradient-to-br from-indigo-400 via-violet-400 to-slate-200 bg-clip-text text-transparent">
        404
      </h1>

      <h2 className="text-2xl font-semibold text-slate-200 mb-4">
        {t('Page not found')}
      </h2>

      <p className="text-lg text-slate-400 max-w-[600px] mx-auto mb-10">
        {t('The page you are looking for does not exist or has been moved.')}
      </p>

      <a href="/" className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl blur-lg opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative px-8 py-4 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl text-white font-semibold text-lg shadow-xl transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-indigo-500/30 group-active:scale-[0.98]">
          {t('Go back home')}
        </div>
      </a>
    </section>
  );

  if (standalone) {
    return (
      <>
        <SimpleHeader />
        <main className="min-h-screen pt-20">{content}</main>
      </>
    );
  }

  return content;
};

export default NotFoundPage;
