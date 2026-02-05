import { useMemo, useEffect, useState } from 'react';
import {
  formatTime,
  formatDuration,
  calculateDuration,
  calculateSuggestedNapTime,
  calculateSuggestedNapTimeWithMetadata,
  calculateAllNapWindows,
  getRecommendedSchedule,
  calculateDynamicBedtime,
  extractWakeWindowsFromEntries,
  getAlgorithmStatusTier,
  MIN_CALIBRATION_ENTRIES,
  type NapIndex,
  type NapPrediction,
} from '../utils/dateUtils';
import type { SleepEntry, BabyProfile } from '../types';
import { parseISO, differenceInMinutes, addMinutes, isToday, isBefore, isAfter } from 'date-fns';
import { SkeletonTimeline, SkeletonHero } from './SkeletonTimelineCard';

interface TodayViewProps {
  profile: BabyProfile | null;
  entries: SleepEntry[];
  activeSleep: SleepEntry | null;
  lastCompletedSleep: SleepEntry | null;
  awakeMinutes: number | null;
  onEdit?: (entry: SleepEntry) => void;
  loading?: boolean;
  totalEntries?: number;
}

// Sparkles icon for status pill
const SparklesIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);

// Live Status Pill
function LiveStatusPill({ totalEntries }: { totalEntries: number }) {
  const tier = getAlgorithmStatusTier(totalEntries);
  const label = tier === 'learning' ? 'Learning' : tier === 'calibrating' ? 'Calibrating' : 'Optimised';
  const color =
    tier === 'optimized'
      ? 'var(--success-color)'
      : tier === 'calibrating'
        ? 'var(--nap-color)'
        : 'var(--wake-color)';

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20">
      <span style={{ color }} className="animate-pulse">
        <SparklesIcon />
      </span>
      <span className="text-[10px] font-display font-semibold" style={{ color }}>
        {label}
      </span>
    </div>
  );
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

// Calculate expected wake-up time from active nap
function getExpectedWakeTime(activeSleep: SleepEntry, profile: BabyProfile | null): Date | null {
  if (!activeSleep || activeSleep.type !== 'nap') return null;

  let avgNapMinutes = 60;
  if (profile?.dateOfBirth) {
    const schedule = getRecommendedSchedule(profile.dateOfBirth);
    avgNapMinutes = schedule.numberOfNaps >= 3 ? 45 : 90;
  }

  const startTime = parseISO(activeSleep.startTime);
  return addMinutes(startTime, avgNapMinutes);
}

// ============================================================================
// ICONS - Consistent Sun/Cloud/Moon design
// ============================================================================

// Sun icon for morning wake up (Gold)
const SunIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="5" />
    <path
      d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

// Cloud icon for naps (Teal)
const CloudIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
  </svg>
);

