import { getLangFromParams } from "@/lib/getLang";
import { t } from "@/lib/i18n";

interface FAQPageProps {
    params: Promise<{ slug: string; lang: string }>
}

export default async function FAQPage( { params }: FAQPageProps ) {
    const lang = await getLangFromParams(params);


  return (
    <main className="min-h-screen mx-auto max-w-4xl px-6 pt-28 pb-16">
      <h1 className="text-4xl font-bold text-slate-50 mb-12 text-center">
        {t("FAQ", lang)}
      </h1>

      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <details
            key={i}
            className="group rounded-2xl border border-slate-700/50 bg-slate-800/60 p-6"
          >
            <summary className="flex cursor-pointer items-center justify-between text-lg font-medium text-slate-100 group-open:mb-4">
              {t(`faq.q${i}`, lang)}
              <span className="ml-4 text-slate-500 transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="text-slate-400 leading-relaxed">
              {t(`faq.a${i}`, lang)}
            </p>
          </details>
        ))}
      </div>
    </main>
  );
}