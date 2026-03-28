'use client';

import { use } from 'react';
import LoginForm from '@/components/LoginForm';
import { t, langCodes, defaultLang, type LangCode } from '@/lib/i18n';

interface LoginPageProps {
  params: Promise<{ lang: string }>;
}

export default function LoginPage({ params }: LoginPageProps) {
  const { lang: rawLang } = use(params); // ✅ unwrap del Promise

  const lang: LangCode = langCodes.includes(rawLang as LangCode)
    ? (rawLang as LangCode)
    : defaultLang;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center justify-center px-4 pt-28 pb-16">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              TableView360
            </h1>
            <p className="mt-2 text-slate-400">{t('auth.login_subtitle', lang)}</p>
          </div>
          <div className="rounded-2xl bg-slate-800/80 border border-slate-700/50 p-8 shadow-2xl backdrop-blur-xl">
            <LoginForm lang={lang} />
          </div>
        </div>
      </div>
    </div>
  );
}