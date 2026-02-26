import { useId, type ReactNode } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface ConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  confirmVariant?: 'danger' | 'primary';
  icon?: ReactNode;
}

const TrashIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

export function ConfirmationModal({
  isOpen,
  onConfirm,
  onCancel,
  title,
  description,
  confirmLabel = 'Delete',
  confirmVariant = 'danger',
  icon,
}: ConfirmationModalProps) {
  const titleId = useId();
  const dialogRef = useFocusTrap(isOpen, onCancel);

  if (!isOpen) return null;

  const confirmBg = confirmVariant === 'danger' ? 'var(--danger-color)' : 'var(--nap-color)';

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{
              background: `color-mix(in srgb, ${confirmBg} 20%, transparent)`,
              color: confirmBg,
            }}
          >
            {icon || <TrashIcon />}
          </div>
        </div>

        {/* Title */}
        <h3 id={titleId} className="text-xl font-display font-bold text-[var(--text-primary)] text-center mb-2">
          {title}
        </h3>

        {/* Description */}
        <p className="text-[var(--text-muted)] text-sm text-center mb-6">
          {description}
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="btn btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`btn flex-1 ${confirmVariant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
