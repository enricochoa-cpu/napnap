import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../utils/storage';
import { generateId, formatDate, calculateDuration } from '../utils/dateUtils';
import type { SleepEntry } from '../types';

export function useSleepEntries() {
  const [entries, setEntries] = useLocalStorage<SleepEntry[]>(
    STORAGE_KEYS.SLEEP_ENTRIES,
    []
  );

  const addEntry = useCallback((data: Omit<SleepEntry, 'id' | 'date'>) => {
    const newEntry: SleepEntry = {
      ...data,
      id: generateId(),
      date: formatDate(data.startTime),
    };
    setEntries((prev) => [...prev, newEntry]);
    return newEntry;
  }, [setEntries]);

  const updateEntry = useCallback((id: string, data: Partial<Omit<SleepEntry, 'id'>>) => {
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.id !== id) return entry;
        const updated = { ...entry, ...data };
        // Update date if startTime changed
        if (data.startTime) {
          updated.date = formatDate(data.startTime);
        }
        return updated;
      })
    );
  }, [setEntries]);

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  }, [setEntries]);

  const endSleep = useCallback((id: string, endTime: string) => {
    updateEntry(id, { endTime });
  }, [updateEntry]);

  const getEntriesForDate = useCallback((date: string) => {
    return entries
      .filter((entry) => entry.date === date)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [entries]);

  const activeSleep = useMemo(() => {
    return entries.find((entry) => entry.endTime === null) || null;
  }, [entries]);

  const getDailySummary = useCallback((date: string) => {
    const dayEntries = getEntriesForDate(date);

    const napEntries = dayEntries.filter((e) => e.type === 'nap');
    const nightEntries = dayEntries.filter((e) => e.type === 'night');

    const totalNapMinutes = napEntries.reduce(
      (sum, e) => sum + calculateDuration(e.startTime, e.endTime),
      0
    );

    const totalNightMinutes = nightEntries.reduce(
      (sum, e) => sum + calculateDuration(e.startTime, e.endTime),
      0
    );

    return {
      totalNapMinutes,
      totalNightMinutes,
      totalSleepMinutes: totalNapMinutes + totalNightMinutes,
      napCount: napEntries.length,
      nightCount: nightEntries.length,
    };
  }, [getEntriesForDate]);

  return {
    entries,
    addEntry,
    updateEntry,
    deleteEntry,
    endSleep,
    getEntriesForDate,
    activeSleep,
    getDailySummary,
  };
}
