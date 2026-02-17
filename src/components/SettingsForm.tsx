import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import { useTranslation } from 'react-i18next';

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: string | null;
  created_at: string | null;
}

const SettingsForm = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Password change states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [isPasswordSuccess, setIsPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/login');
        return;
      }
      setUser(session.user);
      await fetchProfile(session.user.id);
      setIsLoading(false);
    };

    getUser();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage('');
    setIsPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordMessage('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage('Password must be at least 6 characters');
      return;
    }

    setIsChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setIsPasswordSuccess(true);
      setPasswordMessage('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPasswordMessage(
        error instanceof Error ? error.message : 'Failed to update password'
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* User Info Card */}
      <div className="p-8 bg-gradient-to-b from-slate-800/80 to-slate-900/80 rounded-3xl shadow-2xl border border-slate-700/40 backdrop-blur-2xl">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <svg
            className="w-6 h-6 text-indigo-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          {t('Profile Information')}
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
            <span className="text-slate-400">{t('Username')}</span>
            <span className="text-slate-200 font-medium">
              {profile?.username || '-'}
            </span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
            <span className="text-slate-400">{t('Full Name')}</span>
            <span className="text-slate-200 font-medium">
              {profile?.full_name || '-'}
            </span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
            <span className="text-slate-400">Email</span>
            <span className="text-slate-200 font-medium">
              {user?.email || '-'}
            </span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
            <span className="text-slate-400">{t('Phone')}</span>
            <span className="text-slate-200 font-medium">
              {profile?.phone || '-'}
            </span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
            <span className="text-slate-400">{t('Account Type')}</span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                profile?.role === 'restaurant'
                  ? 'bg-violet-500/20 text-violet-400'
                  : 'bg-indigo-500/20 text-indigo-400'
              }`}
            >
              {profile?.role === 'restaurant' ? '🍽️ Restaurant' : '👤 Customer'}
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-slate-400">Member Since</span>
            <span className="text-slate-200 font-medium">
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="p-8 bg-gradient-to-b from-slate-800/80 to-slate-900/80 rounded-3xl shadow-2xl border border-slate-700/40 backdrop-blur-2xl">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <svg
            className="w-6 h-6 text-indigo-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          {t('Change Password')}
        </h2>

        <form onSubmit={handlePasswordChange} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 ml-1">
              {t('New Password')}
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:bg-slate-800/60 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 ml-1">
              {t('Confirm New Password')}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:bg-slate-800/60 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
            />
          </div>

          {passwordMessage && (
            <div
              className={`text-center text-sm p-4 rounded-2xl ${
                isPasswordSuccess
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}
            >
              {passwordMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isChangingPassword}
            className="relative w-full group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl blur-lg opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl text-white font-semibold text-lg shadow-xl transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-indigo-500/30 group-active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
              {isChangingPassword ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {t('Updating...')}
                </>
              ) : (
                'Update Password'
              )}
            </div>
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsForm;
