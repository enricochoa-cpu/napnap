import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

interface BackButtonProps {
  /** When true, position absolute top-left inside the parent (parent must be positioned). */
  floating?: boolean;
  onClick?: () => void;
  /** Renders an invisible placeholder of the same size — keeps layouts stable when no back is needed. */
  placeholder?: boolean;
}

const SIZE_CLASSES = 'w-9 h-9 min-w-[36px] min-h-[36px]';

export const BackButton: FC<BackButtonProps> = ({ floating, onClick, placeholder }) => {
  const { t } = useTranslation();

  if (placeholder) {
    return <div className={SIZE_CLASSES} aria-hidden="true" style={{ visibility: 'hidden' }} />;
  }

  const positionClass = floating ? 'absolute top-5 left-5 z-10' : '';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t('common.ariaGoBack')}
      className={`${SIZE_CLASSES} ${positionClass} rounded-full flex items-center justify-center text-[var(--text-secondary)] bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
  );
};
