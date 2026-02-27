import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useFocusTrap } from '../hooks/useFocusTrap';
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
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  addDays,
  getDay,
  isSameDay,
  isWithinInterval,
} from 'date-fns';
import type { SleepEntry, WeightLog, HeightLog } from '../types';
import type { BabyProfile } from '../types';
import { getDateFnsLocale } from '../utils/dateFnsLocale';
import { SleepReportView } from './SleepReportView';

/** X-axis tick: day name above date (Napper-style). Recharts passes payload as { value } or the value itself. */
function DayDateTick(props: {
  x?: number;
  y?: number;
  payload?: { value?: string } | string;
  index?: number;
  data?: Array<{ day: string; dayName?: string }>;
}) {
  const { x = 0, y = 0, payload, index = 0, data } = props;
  const value = typeof payload === 'object' && payload?.value != null ? payload.value : (payload as string) ?? '';
  const dayName = data?.[index]?.dayName ?? (data ? data.find((d) => d.day === value)?.dayName : undefined) ?? '';
  // Slight offset so day/date block isn't flush against the chart (Napper-quality breathing room)
  const firstLineOffset = 4;
  return (
    <g transform={`translate(${x},${y})`}>
      <text textAnchor="middle" fill="var(--text-secondary)" fontSize={10}>
        <tspan x={0} dy={firstLineOffset}>
          {dayName}
        </tspan>
        <tspan x={0} dy={12}>
          {value}
        </tspan>
      </text>
    </g>
  );
}

interface StatsViewProps {
  entries: SleepEntry[];
  profile?: BabyProfile | null;
  weightLogs?: WeightLog[];
  heightLogs?: HeightLog[];
  /** Optional: when provided, one-point growth state shows a plus button that calls this (e.g. navigate to Profile to add). */
  onAddWeight?: () => void;
  /** Optional: when provided, one-point growth state shows a plus button that calls this. */
  onAddHeight?: () => void;
}

const MAX_DAYS = 15;

/** Chart margins: left fits Y-axis labels; right matches left for balanced horizontal padding. */
const CHART_MARGIN = { top: 10, right: 38, left: 38, bottom: 32 };

/** Time/weight/height: left fits "08:30", "2 kg", "70 cm" labels; right matches left. */
const CHART_MARGIN_LONG_Y = { top: 10, right: 46, left: 46, bottom: 48 };

/** Y-axis width: must be > 0 or Recharts does not render tick labels (duration: 0h, 1h 30m; long: time/kg/cm). */
const Y_AXIS_WIDTH_SHORT = 36;
const Y_AXIS_WIDTH_LONG = 44;

/** Adaptive Y-domain from data (avoid 0–max scale when data is e.g. 50–70 cm). */
function adaptiveWeightDomain(values: number[]): [number, number] {
  if (values.length === 0) return [0, 10];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const padding = range * 0.15;
  const low = Math.floor((min - padding) * 2) / 2;
  const high = Math.ceil((max + padding) * 2) / 2;
  return [Math.max(0, low), high];
}

function adaptiveHeightDomain(values: number[]): [number, number] {
  if (values.length === 0) return [0, 100];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 10);
  const padding = range * 0.15;
  const low = Math.floor((min - padding) / 5) * 5;
  const high = Math.ceil((max + padding) / 5) * 5;
  return [Math.max(0, low), high];
}

/** Y-axis for duration (minutes): 4–6 ticks only, round steps (0h, 3h, 6h…). Data-viz rule: avoid clutter. */
const DURATION_MAX_TICKS = 6;

function durationAxisProps(values: number[]): { domain: [number, number]; ticks: number[] } {
  const max = values.length > 0 ? Math.max(...values, 60) : 60;
  const top = Math.ceil(max / 60) * 60; // round up to full hour
  const domain: [number, number] = [0, top];
  // Step so we get at most DURATION_MAX_TICKS ticks; prefer 30min, 1h, 2h, 3h
  let stepMinutes = 30;
  if (top > 600) stepMinutes = 180;
  else if (top > 300) stepMinutes = 120;
  else if (top > 120) stepMinutes = 60;
  const ticks: number[] = [0];
  for (let t = stepMinutes; t < top; t += stepMinutes) ticks.push(t);
  if (ticks[ticks.length - 1] !== top) ticks.push(top);
  // Hard cap so we never render more than DURATION_MAX_TICKS
  if (ticks.length > DURATION_MAX_TICKS) {
    const step = Math.ceil(top / (DURATION_MAX_TICKS - 1) / 60) * 60;
    const reduced: number[] = [0];
    for (let t = step; t < top; t += step) reduced.push(t);
    if (reduced[reduced.length - 1] !== top) reduced.push(top);
    return { domain, ticks: reduced };
  }
  return { domain, ticks };
}

