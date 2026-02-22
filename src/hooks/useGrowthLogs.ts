import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { WeightLog, HeightLog } from '../types';

interface UseGrowthLogsOptions {
  babyId: string | null;
}

function mapWeightRow(row: { id: string; baby_id: string; date: string; value_kg: number }): WeightLog {
  return {
    id: row.id,
    babyId: row.baby_id,
    date: row.date,
    valueKg: Number(row.value_kg),
  };
}

function mapHeightRow(row: { id: string; baby_id: string; date: string; value_cm: number }): HeightLog {
  return {
    id: row.id,
    babyId: row.baby_id,
    date: row.date,
    valueCm: Number(row.value_cm),
  };
}

export function useGrowthLogs({ babyId }: UseGrowthLogsOptions) {
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [heightLogs, setHeightLogs] = useState<HeightLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    if (!babyId) {
      setWeightLogs([]);
      setHeightLogs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [weightRes, heightRes] = await Promise.all([
        supabase
          .from('baby_weight_logs')
          .select('id, baby_id, date, value_kg')
          .eq('baby_id', babyId)
          .order('date', { ascending: true }),
        supabase
          .from('baby_height_logs')
          .select('id, baby_id, date, value_cm')
          .eq('baby_id', babyId)
          .order('date', { ascending: true }),
      ]);

      if (weightRes.error) {
        console.error('Error fetching weight logs:', weightRes.error);
      } else {
        setWeightLogs((weightRes.data ?? []).map(mapWeightRow));
      }
      if (heightRes.error) {
        console.error('Error fetching height logs:', heightRes.error);
      } else {
        setHeightLogs((heightRes.data ?? []).map(mapHeightRow));
      }
    } catch (error) {
      console.error('Error fetching growth logs:', error);
    } finally {
      setLoading(false);
    }
  }, [babyId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const addWeightLog = useCallback(
    async (targetBabyId: string, date: string, valueKg: number): Promise<WeightLog | null> => {
      const { data, error } = await supabase
        .from('baby_weight_logs')
        .upsert(
          { baby_id: targetBabyId, date, value_kg: valueKg },
          { onConflict: 'baby_id,date' }
        )
        .select('id, baby_id, date, value_kg')
        .single();

      if (error) {
        console.error('Error adding weight log:', error);
        return null;
      }
      const newLog = mapWeightRow(data);
      setWeightLogs((prev) => {
        const without = prev.filter((l) => !(l.babyId === targetBabyId && l.date === date));
        return [...without, newLog].sort((a, b) => a.date.localeCompare(b.date));
      });
      return newLog;
    },
    []
  );

  const addHeightLog = useCallback(
    async (targetBabyId: string, date: string, valueCm: number): Promise<HeightLog | null> => {
      const { data, error } = await supabase
        .from('baby_height_logs')
        .upsert(
          { baby_id: targetBabyId, date, value_cm: valueCm },
          { onConflict: 'baby_id,date' }
        )
        .select('id, baby_id, date, value_cm')
        .single();

      if (error) {
        console.error('Error adding height log:', error);
        return null;
      }
      const newLog = mapHeightRow(data);
      setHeightLogs((prev) => {
        const without = prev.filter((l) => !(l.babyId === targetBabyId && l.date === date));
        return [...without, newLog].sort((a, b) => a.date.localeCompare(b.date));
      });
      return newLog;
    },
    []
  );

  const updateWeightLog = useCallback(async (id: string, date: string, valueKg: number): Promise<boolean> => {
    const { error } = await supabase
      .from('baby_weight_logs')
      .update({ date, value_kg: valueKg })
      .eq('id', id);

    if (error) {
      console.error('Error updating weight log:', error);
      return false;
    }
    setWeightLogs((prev) =>
      prev
        .map((l) => (l.id === id ? { ...l, date, valueKg } : l))
        .sort((a, b) => a.date.localeCompare(b.date))
    );
    return true;
  }, []);

  const updateHeightLog = useCallback(async (id: string, date: string, valueCm: number): Promise<boolean> => {
    const { error } = await supabase
      .from('baby_height_logs')
      .update({ date, value_cm: valueCm })
      .eq('id', id);

    if (error) {
      console.error('Error updating height log:', error);
      return false;
    }
    setHeightLogs((prev) =>
      prev
        .map((l) => (l.id === id ? { ...l, date, valueCm } : l))
        .sort((a, b) => a.date.localeCompare(b.date))
    );
    return true;
  }, []);

  const deleteWeightLog = useCallback(async (id: string): Promise<void> => {
    const { error } = await supabase.from('baby_weight_logs').delete().eq('id', id);
    if (error) {
      console.error('Error deleting weight log:', error);
      return;
    }
    setWeightLogs((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const deleteHeightLog = useCallback(async (id: string): Promise<void> => {
    const { error } = await supabase.from('baby_height_logs').delete().eq('id', id);
    if (error) {
      console.error('Error deleting height log:', error);
      return;
    }
    setHeightLogs((prev) => prev.filter((l) => l.id !== id));
  }, []);

  /** Returns a warning string if the new value is lower than a later log; otherwise null. */
  const getWeightWarning = useCallback(
    (date: string, valueKg: number): string | null => {
      const later = weightLogs.find((l) => l.date > date && l.valueKg > valueKg);
      return later ? 'growth.weightWarning' : null;
    },
    [weightLogs]
  );

  const getHeightWarning = useCallback(
    (date: string, valueCm: number): string | null => {
      const later = heightLogs.find((l) => l.date > date && l.valueCm > valueCm);
      return later ? 'growth.heightWarning' : null;
    },
    [heightLogs]
  );

  return {
    weightLogs,
    heightLogs,
    loading,
    fetchLogs,
    addWeightLog,
    addHeightLog,
    updateWeightLog,
    updateHeightLog,
    deleteWeightLog,
    deleteHeightLog,
    getWeightWarning,
    getHeightWarning,
  };
}
