import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useLanguage } from '../hooks/useLanguage';

const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getLocalizedPath } = useLanguage();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Escuchar cambios de autenticación (Supabase procesa el hash automáticamente)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Token válido, usuario puede cambiar contraseña
        setCheckingSession(false);
      } else if (event === 'SIGNED_IN' && session) {
        // Sesión establecida
        setCheckingSession(false);
      } else if (!session) {
        // Sin sesión y no es recovery, redirigir
        // Esperar un poco para dar tiempo a Supabase de procesar el hash
        setTimeout(() => {
          supabase.auth.getSession().then(({ data }) => {
            if (!data.session) {
              navigate(getLocalizedPath('/forgot-password'));
            } else {
              setCheckingSession(false);
            }
          });
        }, 1000);
      }
    });

    // Verificar sesión inicial después de que Supabase procese el hash
    const timer = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setCheckingSession(false);
      }
    }, 500);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [navigate, getLocalizedPath]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError(t('Password must be at least 6 characters.'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('Passwords do not match.'));
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        navigate(getLocalizedPath('/login'));
      }, 2000);
    }

    setLoading(false);
  };

  if (checkingSession) {
    return (
      <section className="max-w-md mx-auto py-24 px-6 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-slate-400">{t('Verifying...')}</p>
      </section>
    );
  }

  return (
    <section className="max-w-md mx-auto py-24 px-6">
      <div className="bg-slate-800/60 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-slate-700">
        <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-br from-indigo-400 via-violet-400 to-slate-200 bg-clip-text text-transparent">
          {t('Reset your password')}
        </h1>

        {success ? (
          <div className="text-green-400 text-center">
            {t('Password updated successfully. Redirecting to login...')}
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-6">
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                {t('New password')}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                {t('Confirm password')}
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
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
              {loading ? t('Updating...') : t('Update password')}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default ResetPasswordPage;
