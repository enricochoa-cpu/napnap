import {
  format,
  parseISO,
  differenceInMinutes,
  differenceInYears,
  differenceInMonths,
  differenceInDays,
  addDays,
  subDays,
  startOfDay,
  isToday,
} from 'date-fns';

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM-dd');
}

export function formatDisplayDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (isToday(d)) {
    return 'Today';
  }
  return format(d, 'EEEE, MMMM d, yyyy');
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'HH:mm');
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, "yyyy-MM-dd'T'HH:mm");
}

export function calculateDuration(startTime: string, endTime: string | null): number {
  if (!endTime) {
    return differenceInMinutes(new Date(), parseISO(startTime));
  }
  return differenceInMinutes(parseISO(endTime), parseISO(startTime));
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) {
    return `${mins}m`;
  }
  return `${hours}h ${mins}m`;
}

export function calculateAge(dateOfBirth: string): string {
  const dob = parseISO(dateOfBirth);
  const now = new Date();

  const years = differenceInYears(now, dob);
  if (years >= 1) {
    const months = differenceInMonths(now, dob) % 12;
    return `${years} year${years !== 1 ? 's' : ''}${months > 0 ? `, ${months} month${months !== 1 ? 's' : ''}` : ''}`;
  }

  const months = differenceInMonths(now, dob);
  if (months >= 1) {
    const days = differenceInDays(now, dob) % 30;
    return `${months} month${months !== 1 ? 's' : ''}${days > 0 ? `, ${days} day${days !== 1 ? 's' : ''}` : ''}`;
  }

  const days = differenceInDays(now, dob);
  return `${days} day${days !== 1 ? 's' : ''}`;
}

export function getNextDay(date: Date | string): Date {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return addDays(startOfDay(d), 1);
}

