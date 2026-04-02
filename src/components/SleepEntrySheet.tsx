import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { ConfirmationModal } from './ConfirmationModal';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { formatDate, getNextDay, getPreviousDay } from '../utils/dateUtils';
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
}

import { CloudIcon, MoonIcon } from './icons/SleepIcons';
import { TrashIcon, CloseIcon, CheckIcon } from './icons/ActionIcons';

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
  const [pauseErrors, setPauseErrors] = useState<Record<string, string | null>>({});

  // Refresh "now" every 30 seconds while sheet is open
  useEffect(() => {
    if (!isOpen) return;
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Reset when entry changes or sheet opens
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
      setPauseErrors({});
    }
  }, [entry, isOpen, selectedDate, sleepType, defaultEndTimeToNow, initialStartTimeOverride, initialEndTimeOverride]);

  // Check if values have changed
  const hasChanges = useMemo(() => {
    const currentInitialStart = entry ? extractTime(entry.startTime) : '';
    const currentInitialEnd = entry?.endTime ? extractTime(entry.endTime) : '';

    if (!entry) {
      // For new entries, always allow save if there's a start time
      return !!startTime;
    }

    return startTime !== currentInitialStart || endTime !== currentInitialEnd;
  }, [entry, startTime, endTime]);

  // Is this an active (ongoing) entry? Has start but no end
  const isActiveEntry = isEditing && !entry?.endTime;

  // --- Pause entries (derived from entry prop) ---
  const pauseEntries = entry?.pauses ?? [];

  // Duration under start time: "29min long"; relative date under end time: "2h ago" | "Yesterday" | "Feb 10"
  const durationLabel = useMemo(() => {
    const raw = formatDurationLong(startTime, endTime);
    if (!raw) return '';

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
  }, [startTime, endTime, pauseEntries, entry?.endTime]);

  const showNetSuffix = pauseEntries.length > 0 && !!entry?.endTime;

  const relativeDateLabel = useMemo(
    () => getRelativeDateLabel(t, selectedDate, endTime, now, isActiveEntry),
    [t, selectedDate, endTime, now, isActiveEntry]
  );

  // Icon state: Play (new, no end), Stop (active + no changes = end sleep), Check (save edits)
  const saveIcon = useMemo(() => {
    if (!isEditing && !endTime) return 'play';
    if (isActiveEntry && !endTime && !hasChanges) return 'stop';
    return 'check';
  }, [isEditing, endTime, isActiveEntry, hasChanges]);

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

    const resolvedEndTime = (isActiveEntry && !endTime && !hasChanges) ? getCurrentTime() : endTime;
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

    const entryStartMs = parseISO(entry.startTime).getTime();
    const entryEndMs = parseISO(entry.endTime).getTime();

    let defaultStartMs: number;
    if (pauseEntries.length > 0) {
      const lastPause = pauseEntries[pauseEntries.length - 1];
      const lastPauseEnd = parseISO(lastPause.startTime).getTime() + lastPause.durationMinutes * 60 * 1000;
      defaultStartMs = lastPauseEnd + Math.floor((entryEndMs - lastPauseEnd) / 2);
    } else {
      defaultStartMs = entryStartMs + Math.floor((entryEndMs - entryStartMs) / 2);
    }

    defaultStartMs = Math.max(entryStartMs, Math.min(defaultStartMs, entryEndMs - 5 * 60 * 1000));

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

    await onUpdatePause(pauseId, data);
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

  const themeColor = sleepType === 'nap' ? 'var(--nap-color)' : 'var(--night-color)';
  const themeBg = sleepType === 'nap' ? 'var(--nap-color)' : 'var(--night-color)';
  const typeLabel = sleepType === 'nap' ? t('sleepEntry.nap') : t('sleepEntry.nightSleep');

  const dialogRef = useFocusTrap(isOpen, onClose);

  // Motion values for drag-to-dismiss
  const y = useMotionValue(0);
  const backdropOpacity = useTransform(y, [0, 300], [1, 0]);

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
          {/* Backdrop with blur - fades based on drag position */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ opacity: backdropOpacity }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
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
              className="bg-[var(--bg-card)] rounded-t-[2rem] shadow-[0_-8px_40px_rgba(0,0,0,0.3)]"
              style={{ minHeight: '50dvh' }}
            >
              {/* Handle bar — drag to dismiss */}
              <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
                <div className="w-10 h-1 bg-[var(--text-muted)]/30 rounded-full" />
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

                {/* Close button (right) - circle bg */}
                <button
                  onClick={onClose}
                  className="w-11 h-11 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  style={{ background: 'color-mix(in srgb, var(--text-muted) 15%, transparent)' }}
                  aria-label={t('common.ariaClose')}
                >
                  <CloseIcon />
                </button>
              </div>

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
                      <span className="text-xs ml-1 opacity-60">{t('sleepEntrySheet.netSuffix')}</span>
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

              {/* Pause section — only for completed entries being edited */}
              {isEditing && entry?.endTime && (
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
                            {/* Collapsed header */}
                            <button
                              type="button"
                              className="w-full flex items-center justify-between p-3 text-left"
                              onClick={() => setExpandedPauseId(isExpanded ? null : pause.id)}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="text-[var(--text-muted)] text-sm">⏸</span>
                                <div>
                                  <p className="text-[var(--text-primary)] text-sm font-medium">
                                    {t('sleepEntrySheet.pauseNumber', { number: index + 1 })}
                                  </p>
                                  <p className="text-[var(--text-muted)] text-xs">
                                    {pauseStartLocal} · {pause.durationMinutes}{t('sleepEntrySheet.pauseDurationUnit')}
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
                            </button>

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
                                        const newStartTime = combineDateTime(entry.date, e.target.value);
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
                                        value={pause.durationMinutes}
                                        onChange={(e) => {
                                          const val = parseInt(e.target.value, 10);
                                          if (!isNaN(val) && val > 0) {
                                            handleUpdatePause(pause.id, { durationMinutes: val });
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

                  {/* Add pause button */}
                  <button
                    type="button"
                    onClick={handleAddPause}
                    disabled={pauseEntries.length >= 5}
                    className={`w-full py-2.5 rounded-xl text-sm font-medium border border-dashed transition-colors ${
                      pauseEntries.length >= 5
                        ? 'border-[var(--text-muted)]/10 text-[var(--text-muted)]/30 cursor-not-allowed'
                        : 'border-[var(--text-muted)]/20 text-[var(--text-muted)] hover:border-[var(--text-muted)]/40'
                    }`}
                  >
                    + {t('sleepEntrySheet.addPause')}
                    {pauseEntries.length >= 5 && ` (${t('sleepEntrySheet.maxPausesReached')})`}
                  </button>
                </div>
              )}

              {/* Save error from parent (e.g. network failure) */}
              {saveError && (
                <p className="text-center text-sm text-[var(--danger-color)] px-6 pb-2" role="alert">
                  {saveError}
                </p>
              )}
              {/* Save button - circular tick with spring animation */}
              <div className="flex flex-col items-center pb-8 pt-4">
                <motion.button
                  onClick={handleSave}
                  disabled={!validation.isValid || (isEditing && !hasChanges && !isActiveEntry) || isSaving}
                  whileTap={(validation.isValid && (!isEditing || hasChanges || isActiveEntry) && !isSaving) ? { scale: 0.9 } : undefined}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${
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
