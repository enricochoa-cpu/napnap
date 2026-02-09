import { formatDisplayDate, formatDate, getNextDay, getPreviousDay } from '../utils/dateUtils';

interface DayNavigatorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export function DayNavigator({ selectedDate, onDateChange }: DayNavigatorProps) {
  const handlePrevious = () => {
    onDateChange(formatDate(getPreviousDay(selectedDate)));
  };

  const handleNext = () => {
    onDateChange(formatDate(getNextDay(selectedDate)));
  };

  const handleToday = () => {
    onDateChange(formatDate(new Date()));
  };

  const handleDatePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDateChange(e.target.value);
  };

  const isToday = selectedDate === formatDate(new Date());

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--text-muted)]/10 transition-all"
          aria-label="Previous day"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex flex-col items-center">
          <span className="font-display font-semibold text-[var(--text-primary)] text-lg">
            {formatDisplayDate(selectedDate)}
          </span>
          <div className="flex items-center gap-3 mt-2">
            <input
              type="date"
              value={selectedDate}
              onChange={handleDatePick}
              className="input text-sm py-1.5 px-3"
            />
            {!isToday && (
              <button
                onClick={handleToday}
                className="text-xs font-display font-medium text-[var(--nap-color)] hover:text-[var(--nap-color)]/80 transition-colors"
              >
                Today
              </button>
            )}
          </div>
        </div>

        <button
          onClick={handleNext}
          className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--text-muted)]/10 transition-all"
          aria-label="Next day"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