export function getPreviousDay(date: Date | string): Date {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return subDays(startOfDay(d), 1);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/*
 * =============================================================================
 * SLEEP PRESSURE ALGORITHM - Pediatric Sleep Science Model
 * =============================================================================
 *
 * This algorithm models two biological processes that regulate infant sleep:
 *
 * 1. HOMEOSTATIC SLEEP PRESSURE (Process S)
 *    - Sleep pressure builds during wakefulness and dissipates during sleep
 *    - Accumulates faster in younger babies (shorter wake windows)
 *    - Short naps (< 1 sleep cycle) don't fully discharge pressure
 *    - Wake windows INCREASE throughout the day as circadian alerting rises
 *
 * 2. CIRCADIAN RHYTHM (Process C)
 *    - Internal clock promoting alertness during day, sleep at night
 *    - Creates "forbidden zones" for sleep (late afternoon dip)
 *    - Bedtime window is biologically optimal for melatonin onset
 *
 * PROGRESSIVE WAKE WINDOWS:
 *    WW1 (morning)  = baseMin × 0.9  — Low circadian alerting, high residual pressure
 *    WW2           = baseAvg         — Moderate pressure, rising alertness
 *    WW3+          = baseMax         — High alertness offsets pressure
 *    Bedtime WW    = baseMax + 30    — Must overcome evening cortisol
 *
 * SHORT NAP COMPENSATION:
 *    < 40 min (incomplete cycle): reduce next WW by 30%
 *    40-60 min (1 cycle):         reduce next WW by 15%
 *    > 60 min (restorative):      no reduction
 *
 * REGRESSION PERIODS:
 *    4 months: Transition 4→3 naps (sleep architecture matures)
 *    8 months: Transition 3→2 naps (motor development, separation anxiety)
 *
 * CATNAP RULE:
 *    Naps starting after 16:00 capped at 30 min to protect bedtime
 * =============================================================================
 */

// Wake window ranges by age (in minutes)
// Based on pediatric sleep research
export interface WakeWindowRange {
  min: number;
  max: number;
  avg: number;
}

/**
 * Returns base wake window range for age.
 * Use getProgressiveWakeWindow() for nap-index-adjusted windows.
 */
export function getWakeWindowForAge(dateOfBirth: string): WakeWindowRange {
  const dob = parseISO(dateOfBirth);
  const now = new Date();
  const ageInWeeks = Math.floor(differenceInDays(now, dob) / 7);
  const ageInMonths = differenceInMonths(now, dob);

  // 0-4 weeks: 35-60 minutes (newborn, very short tolerance)
  if (ageInWeeks < 4) {
    return { min: 35, max: 60, avg: 45 };
  }
  // 4-12 weeks: 60-90 minutes
  if (ageInWeeks < 12) {
    return { min: 60, max: 90, avg: 75 };
  }
  // 3-4 months: 75-120 minutes (4-month regression window)
  if (ageInMonths < 5) {
    return { min: 75, max: 120, avg: 97 };
  }
  // 5-7 months: 2-3 hours (120-180 minutes)
  if (ageInMonths < 8) {
    return { min: 120, max: 180, avg: 150 };
  }
  // 7-10 months: 2.5-3.5 hours (8-month regression window)
  if (ageInMonths < 11) {
    return { min: 150, max: 210, avg: 180 };
  }
  // 11-14 months: 3-4 hours (180-240 minutes)
  if (ageInMonths < 15) {
    return { min: 180, max: 240, avg: 210 };
  }
  // 14-24 months: 4-6 hours (240-360 minutes)
  return { min: 240, max: 360, avg: 300 };
}

/**
 * Nap index types for progressive wake windows
 */
export type NapIndex = 'first' | 'second' | 'third_plus' | 'bedtime';

/**
 * Calculate progressive wake window based on nap position in day.
 * Implements circadian alerting model where wake tolerance increases throughout day.
 */
export function getProgressiveWakeWindow(
  dateOfBirth: string,
  napIndex: NapIndex
): number {
  const base = getWakeWindowForAge(dateOfBirth);

  switch (napIndex) {
    case 'first':
      // Morning: low circadian alerting, residual sleep pressure
      return Math.round(base.min * 0.9);
    case 'second':
      // Mid-morning: moderate alertness
      return base.avg;
    case 'third_plus':
      // Afternoon: high alertness offsets accumulated pressure
      return base.max;
    case 'bedtime':
      // Evening: must overcome cortisol spike before melatonin onset
      return base.max + 30;
  }
}

/**
 * Short nap compensation factors.
 * Incomplete sleep cycles don't fully discharge homeostatic pressure.
 */
export function getShortNapCompensation(napDurationMinutes: number): number {
  if (napDurationMinutes < 40) {
    // Less than one sleep cycle (~40 min): high residual pressure
    return 0.70; // Reduce next WW by 30%
  }
  if (napDurationMinutes < 60) {
    // One cycle but not restorative: moderate residual pressure
    return 0.85; // Reduce next WW by 15%
  }
  // Full restorative nap: no compensation needed
  return 1.0;
}

/**
 * Calculate suggested next nap time with progressive windows and short nap compensation.
 */
export function calculateSuggestedNapTime(
  dateOfBirth: string,
  lastWakeTime: string,
  lastNapDurationMinutes: number | null,
  napIndex: NapIndex = 'second'
): Date {
  // Get progressive wake window based on position in day
  let suggestedWindowMinutes = getProgressiveWakeWindow(dateOfBirth, napIndex);

  // Apply short nap compensation if previous nap was incomplete
  if (lastNapDurationMinutes !== null) {
    const compensation = getShortNapCompensation(lastNapDurationMinutes);
    suggestedWindowMinutes = Math.round(suggestedWindowMinutes * compensation);
  }

  const wakeTime = parseISO(lastWakeTime);
  return new Date(wakeTime.getTime() + suggestedWindowMinutes * 60 * 1000);
}

// Recommended daily schedule based on baby's age
export interface DailySchedule {
  wakeTime: { hour: number; minute: number };
  bedtimeWindow: {
    earliest: { hour: number; minute: number };
    latest: { hour: number; minute: number };
  };
  numberOfNaps: number;
  isRegressionPeriod: boolean;
  regressionType?: '4-month' | '8-month';
}

/**
 * Get recommended schedule with dynamic bedtime window.
 * Includes regression period detection for 4-month and 8-month transitions.
 */
export function getRecommendedSchedule(dateOfBirth: string): DailySchedule {
  const dob = parseISO(dateOfBirth);
  const now = new Date();
  const ageInMonths = differenceInMonths(now, dob);
  const ageInWeeks = Math.floor(differenceInDays(now, dob) / 7);

  // 0-3 months: Very flexible, 4 naps, wide bedtime window
  if (ageInMonths < 4) {
    return {
      wakeTime: { hour: 7, minute: 0 },
      bedtimeWindow: {
        earliest: { hour: 19, minute: 30 },
        latest: { hour: 20, minute: 30 },
      },
      numberOfNaps: 4,
      isRegressionPeriod: false,
    };
  }

  // 4-5 months: 4-MONTH REGRESSION - transitioning 4→3 naps
  if (ageInMonths < 6) {
    const isInRegression = ageInWeeks >= 16 && ageInWeeks <= 20;
    return {
      wakeTime: { hour: 7, minute: 0 },
      bedtimeWindow: {
        earliest: { hour: 19, minute: 0 },
        latest: { hour: 20, minute: 0 },
      },
      // During regression, may need 4 naps some days, 3 others
      numberOfNaps: isInRegression ? 3 : 3,
      isRegressionPeriod: isInRegression,
      regressionType: isInRegression ? '4-month' : undefined,
    };
  }

  // 6-7 months: 3 naps, stable period
  if (ageInMonths < 8) {
    return {
      wakeTime: { hour: 7, minute: 0 },
      bedtimeWindow: {
        earliest: { hour: 18, minute: 30 },
        latest: { hour: 19, minute: 30 },
      },
      numberOfNaps: 3,
      isRegressionPeriod: false,
    };
  }

  // 8-9 months: 8-MONTH REGRESSION - transitioning 3→2 naps
  if (ageInMonths < 10) {
    const isInRegression = ageInMonths === 8 || (ageInMonths === 9 && ageInWeeks <= 39);
    return {
      wakeTime: { hour: 6, minute: 30 },
      bedtimeWindow: {
        earliest: { hour: 18, minute: 30 },
        latest: { hour: 19, minute: 30 },
      },
      // During regression, may need 3 naps some days, 2 others
      numberOfNaps: isInRegression ? 2 : 2,
      isRegressionPeriod: isInRegression,
      regressionType: isInRegression ? '8-month' : undefined,
    };
  }

  // 10-14 months: 2 naps, stable period
  if (ageInMonths < 15) {
    return {
      wakeTime: { hour: 6, minute: 30 },
      bedtimeWindow: {
        earliest: { hour: 18, minute: 30 },
        latest: { hour: 19, minute: 30 },
      },
      numberOfNaps: 2,
      isRegressionPeriod: false,
    };
  }

  // 15-24 months: 1 nap
  return {
    wakeTime: { hour: 7, minute: 0 },
    bedtimeWindow: {
      earliest: { hour: 19, minute: 0 },
      latest: { hour: 20, minute: 0 },
    },
    numberOfNaps: 1,
    isRegressionPeriod: false,
  };
}

/**
 * Calculate dynamic bedtime based on actual day's sleep.
 * Pulls bedtime earlier if total daytime sleep is insufficient.
 */
export function calculateDynamicBedtime(
  dateOfBirth: string,
  lastNapEndTime: string,
  totalDaytimeSleepMinutes: number
): Date {
  const schedule = getRecommendedSchedule(dateOfBirth);
  const wakeWindow = getWakeWindowForAge(dateOfBirth);
  const dob = parseISO(dateOfBirth);
  const now = new Date();
  const ageInMonths = differenceInMonths(now, dob);

  const lastNapEnd = parseISO(lastNapEndTime);

  // Minimum bedtime: last nap end + max wake window (circadian constraint)
  const minBedtimeFromNap = new Date(
    lastNapEnd.getTime() + (wakeWindow.max + 30) * 60 * 1000
  );

  // Target bedtime window
  const earliestBedtime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    schedule.bedtimeWindow.earliest.hour,
    schedule.bedtimeWindow.earliest.minute
  );
  const latestBedtime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    schedule.bedtimeWindow.latest.hour,
    schedule.bedtimeWindow.latest.minute
  );

  // For babies > 5 months: if total daytime sleep < 2 hours, pull to earliest
  const needsEarlyBedtime = ageInMonths >= 5 && totalDaytimeSleepMinutes < 120;

  let targetBedtime: Date;
  if (needsEarlyBedtime) {
    // Sleep debt: use earliest bedtime
    targetBedtime = earliestBedtime;
  } else {
    // Normal: use latest bedtime
    targetBedtime = latestBedtime;
  }

  // Ensure bedtime is at least max wake window after last nap
  if (minBedtimeFromNap > targetBedtime) {
    return minBedtimeFromNap;
  }

  return targetBedtime;
}

