import RestaurantEditor from '@/components/dashboard/RestaurantEditor';
import { defaultLang, langCodes, type LangCode } from '@/lib/i18n';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function Page({ params }: PageProps) {
  const { lang: rawLang } = await params;
  const lang: LangCode = langCodes.includes(rawLang as LangCode)
    ? (rawLang as LangCode)
    : defaultLang;

  return <RestaurantEditor lang={lang} />;
}
