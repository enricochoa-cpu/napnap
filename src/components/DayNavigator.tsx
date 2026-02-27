import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
  format,
  parseISO,
  startOfWeek,
  addDays,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  getDay,
  isSameDay,
  isToday as isDateToday,
} from 'date-fns';
import { formatDate } from '../utils/dateUtils';
import { getDateFnsLocale } from '../utils/dateFnsLocale';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface DayNavigatorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  babyAge: string;
  datesWithEntries: Set<string>;
}

// ── Icons ──────────────────────────────────────────────

const ChevronDown = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ChevronLeft = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRight = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 6 15 12 9 18" />
  </svg>
);

// ── Week Strip ─────────────────────────────────────────

function WeekStrip({
  selectedDate,
  onDateChange,
  datesWithEntries,
}: {
  selectedDate: string;
  onDateChange: (date: string) => void;
  datesWithEntries: Set<string>;
}) {
  const selectedParsed = parseISO(selectedDate);

  // Week starts Monday
  const weekStart = startOfWeek(selectedParsed, { weekStartsOn: 1 });
  const [weekOffset, setWeekOffset] = useState(0);

  // Reset offset when selectedDate moves to a different week externally
  const currentWeekStart = addDays(weekStart, weekOffset * 7);
  const days = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const handleSwipeEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    if (info.offset.x > 60 || info.velocity.x > 300) {
      // Swipe right → previous week
      setWeekOffset((prev) => prev - 1);
    } else if (info.offset.x < -60 || info.velocity.x < -300) {
      // Swipe left → next week
      setWeekOffset((prev) => prev + 1);
    }
  };

  const handleDayTap = (day: Date) => {
    onDateChange(formatDate(day));
    setWeekOffset(0);
  };

  return (
    <div className="relative">
      {/* Edge fades hint that more weeks exist (swipe left/right); touch-none suppresses native scroll feedback */}
      <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[var(--bg-deep)] to-transparent pointer-events-none z-10" aria-hidden="true" />
      <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[var(--bg-deep)] to-transparent pointer-events-none z-10" aria-hidden="true" />
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.3}
        onDragEnd={handleSwipeEnd}
        className="touch-none relative"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentWeekStart.toISOString()}
            initial={{ opacity: 0, x: weekOffset > 0 ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: weekOffset > 0 ? -40 : 40 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="grid grid-cols-7 gap-1"
          >
          {days.map((day) => {
            const dayStr = formatDate(day);
            const isSelected = isSameDay(day, selectedParsed);
            const isToday = isDateToday(day);
            const hasEntry = datesWithEntries.has(dayStr);

            return (
              <button
                key={dayStr}
                onClick={() => handleDayTap(day)}
                aria-label={format(day, 'EEEE, MMMM d')}
                className="flex flex-col items-center py-1.5 rounded-2xl transition-all min-h-[56px] min-w-[44px]"
              >
                {/* Day letter */}
                <span className={`text-xs font-medium mb-1 ${
                  isSelected ? 'text-[var(--nap-color)]' : 'text-[var(--text-muted)]'
                }`}>
                  {format(day, 'EEEEE')}
                </span>

                {/* Day number circle */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  isSelected
                    ? 'bg-[var(--nap-color)] text-[var(--text-on-accent)]'
                    : isToday
                    ? 'ring-1 ring-[var(--text-muted)] text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)]'
                }`}>
                  {format(day, 'd')}
                </div>

                {/* Entry dot */}
                <div className="h-1.5 mt-1 flex items-center justify-center">
                  {hasEntry && !isSelected && (
                    <div className="w-1 h-1 rounded-full bg-[var(--text-primary)]" />
                  )}
                </div>
              </button>
            );
          })}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ── Calendar Modal ─────────────────────────────────────

function CalendarModal({
  isOpen,
  onClose,
  selectedDate,
  onDateChange,
  datesWithEntries,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  datesWithEntries: Set<string>;
}) {
  const selectedParsed = parseISO(selectedDate);
  const [calendarMonth, setCalendarMonth] = useState(() => startOfMonth(selectedParsed));

  // Reset calendarMonth when opening
  const handleOpen = useCallback(() => {
    setCalendarMonth(startOfMonth(parseISO(selectedDate)));
  }, [selectedDate]);

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(calendarMonth);
    const monthEnd = endOfMonth(calendarMonth);

    // getDay returns 0 for Sunday. We need Monday-start offset.
    const startDayOfWeek = getDay(monthStart); // 0=Sun, 1=Mon, ...
    const offset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // Mon=0, Tue=1, ..., Sun=6

    const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];

    // Fill leading days from previous month
    for (let i = offset - 1; i >= 0; i--) {
      days.push({ date: addDays(monthStart, -i - 1), isCurrentMonth: false });
    }

    // Fill current month
    let d = monthStart;
    while (d <= monthEnd) {
      days.push({ date: d, isCurrentMonth: true });
      d = addDays(d, 1);
    }

    // Fill trailing days to complete last row
    let trailIdx = 1;
    while (days.length % 7 !== 0) {
      days.push({ date: addDays(monthEnd, trailIdx++), isCurrentMonth: false });
    }

    return days;
  }, [calendarMonth]);

  const handleSelectDay = (day: Date) => {
    onDateChange(formatDate(day));
    onClose();
  };

  const handleBackToToday = () => {
    onDateChange(formatDate(new Date()));
    onClose();
  };

  const dialogRef = useFocusTrap(isOpen, onClose);
  const { t } = useTranslation();
  const locale = getDateFnsLocale();

  const y = useMotionValue(0);
  const backdropOpacity = useTransform(y, [0, 300], [1, 0]);

  const handleDragEnd = (_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
    if (info.offset.y > 150 || info.velocity.y > 500) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
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

          {/* Bottom Sheet */}
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={t('dayNavigator.calendar')}
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
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
                <div className="w-10 h-1 bg-[var(--text-muted)]/30 rounded-full" />
              </div>

              {/* Header: Month nav + close */}
              <div className="flex items-center justify-between px-6 pb-4">
                <button
                  onClick={() => setCalendarMonth(prev => subMonths(prev, 1))}
                  className="w-11 h-11 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)] transition-all"
                  aria-label={t('dayNavigator.prevMonth')}
                >
                  <ChevronLeft />
                </button>
                <span className="font-display font-semibold text-[var(--text-primary)] text-lg capitalize">
                  {format(calendarMonth, 'MMMM yyyy', { locale })}
                </span>
                <button
                  onClick={() => setCalendarMonth(prev => addMonths(prev, 1))}
                  className="w-11 h-11 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)] transition-all"
                  aria-label={t('dayNavigator.nextMonth')}
                >
                  <ChevronRight />
                </button>
              </div>

              {/* Day-of-week headers */}
              <div className="grid grid-cols-7 px-4 mb-2">
                {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((key) => (
                  <div key={key} className="text-center text-xs font-medium text-[var(--text-muted)]">
                    {t(`dayNavigator.weekdaysShort.${key}`)}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 px-4 gap-y-1">
                {calendarDays.map(({ date, isCurrentMonth }, i) => {
                  const dayStr = formatDate(date);
                  const isSelected = isSameDay(date, selectedParsed);
                  const isToday = isDateToday(date);
                  const hasEntry = datesWithEntries.has(dayStr);

                  return (
                    <button
                      key={i}
                      onClick={() => handleSelectDay(date)}
                      aria-label={t('dayNavigator.ariaDay', { date: format(date, 'EEEE, MMMM d, yyyy', { locale })})}
                      className={`flex flex-col items-center justify-center py-1 rounded-xl min-h-[44px] transition-all ${
                        !isCurrentMonth ? 'opacity-20' : ''
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-[var(--nap-color)] text-[var(--text-on-accent)] font-semibold'
                          : isToday
                          ? 'ring-1 ring-[var(--text-muted)] text-[var(--text-primary)]'
                          : 'text-[var(--text-secondary)]'
                      }`}>
                        {format(date, 'd')}
                      </div>
                      {/* Entry dot */}
                      <div className="h-1.5 flex items-center justify-center">
                        {hasEntry && !isSelected && (
                          <div className="w-1 h-1 rounded-full bg-[var(--text-primary)]" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Footer buttons — extra bottom padding to clear nav bar */}
              <div className="flex flex-col items-center gap-3 px-6 pt-4 pb-28">
                <button
                  onClick={handleBackToToday}
                  className="w-full py-3 rounded-2xl font-display font-semibold text-sm bg-[var(--nap-color)] text-[var(--text-on-accent)] active:scale-[0.97] transition-transform"
                >
                  {t('dayNavigator.backToToday')}
                </button>
                <button
                  onClick={onClose}
                  className="py-2 font-display font-medium text-sm text-[var(--text-muted)]"
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Main Component ─────────────────────────────────────

export function DayNavigator({ selectedDate, onDateChange, babyAge, datesWithEntries }: DayNavigatorProps) {
  const { t } = useTranslation();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const selectedParsed = parseISO(selectedDate);
  const isToday = isDateToday(selectedParsed);

  const locale = getDateFnsLocale();
  const dateLabel = isToday ? t('dayNavigator.today') : format(selectedParsed, 'MMMM d', { locale });

  return (
    <>
      <div className="flex flex-col items-center gap-3">
        {/* Tappable date header — opens calendar */}
        <button
          onClick={() => setIsCalendarOpen(true)}
          aria-label={t('dayNavigator.openCalendar')}
          className="flex items-center gap-1.5 active:opacity-70 transition-opacity"
        >
          <span className="font-display font-semibold text-lg text-[var(--text-primary)]">
            {dateLabel}
          </span>
          <span className="text-[var(--text-muted)]">
            <ChevronDown />
          </span>
        </button>

        {/* Baby age */}
        {babyAge && (
          <span className="text-xs text-[var(--text-muted)] -mt-1">
            {babyAge}
          </span>
        )}

        {/* Week strip */}
        <WeekStrip
          selectedDate={selectedDate}
          onDateChange={onDateChange}
          datesWithEntries={datesWithEntries}
        />
      </div>

      {/* Calendar Modal */}
      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        selectedDate={selectedDate}
        onDateChange={onDateChange}
        datesWithEntries={datesWithEntries}
      />
    </>
  );
}
