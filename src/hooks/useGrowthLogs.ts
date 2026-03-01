import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import type { WeightLog, HeightLog, MeasurementLog } from '../types';

interface UseGrowthLogsOptions {
  babyId: string | null;
}

export interface MeasurementLogPayload {
  weightKg?: number | null;
  heightCm?: number | null;
  headCm?: number | null;
  notes?: string | null;
}

function mapMeasurementRow(row: {
  id: string;
  baby_id: string;
  date: string;
  weight_kg: number | null;
  height_cm: number | null;
  head_cm: number | null;
  notes: string | null;
}): MeasurementLog {
  return {
    id: row.id,
    babyId: row.baby_id,
    date: row.date,
    weightKg: row.weight_kg != null ? Number(row.weight_kg) : null,
    heightCm: row.height_cm != null ? Number(row.height_cm) : null,
    headCm: row.head_cm != null ? Number(row.head_cm) : null,
    notes: row.notes ?? null,
  };
}

export function useGrowthLogs({ babyId }: UseGrowthLogsOptions) {
  const [measurementLogs, setMeasurementLogs] = useState<MeasurementLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    if (!babyId) {
      setMeasurementLogs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('baby_measurement_logs')
        .select('id, baby_id, date, weight_kg, height_cm, head_cm, notes')
        .eq('baby_id', babyId)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching measurement logs:', error);
      } else {
        setMeasurementLogs((data ?? []).map(mapMeasurementRow));
      }
    } catch (err) {
      console.error('Error fetching measurement logs:', err);
    } finally {
      setLoading(false);
    }
  }, [babyId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  /** Derived for StatsView: weight-only entries (one per log that has weight). */
  const weightLogs = useMemo<WeightLog[]>(
    () =>
      measurementLogs
        .filter((m) => m.weightKg != null && m.weightKg > 0)
        .map((m) => ({
          id: m.id,
          babyId: m.babyId,
          date: m.date,
          valueKg: m.weightKg!,
        })),
    [measurementLogs]
  );

  /** Derived for StatsView: height-only entries (one per log that has height). */
  const heightLogs = useMemo<HeightLog[]>(
    () =>
      measurementLogs
        .filter((m) => m.heightCm != null && m.heightCm > 0)
        .map((m) => ({
          id: m.id,
          babyId: m.babyId,
          date: m.date,
          valueCm: m.heightCm!,
        })),
    [measurementLogs]
  );

  const addMeasurementLog = useCallback(
    async (
      targetBabyId: string,
      date: string,
      payload: MeasurementLogPayload
    ): Promise<MeasurementLog | null> => {
      const { weightKg, heightCm, headCm, notes } = payload;
      const hasOne =
        (weightKg != null && weightKg > 0) ||
        (heightCm != null && heightCm > 0) ||
        (headCm != null && headCm > 0);
      if (!hasOne) return null;

      const row = {
        baby_id: targetBabyId,
        date,
        weight_kg: weightKg != null && weightKg > 0 ? weightKg : null,
        height_cm: heightCm != null && heightCm > 0 ? heightCm : null,
        head_cm: headCm != null && headCm > 0 ? headCm : null,
        notes: notes ?? null,
      };

      const { data, error } = await supabase
        .from('baby_measurement_logs')
        .upsert(row, { onConflict: 'baby_id,date' })
        .select('id, baby_id, date, weight_kg, height_cm, head_cm, notes')
        .single();

      if (error) {
        console.error('Error adding measurement log:', error);
        return null;
      }
      const newLog = mapMeasurementRow(data);
      setMeasurementLogs((prev) => {
        const without = prev.filter(
          (l) => !(l.babyId === targetBabyId && l.date === date)
        );
        return [...without, newLog].sort((a, b) => a.date.localeCompare(b.date));
      });
      return newLog;
    },
    []
  );

  const updateMeasurementLog = useCallback(
    async (
      id: string,
      date: string,
      payload: MeasurementLogPayload
    ): Promise<boolean> => {
      const { weightKg, heightCm, headCm, notes } = payload;
      const hasOne =
        (weightKg != null && weightKg > 0) ||
        (heightCm != null && heightCm > 0) ||
        (headCm != null && headCm > 0);
      if (!hasOne) return false;

      const updates = {
        date,
        weight_kg: weightKg != null && weightKg > 0 ? weightKg : null,
        height_cm: heightCm != null && heightCm > 0 ? heightCm : null,
        head_cm: headCm != null && headCm > 0 ? headCm : null,
        notes: notes ?? null,
      };

      const { error } = await supabase
        .from('baby_measurement_logs')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating measurement log:', error);
        return false;
      }
      setMeasurementLogs((prev) =>
        prev
          .map((l) =>
            l.id === id
              ? {
                  ...l,
                  date,
                  weightKg: updates.weight_kg,
                  heightCm: updates.height_cm,
                  headCm: updates.head_cm,
                  notes: updates.notes,
                }
              : l
          )
          .sort((a, b) => a.date.localeCompare(b.date))
      );
      return true;
    },
    []
  );

  const deleteMeasurementLog = useCallback(async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('baby_measurement_logs')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Error deleting measurement log:', error);
      return;
    }
    setMeasurementLogs((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const getWeightWarning = useCallback(
    (date: string, valueKg: number): string | null => {
      const later = weightLogs.find(
        (l) => l.date > date && l.valueKg > valueKg
      );
      return later ? 'growth.weightWarning' : null;
    },
    [weightLogs]
  );

  const getHeightWarning = useCallback(
    (date: string, valueCm: number): string | null => {
      const later = heightLogs.find(
        (l) => l.date > date && l.valueCm > valueCm
      );
      return later ? 'growth.heightWarning' : null;
    },
    [heightLogs]
  );

  return {
    measurementLogs,
    weightLogs,
    heightLogs,
    loading,
    fetchLogs,
    addMeasurementLog,
    updateMeasurementLog,
    deleteMeasurementLog,
    getWeightWarning,
    getHeightWarning,
  };
}
