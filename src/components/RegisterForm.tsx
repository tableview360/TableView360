import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

// Icon components
const UserIcon = () => (
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
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

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

const PhoneIcon = () => (
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
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
    />
  </svg>
);

const MapPinIcon = () => (
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
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
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

// Input wrapper component with icon - defined outside to prevent re-creation on each render
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
  autoComplete = 'new-password',
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

const RegisterForm = () => {
  const [tab, setTab] = useState<'client' | 'restaurant'>('client');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false);
    setIsLoading(true);

    try {
      console.log('🚀 Starting registration...');

      // Step 1: Create auth user (trigger creates profile automatically)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: tab,
          },
        },
      });

      console.log('📧 Auth response:', { authData, authError });

      if (authError) {
        console.error('❌ Auth error:', authError);
        throw authError;
      }

      const userId = authData.user?.id;
      if (!userId) {
        console.error('❌ No user ID returned');
        throw new Error(
          'Could not get user ID - check if email confirmation is required'
        );
      }

      console.log('✅ User created with ID:', userId);

      // Step 2: Update profile with additional info
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          username,
          phone,
        })
        .eq('id', userId);

      if (profileError) {
        console.error('❌ Profile update error:', profileError);
        throw new Error(`Profile error: ${profileError.message}`);
      }

      console.log('✅ Profile updated');

      // Step 3: If restaurant, create restaurant profile
      if (tab === 'restaurant') {
        const { error: restError } = await supabase
          .from('restaurant_profiles')
          .insert([
            {
              profile_id: userId,
              country,
              city,
              street,
              number,
              postal_code: postalCode,
            },
          ]);

        if (restError) {
          console.error('❌ Restaurant profile error:', restError);
          throw new Error(`Restaurant profile error: ${restError.message}`);
        }

        console.log('✅ Restaurant profile created');
      }

      setIsSuccess(true);
      setMessage('Registration successful! Check your email to verify.');
    } catch (error) {
      console.error('❌ Registration failed:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      setMessage(errorMessage);
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
            <UserIcon />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-slate-400">Join TableView360 today</p>
        </div>

        {/* Tabs */}
        <div className="relative flex mb-8 p-1 bg-slate-800/60 rounded-2xl">
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r from-indigo-500 to-violet-500 rounded-xl shadow-lg shadow-indigo-500/20 transition-transform duration-300 ease-out ${
              tab === 'restaurant'
                ? 'translate-x-[calc(100%+4px)]'
                : 'translate-x-0'
            }`}
          />
          <button
            type="button"
            className={`relative z-10 flex-1 py-3.5 font-semibold text-center rounded-xl transition-colors duration-200 ${
              tab === 'client'
                ? 'text-white'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            onClick={() => setTab('client')}
          >
            👤 Customer
          </button>
          <button
            type="button"
            className={`relative z-10 flex-1 py-3.5 font-semibold text-center rounded-xl transition-colors duration-200 ${
              tab === 'restaurant'
                ? 'text-white'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            onClick={() => setTab('restaurant')}
          >
            🍽️ Restaurant
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <InputField
            icon={<UserIcon />}
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <InputField
            icon={<UserIcon />}
            label="Username"
            type="text"
            placeholder="johndoe123"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <InputField
            icon={<EmailIcon />}
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <PasswordField
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <InputField
            icon={<PhoneIcon />}
            label="Phone Number"
            type="tel"
            placeholder="+1 234 567 890"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          {/* Restaurant address fields */}
          {tab === 'restaurant' && (
            <div className="pt-4 border-t border-slate-700/50 space-y-5">
              <div className="flex items-center gap-2 text-slate-300">
                <MapPinIcon />
                <span className="text-sm font-medium">Restaurant Address</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                    className="w-full px-4 py-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:bg-slate-800/60 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
                  />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="w-full px-4 py-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:bg-slate-800/60 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
                  />
                </div>
              </div>
              <input
                type="text"
                placeholder="Street Address"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                required
                className="w-full px-4 py-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:bg-slate-800/60 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  required
                  className="w-full px-4 py-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:bg-slate-800/60 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
                />
                <input
                  type="text"
                  placeholder="Postal Code"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  required
                  className="w-full px-4 py-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:bg-slate-800/60 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="relative w-full mt-8 group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl blur-lg opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl text-white font-semibold text-lg shadow-xl transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-indigo-500/30 group-active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
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
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
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
              isSuccess
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}
          >
            {message}
          </div>
        )}

        {/* Footer */}
        <p className="mt-8 text-center text-slate-500 text-sm">
          Already have an account?{' '}
          <a
            href="/login"
            className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
          >
            Sign in →
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
