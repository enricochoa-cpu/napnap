import type { SleepEntry } from '../types';
import { SleepEntryCard } from './SleepEntry';

interface SleepListProps {
  entries: SleepEntry[];
  onEdit: (entry: SleepEntry) => void;
  onDelete: (id: string) => void;
  onEndSleep: (id: string) => void;
}

export function SleepList({ entries, onEdit, onDelete, onEndSleep }: SleepListProps) {
  if (entries.length === 0) {
    return (
      <div className="card p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--bg-soft)] flex items-center justify-center">
          <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </div>
        <p className="text-[var(--text-secondary)] font-display">No sleep entries for this day</p>
        <p className="text-[var(--text-muted)] text-sm mt-1">Tap "+ Add Entry" to log past sleep</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry, index) => (
        <div
          key={entry.id}
          className="fade-in"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <SleepEntryCard
            entry={entry}
            onEdit={onEdit}
            onDelete={onDelete}
            onEndSleep={onEndSleep}
          />
        </div>
      ))}
    </div>
  );
}
