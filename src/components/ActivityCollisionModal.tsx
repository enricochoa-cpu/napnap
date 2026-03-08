import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import type { SleepEntry } from '../types';
import { formatTime } from '../utils/dateUtils';
import { format, parseISO } from 'date-fns';
import { useFocusTrap } from '../hooks/useFocusTrap';

// Format date for display in collision modal
function formatEntryDate(dateTime: string): string {
  const date = parseISO(dateTime);
  return format(date, 'MMM d, yyyy');
}

interface ActivityCollisionModalProps {
  existingEntry: SleepEntry;
  onReplace: () => void;
  onCancel: () => void;
  /** When provided, shows an "Adjust times" button that re-opens the entry sheet with the pending data */
  onAdjust?: () => void;
}

export function ActivityCollisionModal({
  existingEntry,
  onReplace,
  onCancel,
  onAdjust,
}: ActivityCollisionModalProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const dialogRef = useFocusTrap(true, onCancel);

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
        {/* Warning Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-[var(--wake-color)]/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[var(--wake-color)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 id={titleId} className="text-display-sm text-center mb-2">{t('collision.activityCollision')}</h2>

        {/* Description */}
        <p className="text-[var(--text-secondary)] text-center mb-6">
          {t('collision.thisTimeOverlaps')}{' '}
          <span className={existingEntry.type === 'nap' ? 'text-[var(--nap-color)]' : 'text-[var(--night-color)]'}>
            {existingEntry.type === 'nap' ? t('sleepEntry.nap').toLowerCase() : t('sleepEntry.nightSleep').toLowerCase()}
          </span>{' '}
          {t('collision.from')}{' '}
          <span className="text-[var(--text-primary)] font-medium">
            {formatEntryDate(existingEntry.startTime)}
          </span>
          {!existingEntry.endTime && (
            <span className="text-[var(--success-color)]"> {t('collision.stillOngoing')}</span>
          )}
        </p>

        {/* Existing Entry Preview */}
        <div className="card p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              existingEntry.type === 'nap'
                ? 'bg-[var(--nap-color)]/20'
                : 'bg-[var(--night-color)]/20'
            }`}>
              {existingEntry.type === 'nap' ? (
                <svg className="w-5 h-5 text-[var(--nap-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-[var(--night-color)]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </div>
            <div>
              <p className="font-display font-medium text-[var(--text-primary)]">
                {formatEntryDate(existingEntry.startTime)} at {formatTime(existingEntry.startTime)}
                {existingEntry.endTime && ` → ${formatTime(existingEntry.endTime)}`}
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                {existingEntry.type === 'nap' ? t('sleepEntry.nap') : t('sleepEntry.nightSleep')}
                {!existingEntry.endTime && ` ${t('collision.stillOngoingShort')}`}
              </p>
            </div>
          </div>
        </div>

        {/* Actions — stacked: Replace (danger), Adjust (ghost), Cancel (text) */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onReplace}
            className="btn btn-danger w-full min-h-[48px]"
          >
            {t('collision.replaceEntry')}
          </button>
          {onAdjust && (
            <button
              onClick={onAdjust}
              className="btn btn-ghost w-full min-h-[48px] inline-flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              {t('collision.adjustTimes')}
            </button>
          )}
          <button
            onClick={onCancel}
            className="w-full py-2 min-h-[48px] text-[var(--text-muted)] font-display font-medium text-sm transition-colors hover:text-[var(--text-secondary)]"
          >
            {t('collision.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
