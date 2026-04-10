import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { ConfirmationModal } from './ConfirmationModal';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { formatDate, getNextDay, getPreviousDay, calculateDuration as calculateDurationISO } from '../utils/dateUtils';
import { getDateFnsLocale } from '../utils/dateFnsLocale';
import { parseISO, format } from 'date-fns';
import type { SleepEntry, SleepPause } from '../types';

type TFunction = (key: string, options?: Record<string, string | number>) => string;

type SleepType = 'nap' | 'night';

interface SleepEntrySheetProps {
  entry?: SleepEntry | null;
  initialType?: SleepType;
  isOpen: boolean;
  onClose: () => void;
  /** Can return a Promise so the sheet can show loading and prevent double-submit */
  onSave: (data: Omit<SleepEntry, 'id' | 'date'>) => void | Promise<void>;
  onDelete?: (id: string) => void;
  selectedDate: string;
  /** When adding a new entry, allows user to change the log date (e.g. log for yesterday). Omitted when editing. */
  onDateChange?: (date: string) => void;
  /** Shown when save failed (e.g. network error); sheet stays open */
  saveError?: string | null;
  /** When true (e.g. "Wake up" with no active night): pre-fill end time with now and require it */
  defaultEndTimeToNow?: boolean;
  /** Override initial start time (HH:mm) — used when pre-filling from predicted nap times */
  initialStartTimeOverride?: string;
  /** Override initial end time (HH:mm) — used when pre-filling from predicted nap times */
  initialEndTimeOverride?: string;
  onAddPause?: (entryId: string, data: { startTime: string; durationMinutes: number }) => Promise<SleepPause | null>;
  onUpdatePause?: (pauseId: string, data: { startTime?: string; durationMinutes?: number }) => Promise<boolean>;
  onDeletePause?: (pauseId: string) => Promise<boolean>;
  /** When non-null, a pause is in-flight (started at this time). */
  activePauseStart?: Date | null;
  /** Called when user taps Pause — parent sets activePauseStart. */
  onPauseStart?: () => void;
  /** Called when pause ends (resume or stop) — parent clears activePauseStart. */
  onPauseEnd?: () => void;
}

import { CloudIcon, MoonIcon } from './icons/SleepIcons';
import { TrashIcon, CheckIcon } from './icons/ActionIcons';

const PlayIcon = () => (
  <svg className="w-7 h-7 ml-1" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const StopIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
);

const PauseIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="5" width="4" height="14" rx="1" />
    <rect x="14" y="5" width="4" height="14" rx="1" />
  </svg>
);

const ONSET_OPTIONS = [
  { key: 'long_onset', icon: '⏳' },
  { key: 'upset', icon: '😢' },
] as const;

const METHOD_OPTIONS = [
  { key: 'in_bed', icon: '🛏' },
  { key: 'nursing', icon: '🤱' },
  { key: 'worn_or_held', icon: '🤲' },
  { key: 'next_to_me', icon: '👤' },
  { key: 'bottle_feeding', icon: '🍼' },
  { key: 'stroller', icon: '🚼' },
  { key: 'car', icon: '🚗' },
  { key: 'swing', icon: '🎠' },
] as const;

const ONSET_I18N: Record<string, string> = {
  long_onset: 'sleepEntry.longOnset',
  upset: 'sleepEntry.upset',
};

const METHOD_I18N: Record<string, string> = {
  in_bed: 'sleepEntry.inBed',
  nursing: 'sleepEntry.nursing',
  worn_or_held: 'sleepEntry.wornOrHeld',
  next_to_me: 'sleepEntry.nextToMe',
  bottle_feeding: 'sleepEntry.bottleFeeding',
  stroller: 'sleepEntry.stroller',
  car: 'sleepEntry.car',
  swing: 'sleepEntry.swing',
};

const END_OPTIONS = [
  { key: 'woke_up_child', icon: '🔔' },
  { key: 'woke_up_naturally', icon: '🌤' },
] as const;

const END_I18N: Record<string, string> = {
  woke_up_child: 'sleepEntry.wokeUpChild',
  woke_up_naturally: 'sleepEntry.wokeUpNaturally',
};

const MOOD_OPTIONS = [
  { key: 'bad', icon: '😟' },
  { key: 'neutral', icon: '😐' },
  { key: 'good', icon: '😊' },
] as const;

const MOOD_I18N: Record<string, string> = {
  bad: 'sleepEntry.badMood',
  neutral: 'sleepEntry.neutralMood',
  good: 'sleepEntry.goodMood',
};

const StormCloudIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" opacity="0.7" />
    <path d="M13 16l-2 4m3-6l-2 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

// Helpers
/** Extract local time HH:mm from an ISO datetime (UTC or with offset). Ensures form shows local time after DST/travel. */
const extractTime = (datetime: string): string => {
  if (!datetime) return '';
  const d = parseISO(datetime);
  return format(d, 'HH:mm');
};

const getCurrentTime = (): string => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
};

const isToday = (dateStr: string): boolean => {
  const today = new Date().toISOString().split('T')[0];
  return dateStr === today;
};

const isYesterday = (dateStr: string): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateStr === yesterday.toISOString().split('T')[0];
};

/** YYYY-MM-DD for today (for date input max). */
const getTodayStr = (): string => new Date().toISOString().split('T')[0];

/** True when the date is before today (past). Past-day logs must have an end time. */
const isPastDate = (dateStr: string): boolean => dateStr < getTodayStr();

const getDefaultTime = (selectedDate: string, sleepType: SleepType): string => {
  if (isToday(selectedDate)) {
    return getCurrentTime();
  }
  // Sensible defaults for past dates
  return sleepType === 'nap' ? '12:00' : '20:00';
};

const combineDateTime = (date: string, time: string): string => {
  return `${date}T${time}`;
};

// Use dateUtils for day arithmetic; format result to yyyy-MM-dd for combineDateTime
const nextDayStr = (date: string): string => formatDate(getNextDay(date));
const prevDayStr = (date: string): string => formatDate(getPreviousDay(date));

const isTimeBefore = (time1: string, time2: string): boolean => {
  return time1 < time2;
};

