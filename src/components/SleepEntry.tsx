import type { SleepEntry as SleepEntryType } from '../types';
import { formatTime, calculateDuration, formatDuration } from '../utils/dateUtils';

interface MilestoneCardProps {
  time: string;
}

// Wake-up milestone card
export function MilestoneCard({ time }: MilestoneCardProps) {
  // Currently only handles wake-up type
  return (
    <div className="card overflow-hidden">
      <div className="flex">
        {/* Vertical color bar */}
        <div className="w-1 flex-shrink-0 bg-[var(--wake-color)]" />

        <div className="flex items-center gap-4 p-4 flex-1">
          {/* Icon */}
          <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-[var(--wake-color)]/15">
            {/* Sun icon for wake-up */}
            <svg className="w-6 h-6 text-[var(--wake-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="font-display font-medium text-sm text-[var(--wake-color)]">
              Wake up
            </p>
            <p className="font-display font-semibold text-[var(--text-primary)] text-lg">
              {formatTime(time)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SleepEntryProps {
  entry: SleepEntryType;
  onEdit: (entry: SleepEntryType) => void;
  onDelete: (id: string) => void;
  onEndSleep: (id: string) => void;
}

export function SleepEntryCard({ entry, onEdit, onDelete, onEndSleep }: SleepEntryProps) {
  const isActive = entry.endTime === null;
  const isNight = entry.type === 'night';
  const duration = calculateDuration(entry.startTime, entry.endTime);

  // Night entries show as bedtime cards with orange color
  const barColor = isNight ? 'bg-[#ff7e5f]' : 'bg-[var(--nap-color)]';
  const iconBgColor = isNight ? 'bg-[#ff7e5f]/15' : 'bg-[var(--nap-color)]/15';
  const iconColor = isNight ? 'text-[#ff7e5f]' : 'text-[var(--nap-color)]';

  return (
    <div className={`card overflow-hidden ${isActive ? 'ring-1 ring-[var(--success-color)]/30' : ''}`}>
      <div className="flex">
        {/* Vertical color bar */}
        <div className={`w-1 ${barColor} flex-shrink-0`} />

        <div className="flex items-center gap-4 p-4 flex-1">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${iconBgColor}`}>
            {isNight ? (
              // Sunset icon for bedtime
              <svg className={`w-6 h-6 ${iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 12a5 5 0 01-5 5m5-5a5 5 0 00-5-5m5 5H7" />
                <line x1="4" y1="19" x2="20" y2="19" strokeWidth={2} strokeLinecap="round" />
              </svg>
            ) : (
              // Sun icon for nap
              <svg className={`w-6 h-6 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Label for night entries */}
            {isNight && (
              <p className={`font-display font-medium text-sm ${iconColor}`}>
                Bedtime
              </p>
            )}

            <div className="flex items-baseline gap-2">
              <span className="font-display font-semibold text-[var(--text-primary)] text-lg">
                {formatTime(entry.startTime)}
              </span>
              {/* Show end time for naps, not for night (since wake-up is separate) */}
              {!isNight && entry.endTime && (
                <>
                  <span className="text-[var(--text-muted)]">→</span>
                  <span className="font-display font-semibold text-[var(--text-primary)] text-lg">
                    {formatTime(entry.endTime)}
                  </span>
                </>
              )}
            </div>

            {/* Duration/status line */}
            {isNight ? (
              isActive && (
                <p className="text-sm text-[var(--success-color)] mt-1">
                  Sleeping...
                </p>
              )
            ) : (
              <p className="text-sm text-[var(--text-muted)] mt-1">
                {formatDuration(duration)}
                {isActive && <span className="text-[var(--success-color)]"> (ongoing)</span>}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {isActive && (
              <button
                onClick={() => onEndSleep(entry.id)}
                className="p-2 rounded-full bg-[var(--wake-color)]/10 text-[var(--wake-color)] hover:bg-[var(--wake-color)]/20 transition-colors"
                title="Wake up"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </button>
            )}
            <button
              onClick={() => onEdit(entry)}
              className="p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-white/5 transition-colors"
              title="Edit"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(entry.id)}
              className="p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--danger-color)] hover:bg-[var(--danger-color)]/10 transition-colors"
              title="Delete"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
