import { useState, useEffect, useMemo } from 'react';
import type { SleepEntry } from '../types';

type SleepType = 'nap' | 'night';

interface SleepEntrySheetProps {
  entry?: SleepEntry | null;
  initialType?: SleepType;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<SleepEntry, 'id' | 'date'>) => void;
  onDelete?: (id: string) => void;
  selectedDate: string;
}

// Icons
const CloudIcon = () => (
  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
  </svg>
);

const MoonIcon = () => (
  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

// Helpers
const extractTime = (datetime: string): string => {
  if (!datetime) return '';
  const timePart = datetime.split('T')[1];
  return timePart ? timePart.substring(0, 5) : '';
};

const getCurrentTime = (): string => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
};

const combineDateTime = (date: string, time: string): string => {
  return `${date}T${time}`;
};

const getNextDay = (date: string): string => {
  const d = new Date(date);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

const getPreviousDay = (date: string): string => {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

const isTimeBefore = (time1: string, time2: string): boolean => {
  return time1 < time2;
};

// Calculate duration between two times
const calculateDuration = (startTime: string, endTime: string | null): string => {
  if (!startTime || !endTime) return '--:--';

  // Parse times
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  let startMinutes = startH * 60 + startM;
  let endMinutes = endH * 60 + endM;

  // If end is before start, it crossed midnight
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }

  const diffMinutes = endMinutes - startMinutes;
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
};

export function SleepEntrySheet({
  entry,
  initialType = 'nap',
  isOpen,
  onClose,
  onSave,
  onDelete,
  selectedDate,
}: SleepEntrySheetProps) {
  const isEditing = !!entry;
  const sleepType: SleepType = entry?.type || initialType;

  // Initial values for comparison
  const initialStartTime = entry ? extractTime(entry.startTime) : getCurrentTime();
  const initialEndTime = entry?.endTime ? extractTime(entry.endTime) : '';

  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);

  // Reset when entry changes or sheet opens
  useEffect(() => {
    if (isOpen) {
      if (entry) {
        setStartTime(extractTime(entry.startTime));
        setEndTime(entry.endTime ? extractTime(entry.endTime) : '');
      } else {
        setStartTime(getCurrentTime());
        setEndTime('');
      }
    }
  }, [entry, isOpen]);

  // Check if values have changed
  const hasChanges = useMemo(() => {
    const currentInitialStart = entry ? extractTime(entry.startTime) : '';
    const currentInitialEnd = entry?.endTime ? extractTime(entry.endTime) : '';

    if (!entry) {
      // For new entries, always allow save if there's a start time
      return !!startTime;
    }

    return startTime !== currentInitialStart || endTime !== currentInitialEnd;
  }, [entry, startTime, endTime]);

  // Calculate duration in real-time
  const duration = useMemo(() => {
    return calculateDuration(startTime, endTime);
  }, [startTime, endTime]);

  const handleSave = () => {
    if (!hasChanges && isEditing) return;

    if (sleepType === 'nap') {
      let endDateTime: string | null = null;
      if (endTime) {
        if (isTimeBefore(endTime, startTime)) {
          endDateTime = combineDateTime(getNextDay(selectedDate), endTime);
        } else {
          endDateTime = combineDateTime(selectedDate, endTime);
        }
      }
      onSave({
        startTime: combineDateTime(selectedDate, startTime),
        endTime: endDateTime,
        type: 'nap',
      });
    } else {
      // Night sleep
      const [startHour] = startTime.split(':').map(Number);
      const isPostMidnightBedtime = startHour >= 0 && startHour <= 3;
      const bedtimeDate = isPostMidnightBedtime ? getPreviousDay(selectedDate) : selectedDate;

      let endDateTime: string | null = null;
      if (endTime) {
        if (isTimeBefore(endTime, startTime)) {
          endDateTime = combineDateTime(getNextDay(bedtimeDate), endTime);
        } else if (isPostMidnightBedtime) {
          endDateTime = combineDateTime(selectedDate, endTime);
        } else {
          endDateTime = combineDateTime(bedtimeDate, endTime);
        }
      }

      onSave({
        startTime: combineDateTime(bedtimeDate, startTime),
        endTime: endDateTime,
        type: 'night',
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (entry && onDelete && confirm('Delete this sleep entry?')) {
      onDelete(entry.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  const themeColor = sleepType === 'nap' ? 'var(--nap-color)' : 'var(--night-color)';
  const themeBg = sleepType === 'nap' ? 'var(--nap-color)' : 'var(--night-color)';
  const typeLabel = sleepType === 'nap' ? 'Nap' : 'Night Sleep';

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 fade-in"
        onClick={onClose}
      />

      {/* Bottom Sheet - 50% height */}
      <div className="fixed bottom-0 left-0 right-0 z-50 slide-up">
        <div
          className="bg-[var(--bg-card)] rounded-t-[2rem] shadow-[0_-8px_40px_rgba(0,0,0,0.3)]"
          style={{ minHeight: '50vh' }}
        >
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-[var(--text-muted)]/30 rounded-full" />
          </div>

          {/* Header with delete and close */}
          <div className="flex items-center justify-between px-6 pb-2">
            {/* Delete button (left) - subtle, only highlights on hover */}
            {isEditing && onDelete ? (
              <button
                onClick={handleDelete}
                className="p-2 -ml-2 rounded-xl text-[var(--text-muted)]/60 hover:text-[#B07D7D] hover:bg-[#B07D7D]/10 transition-colors"
                aria-label="Delete"
              >
                <TrashIcon />
              </button>
            ) : (
              <div className="w-9" />
            )}

            {/* Close button (right) */}
            <button
              onClick={onClose}
              className="p-2 -mr-2 rounded-xl text-[var(--text-muted)] hover:bg-[var(--text-muted)]/10 transition-colors"
              aria-label="Close"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Center: Type icon and label */}
          <div className="flex flex-col items-center pb-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-3"
              style={{
                backgroundColor: `color-mix(in srgb, ${themeBg} 15%, transparent)`,
                color: themeColor
              }}
            >
              {sleepType === 'nap' ? <CloudIcon /> : <MoonIcon />}
            </div>
            <span
              className="font-display font-semibold text-lg"
              style={{ color: themeColor }}
            >
              {typeLabel}
            </span>
          </div>

          {/* Time inputs - large, horizontal */}
          <div className="px-6 pb-4">
            <div className="flex items-center justify-center gap-4">
              {/* Start Time */}
              <div className="flex-1 text-center">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full text-center text-5xl font-display font-bold text-[var(--text-primary)] bg-transparent border-none outline-none appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-datetime-edit-fields-wrapper]:p-0"
                  style={{
                    fontSize: '2.75rem',
                    lineHeight: 1.2,
                  }}
                />
                <p className="text-xs text-[var(--text-muted)] mt-1 uppercase tracking-wider">
                  {sleepType === 'nap' ? 'Start' : 'Bedtime'}
                </p>
              </div>

              {/* Separator */}
              <div className="text-3xl text-[var(--text-muted)] font-light pb-5">→</div>

              {/* End Time */}
              <div className="flex-1 text-center">
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  placeholder="--:--"
                  className="w-full text-center text-5xl font-display font-bold bg-transparent border-none outline-none appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-datetime-edit-fields-wrapper]:p-0"
                  style={{
                    fontSize: '2.75rem',
                    lineHeight: 1.2,
                    color: endTime ? 'var(--text-primary)' : 'var(--text-muted)',
                  }}
                />
                <p className="text-xs text-[var(--text-muted)] mt-1 uppercase tracking-wider">
                  {sleepType === 'nap' ? 'End' : 'Wake up'}
                </p>
              </div>
            </div>

            {/* Duration or Sleeping status */}
            <div className="text-center mt-6">
              {endTime ? (
                <>
                  <p className="text-2xl font-display font-semibold" style={{ color: themeColor }}>
                    {duration}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Duration</p>
                </>
              ) : (
                <p className="text-lg font-display text-[var(--text-muted)] italic">
                  Sleeping...
                </p>
              )}
            </div>

            {/* Hint for crossing midnight */}
            {endTime && isTimeBefore(endTime, startTime) && (
              <p className="text-xs text-[var(--text-muted)] text-center mt-3">
                {sleepType === 'nap' ? 'Ends next day' : 'Wake up is next day'}
              </p>
            )}
          </div>

          {/* Save button - circular tick */}
          <div className="flex justify-center pb-8 pt-4">
            <button
              onClick={handleSave}
              disabled={isEditing && !hasChanges}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                (!isEditing || hasChanges)
                  ? 'shadow-lg active:scale-95'
                  : 'opacity-40 cursor-not-allowed'
              }`}
              style={{
                backgroundColor: (!isEditing || hasChanges) ? themeBg : 'var(--text-muted)',
                color: sleepType === 'night' ? 'white' : 'var(--bg-deep)',
              }}
              aria-label="Save"
            >
              <CheckIcon />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
