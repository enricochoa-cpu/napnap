import { useState, useEffect } from 'react';
import type { SleepEntry } from '../types';

type FormMode = 'nap' | 'night' | 'wakeup';

// Helper to extract time (HH:mm) from datetime string
const extractTime = (datetime: string): string => {
  if (!datetime) return '';
  const timePart = datetime.split('T')[1];
  return timePart ? timePart.substring(0, 5) : '';
};

// Helper to combine date and time into datetime string
const combineDateTime = (date: string, time: string): string => {
  return `${date}T${time}`;
};

// Helper to get current time as HH:mm
const getCurrentTime = (): string => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Helper to get next day date string
const getNextDay = (date: string): string => {
  const d = new Date(date);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

// Helper to compare times (returns true if time1 > time2)
const isTimeBefore = (time1: string, time2: string): boolean => {
  return time1 < time2;
};

interface SleepFormProps {
  entry?: SleepEntry | null;
  onSubmit: (data: Omit<SleepEntry, 'id' | 'date'>) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
  selectedDate: string;
}

export function SleepForm({ entry, onSubmit, onCancel, onDelete, selectedDate }: SleepFormProps) {
  const [mode, setMode] = useState<FormMode>(entry?.type || 'nap');
  const [startTime, setStartTime] = useState(() => {
    if (entry) return extractTime(entry.startTime);
    return getCurrentTime();
  });
  const [endTime, setEndTime] = useState(() => {
    if (entry?.endTime) return extractTime(entry.endTime);
    return '';
  });
  const [error, setError] = useState<string | null>(null);

  // Reset times when mode changes (only for new entries)
  useEffect(() => {
    if (!entry) {
      const now = new Date();
      const selectedDateObj = new Date(selectedDate);
      const isToday = selectedDateObj.toDateString() === now.toDateString();
      const currentTime = getCurrentTime();

      if (mode === 'wakeup') {
        // For wake up, default to current time or 07:00
        setStartTime(''); // Not used for wakeup
        setEndTime(isToday ? currentTime : '07:00');
      } else if (mode === 'nap') {
        setStartTime(isToday ? currentTime : '12:00');
        setEndTime('');
      } else {
        // Bedtime - default to 20:00 for start
        setStartTime('20:00');
        setEndTime('');
      }
    }
  }, [mode, entry, selectedDate]);

  // Update times when entry changes (editing)
  useEffect(() => {
    if (entry) {
      setStartTime(extractTime(entry.startTime));
      setEndTime(entry.endTime ? extractTime(entry.endTime) : '');
      setMode(entry.type);
    }
  }, [entry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'wakeup') {
      // For wake-up, create a night sleep entry
      // Bedtime is estimated as 10 hours before wake-up
      const wakeupDateTime = combineDateTime(selectedDate, endTime);
      const wakeupDate = new Date(wakeupDateTime);
      const bedtimeDate = new Date(wakeupDate.getTime() - 10 * 60 * 60 * 1000);

      onSubmit({
        startTime: bedtimeDate.toISOString().slice(0, 16),
        endTime: wakeupDateTime,
        type: 'night',
      });
    } else if (mode === 'nap') {
      // For naps, both times are on selectedDate
      // Validate that end > start
      if (endTime && isTimeBefore(endTime, startTime)) {
        setError('End time must be after start time for naps');
        return;
      }

      onSubmit({
        startTime: combineDateTime(selectedDate, startTime),
        endTime: endTime ? combineDateTime(selectedDate, endTime) : null,
        type: 'nap',
      });
    } else {
      // For night/bedtime
      // If end time < start time, end is next day (crossed midnight)
      const startDateTime = combineDateTime(selectedDate, startTime);
      let endDateTime: string | null = null;

      if (endTime) {
        if (isTimeBefore(endTime, startTime)) {
          // Crossed midnight - end time is next day
          endDateTime = combineDateTime(getNextDay(selectedDate), endTime);
        } else {
          endDateTime = combineDateTime(selectedDate, endTime);
        }
      }

      onSubmit({
        startTime: startDateTime,
        endTime: endDateTime,
        type: 'night',
      });
    }
  };

  const handleDelete = () => {
    if (entry && onDelete && confirm('Delete this sleep entry?')) {
      onDelete(entry.id);
      onCancel();
    }
  };

  return (
    <div className="card p-6">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-display-sm">
          {entry ? 'Edit Sleep Entry' : 'Add Sleep Entry'}
        </h2>
        {entry && onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            className="p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--danger-color)] hover:bg-[var(--danger-color)]/10 transition-colors"
            title="Delete"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Sleep Type Toggle */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3 font-display">
            Entry Type
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setMode('wakeup')}
              className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                mode === 'wakeup'
                  ? 'border-[var(--wake-color)] bg-[var(--wake-color)]/10'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <svg className={`w-8 h-8 ${mode === 'wakeup' ? 'text-[var(--wake-color)]' : 'text-[var(--text-muted)]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className={`font-display font-medium text-sm ${mode === 'wakeup' ? 'text-[var(--wake-color)]' : 'text-[var(--text-muted)]'}`}>
                Woke Up
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMode('nap')}
              className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                mode === 'nap'
                  ? 'border-[var(--nap-color)] bg-[var(--nap-color)]/10'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <svg className={`w-8 h-8 ${mode === 'nap' ? 'text-[var(--nap-color)]' : 'text-[var(--text-muted)]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
              <span className={`font-display font-medium text-sm ${mode === 'nap' ? 'text-[var(--nap-color)]' : 'text-[var(--text-muted)]'}`}>
                Nap
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMode('night')}
              className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                mode === 'night'
                  ? 'border-[var(--night-color)] bg-[var(--night-color)]/10'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <svg className={`w-8 h-8 ${mode === 'night' ? 'text-[var(--night-color)]' : 'text-[var(--text-muted)]'}`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              <span className={`font-display font-medium text-sm ${mode === 'night' ? 'text-[var(--night-color)]' : 'text-[var(--text-muted)]'}`}>
                Bedtime
              </span>
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-xl bg-[var(--danger-color)]/10 text-[var(--danger-color)] text-sm font-medium">
            {error}
          </div>
        )}

        {/* Wake Up mode - only end time (wake up time) */}
        {mode === 'wakeup' && (
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
              Wake Up Time
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              className="input"
            />
          </div>
        )}

        {/* Nap mode - start and end time side by side */}
        {mode === 'nap' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
                Start
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
                End
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="input"
                placeholder="Still sleeping"
              />
            </div>
          </div>
        )}

        {/* Night/Bedtime mode - start (bedtime) and end (wake up) side by side */}
        {mode === 'night' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
                Bedtime
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
                Wake Up
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="input"
                placeholder="Still sleeping"
              />
            </div>
          </div>
        )}

        {/* Hint for bedtime crossing midnight */}
        {mode === 'night' && endTime && isTimeBefore(endTime, startTime) && (
          <p className="text-xs text-[var(--text-muted)] -mt-2">
            Wake up time is on the next day
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className={`btn flex-1 ${
              mode === 'wakeup' ? 'btn-wake' : mode === 'nap' ? 'btn-nap' : 'btn-night'
            }`}
          >
            {entry ? 'Save Changes' : mode === 'wakeup' ? 'Log Wake Up' : 'Add Entry'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-ghost"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
