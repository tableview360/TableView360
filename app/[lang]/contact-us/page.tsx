import ContactForm from '@/components/forms/ContactForm';
import { getLangFromParams } from "@/lib/getLang";
import { t } from "@/lib/i18n";

export default async function ContactUsPage({ params }: {
  params: Promise<{ lang: string }>;
}) {
  const lang = await getLangFromParams(params);

  return (
    <div className="mx-auto max-w-7xl px-6 pt-28 pb-16">
      <h1 className="text-4xl font-bold text-slate-50 mb-12 text-center">
        {t('contact.title', lang)}
      </h1>

      <ContactForm lang={lang}/>
    </div>
  );
}
