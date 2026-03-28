import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  label?: string;
  error?: string;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ icon, label, error, className, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-slate-400 ml-1"
          >
            {label}
          </label>
        )}

        <div className="relative group">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors duration-200">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            {...props}
            className={clsx(
              'w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-800/40 border text-slate-100 placeholder-slate-600 focus:outline-none focus:bg-slate-800/60 focus:ring-4 transition-all duration-300',
              error
                ? 'border-red-500/60 focus:ring-red-500/20'
                : 'border-slate-700/50 focus:border-indigo-500/60 focus:ring-indigo-500/10',
              className
            )}
          />
        </div>

        {error && <p className="text-sm text-red-400 ml-1">{error}</p>}
      </div>
    );
  }
);

InputField.displayName = 'InputField';

export default InputField;