// Enhanced nap window with additional metadata
export interface NapWindow {
  hour: number;
  minute: number;
  isCatnap: boolean;
  napIndex: NapIndex;
  expectedDurationMinutes: number;
}

// Catnap cutoff: 4 PM (16:00)
const CATNAP_CUTOFF_HOUR = 16;
const CATNAP_MAX_DURATION = 30;

/**
 * Calculate all recommended nap windows for the day.
 * Implements progressive wake windows, catnap capping, and regression handling.
 */
export function calculateAllNapWindows(
  dateOfBirth: string,
  _completedNaps: { endTime: string; durationMinutes: number }[] = []
): NapWindow[] {
  const schedule = getRecommendedSchedule(dateOfBirth);
  const base = getWakeWindowForAge(dateOfBirth);

  const napWindows: NapWindow[] = [];
  const wakeMinutes = schedule.wakeTime.hour * 60 + schedule.wakeTime.minute;
  const latestBedMinutes =
    schedule.bedtimeWindow.latest.hour * 60 + schedule.bedtimeWindow.latest.minute;

  // Start from wake time
  let currentMinutes = wakeMinutes;
  let lastNapDuration: number | null = null;

  for (let i = 0; i < schedule.numberOfNaps; i++) {
    // Determine nap index for progressive wake window
    const napIndex: NapIndex =
      i === 0 ? 'first' : i === 1 ? 'second' : 'third_plus';

    // Get progressive wake window
    let wakeWindowMinutes = getProgressiveWakeWindow(dateOfBirth, napIndex);

    // Apply short nap compensation from previous nap
    if (lastNapDuration !== null) {
      const compensation = getShortNapCompensation(lastNapDuration);
      wakeWindowMinutes = Math.round(wakeWindowMinutes * compensation);
    }

    // Calculate nap start time
    currentMinutes += wakeWindowMinutes;

    // Check if this is a catnap (after 4 PM)
    const isCatnap = currentMinutes >= CATNAP_CUTOFF_HOUR * 60;

    // Determine expected duration
    let expectedDuration: number;
    if (isCatnap) {
      expectedDuration = CATNAP_MAX_DURATION;
    } else if (schedule.numberOfNaps >= 3) {
      // More naps = shorter naps (45-60 min)
      expectedDuration = i < 2 ? 60 : 45;
    } else if (schedule.numberOfNaps === 2) {
      // 2 naps = longer naps (90 min morning, 75 min afternoon)
      expectedDuration = i === 0 ? 90 : 75;
    } else {
      // 1 nap = long nap (2-2.5 hours)
      expectedDuration = 120;
    }

    // Don't add nap if it would be too close to bedtime
    // (need at least maxWW + 30 before bedtime for wind-down)
    if (currentMinutes > latestBedMinutes - (base.max + 30)) break;

    const hour = Math.floor(currentMinutes / 60);
    const minute = currentMinutes % 60;

    napWindows.push({
      hour,
      minute,
      isCatnap,
      napIndex,
      expectedDurationMinutes: expectedDuration,
    });

    // Update for next iteration
    lastNapDuration = expectedDuration;
    currentMinutes += expectedDuration;
  }

  // During regression periods, consider adding/removing a nap
  if (schedule.isRegressionPeriod && napWindows.length > 0) {
    // Add note that schedule may vary during regression
    // (handled in UI layer)
  }

  return napWindows;
}
