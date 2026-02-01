import { useMemo, useEffect, useState } from 'react';
import {
  formatTime,
  formatDuration,
  calculateDuration,
  calculateSuggestedNapTime,
  calculateAllNapWindows,
  getRecommendedSchedule,
  calculateDynamicBedtime,
  type NapIndex,
} from '../utils/dateUtils';
import type { SleepEntry, BabyProfile } from '../types';
import { parseISO, differenceInMinutes, addMinutes, isToday, isBefore, isAfter } from 'date-fns';

interface TodayViewProps {
  profile: BabyProfile | null;
  entries: SleepEntry[];
  activeSleep: SleepEntry | null;
  lastCompletedSleep: SleepEntry | null;
  awakeMinutes: number | null;
  onEdit?: (entry: SleepEntry) => void;
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

  // Predicted nap windows (using progressive algorithm)
  // Only show if morning wake up is logged - predictions don't make sense without it
  // FILTER: If baby is actively napping, hide all predictions (user needs "how long" not "when")
  const predictedNaps = useMemo(() => {
    if (!morningWakeUp) return []; // Don't predict naps until wake up is logged
    if (!profile?.dateOfBirth) return [];
    if (activeSleep && activeSleep.type === 'nap') return []; // No predictions while napping

    const completedNapsData = todayNaps.map((nap) => ({
      endTime: nap.endTime!,
      durationMinutes: calculateDuration(nap.startTime, nap.endTime),
    }));

    // calculateAllNapWindows now returns ONLY projected/future naps
    const projectedWindows = calculateAllNapWindows(profile.dateOfBirth, completedNapsData);

    const schedule = getRecommendedSchedule(profile.dateOfBirth);
    const wakeUpTime = morningWakeUp || new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      schedule.wakeTime.hour,
      schedule.wakeTime.minute
    );

    const predictions: { time: Date; isCatnap: boolean; expectedDuration: number }[] = [];
    let lastEndTime = wakeUpTime;
    let lastNapDuration: number | null = null;

    if (todayNaps.length > 0) {
      const lastNap = todayNaps[todayNaps.length - 1];
      if (lastNap.endTime) {
        lastEndTime = parseISO(lastNap.endTime);
        lastNapDuration = calculateDuration(lastNap.startTime, lastNap.endTime);
      }
    }

    // projectedWindows already contains only remaining naps from simulation
    for (let i = 0; i < projectedWindows.length; i++) {
      const windowInfo = projectedWindows[i];
      const napIndex = todayNaps.length + i;

      const napIndexType: NapIndex =
        napIndex === 0 ? 'first' :
        napIndex === 1 ? 'second' : 'third_plus';

      const nextNapTime = calculateSuggestedNapTime(
        profile.dateOfBirth,
        lastEndTime.toISOString(),
        lastNapDuration,
        napIndexType
      );

      if (isAfter(nextNapTime, now)) {
        predictions.push({
          time: nextNapTime,
          isCatnap: windowInfo.isCatnap,
          expectedDuration: windowInfo.expectedDurationMinutes,
        });
      }

      lastEndTime = addMinutes(nextNapTime, windowInfo.expectedDurationMinutes);
      lastNapDuration = windowInfo.expectedDurationMinutes;
    }

    return predictions;
  }, [profile?.dateOfBirth, morningWakeUp, todayNaps, now, activeSleep]);

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

    // 1. PRIORITY: If baby is currently napping, use expected wake time as anchor
    //    This makes bedtime update in real-time while baby sleeps
    if (activeSleep && activeSleep.type === 'nap') {
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
    // 2. If no active nap but there are predicted naps, use last predicted nap's end
    else if (predictedNaps.length > 0) {
      const lastPredicted = predictedNaps[predictedNaps.length - 1];
      anchorEndTime = addMinutes(lastPredicted.time, lastPredicted.expectedDuration);
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
      {/* HERO SECTION - Cognitive Priority: Next Nap > Awake Time          */}
      {/* ================================================================== */}
      <div className="pt-8 pb-6">
        {activeSleep ? (
          // SLEEPING STATE
          <div className="text-center">
            <p className="text-[var(--text-muted)] font-display text-xs uppercase tracking-widest mb-2">
              {activeSleep.type === 'nap' ? 'Napping' : 'Night Sleep'}
            </p>
            <h1 className="text-4xl font-display font-bold text-[var(--nap-color)] mb-2">
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
                    <p className="text-[var(--text-muted)] font-display text-xs uppercase tracking-widest mb-2">
                      It's Time
                    </p>
                    <h1 className={`text-4xl font-display font-bold animate-pulse-soft ${
                      nextEventCountdown.type === 'bedtime' ? 'text-[var(--night-color)]' : 'text-[var(--nap-color)]'
                    }`}>
                      {nextEventCountdown.type === 'bedtime' ? 'BEDTIME' : 'NAP NOW'}
                    </h1>
                  </div>
                ) : (
                  <div>
                    <p className="text-[var(--text-muted)] font-display text-xs uppercase tracking-widest mb-2">
                      {nextEventCountdown.type === 'bedtime' ? 'Bedtime In' : 'Next Nap In'}
                    </p>
                    <h1 className={`text-4xl font-display font-bold mb-2 ${
                      nextEventCountdown.type === 'bedtime' ? 'text-[var(--night-color)]' : 'text-[var(--nap-color)]'
                    }`}>
                      {formatDuration(nextEventCountdown.minutes)}
                    </h1>
                  </div>
                )}
                {/* SECONDARY: Awake time (smaller, muted) */}
                <p className="text-[var(--text-muted)] font-display text-sm mt-2">
                  Awake for{' '}
                  <span className="text-[var(--wake-color)]">
                    {awakeMinutes !== null ? formatDuration(awakeMinutes) : '—'}
                  </span>
                </p>
              </>
            ) : (
              // Fallback when no countdown available
              <div>
                <p className="text-[var(--text-muted)] font-display text-xs uppercase tracking-widest mb-2">
                  Awake
                </p>
                <h1 className="text-4xl font-display font-bold text-[var(--wake-color)]">
                  {awakeMinutes !== null ? formatDuration(awakeMinutes) : '—'}
                </h1>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================================================================== */}
      {/* TIMELINE RIVER - Visual flow through the day                      */}
      {/* ================================================================== */}
      <div className="mt-2">
        <h2 className="text-[var(--text-muted)] font-display text-xs uppercase tracking-widest mb-4">
          Today's Timeline
        </h2>

        {/* Timeline with vertical connector - NEWEST FIRST (last to old) */}
        <div className="relative">
          {/* Vertical timeline river line */}
          <div className="absolute left-5 top-6 bottom-6 w-px bg-white/10" />

          <div className="space-y-2">
            {/* Night Sleep in Progress - Compact Horizontal */}
            {activeSleep && activeSleep.type === 'night' && (
              <button
                type="button"
                onClick={() => onEdit?.(activeSleep)}
                className="relative card-night-solid py-2.5 px-4 flex items-center gap-3 w-full text-left rounded-xl animate-glow-night"
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

            {/* Expected Bedtime - Compact Horizontal Ghost */}
            {expectedBedtime && isBefore(now, expectedBedtime) && (
              <div className="relative card-ghost-night py-2.5 px-4 flex items-center gap-3 rounded-xl">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-dashed border-[var(--night-color)]/40 text-[var(--night-color)]/70 z-10">
                  <MoonIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[var(--text-muted)] font-display text-xs uppercase tracking-wider">
                    Bedtime
                  </p>
                  <p className="text-[var(--text-secondary)] font-display font-semibold text-base">
                    ~{formatTime(expectedBedtime)}
                  </p>
                </div>
              </div>
            )}

            {/* Predicted Naps - Compact Horizontal Ghost (reversed: furthest first) */}
            {[...predictedNaps].reverse().map((napInfo, index) => (
              <div
                key={`predicted-${index}`}
                className="relative card-ghost-nap py-2.5 px-4 flex items-center gap-3 rounded-xl"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-dashed border-[var(--nap-color)]/40 text-[var(--nap-color)]/70 z-10">
                  <CloudIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[var(--text-muted)] font-display text-xs uppercase tracking-wider">
                    {napInfo.isCatnap ? 'Catnap' : 'Predicted Nap'}
                  </p>
                  <p className="text-[var(--text-secondary)] font-display font-semibold text-base">
                    ~{formatTime(napInfo.time)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[var(--text-muted)] font-display text-sm">
                    ~{formatDuration(napInfo.expectedDuration)}
                  </p>
                </div>
              </div>
            ))}

            {/* Active Nap - Compact Horizontal Solid */}
            {activeSleep && activeSleep.type === 'nap' && (
              <button
                type="button"
                onClick={() => onEdit?.(activeSleep)}
                className="relative card-nap-solid py-2.5 px-4 flex items-center gap-3 animate-glow w-full text-left rounded-xl"
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

            {/* Completed Naps - Compact Horizontal Solid (reversed: most recent first) */}
            {[...todayNaps].reverse().map((nap, index) => (
              <button
                type="button"
                key={nap.id}
                onClick={() => onEdit?.(nap)}
                className="relative card-nap-solid py-2.5 px-4 flex items-center gap-3 w-full text-left rounded-xl"
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

            {/* Morning Wake Up - Compact Horizontal Gold - OLDEST, at bottom */}
            {morningWakeUp && morningWakeUpEntry && (
              <button
                type="button"
                onClick={() => onEdit?.(morningWakeUpEntry)}
                className="relative card-wake py-2.5 px-4 flex items-center gap-3 w-full text-left rounded-xl"
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
