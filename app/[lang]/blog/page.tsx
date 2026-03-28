import { getLangFromParams } from "@/lib/getLang";
import { t } from "@/lib/i18n";

interface BlogPageProps {
    params: Promise<{ slug: string; lang: string }>
}

export default async function BlogPage( { params }: BlogPageProps ) {
    const lang = await getLangFromParams(params);

  return (
    <main className="min-h-screen mx-auto max-w-4xl px-6 pt-28 pb-16">
      <h1 className="text-4xl font-bold text-slate-50 mb-4 text-center">
        {t("footer.nav.blog", lang)}
      </h1>

      <p className="text-slate-400 text-center text-lg mb-12">
        {t("blog.subtitle", lang)}
      </p>

      <div className="flex flex-col items-center gap-6 py-16">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-3xl">
          ✍️
        </div>

        <p className="text-slate-500 text-center max-w-md">
          {t("blog.comingSoon", lang)}
        </p>
      </div>
    </main>
  );
}