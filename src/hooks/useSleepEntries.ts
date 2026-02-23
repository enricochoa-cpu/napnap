import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { calculateDuration } from '../utils/dateUtils';
import { parseISO, format } from 'date-fns';
import type { SleepEntry } from '../types';

/**
 * Convert datetime string (local "YYYY-MM-DDTHH:mm" or ISO with Z) to UTC ISO for storage.
 * Persisting in UTC avoids DST/travel issues; all duration math uses instant difference (minutes).
 */
const toSupabaseTimestamp = (datetime: string): string => {
  return parseISO(datetime).toISOString();
};

/**
 * Entry startTime/endTime are stored as received from Supabase (UTC ISO).
 * Use formatTime(entry.startTime) / parseISO for display (local) and duration (differenceInMinutes).
 */

interface UseSleepEntriesOptions {
  babyId: string | null;
}

export function useSleepEntries({ babyId }: UseSleepEntriesOptions = { babyId: null }) {
  const [entries, setEntries] = useState<SleepEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch entries when babyId changes
  useEffect(() => {
    fetchEntries();
  }, [babyId]);

  const fetchEntries = async () => {
    try {
      // If no babyId provided, try to use current user's id
      let targetBabyId = babyId;

      if (!targetBabyId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }
        targetBabyId = user.id;
      }

      const { data, error } = await supabase
        .from('sleep_entries')
        .select('*')
        .eq('user_id', targetBabyId)
        .order('start_time', { ascending: false });

      if (error) {
        console.error('Error fetching entries:', error);
      }

      if (data) {
        const mappedEntries: SleepEntry[] = data.map((entry) => ({
          id: entry.id,
          date: format(parseISO(entry.start_time), 'yyyy-MM-dd'),
          startTime: entry.start_time,
          endTime: entry.end_time ?? null,
          type: entry.type as 'nap' | 'night',
          notes: entry.notes || undefined,
        }));
        setEntries(mappedEntries);
      } else {
        setEntries([]);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const addEntry = useCallback(async (data: Omit<SleepEntry, 'id' | 'date'>) => {
    try {
      // Determine which baby to add entry for
      let targetBabyId = babyId;

      if (!targetBabyId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        targetBabyId = user.id;
      }

      const { data: inserted, error } = await supabase
        .from('sleep_entries')
        .insert({
          user_id: targetBabyId,
          start_time: toSupabaseTimestamp(data.startTime),
          end_time: data.endTime ? toSupabaseTimestamp(data.endTime) : null,
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
        date: format(parseISO(inserted.start_time), 'yyyy-MM-dd'),
        startTime: inserted.start_time,
        endTime: inserted.end_time ?? null,
        type: inserted.type as 'nap' | 'night',
        notes: inserted.notes || undefined,
      };

      setEntries((prev) => [newEntry, ...prev]);
      return newEntry;
    } catch (error) {
      console.error('Error adding entry:', error);
      return null;
    }
  }, [babyId]);

  const updateEntry = useCallback(async (id: string, data: Partial<Omit<SleepEntry, 'id'>>): Promise<boolean> => {
    try {
      const updateData: Record<string, unknown> = {};
      if (data.startTime !== undefined) updateData.start_time = toSupabaseTimestamp(data.startTime);
      if (data.endTime !== undefined) updateData.end_time = data.endTime ? toSupabaseTimestamp(data.endTime) : null;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.notes !== undefined) updateData.notes = data.notes || null;

      const { error } = await supabase
        .from('sleep_entries')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating entry:', error);
        return false;
      }

      setEntries((prev) =>
        prev.map((entry) => {
          if (entry.id !== id) return entry;
          const updated = { ...entry, ...data };
          if (data.startTime !== undefined) {
            updated.startTime = toSupabaseTimestamp(data.startTime);
            updated.date = format(parseISO(updated.startTime), 'yyyy-MM-dd');
          }
          if (data.endTime !== undefined) updated.endTime = data.endTime ? toSupabaseTimestamp(data.endTime) : null;
          return updated;
        })
      );
      return true;
    } catch (error) {
      console.error('Error updating entry:', error);
      return false;
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

  const getDailySummary = useCallback((date: string, allEntries: SleepEntry[]) => {
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

    // Calculate average wake window for the day
    // Wake windows are gaps between sleep periods
    const wakeWindows: number[] = [];

    // Find wake-up time for this day (from night entries that ended on this date)
    const nightEntriesWithWakeup = allEntries.filter(
      (e) => e.type === 'night' && e.endTime && e.endTime.split('T')[0] === date
    );
    const wakeUpTime = nightEntriesWithWakeup.length > 0
      ? nightEntriesWithWakeup[0].endTime
      : null;

    // Sort naps chronologically
    const sortedNaps = [...napEntries].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    // Sort bedtimes chronologically
    const sortedBedtimes = [...nightEntries].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    // Calculate wake window from wake-up to first nap
    if (wakeUpTime && sortedNaps.length > 0) {
      const wakeToFirstNap = Math.round(
        (new Date(sortedNaps[0].startTime).getTime() - new Date(wakeUpTime).getTime()) / (1000 * 60)
      );
      if (wakeToFirstNap > 0) wakeWindows.push(wakeToFirstNap);
    }

    // Calculate wake windows between naps
    for (let i = 0; i < sortedNaps.length - 1; i++) {
      const currentNap = sortedNaps[i];
      const nextNap = sortedNaps[i + 1];
      if (currentNap.endTime) {
        const betweenNaps = Math.round(
          (new Date(nextNap.startTime).getTime() - new Date(currentNap.endTime).getTime()) / (1000 * 60)
        );
        if (betweenNaps > 0) wakeWindows.push(betweenNaps);
      }
    }

    // Calculate wake window from last nap to bedtime
    if (sortedNaps.length > 0 && sortedBedtimes.length > 0) {
      const lastNap = sortedNaps[sortedNaps.length - 1];
      if (lastNap.endTime) {
        const napToBedtime = Math.round(
          (new Date(sortedBedtimes[0].startTime).getTime() - new Date(lastNap.endTime).getTime()) / (1000 * 60)
        );
        if (napToBedtime > 0) wakeWindows.push(napToBedtime);
      }
    }

    // Calculate average wake window
    const averageWakeWindowMinutes = wakeWindows.length > 0
      ? Math.round(wakeWindows.reduce((sum, w) => sum + w, 0) / wakeWindows.length)
      : null;

    return {
      totalNapMinutes,
      totalNightMinutes,
      totalSleepMinutes: totalNapMinutes + totalNightMinutes,
      napCount: napEntries.length,
      nightCount: nightEntries.length,
      averageWakeWindowMinutes,
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
    refreshEntries: fetchEntries,
  };
}
