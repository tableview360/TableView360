'use client';

import { use } from 'react';
import RegisterForm from '@/components/RegisterForm';
import { t,langCodes, defaultLang, type LangCode } from '@/lib/i18n';

interface RegisterPageProps {
  params: Promise<{ lang: LangCode }>;
}

export default function RegisterPage({ params }: RegisterPageProps) {
    const { lang: rawLang } = use(params);
    const lang: LangCode = langCodes.includes(rawLang as LangCode)
        ? (rawLang as LangCode)
        : defaultLang;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex items-center justify-center px-4 pt-28 pb-16">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              TableView360
            </h1>
            <p className="mt-2 text-slate-400">{t('auth.register_title', lang)}</p>
          </div>
          <div className="rounded-2xl bg-slate-800/80 border border-slate-700/50 p-8 shadow-2xl backdrop-blur-xl">
            <RegisterForm lang={lang} />
          </div>
        </div>
      </main>
    </div>
  );
}