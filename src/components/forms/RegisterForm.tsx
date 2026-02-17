import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useTranslation } from 'react-i18next';
import { UserIcon, EmailIcon, PhoneIcon } from '../icons';
import InputField from '../ui/Form/InputField';
import PasswordField from '../ui/Form/PasswordField';
import SubmitButton from '../ui/Form/SubmitButton';
import AddressFields from '../ui/Form/AddressFields';

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
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false);
    setIsLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { role: tab } },
      });
      if (authError) throw authError;
      const userId = authData.user?.id;
      if (!userId) throw new Error('Could not get user ID');

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: fullName, username, phone })
        .eq('id', userId);
      if (profileError) throw new Error(profileError.message);

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
        if (restError) throw new Error(restError.message);
      }

      setIsSuccess(true);
      setMessage('Registration successful! Check your email to verify.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto">
      <div className="p-8 bg-gradient-to-b from-slate-800/80 to-slate-900/80 rounded-3xl shadow-2xl border border-slate-700/40 backdrop-blur-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 mb-4">
            <UserIcon />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {t('Create Account')}
          </h1>
          <p className="text-slate-400">{t('Join TableView360 today')}</p>
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
            className={`relative cursor-pointer z-10 flex-1 py-3.5 font-semibold text-center rounded-xl ${
              tab === 'client'
                ? 'text-white'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            onClick={() => setTab('client')}
          >
            👤 {t('Customer')}
          </button>
          <button
            type="button"
            className={`relative cursor-pointer z-10 flex-1 py-3.5 font-semibold text-center rounded-xl ${
              tab === 'restaurant'
                ? 'text-white'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            onClick={() => setTab('restaurant')}
          >
            🍽️ {t('Restaurant')}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <InputField
            icon={<UserIcon />}
            label="Full Name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
            required
          />
          <InputField
            icon={<UserIcon />}
            label="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="johndoe123"
            required
          />
          <InputField
            icon={<EmailIcon className="w-5 h-5" />}
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
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
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 234 567 890"
            required
          />

          {tab === 'restaurant' && (
            <AddressFields
              country={country}
              city={city}
              street={street}
              number={number}
              postalCode={postalCode}
              setCountry={setCountry}
              setCity={setCity}
              setStreet={setStreet}
              setNumber={setNumber}
              setPostalCode={setPostalCode}
            />
          )}

          <SubmitButton isLoading={isLoading}>
            {t('Create Account')}
          </SubmitButton>
        </form>

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

        <p className="mt-8 text-center text-slate-500 text-sm">
          {t('Already have an account?')}{' '}
          <Link
            to="/login"
            className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
          >
            {t('Sign in')} →
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
