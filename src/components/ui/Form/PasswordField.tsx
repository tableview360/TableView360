import { useState } from 'react';
import { LockIcon, EyeIcon, EyeOffIcon } from '../../icons';

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoComplete?: string;
}

const PasswordField = ({
  label,
  value,
  onChange,
  placeholder = '••••••••',
  autoComplete = 'current-password',
}: PasswordFieldProps) => {
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
          className="absolute right-4 cursor-pointer top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors duration-200"
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  );
};

export default PasswordField;
