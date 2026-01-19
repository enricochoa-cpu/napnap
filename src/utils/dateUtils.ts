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
