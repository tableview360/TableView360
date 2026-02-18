import { useTranslation } from 'react-i18next';
import ContactForm from '../components/forms/ContactForm';

const ContactPage = () => {
  const { t } = useTranslation();

  return (
    <section className="max-w-7xl mx-auto py-24 px-6">
      <h1 className="text-4xl font-bold text-slate-50 mb-12 text-center">
        {t('Contact Us')}
      </h1>

      <ContactForm />
    </section>
  );
};

export default ContactPage;
