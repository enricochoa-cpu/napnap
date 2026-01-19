import { useState, useEffect } from 'react';
import type { SleepEntry } from '../types';
import { formatDateTime } from '../utils/dateUtils';

interface SleepFormProps {
  entry?: SleepEntry | null;
  onSubmit: (data: Omit<SleepEntry, 'id' | 'date'>) => void;
  onCancel: () => void;
  selectedDate: string;
}

export function SleepForm({ entry, onSubmit, onCancel, selectedDate }: SleepFormProps) {
  const [formData, setFormData] = useState({
    startTime: entry?.startTime || formatDateTime(new Date()),
    endTime: entry?.endTime || '',
    type: entry?.type || 'nap' as const,
    notes: entry?.notes || '',
  });

  useEffect(() => {
    if (!entry) {
      const now = new Date();
      const selectedDateObj = new Date(selectedDate);

      if (selectedDateObj.toDateString() === now.toDateString()) {
        setFormData((prev) => ({
          ...prev,
          startTime: formatDateTime(now),
        }));
      } else {
        selectedDateObj.setHours(12, 0, 0, 0);
        setFormData((prev) => ({
          ...prev,
          startTime: formatDateTime(selectedDateObj),
        }));
      }
    }
  }, [selectedDate, entry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      startTime: formData.startTime,
      endTime: formData.endTime || null,
      type: formData.type,
      notes: formData.notes || undefined,
    });
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
            Sleep Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, type: 'nap' }))}
              className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                formData.type === 'nap'
                  ? 'border-[var(--nap-color)] bg-[var(--nap-color)]/10'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <svg className={`w-8 h-8 ${formData.type === 'nap' ? 'text-[var(--nap-color)]' : 'text-[var(--text-muted)]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className={`font-display font-medium ${formData.type === 'nap' ? 'text-[var(--nap-color)]' : 'text-[var(--text-muted)]'}`}>
                Nap
              </span>
            </button>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, type: 'night' }))}
              className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                formData.type === 'night'
                  ? 'border-[var(--night-color)] bg-[var(--night-color)]/10'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <svg className={`w-8 h-8 ${formData.type === 'night' ? 'text-[var(--night-color)]' : 'text-[var(--text-muted)]'}`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              <span className={`font-display font-medium ${formData.type === 'night' ? 'text-[var(--night-color)]' : 'text-[var(--text-muted)]'}`}>
                Night
              </span>
            </button>
          </div>
        </div>

        {/* Start Time */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
            Start Time
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

        {/* End Time */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
            End Time
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
          <button type="submit" className="btn btn-nap flex-1">
            {entry ? 'Save Changes' : 'Add Entry'}
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
