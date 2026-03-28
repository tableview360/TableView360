import type { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
}

const UserIcon = ({
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
    fill="none"
    viewBox="0 0 24 24"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

export default UserIcon;
