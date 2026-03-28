'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { localePath, t, type LangCode } from '../lib/i18n';

interface Props {
  lang: LangCode;
}

export default function LoginForm({ lang }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, lang }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login error');
        return;
      }

      router.push(data.redirectTo || localePath('/', lang));
      router.refresh();
    } catch {
      setError(t('auth.error_connection', lang));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-slate-200">
          {t('auth.email', lang)}
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-3 text-slate-100 placeholder-slate-500 shadow-inner transition focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
          placeholder="example@gmail.com"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-slate-200"
        >
          {t('auth.password', lang)}
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-3 text-slate-100 placeholder-slate-500 shadow-inner transition focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? t('auth.loading_login', lang) : t('auth.submit_login', lang)}
      </button>

      <p className="text-center text-sm text-slate-400">
        {t('auth.no_account', lang)}{' '}
        <a
          href={localePath('/register', lang)}
          className="font-medium text-violet-300 transition hover:text-violet-200"
        >
          {t('auth.register', lang)}
        </a>
      </p>
    </form>
  );
}
