import { ArrowIcon, SpinnerIcon } from '../../icons';

interface SubmitButtonProps {
  isLoading?: boolean;
  children: React.ReactNode;
}

const SubmitButton = ({ isLoading = false, children }: SubmitButtonProps) => (
  <button
    type="submit"
    disabled={isLoading}
    className="relative w-full mt-6 group"
  >
    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl blur-lg opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="relative flex cursor-pointer items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl text-white font-semibold text-lg shadow-xl transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-indigo-500/30 group-active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
      {isLoading ? (
        <>
          <SpinnerIcon />
          Signing in...
        </>
      ) : (
        <>
          {children}
          <ArrowIcon />
        </>
      )}
    </div>
  </button>
);

export default SubmitButton;
