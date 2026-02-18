import { useTranslation } from 'react-i18next';

const TermsPage = () => {
  const { t } = useTranslation();

  return (
    <section className="max-w-4xl mx-auto py-24 px-6 text-center">
      <h1 className="text-4xl font-bold text-slate-50">
        {t('Terms of Service')}
      </h1>
    </section>
  );
};

export default TermsPage;
