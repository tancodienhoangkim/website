export function IconGradientDefs() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={0}
      height={0}
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
    >
      <defs>
        <linearGradient id="icon-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F1E075" />
          <stop offset="100%" stopColor="#AE7F41" />
        </linearGradient>
      </defs>
    </svg>
  );
}
