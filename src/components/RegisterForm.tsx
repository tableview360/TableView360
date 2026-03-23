import { useState } from 'react';
import { t, type LangCode } from '../lib/i18n';

interface Props {
  lang: LangCode;
}

export default function RegisterForm({ lang }: Props) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'client' | 'restaurant'>('client');
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantAddress, setRestaurantAddress] = useState('');
  const [restaurantCapacity, setRestaurantCapacity] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName,
          username,
          phone,
          role,
          restaurant_name: role === 'restaurant' ? restaurantName : undefined,
          restaurant_address:
            role === 'restaurant' ? restaurantAddress : undefined,
          restaurant_capacity:
            role === 'restaurant' ? restaurantCapacity : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error');
        return;
      }
      setSuccess(t('auth.success_register', lang));
      setTimeout(() => {
        window.location.href = data.redirectTo;
      }, 2000);
    } catch {
      setError(t('auth.error_connection', lang));
    } finally {
      setLoading(false);
    }
  }

  const inp =
    'mt-1 block w-full rounded-lg border border-slate-600 bg-slate-900/50 px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none';
  const lbl = 'block text-sm font-medium text-slate-300';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-400">
          {success}
        </div>
      )}

      {/* Role */}
      <div>
        <label className={`${lbl} mb-3`}>{t('auth.role_question', lang)}</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole('client')}
            className={`cursor-pointer rounded-xl border-2 p-4 text-center transition ${role === 'client' ? 'border-violet-500 bg-violet-500/10 text-violet-400' : 'border-slate-700/40 hover:border-slate-600 text-slate-400'}`}
          >
            <div className="text-2xl mb-1">👤</div>
            <div className="font-medium text-sm">
              {t('auth.role_client', lang)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {t('auth.role_client_desc', lang)}
            </div>
          </button>
          <button
            type="button"
            onClick={() => setRole('restaurant')}
            className={`cursor-pointer rounded-xl border-2 p-4 text-center transition ${role === 'restaurant' ? 'border-violet-500 bg-violet-500/10 text-violet-400' : 'border-slate-700/40 hover:border-slate-600 text-slate-400'}`}
          >
            <div className="text-2xl mb-1">🍽️</div>
            <div className="font-medium text-sm">
              {t('auth.role_restaurant', lang)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {t('auth.role_restaurant_desc', lang)}
            </div>
          </button>
        </div>
      </div>

      <div>
        <label className={lbl}>{t('auth.full_name', lang)}</label>
        <input
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className={inp}
          placeholder={t('auth.full_name', lang)}
        />
      </div>

      <div>
        <label className={lbl}>{t('auth.username', lang)}</label>
        <input
          type="text"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={inp}
          placeholder={t('auth.username', lang)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={lbl}>{t('auth.email', lang)}</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inp}
            placeholder="tu@email.com"
          />
        </div>
        <div>
          <label className={lbl}>{t('auth.phone', lang)}</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inp}
            placeholder="+34 600 000 000"
          />
        </div>
      </div>

      <div>
        <label className={lbl}>{t('auth.password', lang)}</label>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inp}
          placeholder={t('auth.password_min', lang)}
        />
      </div>

      {role === 'restaurant' && (
        <div className="space-y-4 pt-2 border-t border-slate-700/30">
          <p className="text-sm text-violet-400 font-medium pt-2">
            Datos del restaurante
          </p>
          <div>
            <label className={lbl}>{t('auth.restaurant_name', lang)}</label>
            <input
              type="text"
              required
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              className={inp}
              placeholder={t('auth.restaurant_name', lang)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>
                {t('auth.restaurant_address', lang)}
              </label>
              <input
                type="text"
                value={restaurantAddress}
                onChange={(e) => setRestaurantAddress(e.target.value)}
                className={inp}
                placeholder={t('auth.restaurant_address', lang)}
              />
            </div>
            <div>
              <label className={lbl}>
                {t('auth.restaurant_capacity', lang)}
              </label>
              <input
                type="number"
                min="1"
                value={restaurantCapacity}
                onChange={(e) => setRestaurantCapacity(e.target.value)}
                className={inp}
                placeholder="50"
              />
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-violet-600 px-4 py-2.5 font-medium text-white transition hover:bg-violet-500 disabled:opacity-50 shadow-lg shadow-violet-500/20"
      >
        {loading
          ? t('auth.loading_register', lang)
          : t('auth.submit_register', lang)}
      </button>

      <p className="text-center text-sm text-slate-500">
        {t('auth.has_account', lang)}{' '}
        <a
          href="/login"
          className="font-medium text-violet-400 hover:text-violet-300"
        >
          {t('auth.submit_login', lang)}
        </a>
      </p>
    </form>
  );
}
