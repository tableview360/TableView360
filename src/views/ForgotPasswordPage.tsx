import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const { getLocalizedPath } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }

    setLoading(false);
  };

  return (
    <section className="max-w-md mx-auto py-24 px-6">
      <div className="bg-slate-800/60 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-slate-700">
        <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-br from-indigo-400 via-violet-400 to-slate-200 bg-clip-text text-transparent">
          {t('Forgot your password?')}
        </h1>

        <p className="text-slate-400 text-center mb-8">
          {t('Enter your email and we will send you a reset link.')}
        </p>

        {success ? (
          <div className="text-green-400 text-center">
            {t('If this email exists, a reset link has been sent.')}
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-6">
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                {t('Email address')}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                placeholder="you@example.com"
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 disabled:opacity-60"
            >
              {loading ? t('Sending...') : t('Send reset link')}
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-slate-400 text-sm">
          {t('Remember your password?')}{' '}
          <Link
            to={getLocalizedPath('/login')}
            className="text-indigo-400 hover:underline"
          >
            {t('Back to login')}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ForgotPasswordPage;
