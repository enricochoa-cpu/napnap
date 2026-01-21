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
  return format(d, 'h:mm a');
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

// Wake window ranges by age (in minutes)
// Based on pediatric sleep research
interface WakeWindowRange {
  min: number;
  max: number;
}

export function getWakeWindowForAge(dateOfBirth: string): WakeWindowRange {
  const dob = parseISO(dateOfBirth);
  const now = new Date();
  const ageInWeeks = Math.floor(differenceInDays(now, dob) / 7);
  const ageInMonths = differenceInMonths(now, dob);

  // 0-4 weeks: 35-60 minutes
  if (ageInWeeks < 4) {
    return { min: 35, max: 60 };
  }
  // 4-12 weeks: 60-90 minutes
  if (ageInWeeks < 12) {
    return { min: 60, max: 90 };
  }
  // 3-4 months: 75-120 minutes
  if (ageInMonths < 5) {
    return { min: 75, max: 120 };
  }
  // 5-7 months: 2-3 hours (120-180 minutes)
  if (ageInMonths < 8) {
    return { min: 120, max: 180 };
  }
  // 7-10 months: 2.5-3.5 hours (150-210 minutes)
  if (ageInMonths < 11) {
    return { min: 150, max: 210 };
  }
  // 11-14 months: 3-4 hours (180-240 minutes)
  if (ageInMonths < 15) {
    return { min: 180, max: 240 };
  }
  // 14-24 months: 4-6 hours (240-360 minutes)
  return { min: 240, max: 360 };
}

export function calculateSuggestedNapTime(
  dateOfBirth: string,
  lastWakeTime: string,
  lastNapDurationMinutes: number | null
): Date {
  const wakeWindow = getWakeWindowForAge(dateOfBirth);

  // Use the middle of the range as the base
  let suggestedWindowMinutes = Math.round((wakeWindow.min + wakeWindow.max) / 2);

  // If last nap was short (< 45 min), reduce window by 20%
  if (lastNapDurationMinutes !== null && lastNapDurationMinutes < 45) {
    suggestedWindowMinutes = Math.round(suggestedWindowMinutes * 0.8);
  }

  const wakeTime = parseISO(lastWakeTime);
  return new Date(wakeTime.getTime() + suggestedWindowMinutes * 60 * 1000);
}

// Recommended daily schedule based on baby's age
// Returns wake time and bedtime as { hour, minute } objects
export interface DailySchedule {
  wakeTime: { hour: number; minute: number };
  bedtime: { hour: number; minute: number };
  numberOfNaps: number;
}

export function getRecommendedSchedule(dateOfBirth: string): DailySchedule {
  const dob = parseISO(dateOfBirth);
  const now = new Date();
  const ageInMonths = differenceInMonths(now, dob);

  // 0-3 months: Very flexible, but suggest 7am wake, 8pm bedtime
  if (ageInMonths < 4) {
    return {
      wakeTime: { hour: 7, minute: 0 },
      bedtime: { hour: 20, minute: 0 },
      numberOfNaps: 4,
    };
  }
  // 4-6 months: 3 naps, 7am wake, 7:30pm bedtime
  if (ageInMonths < 7) {
    return {
      wakeTime: { hour: 7, minute: 0 },
      bedtime: { hour: 19, minute: 30 },
      numberOfNaps: 3,
    };
  }
  // 7-9 months: 2 naps, 6:30am wake, 7pm bedtime
  if (ageInMonths < 10) {
    return {
      wakeTime: { hour: 6, minute: 30 },
      bedtime: { hour: 19, minute: 0 },
      numberOfNaps: 2,
    };
  }
  // 10-14 months: 2 naps, 6:30am wake, 7pm bedtime
  if (ageInMonths < 15) {
    return {
      wakeTime: { hour: 6, minute: 30 },
      bedtime: { hour: 19, minute: 0 },
      numberOfNaps: 2,
    };
  }
  // 15-24 months: 1 nap, 7am wake, 7:30pm bedtime
  return {
    wakeTime: { hour: 7, minute: 0 },
    bedtime: { hour: 19, minute: 30 },
    numberOfNaps: 1,
  };
}

// Calculate all recommended nap windows for the day
// Returns array of { hour, minute } for each suggested nap time
export interface NapWindow {
  hour: number;
  minute: number;
}

export function calculateAllNapWindows(dateOfBirth: string): NapWindow[] {
  const schedule = getRecommendedSchedule(dateOfBirth);
  const wakeWindow = getWakeWindowForAge(dateOfBirth);

  // Use middle of wake window range
  const avgWakeWindowMinutes = Math.round((wakeWindow.min + wakeWindow.max) / 2);

  const napWindows: NapWindow[] = [];
  const wakeMinutes = schedule.wakeTime.hour * 60 + schedule.wakeTime.minute;
  const bedMinutes = schedule.bedtime.hour * 60 + schedule.bedtime.minute;

  // Start from wake time and add naps based on wake windows
  let currentMinutes = wakeMinutes + avgWakeWindowMinutes;

  for (let i = 0; i < schedule.numberOfNaps; i++) {
    // Don't add nap if it would be too close to bedtime (within 2 hours)
    if (currentMinutes > bedMinutes - 120) break;

    const hour = Math.floor(currentMinutes / 60);
    const minute = currentMinutes % 60;
    napWindows.push({ hour, minute });

    // Assume average nap duration of 1-1.5 hours for calculation
    const avgNapDuration = schedule.numberOfNaps >= 3 ? 45 : 90;
    currentMinutes += avgNapDuration + avgWakeWindowMinutes;
  }

  return napWindows;
}