/** Format duration (minutes) for Y-axis: 0h, 30m, 1h, 1h 30m, … */
function formatDurationAxis(minutes: number): string {
  if (minutes === 0) return '0h';
  if (minutes < 60) return `${minutes}m`;
  if (minutes % 60 === 0) return `${minutes / 60}h`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

/** Y-axis ticks for time-of-day (minutes since midnight): 4–6 round clock times (e.g. 19:00, 19:30, 20:00). */
const TIME_OF_DAY_MAX_TICKS = 6;

function timeOfDayAxisTicks(domain: [number, number]): number[] {
  const [minMins, maxMins] = domain;
  const range = maxMins - minMins;
  const step = range <= 90 ? 30 : range <= 180 ? 60 : 120; // 30min or 1h/2h
  const start = Math.floor(minMins / 30) * 30;
  const ticks: number[] = [];
  for (let t = start; t <= maxMins + 1e-6 && ticks.length < TIME_OF_DAY_MAX_TICKS + 1; t += step) ticks.push(t);
  if (ticks.length > 0 && ticks[ticks.length - 1] < maxMins) ticks.push(Math.ceil(maxMins / 30) * 30);
  return ticks.length > 0 ? ticks : [minMins, maxMins];
}

const GROWTH_MAX_TICKS = 6;

/** Weight Y-axis: 4–6 ticks, round steps; cap count to avoid clutter. */
function weightAxisTicks(domain: [number, number]): number[] {
  const [low, high] = domain;
  const range = Math.max(high - low, 0.5);
  let step = range <= 1 ? 0.25 : range <= 3 ? 0.5 : 1;
  const ticks: number[] = [];
  const start = Math.floor(low / step) * step;
  for (let v = start; v <= high + 1e-6; v += step) ticks.push(Math.round(v * 100) / 100);
  while (ticks.length > GROWTH_MAX_TICKS && step <= 10) {
    step *= 2;
    ticks.length = 0;
    const s = Math.floor(low / step) * step;
    for (let v = s; v <= high + 1e-6; v += step) ticks.push(Math.round(v * 100) / 100);
  }
  return ticks.length > 0 ? ticks : [low, high];
}

/** Height Y-axis: 4–6 ticks, round steps (5 or 10 cm); cap count to avoid clutter. */
function heightAxisTicks(domain: [number, number]): number[] {
  const [low, high] = domain;
  const range = Math.max(high - low, 5);
  let step = range <= 10 ? 2 : range <= 30 ? 5 : 10;
  const ticks: number[] = [];
  const start = Math.floor(low / step) * step;
  for (let v = start; v <= high + 1e-6; v += step) ticks.push(v);
  while (ticks.length > GROWTH_MAX_TICKS && step <= 20) {
    step = step <= 5 ? 10 : 20;
    ticks.length = 0;
    const s = Math.floor(low / step) * step;
    for (let v = s; v <= high + 1e-6; v += step) ticks.push(v);
  }
  return ticks.length > 0 ? ticks : [low, high];
}

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

// Average nap duration tooltip (minutes per day)
function AvgNapTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const mins = payload[0]?.value as number;
  return (
    <div className="bg-[var(--bg-elevated)] px-3 py-2 rounded-xl shadow-lg border border-[var(--glass-border)]">
      <p className="text-xs text-[var(--text-muted)] mb-1">{label}</p>
      <p className="text-sm font-medium" style={{ color: 'var(--nap-color)' }}>
        Avg. nap: {formatHours(mins)}
      </p>
    </div>
  );
}

// Growth (weight/height) tooltip
function GrowthTooltip({
  active,
  payload,
  label,
  unit,
}: TooltipProps & { unit: string }) {
  if (!active || !payload || !payload.length) return null;
  const value = payload[0].value as number;
  return (
    <div className="bg-[var(--bg-elevated)] px-3 py-2 rounded-xl shadow-lg border border-[var(--glass-border)]">
      <p className="text-xs text-[var(--text-muted)] mb-1">{label}</p>
      <p className="text-sm font-medium text-[var(--text-primary)]">
        {typeof value === 'number' ? value.toFixed(1) : value} {unit}
      </p>
    </div>
  );
}

/** One-point growth state: ghost line + CTA + optional plus button so the chart area doesn't feel broken. */
function GrowthOnePointEmptyState({
  titleKey,
  valueLabel,
  addButtonLabel,
  onAdd,
  lineColor,
}: {
  titleKey: string;
  valueLabel: string;
  addButtonLabel: string;
  onAdd?: () => void;
  lineColor: string;
}) {
  const { t } = useTranslation();
  return (
    <div className="rounded-3xl backdrop-blur-xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
      <h3 className="text-sm font-display font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">
        {t(titleKey)}
      </h3>
      <div className="h-40 -mx-4 flex flex-col items-center justify-center relative" aria-hidden="true">
        {/* Ghost line: dashed horizontal at mid height to suggest "one point, add more for trend" */}
        <div
          className="absolute left-0 right-0 top-1/2 h-0 border-t border-dashed opacity-40"
          style={{ borderColor: lineColor }}
        />
        <span className="text-sm font-display font-medium text-[var(--text-secondary)] mt-2">{valueLabel}</span>
      </div>
      <p className="text-center text-xs text-[var(--text-muted)] mt-2">{t('growth.addAnotherToSeeTrend')}</p>
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="mt-3 w-full py-2.5 rounded-xl font-display font-medium text-sm flex items-center justify-center gap-2 transition-colors"
          style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: lineColor }}
        >
          <span className="w-5 h-5 rounded-full flex items-center justify-center border-2 border-current" aria-hidden="true">+</span>
          {addButtonLabel}
        </button>
      )}
    </div>
  );
}

// Calendar icon for date range control
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

const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 6 15 12 9 18" />
  </svg>
);

