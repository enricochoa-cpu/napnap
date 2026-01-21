import { formatDuration } from '../utils/dateUtils';

interface DailySummaryProps {
  summary: {
    totalNapMinutes: number;
    totalNightMinutes: number;
    totalSleepMinutes: number;
    napCount: number;
    nightCount: number;
    averageWakeWindowMinutes: number | null;
  };
}

export function DailySummary({ summary }: DailySummaryProps) {
  return (
    <div className="card p-5">
      <h3 className="text-sm font-display font-semibold text-[var(--text-muted)] mb-4 text-center">
        Daily Summary
      </h3>
      <div className="grid grid-cols-4 gap-3">
        {/* Nap Time */}
        <div className="text-center">
          <div className="w-9 h-9 mx-auto mb-2 rounded-full bg-[var(--night-color)]/15 flex items-center justify-center">
            <svg className="w-4 h-4 text-[var(--night-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          <div className="stat-value stat-value-night text-base">
            {formatDuration(summary.totalNapMinutes)}
          </div>
          <div className="stat-label text-xs">
            {summary.napCount} nap{summary.napCount !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Night Sleep */}
        <div className="text-center">
          <div className="w-9 h-9 mx-auto mb-2 rounded-full bg-[var(--night-color)]/15 flex items-center justify-center">
            <svg className="w-4 h-4 text-[var(--night-color)]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </div>
          <div className="stat-value stat-value-night text-base">
            {formatDuration(summary.totalNightMinutes)}
          </div>
          <div className="stat-label text-xs">
            night
          </div>
        </div>

        {/* Total */}
        <div className="text-center">
          <div className="w-9 h-9 mx-auto mb-2 rounded-full bg-[var(--wake-color)]/15 flex items-center justify-center">
            <svg className="w-4 h-4 text-[var(--wake-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <div className="stat-value stat-value-total text-base">
            {formatDuration(summary.totalSleepMinutes)}
          </div>
          <div className="stat-label text-xs">
            total
          </div>
        </div>

        {/* Average Wake Window */}
        <div className="text-center">
          <div className="w-9 h-9 mx-auto mb-2 rounded-full bg-[var(--text-muted)]/15 flex items-center justify-center">
            <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="stat-value text-[var(--text-secondary)] text-base">
            {summary.averageWakeWindowMinutes !== null
              ? formatDuration(summary.averageWakeWindowMinutes)
              : '--'}
          </div>
          <div className="stat-label text-xs">
            avg wake
          </div>
        </div>
      </div>
    </div>
  );
}
