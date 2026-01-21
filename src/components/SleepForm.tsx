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
  selectedDate: string;
}

export function SleepForm({ entry, onSubmit, onCancel, selectedDate }: SleepFormProps) {
  const [mode, setMode] = useState<FormMode>(entry?.type || 'nap');
  const [formData, setFormData] = useState({
    // For naps: just store time (HH:mm)
    napStartTime: entry ? extractTime(entry.startTime) : getCurrentTime(),
    napEndTime: entry?.endTime ? extractTime(entry.endTime) : '',
    // For night/wakeup: store full datetime
    startTime: entry?.startTime || formatDateTime(new Date()),
    endTime: entry?.endTime || '',
    wakeupTime: formatDateTime(new Date()),
    notes: entry?.notes || '',
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
        notes: formData.notes || undefined,
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
        notes: formData.notes || undefined,
      });
    } else {
      // For night/bedtime, use full datetime
      onSubmit({
        startTime: formData.startTime,
        endTime: formData.endTime || null,
        type: mode,
        notes: formData.notes || undefined,
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

  return (
    <div className="card p-6">
      <h2 className="text-display-sm mb-6">
        {entry ? 'Edit Sleep Entry' : 'Add Sleep Entry'}
      </h2>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
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

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
            Notes
            <span className="text-[var(--text-muted)] font-normal ml-2">(optional)</span>
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={2}
            className="input resize-none"
            placeholder="Any notes about this sleep..."
          />
        </div>

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
