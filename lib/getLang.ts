import { langCodes, defaultLang, type LangCode } from "@/lib/i18n";

export async function getLangFromParams(
  params: Promise<{ lang?: string }>
): Promise<LangCode> {
  const { lang: rawLang } = await params;

  return langCodes.includes(rawLang as LangCode)
    ? (rawLang as LangCode)
    : defaultLang;
}