// Calculate duration between two times
const calculateDuration = (startTime: string, endTime: string | null): string => {
  if (!startTime || !endTime) return '';

  // Parse times
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  const startMinutes = startH * 60 + startM;
  let endMinutes = endH * 60 + endM;

  // If end is before start, it crossed midnight
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }

  const diffMinutes = endMinutes - startMinutes;
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes} min`;
};

// Duration for display under start time: "29min long", "1h 30min long"
const formatDurationLong = (startTime: string, endTime: string | null): string => {
  const raw = calculateDuration(startTime, endTime);
  if (!raw) return '';
  // Map "29 min" | "1h" | "1h 30 min" → "29min long" | "1h long" | "1h 30min long"
  if (raw.endsWith(' min')) return raw.replace(' min', 'min long');
  if (raw.endsWith('h')) return `${raw} long`;
  if (raw.includes('h ') && raw.endsWith(' min')) return raw.replace(' min', 'min long');
  return `${raw} long`;
};

// Label under end time: today = "Xh Y min ago", yesterday = "Yesterday", older = "Feb 10" (localized)
// No em-dash placeholder when empty — avoids skeleton-like appearance when ending a nap
const getRelativeDateLabel = (
  t: TFunction,
  dateStr: string,
  endTime: string | null,
  now: Date,
  isActiveEntry: boolean
): string => {
  if (!endTime) return isActiveEntry ? t('sleepEntrySheet.sleeping') : '';
  if (isToday(dateStr)) return getRelativeAgo(t, endTime, dateStr, now) || '';
  if (isYesterday(dateStr)) return t('time.yesterday');
  const date = parseISO(dateStr + 'T12:00:00');
  return format(date, 'MMM d', { locale: getDateFnsLocale() });
};

// Compute duration in minutes (for validation)
const computeDurationMinutes = (start: string, end: string): number => {
  if (!start || !end) return 0;
  const [sH, sM] = start.split(':').map(Number);
  const [eH, eM] = end.split(':').map(Number);
  const startMins = sH * 60 + sM;
  let endMins = eH * 60 + eM;
  if (endMins <= startMins) endMins += 24 * 60; // cross-midnight
  return endMins - startMins;
};

// Compute relative "ago" label for end time (localized)
const getRelativeAgo = (t: TFunction, timeStr: string, dateStr: string, now: Date): string => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const target = new Date(dateStr + 'T00:00:00');
  target.setHours(h, m, 0, 0);
  const diffMs = now.getTime() - target.getTime();
  if (diffMs < 0) return '';
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return t('time.justNow');
  if (diffMins < 60) return t('time.minAgo', { count: diffMins });
  const diffHours = Math.floor(diffMins / 60);
  const remainingMins = diffMins % 60;
  if (diffHours < 24) {
    if (remainingMins === 0) return t('time.hoursAgo', { count: diffHours });
    return t('time.hoursMinsAgo', { hours: diffHours, minutes: remainingMins });
  }
  return t('time.daysAgo', { count: Math.floor(diffHours / 24) });
};

/** Napper-style tall card button for qualitative tags */
function TagCard({ icon, label, selected, onClick }: {
  icon: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl text-xs font-medium transition-colors ${
        selected
          ? 'bg-[var(--nap-color)]/20 text-[var(--nap-color)] border border-[var(--nap-color)]/30'
          : 'border border-[var(--glass-border)] text-[var(--text-muted)]'
      }`}
      style={!selected ? { background: 'var(--glass-bg)' } : undefined}
    >
      <span className="text-2xl">{icon}</span>
      <span className="leading-tight text-center px-1">{label}</span>
    </button>
  );
}

/**
 * SleepEntrySheet — add or edit a single sleep entry (nap or night).
 *
 * Information we show:
 * - Header: type icon (cloud/moon) and type label ("Nap" / "Bedtime"). No entry date in header.
 * - Start and end time inputs (large, horizontal). End is optional for new entries (ongoing sleep).
 * - Below start time: duration in "Xmin long" / "Xh Ymin long" format (or "—" when no end time).
 * - Below end time: today = "Xh Y min ago"; yesterday = "Yesterday"; older = "Feb 10" (month + day). "Sleeping..." when editing an active entry with no end.
 * - Validation messages and midnight-crossing hint. Delete/Close in top bar; Save at bottom.
 */
