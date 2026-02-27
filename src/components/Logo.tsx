/**
 * NapNap logo — "Rhythmic NN" symbol.
 * Two N-shaped strokes: outer cradle (nap-color) and inner nested shape (night-color).
 * Uses design tokens from the circadian theme system.
 */
interface LogoProps {
  /** Size in pixels. Default: 40. Min 16 for favicon viability per brand guidelines. */
  size?: number;
  /** Additional CSS classes (e.g. for parent color control). */
  className?: string;
  /** 'brand' = two-tone (nap + night); 'mono' = single color for strict brand compliance. */
  variant?: 'brand' | 'mono';
}

export function Logo({ size = 40, className = '', variant = 'brand' }: LogoProps) {
  const isMono = variant === 'mono';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* Protective cradle — outer N-shape */}
      <path
        d="M30 90V45C30 36.7157 36.7157 30 45 30C53.2843 30 60 36.7157 60 45V90"
        stroke="currentColor"
        strokeWidth="14"
        strokeLinecap="round"
        className={isMono ? 'text-[var(--text-primary)]' : 'text-[var(--nap-color)]'}
      />
      {/* Nested baby — inner N-shape */}
      <path
        d="M60 90V75C60 66.7157 66.7157 60 75 60C83.2843 60 90 66.7157 90 75V90"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="round"
        className={
          isMono
            ? 'text-[var(--text-primary)] opacity-60'
            : 'text-[var(--night-color)] opacity-80'
        }
      />
    </svg>
  );
}
