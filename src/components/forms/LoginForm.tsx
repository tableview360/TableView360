import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useTranslation } from 'react-i18next';
import { EmailIcon, LoginIcon } from '../icons';
import InputField from '../ui/Form/InputField';
import PasswordField from '../ui/Form/PasswordField';
import SubmitButton from '../ui/Form/SubmitButton';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      if (data.session) {
        setMessage('Login successful!');
        navigate('/');
      }
    } catch (error) {
      setIsError(true);
      if (error instanceof Error) {
        if (error.message.includes('Invalid login credentials')) {
          setMessage('Invalid email or password');
        } else if (error.message.includes('Email not confirmed')) {
          setMessage('Please verify your email before logging in');
        } else {
          setMessage(error.message);
        }
      } else {
        setMessage('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto">
      <div className="p-8 bg-gradient-to-b from-slate-800/80 to-slate-900/80 rounded-3xl shadow-2xl border border-slate-700/40 backdrop-blur-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 mb-4">
            <LoginIcon />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {t('Welcome Back')}
          </h1>
          <p className="text-slate-400">{t('Sign in to your account')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <InputField
            label="Email Address"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<EmailIcon className="w-5 h-5" />}
            required
          />

          <PasswordField
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {t('Forgot password?')}
            </Link>
          </div>

          <SubmitButton isLoading={isLoading}>{t('Sign In')}</SubmitButton>
        </form>

        {message && (
          <div
            className={`mt-6 text-center text-sm p-4 rounded-2xl ${isError ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}
          >
            {message}
          </div>
        )}

        <p className="mt-8 text-center text-slate-500 text-sm">
          {t('Don&apos;t have an account?')}{' '}
          <Link
            to="/register"
            className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
          >
            {t('Sign up')} →
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
