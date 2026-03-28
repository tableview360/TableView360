import { useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase/client';
import Link from 'next/link';

interface Props {
  open: boolean;
}

export default function LoginModal({ open }: Props) {
  const [isOpen, setIsOpen] = useState(open);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createSupabaseBrowser();

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError || !data.user) {
        setError(signInError?.message || 'Error al iniciar sesión');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();

      const role =
        profile?.role ??
        data.user.app_metadata?.role ??
        data.user.user_metadata?.role ??
        'client';
      const maybeLang = window.location.pathname.split('/')[1];
      const lang = maybeLang === 'es' ? 'es' : 'en';
      const redirectTo =
        role === 'restaurant' || role === 'admin'
          ? `/${lang}/dashboard`
          : `/${lang}`;

      window.location.assign(redirectTo);
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-slate-800/80 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-slate-100">Iniciar Sesión</h2>
          <p className="mt-2 text-sm text-slate-500">
            Inicia sesión para ver los restaurantes
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="modal-email"
              className="block text-sm font-medium text-slate-300"
            >
              Email
            </label>
            <input
              id="modal-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-900/50 px-4 py-2.5 text-slate-100 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
              placeholder="example@gmail.com"
            />
          </div>

          <div>
            <label
              htmlFor="modal-password"
              className="block text-sm font-medium text-slate-300"
            >
              Contraseña
            </label>
            <input
              id="modal-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-900/50 px-4 py-2.5 text-slate-100 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-violet-600 px-4 py-2.5 font-medium text-white transition hover:bg-violet-500 disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          ¿No tienes cuenta?{' '}
          <Link
            href="/register"
            className="font-medium text-violet-400 hover:text-violet-300"
          >
            Regístrate
          </Link>
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 text-gray-400 hover:text-slate-400"
          aria-label="Cerrar"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
