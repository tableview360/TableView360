import { useState } from 'react';
import { createSupabaseBrowser } from '../lib/supabase';
import { t, type LangCode } from '../lib/i18n';

interface Props {
  userId: string;
  role: string | null;
  initialUsername: string | null;
  initialFullName: string | null;
  initialPhone: string | null;
  initialAvatarUrl: string | null;
  email: string | null;
  lang: LangCode;
}

export default function ProfileSettings({
  userId,
  role,
  initialUsername,
  initialFullName,
  initialPhone,
  initialAvatarUrl,
  email,
  lang,
}: Props) {
  const supabase = createSupabaseBrowser();

  // --- Avatar ---
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState('');

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setAvatarError(t('profile.photo_size_error', lang));
      return;
    }
    if (!file.type.startsWith('image/')) {
      setAvatarError(t('profile.photo_type_error', lang));
      return;
    }

    setAvatarLoading(true);
    setAvatarError('');

    const ext = file.name.split('.').pop();
    const path = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('client-avatars')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setAvatarError(uploadError.message);
      setAvatarLoading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('client-avatars').getPublicUrl(path);

    // Add cache-busting so the browser reloads the new image
    const urlWithBust = `${publicUrl}?t=${Date.now()}`;

    await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId);

    setAvatarUrl(urlWithBust);
    setAvatarLoading(false);
  }

  // --- Profile form ---
  const [username, setUsername] = useState(initialUsername ?? '');
  const [fullName, setFullName] = useState(initialFullName ?? '');
  const [phone, setPhone] = useState(initialPhone ?? '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // --- Password form ---
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault();
    setProfileMsg('');
    setProfileError('');
    setProfileLoading(true);

    // Use upsert so it works even if the profile row doesn't exist yet
    const { error } = await supabase.from('profiles').upsert(
      {
        id: userId,
        role: role || 'client',
        username: username || null,
        full_name: fullName || null,
        phone: phone || null,
      },
      { onConflict: 'id' }
    );

    if (error) {
      setProfileError(error.message);
    } else {
      setProfileMsg(t('profile.update_success', lang));
    }
    setProfileLoading(false);
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordError('');

    if (newPassword.length < 6) {
      setPasswordError(t('profile.password_min_error', lang));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t('profile.password_mismatch', lang));
      return;
    }

    setPasswordLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordMsg(t('profile.password_success', lang));
      setNewPassword('');
      setConfirmPassword('');
    }
    setPasswordLoading(false);
  }

  const inputCls =
    'mt-1 block w-full rounded-lg border border-slate-600 bg-slate-900/50 px-4 py-2.5 text-slate-100 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none';
  const labelCls = 'block text-sm font-medium text-slate-300';

  const initial = (username || fullName || email || 'U')[0].toUpperCase();

  return (
    <div className="space-y-8">
      {/* Avatar upload */}
      <section className="rounded-2xl border border-slate-700/50 bg-slate-800/80 p-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-5">
          {t('profile.photo', lang)}
        </h2>
        <div className="flex items-center gap-6">
          {/* Preview */}
          <div className="relative flex-shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover border-2 border-violet-500/50"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-2xl font-bold">
                {initial}
              </div>
            )}
            {avatarLoading && (
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                <svg
                  className="w-6 h-6 animate-spin text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Upload button */}
          <div>
            <label
              htmlFor="avatar-upload"
              className={`inline-flex items-center gap-2 cursor-pointer rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-slate-50 transition-colors ${
                avatarLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              📷 {t('profile.change_photo', lang)}
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={avatarLoading}
              onChange={handleAvatarChange}
            />
            <p className="mt-2 text-xs text-slate-500">
              {t('profile.photo_hint', lang)}
            </p>
            {avatarError && (
              <p className="mt-2 text-xs text-red-400">{avatarError}</p>
            )}
          </div>
        </div>
      </section>

      {/* Profile info */}
      <section className="rounded-2xl border border-slate-700/50 bg-slate-800/80 p-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-5">
          {t('profile.personal_info', lang)}
        </h2>

        {/* Read-only email */}
        <div className="mb-4">
          <label className={labelCls}>Email</label>
          <input
            type="email"
            value={email ?? ''}
            disabled
            className="mt-1 block w-full rounded-lg border border-slate-700/50 bg-slate-900/30 px-4 py-2.5 text-slate-500 cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-slate-500">
            El email no se puede cambiar.
          </p>
        </div>

        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label className={labelCls}>Nombre completo</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputCls}
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <label className={labelCls}>Nombre de usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputCls}
              placeholder="@usuario"
            />
          </div>
          <div>
            <label className={labelCls}>Teléfono</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputCls}
              placeholder="+34 600 000 000"
            />
          </div>

          {profileMsg && (
            <p className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 text-sm text-emerald-400">
              {profileMsg}
            </p>
          )}
          {profileError && (
            <p className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-400">
              {profileError}
            </p>
          )}

          <button
            type="submit"
            disabled={profileLoading}
            className="w-full rounded-lg bg-violet-600 px-4 py-2.5 font-medium text-white transition hover:bg-violet-500 disabled:opacity-50"
          >
            {profileLoading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </section>

      {/* Password change */}
      <section className="rounded-2xl border border-slate-700/50 bg-slate-800/80 p-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-5">
          Cambiar contraseña
        </h2>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className={labelCls}>Nueva contraseña</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputCls}
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>
          <div>
            <label className={labelCls}>Confirmar contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputCls}
              placeholder="Repite la contraseña"
              required
            />
          </div>

          {passwordMsg && (
            <p className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 text-sm text-emerald-400">
              {passwordMsg}
            </p>
          )}
          {passwordError && (
            <p className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-400">
              {passwordError}
            </p>
          )}

          <button
            type="submit"
            disabled={passwordLoading}
            className="w-full rounded-lg bg-slate-700 px-4 py-2.5 font-medium text-slate-100 transition hover:bg-slate-600 disabled:opacity-50"
          >
            {passwordLoading ? 'Actualizando...' : 'Cambiar contraseña'}
          </button>
        </form>
      </section>
    </div>
  );
}
