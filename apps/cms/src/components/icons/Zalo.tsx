import type { SVGProps } from 'react';

type Props = SVGProps<SVGSVGElement> & { size?: number };

export function Zalo({ size = 16, className, ...props }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="url(#icon-gold)"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      role="img"
      className={className}
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="4" ry="4" />
      <path d="M8 9h8l-8 6h8" />
    </svg>
  );
}
