import { useMemo } from 'react';
import type { SleepEntry } from '../types';
import {
  BedtimeEntry,
  NapEntry,
  WakeUpEntry,
  WakeWindowSeparator,
  NightSleepSummary,
} from './SleepEntry';

interface SleepListProps {
  entries: SleepEntry[];
  allEntries: SleepEntry[];
  selectedDate: string;
  onEdit: (entry: SleepEntry) => void;
  onEndSleep: (id: string) => void;
}

// Timeline item types
type TimelineItem =
  | { type: 'bedtime'; entry: SleepEntry; sortTime: number }
  | { type: 'nap'; entry: SleepEntry; napNumber: number; sortTime: number }
  | { type: 'wakeup'; time: string; sortTime: number }
  | { type: 'wake-window'; durationMinutes: number; sortTime: number }
  | { type: 'night-sleep-summary'; durationMinutes: number; sortTime: number };

// Helper to get date string (YYYY-MM-DD) from datetime
function getDateFromDateTime(datetime: string): string {
  return datetime.split('T')[0];
}

// Calculate minutes between two datetime strings
function calculateMinutesBetween(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
}

export function SleepList({ entries, allEntries, selectedDate, onEdit, onEndSleep }: SleepListProps) {
  // Build the complete timeline with all items
  const timelineItems = useMemo(() => {
    const items: TimelineItem[] = [];

    // Separate naps and night entries for this day
    const naps = entries.filter((e) => e.type === 'nap');
    const nightEntries = entries.filter((e) => e.type === 'night');

    // Sort naps chronologically to assign numbers
    const sortedNaps = [...naps].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    // Create a map of nap id to nap number
    const napNumberMap = new Map<string, number>();
    sortedNaps.forEach((nap, index) => {
      napNumberMap.set(nap.id, index + 1);
    });

    // Add all naps
    naps.forEach((nap) => {
      items.push({
        type: 'nap',
        entry: nap,
        napNumber: napNumberMap.get(nap.id) || 1,
        sortTime: new Date(nap.startTime).getTime(),
      });
    });

    // Add bedtime entries (night type entries showing their start time)
    nightEntries.forEach((entry) => {
      items.push({
        type: 'bedtime',
        entry,
        sortTime: new Date(entry.startTime).getTime(),
      });
    });

    // Find wake-up times that occurred on the selected date
    const nightEntriesWithWakeup = allEntries.filter(
      (e) => e.type === 'night' && e.endTime
    );

    nightEntriesWithWakeup.forEach((nightEntry) => {
      const wakeupDate = getDateFromDateTime(nightEntry.endTime!);
      if (wakeupDate === selectedDate) {
        items.push({
          type: 'wakeup',
          time: nightEntry.endTime!,
          sortTime: new Date(nightEntry.endTime!).getTime(),
        });

        // Add night sleep summary (duration from bedtime to wake-up)
        const nightDuration = calculateMinutesBetween(
          nightEntry.startTime,
          nightEntry.endTime!
        );
        items.push({
          type: 'night-sleep-summary',
          durationMinutes: nightDuration,
          // Position just below wake-up (slightly earlier sort time)
          sortTime: new Date(nightEntry.endTime!).getTime() - 1,
        });
      }
    });

    // Sort all items by time (newest first)
    items.sort((a, b) => b.sortTime - a.sortTime);

    // Now insert wake window separators between sleep events
    // We need to find gaps between:
    // - Wake-up and first nap
    // - End of nap N and start of nap N+1
    // - End of last nap and bedtime

    // Collect all "sleep events" with their wake-up and sleep-start times
    interface SleepEvent {
      wakeTime: string | null; // When baby woke from this sleep
      sleepTime: string; // When baby went to sleep
      sortTime: number;
    }

    const sleepEvents: SleepEvent[] = [];

    // Add naps
    sortedNaps.forEach((nap) => {
      sleepEvents.push({
        wakeTime: nap.endTime,
        sleepTime: nap.startTime,
        sortTime: new Date(nap.startTime).getTime(),
      });
    });

    // Add bedtime entries
    nightEntries.forEach((entry) => {
      sleepEvents.push({
        wakeTime: null, // Bedtime doesn't have a wake time on the same day
        sleepTime: entry.startTime,
        sortTime: new Date(entry.startTime).getTime(),
      });
    });

    // Add wake-up as the start of the day
    nightEntriesWithWakeup.forEach((nightEntry) => {
      const wakeupDate = getDateFromDateTime(nightEntry.endTime!);
      if (wakeupDate === selectedDate) {
        // This represents the start of the awake period
        sleepEvents.push({
          wakeTime: nightEntry.endTime!,
          sleepTime: '', // No sleep time, this is a wake event
          sortTime: new Date(nightEntry.endTime!).getTime(),
        });
      }
    });

    // Sort events chronologically (oldest first for calculating gaps)
    sleepEvents.sort((a, b) => a.sortTime - b.sortTime);

    // Calculate wake windows between consecutive events
    const wakeWindows: { afterTime: number; durationMinutes: number }[] = [];

    for (let i = 0; i < sleepEvents.length - 1; i++) {
      const current = sleepEvents[i];
      const next = sleepEvents[i + 1];

      // If current has a wake time and next has a sleep time, there's a wake window
      if (current.wakeTime && next.sleepTime) {
        const duration = calculateMinutesBetween(current.wakeTime, next.sleepTime);
        if (duration > 0) {
          wakeWindows.push({
            // Position it just before the next sleep event starts
            afterTime: new Date(next.sleepTime).getTime() - 0.5,
            durationMinutes: duration,
          });
        }
      }
    }

    // Add wake windows to items
    wakeWindows.forEach((ww) => {
      items.push({
        type: 'wake-window',
        durationMinutes: ww.durationMinutes,
        sortTime: ww.afterTime,
      });
    });

    // Re-sort with wake windows included
    items.sort((a, b) => b.sortTime - a.sortTime);

    return items;
  }, [entries, allEntries, selectedDate]);

  // Empty state
  if (timelineItems.length === 0) {
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
    <div className="space-y-2">
      {timelineItems.map((item, index) => {
        const key = (() => {
          switch (item.type) {
            case 'bedtime':
            case 'nap':
              return item.entry.id;
            case 'wakeup':
              return `wakeup-${item.time}`;
            case 'wake-window':
              return `wake-window-${item.sortTime}`;
            case 'night-sleep-summary':
              return `night-summary-${item.sortTime}`;
          }
        })();

        return (
          <div
            key={key}
            className="fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {item.type === 'bedtime' && (
              <BedtimeEntry
                entry={item.entry}
                onEdit={onEdit}
                onEndSleep={onEndSleep}
              />
            )}
            {item.type === 'nap' && (
              <NapEntry
                entry={item.entry}
                napNumber={item.napNumber}
                onEdit={onEdit}
                onEndSleep={onEndSleep}
              />
            )}
            {item.type === 'wakeup' && (
              <WakeUpEntry time={item.time} />
            )}
            {item.type === 'wake-window' && (
              <WakeWindowSeparator durationMinutes={item.durationMinutes} />
            )}
            {item.type === 'night-sleep-summary' && (
              <NightSleepSummary durationMinutes={item.durationMinutes} />
            )}
          </div>
        );
      })}
    </div>
  );
}
