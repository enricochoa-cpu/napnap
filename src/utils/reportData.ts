/**
 * Report data and "What to try" tip pool for the Sleep Report feature.
 * Logic and tip copy aligned with .context/sleep-report-prd.md Appendix A.
 */

import {
  format,
  parseISO,
  startOfDay,
  endOfDay,
  subDays,
  eachDayOfInterval,
  differenceInMinutes,
  differenceInMonths,
  isToday,
} from 'date-fns';
import { getDateFnsLocale } from './dateFnsLocale';
import type { SleepEntry } from '../types';
import type { BabyProfile } from '../types';
import { calculateAge } from './dateUtils';
import { extractWakeWindowsFromEntries } from './dateUtils';

const MIN_DAYS_FOR_ENOUGH_DATA = 3;

function calculateDuration(startTime: string, endTime: string | null): number {
  const start = new Date(startTime).getTime();
  const end = endTime ? new Date(endTime).getTime() : Date.now();
  return Math.round((end - start) / (1000 * 60));
}

/** Minutes since midnight from ISO datetime string */
function toMinutesSinceMidnight(iso: string): number {
  const d = parseISO(iso);
  return d.getHours() * 60 + d.getMinutes();
}

/** Format minutes as "Xh Ym" for report display */
export function formatMinutesToHours(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/** Format minutes since midnight as HH:MM */
function formatTimeFromMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export interface ReportFlags {
  hasEnoughData: boolean;
  bedtimeVeryVariable: boolean;
  bedtimeStable: boolean;
  wakeUpOftenMissing: boolean;
  sleepIncreasedThisWeek: boolean;
  sleepDecreasedThisWeek: boolean;
  overtirednessRisk: boolean;
  napCountInconsistent: boolean;
}

export interface ReportData {
  babyName: string;
  ageLabel: string;
  ageMonths: number;
  startDate: Date;
  endDate: Date;
  dateRangeLabel: string;
  averages: {
    avgTotal: number;
    avgNapDuration: number;
    avgNight: number;
    avgNapCount: number;
  };
  bedtimeSpread: { min: number; max: number; spreadMinutes: number } | null;
  wakeUpSpread: { min: number; max: number } | null;
  avgWakeWindowMinutes: number | null;
  thisWeekTotalMinutes: number;
  lastWeekTotalMinutes: number;
  napCountRange: { min: number; max: number } | null;
  flags: ReportFlags;
  tips: ReportTip[];
}

/** Tip for the report "What to try" section; copy is translated in the view via t(key, params). */
export interface ReportTip {
  id: string;
  key: string;
  params?: Record<string, string | number>;
}

/** Max wake window (minutes) by age for overtiredness check. PRD Appendix A.2 */
function getMaxWakeWindowForAge(ageMonths: number): number {
  if (ageMonths <= 1) return 90;
  if (ageMonths <= 4) return 180;
  if (ageMonths <= 7) return 270;
  if (ageMonths <= 10) return 360;
  return 420;
}

/**
 * Compute all data needed to render the sleep report and select tips.
 */
export function getReportData(
  entries: SleepEntry[],
  startDate: Date,
  endDate: Date,
  profile: BabyProfile | null
): ReportData {
  const babyName = profile?.name ?? 'your baby';
  const ageLabel = profile?.dateOfBirth ? calculateAge(profile.dateOfBirth) : '';
  const ageMonths = profile?.dateOfBirth
    ? differenceInMonths(new Date(), parseISO(profile.dateOfBirth))
    : 0;

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const completedDays = days.filter((d) => !isToday(d));

  const rangeData = completedDays.map((date) => {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    const dayEntries = entries.filter((e) => {
      const t = parseISO(e.startTime);
      return t >= dayStart && t <= dayEnd;
    });
    const napMinutes = dayEntries
      .filter((e) => e.type === 'nap')
      .reduce((s, e) => s + calculateDuration(e.startTime, e.endTime), 0);
    const nightMinutes = dayEntries
      .filter((e) => e.type === 'night')
      .reduce((s, e) => s + calculateDuration(e.startTime, e.endTime), 0);
    return {
      date,
      total: napMinutes + nightMinutes,
      nap: napMinutes,
      night: nightMinutes,
      napCount: dayEntries.filter((e) => e.type === 'nap').length,
    };
  });

  const completedWithData = rangeData.filter((d) => d.total > 0);
  const hasEnoughData = completedWithData.length >= MIN_DAYS_FOR_ENOUGH_DATA;

  const avgTotal =
    completedWithData.length > 0
      ? Math.round(completedWithData.reduce((s, d) => s + d.total, 0) / completedWithData.length)
      : 0;
  const avgNight =
    completedWithData.length > 0
      ? Math.round(completedWithData.reduce((s, d) => s + d.night, 0) / completedWithData.length)
      : 0;
  const avgNapCount =
    completedWithData.length > 0
      ? completedWithData.reduce((s, d) => s + d.napCount, 0) / completedWithData.length
      : 0;
  const totalNapMinutes = completedWithData.reduce((s, d) => s + d.nap, 0);
  const totalNapCount = completedWithData.reduce((s, d) => s + d.napCount, 0);
  const avgNapDuration =
    totalNapCount > 0 ? Math.round(totalNapMinutes / totalNapCount) : 0;

  const bedtimeMinutes: number[] = [];
  const wakeUpMinutes: number[] = [];
  for (const date of completedDays) {
    const dayStr = format(date, 'yyyy-MM-dd');
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    const nightStart = entries.find((e) => {
      if (e.type !== 'night') return false;
      const t = parseISO(e.startTime);
      return t >= dayStart && t <= dayEnd;
    });
    if (nightStart) {
      bedtimeMinutes.push(toMinutesSinceMidnight(nightStart.startTime));
    }
    const wakeEntry = entries.find((e) => {
      if (e.type !== 'night' || !e.endTime) return false;
      return format(parseISO(e.endTime), 'yyyy-MM-dd') === dayStr;
    });
    if (wakeEntry?.endTime) {
      wakeUpMinutes.push(toMinutesSinceMidnight(wakeEntry.endTime));
    }
  }

  const bedtimeSpread =
    bedtimeMinutes.length >= 2
      ? {
          min: Math.min(...bedtimeMinutes),
          max: Math.max(...bedtimeMinutes),
          spreadMinutes: Math.max(...bedtimeMinutes) - Math.min(...bedtimeMinutes),
        }
      : null;
  const wakeUpSpread =
    wakeUpMinutes.length >= 1
      ? { min: Math.min(...wakeUpMinutes), max: Math.max(...wakeUpMinutes) }
      : null;

  const bedtimeVeryVariable =
    bedtimeSpread !== null && bedtimeSpread.spreadMinutes > 60;
  const bedtimeStable =
    bedtimeSpread !== null && bedtimeSpread.spreadMinutes <= 45;

  const daysWithNightSleep = completedDays.filter((date) => {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    return entries.some((e) => {
      if (e.type !== 'night') return false;
      const t = parseISO(e.startTime);
      return t >= dayStart && t <= dayEnd;
    });
  }).length;
  const daysWithWakeUp = wakeUpMinutes.length;
  const wakeUpOftenMissing =
    daysWithNightSleep >= 2 && daysWithWakeUp < daysWithNightSleep * 0.6;

  const rangeDays = differenceInMinutes(endDate, startDate) / (24 * 60) + 1;
  const midRange = startOfDay(
    new Date(startDate.getTime() + (endDate.getTime() - startDate.getTime()) / 2)
  );
  const thisWeekStart = subDays(midRange, Math.floor(rangeDays / 2));
  const thisWeekEnd = midRange;
  const lastWeekStart = subDays(thisWeekStart, Math.ceil(rangeDays / 2));
  const lastWeekEnd = thisWeekStart;

  const thisWeekTotalMinutes = rangeData
    .filter((d) => d.date >= thisWeekStart && d.date <= thisWeekEnd && d.total > 0)
    .reduce((s, d) => s + d.total, 0);
  const lastWeekTotalMinutes = rangeData
    .filter((d) => d.date >= lastWeekStart && d.date < lastWeekEnd && d.total > 0)
    .reduce((s, d) => s + d.total, 0);

  const sleepIncreasedThisWeek =
    lastWeekTotalMinutes > 0 &&
    thisWeekTotalMinutes > lastWeekTotalMinutes * 1.05;
  const sleepDecreasedThisWeek =
    lastWeekTotalMinutes > 0 &&
    thisWeekTotalMinutes < lastWeekTotalMinutes * 0.9;

  const { wakeWindows } = extractWakeWindowsFromEntries(entries, 14);
  const avgWakeWindowMinutes =
    wakeWindows.length > 0
      ? Math.round(
          wakeWindows.reduce((a, b) => a + b, 0) / wakeWindows.length
        )
      : null;
  const maxWakeForAge = getMaxWakeWindowForAge(ageMonths);
  const overtirednessRisk =
    avgWakeWindowMinutes !== null &&
    ageMonths <= 12 &&
    avgWakeWindowMinutes > maxWakeForAge * 1.15;

  const napCounts = completedWithData.map((d) => d.napCount).filter((n) => n > 0);
  const napCountRange =
    napCounts.length > 0
      ? { min: Math.min(...napCounts), max: Math.max(...napCounts) }
      : null;
  const napCountInconsistent =
    napCountRange !== null &&
    napCountRange.max - napCountRange.min >= 2 &&
    ageMonths >= 6 &&
    ageMonths <= 15;

  const flags: ReportFlags = {
    hasEnoughData,
    bedtimeVeryVariable,
    bedtimeStable,
    wakeUpOftenMissing,
    sleepIncreasedThisWeek,
    sleepDecreasedThisWeek,
    overtirednessRisk,
    napCountInconsistent,
  };

  const tips = selectTips(flags, {
    babyName,
    ageMonths,
    avgWakeWindowMinutes,
    bedtimeSpread,
    hasEnoughData,
  });

  const locale = getDateFnsLocale();
  const dateRangeLabel = `${format(startDate, 'd MMM', { locale })} – ${format(endDate, 'd MMM yyyy', { locale })}`;

  return {
    babyName,
    ageLabel,
    ageMonths,
    startDate,
    endDate,
    dateRangeLabel,
    averages: {
      avgTotal,
      avgNapDuration,
      avgNight,
      avgNapCount,
    },
    bedtimeSpread,
    wakeUpSpread,
    avgWakeWindowMinutes,
    thisWeekTotalMinutes,
    lastWeekTotalMinutes,
    napCountRange,
    flags,
    tips,
  };
}

interface TipContext {
  babyName: string;
  ageMonths: number;
  avgWakeWindowMinutes: number | null;
  bedtimeSpread: { min: number; max: number; spreadMinutes: number } | null;
  hasEnoughData: boolean;
}

function selectTips(flags: ReportFlags, ctx: TipContext): ReportTip[] {
  const out: ReportTip[] = [];
  const used = new Set<string>();
  const avgWakeStr = ctx.avgWakeWindowMinutes != null ? formatMinutesToHours(ctx.avgWakeWindowMinutes) : '—';

  const add = (id: string, key: string, params?: Record<string, string | number>) => {
    if (used.has(id) || out.length >= 3) return;
    used.add(id);
    out.push({ id, key, params: { babyName: ctx.babyName, avgWakeWindow: avgWakeStr, ...params } });
  };

  if (!flags.hasEnoughData) {
    add('T4', 'report.tips.T4');
  }
  if (flags.wakeUpOftenMissing) {
    add('T2', 'report.tips.T2');
  }
  if (flags.bedtimeVeryVariable && ctx.ageMonths >= 4 && !used.has('T7')) {
    add('T3', 'report.tips.T3');
  }
  if (flags.overtirednessRisk && ctx.ageMonths <= 12) {
    add('T5', 'report.tips.T5');
  }
  if (flags.sleepDecreasedThisWeek) {
    add('T6', 'report.tips.T6');
  }
  if (flags.bedtimeStable && !used.has('T3')) {
    add('T7', 'report.tips.T7');
  }
  add('T1', 'report.tips.T1');
  if (flags.hasEnoughData && ctx.avgWakeWindowMinutes != null) {
    add('T8', 'report.tips.T8', { avgWakeWindow: avgWakeStr });
  }
  if (flags.napCountInconsistent && ctx.ageMonths >= 6 && ctx.ageMonths <= 15) {
    add('T9', 'report.tips.T9');
  }
  if ((flags.bedtimeVeryVariable || !flags.hasEnoughData) && ctx.ageMonths >= 4 && out.length < 3) {
    add('T10', 'report.tips.T10');
  }

  return out.slice(0, 3);
}

export interface ReportCopyKey {
  key: string;
  params?: Record<string, string | number>;
}

export function getBedtimeCopyKey(data: ReportData): ReportCopyKey {
  if (!data.bedtimeSpread || data.flags.bedtimeVeryVariable) {
    return { key: 'report.bedtimeCopyVaried' };
  }
  const { min, max } = data.bedtimeSpread;
  return {
    key: 'report.bedtimeCopyRange',
    params: {
      babyName: data.babyName,
      min: formatTimeFromMinutes(min),
      max: formatTimeFromMinutes(max),
    },
  };
}

export function getWakeUpCopyKey(data: ReportData): ReportCopyKey {
  if (!data.wakeUpSpread) {
    return { key: 'report.wakeUpCopyMissing' };
  }
  const { min, max } = data.wakeUpSpread;
  if (max - min > 90) {
    return { key: 'report.wakeUpCopyVariable' };
  }
  return {
    key: 'report.wakeUpCopyRange',
    params: {
      min: formatTimeFromMinutes(min),
      max: formatTimeFromMinutes(max),
    },
  };
}

export interface ReportPatternLine {
  key: string;
  params?: Record<string, string | number>;
}

export function getPatternsCopyKeys(data: ReportData): ReportPatternLine[] {
  const lines: ReportPatternLine[] = [];
  if (data.flags.sleepIncreasedThisWeek && data.lastWeekTotalMinutes > 0) {
    lines.push({ key: 'report.patternMoreSleep', params: { babyName: data.babyName } });
  }
  if (data.flags.sleepDecreasedThisWeek && data.lastWeekTotalMinutes > 0) {
    lines.push({ key: 'report.patternLessSleep' });
  }
  if (data.napCountRange) {
    const { min, max } = data.napCountRange;
    if (min === max) {
      lines.push({ key: 'report.patternNapsCount', params: { count: min } });
    } else {
      lines.push({ key: 'report.patternNapsRange', params: { min, max } });
    }
  }
  if (data.avgWakeWindowMinutes != null) {
    lines.push({
      key: 'report.patternWakeWindows',
      params: { duration: formatMinutesToHours(data.avgWakeWindowMinutes) },
    });
  }
  return lines;
}
