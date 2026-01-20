import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { formatDate, calculateDuration } from '../utils/dateUtils';
import type { SleepEntry } from '../types';

export function useSleepEntries() {
  const [entries, setEntries] = useState<SleepEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch entries on mount
  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('sleep_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });

      if (error) {
        console.error('Error fetching entries:', error);
      }

      if (data) {
        const mappedEntries: SleepEntry[] = data.map((entry) => ({
          id: entry.id,
          date: formatDate(entry.start_time),
          startTime: entry.start_time,
          endTime: entry.end_time,
          type: entry.type as 'nap' | 'night',
          notes: entry.notes || undefined,
        }));
        setEntries(mappedEntries);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const addEntry = useCallback(async (data: Omit<SleepEntry, 'id' | 'date'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: inserted, error } = await supabase
        .from('sleep_entries')
        .insert({
          user_id: user.id,
          start_time: data.startTime,
          end_time: data.endTime,
          type: data.type,
          notes: data.notes || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding entry:', error);
        return null;
      }

      const newEntry: SleepEntry = {
        id: inserted.id,
        date: formatDate(data.startTime),
        startTime: inserted.start_time,
        endTime: inserted.end_time,
        type: inserted.type as 'nap' | 'night',
        notes: inserted.notes || undefined,
      };

      setEntries((prev) => [newEntry, ...prev]);
      return newEntry;
    } catch (error) {
      console.error('Error adding entry:', error);
      return null;
    }
  }, []);

  const updateEntry = useCallback(async (id: string, data: Partial<Omit<SleepEntry, 'id'>>) => {
    try {
      const updateData: Record<string, unknown> = {};
      if (data.startTime !== undefined) updateData.start_time = data.startTime;
      if (data.endTime !== undefined) updateData.end_time = data.endTime;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.notes !== undefined) updateData.notes = data.notes || null;

      const { error } = await supabase
        .from('sleep_entries')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating entry:', error);
        return;
      }

      setEntries((prev) =>
        prev.map((entry) => {
          if (entry.id !== id) return entry;
          const updated = { ...entry, ...data };
          if (data.startTime) {
            updated.date = formatDate(data.startTime);
          }
          return updated;
        })
      );
    } catch (error) {
      console.error('Error updating entry:', error);
    }
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('sleep_entries')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting entry:', error);
        return;
      }

      setEntries((prev) => prev.filter((entry) => entry.id !== id));
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  }, []);

  const endSleep = useCallback(async (id: string, endTime: string) => {
    await updateEntry(id, { endTime });
  }, [updateEntry]);

  const getEntriesForDate = useCallback((date: string) => {
    return entries
      .filter((entry) => entry.date === date)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [entries]);

  const activeSleep = useMemo(() => {
    return entries.find((entry) => entry.endTime === null) || null;
  }, [entries]);

  // Get the last completed sleep (most recent with endTime)
  const lastCompletedSleep = useMemo(() => {
    const completedEntries = entries
      .filter((entry) => entry.endTime !== null)
      .sort((a, b) => new Date(b.endTime!).getTime() - new Date(a.endTime!).getTime());
    return completedEntries[0] || null;
  }, [entries]);

  // Calculate minutes awake since last sleep ended
  const awakeMinutes = useMemo(() => {
    if (activeSleep) return 0; // Baby is sleeping
    if (!lastCompletedSleep?.endTime) return null; // No sleep data yet
    const now = new Date();
    const lastWakeTime = new Date(lastCompletedSleep.endTime);
    return Math.floor((now.getTime() - lastWakeTime.getTime()) / (1000 * 60));
  }, [activeSleep, lastCompletedSleep]);

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
    loading,
    addEntry,
    updateEntry,
    deleteEntry,
    endSleep,
    getEntriesForDate,
    activeSleep,
    lastCompletedSleep,
    awakeMinutes,
    getDailySummary,
  };
}
