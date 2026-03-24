import { useTranslation } from 'react-i18next';

const BlogPage = () => {
  const { t } = useTranslation();

  return (
    <section className="max-w-4xl mx-auto py-24 px-6">
      <h1 className="text-4xl font-bold text-slate-50 mb-4 text-center">
        {t('footer.nav.blog')}
      </h1>
      <p className="text-slate-400 text-center text-lg mb-12">
        {t('blog.subtitle')}
      </p>

      {/* Placeholder — coming soon */}
      <div className="flex flex-col items-center gap-6 py-16">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-3xl">
          ✍️
        </div>
        <p className="text-slate-500 text-center max-w-md">
          {t('blog.comingSoon')}
        </p>
      </div>
    </section>
  );
};

export default BlogPage;
