import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

// Icon components
const EmailIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

const LockIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);

const EyeIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
    />
  </svg>
);

const ArrowIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 7l5 5m0 0l-5 5m5-5H6"
    />
  </svg>
);

const LoginIcon = () => (
  <svg
    className="w-8 h-8 text-white"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
    />
  </svg>
);

// Input wrapper component
const InputField = ({
  icon,
  label,
  ...props
}: {
  icon: React.ReactNode;
  label: string;
} & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-slate-400 ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors duration-200">
        {icon}
      </div>
      <input
        {...props}
        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:bg-slate-800/60 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
      />
    </div>
  </div>
);

// Password input with show/hide toggle
const PasswordField = ({
  label,
  value,
  onChange,
  placeholder = '••••••••',
  autoComplete = 'current-password',
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoComplete?: string;
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-400 ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors duration-200">
          <LockIcon />
        </div>
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          className="w-full pl-12 pr-12 py-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:bg-slate-800/60 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors duration-200"
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  );
};

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setIsLoading(true);

    try {
      console.log('🔐 Attempting login...');

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('📧 Auth response:', { data, error });

      if (error) {
        console.error('❌ Login error:', error);
        throw error;
      }

      if (data.user) {
        console.log('✅ Login successful:', data.user.email);
        setMessage('Login successful! Redirecting...');

        // Redirect to home page after successful login
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
      setIsError(true);
      if (error instanceof Error) {
        // Translate common error messages
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
      {/* Card */}
      <div className="p-8 bg-gradient-to-b from-slate-800/80 to-slate-900/80 rounded-3xl shadow-2xl border border-slate-700/40 backdrop-blur-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 mb-4">
            <LoginIcon />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400">Sign in to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <InputField
            icon={<EmailIcon />}
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <PasswordField
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          {/* Forgot Password Link */}
          <div className="text-right">
            <a
              href="/forgot-password"
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="relative w-full mt-6 group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl blur-lg opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex cursor-pointer items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl text-white font-semibold text-lg shadow-xl transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-indigo-500/30 group-active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? (
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
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowIcon />
                </>
              )}
            </div>
          </button>
        </form>

        {/* Message */}
        {message && (
          <div
            className={`mt-6 text-center text-sm p-4 rounded-2xl ${
              isError
                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}
          >
            {message}
          </div>
        )}

        {/* Footer */}
        <p className="mt-8 text-center text-slate-500 text-sm">
          Don&apos;t have an account?{' '}
          <a
            href="/register"
            className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
          >
            Sign up →
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
