import type { SleepEntry as SleepEntryType } from '../types';
import { useTranslation } from 'react-i18next';
import { formatTime, calculateDuration, formatDuration } from '../utils/dateUtils';


// Shared props for action buttons
interface EntryActionsProps {
  entry: SleepEntryType;
  onEndSleep?: (id: string) => void;
}

// Action buttons component - only shows wake up button for active entries
function EntryActions({ entry, onEndSleep }: EntryActionsProps) {
  const isActive = entry.endTime === null;

  if (!isActive || !onEndSleep) return null;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onEndSleep(entry.id);
      }}
      className="p-3 rounded-full bg-[var(--wake-color)]/15 text-[var(--wake-color)] active:scale-90 transition-transform"
      title={undefined}
    >
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    </button>
  );
}

// Bedtime Entry Component
interface BedtimeEntryProps {
  entry: SleepEntryType;
  onEdit: (entry: SleepEntryType) => void;
  onEndSleep: (id: string) => void;
}

export function BedtimeEntry({ entry, onEdit, onEndSleep }: BedtimeEntryProps) {
  const { t } = useTranslation();
  const isActive = entry.endTime === null;

  return (
    <div
      className={`card-bedtime cursor-pointer active:opacity-90 transition-opacity ${isActive ? 'ring-2 ring-[var(--success-color)]/30' : ''}`}
      onClick={() => onEdit(entry)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onEdit(entry);
        }
      }}
    >
      <div className="flex items-center gap-4 p-5">
        {/* Icon */}
        <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-[var(--night-color)]/20">
          <svg className="w-6 h-6 text-[var(--night-color)]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 12a5 5 0 01-5 5m5-5a5 5 0 00-5-5m5 5H7" />
            <line x1="4" y1="19" x2="20" y2="19" strokeWidth={2.5} strokeLinecap="round" />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-[var(--text-primary)]">
            {t('sleepEntrySheet.addBedtime')}
          </p>
          {isActive && (
            <p className="text-sm text-[var(--success-color)] font-medium">
              {t('sleepEntry.sleeping')}
            </p>
          )}
        </div>

        {/* Time */}
        <span className="font-display font-semibold text-lg text-[var(--text-primary)]">
          {formatTime(entry.startTime)}
        </span>

        {/* Actions */}
        <EntryActions entry={entry} onEndSleep={onEndSleep} />
      </div>
    </div>
  );
}

// Nap Entry Component
interface NapEntryProps {
  entry: SleepEntryType;
  napNumber: number;
  onEdit: (entry: SleepEntryType) => void;
  onEndSleep: (id: string) => void;
}

export function NapEntry({ entry, napNumber, onEdit, onEndSleep }: NapEntryProps) {
  const { t } = useTranslation();
  const isActive = entry.endTime === null;
  const duration = calculateDuration(entry.startTime, entry.endTime);
  const napLabel =
    napNumber === 1
      ? t('stats.napFirst')
      : napNumber === 2
        ? t('stats.napSecond')
        : napNumber === 3
          ? t('stats.napThird')
          : t('stats.napOrdinal', { n: napNumber });

  return (
    <div
      className={`card-nap cursor-pointer active:opacity-90 transition-opacity ${isActive ? 'ring-2 ring-[var(--success-color)]/30' : ''}`}
      onClick={() => onEdit(entry)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onEdit(entry);
        }
      }}
    >
      <div className="flex items-center gap-4 p-5">
        {/* Icon - cloud for naps */}
        <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-[var(--nap-color)]/20">
          <svg className="w-6 h-6 text-[var(--nap-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-[var(--text-primary)]">
            {napLabel}
          </p>
          <p className="text-sm text-[var(--text-secondary)]">
            {formatDuration(duration)}
            {isActive && <span className="text-[var(--success-color)] font-medium"> {t('sleepEntry.ongoing')}</span>}
          </p>
        </div>

        {/* Time range */}
        <span className="font-display font-semibold text-lg text-[var(--text-primary)]">
          {formatTime(entry.startTime)}
          {entry.endTime && ` – ${formatTime(entry.endTime)}`}
        </span>

        {/* Actions */}
        <EntryActions entry={entry} onEndSleep={onEndSleep} />
      </div>
    </div>
  );
}

// Wake Up Entry Component
interface WakeUpEntryProps {
  time: string;
}

export function WakeUpEntry({ time }: WakeUpEntryProps) {
  const { t } = useTranslation();
  return (
    <div className="card-wake">
      <div className="flex items-center gap-4 p-5">
        {/* Icon - sun for wake-up */}
        <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-[var(--wake-color)]/20">
          <svg className="w-6 h-6 text-[var(--wake-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-[var(--text-primary)]">
          {t('sleepEntry.wakeUp')}
          </p>
        </div>

        {/* Time */}
        <span className="font-display font-semibold text-lg text-[var(--text-primary)]">
          {formatTime(time)}
        </span>
      </div>
    </div>
  );
}

// Wake Window Separator Component (auto-calculated, between entries)
interface WakeWindowSeparatorProps {
  durationMinutes: number;
}

export function WakeWindowSeparator({ durationMinutes }: WakeWindowSeparatorProps) {
  const { t } = useTranslation();
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  const durationText = hours > 0
    ? `${hours}h ${minutes.toString().padStart(2, '0')}m`
    : `${minutes}m`;

  return (
    <div className="flex items-center justify-center gap-3 py-3 px-4">
      {/* Small moon icon */}
      <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>

      <span className="text-sm text-[var(--text-muted)] font-medium">
        {t('today.awakeFor')} {durationText}
      </span>
    </div>
  );
}

// Night Sleep Summary Component (shows total night sleep duration)
interface NightSleepSummaryProps {
  durationMinutes: number;
}

export function NightSleepSummary({ durationMinutes }: NightSleepSummaryProps) {
  const { t } = useTranslation();
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  const durationText = `${hours}h ${minutes.toString().padStart(2, '0')}m`;

  return (
    <div className="flex items-center justify-center gap-3 py-3 px-4">
      {/* Crescent moon icon */}
      <svg className="w-5 h-5 text-[var(--night-color)]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>

      <span className="text-sm text-[var(--text-secondary)] font-medium">
        {t('sleepEntry.nightSleep')} {durationText}
      </span>
    </div>
  );
}