export function SleepEntrySheet({
  entry,
  initialType = 'nap',
  isOpen,
  onClose,
  onSave,
  onDelete,
  selectedDate,
  onDateChange,
  saveError = null,
  defaultEndTimeToNow = false,
  initialStartTimeOverride,
  initialEndTimeOverride,
  onAddPause,
  onUpdatePause,
  onDeletePause,
  activePauseStart,
  onPauseStart,
  onPauseEnd,
}: SleepEntrySheetProps) {
  const { t } = useTranslation();
  const isEditing = !!entry;
  const sleepType: SleepType = entry?.type || initialType;

  // Initial values for comparison
  const initialStartTime = entry ? extractTime(entry.startTime) : getDefaultTime(selectedDate, sleepType);
  const initialEndTime = entry?.endTime ? extractTime(entry.endTime) : '';

  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);
  const [now, setNow] = useState(() => new Date());
  const [isSaving, setIsSaving] = useState(false);
  const [expandedPauseId, setExpandedPauseId] = useState<string | null>(null);
  const [isDetailExpanded, setIsDetailExpanded] = useState(false);
  const [pauseErrors, setPauseErrors] = useState<Record<string, string | null>>({});
  // Local draft durations for pause edits — committed to DB on blur/collapse/save
  const [pauseDurationDrafts, setPauseDurationDrafts] = useState<Record<string, number>>({});
  const [onsetTags, setOnsetTags] = useState<string[]>([]);
  const [sleepMethod, setSleepMethod] = useState<string | undefined>();
  const [entryNotes, setEntryNotes] = useState('');
  const [wakeMethod, setWakeMethod] = useState<string | undefined>();
  const [wakeMood, setWakeMood] = useState<string | undefined>();

  // Refresh "now" every 30 seconds while sheet is open — but pause the tick
  // when a pause card is expanded (user is editing a native picker/spinner that
  // would be dismissed by the React re-render on iOS Safari).
  useEffect(() => {
    if (!isOpen) return;
    if (expandedPauseId) return; // freeze while editing a pause
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, [isOpen, expandedPauseId]);

  // Reset time fields when the sheet opens or a different entry is selected
  const entryId = entry?.id ?? null;
  useEffect(() => {
    if (isOpen) {
      if (entry) {
        setStartTime(extractTime(entry.startTime));
        // Active entries: leave end time blank so user sees STOP button (not a pre-filled time)
        setEndTime(entry.endTime ? extractTime(entry.endTime) : '');
      } else {
        // Use overrides (e.g. from predicted nap tap) or fall back to defaults
        setStartTime(initialStartTimeOverride || getDefaultTime(selectedDate, sleepType));
        setEndTime(initialEndTimeOverride || (defaultEndTimeToNow ? getCurrentTime() : ''));
      }
      setExpandedPauseId(null);
      setIsDetailExpanded(false);
      setPauseErrors({});
      setPauseDurationDrafts({});
      setOnsetTags(entry?.onsetTags ?? []);
      setSleepMethod(entry?.sleepMethod);
      setEntryNotes(entry?.notes ?? '');
      setWakeMethod(entry?.wakeMethod);
      setWakeMood(entry?.wakeMood);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- reset on entry identity change (not reference), sheet open, or date/type change
  }, [entryId, isOpen, selectedDate, sleepType, defaultEndTimeToNow, initialStartTimeOverride, initialEndTimeOverride]);

  // Check if values have changed
  const hasChanges = useMemo(() => {
    const currentInitialStart = entry ? extractTime(entry.startTime) : '';
    const currentInitialEnd = entry?.endTime ? extractTime(entry.endTime) : '';

    if (!entry) {
      // For new entries, always allow save if there's a start time
      return !!startTime;
    }

    const tagsChanged = JSON.stringify(onsetTags) !== JSON.stringify(entry?.onsetTags ?? []);
    const methodChanged = sleepMethod !== (entry?.sleepMethod ?? undefined);
    const notesChanged = entryNotes !== (entry?.notes ?? '');
    const wakeMethodChanged = wakeMethod !== (entry?.wakeMethod ?? undefined);
    const wakeMoodChanged = wakeMood !== (entry?.wakeMood ?? undefined);
    return startTime !== currentInitialStart || endTime !== currentInitialEnd || tagsChanged || methodChanged || notesChanged || wakeMethodChanged || wakeMoodChanged;
  }, [entry, startTime, endTime, onsetTags, sleepMethod, entryNotes, wakeMethod, wakeMood]);

  // Is this an active (ongoing) entry? Has start but no end
  const isActiveEntry = isEditing && !entry?.endTime;

  // --- Pause entries (derived from entry prop) ---
  const pauseEntries = entry?.pauses ?? [];

  const isNightEntry = entry?.type === 'night';
  const pauseNumberLabel = (n: number) => isNightEntry
    ? t('sleepEntrySheet.nightWakingNumber', { number: n })
    : t('sleepEntrySheet.pauseNumber', { number: n });
  const addPauseLabel = isNightEntry
    ? t('sleepEntrySheet.addNightWaking')
    : t('sleepEntrySheet.addPause');
  const pausedStatusLabel = isNightEntry
    ? t('sleepEntrySheet.nightWakingStatus')
    : t('sleepEntrySheet.pausedStatus');

  // Duration under start time: "29min long"; relative date under end time: "2h ago" | "Yesterday" | "Feb 10"
  const durationLabel = useMemo(() => {
    // Active entry: show net elapsed time (gross minus completed pauses minus in-flight pause)
    if (isActiveEntry && entry) {
      const grossMinutes = calculateDurationISO(entry.startTime, null);
      const completedPauseMins = pauseEntries.reduce((sum, p) => sum + p.durationMinutes, 0);
      const inFlightMins = activePauseStart
        ? Math.max(0, Math.round((now.getTime() - activePauseStart.getTime()) / 60000))
        : 0;
      const netMins = Math.max(0, grossMinutes - completedPauseMins - inFlightMins);
      const hours = Math.floor(netMins / 60);
      const mins = netMins % 60;
      if (hours === 0) return `${mins}min`;
      if (mins === 0) return `${hours}h`;
      return `${hours}h ${mins}min`;
    }

    const raw = formatDurationLong(startTime, endTime);
    if (!raw) return '';

    // Completed entry with pauses: show net duration
    if (pauseEntries.length > 0 && entry?.endTime) {
      const totalPauseMins = pauseEntries.reduce((sum, p) => sum + p.durationMinutes, 0);
      const grossMins = computeDurationMinutes(startTime, endTime);
      const netMins = Math.max(0, grossMins - totalPauseMins);
      const hours = Math.floor(netMins / 60);
      const mins = netMins % 60;
      let netStr: string;
      if (hours === 0) netStr = `${mins}min long`;
      else if (mins === 0) netStr = `${hours}h long`;
      else netStr = `${hours}h ${mins}min long`;
      return netStr;
    }

    return raw;
  }, [startTime, endTime, pauseEntries, entry, isActiveEntry, activePauseStart, now]);

  const showNetSuffix = pauseEntries.length > 0 && !!entry?.endTime;

  const relativeDateLabel = useMemo(
    () => getRelativeDateLabel(t, selectedDate, endTime, now, isActiveEntry),
    [t, selectedDate, endTime, now, isActiveEntry]
  );

  // Icon state: Play (new, no end), Stop (active + no changes = end sleep), Check (save edits)
  const saveIcon = useMemo(() => {
    if (!isEditing && !endTime) return 'play';
    // Show stop icon only when no changes AND no pauses — user intends to end the sleep.
    // If pauses exist, show check icon — user is saving night waking edits, not ending sleep.
    if (isActiveEntry && !endTime && !hasChanges && pauseEntries.length === 0) return 'stop';
    return 'check';
  }, [isEditing, endTime, isActiveEntry, hasChanges, pauseEntries.length]);

  // Temporal validation — returns i18n keys for error/warning so component can translate
  const validation = useMemo((): { isValid: boolean; warningKey: string | null; errorKey: string | null } => {
    // "Log wake up" flow requires end time (bedtime + wake-up)
    if (defaultEndTimeToNow && !endTime) {
      return { isValid: false, warningKey: null, errorKey: 'wakeUpSheet.pleaseSetWakeUpTime' };
    }
    // Past dates: sleep is already over, so end time is required — except night sleep,
    // which routinely starts yesterday evening and is still ongoing (e.g. bedtime at 20:00, it's now 4 AM)
    if (!isEditing && isPastDate(selectedDate) && !endTime && sleepType !== 'night') {
      return { isValid: false, warningKey: null, errorKey: 'sleepEntrySheet.pastDateRequiresEndTime' };
    }
    // No end time = no validation needed (ongoing entry), unless we require it above
    if (!endTime) return { isValid: true, warningKey: null, errorKey: null };

    const mins = computeDurationMinutes(startTime, endTime);
    const crossesMidnight = isTimeBefore(endTime, startTime);

    // Zero duration
    if (mins === 0 || mins === 24 * 60) {
      return { isValid: false, warningKey: null, errorKey: 'sleepEntrySheet.sameStartEnd' };
    }

    if (sleepType === 'nap') {
      // Nap > 5h → block
      if (mins > 5 * 60) return { isValid: false, warningKey: null, errorKey: 'sleepEntrySheet.napExceeds5h' };
      // Nap > 4h → warn
      if (mins > 4 * 60) return { isValid: true, warningKey: 'sleepEntrySheet.unusuallyLongNap', errorKey: null };
      // Cross-midnight nap → warn but allow
      if (crossesMidnight) return { isValid: true, warningKey: 'sleepEntrySheet.napCrossesMidnight', errorKey: null };
    } else {
      // Night > 14h → block
      if (mins > 14 * 60) return { isValid: false, warningKey: null, errorKey: 'sleepEntrySheet.nightExceeds14h' };
      // Night > 13h → warn
      if (mins > 13 * 60) return { isValid: true, warningKey: 'sleepEntrySheet.unusuallyLongNight', errorKey: null };
    }

    return { isValid: true, warningKey: null, errorKey: null };
  }, [startTime, endTime, sleepType, defaultEndTimeToNow, isEditing, selectedDate]);

  // --- Pause validation ---
  /** Validate a single pause against the entry bounds and other pauses. Returns i18n error key or null. */
  const validatePause = useCallback((pause: { startTime: string; durationMinutes: number }, pauseId: string): string | null => {
    if (!entry || !startTime || !endTime) return null;

    const entryStartDate = parseISO(entry.startTime);
    const pauseStart = parseISO(pause.startTime);
    const pauseEndMs = pauseStart.getTime() + pause.durationMinutes * 60 * 1000;

    // Entry end as Date
    const entryEnd = entry.endTime ? parseISO(entry.endTime) : null;

    if (pause.durationMinutes <= 0) return 'sleepEntrySheet.pauseZeroDuration';
    if (pauseStart.getTime() < entryStartDate.getTime()) return 'sleepEntrySheet.pauseBeforeStart';
    if (entryEnd && pauseStart.getTime() >= entryEnd.getTime()) return 'sleepEntrySheet.pauseAfterEnd';
    if (entryEnd && pauseEndMs > entryEnd.getTime()) return 'sleepEntrySheet.pauseExceedsEnd';

    // Overlap check
    for (const other of pauseEntries) {
      if (other.id === pauseId) continue;
      const otherStart = parseISO(other.startTime).getTime();
      const otherEnd = otherStart + other.durationMinutes * 60 * 1000;
      if (pauseStart.getTime() < otherEnd && pauseEndMs > otherStart) {
        return 'sleepEntrySheet.pauseOverlap';
      }
    }

    return null;
  }, [entry, startTime, endTime, pauseEntries]);

  const handleSave = async () => {
    if (!validation.isValid) return;
    if (!hasChanges && isEditing && !isActiveEntry) return;
    if (isSaving) return;

    // If paused, end the pause first before stopping
    if (activePauseStart && onPauseEnd && onAddPause && entry) {
      const pauseDuration = Math.max(1, Math.round((Date.now() - activePauseStart.getTime()) / 60000));
      await onAddPause(entry.id, {
        startTime: activePauseStart.toISOString(),
        durationMinutes: pauseDuration,
      });
      onPauseEnd();
    }

    // Flush any pending pause duration edits before saving
    await flushPauseDurationDrafts();

    // Active entry with pauses but no other changes: pauses are already persisted to DB,
    // so just close the sheet without re-saving the entry (which would be a no-op).
    if (isActiveEntry && !endTime && !hasChanges && pauseEntries.length > 0) {
      onClose();
      return;
    }

    // Only auto-fill end time (stop sleep) when the user explicitly wants to end it:
    // active entry + no end time + no metadata changes + no pauses.
    const shouldAutoStop = isActiveEntry && !endTime && !hasChanges && pauseEntries.length === 0;
    const resolvedEndTime = shouldAutoStop ? getCurrentTime() : endTime;
    let payload: Omit<SleepEntry, 'id' | 'date'>;

    if (sleepType === 'nap') {
      let endDateTime: string | null = null;
      if (resolvedEndTime) {
        if (isTimeBefore(resolvedEndTime, startTime)) {
          endDateTime = combineDateTime(nextDayStr(selectedDate), resolvedEndTime);
        } else {
          endDateTime = combineDateTime(selectedDate, resolvedEndTime);
        }
      }
      payload = {
        startTime: combineDateTime(selectedDate, startTime),
        endTime: endDateTime,
        type: 'nap',
        onsetTags: onsetTags.length > 0 ? onsetTags : undefined,
        sleepMethod: sleepMethod ?? undefined,
        notes: entryNotes.trim() || undefined,
        wakeMethod: wakeMethod ?? undefined,
        wakeMood: wakeMood ?? undefined,
      };
    } else {
      const [startHour] = startTime.split(':').map(Number);
      const isPostMidnightBedtime = startHour >= 0 && startHour <= 3;
      const bedtimeDate = isPostMidnightBedtime ? prevDayStr(selectedDate) : selectedDate;
      let endDateTime: string | null = null;
      if (resolvedEndTime) {
        if (isTimeBefore(resolvedEndTime, startTime)) {
          endDateTime = combineDateTime(nextDayStr(bedtimeDate), resolvedEndTime);
        } else if (isPostMidnightBedtime) {
          endDateTime = combineDateTime(selectedDate, resolvedEndTime);
        } else {
          endDateTime = combineDateTime(bedtimeDate, resolvedEndTime);
        }
      }
      payload = {
        startTime: combineDateTime(bedtimeDate, startTime),
        endTime: endDateTime,
        type: 'night',
        onsetTags: onsetTags.length > 0 ? onsetTags : undefined,
        sleepMethod: sleepMethod ?? undefined,
        notes: entryNotes.trim() || undefined,
        wakeMethod: wakeMethod ?? undefined,
        wakeMood: wakeMood ?? undefined,
      };
    }

    setIsSaving(true);
    try {
      await Promise.resolve(onSave(payload));
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (entry && onDelete) {
      onDelete(entry.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  const handleAddPause = async () => {
    if (!entry || !onAddPause || !entry.endTime) return;
    if (pauseEntries.length >= 5) return;

    // Default: right after the last pause, or midpoint of nap if no pauses yet
    const entryStartMs = parseISO(entry.startTime).getTime();
    const entryEndMs = parseISO(entry.endTime).getTime();

    let defaultStartMs: number;
    if (pauseEntries.length > 0) {
      const lastPause = pauseEntries[pauseEntries.length - 1];
      const lastPauseEnd = parseISO(lastPause.startTime).getTime() + lastPause.durationMinutes * 60 * 1000;
      defaultStartMs = lastPauseEnd;
    } else {
      // First pause: default to midpoint of the nap (more likely than nap start)
      defaultStartMs = entryStartMs + Math.floor((entryEndMs - entryStartMs) / 2);
    }

    const defaultStart = new Date(defaultStartMs).toISOString();
    const result = await onAddPause(entry.id, { startTime: defaultStart, durationMinutes: 5 });
    if (result) {
      setExpandedPauseId(result.id);
    }
  };

  const handleUpdatePause = async (pauseId: string, data: { startTime?: string; durationMinutes?: number }) => {
    if (!onUpdatePause) return;

    const currentPause = pauseEntries.find((p) => p.id === pauseId);
    if (!currentPause) return;

    const merged = {
      startTime: data.startTime ?? currentPause.startTime,
      durationMinutes: data.durationMinutes ?? currentPause.durationMinutes,
    };

    const errorKey = validatePause(merged, pauseId);
    setPauseErrors((prev) => ({ ...prev, [pauseId]: errorKey }));
    if (errorKey) return;

    // Skip DB call if nothing actually changed (e.g. user reverted to original value)
    const hasChange = (data.startTime !== undefined && data.startTime !== currentPause.startTime) ||
                      (data.durationMinutes !== undefined && data.durationMinutes !== currentPause.durationMinutes);
    if (!hasChange) return;

    await onUpdatePause(pauseId, data);
  };

  // Flush any pending draft duration edits to the DB (called before save and on card collapse)
  const flushPauseDurationDrafts = async () => {
    const drafts = { ...pauseDurationDrafts };
    for (const [pauseId, duration] of Object.entries(drafts)) {
      const pause = pauseEntries.find((p) => p.id === pauseId);
      if (pause && duration !== pause.durationMinutes && duration > 0) {
        await handleUpdatePause(pauseId, { durationMinutes: duration });
      }
    }
    setPauseDurationDrafts({});
  };

  const handleDeletePause = async (pauseId: string) => {
    if (!onDeletePause) return;
    await onDeletePause(pauseId);
    setPauseErrors((prev) => {
      const next = { ...prev };
      delete next[pauseId];
      return next;
    });
  };

  const handlePause = () => {
    if (!onPauseStart) return;
    onPauseStart();
  };

  const handleResume = async () => {
    if (!activePauseStart || !onPauseEnd || !onAddPause || !entry) return;
    const durationMinutes = Math.max(1, Math.round((Date.now() - activePauseStart.getTime()) / 60000));
    await onAddPause(entry.id, {
      startTime: activePauseStart.toISOString(),
      durationMinutes,
    });
    onPauseEnd();
  };

  const toggleOnsetTag = (key: string) => {
    setOnsetTags((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const toggleSleepMethod = (key: string) => {
    setSleepMethod((prev) => (prev === key ? undefined : key));
  };

  const toggleWakeMethod = (key: string) => {
    setWakeMethod((prev) => (prev === key ? undefined : key));
  };

  const toggleWakeMood = (key: string) => {
    setWakeMood((prev) => (prev === key ? undefined : key));
  };

  const themeColor = sleepType === 'nap' ? 'var(--nap-color)' : 'var(--night-color)';
  const themeBg = sleepType === 'nap' ? 'var(--nap-color)' : 'var(--night-color)';
  const typeLabel = sleepType === 'nap' ? t('sleepEntry.nap') : t('sleepEntry.nightSleep');

  const dialogRef = useFocusTrap(isOpen, onClose);

  // Motion values for drag-to-dismiss
  const y = useMotionValue(0);

  const handleDragEnd = (_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
    // Dismiss if dragged down far enough or with enough velocity
    if (info.offset.y > 150 || info.velocity.y > 500) {
      onClose();
    }
  };

  return (
    <>
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — subtle dark overlay (no blur), fades on drag */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black z-50"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Bottom Sheet with drag-to-dismiss */}
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={isEditing ? t('sleepEntrySheet.ariaEditEntry') : (sleepType === 'nap' ? t('sleepEntrySheet.ariaLogNap') : t('sleepEntrySheet.ariaLogNightSleep'))}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={handleDragEnd}
            style={{ y }}
            className="fixed bottom-0 left-0 right-0 z-50 touch-none"
          >
            <div
              className="bg-[var(--bg-card)] rounded-t-[2rem] shadow-[0_-8px_40px_rgba(0,0,0,0.3)] flex flex-col"
              style={{ maxHeight: isDetailExpanded ? '90dvh' : '75dvh', transition: 'max-height 0.3s ease' }}
            >
              {/* Handle bar — drag to dismiss, tap to expand/collapse */}
              <div
                className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
                onClick={() => setIsDetailExpanded((v) => !v)}
              >
                <div className="w-10 h-1.5 bg-[var(--text-muted)]/60 rounded-full" />
              </div>

              {/* Header with delete and close */}
              <div className="flex items-center justify-between px-6 pb-2">
                {/* Delete button (left) - circle bg */}
                {isEditing && onDelete ? (
                  <button
                    onClick={handleDelete}
                    className="w-11 h-11 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--danger-color)] transition-colors"
                    style={{ background: 'color-mix(in srgb, var(--text-muted) 15%, transparent)' }}
                    aria-label={t('common.ariaDelete')}
                  >
                    <TrashIcon />
                  </button>
                ) : (
                  <div className="w-11" />
                )}

                {/* Expand/collapse toggle (right) - three dots */}
                <button
                  onClick={() => setIsDetailExpanded((v) => !v)}
                  className="w-11 h-11 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  style={{ background: 'color-mix(in srgb, var(--text-muted) 15%, transparent)' }}
                  aria-label={isDetailExpanded ? t('common.ariaCollapse') : t('common.ariaExpand')}
                  aria-expanded={isDetailExpanded}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="5" cy="12" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="19" cy="12" r="2" />
                  </svg>
                </button>
              </div>

              {/* Scrollable content area */}
              <div className="flex-1 overflow-y-auto min-h-0">
              {/* Center: Type icon and label */}
              <div className="flex flex-col items-center pb-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 400, damping: 20 }}
                  className="w-20 h-20 rounded-full flex items-center justify-center mb-3"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${themeBg} 15%, transparent)`,
                    color: themeColor
                  }}
                >
                  {sleepType === 'nap' ? <CloudIcon className="w-12 h-12" /> : <MoonIcon className="w-12 h-12" />}
                </motion.div>
                <span
                  className="font-display font-semibold text-lg"
                  style={{ color: themeColor }}
                >
                  {typeLabel}
                </span>

                {/* Date picker for new entries: log for today, yesterday, or another past day */}
                {!isEditing && onDateChange && (
                  <label htmlFor="sleep-entry-date" className="mt-4 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-[var(--bg-soft)] border border-[var(--glass-border)] cursor-pointer w-full max-w-[240px] mx-auto">
                    <CalendarIcon />
                    <span className="text-[var(--text-primary)] font-display font-medium text-sm">
                      {isToday(selectedDate)
                        ? t('time.today')
                        : isYesterday(selectedDate)
                          ? t('time.yesterday')
                          : format(parseISO(selectedDate + 'T12:00:00'), 'EEE, MMM d', { locale: getDateFnsLocale() })}
                    </span>
                    <input
                      id="sleep-entry-date"
                      type="date"
                      value={selectedDate}
                      max={getTodayStr()}
                      onChange={(e) => onDateChange(e.target.value)}
                      className="absolute opacity-0 w-0 h-0"
                      aria-label={t('sleepEntrySheet.logForDate')}
                    />
                  </label>
                )}
              </div>

              {/* Time inputs - large, horizontal */}
              <div className="px-6 pb-4">
                <div className="flex items-center justify-center gap-4">
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    aria-label={t('sleepEntrySheet.startTime')}
                    className="text-center font-display font-bold text-[var(--text-primary)] bg-transparent border-none outline-none appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-datetime-edit-fields-wrapper]:p-0"
                    style={{ fontSize: '2.75rem', lineHeight: 1.2, width: '7ch' }}
                  />
                  <span className="text-2xl text-[var(--text-muted)] font-light" aria-hidden="true">–</span>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder=""
                    aria-label={t('sleepEntrySheet.endTime')}
                    className="text-center font-display font-bold bg-transparent border-none outline-none appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-datetime-edit-fields-wrapper]:p-0"
                    style={{ fontSize: '2.75rem', lineHeight: 1.2, width: '7ch', color: endTime ? 'var(--text-primary)' : 'var(--text-muted)' }}
                  />
                </div>

                {/* Duration below start time, relative date below end time; only show when we have content (no skeleton dashes) */}
                <div className="flex justify-center items-baseline gap-4 mt-5">
                  <p className="min-w-[7ch] text-center text-sm tracking-wide text-[var(--text-muted)] whitespace-nowrap">
                    {durationLabel}
                    {showNetSuffix && (
                      <span className="text-xs ml-1 opacity-60"> {t('sleepEntrySheet.netSuffix')}</span>
                    )}
                  </p>
                  {durationLabel && relativeDateLabel ? (
                    <p className="text-center text-sm text-[var(--text-muted)] italic shrink-0" aria-hidden="true">
                      –
                    </p>
                  ) : null}
                  <p className={`min-w-[7ch] text-center text-sm tracking-wide text-[var(--text-muted)] whitespace-nowrap ${!endTime && isActiveEntry ? 'italic' : ''}`}>
                    {relativeDateLabel}
                  </p>
                </div>

                {/* Paused status indicator */}
                {isActiveEntry && activePauseStart && (
                  <p className="text-center text-sm font-display italic mt-2" style={{ color: 'var(--wake-color)' }}>
                    {pausedStatusLabel}
                  </p>
                )}

                {/* Validation messages */}
                {validation.errorKey && (
                  <p className="text-xs text-center mt-3" style={{ color: 'var(--danger-color)' }}>
                    {t(validation.errorKey)}
                  </p>
                )}
                {validation.warningKey && !validation.errorKey && (
                  <p className="text-xs text-center mt-3" style={{ color: 'var(--wake-color)' }}>
                    {t(validation.warningKey)}
                  </p>
                )}

                {/* Hint for crossing midnight (suppress when validation error shown) */}
                {!validation.errorKey && !validation.warningKey && endTime && isTimeBefore(endTime, startTime) && (
                  <p className="text-xs text-[var(--text-muted)] text-center mt-3">
                    {sleepType === 'nap' ? t('sleepEntrySheet.endsNextDay') : t('sleepEntrySheet.wakeUpNextDay')}
                  </p>
                )}
              </div>

              {/* Detail section — hidden by default, shown when ⋯ is tapped */}
              {isDetailExpanded && <>
              {/* Pause section — for completed entries or active entries with pauses */}
              {isEditing && (entry?.endTime || pauseEntries.length > 0) && (
                <div className="px-6 pb-4">
                  {/* Divider */}
                  <div className="h-px bg-[var(--text-muted)]/10 mb-4" />

                  {/* Pause cards */}
                  {pauseEntries.length > 0 && (
                    <div className="flex flex-col gap-2 mb-3">
                      {pauseEntries.map((pause, index) => {
                        const isExpanded = expandedPauseId === pause.id;
                        const pauseStartLocal = format(parseISO(pause.startTime), 'HH:mm');
                        const errorKey = pauseErrors[pause.id];

                        return (
                          <div
                            key={pause.id}
                            className="rounded-xl"
                            style={{ background: 'var(--glass-bg)' }}
                          >
                            {/* Collapsed header — div[role=button] to avoid nesting <button> inside <button> */}
                            <div
                              role="button"
                              tabIndex={0}
                              className="w-full flex items-center justify-between p-3 text-left cursor-pointer"
                              onClick={() => {
                                if (isExpanded) {
                                  // Flush draft duration on collapse
                                  const draft = pauseDurationDrafts[pause.id];
                                  if (draft !== undefined && draft > 0 && draft !== pause.durationMinutes) {
                                    handleUpdatePause(pause.id, { durationMinutes: draft });
                                    setPauseDurationDrafts((prev) => { const next = { ...prev }; delete next[pause.id]; return next; });
                                  }
                                }
                                setExpandedPauseId(isExpanded ? null : pause.id);
                              }}
                              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedPauseId(isExpanded ? null : pause.id); } }}
                              aria-expanded={isExpanded}
                            >
                              <div className="flex items-center gap-2.5">
                                {isNightEntry ? <StormCloudIcon className="w-4 h-4 text-[var(--wake-color)]" /> : <span className="text-[var(--text-muted)] text-sm">⏸</span>}
                                <div>
                                  <p className={`${isNightEntry ? 'text-[var(--wake-color)]' : 'text-[var(--text-primary)]'} text-sm font-medium`}>
                                    {pauseNumberLabel(index + 1)}
                                  </p>
                                  <p className="text-[var(--text-muted)] text-xs">
                                    {pauseStartLocal} · {pauseDurationDrafts[pause.id] ?? pause.durationMinutes}{t('sleepEntrySheet.pauseDurationUnit')}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeletePause(pause.id);
                                  }}
                                  className="p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--danger-color)] transition-colors"
                                  aria-label={t('common.ariaDelete')}
                                >
                                  <TrashIcon />
                                </button>
                                <span className="text-[var(--text-muted)] text-xs">
                                  {isExpanded ? '▲' : '▼'}
                                </span>
                              </div>
                            </div>

                            {/* Expanded: start time + duration inputs */}
                            {isExpanded && (
                              <div className="px-3 pb-3">
                                <div className="flex gap-3">
                                  <div className="flex-1">
                                    <label className="text-[var(--text-muted)] text-xs uppercase tracking-wider mb-1 block">
                                      {t('sleepEntrySheet.pauseStart')}
                                    </label>
                                    <input
                                      type="time"
                                      value={pauseStartLocal}
                                      onChange={(e) => {
                                        if (!e.target.value) return;
                                        // For night entries crossing midnight, if the pause time is before the entry start time,
                                        // the pause is post-midnight and should use the next day
                                        const entryStartTime = extractTime(entry.startTime);
                                        const pauseDate = isTimeBefore(e.target.value, entryStartTime)
                                          ? nextDayStr(entry.date)
                                          : entry.date;
                                        const newStartTime = combineDateTime(pauseDate, e.target.value);
                                        handleUpdatePause(pause.id, { startTime: newStartTime });
                                      }}
                                      className="input w-full text-center text-sm"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <label className="text-[var(--text-muted)] text-xs uppercase tracking-wider mb-1 block">
                                      {t('sleepEntrySheet.pauseDuration')}
                                    </label>
                                    <div className="flex items-center gap-1">
                                      <input
                                        type="number"
                                        min="1"
                                        max="120"
                                        value={pauseDurationDrafts[pause.id] ?? pause.durationMinutes}
                                        onChange={(e) => {
                                          const val = parseInt(e.target.value, 10);
                                          setPauseDurationDrafts((prev) => ({
                                            ...prev,
                                            [pause.id]: isNaN(val) ? pause.durationMinutes : val,
                                          }));
                                        }}
                                        onBlur={(e) => {
                                          const val = parseInt(e.target.value, 10);
                                          if (!isNaN(val) && val > 0) {
                                            handleUpdatePause(pause.id, { durationMinutes: val });
                                            setPauseDurationDrafts((prev) => {
                                              const next = { ...prev };
                                              delete next[pause.id];
                                              return next;
                                            });
                                          }
                                        }}
                                        className="input w-full text-center text-sm"
                                      />
                                      <span className="text-[var(--text-muted)] text-xs shrink-0">
                                        {t('sleepEntrySheet.pauseDurationUnit')}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                {/* Pause validation error */}
                                {errorKey && (
                                  <p className="text-xs mt-2" style={{ color: 'var(--danger-color)' }}>
                                    {t(errorKey)}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add pause button — only for completed entries (active entries use Pause/Play button) */}
                  {entry?.endTime && <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={handleAddPause}
                      disabled={pauseEntries.length >= 5}
                      className={`py-2 px-5 rounded-full text-sm font-medium transition-colors ${
                        pauseEntries.length >= 5
                          ? 'opacity-30 cursor-not-allowed'
                          : 'hover:brightness-110'
                      }`}
                      style={{
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {addPauseLabel} +
                      {pauseEntries.length >= 5 && ` (${t('sleepEntrySheet.maxPausesReached')})`}
                    </button>
                  </div>}
                </div>
              )}

              {/* Qualitative info — Napper-style card grids */}
              <div className="px-6 pb-4">
                {/* Divider */}
                <div className="h-px bg-[var(--text-muted)]/10 mb-4" />

                {/* Start (onset quality) — multi-select, 2×1 */}
                <div className="mb-5">
                  <p className="text-[var(--text-primary)] text-sm font-display font-semibold mb-2">
                    {t('sleepEntry.onsetLabel')}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {ONSET_OPTIONS.map(({ key, icon }) => (
                      <TagCard
                        key={key}
                        icon={icon}
                        label={t(ONSET_I18N[key]!)}
                        selected={onsetTags.includes(key)}
                        onClick={() => toggleOnsetTag(key)}
                      />
                    ))}
                  </div>
                </div>

                {/* How (sleep method) — single-select, 3×3 */}
                <div className="mb-5">
                  <p className="text-[var(--text-primary)] text-sm font-display font-semibold mb-2">
                    {t('sleepEntry.howLabel')}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {METHOD_OPTIONS.map(({ key, icon }) => (
                      <TagCard
                        key={key}
                        icon={icon}
                        label={t(METHOD_I18N[key]!)}
                        selected={sleepMethod === key}
                        onClick={() => toggleSleepMethod(key)}
                      />
                    ))}
                  </div>
                </div>

                {/* End (wake method) — single-select, 2×1 */}
                <div className="mb-5">
                  <p className="text-[var(--text-primary)] text-sm font-display font-semibold mb-2">
                    {t('sleepEntry.endLabel')}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {END_OPTIONS.map(({ key, icon }) => (
                      <TagCard
                        key={key}
                        icon={icon}
                        label={t(END_I18N[key]!)}
                        selected={wakeMethod === key}
                        onClick={() => toggleWakeMethod(key)}
                      />
                    ))}
                  </div>
                </div>

                {/* Wake up mood — single-select, 3×1 */}
                <div className="mb-5">
                  <p className="text-[var(--text-primary)] text-sm font-display font-semibold mb-2">
                    {t('sleepEntry.wakeMoodLabel')}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {MOOD_OPTIONS.map(({ key, icon }) => (
                      <TagCard
                        key={key}
                        icon={icon}
                        label={t(MOOD_I18N[key]!)}
                        selected={wakeMood === key}
                        onClick={() => toggleWakeMood(key)}
                      />
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <p className="text-[var(--text-primary)] text-sm font-display font-semibold mb-2">
                    {t('sleepEntry.notesLabel')}
                  </p>
                  <textarea
                    rows={2}
                    value={entryNotes}
                    onChange={(e) => setEntryNotes(e.target.value)}
                    placeholder={t('sleepEntry.notesPlaceholderEmpty')}
                    className="input w-full text-sm resize-none rounded-xl border border-[var(--glass-border)]"
                  />
                </div>
              </div>
              </>}{/* end isDetailExpanded */}

              {/* Save error from parent (e.g. network failure) */}
              {saveError && (
                <p className="text-center text-sm text-[var(--danger-color)] px-6 pb-2" role="alert">
                  {saveError}
                </p>
              )}
              </div>{/* end scrollable content */}
              {/* Gradient blur hint — signals more content above */}
              <div
                className="h-6 -mt-6 pointer-events-none relative z-10"
                style={{
                  background: 'linear-gradient(transparent, var(--bg-card))',
                }}
              />
              {/* Action buttons */}
              <div className="flex items-center justify-center gap-6 pb-8 pt-4">
                {/* Pause/Play button — only for active entries */}
                {isActiveEntry && (
                  <motion.button
                    onClick={activePauseStart ? handleResume : handlePause}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg relative"
                    style={{
                      backgroundColor: themeBg,
                      color: sleepType === 'night' ? 'var(--text-on-accent)' : 'var(--bg-deep)',
                    }}
                    aria-label={activePauseStart ? t('sleepEntrySheet.resumeAction') : (isNightEntry ? t('sleepEntrySheet.nightWaking') : t('sleepEntrySheet.pauseAction'))}
                  >
                    {/* Pulsing ring when paused */}
                    {activePauseStart && (
                      <span
                        className="absolute inset-0 rounded-full animate-ping"
                        style={{ border: '2px solid var(--wake-color)', opacity: 0.4 }}
                      />
                    )}
                    {activePauseStart ? <PlayIcon /> : <PauseIcon />}
                  </motion.button>
                )}

                {/* Stop / Save button */}
                <motion.button
                  onClick={handleSave}
                  disabled={!validation.isValid || (isEditing && !hasChanges && !isActiveEntry) || isSaving}
                  whileTap={(validation.isValid && (!isEditing || hasChanges || isActiveEntry) && !isSaving) ? { scale: 0.9 } : undefined}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  className={`${isActiveEntry ? 'w-14 h-14' : 'w-16 h-16'} rounded-full flex items-center justify-center shadow-lg ${
                    (validation.isValid && (!isEditing || hasChanges || isActiveEntry) && !isSaving)
                      ? ''
                      : 'opacity-40 cursor-not-allowed'
                  }`}
                  style={{
                    backgroundColor: (validation.isValid && (!isEditing || hasChanges || isActiveEntry) && !isSaving) ? themeBg : 'var(--text-muted)',
                    color: sleepType === 'night' ? 'var(--text-on-accent)' : 'var(--bg-deep)',
                  }}
                  aria-label={isSaving ? t('common.saving') : t('sleepEntrySheet.save')}
                  aria-busy={isSaving}
                >
                  {isSaving ? (
                    <div className="w-8 h-8 rounded-full border-2 border-current/30 border-t-current animate-spin" aria-hidden="true" />
                  ) : (
                    saveIcon === 'play' ? <PlayIcon /> : saveIcon === 'stop' ? <StopIcon /> : <CheckIcon />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>

    <ConfirmationModal
      isOpen={showDeleteConfirm}
      onConfirm={handleConfirmDelete}
      onCancel={() => setShowDeleteConfirm(false)}
      title={t('sleepEntrySheet.deleteEntryTitle')}
      description={t('sleepEntrySheet.deleteEntryDescription')}
    />
    </>
  );
}
