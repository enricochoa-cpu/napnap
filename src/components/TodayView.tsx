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
}

// Get today's completed naps
function getTodayNaps(entries: SleepEntry[]): SleepEntry[] {
  return entries
    .filter((e) => e.type === 'nap' && e.endTime !== null && isToday(parseISO(e.startTime)))
    .sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime());
}

// Get today's morning wake up time (end of night sleep)
function getMorningWakeUp(entries: SleepEntry[]): Date | null {
  const nightEntry = entries.find(
    (e) => e.type === 'night' && e.endTime && isToday(parseISO(e.endTime))
  );
  return nightEntry?.endTime ? parseISO(nightEntry.endTime) : null;
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
}: TodayViewProps) {
  // Force re-render every minute for live countdowns
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const now = new Date();

  // Morning wake up time
  const morningWakeUp = useMemo(() => getMorningWakeUp(entries), [entries]);

  // Today's completed naps
  const todayNaps = useMemo(() => getTodayNaps(entries), [entries]);

  // Calculate total daytime sleep for dynamic bedtime
  const totalDaytimeSleepMinutes = useMemo(() => {
    return todayNaps.reduce((total, nap) => {
      return total + calculateDuration(nap.startTime, nap.endTime);
    }, 0);
  }, [todayNaps]);

  // Predicted nap windows (using progressive algorithm)
  const predictedNaps = useMemo(() => {
    if (!profile?.dateOfBirth) return [];

    const completedNapsData = todayNaps.map((nap) => ({
      endTime: nap.endTime!,
      durationMinutes: calculateDuration(nap.startTime, nap.endTime),
    }));

    const allWindows = calculateAllNapWindows(profile.dateOfBirth, completedNapsData);

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

    const remainingNaps = Math.max(0, allWindows.length - todayNaps.length);

    for (let i = 0; i < remainingNaps; i++) {
      const napIndex = todayNaps.length + i;
      const windowInfo = allWindows[napIndex];

      if (!windowInfo) break;

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
  }, [profile?.dateOfBirth, morningWakeUp, todayNaps, now]);

  // Expected bedtime (dynamic based on day's sleep)
  const expectedBedtime = useMemo(() => {
    if (!profile?.dateOfBirth) return null;

    const schedule = getRecommendedSchedule(profile.dateOfBirth);

    if (todayNaps.length > 0) {
      const lastNap = todayNaps[todayNaps.length - 1];
      if (lastNap.endTime) {
        return calculateDynamicBedtime(
          profile.dateOfBirth,
          lastNap.endTime,
          totalDaytimeSleepMinutes
        );
      }
    }

    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      schedule.bedtimeWindow.latest.hour,
      schedule.bedtimeWindow.latest.minute
    );
  }, [profile?.dateOfBirth, todayNaps, totalDaytimeSleepMinutes, now]);

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

  return (
    <div className="flex flex-col pb-40 px-4 fade-in">
      {/* ================================================================== */}
      {/* HERO SECTION - Cognitive Priority: Next Nap > Awake Time          */}
      {/* ================================================================== */}
      <div className="pt-10 pb-8">
        {activeSleep ? (
          // SLEEPING STATE
          <div className="text-center">
            <p className="hero-secondary uppercase tracking-widest mb-3">
              {activeSleep.type === 'nap' ? 'Napping' : 'Night Sleep'}
            </p>
            <h1 className="hero-countdown text-[var(--nap-color)] mb-4">
              {formatDuration(currentSleepDuration)}
            </h1>
            {expectedWakeUp && activeSleep.type === 'nap' && (
              <p className="text-[var(--text-secondary)] font-display text-base">
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
                    <p className="hero-secondary uppercase tracking-widest mb-3">
                      It's Time
                    </p>
                    <h1 className={`hero-countdown animate-pulse-soft ${
                      nextEventCountdown.type === 'bedtime' ? 'text-[var(--night-color)]' : 'text-[var(--nap-color)]'
                    }`}>
                      {nextEventCountdown.type === 'bedtime' ? 'BEDTIME' : 'NAP NOW'}
                    </h1>
                  </div>
                ) : (
                  <div>
                    <p className="hero-secondary uppercase tracking-widest mb-3">
                      {nextEventCountdown.type === 'bedtime' ? 'Bedtime In' : 'Next Nap In'}
                    </p>
                    <h1 className={`hero-countdown mb-4 ${
                      nextEventCountdown.type === 'bedtime' ? 'text-[var(--night-color)]' : 'text-[var(--nap-color)]'
                    }`}>
                      {formatDuration(nextEventCountdown.minutes)}
                    </h1>
                  </div>
                )}
                {/* SECONDARY: Awake time (smaller, muted) */}
                <p className="hero-secondary mt-4">
                  Awake for{' '}
                  <span className="text-[var(--wake-color)]">
                    {awakeMinutes !== null ? formatDuration(awakeMinutes) : '—'}
                  </span>
                </p>
              </>
            ) : (
              // Fallback when no countdown available
              <div>
                <p className="hero-secondary uppercase tracking-widest mb-3">
                  Awake
                </p>
                <h1 className="hero-countdown text-[var(--wake-color)]">
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
        <h2 className="text-[var(--text-muted)] font-display text-xs uppercase tracking-widest mb-6 px-1">
          Today's Timeline
        </h2>

        {/* Timeline with vertical connector - NEWEST FIRST (last to old) */}
        <div className="timeline-river space-y-4">

          {/* Night Sleep in Progress - Solid (Lavender/--night-color) */}
          {activeSleep && activeSleep.type === 'night' && (
            <div
              className="timeline-item rounded-2xl p-5 flex items-center gap-5"
              style={{
                backgroundColor: 'var(--night-color)',
                boxShadow: '0 0 30px rgba(124, 133, 196, 0.3)',
              }}
            >
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white flex-shrink-0 animate-pulse-soft">
                <MoonIcon className="w-8 h-8" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/70 font-display text-xs uppercase tracking-wider mb-1">
                  Night Sleep
                </p>
                <p className="text-white font-display font-bold text-2xl">
                  {formatTime(activeSleep.startTime)} — ...
                </p>
                <p className="text-white/80 font-display text-sm mt-1">
                  {formatDuration(currentSleepDuration)}
                </p>
              </div>
            </div>
          )}

          {/* Expected Bedtime - Ghost Pill (Lavender/--night-color) */}
          {expectedBedtime && isBefore(now, expectedBedtime) && !activeSleep && (
            <div
              className="timeline-item rounded-2xl p-5 flex items-center gap-5"
              style={{
                backgroundColor: 'transparent',
                border: '2px dashed rgba(124, 133, 196, 0.4)',
              }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  border: '2px dashed rgba(124, 133, 196, 0.4)',
                  color: 'rgba(124, 133, 196, 0.6)',
                }}
              >
                <MoonIcon className="w-8 h-8" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[var(--text-muted)] font-display text-xs uppercase tracking-wider mb-1">
                  Bedtime
                </p>
                <p className="text-[var(--text-secondary)] font-display font-bold text-2xl">
                  ~{formatTime(expectedBedtime)}
                </p>
              </div>
            </div>
          )}

          {/* Predicted Naps - Ghost Pills (reversed: furthest first) */}
          {!activeSleep && [...predictedNaps].reverse().map((napInfo, index) => (
            <div
              key={`predicted-${index}`}
              className="timeline-item rounded-2xl p-5 flex items-center gap-5"
              style={{
                backgroundColor: 'transparent',
                border: '2px dashed rgba(94, 173, 176, 0.4)',
              }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  border: '2px dashed rgba(94, 173, 176, 0.4)',
                  color: 'rgba(94, 173, 176, 0.6)',
                }}
              >
                <CloudIcon className="w-8 h-8" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[var(--text-muted)] font-display text-xs uppercase tracking-wider mb-1">
                  {napInfo.isCatnap ? 'Catnap' : 'Predicted Nap'}
                </p>
                <p className="text-[var(--text-secondary)] font-display font-bold text-2xl">
                  ~{formatTime(napInfo.time)}
                </p>
                <p className="text-[var(--text-muted)] font-display text-sm mt-1">
                  ~{formatDuration(napInfo.expectedDuration)}
                </p>
              </div>
            </div>
          ))}

          {/* Active Nap - Solid with glow effect */}
          {activeSleep && activeSleep.type === 'nap' && (
            <div
              className="timeline-item rounded-2xl p-5 flex items-center gap-5 animate-glow"
              style={{ backgroundColor: 'var(--nap-color)' }}
            >
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white flex-shrink-0 animate-pulse-soft">
                <CloudIcon className="w-8 h-8" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/70 font-display text-xs uppercase tracking-wider mb-1">
                  Napping Now
                </p>
                <p className="text-white font-display font-bold text-2xl">
                  {formatTime(activeSleep.startTime)} — ...
                </p>
                <p className="text-white/80 font-display text-sm mt-1">
                  {formatDuration(currentSleepDuration)}
                </p>
              </div>
            </div>
          )}

          {/* Completed Naps - Solid Pills (reversed: most recent first) */}
          {[...todayNaps].reverse().map((nap, index) => (
            <div
              key={nap.id}
              className="timeline-item rounded-2xl p-5 flex items-center gap-5"
              style={{ backgroundColor: 'var(--nap-color)' }}
            >
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white flex-shrink-0">
                <CloudIcon className="w-8 h-8" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/70 font-display text-xs uppercase tracking-wider mb-1">
                  Nap {todayNaps.length - index}
                </p>
                <p className="text-white font-display font-bold text-2xl">
                  {formatTime(nap.startTime)} — {formatTime(nap.endTime!)}
                </p>
                <p className="text-white/80 font-display text-sm mt-1">
                  {formatDuration(calculateDuration(nap.startTime, nap.endTime))}
                </p>
              </div>
            </div>
          ))}

          {/* Morning Wake Up - Gold (--wake-color) - OLDEST, at bottom */}
          {morningWakeUp && (
            <div className="timeline-item glass rounded-2xl p-5 flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-[var(--wake-color)] flex items-center justify-center text-[var(--bg-deep)] flex-shrink-0">
                <SunIcon className="w-8 h-8" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[var(--wake-color)] font-display text-xs uppercase tracking-wider mb-1">
                  Morning Wake Up
                </p>
                <p className="text-[var(--text-primary)] font-display font-bold text-2xl">
                  {formatTime(morningWakeUp)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
