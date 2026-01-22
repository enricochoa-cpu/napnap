import type { SleepEntry as SleepEntryType } from '../types';
import { formatTime, calculateDuration, formatDuration } from '../utils/dateUtils';

// Get nap ordinal label in English
function getNapOrdinal(num: number): string {
  const ordinals = ['First', 'Second', 'Third', 'Fourth', 'Fifth'];
  return ordinals[num - 1] || `${num}th`;
}

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
    <div className="flex items-center gap-1">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEndSleep(entry.id);
        }}
        className="p-2 rounded-full bg-[var(--wake-color)]/10 text-[var(--wake-color)] hover:bg-[var(--wake-color)]/20 transition-colors"
        title="Wake up"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </button>
    </div>
  );
}

// Bedtime Entry Component
interface BedtimeEntryProps {
  entry: SleepEntryType;
  onEdit: (entry: SleepEntryType) => void;
  onEndSleep: (id: string) => void;
}

export function BedtimeEntry({ entry, onEdit, onEndSleep }: BedtimeEntryProps) {
  const isActive = entry.endTime === null;

  return (
    <div className={`relative rounded-xl bg-[#ff7e5f]/10 overflow-hidden ${isActive ? 'ring-1 ring-[var(--success-color)]/30' : ''}`}>
      {/* Left color bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ff7e5f]" />

      <div className="flex items-center gap-4 py-4 pl-5 pr-4">
        {/* Tappable content area */}
        <button
          onClick={() => onEdit(entry)}
          className="flex items-center gap-4 flex-1 min-w-0 text-left"
        >
          {/* Icon */}
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-[#ff7e5f]/20">
            <svg className="w-5 h-5 text-[#ff7e5f]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 12a5 5 0 01-5 5m5-5a5 5 0 00-5-5m5 5H7" />
              <line x1="4" y1="19" x2="20" y2="19" strokeWidth={2} strokeLinecap="round" />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-white">
              Bedtime
            </p>
            {isActive && (
              <p className="text-sm text-[var(--success-color)]">
                Sleeping...
              </p>
            )}
          </div>

          {/* Time */}
          <span className="font-display text-lg text-[var(--text-primary)]">
            {formatTime(entry.startTime)}
          </span>
        </button>

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
  const isActive = entry.endTime === null;
  const duration = calculateDuration(entry.startTime, entry.endTime);

  return (
    <div className={`relative rounded-xl bg-[var(--night-color)]/10 overflow-hidden ${isActive ? 'ring-1 ring-[var(--success-color)]/30' : ''}`}>
      {/* Left color bar - purple for naps */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--night-color)]" />

      <div className="flex items-center gap-4 py-4 pl-5 pr-4">
        {/* Tappable content area */}
        <button
          onClick={() => onEdit(entry)}
          className="flex items-center gap-4 flex-1 min-w-0 text-left"
        >
          {/* Icon - cloud for naps */}
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-[var(--night-color)]/20">
            <svg className="w-5 h-5 text-[var(--night-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-white">
              {getNapOrdinal(napNumber)} nap
            </p>
            <p className="text-sm text-white/70">
              {formatDuration(duration)}
              {isActive && <span className="text-[var(--success-color)]"> (ongoing)</span>}
            </p>
          </div>

          {/* Time range */}
          <span className="font-display text-lg text-[var(--text-primary)]">
            {formatTime(entry.startTime)}
            {entry.endTime && ` - ${formatTime(entry.endTime)}`}
          </span>
        </button>

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
  return (
    <div className="relative rounded-xl bg-[var(--wake-color)]/10 overflow-hidden">
      {/* Left color bar - gold for wake-up */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--wake-color)]" />

      <div className="flex items-center gap-4 py-4 pl-5 pr-4">
        {/* Icon - sun for wake-up */}
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-[var(--wake-color)]/20">
          <svg className="w-5 h-5 text-[var(--wake-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-white">
            Wake up
          </p>
        </div>

        {/* Time */}
        <span className="font-display text-lg text-[var(--text-primary)]">
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
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  const durationText = hours > 0
    ? `${hours}h ${minutes.toString().padStart(2, '0')}m`
    : `${minutes}m`;

  return (
    <div className="flex items-center justify-center gap-3 py-2 px-4">
      {/* Small moon icon */}
      <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>

      <span className="text-sm text-[var(--text-muted)]">
        End of wake window of {durationText}
      </span>
    </div>
  );
}

// Night Sleep Summary Component (shows total night sleep duration)
interface NightSleepSummaryProps {
  durationMinutes: number;
}

export function NightSleepSummary({ durationMinutes }: NightSleepSummaryProps) {
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  const durationText = `${hours}h ${minutes.toString().padStart(2, '0')}m`;

  return (
    <div className="flex items-center justify-center gap-3 py-2 px-4">
      {/* Crescent moon icon */}
      <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>

      <span className="text-sm text-[var(--text-secondary)]">
        End of sleep session of {durationText}
      </span>
    </div>
  );
}

// Legacy exports for backward compatibility during transition
export { WakeUpEntry as MilestoneCard };

interface SleepEntryProps {
  entry: SleepEntryType;
  onEdit: (entry: SleepEntryType) => void;
  onEndSleep: (id: string) => void;
}

export function SleepEntryCard({ entry, onEdit, onEndSleep }: SleepEntryProps) {
  // This is now a wrapper that delegates to the appropriate component
  if (entry.type === 'night') {
    return <BedtimeEntry entry={entry} onEdit={onEdit} onEndSleep={onEndSleep} />;
  }
  // For naps, default to nap number 1 (SleepList will use NapEntry directly with proper numbering)
  return <NapEntry entry={entry} napNumber={1} onEdit={onEdit} onEndSleep={onEndSleep} />;
}
