import { localePath, type LangCode } from '../../lib/i18n';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  lang?: LangCode;
}

const sizeMap = {
  sm: { icon: 'text-xl', text: 'text-lg' },
  md: { icon: 'text-2xl', text: 'text-xl' },
  lg: { icon: 'text-3xl', text: 'text-2xl' },
};

export default function Logo({
  size = 'lg',
  className = '',
  lang = 'en',
}: LogoProps) {
  const s = sizeMap[size];

  return (
    <a
      href={localePath('/', lang)}
      className={`flex items-center gap-2 no-underline text-slate-50 ${className}`}
    >
      <span
        className={`${s.icon} bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]`}
      >
        ◈
      </span>
      <span className={`${s.text} font-bold tracking-tight`}>
        TableView
        <span className="bg-gradient-to-br from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          360
        </span>
      </span>
    </a>
  );
}