// ── Date Range Picker Sheet ─────────────────────────────
// Single bottom sheet to pick start and end date as a range (not two separate date inputs).
// First tap sets start, second tap sets end; range is clamped to maxDays and maxDate (today).
function DateRangePickerSheet({
  isOpen,
  onClose,
  startDate,
  endDate,
  onRangeChange,
  maxDays,
  maxDate,
}: {
  isOpen: boolean;
  onClose: () => void;
  startDate: Date;
  endDate: Date;
  onRangeChange: (start: Date, end: Date) => void;
  maxDays: number;
  maxDate: Date;
}) {
  const [calendarMonth, setCalendarMonth] = useState(() => startOfMonth(startDate));
  // Temporary range while user is selecting (start + end); applying commits to parent
  const [tempStart, setTempStart] = useState<Date>(startDate);
  const [tempEnd, setTempEnd] = useState<Date | null>(endDate);

  const handleOpen = useCallback(() => {
    setCalendarMonth(startOfMonth(startDate));
    setTempStart(startDate);
    setTempEnd(endDate);
  }, [startDate, endDate]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(calendarMonth);
    const monthEnd = endOfMonth(calendarMonth);
    const startDayOfWeek = getDay(monthStart);
    const offset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];
    for (let i = offset - 1; i >= 0; i--) {
      days.push({ date: addDays(monthStart, -i - 1), isCurrentMonth: false });
    }
    let d = monthStart;
    while (d <= monthEnd) {
      days.push({ date: d, isCurrentMonth: true });
      d = addDays(d, 1);
    }
    let trailIdx = 1;
    while (days.length % 7 !== 0) {
      days.push({ date: addDays(monthEnd, trailIdx++), isCurrentMonth: false });
    }
    return days;
  }, [calendarMonth]);

  const handleDayClick = (date: Date) => {
    const normalized = startOfDay(date);
    if (isAfter(normalized, maxDate)) return;

    if (tempEnd !== null) {
      // Starting a new range
      setTempStart(normalized);
      setTempEnd(null);
      return;
    }

    // Setting end date
    let newStart = tempStart;
    let newEnd = normalized;
    if (isBefore(newEnd, newStart)) [newStart, newEnd] = [newEnd, newStart];
    const daysDiff = differenceInDays(newEnd, newStart) + 1;
    if (daysDiff > maxDays) {
      newEnd = addDays(newStart, maxDays - 1);
    }
    if (isAfter(newEnd, maxDate)) newEnd = maxDate;
    setTempStart(newStart);
    setTempEnd(newEnd);
  };

  const handleApply = () => {
    const end = tempEnd ?? tempStart;
    const start = tempStart;
    let finalStart = start;
    let finalEnd = end;
    if (isAfter(finalEnd, finalStart)) {
      const daysDiff = differenceInDays(finalEnd, finalStart) + 1;
      if (daysDiff > maxDays) finalEnd = addDays(finalStart, maxDays - 1);
    } else {
      finalEnd = finalStart;
    }
    if (isAfter(finalEnd, maxDate)) finalEnd = maxDate;
    onRangeChange(finalStart, finalEnd);
    onClose();
  };

  const rangeStart = tempStart;
  const rangeEnd = tempEnd ?? tempStart;
  const [lo, hi] = isBefore(rangeStart, rangeEnd) ? [rangeStart, rangeEnd] : [rangeEnd, rangeStart];

  const dialogRef = useFocusTrap(isOpen, onClose);
  const y = useMotionValue(0);
  const backdropOpacity = useTransform(y, [0, 300], [1, 0]);

  const handleDragEnd = (_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
    if (info.offset.y > 150 || info.velocity.y > 500) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ opacity: backdropOpacity, zIndex: 100 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            onAnimationStart={handleOpen}
            aria-hidden="true"
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Pick date range"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={handleDragEnd}
            style={{ y, zIndex: 100 }}
            className="fixed bottom-0 left-0 right-0 touch-none"
          >
            <div className="bg-[var(--bg-card)] rounded-t-[2rem] shadow-[0_-8px_40px_rgba(0,0,0,0.3)] max-w-lg mx-auto">
              <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
                <div className="w-10 h-1 bg-[var(--text-muted)]/30 rounded-full" />
              </div>
              <div className="flex items-center justify-between px-6 pb-4">
                <button
                  type="button"
                  onClick={() => setCalendarMonth((prev) => subMonths(prev, 1))}
                  className="w-11 h-11 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)] transition-all"
                  aria-label="Previous month"
                >
                  <ChevronLeftIcon />
                </button>
                <span className="font-display font-semibold text-[var(--text-primary)] text-lg">
                  {format(calendarMonth, 'MMMM yyyy')}
                </span>
                <button
                  type="button"
                  onClick={() => setCalendarMonth((prev) => addMonths(prev, 1))}
                  className="w-11 h-11 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)] transition-all"
                  aria-label="Next month"
                >
                  <ChevronRightIcon />
                </button>
              </div>
              <div className="grid grid-cols-7 px-4 mb-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                  <div key={d} className="text-center text-xs font-medium text-[var(--text-muted)]">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 px-4 gap-y-1">
                {calendarDays.map(({ date, isCurrentMonth }, i) => {
                  const isInRange =
                    isWithinInterval(date, { start: lo, end: hi }) ||
                    isSameDay(date, lo) ||
                    isSameDay(date, hi);
                  const isStart = isSameDay(date, lo);
                  const isEnd = isSameDay(date, hi);
                  const isTodayCell = isToday(date);
                  const isDisabled = isAfter(date, maxDate);

                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleDayClick(date)}
                      disabled={isDisabled}
                      aria-label={format(date, 'EEEE, MMMM d, yyyy')}
                      className={`flex items-center justify-center py-1 rounded-xl min-h-[44px] transition-all ${
                        !isCurrentMonth ? 'opacity-20' : ''
                      } ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                          isStart || isEnd
                            ? 'bg-[var(--nap-color)] text-[var(--text-on-accent)] font-semibold'
                            : isInRange
                              ? 'bg-[var(--nap-color)]/30 text-[var(--text-primary)]'
                              : isTodayCell
                                ? 'ring-1 ring-[var(--text-muted)] text-[var(--text-primary)]'
                                : 'text-[var(--text-secondary)]'
                        }`}
                      >
                        {format(date, 'd')}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-col items-center gap-3 px-6 pt-4 pb-28">
                <button
                  type="button"
                  onClick={handleApply}
                  className="w-full py-3 rounded-2xl font-display font-semibold text-sm bg-[var(--nap-color)] text-[var(--text-on-accent)] active:scale-[0.97] transition-transform"
                >
                  Apply range
                </button>
                <button type="button" onClick={onClose} className="py-2 font-display font-medium text-sm text-[var(--text-muted)]">
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export type StatsSection = 'summary' | 'naps' | 'night' | 'growth';

export function StatsView({ entries, profile = null, weightLogs = [], heightLogs = [], onAddWeight, onAddHeight }: StatsViewProps) {
  const { t } = useTranslation();
  // Date range state - default to last 7 days
  const today = new Date();
  const [endDate, setEndDate] = useState<Date>(today);
  const [startDate, setStartDate] = useState<Date>(subDays(today, 6));
  const [isRangePickerOpen, setIsRangePickerOpen] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [statsSection, setStatsSection] = useState<StatsSection>('summary');
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Keep selected chip in view without scrolling to the end (center it when possible)
  useEffect(() => {
    const idx = (['summary', 'naps', 'night', 'growth'] as const).indexOf(statsSection);
    chipRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [statsSection]);

  const handleRangeChange = useCallback((start: Date, end: Date) => {
    setStartDate(startOfDay(start));
    setEndDate(startOfDay(end));
  }, []);

  // Calculate data for date range (dayName for X-axis: "Wed" / "mié." above date)
  const rangeData = useMemo(() => {
    const locale = getDateFnsLocale();
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
        dayName: format(date, 'EEE', { locale }),
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
      return { avgTotal: 0, avgNapDuration: 0, avgNight: 0, avgNapCount: 0 };
    }

    const avgTotal = Math.round(
      completedDaysWithData.reduce((sum, d) => sum + d.total, 0) / completedDaysWithData.length
    );
    const avgNight = Math.round(
      completedDaysWithData.reduce((sum, d) => sum + d.night, 0) / completedDaysWithData.length
    );
    const avgNapCount =
      completedDaysWithData.reduce((sum, d) => sum + d.napCount, 0) / completedDaysWithData.length;

    // Average individual nap duration (total nap minutes / total nap count across all days)
    const totalNapMinutes = completedDaysWithData.reduce((sum, d) => sum + d.nap, 0);
    const totalNapCount = completedDaysWithData.reduce((sum, d) => sum + d.napCount, 0);
    const avgNapDuration = totalNapCount > 0 ? Math.round(totalNapMinutes / totalNapCount) : 0;

    return { avgTotal, avgNapDuration, avgNight, avgNapCount };
  }, [rangeData]);
  void averages; // kept for when KPIs/insight are uncommented

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

  // Daytime sleep distribution by nap slot (Nap 1, Nap 2, Nap 3…) for Napper-style donut in Naps section
  const napDistributionData = useMemo(() => {
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const byIndex: Record<number, number> = {};

    for (const date of days) {
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      const dayNaps = entries
        .filter(
          (e) =>
            e.type === 'nap' &&
            e.endTime &&
            isWithinInterval(parseISO(e.startTime), { start: dayStart, end: dayEnd })
        )
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

      dayNaps.forEach((nap, idx) => {
        const napIndex = idx + 1;
        const mins = calculateDuration(nap.startTime, nap.endTime!);
        byIndex[napIndex] = (byIndex[napIndex] ?? 0) + mins;
      });
    }

    const total = Object.values(byIndex).reduce((s, m) => s + m, 0);
    if (total === 0) return null;

    const slices = Object.entries(byIndex)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([index, value]) => ({
        napIndex: Number(index),
        value,
        pct: Math.round((value / total) * 100),
      }));

    return { total, slices };
  }, [entries, startDate, endDate]);

  // Wake-up times from night entries
  const wakeUpData = useMemo(() => {
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const points: { day: string; dayName: string; wakeMinutes: number }[] = [];

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
        const locale = getDateFnsLocale();
        points.push({
          day: format(date, 'd/M'),
          dayName: format(date, 'EEE', { locale }),
          wakeMinutes: minutesSinceMidnight,
        });
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

    const points: { day: string; dayName: string; bedMinutes: number }[] = [];

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
        const locale = getDateFnsLocale();
        points.push({
          day: format(date, 'd/M'),
          dayName: format(date, 'EEE', { locale }),
          bedMinutes: minutesSinceMidnight,
        });
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

  // Per-day average nap duration (nap minutes / nap count for that day) for Naps section chart
  const averageNapChartData = useMemo(() => {
    return rangeData
      .filter((d) => !d.isToday)
      .map((d) => ({
        day: d.day,
        dayName: d.dayName,
        avgNapMinutes: d.napCount > 0 ? Math.round(d.nap / d.napCount) : 0,
      }));
  }, [rangeData]);

  // Explicit Y domain/ticks for duration charts so labels don't duplicate (e.g. 0h, 30m, 1h)
  const averageNapAxis = useMemo(
    () => durationAxisProps(averageNapChartData.map((d) => d.avgNapMinutes)),
    [averageNapChartData]
  );
  const dailySleepAxis = useMemo(
    () => durationAxisProps(rangeData.map((d) => d.nap + d.night)),
    [rangeData]
  );

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

  const weightDomain = useMemo(
    () => adaptiveWeightDomain((weightLogs ?? []).map((l) => l.valueKg)),
    [weightLogs]
  );
  const heightDomain = useMemo(
    () => adaptiveHeightDomain((heightLogs ?? []).map((l) => l.valueCm)),
    [heightLogs]
  );
  const weightTicks = useMemo(() => weightAxisTicks(weightDomain), [weightDomain]);
  const heightTicks = useMemo(() => heightAxisTicks(heightDomain), [heightDomain]);
  const locale = getDateFnsLocale();
  const weightChartData = useMemo(
    () =>
      (weightLogs ?? []).map((l) => {
        const d = parseISO(l.date);
        return { day: format(d, 'd/M'), dayName: format(d, 'EEE', { locale }), value: l.valueKg };
      }),
    [weightLogs, locale]
  );
  const heightChartData = useMemo(
    () =>
      (heightLogs ?? []).map((l) => {
        const d = parseISO(l.date);
        return { day: format(d, 'd/M'), dayName: format(d, 'EEE', { locale }), value: l.valueCm };
      }),
    [heightLogs, locale]
  );
  const wakeUpTicks = useMemo(
    () => (wakeUpData ? timeOfDayAxisTicks(wakeUpData.domain) : []),
    [wakeUpData]
  );
  const bedtimeTicks = useMemo(
    () => (bedtimeData ? timeOfDayAxisTicks(bedtimeData.domain) : []),
    [bedtimeData]
  );

  // Insight chip (Solid sleep patterns / Building patterns) — commented out; re-enable with the Insight Tag JSX below
  // const insight = useMemo(() => {
  //   if (!hasData || averages.avgTotal === 0) return null;
  //   const avgTotalHours = averages.avgTotal / 60;
  //   if (avgTotalHours >= 14) return { text: 'Great sleep this period', color: 'var(--success-color)' };
  //   if (avgTotalHours >= 12) return { text: 'Solid sleep patterns', color: 'var(--nap-color)' };
  //   if (averages.avgNapCount >= 2) return { text: 'Good nap consistency', color: 'var(--nap-color)' };
  //   return { text: 'Building patterns', color: 'var(--wake-color)' };
  // }, [hasData, averages]);

  if (showReport) {
    return (
      <SleepReportView
        entries={entries}
        profile={profile}
        onBack={() => setShowReport(false)}
      />
    );
  }

  return (
    <div className="pb-32 px-6 fade-in">
      {/* Centered page header — same style as My Babies / Settings / Support (SubViewHeader) */}
      <header className="pt-8 pb-2 text-center">
        <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">
          {t('stats.title')}
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          {t('stats.subtitle')}
        </p>
      </header>

      {/* Insight Tag — commented out: "Solid sleep patterns" chip was not useful (user feedback) */}
      {/* {insight && (
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
      )} */}

      {/* Date range picker — single tappable control opens range sheet */}
      <div className="rounded-2xl backdrop-blur-xl p-3 mb-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
        <button
          type="button"
          onClick={() => setIsRangePickerOpen(true)}
          aria-label="Change date range"
          className="w-full flex items-center gap-3 text-left"
        >
          <span className="text-[var(--text-muted)] flex-shrink-0">
            <CalendarIcon />
          </span>
          <div className="flex-1 min-w-0 flex items-baseline gap-2 flex-wrap">
            <span className="text-sm font-display font-semibold text-[var(--text-primary)]">
              {formatDateParts(startDate).dayMonth}
            </span>
            <span className="text-[var(--text-muted)]">–</span>
            <span className="text-sm font-display font-semibold text-[var(--text-primary)]">
              {formatDateParts(endDate).dayMonth}
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              {format(startDate, 'yyyy') === format(endDate, 'yyyy') ? format(endDate, 'yyyy') : `${format(startDate, 'yyyy')} – ${format(endDate, 'yyyy')}`}
            </span>
          </div>
          <span className="text-[var(--text-muted)] flex-shrink-0" aria-hidden="true">
            <ChevronDownIcon />
          </span>
          <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-soft)] px-2 py-1 rounded-full flex-shrink-0">
            {daysInRange}d
          </span>
        </button>
      </div>

      <DateRangePickerSheet
        isOpen={isRangePickerOpen}
        onClose={() => setIsRangePickerOpen(false)}
        startDate={startDate}
        endDate={endDate}
        onRangeChange={handleRangeChange}
        maxDays={MAX_DAYS}
        maxDate={today}
      />

      {/* Section chips (Napper-style): switch dataviz by category */}
      {hasData && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {(['summary', 'naps', 'night', 'growth'] as const).map((section, idx) => (
            <button
              key={section}
              ref={(el) => { chipRefs.current[idx] = el; }}
              type="button"
              onClick={() => setStatsSection(section)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-display font-medium transition-colors ${
                statsSection === section
                  ? 'bg-[var(--night-color)] text-[var(--text-on-accent)]'
                  : 'bg-[var(--bg-soft)] text-[var(--text-muted)] border border-[var(--glass-border)]'
              }`}
            >
              {section === 'summary' && t('stats.chipSummary')}
              {section === 'naps' && t('stats.chipNaps')}
              {section === 'night' && t('stats.chipNight')}
              {section === 'growth' && t('stats.chipGrowth')}
            </button>
          ))}
        </div>
      )}

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
            {t('stats.noDataTitle')}
          </h3>
          <p className="text-[var(--text-muted)] text-sm">
            {t('stats.noDataBody')}
          </p>
        </div>
      ) : (
        <>
          {/* Section: Sleep summary */}
          {statsSection === 'summary' && (
            <>
          {/* KPIs — commented out per user feedback (can restore if needed) */}
          {/* <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="rounded-3xl backdrop-blur-xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
              <p className="text-xs text-[var(--text-muted)] mb-1 font-display">Avg. Total Sleep</p>
              <p className="text-2xl font-display font-bold text-[var(--text-primary)]">
                {formatHours(averages.avgTotal)}
              </p>
            </div>
            <div className="rounded-3xl backdrop-blur-xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
              <p className="text-xs text-[var(--text-muted)] mb-1 font-display">Avg. Night Sleep</p>
              <p className="text-2xl font-display font-bold text-[var(--night-color)]">
                {formatHours(averages.avgNight)}
              </p>
            </div>
            <div className="rounded-3xl backdrop-blur-xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
              <p className="text-xs text-[var(--text-muted)] mb-1 font-display">Avg. Nap Time</p>
              <p className="text-2xl font-display font-bold text-[var(--nap-color)]">
                {formatHours(averages.avgNapDuration)}
              </p>
            </div>
            <div className="rounded-3xl backdrop-blur-xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
              <p className="text-xs text-[var(--text-muted)] mb-1 font-display">Avg. Naps/Day</p>
              <p className="text-2xl font-display font-bold text-[var(--nap-color)]">
                {averages.avgNapCount.toFixed(1)}
              </p>
            </div>
          </div> */}

          {/* Sleep report row — below KPIs; single line to keep height minimal; premium-ready */}
          <div className="rounded-2xl backdrop-blur-xl p-3 mb-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
            <button
              type="button"
              onClick={() => setShowReport(true)}
              aria-label={t('stats.ariaReportButton')}
              className="w-full flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--night-color)] focus-visible:ring-inset rounded-xl"
            >
              <span className="text-[var(--night-color)] flex-shrink-0" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                  <path d="M16 13H8" />
                  <path d="M16 17H8" />
                  <path d="M10 9H8" />
                </svg>
              </span>
              <span className="flex-1 min-w-0 text-sm font-display font-semibold text-[var(--text-primary)]">
                {t('report.title')} <span className="text-[var(--text-muted)] font-normal">· {t('report.subtitle')}</span>
              </span>
              <span className="text-[var(--text-muted)] flex-shrink-0" aria-hidden="true">
                <ChevronRightIcon />
              </span>
            </button>
          </div>

          {/* Sleep Distribution Donut */}
          {distributionData && (
            <div className="rounded-3xl backdrop-blur-xl p-4 mb-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 className="text-sm font-display font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">
                {t('stats.daytimeSleepDistribution')}
              </h3>
              <div className="flex justify-center" role="img" aria-label={t('stats.ariaDistribution')}>
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
                    <span className="text-xs text-[var(--text-muted)]">{t('stats.total')}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-6 mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: nightColor }} />
                  <span className="text-xs text-[var(--text-muted)]">
                    {t('today.night')}: {distributionData.nightPct}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: napColor }} />
                  <span className="text-xs text-[var(--text-muted)]">
                    {t('today.nap')}: {distributionData.napPct}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Daily Bar Chart - Glassmorphism */}
          <div className="rounded-3xl backdrop-blur-xl p-4 mb-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 className="text-sm font-display font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">
              {t('stats.dailySleep')}
            </h3>
            <div className="h-48 -mx-4" role="img" aria-label={t('stats.ariaDailySleep')}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rangeData} margin={CHART_MARGIN}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={gridColor}
                    strokeOpacity={0.1}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    tick={<DayDateTick data={rangeData} />}
                    tickLine={false}
                    axisLine={false}
                    interval={daysInRange > 8 ? 1 : 0}
                    padding={{ left: 0, right: 0 }}
                  />
                  <YAxis
                    width={Y_AXIS_WIDTH_SHORT}
                    domain={dailySleepAxis.domain}
                    ticks={dailySleepAxis.ticks}
                    tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatDurationAxis}
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
                <span className="text-xs text-[var(--text-muted)]">{t('history.naps')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ background: nightColor }} />
                <span className="text-xs text-[var(--text-muted)]">{t('history.night')}</span>
              </div>
            </div>
          </div>

          {/* Sleep Trend Area Chart - Glassmorphism */}
          <div className="rounded-3xl backdrop-blur-xl p-4 mb-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 className="text-sm font-display font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">
              {t('stats.sleepTrend')}
            </h3>
            <div className="h-40 -mx-4" role="img" aria-label={t('stats.ariaSleepTrend')}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={rangeData} margin={CHART_MARGIN}>
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
                    tick={<DayDateTick data={rangeData} />}
                    tickLine={false}
                    axisLine={false}
                    interval={daysInRange > 8 ? 1 : 0}
                    padding={{ left: 0, right: 0 }}
                  />
                  <YAxis
                    width={Y_AXIS_WIDTH_SHORT}
                    domain={dailySleepAxis.domain}
                    ticks={dailySleepAxis.ticks}
                    tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatDurationAxis}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="night"
                    stroke={nightColor}
                    strokeWidth={3}
                    fill="url(#nightGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="nap"
                    stroke={napColor}
                    strokeWidth={3}
                    fill="url(#napGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Schedule Gantt Chart - part of summary */}
          {scheduleData && (
            <div className="rounded-3xl backdrop-blur-xl p-4 mt-6 mb-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 className="text-sm font-display font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">
                {t('stats.dailySchedule')}
              </h3>

              <div className="flex" role="img" aria-label={t('stats.ariaDailySchedule')}>
                <div className="w-10 flex-shrink-0">
                  <div className="h-5" />
                  {scheduleData.days.map((day) => (
                    <div key={day.day} className="h-7 flex items-center">
                      <span className="text-[10px] text-[var(--text-muted)]">{day.day}</span>
                    </div>
                  ))}
                </div>
                <div className="flex-1 relative overflow-hidden">
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
                  <div className="relative">
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
                          if (event.type === 'nap' && typeof event.endMin === 'number') {
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

          {/* Section: Naps */}
          {statsSection === 'naps' && (
            <>
            {/* Naps KPIs — commented out per user feedback */}
            {/* <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="rounded-3xl backdrop-blur-xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
                <p className="text-xs text-[var(--text-muted)] mb-1 font-display">{t('stats.avgNapTime')}</p>
                <p className="text-2xl font-display font-bold text-[var(--nap-color)]">
                  {formatHours(averages.avgNapDuration)}
                </p>
              </div>
              <div className="rounded-3xl backdrop-blur-xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
                <p className="text-xs text-[var(--text-muted)] mb-1 font-display">{t('stats.avgNapsPerDay')}</p>
                <p className="text-2xl font-display font-bold text-[var(--nap-color)]">
                  {averages.avgNapCount.toFixed(1)}
                </p>
              </div>
            </div> */}
            {averageNapChartData.length > 0 && (
              <div className="rounded-3xl backdrop-blur-xl p-4 mb-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
                <h3 className="text-sm font-display font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">
                  Average nap
                </h3>
                <div className="h-40 -mx-4" role="img" aria-label="Average nap duration per day">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={averageNapChartData} margin={CHART_MARGIN}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} strokeOpacity={0.1} vertical={false} />
                      <XAxis dataKey="day" tick={<DayDateTick data={averageNapChartData} />} tickLine={false} axisLine={false} interval={daysInRange > 8 ? 1 : 0} padding={{ left: 0, right: 0 }} />
                      <YAxis width={Y_AXIS_WIDTH_SHORT} domain={averageNapAxis.domain} ticks={averageNapAxis.ticks} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={formatDurationAxis} />
                      <Tooltip content={<AvgNapTooltip />} cursor={{ fill: 'var(--bg-soft)', opacity: 0.5 }} />
                      <Bar dataKey="avgNapMinutes" fill={napColor} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Daytime sleep distribution by nap slot (Napper-style donut: Primera/Segunda/Tercera siesta) */}
            {napDistributionData && napDistributionData.slices.length > 0 && (
              <div className="rounded-3xl backdrop-blur-xl p-4 mb-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
                <h3 className="text-sm font-display font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">
                  {t('stats.daytimeSleepDistribution')}
                </h3>
                <div className="flex justify-center" role="img" aria-label={t('stats.daytimeSleepDistribution')}>
                  <div className="relative" style={{ width: 180, height: 180 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={napDistributionData.slices.map((s) => ({
                            name: s.napIndex === 1 ? t('stats.napFirst') : s.napIndex === 2 ? t('stats.napSecond') : s.napIndex === 3 ? t('stats.napThird') : t('stats.napOrdinal', { n: s.napIndex }),
                            value: s.value,
                          }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          dataKey="value"
                          startAngle={90}
                          endAngle={-270}
                          stroke="none"
                        >
                          {napDistributionData.slices.map((s) => (
                            <Cell key={s.napIndex} fill={getNapColor(s.napIndex)} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-display font-bold text-[var(--text-primary)]">100%</span>
                      <span className="text-xs text-[var(--text-muted)]">{t('stats.total')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-3">
                  {napDistributionData.slices.map((s) => (
                    <div key={s.napIndex} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: getNapColor(s.napIndex) }} />
                      <span className="text-xs text-[var(--text-muted)]">
                        {s.napIndex === 1 ? t('stats.napFirst') : s.napIndex === 2 ? t('stats.napSecond') : s.napIndex === 3 ? t('stats.napThird') : t('stats.napOrdinal', { n: s.napIndex })}: {s.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-3xl backdrop-blur-xl p-4 mb-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 className="text-sm font-display font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">
                {t('stats.dailySleep')}
              </h3>
              <div className="h-48 -mx-4" role="img" aria-label={t('stats.ariaDailySleep')}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rangeData} margin={CHART_MARGIN}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} strokeOpacity={0.1} vertical={false} />
                    <XAxis dataKey="day" tick={<DayDateTick data={rangeData} />} tickLine={false} axisLine={false} interval={daysInRange > 8 ? 1 : 0} padding={{ left: 0, right: 0 }} />
                    <YAxis width={Y_AXIS_WIDTH_SHORT} domain={dailySleepAxis.domain} ticks={dailySleepAxis.ticks} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={formatDurationAxis} />
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
            </>
          )}

          {/* Section: Night sleep */}
          {statsSection === 'night' && (
            <>
            {/* Night KPI — commented out per user feedback */}
            {/* <div className="rounded-3xl backdrop-blur-xl p-4 mb-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
              <p className="text-xs text-[var(--text-muted)] mb-1 font-display">{t('stats.avgNightSleep')}</p>
              <p className="text-2xl font-display font-bold text-[var(--night-color)]">
                {formatHours(averages.avgNight)}
              </p>
            </div> */}
          {/* Woke Up Chart */}
          {wakeUpData && (
            <div className="rounded-3xl backdrop-blur-xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 className="text-sm font-display font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">
                Woke Up
              </h3>
              <div className="h-40 -mx-4" role="img" aria-label="Woke up time trend: morning wake-up time per day with average">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={wakeUpData.points} margin={CHART_MARGIN_LONG_Y}>
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
                      tick={<DayDateTick data={wakeUpData.points} />}
                      tickLine={false}
                      axisLine={false}
                      interval={wakeUpData.points.length > 8 ? 1 : 0}
                      padding={{ left: 0, right: 0 }}
                    />
                    <YAxis
                      width={Y_AXIS_WIDTH_LONG}
                      domain={wakeUpData.domain}
                      ticks={wakeUpTicks}
                      tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
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
                      strokeWidth={3}
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
              <h3 className="text-sm font-display font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">
                Bedtime
              </h3>
              <div className="h-40 -mx-4" role="img" aria-label="Bedtime trend: bedtime per day with average">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={bedtimeData.points} margin={CHART_MARGIN_LONG_Y}>
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
                      tick={<DayDateTick data={bedtimeData.points} />}
                      tickLine={false}
                      axisLine={false}
                      interval={bedtimeData.points.length > 8 ? 1 : 0}
                      padding={{ left: 0, right: 0 }}
                    />
                    <YAxis
                      width={Y_AXIS_WIDTH_LONG}
                      domain={bedtimeData.domain}
                      ticks={bedtimeTicks}
                      tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
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
                      strokeWidth={3}
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
            </>
          )}

          {/* Section: Growth — weight & height charts */}
          {statsSection === 'growth' && (
            <div className="space-y-6">
              {weightLogs.length > 0 || heightLogs.length > 0 ? (
                <>
                  {weightLogs.length > 0 && (
                    weightChartData.length >= 2 ? (
                      <div className="rounded-3xl backdrop-blur-xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
                        <h3 className="text-sm font-display font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">
                          {t('growth.weightOverTime')}
                        </h3>
                        <div className="h-40 -mx-4" role="img" aria-label="Weight over time">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={weightChartData}
                              margin={CHART_MARGIN_LONG_Y}
                            >
                              <defs>
                                <linearGradient id="weightGradientChip" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={napColor} stopOpacity={0.4} />
                                  <stop offset="95%" stopColor={napColor} stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} strokeOpacity={0.1} vertical={false} />
                              <XAxis dataKey="day" tick={<DayDateTick data={weightChartData} />} tickLine={false} axisLine={false} padding={{ left: 0, right: 0 }} />
                              <YAxis width={Y_AXIS_WIDTH_LONG} domain={weightDomain} ticks={weightTicks} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v} kg`} />
                              <Tooltip content={<GrowthTooltip unit="kg" />} />
                              <Area type="monotone" dataKey="value" stroke={napColor} strokeWidth={3} fill="url(#weightGradientChip)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    ) : (
                      <GrowthOnePointEmptyState
                        titleKey="growth.weightOverTime"
                        valueLabel={weightChartData[0] ? `${weightChartData[0].value} kg` : ''}
                        addButtonLabel={t('growth.addWeight')}
                        onAdd={onAddWeight}
                        lineColor={napColor}
                      />
                    )
                  )}
                  {heightLogs.length > 0 && (
                    heightChartData.length >= 2 ? (
                      <div className="rounded-3xl backdrop-blur-xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
                        <h3 className="text-sm font-display font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">
                          {t('growth.heightOverTime')}
                        </h3>
                        <div className="h-40 -mx-4" role="img" aria-label="Height over time">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={heightChartData}
                              margin={CHART_MARGIN_LONG_Y}
                            >
                              <defs>
                                <linearGradient id="heightGradientChip" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={nightColor} stopOpacity={0.4} />
                                  <stop offset="95%" stopColor={nightColor} stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} strokeOpacity={0.1} vertical={false} />
                              <XAxis dataKey="day" tick={<DayDateTick data={heightChartData} />} tickLine={false} axisLine={false} padding={{ left: 0, right: 0 }} />
                              <YAxis width={Y_AXIS_WIDTH_LONG} domain={heightDomain} ticks={heightTicks} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v} cm`} />
                              <Tooltip content={<GrowthTooltip unit="cm" />} />
                              <Area type="monotone" dataKey="value" stroke={nightColor} strokeWidth={3} fill="url(#heightGradientChip)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    ) : (
                      <GrowthOnePointEmptyState
                        titleKey="growth.heightOverTime"
                        valueLabel={heightChartData[0] ? `${heightChartData[0].value} cm` : ''}
                        addButtonLabel={t('growth.addHeight')}
                        onAdd={onAddHeight}
                        lineColor={nightColor}
                      />
                    )
                  )}
                </>
              ) : (
                <p className="text-sm text-[var(--text-muted)] text-center py-8">
                  {t('growth.noGrowthData')}
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* When no sleep data but we have growth data, show growth charts or one-point empty state */}
      {!hasData && (weightLogs.length > 0 || heightLogs.length > 0) && (
        <div className="mt-6 space-y-6">
          {weightLogs.length > 0 && (
            weightChartData.length >= 2 ? (
              <div className="rounded-3xl backdrop-blur-xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
                <h3 className="text-sm font-display font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">
                  {t('growth.weightOverTime')}
                </h3>
                <div className="h-40 -mx-4" role="img" aria-label="Weight over time">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={weightChartData}
                      margin={CHART_MARGIN_LONG_Y}
                    >
                      <defs>
                        <linearGradient id="weightGradientNoSleep" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={napColor} stopOpacity={0.4} />
                          <stop offset="95%" stopColor={napColor} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} strokeOpacity={0.1} vertical={false} />
                      <XAxis dataKey="day" tick={<DayDateTick data={weightChartData} />} tickLine={false} axisLine={false} padding={{ left: 0, right: 0 }} />
                      <YAxis width={Y_AXIS_WIDTH_LONG} domain={weightDomain} ticks={weightTicks} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v} kg`} />
                      <Tooltip content={<GrowthTooltip unit="kg" />} />
                      <Area type="monotone" dataKey="value" stroke={napColor} strokeWidth={3} fill="url(#weightGradientNoSleep)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <GrowthOnePointEmptyState
                titleKey="growth.weightOverTime"
                valueLabel={weightChartData[0] ? `${weightChartData[0].value} kg` : ''}
                addButtonLabel={t('growth.addWeight')}
                onAdd={onAddWeight}
                lineColor={napColor}
              />
            )
          )}
          {heightLogs.length > 0 && (
            heightChartData.length >= 2 ? (
              <div className="rounded-3xl backdrop-blur-xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
                <h3 className="text-sm font-display font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">
                  {t('growth.heightOverTime')}
                </h3>
                <div className="h-40 -mx-4" role="img" aria-label="Height over time">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={heightChartData}
                      margin={CHART_MARGIN_LONG_Y}
                    >
                      <defs>
                        <linearGradient id="heightGradientNoSleep" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={nightColor} stopOpacity={0.4} />
                          <stop offset="95%" stopColor={nightColor} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} strokeOpacity={0.1} vertical={false} />
                      <XAxis dataKey="day" tick={<DayDateTick data={heightChartData} />} tickLine={false} axisLine={false} padding={{ left: 0, right: 0 }} />
                      <YAxis width={Y_AXIS_WIDTH_LONG} domain={heightDomain} ticks={heightTicks} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v} cm`} />
                      <Tooltip content={<GrowthTooltip unit="cm" />} />
                      <Area type="monotone" dataKey="value" stroke={nightColor} strokeWidth={3} fill="url(#heightGradientNoSleep)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <GrowthOnePointEmptyState
                titleKey="growth.heightOverTime"
                valueLabel={heightChartData[0] ? `${heightChartData[0].value} cm` : ''}
                addButtonLabel={t('growth.addHeight')}
                onAdd={onAddHeight}
                lineColor={nightColor}
              />
            )
          )}
        </div>
      )}

      {/* Hint when no sleep data and no growth data */}
      {!hasData && weightLogs.length === 0 && heightLogs.length === 0 && (
        <p className="text-sm text-[var(--text-muted)] text-center mt-4">
          {t('growth.noGrowthData')}
        </p>
      )}
    </div>
  );
}
