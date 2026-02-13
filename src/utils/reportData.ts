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

export interface ReportTip {
  id: string;
  copy: string;
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

  const dateRangeLabel = `${format(startDate, 'd MMM')} – ${format(endDate, 'd MMM yyyy')}`;

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

  const add = (id: string, copy: string) => {
    if (used.has(id) || out.length >= 3) return;
    used.add(id);
    out.push({ id, copy });
  };

  const fill = (template: string): string => {
    return template
      .replace(/\{babyName\}/g, ctx.babyName)
      .replace(
        /\{avgWakeWindow\}/g,
        ctx.avgWakeWindowMinutes != null
          ? formatMinutesToHours(ctx.avgWakeWindowMinutes)
          : '—'
      )
      .replace(
        /\{earliestBedtime\}/g,
        ctx.bedtimeSpread
          ? formatTimeFromMinutes(ctx.bedtimeSpread.min)
          : '—'
      )
      .replace(
        /\{latestBedtime\}/g,
        ctx.bedtimeSpread
          ? formatTimeFromMinutes(ctx.bedtimeSpread.max)
          : '—'
      );
  };

  // Priority: T4 (need data), T2 (logging), T3/T5, T6/T7, T1, T8, T9, T10. Never both T3 and T7.
  if (!flags.hasEnoughData) {
    add('T4', fill("A few more days of logging will make the report and predictions more personal."));
  }
  if (flags.wakeUpOftenMissing) {
    add('T2', fill("Logging when {babyName} wakes up helps keep predictions accurate — try tapping wake up when they get out of bed."));
  }
  if (flags.bedtimeVeryVariable && ctx.ageMonths >= 4 && !used.has('T7')) {
    add('T3', fill("A more consistent bedtime window can help patterns emerge. Try aiming for within about 30 minutes of the same time most nights."));
  }
  if (flags.overtirednessRisk && ctx.ageMonths <= 12) {
    add('T5', fill("Putting {babyName} down before they're overtired often helps — watch for early tired cues like eye rubbing or zoning out, and offer sleep before fussiness."));
  }
  if (flags.sleepDecreasedThisWeek) {
    add('T6', fill("This week sleep looked a bit lighter; one-off days are normal. Keeping a consistent bedtime can help."));
  }
  if (flags.bedtimeStable && !used.has('T3')) {
    add('T7', fill("Nice consistency this period. Keeping the same bedtime window will help the algorithm stay in sync."));
  }
  add('T1', fill("Sticking close to today's suggested bedtime will help the algorithm tune in."));
  if (flags.hasEnoughData && ctx.avgWakeWindowMinutes != null) {
    add('T8', fill("For {babyName}'s age, wake windows around {avgWakeWindow} are in a typical range — the app's suggested nap times are tuned to that."));
  }
  if (flags.napCountInconsistent && ctx.ageMonths >= 6 && ctx.ageMonths <= 15) {
    add('T9', fill("Most babies this age do well with 2–3 naps. If you're seeing a lot of resistance at nap time, a small shift in timing might help — the app's suggestions adapt as you log."));
  }
  if ((flags.bedtimeVeryVariable || !flags.hasEnoughData) && ctx.ageMonths >= 4 && out.length < 3) {
    add('T10', fill("A short wind-down before bed (e.g. dim lights, same steps each night) can help {babyName} recognise bedtime."));
  }

  return out.slice(0, 3);
}

export function getBedtimeCopy(data: ReportData): string {
  if (!data.bedtimeSpread) {
    return "Bedtime varies from day to day — that's normal while we're learning.";
  }
  if (data.flags.bedtimeVeryVariable) {
    return "Bedtime varies from day to day — that's normal while we're learning.";
  }
  const { min, max } = data.bedtimeSpread;
  return `Most nights you put ${data.babyName} down between ${formatTimeFromMinutes(min)} and ${formatTimeFromMinutes(max)}.`;
}

export function getWakeUpCopy(data: ReportData): string {
  if (!data.wakeUpSpread) {
    return "Logging when your baby wakes up helps the report and predictions stay accurate.";
  }
  const { min, max } = data.wakeUpSpread;
  if (max - min > 90) {
    return "Wake-up time varies — that's normal. Keeping a consistent bedtime can help the pattern settle.";
  }
  return `Wake-up is usually between ${formatTimeFromMinutes(min)} and ${formatTimeFromMinutes(max)}.`;
}

export function getPatternsCopy(data: ReportData): string[] {
  const lines: string[] = [];
  if (data.flags.sleepIncreasedThisWeek && data.lastWeekTotalMinutes > 0) {
    lines.push(`This week ${data.babyName} had a bit more total sleep than last week.`);
  }
  if (data.flags.sleepDecreasedThisWeek && data.lastWeekTotalMinutes > 0) {
    lines.push("This week a bit less total sleep than last week — one-off days are normal.");
  }
  if (data.napCountRange) {
    const { min, max } = data.napCountRange;
    if (min === max) {
      lines.push(`Naps are usually ${min} per day.`);
    } else {
      lines.push(`Naps are usually ${min}–${max} per day.`);
    }
  }
  if (data.avgWakeWindowMinutes != null) {
    lines.push(`Wake windows are averaging around ${formatMinutesToHours(data.avgWakeWindowMinutes)}.`);
  }
  return lines;
}
