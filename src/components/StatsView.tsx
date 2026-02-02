import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
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
    <div className="bg-[var(--bg-elevated)] px-3 py-2 rounded-xl shadow-lg border border-white/10">
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
    <div className="bg-[var(--bg-elevated)] px-3 py-2 rounded-xl shadow-lg border border-white/10">
      <p className="text-xs text-[var(--text-muted)] mb-1">{label}</p>
      <p className="text-sm font-semibold text-[var(--text-primary)]">
        Total: {formatHours(total)}
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
        day: format(date, 'dd'),
        fullDate: format(date, 'MMM d'),
        nap: napMinutes,
        night: nightMinutes,
        total: napMinutes + nightMinutes,
        napCount: dayEntries.filter((e) => e.type === 'nap').length,
      };
    });
  }, [entries, startDate, endDate]);

  // Calculate averages
  const averages = useMemo(() => {
    const daysWithData = rangeData.filter((d) => d.total > 0);
    if (daysWithData.length === 0) {
      return { avgTotal: 0, avgNap: 0, avgNight: 0, avgNapCount: 0 };
    }

    const avgTotal = Math.round(
      daysWithData.reduce((sum, d) => sum + d.total, 0) / daysWithData.length
    );
    const avgNap = Math.round(
      daysWithData.reduce((sum, d) => sum + d.nap, 0) / daysWithData.length
    );
    const avgNight = Math.round(
      daysWithData.reduce((sum, d) => sum + d.night, 0) / daysWithData.length
    );
    const avgNapCount =
      daysWithData.reduce((sum, d) => sum + d.napCount, 0) / daysWithData.length;

    return { avgTotal, avgNap, avgNight, avgNapCount };
  }, [rangeData]);

  // Get CSS variable values for charts
  const napColor = 'var(--nap-color)';
  const nightColor = 'var(--night-color)';
  const gridColor = 'var(--text-muted)';

  const hasData = entries.length > 0;
  const daysInRange = differenceInDays(endDate, startDate) + 1;

  return (
    <div className="pb-32 px-6 fade-in">
      {/* Header */}
      <div className="pt-8 mb-4">
        <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">
          Sleep trends & Stats
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Take a look at your baby's sleeping patterns
        </p>
      </div>

      {/* Date Range Filter - Unified Container */}
      <div className="card p-3 mb-6">
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
        <div className="card p-8 text-center">
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
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="card p-4">
              <p className="text-xs text-[var(--text-muted)] mb-1 font-display">Avg. Total Sleep</p>
              <p className="text-2xl font-display font-bold text-[var(--text-primary)]">
                {formatHours(averages.avgTotal)}
              </p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-[var(--text-muted)] mb-1 font-display">Avg. Naps/Day</p>
              <p className="text-2xl font-display font-bold text-[var(--nap-color)]">
                {averages.avgNapCount.toFixed(1)}
              </p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-[var(--text-muted)] mb-1 font-display">Avg. Nap Time</p>
              <p className="text-2xl font-display font-bold text-[var(--nap-color)]">
                {formatHours(averages.avgNap)}
              </p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-[var(--text-muted)] mb-1 font-display">Avg. Night Sleep</p>
              <p className="text-2xl font-display font-bold text-[var(--night-color)]">
                {formatHours(averages.avgNight)}
              </p>
            </div>
          </div>

          {/* Daily Bar Chart */}
          <div className="card p-4 mb-6">
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
                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    interval={daysInRange > 10 ? 1 : 0}
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

          {/* Sleep Trend Area Chart */}
          <div className="card p-4">
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
                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    interval={daysInRange > 10 ? 1 : 0}
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
        </>
      )}
    </div>
  );
}