// Moon icon for night/bedtime (Lavender)
const MoonIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export function TodayView({
  profile,
  entries,
  activeSleep,
  lastCompletedSleep,
  awakeMinutes,
  onEdit,
  loading = false,
  totalEntries = 0,
}: TodayViewProps) {
  // Force re-render every minute for live countdowns
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const now = new Date();

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
      return total + calculateDuration(nap.startTime, nap.endTime);
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

  // Predicted nap windows (using AAA Dynamic Prediction System)
  // Only show if morning wake up is logged - predictions don't make sense without it
  const predictedNapsWithMetadata = useMemo(() => {
    if (!morningWakeUp) return { predictions: [], calibrationInfo: null }; // Don't predict naps until wake up is logged
    if (!profile?.dateOfBirth) return { predictions: [], calibrationInfo: null };

    const schedule = getRecommendedSchedule(profile.dateOfBirth);

    // Build completed naps data, INCLUDING active nap if present
    const completedNapsData = todayNaps.map((nap) => ({
      endTime: nap.endTime!,
      durationMinutes: calculateDuration(nap.startTime, nap.endTime),
    }));

    // If there's an active nap, treat it as "in progress" for counting purposes
    // and use its expected end time as the anchor for future predictions
    let activeNapExpectedEnd: Date | null = null;
    let activeNapExpectedDuration = 0;
    const hasActiveNap = activeSleep && activeSleep.type === 'nap';

    if (hasActiveNap) {
      activeNapExpectedEnd = getExpectedWakeTime(activeSleep, profile);
      activeNapExpectedDuration = schedule.numberOfNaps >= 3 ? 45 : 90;

      // Add active nap to completed naps data for simulation
      if (activeNapExpectedEnd) {
        completedNapsData.push({
          endTime: activeNapExpectedEnd.toISOString(),
          durationMinutes: activeNapExpectedDuration,
        });
      }
    }

    // calculateAllNapWindows now returns ONLY projected/future naps
    const projectedWindows = calculateAllNapWindows(profile.dateOfBirth, completedNapsData);

    const wakeUpTime = morningWakeUp || new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      schedule.wakeTime.hour,
      schedule.wakeTime.minute
    );

    const predictions: { time: Date; isCatnap: boolean; expectedDuration: number; prediction: NapPrediction }[] = [];
    let firstPredictionCalibrationInfo: NapPrediction | null = null;

    // Determine anchor point: active nap's expected end, or last completed nap, or wake up
    let lastEndTime = wakeUpTime;
    let lastNapDuration: number | null = null;

    if (hasActiveNap && activeNapExpectedEnd) {
      // Use active nap's expected end as anchor
      lastEndTime = activeNapExpectedEnd;
      lastNapDuration = activeNapExpectedDuration;
    } else if (todayNaps.length > 0) {
      const lastNap = todayNaps[todayNaps.length - 1];
      if (lastNap.endTime) {
        lastEndTime = parseISO(lastNap.endTime);
        lastNapDuration = calculateDuration(lastNap.startTime, lastNap.endTime);
      }
    }

    // Calculate effective nap count (completed + active)
    const effectiveNapCount = todayNaps.length + (hasActiveNap ? 1 : 0);

    // projectedWindows already contains only remaining naps from simulation
    for (let i = 0; i < projectedWindows.length; i++) {
      const windowInfo = projectedWindows[i];
      const napIndex = effectiveNapCount + i;

      const napIndexType: NapIndex =
        napIndex === 0 ? 'first' :
        napIndex === 1 ? 'second' : 'third_plus';

      // Use new AAA Dynamic Prediction with metadata
      const napPrediction = calculateSuggestedNapTimeWithMetadata(
        profile.dateOfBirth,
        lastEndTime.toISOString(),
        lastNapDuration,
        napIndexType,
        wakeWindowHistory.wakeWindows,
        wakeWindowHistory.todaysCount,
        entries.length
      );

      // Store first prediction's calibration info for UI
      if (i === 0 && napPrediction.predictedTime) {
        firstPredictionCalibrationInfo = napPrediction;
      }

      // Determine minimum time for showing predictions
      const minPredictionTime = hasActiveNap && activeNapExpectedEnd
        ? activeNapExpectedEnd
        : now;

      if (napPrediction.predictedTime) {
        // If prediction is in the future, show it normally
        if (isAfter(napPrediction.predictedTime, minPredictionTime)) {
          predictions.push({
            time: napPrediction.predictedTime,
            isCatnap: windowInfo.isCatnap,
            expectedDuration: windowInfo.expectedDurationMinutes,
            prediction: napPrediction,
          });
          lastEndTime = addMinutes(napPrediction.predictedTime, windowInfo.expectedDurationMinutes);
        }
        // If prediction is in the past (overdue) and no active nap, show as "now"
        // This ensures parents see the nap is needed and bedtime calculates correctly
        else if (!hasActiveNap && predictions.length === 0) {
          predictions.push({
            time: now, // Show as "now" since it's overdue
            isCatnap: windowInfo.isCatnap,
            expectedDuration: windowInfo.expectedDurationMinutes,
            prediction: napPrediction,
          });
          // For subsequent calculations, use now + expected duration as anchor
          lastEndTime = addMinutes(now, windowInfo.expectedDurationMinutes);
        }
        // If prediction is overdue but we already have future predictions, skip it
        else {
          lastEndTime = addMinutes(napPrediction.predictedTime, windowInfo.expectedDurationMinutes);
        }
      }
      lastNapDuration = windowInfo.expectedDurationMinutes;
    }

    return { predictions, calibrationInfo: firstPredictionCalibrationInfo };
  }, [profile?.dateOfBirth, morningWakeUp, todayNaps, now, activeSleep, profile, entries.length, wakeWindowHistory]);

  // Convenience accessor for predictions (backward compatible)
  const predictedNaps = predictedNapsWithMetadata.predictions;
  const calibrationInfo = predictedNapsWithMetadata.calibrationInfo;

  // Expected bedtime (dynamic based on day's sleep)
  // Priority: active nap wake time (real-time) → predicted naps → completed naps
  const expectedBedtime = useMemo(() => {
    if (!profile?.dateOfBirth) return null;

    const schedule = getRecommendedSchedule(profile.dateOfBirth);

    // Calculate total accumulated sleep: completed + projected naps
    let accumulatedSleepMinutes = totalDaytimeSleepMinutes;
    predictedNaps.forEach(nap => {
      accumulatedSleepMinutes += nap.expectedDuration;
    });

    // Determine the anchor for bedtime calculation
    let anchorEndTime: Date | null = null;

    // 1. PRIORITY: If there are predicted naps, use last predicted nap's end
    //    Bedtime should always come after all predicted naps
    if (predictedNaps.length > 0) {
      const lastPredicted = predictedNaps[predictedNaps.length - 1];
      anchorEndTime = addMinutes(lastPredicted.time, lastPredicted.expectedDuration);
    }
    // 2. If no predicted naps but baby is currently napping, use expected wake time
    else if (activeSleep && activeSleep.type === 'nap') {
      const expectedWake = getExpectedWakeTime(activeSleep, profile);
      if (expectedWake) {
        anchorEndTime = expectedWake;
        // Add estimated remaining sleep to accumulated total
        const elapsedMinutes = calculateDuration(activeSleep.startTime, null);
        const expectedDuration = schedule.numberOfNaps >= 3 ? 45 : 90;
        const remainingSleep = Math.max(0, expectedDuration - elapsedMinutes);
        accumulatedSleepMinutes += remainingSleep;
      }
    }
    // 3. Fall back to last completed nap
    else if (todayNaps.length > 0) {
      const lastNap = todayNaps[todayNaps.length - 1];
      if (lastNap.endTime) {
        anchorEndTime = parseISO(lastNap.endTime);
      }
    }

    if (anchorEndTime) {
      return calculateDynamicBedtime(
        profile.dateOfBirth,
        anchorEndTime.toISOString(),
        accumulatedSleepMinutes
      );
    }

    // Default fallback when no sleep data
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      schedule.bedtimeWindow.latest.hour,
      schedule.bedtimeWindow.latest.minute
    );
  }, [profile?.dateOfBirth, todayNaps, totalDaytimeSleepMinutes, predictedNaps, activeSleep, now]);

  // Determine if bedtime is the next event (no more naps predicted)
  const isBedtimeNext = useMemo(() => {
    return predictedNaps.length === 0 && expectedBedtime && isBefore(now, expectedBedtime);
  }, [predictedNaps.length, expectedBedtime, now]);

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
      ? calculateDuration(lastCompletedSleep.startTime, lastCompletedSleep.endTime)
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

  // Expected wake up time (if sleeping)
  const expectedWakeUp = useMemo(() => {
    if (!activeSleep) return null;
    return getExpectedWakeTime(activeSleep, profile);
  }, [activeSleep, profile]);

  // Duration of current sleep
  const currentSleepDuration = useMemo(() => {
    if (!activeSleep) return 0;
    return calculateDuration(activeSleep.startTime, null);
  }, [activeSleep]);

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
        <div className="pt-8 pb-6">
          <SkeletonHero />
        </div>

        <div className="mt-2">
          <div className="h-3 w-28 bg-white/10 rounded mb-4" />
          <div className="relative">
            <div className="absolute left-5 top-6 bottom-6 w-px bg-white/10" />
            <SkeletonTimeline />
          </div>
        </div>
      </div>
    );
  }

  // Special state: Active night sleep from yesterday - prompt to log wake up
  if (hasActiveNightFromYesterday && !hasTodayActivity) {
    return (
      <div className="flex flex-col pb-40 px-6 fade-in">
        <div className="pt-8 pb-6">
          {/* Hero: Sleeping duration */}
          <div className="text-center mb-6">
            <p className="text-[var(--text-muted)] font-display text-xs uppercase tracking-widest mb-2">
              Night Sleep
            </p>
            <h1 className="text-4xl font-display font-bold text-[var(--night-color)] mb-2">
              {formatDuration(currentSleepDuration)}
            </h1>
            <p className="text-[var(--text-secondary)] font-display text-sm">
              Since {formatTime(activeSleep!.startTime)}
            </p>
          </div>

          {/* Prompt to log wake up */}
          <div className="text-center mb-4">
            <p className="text-[var(--text-muted)] font-display text-xs">
              Tap below to log wake up time
            </p>
          </div>

          {/* Night sleep card - compact horizontal */}
          <button
            type="button"
            onClick={() => onEdit?.(activeSleep!)}
            className="w-full card-night-solid py-2.5 px-4 flex items-center gap-3 text-left rounded-xl animate-glow-night"
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white flex-shrink-0">
              <MoonIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white/70 font-display text-xs uppercase tracking-wider">
                Night Sleep
              </p>
              <p className="text-white font-display font-semibold text-base">
                {formatTime(activeSleep!.startTime)} → ?
              </p>
            </div>
            <div className="text-white/50">
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
    return (
      <div className="flex flex-col pb-40 px-6 fade-in">
        <div className="pt-10 pb-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--bg-card)] flex items-center justify-center">
              <MoonIcon className="w-8 h-8 text-[var(--text-muted)]" />
            </div>
            <h1 className="text-xl font-display font-bold text-[var(--text-primary)] mb-2">
              Good morning!
            </h1>
            <p className="text-[var(--text-secondary)] font-display text-sm max-w-xs mx-auto leading-relaxed">
              This space is still empty. Tap the <span className="text-[var(--nap-color)]">+</span> button to add your first activity for today.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-40 px-6 fade-in">
      {/* ================================================================== */}
      {/* HERO SECTION - Glassmorphism Card with Status Pill               */}
      {/* ================================================================== */}
      <div className="pt-6 pb-4">
        <div className="rounded-3xl bg-white/[0.06] backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6">
          {/* Status pill - top right */}
          {totalEntries > 0 && (
            <div className="flex justify-end mb-3">
              <LiveStatusPill totalEntries={totalEntries} />
            </div>
          )}

          {activeSleep ? (
            // SLEEPING STATE
            <div className="text-center">
              <p className="text-[var(--text-muted)] font-display text-xs uppercase tracking-widest mb-3">
                {activeSleep.type === 'nap' ? 'Napping' : 'Night Sleep'}
              </p>
              <h1 className="text-5xl font-display font-bold text-[var(--nap-color)] mb-3">
                {formatDuration(currentSleepDuration)}
              </h1>
              {expectedWakeUp && activeSleep.type === 'nap' && (
                <p className="text-[var(--text-secondary)] font-display text-sm">
                  Expected wake at <span className="text-[var(--text-primary)] font-semibold">{formatTime(expectedWakeUp)}</span>
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
                      <p className="text-[var(--text-muted)] font-display text-xs uppercase tracking-widest mb-3">
                        It's Time
                      </p>
                      <h1 className={`text-5xl font-display font-bold animate-pulse-soft ${
                        nextEventCountdown.type === 'bedtime' ? 'text-[var(--night-color)]' : 'text-[var(--nap-color)]'
                      }`}>
                        {nextEventCountdown.type === 'bedtime' ? 'BEDTIME' : 'NAP NOW'}
                      </h1>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[var(--text-muted)] font-display text-xs uppercase tracking-widest mb-3">
                        {nextEventCountdown.type === 'bedtime' ? 'Bedtime In' : 'Next Nap In'}
                      </p>
                      <h1 className={`text-5xl font-display font-bold mb-3 ${
                        nextEventCountdown.type === 'bedtime' ? 'text-[var(--night-color)]' : 'text-[var(--nap-color)]'
                      }`}>
                        {formatDuration(nextEventCountdown.minutes)}
                      </h1>
                    </div>
                  )}
                  {/* SECONDARY: Awake time (smaller, muted) */}
                  <p className="text-[var(--text-muted)] font-display text-sm mt-1">
                    Awake for{' '}
                    <span className="text-[var(--wake-color)] font-medium">
                      {awakeMinutes !== null ? formatDuration(awakeMinutes) : '—'}
                    </span>
                  </p>
                </>
              ) : (
                // Fallback when no countdown available
                <div>
                  <p className="text-[var(--text-muted)] font-display text-xs uppercase tracking-widest mb-3">
                    Awake
                  </p>
                  <h1 className="text-5xl font-display font-bold text-[var(--wake-color)]">
                    {awakeMinutes !== null ? formatDuration(awakeMinutes) : '—'}
                  </h1>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ================================================================== */}
      {/* CALIBRATION BANNER - Show when system is learning                 */}
      {/* ================================================================== */}
      {calibrationInfo?.isCalibrating && predictedNaps.length > 0 && (
        <div className="mb-4 card p-4 border border-[var(--nap-color)]/20 bg-[var(--nap-color)]/5">
          <div className="flex items-start gap-3">
            {/* Tuning fork / calibration icon */}
            <div className="w-8 h-8 rounded-full bg-[var(--nap-color)]/20 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4 text-[var(--nap-color)]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v4" />
                <path d="M12 18v4" />
                <path d="m4.93 4.93 2.83 2.83" />
                <path d="m16.24 16.24 2.83 2.83" />
                <path d="M2 12h4" />
                <path d="M18 12h4" />
                <path d="m4.93 19.07 2.83-2.83" />
                <path d="m16.24 7.76 2.83-2.83" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[var(--text-primary)] font-display font-semibold text-sm mb-1">
                Sintonitzant el ritme de {profile?.name || 'baby'}
              </p>
              <p className="text-[var(--text-muted)] text-xs leading-relaxed">
                {calibrationInfo.calibrationReason === 'insufficient_data' ? (
                  <>
                    Estem analitzant les últimes migdiades per ser més precisos.
                    {entries.length > 0 && (
                      <span className="text-[var(--nap-color)]">
                        {' '}({entries.length}/{MIN_CALIBRATION_ENTRIES} registres)
                      </span>
                    )}
                  </>
                ) : calibrationInfo.calibrationReason === 'high_variability' ? (
                  <>
                    El patró de son avui és diferent del habitual. Estem ajustant les prediccions.
                  </>
                ) : calibrationInfo.calibrationReason === 'first_nap_of_day' ? (
                  <>
                    Primera migdiada del dia - utilitzant la finestra de vigília més curta.
                  </>
                ) : (
                  <>
                    En breu tindràs la teva predicció personalitzada.
                  </>
                )}
              </p>
              {/* Confidence indicator */}
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--nap-color)] rounded-full transition-all duration-500"
                    style={{ width: `${Math.round(calibrationInfo.confidenceScore * 100)}%` }}
                  />
                </div>
                <span className="text-[var(--text-muted)] text-xs">
                  {Math.round(calibrationInfo.confidenceScore * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* TIMELINE RIVER - Visual flow through the day                      */}
      {/* ================================================================== */}
      <div className="mt-4">
        <h2 className="text-[var(--text-muted)] font-display text-xs uppercase tracking-widest mb-4 px-1">
          Today's Timeline
        </h2>

        {/* Timeline with vertical connector - NEWEST FIRST (last to old) */}
        <div className="relative">
          {/* Vertical timeline river line */}
          <div className="absolute left-5 top-6 bottom-6 w-px bg-white/10" />

          <div className="space-y-3">
            {/* Night Sleep in Progress - Glassmorphism */}
            {activeSleep && activeSleep.type === 'night' && (
              <button
                type="button"
                onClick={() => onEdit?.(activeSleep)}
                className="relative py-3 px-4 flex items-center gap-3 w-full text-left rounded-2xl bg-[var(--night-color)]/90 backdrop-blur-xl border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.06)] animate-glow-night"
              >
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white flex-shrink-0 animate-pulse-soft z-10">
                  <MoonIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 font-display text-xs uppercase tracking-wider">
                    Night Sleep
                  </p>
                  <p className="text-white font-display font-semibold text-base">
                    {formatTime(activeSleep.startTime)} — ...
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white/80 font-display text-sm font-medium">
                    {formatDuration(currentSleepDuration)}
                  </p>
                </div>
              </button>
            )}

            {/* Expected Bedtime - Glassmorphism Ghost */}
            {expectedBedtime && isBefore(now, expectedBedtime) && !(activeSleep && activeSleep.type === 'night') && (
              <div className="relative py-3 px-4 flex items-center gap-3 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-[var(--night-color)]/30 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-dashed border-[var(--night-color)]/40 text-[var(--night-color)]/70 z-10">
                  <MoonIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[var(--text-muted)] font-display text-xs uppercase tracking-wider">
                    Bedtime
                  </p>
                  <p className="text-[var(--text-secondary)] font-display font-semibold text-base">
                    {formatTime(expectedBedtime)}
                  </p>
                </div>
              </div>
            )}

            {/* Predicted Naps - Glassmorphism Ghost */}
            {[...predictedNaps].reverse().map((napInfo, index) => {
              const expectedEnd = addMinutes(napInfo.time, napInfo.expectedDuration);
              return (
                <div
                  key={`predicted-${index}`}
                  className="relative py-3 px-4 flex items-center gap-3 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-[var(--nap-color)]/30 shadow-[0_4px_20px_rgb(0,0,0,0.03)]"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-dashed border-[var(--nap-color)]/40 text-[var(--nap-color)]/70 z-10">
                    <CloudIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[var(--text-muted)] font-display text-xs uppercase tracking-wider">
                      {napInfo.isCatnap ? 'Catnap' : 'Predicted Nap'}
                    </p>
                    <p className="text-[var(--text-secondary)] font-display font-semibold text-base">
                      {formatTime(napInfo.time)} — {formatTime(expectedEnd)}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Active Nap - Glassmorphism Solid */}
            {activeSleep && activeSleep.type === 'nap' && (
              <button
                type="button"
                onClick={() => onEdit?.(activeSleep)}
                className="relative py-3 px-4 flex items-center gap-3 animate-glow w-full text-left rounded-2xl bg-[var(--nap-color)]/90 backdrop-blur-xl border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
              >
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white flex-shrink-0 animate-pulse-soft z-10">
                  <CloudIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 font-display text-xs uppercase tracking-wider">
                    Napping Now
                  </p>
                  <p className="text-white font-display font-semibold text-base">
                    {formatTime(activeSleep.startTime)} — ...
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white/80 font-display text-sm font-medium">
                    {formatDuration(currentSleepDuration)}
                  </p>
                </div>
              </button>
            )}

            {/* Completed Naps - Glassmorphism Solid */}
            {[...todayNaps].reverse().map((nap, index) => (
              <button
                type="button"
                key={nap.id}
                onClick={() => onEdit?.(nap)}
                className="relative py-3 px-4 flex items-center gap-3 w-full text-left rounded-2xl bg-[var(--nap-color)]/80 backdrop-blur-xl border border-white/15 shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
              >
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white flex-shrink-0 z-10">
                  <CloudIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 font-display text-xs uppercase tracking-wider">
                    Nap {todayNaps.length - index}
                  </p>
                  <p className="text-white font-display font-semibold text-base">
                    {formatTime(nap.startTime)} — {formatTime(nap.endTime!)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white/80 font-display text-sm font-medium">
                    {formatDuration(calculateDuration(nap.startTime, nap.endTime))}
                  </p>
                </div>
              </button>
            ))}

            {/* Morning Wake Up - Glassmorphism Gold - OLDEST, at bottom */}
            {morningWakeUp && morningWakeUpEntry && (
              <button
                type="button"
                onClick={() => onEdit?.(morningWakeUpEntry)}
                className="relative py-3 px-4 flex items-center gap-3 w-full text-left rounded-2xl bg-white/[0.06] backdrop-blur-xl border border-[var(--wake-color)]/30 shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--wake-color)] flex items-center justify-center text-[var(--bg-deep)] flex-shrink-0 z-10">
                  <SunIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[var(--wake-color)] font-display text-xs uppercase tracking-wider">
                    Morning Wake Up
                  </p>
                  <p className="text-[var(--text-primary)] font-display font-semibold text-base">
                    {formatTime(morningWakeUp)}
                  </p>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
