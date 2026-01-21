import { useMemo } from 'react';
import type { SleepEntry } from '../types';
import { SleepEntryCard, MilestoneCard } from './SleepEntry';

interface SleepListProps {
  entries: SleepEntry[];
  allEntries: SleepEntry[];
  selectedDate: string;
  onEdit: (entry: SleepEntry) => void;
  onDelete: (id: string) => void;
  onEndSleep: (id: string) => void;
}

type ListItem =
  | { type: 'sleep'; entry: SleepEntry; sortTime: number }
  | { type: 'wakeup'; time: string; sortTime: number };

// Helper to get date string (YYYY-MM-DD) from datetime
function getDateFromDateTime(datetime: string): string {
  return datetime.split('T')[0];
}

export function SleepList({ entries, allEntries, selectedDate, onEdit, onDelete, onEndSleep }: SleepListProps) {
  // Build list with sleep entries + wake-up milestones
  const listItems = useMemo(() => {
    const items: ListItem[] = [];

    // Add all sleep entries for this day
    entries.forEach((entry) => {
      items.push({
        type: 'sleep',
        entry,
        sortTime: new Date(entry.startTime).getTime(),
      });
    });

    // Find wake-up times that occurred on the selected date
    // These come from night entries (could be from previous day's bedtime)
    const nightEntriesWithWakeup = allEntries.filter(
      (e) => e.type === 'night' && e.endTime
    );

    nightEntriesWithWakeup.forEach((nightEntry) => {
      // Only add wake-up if it happened on the selected date
      const wakeupDate = getDateFromDateTime(nightEntry.endTime!);
      if (wakeupDate === selectedDate) {
        items.push({
          type: 'wakeup',
          time: nightEntry.endTime!,
          sortTime: new Date(nightEntry.endTime!).getTime(),
        });
      }
    });

    // Sort from newest to oldest
    return items.sort((a, b) => b.sortTime - a.sortTime);
  }, [entries, allEntries, selectedDate]);

  // Check listItems (not entries) because wake-ups come from previous day's night entries
  if (listItems.length === 0) {
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
      {listItems.map((item, index) => (
        <div
          key={item.type === 'sleep' ? item.entry.id : `${item.type}-${item.time}`}
          className="fade-in"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {item.type === 'sleep' ? (
            <SleepEntryCard
              entry={item.entry}
              onEdit={onEdit}
              onDelete={onDelete}
              onEndSleep={onEndSleep}
            />
          ) : (
            <MilestoneCard time={item.time} />
          )}
        </div>
      ))}
    </div>
  );
}
