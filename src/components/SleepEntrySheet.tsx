import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { ConfirmationModal } from './ConfirmationModal';
import { useFocusTrap } from '../hooks/useFocusTrap';
import type { SleepEntry } from '../types';

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
  /** Shown when save failed (e.g. network error); sheet stays open */
  saveError?: string | null;
  /** When true (e.g. "Wake up" with no active night): pre-fill end time with now and require it */
  defaultEndTimeToNow?: boolean;
}

// Icons
const CloudIcon = () => (
  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
  </svg>
);

const MoonIcon = () => (
  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

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

const CloseIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

// Helpers
const extractTime = (datetime: string): string => {
  if (!datetime) return '';
  const timePart = datetime.split('T')[1];
  return timePart ? timePart.substring(0, 5) : '';
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

const getNextDay = (date: string): string => {
  const d = new Date(date);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

const getPreviousDay = (date: string): string => {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

const isTimeBefore = (time1: string, time2: string): boolean => {
  return time1 < time2;
};

// Calculate duration between two times
const calculateDuration = (startTime: string, endTime: string | null): string => {
  if (!startTime || !endTime) return '';

  // Parse times
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  let startMinutes = startH * 60 + startM;
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

// Label under end time: today = "Xh Y min ago", yesterday = "Yesterday", older = "Feb 10"
const getRelativeDateLabel = (dateStr: string, endTime: string | null, now: Date, isActiveEntry: boolean): string => {
  if (!endTime) return isActiveEntry ? 'Sleeping...' : '—';
  if (isToday(dateStr)) return getRelativeAgo(endTime, dateStr, now) || '';
  if (isYesterday(dateStr)) return 'Yesterday';
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Compute duration in minutes (for validation)
const computeDurationMinutes = (start: string, end: string): number => {
  if (!start || !end) return 0;
  const [sH, sM] = start.split(':').map(Number);
  const [eH, eM] = end.split(':').map(Number);
  let startMins = sH * 60 + sM;
  let endMins = eH * 60 + eM;
  if (endMins <= startMins) endMins += 24 * 60; // cross-midnight
  return endMins - startMins;
};

// Compute relative "ago" label for end time
const getRelativeAgo = (timeStr: string, dateStr: string, now: Date): string => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const target = new Date(dateStr + 'T00:00:00');
  target.setHours(h, m, 0, 0);
  // If end time is before start (cross-midnight), it's next day
  const diffMs = now.getTime() - target.getTime();
  if (diffMs < 0) return '';
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  const remainingMins = diffMins % 60;
  if (diffHours < 24) {
    if (remainingMins === 0) return `${diffHours}h ago`;
    return `${diffHours}h ${remainingMins} min ago`;
  }
  return `${Math.floor(diffHours / 24)}d ago`;
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
  saveError = null,
  defaultEndTimeToNow = false,
}: SleepEntrySheetProps) {
  const isEditing = !!entry;
  const sleepType: SleepType = entry?.type || initialType;

  // Initial values for comparison
  const initialStartTime = entry ? extractTime(entry.startTime) : getDefaultTime(selectedDate, sleepType);
  const initialEndTime = entry?.endTime ? extractTime(entry.endTime) : '';

  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);
  const [now, setNow] = useState(() => new Date());
  const [isSaving, setIsSaving] = useState(false);

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
        setEndTime(entry.endTime ? extractTime(entry.endTime) : '');
      } else {
        setStartTime(getDefaultTime(selectedDate, sleepType));
        setEndTime(defaultEndTimeToNow ? getCurrentTime() : '');
      }
    }
  }, [entry, isOpen, selectedDate, sleepType, defaultEndTimeToNow]);

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

  // Duration under start time: "29min long"; relative date under end time: "2h ago" | "Yesterday" | "Feb 10"
  const durationLabel = useMemo(() => formatDurationLong(startTime, endTime), [startTime, endTime]);
  const relativeDateLabel = useMemo(
    () => getRelativeDateLabel(selectedDate, endTime, now, isActiveEntry),
    [selectedDate, endTime, now, isActiveEntry]
  );

  // Icon state: Play (new, no end), Stop (active + no changes = end sleep), Check (save edits)
  const saveIcon = useMemo(() => {
    if (!isEditing && !endTime) return 'play';
    if (isActiveEntry && !endTime && !hasChanges) return 'stop';
    return 'check';
  }, [isEditing, endTime, isActiveEntry, hasChanges]);

  // Temporal validation
  const validation = useMemo((): { isValid: boolean; warning: string | null; error: string | null } => {
    // "Log wake up" flow requires end time (bedtime + wake-up)
    if (defaultEndTimeToNow && !endTime) {
      return { isValid: false, warning: null, error: 'Please set wake-up time' };
    }
    // No end time = no validation needed (ongoing entry), unless we require it above
    if (!endTime) return { isValid: true, warning: null, error: null };

    const mins = computeDurationMinutes(startTime, endTime);
    const crossesMidnight = isTimeBefore(endTime, startTime);

    // Zero duration
    if (mins === 0 || mins === 24 * 60) {
      return { isValid: false, warning: null, error: 'Start and end times are the same' };
    }

    if (sleepType === 'nap') {
      // Nap > 5h → block
      if (mins > 5 * 60) return { isValid: false, warning: null, error: 'Nap duration exceeds 5 hours' };
      // Nap > 4h → warn
      if (mins > 4 * 60) return { isValid: true, warning: 'Unusually long nap', error: null };
      // Cross-midnight nap → warn but allow
      if (crossesMidnight) return { isValid: true, warning: 'This nap crosses midnight', error: null };
    } else {
      // Night > 14h → block
      if (mins > 14 * 60) return { isValid: false, warning: null, error: 'Night sleep exceeds 14 hours' };
      // Night > 13h → warn
      if (mins > 13 * 60) return { isValid: true, warning: 'Unusually long night sleep', error: null };
    }

    return { isValid: true, warning: null, error: null };
  }, [startTime, endTime, sleepType, defaultEndTimeToNow]);

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
          endDateTime = combineDateTime(getNextDay(selectedDate), resolvedEndTime);
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
      const bedtimeDate = isPostMidnightBedtime ? getPreviousDay(selectedDate) : selectedDate;
      let endDateTime: string | null = null;
      if (resolvedEndTime) {
        if (isTimeBefore(resolvedEndTime, startTime)) {
          endDateTime = combineDateTime(getNextDay(bedtimeDate), resolvedEndTime);
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

  const themeColor = sleepType === 'nap' ? 'var(--nap-color)' : 'var(--night-color)';
  const themeBg = sleepType === 'nap' ? 'var(--nap-color)' : 'var(--night-color)';
  const typeLabel = sleepType === 'nap' ? 'Nap' : 'Night Sleep';

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
            aria-label={isEditing ? 'Edit sleep entry' : `Log ${typeLabel.toLowerCase()}`}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
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
                    aria-label="Delete"
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
                  aria-label="Close"
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
                  {sleepType === 'nap' ? <CloudIcon /> : <MoonIcon />}
                </motion.div>
                <span
                  className="font-display font-semibold text-lg"
                  style={{ color: themeColor }}
                >
                  {typeLabel}
                </span>
              </div>

              {/* Time inputs - large, horizontal */}
              <div className="px-6 pb-4">
                <div className="flex items-center justify-center gap-4">
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    aria-label="Start time"
                    className="text-center font-display font-bold text-[var(--text-primary)] bg-transparent border-none outline-none appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-datetime-edit-fields-wrapper]:p-0"
                    style={{ fontSize: '2.75rem', lineHeight: 1.2, width: '7ch' }}
                  />
                  <span className="text-2xl text-[var(--text-muted)] font-light" aria-hidden="true">–</span>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="--:--"
                    aria-label="End time"
                    className="text-center font-display font-bold bg-transparent border-none outline-none appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-datetime-edit-fields-wrapper]:p-0"
                    style={{ fontSize: '2.75rem', lineHeight: 1.2, width: '7ch', color: endTime ? 'var(--text-primary)' : 'var(--text-muted)' }}
                  />
                </div>

                {/* Duration below start time, relative date below end time; nowrap so they stay on one line */}
                <div className="flex justify-center items-baseline gap-4 mt-5">
                  <p className="min-w-[7ch] text-center text-sm tracking-wide text-[var(--text-muted)] whitespace-nowrap">
                    {durationLabel || '—'}
                  </p>
                  <p className="text-center text-sm text-[var(--text-muted)] italic shrink-0" aria-hidden="true">
                    –
                  </p>
                  <p className={`min-w-[7ch] text-center text-sm tracking-wide text-[var(--text-muted)] whitespace-nowrap ${!endTime && isActiveEntry ? 'italic' : ''}`}>
                    {relativeDateLabel}
                  </p>
                </div>

                {/* Validation messages */}
                {validation.error && (
                  <p className="text-xs text-center mt-3" style={{ color: 'var(--danger-color)' }}>
                    {validation.error}
                  </p>
                )}
                {validation.warning && !validation.error && (
                  <p className="text-xs text-center mt-3" style={{ color: 'var(--wake-color)' }}>
                    {validation.warning}
                  </p>
                )}

                {/* Hint for crossing midnight (suppress when validation error shown) */}
                {!validation.error && !validation.warning && endTime && isTimeBefore(endTime, startTime) && (
                  <p className="text-xs text-[var(--text-muted)] text-center mt-3">
                    {sleepType === 'nap' ? 'Ends next day' : 'Wake up is next day'}
                  </p>
                )}
              </div>

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
                  aria-label={isSaving ? 'Saving…' : 'Save'}
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
      title="Delete entry?"
      description="This sleep entry will be permanently removed."
    />
    </>
  );
}
