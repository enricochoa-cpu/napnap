import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  format,
  subDays,
  parseISO,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  differenceInDays,
  isAfter,
  isBefore,
  isToday,
} from 'date-fns';
import type { SleepEntry } from '../types';

interface StatsViewProps {
  entries: SleepEntry[];
}

const MAX_DAYS = 15;

// Calculate duration in minutes
const calculateDuration = (startTime: string, endTime: string | null): number => {
  const start = new Date(startTime).getTime();
  const end = endTime ? new Date(endTime).getTime() : Date.now();
  return Math.round((end - start) / (1000 * 60));
};

// Format minutes to hours string
const formatHours = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

// Format minutes-since-midnight to HH:MM
const formatWakeTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

// Format date parts for styled display
const formatDateParts = (date: Date): { dayMonth: string; year: string } => {
  return {
    dayMonth: format(date, 'dd MMM'),
    year: format(date, 'yyyy'),
  };
};

// Format date for input value (YYYY-MM-DD)
const formatInputDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

// Get nap bar color by index
const getNapColor = (napIndex: number): string => {
  if (napIndex === 1) return 'var(--nap-color)';
  if (napIndex === 2) return 'var(--night-color)';
  return 'var(--text-secondary)';
};

// Custom tooltip component
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    color: string;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-[var(--bg-elevated)] px-3 py-2 rounded-xl shadow-lg border border-[var(--glass-border)]">
      <p className="text-xs text-[var(--text-muted)] mb-1">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
          {entry.dataKey === 'nap' ? 'Naps' : 'Night'}: {formatHours(entry.value)}
        </p>
      ))}
    </div>
  );
}

function BarTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const total = payload.reduce((sum, p) => sum + (p.value || 0), 0);

  return (
    <div className="bg-[var(--bg-elevated)] px-3 py-2 rounded-xl shadow-lg border border-[var(--glass-border)]">
      <p className="text-xs text-[var(--text-muted)] mb-1">{label}</p>
      <p className="text-sm font-semibold text-[var(--text-primary)]">
        Total: {formatHours(total)}
      </p>
    </div>
  );
}

// Wake up tooltip
function WakeTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-[var(--bg-elevated)] px-3 py-2 rounded-xl shadow-lg border border-[var(--glass-border)]">
      <p className="text-xs text-[var(--text-muted)] mb-1">{label}</p>
      <p className="text-sm font-medium" style={{ color: 'var(--wake-color)' }}>
        Woke up: {formatWakeTime(payload[0].value)}
      </p>
    </div>
  );
}

// Bedtime tooltip
function BedTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-[var(--bg-elevated)] px-3 py-2 rounded-xl shadow-lg border border-[var(--glass-border)]">
      <p className="text-xs text-[var(--text-muted)] mb-1">{label}</p>
      <p className="text-sm font-medium" style={{ color: 'var(--night-color)' }}>
        Bedtime: {formatWakeTime(payload[0].value)}
      </p>
    </div>
  );
}

