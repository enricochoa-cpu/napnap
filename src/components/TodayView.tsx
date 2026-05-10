import { useMemo, useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  formatTime,
  formatDuration,
  calculateDuration,
  getNetSleepMinutes,
  calculateSuggestedNapTime,
  getRecommendedSchedule,
  calculateDynamicBedtime,
  extractWakeWindowsFromEntries,
  extractNapDurationsFromEntries,
  getLearnedNapDurationMinutes,
  getExpectedNightWakeTime,
  predictDaySchedule,
  type NapIndex,
  type NapPrediction,
} from '../utils/dateUtils';
import type { SleepEntry, BabyProfile } from '../types';
import { parseISO, differenceInMinutes, addMinutes, isToday, isBefore, isAfter } from 'date-fns';
import { SkeletonTimeline, SkeletonHero } from './SkeletonTimelineCard';

/** If first nap has been overdue longer than this, we skip showing "NAP NOW" and anchor on original time to avoid minute-by-minute drift */
const OVERDUE_NAP_PERSISTENCE_MINUTES = 60;

interface TodayViewProps {
  profile: BabyProfile | null;
  entries: SleepEntry[];
  activeSleep: SleepEntry | null;
  lastCompletedSleep: SleepEntry | null;
  /** @deprecated Computed locally from lastCompletedSleep + live now. Prop kept for backward compat but ignored. */
  awakeMinutes?: number | null;
  onEdit?: (entry: SleepEntry) => void;
  loading?: boolean;
  totalEntries?: number;
  /** When true, show "add a baby" CTA in empty state instead of "tap + to add activity" */
  hasNoBaby?: boolean;
  onAddBabyClick?: () => void;
  /** When true (and hasNoBaby), show invite-focused empty state instead of plain add-baby copy. */
  hasPendingInvite?: boolean;
  /** Optional handler for the invite CTA (e.g. navigate to Profile to review invites). */
  onPendingInviteClick?: () => void;
  /** Handler when a predicted nap ghost card is tapped. Passes full prediction data for the sheet. */
  onStartPredictedNap?: (data: {
    displayStart: Date;
    expectedEnd: Date;
    expectedDuration: number;
    isCatnap: boolean;
    napNumber: number;
    napIndex: number;
  }) => void;
  /** Indices of naps that the user has skipped — those ghost cards are hidden. */
  skippedNapIndices?: Set<number>;
  activePauseStart?: Date | null;
}

// Get today's completed naps
function getTodayNaps(entries: SleepEntry[]): SleepEntry[] {
  return entries
    .filter((e) => e.type === 'nap' && e.endTime !== null && isToday(parseISO(e.startTime)))
    .sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime());
}

// Get today's morning wake up entry (night sleep that ended today)
function getMorningWakeUpEntry(entries: SleepEntry[]): SleepEntry | null {
  return entries.find(
    (e) => e.type === 'night' && e.endTime && isToday(parseISO(e.endTime))
  ) || null;
}

// Calculate expected wake-up time from active sleep (nap or night).
// For naps, optional overrideNapDurationMinutes uses learned duration when provided.
function getExpectedWakeTime(
  activeSleep: SleepEntry,
  profile: BabyProfile | null,
  entries: SleepEntry[] = [],
  overrideNapDurationMinutes?: number
): Date | null {
  if (!activeSleep) return null;

  // Night sleep: use predicted wake-up time
  if (activeSleep.type === 'night' && profile?.dateOfBirth) {
    const { predictedWakeTime } = getExpectedNightWakeTime(
      activeSleep.startTime,
      profile.dateOfBirth,
      entries.map((e) => ({ startTime: e.startTime, endTime: e.endTime, type: e.type }))
    );
    return predictedWakeTime;
  }

  // Nap: use override (learned) or age-based default duration
  if (activeSleep.type === 'nap') {
    let avgNapMinutes = 60;
    if (overrideNapDurationMinutes != null) {
      avgNapMinutes = overrideNapDurationMinutes;
    } else if (profile?.dateOfBirth) {
      const schedule = getRecommendedSchedule(profile.dateOfBirth);
      avgNapMinutes = schedule.numberOfNaps >= 3 ? 45 : 90;
    }
    const startTime = parseISO(activeSleep.startTime);
    return addMinutes(startTime, avgNapMinutes);
  }

  return null;
}

// ============================================================================
// ICONS - Consistent Sun/Cloud/Moon design
// ============================================================================

// Sun icon for morning wake up (Gold)
import { SunIcon, CloudIcon, MoonIcon } from './icons/SleepIcons';

// Storm cloud icon — used to indicate completed night-waking pauses on bedtime cards
const StormCloudIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" opacity="0.7" />
    <path d="M13 16l-2 4m3-6l-2 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </svg>
);

