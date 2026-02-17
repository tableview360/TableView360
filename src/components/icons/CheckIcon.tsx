import type { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
}

const LockIcon = ({
  size = 20,
  color = 'currentColor',
  className = '',
  ...props
}: IconProps) => (
  <svg
    {...props}
    width={size}
    height={size}
    stroke={color}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);

export default LockIcon;