// Calendar icon
const CalendarIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export function StatsView({ entries }: StatsViewProps) {
  // Date range state - default to last 7 days
  const today = new Date();
  const [endDate, setEndDate] = useState<Date>(today);
  const [startDate, setStartDate] = useState<Date>(subDays(today, 6));

  // Handle start date change
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = parseISO(e.target.value);
    const daysDiff = differenceInDays(endDate, newStart);

    if (daysDiff > MAX_DAYS - 1) {
      // Adjust end date to max range
      setEndDate(subDays(newStart, -(MAX_DAYS - 1)));
    } else if (isAfter(newStart, endDate)) {
      // Start can't be after end
      setEndDate(newStart);
    }
    setStartDate(newStart);
  };

  // Handle end date change
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = parseISO(e.target.value);
    const daysDiff = differenceInDays(newEnd, startDate);

    if (daysDiff > MAX_DAYS - 1) {
      // Adjust start date to max range
      setStartDate(subDays(newEnd, MAX_DAYS - 1));
    } else if (isBefore(newEnd, startDate)) {
      // End can't be before start
      setStartDate(newEnd);
    }
    setEndDate(newEnd);
  };

  // Calculate data for date range
  const rangeData = useMemo(() => {
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return days.map((date) => {
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      // Filter entries for this day
      const dayEntries = entries.filter((entry) => {
        const entryStart = parseISO(entry.startTime);
        return entryStart >= dayStart && entryStart <= dayEnd;
      });

      const napMinutes = dayEntries
        .filter((e) => e.type === 'nap')
        .reduce((sum, e) => sum + calculateDuration(e.startTime, e.endTime), 0);

      const nightMinutes = dayEntries
        .filter((e) => e.type === 'night')
        .reduce((sum, e) => sum + calculateDuration(e.startTime, e.endTime), 0);

      return {
        day: format(date, 'd/M'),
        fullDate: format(date, 'MMM d'),
        nap: napMinutes,
        night: nightMinutes,
        total: napMinutes + nightMinutes,
        napCount: dayEntries.filter((e) => e.type === 'nap').length,
        isToday: isToday(date),
      };
    });
  }, [entries, startDate, endDate]);

  // Calculate averages (exclude today since the day is incomplete)
  const averages = useMemo(() => {
    const completedDaysWithData = rangeData.filter((d) => d.total > 0 && !d.isToday);
    if (completedDaysWithData.length === 0) {
      return { avgTotal: 0, avgNap: 0, avgNight: 0, avgNapCount: 0 };
    }

    const avgTotal = Math.round(
      completedDaysWithData.reduce((sum, d) => sum + d.total, 0) / completedDaysWithData.length
    );
    const avgNap = Math.round(
      completedDaysWithData.reduce((sum, d) => sum + d.nap, 0) / completedDaysWithData.length
    );
    const avgNight = Math.round(
      completedDaysWithData.reduce((sum, d) => sum + d.night, 0) / completedDaysWithData.length
    );
    const avgNapCount =
      completedDaysWithData.reduce((sum, d) => sum + d.napCount, 0) / completedDaysWithData.length;

    return { avgTotal, avgNap, avgNight, avgNapCount };
  }, [rangeData]);

  // Sleep distribution (night vs day totals across range)
  const distributionData = useMemo(() => {
    const completedDays = rangeData.filter((d) => d.total > 0 && !d.isToday);
    const totalNap = completedDays.reduce((sum, d) => sum + d.nap, 0);
    const totalNight = completedDays.reduce((sum, d) => sum + d.night, 0);
    const total = totalNap + totalNight;

    if (total === 0) return null;

    const nightPct = Math.round((totalNight / total) * 100);
    const napPct = 100 - nightPct;

    return {
      slices: [
        { name: 'Night', value: totalNight },
        { name: 'Day', value: totalNap },
      ],
      nightPct,
      napPct,
    };
  }, [rangeData]);

  // Wake-up times from night entries
  const wakeUpData = useMemo(() => {
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const points: { day: string; wakeMinutes: number }[] = [];

    for (const date of days) {
      if (isToday(date)) continue;
      const dayStr = format(date, 'yyyy-MM-dd');

      // Find night entries whose endTime falls on this day
      const wakeEntry = entries.find((e) => {
        if (e.type !== 'night' || !e.endTime) return false;
        const endDay = format(parseISO(e.endTime), 'yyyy-MM-dd');
        return endDay === dayStr;
      });

      if (wakeEntry && wakeEntry.endTime) {
        const end = parseISO(wakeEntry.endTime);
        const minutesSinceMidnight = end.getHours() * 60 + end.getMinutes();
        points.push({ day: format(date, 'd/M'), wakeMinutes: minutesSinceMidnight });
      }
    }

    if (points.length === 0) return null;

    const avg = Math.round(points.reduce((s, p) => s + p.wakeMinutes, 0) / points.length);

    // Y-axis domain: pad to nearest 30min
    const allMins = points.map((p) => p.wakeMinutes);
    const minVal = Math.floor(Math.min(...allMins) / 30) * 30;
    const maxVal = Math.ceil(Math.max(...allMins) / 30) * 30;

    return { points, avg, domain: [minVal, maxVal] as [number, number] };
  }, [entries, startDate, endDate]);

  // Bedtime data from night entries
  const bedtimeData = useMemo(() => {
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const points: { day: string; bedMinutes: number }[] = [];

    for (const date of days) {
      if (isToday(date)) continue;
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      // Find night entry whose startTime falls on this day
      const bedEntry = entries.find((e) => {
        if (e.type !== 'night') return false;
        const entryStart = parseISO(e.startTime);
        return entryStart >= dayStart && entryStart <= dayEnd;
      });

      if (bedEntry) {
        const start = parseISO(bedEntry.startTime);
        const minutesSinceMidnight = start.getHours() * 60 + start.getMinutes();
        points.push({ day: format(date, 'd/M'), bedMinutes: minutesSinceMidnight });
      }
    }

    if (points.length === 0) return null;

    const avg = Math.round(points.reduce((s, p) => s + p.bedMinutes, 0) / points.length);

    // Y-axis domain: pad to nearest 30min
    const allMins = points.map((p) => p.bedMinutes);
    const minVal = Math.floor(Math.min(...allMins) / 30) * 30;
    const maxVal = Math.ceil(Math.max(...allMins) / 30) * 30;

    return { points, avg, domain: [minVal, maxVal] as [number, number] };
  }, [entries, startDate, endDate]);

  // Schedule/Gantt data for daily schedule chart
  const scheduleData = useMemo(() => {
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    type ScheduleEvent = {
      type: 'wake' | 'nap' | 'bedtime';
      startMin: number;
      endMin?: number;
      napIndex?: number;
    };

    type DaySchedule = {
      day: string;
      events: ScheduleEvent[];
    };

    const allDays: DaySchedule[] = [];
    let globalMin = Infinity;
    let globalMax = -Infinity;
    let maxNapIdx = 0;

    for (const date of days) {
      const dayStr = format(date, 'yyyy-MM-dd');
      const events: ScheduleEvent[] = [];

      // Wake up: night entry whose endTime falls on this day
      const wakeEntry = entries.find((e) => {
        if (e.type !== 'night' || !e.endTime) return false;
        return format(parseISO(e.endTime), 'yyyy-MM-dd') === dayStr;
      });
      if (wakeEntry && wakeEntry.endTime) {
        const end = parseISO(wakeEntry.endTime);
        const min = end.getHours() * 60 + end.getMinutes();
        events.push({ type: 'wake', startMin: min });
        globalMin = Math.min(globalMin, min);
        globalMax = Math.max(globalMax, min);
      }

      // Naps: completed nap entries starting on this day
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      const dayNaps = entries
        .filter((e) => {
          if (e.type !== 'nap' || !e.endTime) return false;
          const entryStart = parseISO(e.startTime);
          return entryStart >= dayStart && entryStart <= dayEnd;
        })
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

      dayNaps.forEach((nap, idx) => {
        const start = parseISO(nap.startTime);
        const end = parseISO(nap.endTime!);
        const startMin = start.getHours() * 60 + start.getMinutes();
        const endMin = end.getHours() * 60 + end.getMinutes();
        events.push({ type: 'nap', startMin, endMin, napIndex: idx + 1 });
        globalMin = Math.min(globalMin, startMin);
        globalMax = Math.max(globalMax, endMin);
        maxNapIdx = Math.max(maxNapIdx, idx + 1);
      });

      // Bedtime: night entry whose startTime falls on this day
      const bedtimeEntry = entries.find((e) => {
        if (e.type !== 'night') return false;
        const entryStart = parseISO(e.startTime);
        return entryStart >= dayStart && entryStart <= dayEnd;
      });
      if (bedtimeEntry) {
        const start = parseISO(bedtimeEntry.startTime);
        const min = start.getHours() * 60 + start.getMinutes();
        events.push({ type: 'bedtime', startMin: min });
        globalMin = Math.min(globalMin, min);
        globalMax = Math.max(globalMax, min);
      }

      if (events.length > 0) {
        allDays.push({ day: format(date, 'd/M'), events });
      }
    }

    if (allDays.length === 0) return null;

    // Pad to nearest 30 min
    const minTime = Math.floor(globalMin / 30) * 30;
    const maxTime = Math.ceil(globalMax / 30) * 30;
    const range = maxTime - minTime || 60; // avoid division by zero

    // Determine tick interval based on range
    let tickInterval: number;
    if (range <= 360) tickInterval = 60;
    else if (range <= 720) tickInterval = 120;
    else tickInterval = 180;

    const ticks: number[] = [];
    const firstTick = Math.ceil(minTime / tickInterval) * tickInterval;
    for (let t = firstTick; t <= maxTime; t += tickInterval) {
      ticks.push(t);
    }

    return { days: allDays, minTime, maxTime, range, maxNapIndex: maxNapIdx, ticks };
  }, [entries, startDate, endDate]);

  // Get CSS variable values for charts
  const napColor = 'var(--nap-color)';
  const nightColor = 'var(--night-color)';
  const wakeColor = 'var(--wake-color)';
  const gridColor = 'var(--text-muted)';

  const hasData = entries.length > 0;
  const daysInRange = differenceInDays(endDate, startDate) + 1;

  // Generate insight based on data
  const insight = useMemo(() => {
    if (!hasData || averages.avgTotal === 0) return null;

    const avgTotalHours = averages.avgTotal / 60;

    if (avgTotalHours >= 14) {
      return { text: 'Great sleep this period', color: 'var(--success-color)' };
    } else if (avgTotalHours >= 12) {
      return { text: 'Solid sleep patterns', color: 'var(--nap-color)' };
    } else if (averages.avgNapCount >= 2) {
      return { text: 'Good nap consistency', color: 'var(--nap-color)' };
    } else {
      return { text: 'Building patterns', color: 'var(--wake-color)' };
    }
  }, [hasData, averages]);

  return (
    <div className="pb-32 px-6 fade-in">
      {/* Header */}
      <div className="pt-8 mb-4">
        <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">
          Sleep Trends
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Track your baby's sleeping patterns
        </p>
      </div>

      {/* Insight Tag */}
      {insight && (
        <div className="mb-4">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-display font-semibold"
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: insight.color }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            </svg>
            {insight.text}
          </span>
        </div>
      )}

      {/* Date Range Filter - Glassmorphism */}
      <div className="rounded-2xl backdrop-blur-xl p-3 mb-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex items-center gap-3">
          {/* Calendar Icon */}
          <span className="text-[var(--text-muted)] flex-shrink-0">
            <CalendarIcon />
          </span>

          {/* Start Date */}
          <button
            onClick={() => (document.getElementById('start-date-input') as HTMLInputElement)?.showPicker?.()}
            className="flex items-baseline gap-1 hover:opacity-80 transition-opacity"
          >
            <span className="text-sm font-display font-semibold text-[var(--text-primary)]">
              {formatDateParts(startDate).dayMonth}
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              {formatDateParts(startDate).year}
            </span>
          </button>
          <input
            id="start-date-input"
            type="date"
            value={formatInputDate(startDate)}
            onChange={handleStartDateChange}
            max={formatInputDate(today)}
            className="sr-only"
          />

          {/* Separator */}
          <span className="text-[var(--text-muted)] text-sm">—</span>

          {/* End Date */}
          <button
            onClick={() => (document.getElementById('end-date-input') as HTMLInputElement)?.showPicker?.()}
            className="flex items-baseline gap-1 hover:opacity-80 transition-opacity"
          >
            <span className="text-sm font-display font-semibold text-[var(--text-primary)]">
              {formatDateParts(endDate).dayMonth}
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              {formatDateParts(endDate).year}
            </span>
          </button>
          <input
            id="end-date-input"
            type="date"
            value={formatInputDate(endDate)}
            onChange={handleEndDateChange}
            max={formatInputDate(today)}
            className="sr-only"
          />

          {/* Days count badge */}
          <span className="ml-auto text-xs text-[var(--text-muted)] bg-[var(--bg-soft)] px-2 py-1 rounded-full">
            {daysInRange}d
          </span>
        </div>
      </div>

      {!hasData ? (
        <div className="rounded-3xl backdrop-blur-xl p-8 text-center" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--nap-color)]/20 flex items-center justify-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--nap-color)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>
          <h3 className="text-lg font-display font-semibold text-[var(--text-primary)] mb-2">
            No data yet
          </h3>
          <p className="text-[var(--text-muted)] text-sm">
            Start tracking sleep to see your stats here
          </p>
        </div>
      ) : (
        <>
          {/* Summary Cards - Glassmorphism */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="rounded-3xl backdrop-blur-xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
              <p className="text-xs text-[var(--text-muted)] mb-1 font-display">Avg. Total Sleep</p>
              <p className="text-2xl font-display font-bold text-[var(--text-primary)]">
                {formatHours(averages.avgTotal)}
              </p>
            </div>
            <div className="rounded-3xl backdrop-blur-xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
              <p className="text-xs text-[var(--text-muted)] mb-1 font-display">Avg. Naps/Day</p>
              <p className="text-2xl font-display font-bold text-[var(--nap-color)]">
                {averages.avgNapCount.toFixed(1)}
              </p>
            </div>
            <div className="rounded-3xl backdrop-blur-xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
              <p className="text-xs text-[var(--text-muted)] mb-1 font-display">Avg. Nap Time</p>
              <p className="text-2xl font-display font-bold text-[var(--nap-color)]">
                {formatHours(averages.avgNap)}
              </p>
            </div>
            <div className="rounded-3xl backdrop-blur-xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
              <p className="text-xs text-[var(--text-muted)] mb-1 font-display">Avg. Night Sleep</p>
              <p className="text-2xl font-display font-bold text-[var(--night-color)]">
                {formatHours(averages.avgNight)}
              </p>
            </div>
          </div>

          {/* Sleep Distribution Donut */}
          {distributionData && (
            <div className="rounded-3xl backdrop-blur-xl p-4 mb-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 className="text-sm font-display font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4">
                Total Sleep Distribution
              </h3>
              <div className="flex justify-center">
                <div className="relative" style={{ width: 180, height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distributionData.slices}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                        stroke="none"
                      >
                        <Cell fill={nightColor} />
                        <Cell fill={napColor} />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-display font-bold text-[var(--text-primary)]">100%</span>
                    <span className="text-xs text-[var(--text-muted)]">Total</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-6 mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: nightColor }} />
                  <span className="text-xs text-[var(--text-muted)]">Night: {distributionData.nightPct}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: napColor }} />
                  <span className="text-xs text-[var(--text-muted)]">Day: {distributionData.napPct}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Daily Bar Chart - Glassmorphism */}
          <div className="rounded-3xl backdrop-blur-xl p-4 mb-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 className="text-sm font-display font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4">
              Daily Sleep
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rangeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={gridColor}
                    strokeOpacity={0.1}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    interval={daysInRange > 8 ? 1 : 0}
                  />
                  <YAxis
                    tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${Math.round(value / 60)}h`}
                  />
                  <Tooltip content={<BarTooltip />} cursor={{ fill: 'var(--bg-soft)', opacity: 0.5 }} />
                  <Bar dataKey="night" stackId="sleep" fill={nightColor} radius={[0, 0, 4, 4]} />
                  <Bar dataKey="nap" stackId="sleep" fill={napColor} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ background: napColor }} />
                <span className="text-xs text-[var(--text-muted)]">Naps</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ background: nightColor }} />
                <span className="text-xs text-[var(--text-muted)]">Night</span>
              </div>
            </div>
          </div>

          {/* Sleep Trend Area Chart - Glassmorphism */}
          <div className="rounded-3xl backdrop-blur-xl p-4 mb-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 className="text-sm font-display font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4">
              Sleep Trend
            </h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={rangeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="napGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={napColor} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={napColor} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="nightGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={nightColor} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={nightColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={gridColor}
                    strokeOpacity={0.1}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    interval={daysInRange > 8 ? 1 : 0}
                  />
                  <YAxis
                    tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${Math.round(value / 60)}h`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="night"
                    stroke={nightColor}
                    strokeWidth={2}
                    fill="url(#nightGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="nap"
                    stroke={napColor}
                    strokeWidth={2}
                    fill="url(#napGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Woke Up Chart */}
          {wakeUpData && (
            <div className="rounded-3xl backdrop-blur-xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 className="text-sm font-display font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4">
                Woke Up
              </h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={wakeUpData.points} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="wakeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={wakeColor} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={wakeColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={gridColor}
                      strokeOpacity={0.1}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      interval={wakeUpData.points.length > 8 ? 1 : 0}
                    />
                    <YAxis
                      domain={wakeUpData.domain}
                      tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={formatWakeTime}
                    />
                    <Tooltip content={<WakeTooltip />} />
                    <ReferenceLine
                      y={wakeUpData.avg}
                      stroke={wakeColor}
                      strokeDasharray="6 4"
                      strokeOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="wakeMinutes"
                      stroke={wakeColor}
                      strokeWidth={2}
                      fill="url(#wakeGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-center text-xs font-display font-semibold mt-3" style={{ color: wakeColor }}>
                Average: {formatWakeTime(wakeUpData.avg)}
              </p>
            </div>
          )}

          {/* Bedtime Chart */}
          {bedtimeData && (
            <div className="rounded-3xl backdrop-blur-xl p-4 mt-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 className="text-sm font-display font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4">
                Bedtime
              </h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={bedtimeData.points} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="bedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={nightColor} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={nightColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={gridColor}
                      strokeOpacity={0.1}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      interval={bedtimeData.points.length > 8 ? 1 : 0}
                    />
                    <YAxis
                      domain={bedtimeData.domain}
                      tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={formatWakeTime}
                    />
                    <Tooltip content={<BedTooltip />} />
                    <ReferenceLine
                      y={bedtimeData.avg}
                      stroke={nightColor}
                      strokeDasharray="6 4"
                      strokeOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="bedMinutes"
                      stroke={nightColor}
                      strokeWidth={2}
                      fill="url(#bedGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-center text-xs font-display font-semibold mt-3" style={{ color: nightColor }}>
                Average: {formatWakeTime(bedtimeData.avg)}
              </p>
            </div>
          )}

          {/* Daily Schedule Gantt Chart */}
          {scheduleData && (
            <div className="rounded-3xl backdrop-blur-xl p-4 mt-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 className="text-sm font-display font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4">
                Daily Schedule
              </h3>

              <div className="flex">
                {/* Date labels column */}
                <div className="w-10 flex-shrink-0">
                  {/* Spacer for time axis */}
                  <div className="h-5" />
                  {scheduleData.days.map((day) => (
                    <div key={day.day} className="h-7 flex items-center">
                      <span className="text-[10px] text-[var(--text-muted)]">{day.day}</span>
                    </div>
                  ))}
                </div>

                {/* Chart area */}
                <div className="flex-1 relative overflow-hidden">
                  {/* Time axis */}
                  <div className="h-5 relative">
                    {scheduleData.ticks.map((tick) => {
                      const pct = ((tick - scheduleData.minTime) / scheduleData.range) * 100;
                      return (
                        <span
                          key={tick}
                          className="absolute text-[10px] text-[var(--text-muted)] -translate-x-1/2"
                          style={{ left: `${pct}%` }}
                        >
                          {formatWakeTime(tick)}
                        </span>
                      );
                    })}
                  </div>

                  {/* Rows with grid lines */}
                  <div className="relative">
                    {/* Grid lines */}
                    {scheduleData.ticks.map((tick) => {
                      const pct = ((tick - scheduleData.minTime) / scheduleData.range) * 100;
                      return (
                        <div
                          key={tick}
                          className="absolute top-0 bottom-0 w-px"
                          style={{ left: `${pct}%`, background: 'var(--text-muted)', opacity: 0.1 }}
                        />
                      );
                    })}

                    {/* Day rows */}
                    {scheduleData.days.map((day) => (
                      <div key={day.day} className="h-7 relative flex items-center">
                        {day.events.map((event, i) => {
                          if (event.type === 'wake') {
                            const pct = ((event.startMin - scheduleData.minTime) / scheduleData.range) * 100;
                            return (
                              <div
                                key={`wake-${i}`}
                                className="absolute w-[7px] h-[7px] rounded-sm"
                                style={{ left: `${pct}%`, transform: 'translateX(-50%)', background: 'var(--wake-color)' }}
                              />
                            );
                          }
                          if (event.type === 'bedtime') {
                            const pct = ((event.startMin - scheduleData.minTime) / scheduleData.range) * 100;
                            return (
                              <div
                                key={`bed-${i}`}
                                className="absolute w-[7px] h-[7px] rounded-sm"
                                style={{ left: `${pct}%`, transform: 'translateX(-50%)', background: 'var(--night-color)' }}
                              />
                            );
                          }
                          if (event.type === 'nap' && event.endMin != null) {
                            const leftPct = ((event.startMin - scheduleData.minTime) / scheduleData.range) * 100;
                            const widthPct = ((event.endMin - event.startMin) / scheduleData.range) * 100;
                            const color = getNapColor(event.napIndex!);
                            return (
                              <div
                                key={`nap-${i}`}
                                className="absolute h-[7px] rounded-full"
                                style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 1)}%`, background: color }}
                              />
                            );
                          }
                          return null;
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-[7px] h-[7px] rounded-sm" style={{ background: 'var(--wake-color)' }} />
                  <span className="text-[10px] text-[var(--text-muted)]">Wake Up</span>
                </div>
                {Array.from({ length: scheduleData.maxNapIndex }, (_, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-3 h-[7px] rounded-full" style={{ background: getNapColor(i + 1) }} />
                    <span className="text-[10px] text-[var(--text-muted)]">Nap {i + 1}</span>
                  </div>
                ))}
                <div className="flex items-center gap-1.5">
                  <div className="w-[7px] h-[7px] rounded-sm" style={{ background: 'var(--night-color)' }} />
                  <span className="text-[10px] text-[var(--text-muted)]">Bedtime</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
