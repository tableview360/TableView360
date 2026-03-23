import SettingsForm from '../components/SettingsForm';
import { useTranslation } from 'react-i18next';

const SettingsPage = () => {
  const { t } = useTranslation();
  return (
    <section className="max-w-7xl mx-auto py-16 px-6">
      <h1 className="text-4xl font-bold text-white text-center mb-8">
        {t('Account Settings')}
      </h1>
      <SettingsForm />
    </section>
  );
};

export default SettingsPage;
