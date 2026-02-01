import { useState } from 'react';

interface MissingBedtimeModalProps {
  onLogBedtime: (date: string) => void;
  onSkip: () => void;
}

// Moon icon for consistency with night sleep theming
const MoonIcon = () => (
  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

// Close X icon
const CloseIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

// Calendar icon
const CalendarIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const getYesterday = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

const formatDateDisplay = (dateStr: string): string => {
  const date = new Date(dateStr + 'T12:00:00');
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateStr === yesterday.toISOString().split('T')[0]) {
    return 'Yesterday';
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

export function MissingBedtimeModal({
  onLogBedtime,
  onSkip,
}: MissingBedtimeModalProps) {
  const [selectedDate, setSelectedDate] = useState(getYesterday());

  const handleLogBedtime = () => {
    onLogBedtime(selectedDate);
  };

  return (
    <div className="modal-overlay" onClick={onSkip}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 p-2 rounded-full text-[var(--text-muted)] hover:bg-white/10 active:scale-95 transition-transform"
          aria-label="Close"
        >
          <CloseIcon />
        </button>

        {/* Moon Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-[var(--night-color)]/15 flex items-center justify-center text-[var(--night-color)]">
            <MoonIcon />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-display-sm text-center mb-3">Forgot to log bedtime?</h2>

        {/* Subtitle */}
        <p className="text-[var(--text-secondary)] text-center mb-6 leading-relaxed">
          Select which night you forgot to log, and we'll help you add it.
        </p>

        {/* Date picker */}
        <div className="mb-6">
          <label className="relative flex items-center justify-center gap-3 p-4 rounded-2xl bg-[var(--bg-soft)] border border-white/5 cursor-pointer">
            <CalendarIcon />
            <span className="text-[var(--text-primary)] font-display font-semibold">
              {formatDateDisplay(selectedDate)}
            </span>
            <input
              type="date"
              value={selectedDate}
              max={getYesterday()}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </label>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleLogBedtime}
            className="btn w-full py-4 rounded-2xl font-display font-semibold text-base"
            style={{
              backgroundColor: 'var(--night-color)',
              color: 'white',
            }}
          >
            Log bedtime
          </button>
          <button
            onClick={onSkip}
            className="btn btn-ghost w-full py-4 rounded-2xl font-display font-semibold text-base"
          >
            Start a new day
          </button>
        </div>
      </div>
    </div>
  );
}
