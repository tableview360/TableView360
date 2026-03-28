import { getLangFromParams } from "@/lib/getLang";
import { t } from "@/lib/i18n";

interface PrivacyPageProps {
    params: Promise<{ slug: string; lang: string }>
}

export default async function PrivacyPage( { params }: PrivacyPageProps ) {
    const lang = await getLangFromParams(params);

  return (
    <main className="min-h-screen mx-auto max-w-4xl px-6 pt-28 pb-16">
      <h1 className="text-4xl font-bold text-slate-50 mb-12 text-center">
        {t("Privacy / GDPR", lang)}
      </h1>

      <div className="prose prose-invert prose-slate max-w-none space-y-8 text-slate-400 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-slate-200 mb-3">
            {t("privacy.section1_title", lang)}
          </h2>
          <p>{t("privacy.section1_body", lang)}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-200 mb-3">
            {t("privacy.section2_title", lang)}
          </h2>
          <p>{t("privacy.section2_body", lang)}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-200 mb-3">
            {t("privacy.section3_title", lang)}
          </h2>
          <p>{t("privacy.section3_body", lang)}</p>
        </section>
      </div>
    </main>
  );
}