import type { SVGProps } from 'react';

type Props = SVGProps<SVGSVGElement> & { size?: number };

export function Messenger({ size = 16, className, ...props }: Props) {
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
      <path d="M12 2C6.48 2 2 6.14 2 11.25c0 2.88 1.46 5.44 3.74 7.13V22l3.42-1.88c.91.25 1.87.38 2.84.38 5.52 0 10-4.14 10-9.25S17.52 2 12 2z" />
      <polyline points="6 13.5 9.5 10 11.5 12 16 8.5" />
    </svg>
  );
}
