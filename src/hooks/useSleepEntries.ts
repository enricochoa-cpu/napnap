import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { getNetSleepMinutes } from '../utils/dateUtils';
import { parseISO, format } from 'date-fns';
import type { SleepEntry, SleepPause } from '../types';
import type { DbSleepPause } from '../lib/supabase';

/**
 * Convert datetime string (local "YYYY-MM-DDTHH:mm" or ISO with Z) to UTC ISO for storage.
 * Persisting in UTC avoids DST/travel issues; all duration math uses instant difference (minutes).
 */
const toSupabaseTimestamp = (datetime: string): string => {
  return parseISO(datetime).toISOString();
};

/** Map DB pause row to app type. */
const mapDbPause = (row: DbSleepPause): SleepPause => ({
  id: row.id,
  sleepEntryId: row.sleep_entry_id,
  startTime: row.start_time,
  durationMinutes: row.duration_minutes,
});

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
  const [error, setError] = useState<string | null>(null);

  // Fetch entries when babyId changes
  useEffect(() => {
    fetchEntries();
  }, [babyId]);

  const fetchEntries = async () => {
    try {
      setError(null);
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

      const { data, error: fetchError } = await supabase
        .from('sleep_entries')
        .select('*')
        .eq('user_id', targetBabyId)
        .order('start_time', { ascending: false });

      if (fetchError) {
        console.error('Error fetching entries:', fetchError);
        setError(fetchError.message);
      }

      if (data && data.length > 0) {
        const entryIds = data.map((e) => e.id);

        // Fetch all pauses for these entries in one query
        const { data: pauseData } = await supabase
          .from('sleep_pauses')
          .select('*')
          .in('sleep_entry_id', entryIds)
          .order('start_time', { ascending: true });

        // Group pauses by entry id
        const pausesByEntry = new Map<string, SleepPause[]>();
        if (pauseData) {
          for (const row of pauseData) {
            const pause = mapDbPause(row as DbSleepPause);
            const list = pausesByEntry.get(pause.sleepEntryId) ?? [];
            list.push(pause);
            pausesByEntry.set(pause.sleepEntryId, list);
          }
        }

        const mappedEntries: SleepEntry[] = data.map((entry) => ({
          id: entry.id,
          date: format(parseISO(entry.start_time), 'yyyy-MM-dd'),
          startTime: entry.start_time,
          endTime: entry.end_time ?? null,
          type: entry.type as 'nap' | 'night',
          notes: entry.notes || undefined,
          pauses: pausesByEntry.get(entry.id) ?? [],
          onsetTags: entry.onset_tags ?? undefined,
          sleepMethod: entry.sleep_method ?? undefined,
          wakeMethod: entry.wake_method ?? undefined,
          wakeMood: entry.wake_mood ?? undefined,
        }));
        setEntries(mappedEntries);
      } else {
        setEntries([]);
      }
    } catch (err) {
      console.error('Error fetching entries:', err);
      setError('Failed to load sleep entries');
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
          onset_tags: data.onsetTags ?? null,
          sleep_method: data.sleepMethod ?? null,
          wake_method: data.wakeMethod ?? null,
          wake_mood: data.wakeMood ?? null,
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
        onsetTags: inserted.onset_tags ?? undefined,
        sleepMethod: inserted.sleep_method ?? undefined,
        wakeMethod: inserted.wake_method ?? undefined,
        wakeMood: inserted.wake_mood ?? undefined,
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
      if (data.onsetTags !== undefined) updateData.onset_tags = data.onsetTags ?? null;
      if (data.sleepMethod !== undefined) updateData.sleep_method = data.sleepMethod ?? null;
      if (data.wakeMethod !== undefined) updateData.wake_method = data.wakeMethod ?? null;
      if (data.wakeMood !== undefined) updateData.wake_mood = data.wakeMood ?? null;

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

  const addPause = useCallback(async (entryId: string, data: { startTime: string; durationMinutes: number }): Promise<SleepPause | null> => {
    try {
      const { data: inserted, error } = await supabase
        .from('sleep_pauses')
        .insert({
          sleep_entry_id: entryId,
          start_time: toSupabaseTimestamp(data.startTime),
          duration_minutes: data.durationMinutes,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding pause:', error);
        return null;
      }

      const newPause = mapDbPause(inserted as DbSleepPause);

      // Optimistic update: add pause to the entry in local state
      setEntries((prev) =>
        prev.map((entry) => {
          if (entry.id !== entryId) return entry;
          const pauses = [...(entry.pauses ?? []), newPause].sort(
            (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          );
          return { ...entry, pauses };
        })
      );

      return newPause;
    } catch (err) {
      console.error('Error adding pause:', err);
      return null;
    }
  }, []);

  const updatePause = useCallback(async (pauseId: string, data: { startTime?: string; durationMinutes?: number }): Promise<boolean> => {
    try {
      const updateData: Record<string, unknown> = {};
      if (data.startTime !== undefined) updateData.start_time = toSupabaseTimestamp(data.startTime);
      if (data.durationMinutes !== undefined) updateData.duration_minutes = data.durationMinutes;

      const { error } = await supabase
        .from('sleep_pauses')
        .update(updateData)
        .eq('id', pauseId);

      if (error) {
        console.error('Error updating pause:', error);
        return false;
      }

      // Optimistic update
      setEntries((prev) =>
        prev.map((entry) => {
          const pauseIndex = (entry.pauses ?? []).findIndex((p) => p.id === pauseId);
          if (pauseIndex === -1) return entry;
          const updatedPauses = [...entry.pauses!];
          updatedPauses[pauseIndex] = {
            ...updatedPauses[pauseIndex],
            ...(data.startTime !== undefined ? { startTime: toSupabaseTimestamp(data.startTime) } : {}),
            ...(data.durationMinutes !== undefined ? { durationMinutes: data.durationMinutes } : {}),
          };
          updatedPauses.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
          return { ...entry, pauses: updatedPauses };
        })
      );

      return true;
    } catch (err) {
      console.error('Error updating pause:', err);
      return false;
    }
  }, []);

  const deletePause = useCallback(async (pauseId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('sleep_pauses')
        .delete()
        .eq('id', pauseId);

      if (error) {
        console.error('Error deleting pause:', error);
        return false;
      }

      // Optimistic removal
      setEntries((prev) =>
        prev.map((entry) => {
          const pauses = (entry.pauses ?? []).filter((p) => p.id !== pauseId);
          return { ...entry, pauses };
        })
      );

      return true;
    } catch (err) {
      console.error('Error deleting pause:', err);
      return false;
    }
  }, []);

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

  const getDailySummary = useCallback(
    (date: string, allEntries: SleepEntry[]) => {
      const dayEntries = getEntriesForDate(date);
      return computeDailySummary(date, dayEntries, allEntries);
    },
    [getEntriesForDate],
  );

  return {
    entries,
    loading,
    error,
    addEntry,
    updateEntry,
    deleteEntry,
    endSleep,
    addPause,
    updatePause,
    deletePause,
    getEntriesForDate,
    activeSleep,
    lastCompletedSleep,
    awakeMinutes,
    getDailySummary,
    refreshEntries: fetchEntries,
  };
}

export function computeDailySummary(
  date: string,
  dayEntries: SleepEntry[],
  allEntries: SleepEntry[],
) {
  const napEntries = dayEntries.filter((e) => e.type === 'nap');
  const nightEntries = dayEntries.filter((e) => e.type === 'night');

  const totalNapMinutes = napEntries.reduce(
    (sum, e) => sum + getNetSleepMinutes(e),
    0,
  );

  const totalNightMinutes = nightEntries.reduce(
    (sum, e) => sum + getNetSleepMinutes(e),
    0,
  );

  const nightWakingCount = nightEntries.reduce(
    (sum, e) => sum + (e.pauses ?? []).length,
    0,
  );

  const nightWakingMinutes = nightEntries.reduce(
    (sum, e) => sum + (e.pauses ?? []).reduce((pSum, p) => pSum + p.durationMinutes, 0),
    0,
  );

  const wakeWindows: number[] = [];

  const nightEntriesWithWakeup = allEntries.filter(
    (e) => e.type === 'night' && e.endTime && e.endTime.split('T')[0] === date,
  );
  const wakeUpTime =
    nightEntriesWithWakeup.length > 0 ? nightEntriesWithWakeup[0].endTime : null;

  const sortedNaps = [...napEntries].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );

  const sortedBedtimes = [...nightEntries].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );

  if (wakeUpTime && sortedNaps.length > 0) {
    const wakeToFirstNap = Math.round(
      (new Date(sortedNaps[0].startTime).getTime() -
        new Date(wakeUpTime).getTime()) /
        (1000 * 60),
    );
    if (wakeToFirstNap > 0) wakeWindows.push(wakeToFirstNap);
  }

  for (let i = 0; i < sortedNaps.length - 1; i++) {
    const currentNap = sortedNaps[i];
    const nextNap = sortedNaps[i + 1];
    if (currentNap.endTime) {
      const betweenNaps = Math.round(
        (new Date(nextNap.startTime).getTime() -
          new Date(currentNap.endTime).getTime()) /
          (1000 * 60),
      );
      if (betweenNaps > 0) wakeWindows.push(betweenNaps);
    }
  }

  if (sortedNaps.length > 0 && sortedBedtimes.length > 0) {
    const lastNap = sortedNaps[sortedNaps.length - 1];
    if (lastNap.endTime) {
      const napToBedtime = Math.round(
        (new Date(sortedBedtimes[0].startTime).getTime() -
          new Date(lastNap.endTime).getTime()) /
          (1000 * 60),
      );
      if (napToBedtime > 0) wakeWindows.push(napToBedtime);
    }
  }

  const averageWakeWindowMinutes =
    wakeWindows.length > 0
      ? Math.round(wakeWindows.reduce((sum, w) => sum + w, 0) / wakeWindows.length)
      : null;

  return {
    totalNapMinutes,
    totalNightMinutes,
    totalSleepMinutes: totalNapMinutes + totalNightMinutes,
    napCount: napEntries.length,
    nightCount: nightEntries.length,
    averageWakeWindowMinutes,
    nightWakingCount,
    nightWakingMinutes,
  };
}