export function TodayView({
  profile,
  entries,
  activeSleep,
  lastCompletedSleep,
  awakeMinutes: _awakeMinutesProp,
  onEdit,
  loading = false,
  hasNoBaby = false,
  onAddBabyClick,
  hasPendingInvite = false,
  onPendingInviteClick,
  onStartPredictedNap,
  skippedNapIndices,
  activePauseStart,
}: TodayViewProps) {
  const { t } = useTranslation();
  // Force re-render every minute for live countdowns
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const now = new Date();

  // Live awake-since timer — computed locally so it ticks every 60s with the setTick interval
  const awakeMinutes = (() => {
    if (activeSleep) return 0;
    if (!lastCompletedSleep?.endTime) return null;
    const lastWakeTime = new Date(lastCompletedSleep.endTime);
    return Math.max(0, Math.floor((now.getTime() - lastWakeTime.getTime()) / (1000 * 60)));
  })();

  // Morning wake up entry (night sleep that ended today)
  const morningWakeUpEntry = useMemo(() => getMorningWakeUpEntry(entries), [entries]);
  const morningWakeUp = morningWakeUpEntry?.endTime ? parseISO(morningWakeUpEntry.endTime) : null;

  // Check if there's an active night sleep that started BEFORE today (yesterday's bedtime)
  const hasActiveNightFromYesterday = useMemo(() => {
    return activeSleep &&
      activeSleep.type === 'night' &&
      !isToday(parseISO(activeSleep.startTime));
  }, [activeSleep]);

  // Today's completed naps
  const todayNaps = useMemo(() => getTodayNaps(entries), [entries]);

  // Calculate total daytime sleep for dynamic bedtime
  const totalDaytimeSleepMinutes = useMemo(() => {
    return todayNaps.reduce((total, nap) => {
      return total + getNetSleepMinutes(nap);
    }, 0);
  }, [todayNaps]);

  // Extract historical wake windows for adaptive prediction
  const wakeWindowHistory = useMemo(() => {
    return extractWakeWindowsFromEntries(
      entries.map((e) => ({
        startTime: e.startTime,
        endTime: e.endTime,
        type: e.type,
      })),
      7 // Last 7 days
    );
  }, [entries]);

  // Nap duration by position (first/second/third+) for 70/30 learning, like wake windows
  const napDurationHistory = useMemo(() => {
    return extractNapDurationsFromEntries(
      entries.map((e) => ({
        startTime: e.startTime,
        endTime: e.endTime,
        type: e.type,
      })),
      7
    );
  }, [entries]);

  // Unified day prediction (single source of truth for naps + bedtime)
  // Uses predictDaySchedule: simulateDay for structure + 70/30 blending for timing + dynamic bedtime
  const daySchedule = useMemo(() => {
    if (!morningWakeUp) return null;
    if (!profile?.dateOfBirth) return null;

    // Build completed naps data, INCLUDING active nap if present
    const completedNapsData = todayNaps.map((nap) => ({
      endTime: nap.endTime!,
      durationMinutes: calculateDuration(nap.startTime, nap.endTime),
    }));

    const hasActiveNap = activeSleep && activeSleep.type === 'nap';
    let activeNapExpectedEnd: Date | null = null;
    let activeNapExpectedDuration = 0;

    if (hasActiveNap && profile?.dateOfBirth) {
      const activeNapIndex: NapIndex =
        todayNaps.length === 0 ? 'first' : todayNaps.length === 1 ? 'second' : 'third_plus';
      activeNapExpectedDuration = getLearnedNapDurationMinutes(
        profile.dateOfBirth,
        activeNapIndex,
        napDurationHistory.byIndex[activeNapIndex],
        napDurationHistory.todaysCountByIndex[activeNapIndex],
        false,
        entries.length
      );
      activeNapExpectedEnd = getExpectedWakeTime(activeSleep, profile, entries, activeNapExpectedDuration);

      if (activeNapExpectedEnd) {
        completedNapsData.push({
          endTime: activeNapExpectedEnd.toISOString(),
          durationMinutes: activeNapExpectedDuration,
        });
      }
    }

    // Last completed nap duration (for short nap penalty)
    let lastNapDuration: number | null = null;
    if (hasActiveNap) {
      lastNapDuration = activeNapExpectedDuration;
    } else if (todayNaps.length > 0) {
      const lastNap = todayNaps[todayNaps.length - 1];
      if (lastNap.endTime) lastNapDuration = calculateDuration(lastNap.startTime, lastNap.endTime);
    }

    return predictDaySchedule({
      dateOfBirth: profile.dateOfBirth,
      morningWakeTime: morningWakeUp,
      completedNaps: completedNapsData,
      lastNapDurationMinutes: lastNapDuration,
      historicalWakeWindows: wakeWindowHistory.wakeWindows,
      todaysWakeWindowCount: wakeWindowHistory.todaysCount,
      totalEntriesCount: entries.length,
      napDurationHistory,
    });
  }, [profile?.dateOfBirth, morningWakeUp, todayNaps, activeSleep, profile, entries.length, wakeWindowHistory, napDurationHistory, entries]);

  // Apply overdue logic (TodayView-specific: NAP NOW, skip after 1h)
  const predictedNapsWithMetadata = useMemo(() => {
    if (!daySchedule) return { predictions: [], calibrationInfo: null };

    const hasActiveNap = activeSleep && activeSleep.type === 'nap';
    const activeNapExpectedEnd = hasActiveNap && daySchedule.naps.length >= 0
      ? (() => {
          // Re-derive active nap end for overdue minimum time
          if (!profile?.dateOfBirth) return null;
          const activeNapIndex: NapIndex =
            todayNaps.length === 0 ? 'first' : todayNaps.length === 1 ? 'second' : 'third_plus';
          const dur = getLearnedNapDurationMinutes(
            profile.dateOfBirth, activeNapIndex,
            napDurationHistory.byIndex[activeNapIndex],
            napDurationHistory.todaysCountByIndex[activeNapIndex], false,
            entries.length
          );
          return getExpectedWakeTime(activeSleep!, profile!, entries, dur);
        })()
      : null;

    const predictions: { time: Date; isCatnap: boolean; expectedDuration: number; prediction: NapPrediction; isOverdue?: boolean }[] = [];

    for (const nap of daySchedule.naps) {
      const prediction: NapPrediction = {
        predictedTime: nap.time,
        confidenceScore: nap.confidenceScore,
        isCalibrating: nap.isCalibrating,
        calibrationReason: nap.calibrationReason as NapPrediction['calibrationReason'],
      };

      const minPredictionTime = hasActiveNap && activeNapExpectedEnd ? activeNapExpectedEnd : now;
      const overdueMinutes = differenceInMinutes(now, nap.time);

      if (isAfter(nap.time, minPredictionTime)) {
        // Future prediction — show normally
        predictions.push({ time: nap.time, isCatnap: nap.isCatnap, expectedDuration: nap.expectedDurationMinutes, prediction });
      } else if (!hasActiveNap && predictions.length === 0) {
        // First nap overdue
        if (overdueMinutes <= OVERDUE_NAP_PERSISTENCE_MINUTES) {
          predictions.push({ time: now, isCatnap: nap.isCatnap, expectedDuration: nap.expectedDurationMinutes, prediction, isOverdue: true });
        }
        // else: treat as skipped (no prediction added, but next nap in the loop will show)
      }
      // else: past prediction with future ones already queued — skip
    }

    const calibrationInfo: NapPrediction | null = daySchedule.firstCalibration
      ? {
          predictedTime: predictions[0]?.time ?? null,
          confidenceScore: daySchedule.firstCalibration.confidenceScore,
          isCalibrating: daySchedule.firstCalibration.isCalibrating,
          calibrationReason: daySchedule.firstCalibration.calibrationReason as NapPrediction['calibrationReason'],
        }
      : null;

    return { predictions, calibrationInfo };
  }, [daySchedule, now, activeSleep, profile, todayNaps, entries, napDurationHistory]);

  // Convenience accessor for predictions (backward compatible)
  const predictedNaps = predictedNapsWithMetadata.predictions;

  // Bedtime from unified schedule (with fallbacks for active nap / no-data states)
  const expectedBedtime = useMemo(() => {
    if (!profile?.dateOfBirth) return null;

    // When unified schedule computed bedtime, use it
    if (daySchedule) {
      // If currently napping with no remaining predicted naps, recalculate bedtime
      // from active nap's expected wake time (real-time update)
      if (activeSleep && activeSleep.type === 'nap' && predictedNaps.length === 0) {
        const activeNapIndex: NapIndex =
          todayNaps.length === 0 ? 'first' : todayNaps.length === 1 ? 'second' : 'third_plus';
        const learnedDuration = getLearnedNapDurationMinutes(
          profile.dateOfBirth, activeNapIndex,
          napDurationHistory.byIndex[activeNapIndex],
          napDurationHistory.todaysCountByIndex[activeNapIndex], false,
          entries.length
        );
        const expectedWake = getExpectedWakeTime(activeSleep, profile, entries, learnedDuration);
        if (expectedWake) {
          const elapsedMinutes = calculateDuration(activeSleep.startTime, null);
          const remainingSleep = Math.max(0, learnedDuration - elapsedMinutes);
          return calculateDynamicBedtime(
            profile.dateOfBirth,
            expectedWake.toISOString(),
            totalDaytimeSleepMinutes + remainingSleep
          );
        }
      }
      return daySchedule.bedtime;
    }

    // Default fallback when no morning wake logged
    const schedule = getRecommendedSchedule(profile.dateOfBirth);
    return new Date(
      now.getFullYear(), now.getMonth(), now.getDate(),
      schedule.bedtimeWindow.latest.hour, schedule.bedtimeWindow.latest.minute
    );
  }, [profile?.dateOfBirth, daySchedule, predictedNaps, activeSleep, todayNaps, totalDaytimeSleepMinutes, now, napDurationHistory, entries]);

  // Determine if bedtime is the next event (no more naps predicted)
  const isBedtimeNext = useMemo(() => {
    if (predictedNaps.length > 0 || !expectedBedtime) return false;
    // Bedtime is next if it's still upcoming
    if (isBefore(now, expectedBedtime)) return true;
    // Also bedtime if it's already past but baby completed all expected naps
    // (prevents fallback to "NAP NOW" when bedtime has passed)
    if (profile?.dateOfBirth) {
      const schedule = getRecommendedSchedule(profile.dateOfBirth);
      if (todayNaps.length >= schedule.numberOfNaps) return true;
    }
    return false;
  }, [predictedNaps.length, expectedBedtime, now, profile?.dateOfBirth, todayNaps.length]);

  // Freeze predictions during active nap so ghost cards don't re-render every minute.
  // When the nap ends, predictions recalculate from the actual end time.
  const isCurrentlyNapping = activeSleep?.type === 'nap';
  const frozenNapIdRef = useRef<string | null>(null);
  const frozenPredictionsRef = useRef<typeof predictedNaps>([]);
  const frozenBedtimeRef = useRef<Date | null>(null);

  if (isCurrentlyNapping) {
    if (frozenNapIdRef.current !== activeSleep.id) {
      // Nap just started — snapshot predictions anchored to actual start time
      frozenNapIdRef.current = activeSleep.id;
      frozenPredictionsRef.current = predictedNaps;
      frozenBedtimeRef.current = expectedBedtime;
    }
  } else {
    frozenNapIdRef.current = null;
  }

  const displayPredictions = isCurrentlyNapping ? frozenPredictionsRef.current : predictedNaps;
  const displayBedtime = isCurrentlyNapping ? (frozenBedtimeRef.current ?? expectedBedtime) : expectedBedtime;

  // Countdown to next event (nap or bedtime) - THE FOCAL POINT
  const nextEventCountdown = useMemo(() => {
    if (activeSleep) return null;

    // If bedtime is next, calculate countdown to bedtime
    if (isBedtimeNext && expectedBedtime) {
      const minutesUntilBedtime = differenceInMinutes(expectedBedtime, now);
      if (minutesUntilBedtime < 0) return { type: 'bedtime' as const, isNow: true, minutes: 0 };
      return { type: 'bedtime' as const, isNow: false, minutes: minutesUntilBedtime };
    }

    // Otherwise calculate countdown to next nap
    if (!profile?.dateOfBirth || !lastCompletedSleep?.endTime) return null;

    const lastNapDuration = lastCompletedSleep.type === 'nap'
      ? getNetSleepMinutes(lastCompletedSleep)
      : null;

    const nextNapIndex = todayNaps.length;
    const napIndexType: NapIndex =
      nextNapIndex === 0 ? 'first' :
      nextNapIndex === 1 ? 'second' : 'third_plus';

    const suggestedTime = calculateSuggestedNapTime(
      profile.dateOfBirth,
      lastCompletedSleep.endTime,
      lastNapDuration,
      napIndexType
    );

    const minutesUntilNap = differenceInMinutes(suggestedTime, now);
    if (minutesUntilNap < 0) return { type: 'nap' as const, isNow: true, minutes: 0 };
    return { type: 'nap' as const, isNow: false, minutes: minutesUntilNap };
  }, [profile?.dateOfBirth, lastCompletedSleep, activeSleep, todayNaps.length, now, isBedtimeNext, expectedBedtime]);

  // Expected wake up time (if sleeping); use learned nap duration when active nap
  const expectedWakeUp = useMemo(() => {
    if (!activeSleep) return null;
    if (activeSleep.type === 'nap' && profile?.dateOfBirth) {
      const activeNapIndex: NapIndex =
        todayNaps.length === 0 ? 'first' : todayNaps.length === 1 ? 'second' : 'third_plus';
      const learned = getLearnedNapDurationMinutes(
        profile.dateOfBirth,
        activeNapIndex,
        napDurationHistory.byIndex[activeNapIndex],
        napDurationHistory.todaysCountByIndex[activeNapIndex],
        false,
        entries.length
      );
      return getExpectedWakeTime(activeSleep, profile, entries, learned);
    }
    return getExpectedWakeTime(activeSleep, profile, entries);
  }, [activeSleep, profile, entries, todayNaps.length, napDurationHistory]);

  // Duration of current sleep
  const currentSleepDuration = useMemo(() => {
    if (!activeSleep) return 0;
    const gross = calculateDuration(activeSleep.startTime, null);
    const completedPauseMins = (activeSleep.pauses ?? []).reduce((sum, p) => sum + p.durationMinutes, 0);
    const inFlightMins = activePauseStart
      ? Math.max(0, Math.round((now.getTime() - activePauseStart.getTime()) / 60000))
      : 0;
    return Math.max(0, gross - completedPauseMins - inFlightMins);
  }, [activeSleep, activePauseStart, now]);

  // Check if there's any activity that "touches" today
  // Activity touches today if:
  // - Morning wake up from a night sleep that ended today
  // - Any naps today
  // - Active nap (always today's activity)
  // - Active night sleep that started TODAY (rare case, e.g., logged bedtime at 11pm same day)
  // NOTE: Active night sleep from YESTERDAY does NOT count - that's yesterday's entry
  const hasTodayActivity = useMemo(() => {
    // Morning wake up logged
    if (morningWakeUp !== null) return true;
    // Naps completed today
    if (todayNaps.length > 0) return true;
    // Active nap (always today's activity)
    if (activeSleep && activeSleep.type === 'nap') return true;
    // Active night sleep that started TODAY
    if (activeSleep && activeSleep.type === 'night' && isToday(parseISO(activeSleep.startTime))) return true;

    return false;
  }, [morningWakeUp, todayNaps.length, activeSleep]);

  // Loading state - show skeletons
  if (loading) {
    return (
      <div className="flex flex-col pb-40 px-6 fade-in">
        <div className="pt-4 pb-3 sm:pt-8 sm:pb-6">
          <SkeletonHero />
        </div>

        <div className="mt-2">
          <div className="h-3 w-28 bg-[var(--text-muted)]/15 rounded mb-4" />
          <div className="relative">
            <div className="absolute left-5 top-6 bottom-6 w-px bg-[var(--text-muted)]/20" />
            <SkeletonTimeline />
          </div>
        </div>
      </div>
    );
  }

  // Special state: Active night sleep from yesterday - show predicted wake-up time
  if (hasActiveNightFromYesterday && !hasTodayActivity) {
    return (
      <div className="flex flex-col pb-40 px-6 fade-in">
        <div className="pt-4 pb-3 sm:pt-6 sm:pb-4">
          {/* Hero: Predicted Wake-Up Time */}
          <div
            className="rounded-3xl p-4 sm:p-6 text-center"
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-md)' }}
          >
            <p className="text-[var(--text-muted)] font-display text-xs uppercase tracking-widest mb-2 sm:mb-3">
              {t('today.expectedWake')}
            </p>
            <h1 className="hero-countdown text-[var(--wake-color)] mb-2 sm:mb-3">
              {expectedWakeUp ? formatTime(expectedWakeUp) : '—'}
            </h1>
            <p className="text-[var(--text-secondary)] font-display text-sm">
              {t('today.bedtimeAt', { time: formatTime(activeSleep!.startTime) })}
            </p>
          </div>

          {/* Wake Up action card */}
          <button
            type="button"
            onClick={() => onEdit?.(activeSleep!)}
            className="w-full mt-4 py-3 px-4 flex items-center gap-3 text-left rounded-2xl border border-[var(--wake-color)]/30"
            style={{ background: 'color-mix(in srgb, var(--wake-color) 8%, var(--glass-bg))', boxShadow: 'var(--shadow-sm)' }}
          >
            <div className="w-10 h-10 rounded-full bg-[var(--wake-color)] flex items-center justify-center text-[var(--bg-deep)] flex-shrink-0">
              <SunIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[var(--wake-color)] font-display font-semibold text-base">
                {t('today.wakeUp')}
              </p>
            </div>
            <p className="text-[var(--text-muted)] font-display text-xs">
              {t('today.tapToLog')}
            </p>
            <div className="text-[var(--text-muted)]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Empty state - no activity today
  if (!hasTodayActivity) {
    const showInviteEmpty = hasNoBaby && hasPendingInvite;
    const primaryCtaHandler =
      hasNoBaby && showInviteEmpty
        ? onPendingInviteClick
        : hasNoBaby
        ? onAddBabyClick
        : undefined;
    const primaryCtaLabel = showInviteEmpty ? t('today.reviewInvite') : t('today.addABaby');

    return (
      <div className="flex flex-col pb-40 px-6 fade-in">
        <div className="pt-10 pb-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--bg-card)] flex items-center justify-center">
              <MoonIcon className="w-8 h-8 text-[var(--text-muted)]" />
            </div>
            <h1 className="text-xl font-display font-bold text-[var(--text-primary)] mb-2">
              {hasNoBaby
                ? showInviteEmpty
                  ? t('today.youHaveBabyInvite')
                  : t('today.addABabySubtitle')
                : t('today.goodMorning')}
            </h1>
            <p className="text-[var(--text-secondary)] font-display text-sm max-w-xs mx-auto leading-relaxed mb-6">
              {hasNoBaby ? (
                showInviteEmpty ? (
                  t('today.inviteEmptyBody')
                ) : (
                  t('today.addBabyEmptyBody')
                )
              ) : (
                t('today.emptyStateTapButton')
              )}
            </p>
            {hasNoBaby && primaryCtaHandler && (
              <button
                onClick={primaryCtaHandler}
                className="px-6 py-3 rounded-2xl font-display font-semibold text-[var(--bg-deep)] transition-transform active:scale-[0.98]"
                style={{ background: 'var(--nap-color)' }}
              >
                {primaryCtaLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-40 px-6 fade-in">
      {/* ================================================================== */}
      {/* HERO SECTION - Compact on small viewports so timeline fits ~5 items */}
      {/* ================================================================== */}
      <div className="pt-4 pb-3 sm:pt-6 sm:pb-4">
        <div className="rounded-2xl p-4 sm:p-6" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-md)' }}>
          {activeSleep ? (
            // SLEEPING STATE
            <div className="text-center">
              <p className="text-[var(--text-muted)] font-display text-xs uppercase tracking-widest mb-2 sm:mb-3">
                {activeSleep.type === 'nap' ? t('today.napping') : t('today.nightSleep')}
              </p>
              <h1 className="hero-countdown text-[var(--nap-color)] mb-2 sm:mb-3">
                {formatDuration(currentSleepDuration)}
              </h1>
              {activePauseStart && (
                <p className="text-sm font-display italic mb-2" style={{ color: 'var(--wake-color)' }}>
                  {t('sleepEntrySheet.pausedStatus')}
                </p>
              )}
              {expectedWakeUp && (
                <p className="text-[var(--text-secondary)] font-display text-sm">
                  {t('today.expectedWakeAt')} <span className={`font-semibold ${activeSleep.type === 'night' ? 'text-[var(--wake-color)]' : 'text-[var(--text-primary)]'}`}>{formatTime(expectedWakeUp)}</span>
                </p>
              )}
            </div>
          ) : (
            // AWAKE STATE - Next event (nap or bedtime) is the focal point
            <div className="text-center">
              {nextEventCountdown ? (
                <>
                  {/* FOCAL POINT: Next Event Countdown */}
                  {nextEventCountdown.isNow ? (
                    <div>
                      <p className="text-[var(--text-muted)] font-display text-xs uppercase tracking-widest mb-2 sm:mb-3">
                        {t('today.itsTime')}
                      </p>
                      <h1 className={`hero-countdown animate-pulse-soft ${
                        nextEventCountdown.type === 'bedtime' ? 'text-[var(--night-color)]' : 'text-[var(--nap-color)]'
                      }`}>
                        {nextEventCountdown.type === 'bedtime' ? t('today.bedtimeNow') : t('today.napNow')}
                      </h1>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[var(--text-muted)] font-display text-xs uppercase tracking-widest mb-2 sm:mb-3">
                        {nextEventCountdown.type === 'bedtime' ? t('today.bedtimeIn') : t('today.nextNapIn')}
                      </p>
                      <h1 className={`hero-countdown mb-2 sm:mb-3 ${
                        nextEventCountdown.type === 'bedtime' ? 'text-[var(--night-color)]' : 'text-[var(--nap-color)]'
                      }`}>
                        {formatDuration(nextEventCountdown.minutes)}
                      </h1>
                    </div>
                  )}
                  {/* SECONDARY: Awake time (smaller, muted) */}
                  <p className="text-[var(--text-muted)] font-display text-sm mt-1">
                    {t('today.awakeFor')}{' '}
                    <span className="text-[var(--wake-color)] font-medium">
                      {awakeMinutes !== null ? formatDuration(awakeMinutes) : '—'}
                    </span>
                  </p>
                </>
              ) : (
                // Fallback when no countdown available
                <div>
                  <p className="text-[var(--text-muted)] font-display text-xs uppercase tracking-widest mb-2 sm:mb-3">
                    {t('today.awake')}
                  </p>
                  <h1 className="hero-countdown text-[var(--wake-color)]">
                    {awakeMinutes !== null ? formatDuration(awakeMinutes) : '—'}
                  </h1>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ================================================================== */}
      {/* TIMELINE RIVER - Visual flow through the day                      */}
      {/* ================================================================== */}
      <div className="mt-3 sm:mt-4">
        <h2 className="text-[var(--text-muted)] font-display text-xs uppercase tracking-widest mb-3 sm:mb-4 px-1">
          {t('today.yourDay')}
        </h2>

        {/* Timeline with vertical connector - NEWEST FIRST (last to old) */}
        <div className="relative">
          {/* Vertical timeline river line */}
          <div className="absolute left-5 top-6 bottom-6 w-px bg-[var(--text-muted)]/20" />

          <motion.div
            key={`timeline-${todayNaps.length}-${activeSleep?.id ?? 'x'}-${displayPredictions.length}`}
            className="space-y-3"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.06 } },
            }}
          >
            {/* Night Sleep in Progress - Glassmorphism */}
            {activeSleep && activeSleep.type === 'night' && (
              <motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } } }}>
                <button
                  type="button"
                  onClick={() => onEdit?.(activeSleep)}
                  className="relative py-3 px-4 flex items-center gap-3 w-full text-left rounded-2xl bg-[var(--night-color)]/90 backdrop-blur-xl border border-[var(--glass-border)] shadow-[0_8px_30px_rgb(0,0,0,0.06)] animate-glow-night"
                >
                  <div className="w-10 h-10 rounded-full bg-[var(--text-on-accent)]/20 flex items-center justify-center text-[var(--text-on-accent)] flex-shrink-0 animate-pulse-soft z-10">
                    <MoonIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[var(--text-on-accent)]/70 font-display text-xs uppercase tracking-wider">
                      {t('today.nightSleep')}
                    </p>
                    <p className="text-[var(--text-on-accent)] font-display font-semibold text-base">
                      {formatTime(activeSleep.startTime)} — ...
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-0.5">
                    <p className="text-[var(--text-on-accent)]/80 font-display text-sm font-medium">
                      {formatDuration(currentSleepDuration)}
                    </p>
                    {(activeSleep.pauses?.length ?? 0) > 0 && (
                      <span
                        className="inline-flex items-center gap-1 text-xs text-[var(--text-on-accent)]/70"
                        aria-label={t('sleepEntrySheet.nightWaking')}
                      >
                        <StormCloudIcon />
                        {activeSleep.pauses!.length}
                      </span>
                    )}
                  </div>
                </button>
              </motion.div>
            )}

            {/* Expected Bedtime - Ghost Card */}
            {displayBedtime && isBefore(now, displayBedtime) && !(activeSleep && activeSleep.type === 'night') && (
              <motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } } }}>
                <div className="relative py-3 px-4 flex items-center gap-3 rounded-2xl border border-[var(--night-color)]/30" style={{ background: 'color-mix(in srgb, var(--night-color) 8%, var(--bg-card))', boxShadow: 'var(--shadow-sm)' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-dashed border-[var(--night-color)]/40 text-[var(--night-color)]/70 z-10">
                    <MoonIcon className="w-5 h-5" />
                  </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[var(--text-muted)] font-display text-xs uppercase tracking-wider">
                        {t('today.bedtime')}
                      </p>
                    <p className="text-[var(--text-secondary)] font-display font-semibold text-base">
                      {formatTime(displayBedtime)}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Predicted Naps - Ghost Cards (tappable → opens PredictedNapSheet) */}
            {[...displayPredictions].reverse()
              .map((napInfo) => {
              const originalIndex = displayPredictions.indexOf(napInfo);
              const isSkipped = skippedNapIndices?.has(originalIndex) ?? false;
              // When overdue, show original suggested time in the card so user sees "expected nap"; keep anchor math using napInfo.time
              const displayStart = napInfo.isOverdue && napInfo.prediction.predictedTime
                ? napInfo.prediction.predictedTime
                : napInfo.time;
              const expectedEnd = addMinutes(displayStart, napInfo.expectedDuration);
              // Count non-skipped naps before this one to calculate accurate napNumber
              const skippedBefore = skippedNapIndices
                ? [...skippedNapIndices].filter(i => i < originalIndex).length
                : 0;
              const napNumber = todayNaps.length + (activeSleep?.type === 'nap' ? 1 : 0) + (originalIndex + 1) - skippedBefore;
              return (
                <motion.div
                  key={`predicted-${originalIndex}`}
                  variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } } }}
                >
                  <button
                    type="button"
                    onClick={() => onStartPredictedNap?.({
                      displayStart,
                      expectedEnd,
                      expectedDuration: napInfo.expectedDuration,
                      isCatnap: napInfo.isCatnap,
                      napNumber,
                      napIndex: originalIndex,
                    })}
                    aria-label={`${napInfo.isCatnap ? t('today.shortNap') : t('today.napOrdinal', { n: napNumber })} ${formatTime(displayStart)} — ${formatTime(expectedEnd)}`}
                    className={`relative py-3 px-4 flex items-center gap-3 rounded-2xl border w-full text-left cursor-pointer transition-all active:scale-[0.98] active:brightness-[1.08] ${
                      isSkipped
                        ? 'border-[var(--text-muted)]/20 opacity-50'
                        : 'border-[var(--nap-color)]/30'
                    }`}
                    style={{
                      background: isSkipped
                        ? 'color-mix(in srgb, var(--text-muted) 5%, var(--bg-card))'
                        : 'color-mix(in srgb, var(--nap-color) 8%, var(--bg-card))',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-dashed z-10 ${
                      isSkipped
                        ? 'border-[var(--text-muted)]/30 text-[var(--text-muted)]/50'
                        : 'border-[var(--nap-color)]/40 text-[var(--nap-color)]/70'
                    }`}>
                      <CloudIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[var(--text-muted)] font-display text-xs uppercase tracking-wider">
                        {isSkipped
                          ? t('predictedNap.skippedNap')
                          : napInfo.isCatnap ? t('today.shortNap') : t('today.napOrdinal', { n: napNumber })}
                      </p>
                      <p className="text-[var(--text-secondary)] font-display font-semibold text-base">
                        {isSkipped
                          ? formatTime(displayStart)
                          : `${formatTime(displayStart)} — ${formatTime(expectedEnd)}`}
                      </p>
                    </div>
                  </button>
                </motion.div>
              );
            })}

            {/* Active Nap - Glassmorphism Solid */}
            {activeSleep && activeSleep.type === 'nap' && (
              <motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } } }}>
                <button
                  type="button"
                  onClick={() => onEdit?.(activeSleep)}
                  className="relative py-3 px-4 flex items-center gap-3 animate-glow w-full text-left rounded-2xl bg-[var(--nap-color)]/90 backdrop-blur-xl border border-[var(--glass-border)] shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
                >
                  <div className="w-10 h-10 rounded-full bg-[var(--text-on-accent)]/20 flex items-center justify-center text-[var(--text-on-accent)] flex-shrink-0 animate-pulse-soft z-10">
                    <CloudIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[var(--text-on-accent)]/70 font-display text-xs uppercase tracking-wider">
                      {t('today.nappingNow')}
                    </p>
                    <p className="text-[var(--text-on-accent)] font-display font-semibold text-base">
                      {formatTime(activeSleep.startTime)} — ...
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[var(--text-on-accent)]/80 font-display text-sm font-medium">
                      {formatDuration(currentSleepDuration)}
                    </p>
                    {activePauseStart && (
                      <p className="text-[var(--wake-color)] text-xs font-display italic">
                        {t('sleepEntrySheet.pausedStatus')}
                      </p>
                    )}
                  </div>
                </button>
              </motion.div>
            )}

            {/* Completed Naps - Glassmorphism Solid */}
            {[...todayNaps].reverse().map((nap, index) => (
              <motion.div
                key={nap.id}
                variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } } }}
              >
                <button
                  type="button"
                  onClick={() => onEdit?.(nap)}
                  className="relative py-3 px-4 flex items-center gap-3 w-full text-left rounded-2xl bg-[var(--nap-color)]/80 backdrop-blur-xl border border-[var(--glass-border)] shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
                >
                  <div className="w-10 h-10 rounded-full bg-[var(--text-on-accent)]/20 flex items-center justify-center text-[var(--text-on-accent)] flex-shrink-0 z-10">
                    <CloudIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[var(--text-on-accent)]/70 font-display text-xs uppercase tracking-wider">
                      {t('today.napOrdinal', { n: todayNaps.length - index })}
                    </p>
                    <p className="text-[var(--text-on-accent)] font-display font-semibold text-base">
                      {formatTime(nap.startTime)} — {formatTime(nap.endTime!)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[var(--text-on-accent)]/80 font-display text-sm font-medium">
                      {formatDuration(getNetSleepMinutes(nap))}
                    </p>
                  </div>
                </button>
              </motion.div>
            ))}

            {/* Morning Wake Up (if night started yesterday) OR completed bedtime tile (if started AND ended today) */}
            {morningWakeUp && morningWakeUpEntry && (() => {
              const isSameDayBedtime = !isToday(parseISO(morningWakeUpEntry.endTime!)) ? false : isToday(parseISO(morningWakeUpEntry.startTime));
              const accentColor = isSameDayBedtime ? 'var(--night-color)' : 'var(--wake-color)';
              const label = isSameDayBedtime ? t('today.bedtimeCompleted') : t('today.morningWakeUp');
              const timeLabel = isSameDayBedtime
                ? `${formatTime(parseISO(morningWakeUpEntry.startTime))} – ${formatTime(morningWakeUp)}`
                : formatTime(morningWakeUp);
              return (
                <motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } } }}>
                  <button
                    type="button"
                    onClick={() => onEdit?.(morningWakeUpEntry)}
                    className="relative py-3 px-4 flex items-center gap-3 w-full text-left rounded-2xl backdrop-blur-xl border"
                    style={{
                      borderColor: `color-mix(in srgb, ${accentColor} 30%, transparent)`,
                      background: `color-mix(in srgb, ${accentColor} 8%, var(--bg-card))`,
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                      style={{
                        background: accentColor,
                        color: isSameDayBedtime ? 'var(--text-on-accent)' : 'var(--bg-deep)',
                      }}
                    >
                      {isSameDayBedtime ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-xs uppercase tracking-wider" style={{ color: accentColor }}>
                        {label}
                      </p>
                      <p className="text-[var(--text-primary)] font-display font-semibold text-base">
                        {timeLabel}
                      </p>
                    </div>
                    {(morningWakeUpEntry.pauses?.length ?? 0) > 0 && (
                      <span
                        className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] shrink-0"
                        style={{ color: 'var(--wake-color)' }}
                        aria-label={t('sleepEntrySheet.nightWaking')}
                      >
                        <StormCloudIcon />
                        {morningWakeUpEntry.pauses!.length}
                      </span>
                    )}
                  </button>
                </motion.div>
              );
            })()}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
