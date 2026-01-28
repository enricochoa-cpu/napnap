import { useState, useEffect } from 'react';
import type { SleepEntry } from '../types';
import { formatDateTime } from '../utils/dateUtils';

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

interface SleepFormProps {
  entry?: SleepEntry | null;
  onSubmit: (data: Omit<SleepEntry, 'id' | 'date'>) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
  selectedDate: string;
}

export function SleepForm({ entry, onSubmit, onCancel, onDelete, selectedDate }: SleepFormProps) {
  const [mode, setMode] = useState<FormMode>(entry?.type || 'nap');
  const [formData, setFormData] = useState({
    // For naps: just store time (HH:mm)
    napStartTime: entry ? extractTime(entry.startTime) : getCurrentTime(),
    napEndTime: entry?.endTime ? extractTime(entry.endTime) : '',
    // For night/wakeup: store full datetime
    startTime: entry?.startTime || formatDateTime(new Date()),
    endTime: entry?.endTime || '',
    wakeupTime: formatDateTime(new Date()),
  });

  useEffect(() => {
    if (!entry) {
      const now = new Date();
      const selectedDateObj = new Date(selectedDate);
      const isToday = selectedDateObj.toDateString() === now.toDateString();

      const currentTime = getCurrentTime();
      const defaultTime = isToday ? currentTime : '12:00';

      setFormData((prev) => ({
        ...prev,
        napStartTime: defaultTime,
        napEndTime: '',
        startTime: isToday ? formatDateTime(now) : formatDateTime(selectedDateObj),
        wakeupTime: isToday ? formatDateTime(now) : formatDateTime(selectedDateObj),
      }));
    }
  }, [selectedDate, entry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'wakeup') {
      // For wake-up, create a night sleep entry with the wake-up time as end time
      // Default bedtime to 10 hours before wake-up
      const wakeupDate = new Date(formData.wakeupTime);
      const bedtimeDate = new Date(wakeupDate.getTime() - 10 * 60 * 60 * 1000);
      onSubmit({
        startTime: formatDateTime(bedtimeDate),
        endTime: formData.wakeupTime,
        type: 'night',
      });
    } else if (mode === 'nap') {
      // For naps, combine selectedDate with time inputs
      const startDateTime = combineDateTime(selectedDate, formData.napStartTime);
      const endDateTime = formData.napEndTime
        ? combineDateTime(selectedDate, formData.napEndTime)
        : null;
      onSubmit({
        startTime: startDateTime,
        endTime: endDateTime,
        type: 'nap',
      });
    } else {
      // For night/bedtime, use full datetime
      onSubmit({
        startTime: formData.startTime,
        endTime: formData.endTime || null,
        type: mode,
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
              {/* Sun icon - same as WakeUpEntry */}
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
                  ? 'border-[var(--night-color)] bg-[var(--night-color)]/10'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              {/* Cloud icon - same as NapEntry */}
              <svg className={`w-8 h-8 ${mode === 'nap' ? 'text-[var(--night-color)]' : 'text-[var(--text-muted)]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
              <span className={`font-display font-medium text-sm ${mode === 'nap' ? 'text-[var(--night-color)]' : 'text-[var(--text-muted)]'}`}>
                Nap
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMode('night')}
              className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                mode === 'night'
                  ? 'border-[#ff7e5f] bg-[#ff7e5f]/10'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              {/* Bedtime/sunset icon - same as BedtimeEntry */}
              <svg className={`w-8 h-8 ${mode === 'night' ? 'text-[#ff7e5f]' : 'text-[var(--text-muted)]'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 12a5 5 0 01-5 5m5-5a5 5 0 00-5-5m5 5H7" />
                <line x1="4" y1="19" x2="20" y2="19" strokeWidth={2} strokeLinecap="round" />
              </svg>
              <span className={`font-display font-medium text-sm ${mode === 'night' ? 'text-[#ff7e5f]' : 'text-[var(--text-muted)]'}`}>
                Bedtime
              </span>
            </button>
          </div>
        </div>

        {/* Wakeup Time - only shown for wakeup mode */}
        {mode === 'wakeup' && (
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
              Wake Up Time
            </label>
            <input
              type="datetime-local"
              name="wakeupTime"
              value={formData.wakeupTime}
              onChange={handleChange}
              required
              className="input"
            />
          </div>
        )}

        {/* Nap time inputs - time only */}
        {mode === 'nap' && (
          <>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
                Start Time
              </label>
              <input
                type="time"
                name="napStartTime"
                value={formData.napStartTime}
                onChange={handleChange}
                required
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
                End Time
                <span className="text-[var(--text-muted)] font-normal ml-2">(leave empty if still sleeping)</span>
              </label>
              <input
                type="time"
                name="napEndTime"
                value={formData.napEndTime}
                onChange={handleChange}
                min={formData.napStartTime}
                className="input"
              />
            </div>
          </>
        )}

        {/* Night/Bedtime inputs - full datetime */}
        {mode === 'night' && (
          <>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
                Bedtime
              </label>
              <input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
                Wake Up Time
                <span className="text-[var(--text-muted)] font-normal ml-2">(leave empty if still sleeping)</span>
              </label>
              <input
                type="datetime-local"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                min={formData.startTime}
                className="input"
              />
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className={`btn flex-1 ${
              mode === 'wakeup' ? 'btn-wake' : mode === 'nap' ? 'btn-night' : 'bg-[#ff7e5f] hover:bg-[#ff7e5f]/90 text-white'
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
