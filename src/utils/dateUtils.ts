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
  addMinutes as fnsAddMinutes,
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
  return format(d, 'HH:mm');
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

/*
 * =============================================================================
 * ADAPTIVE SLEEP SIMULATION ENGINE - Biologically-Driven Prediction
 * =============================================================================
 *
 * PHILOSOPHY: The system acts as a "scheduling partner" that adjusts in real-time,
 * not a validator that hides information when it doesn't fit the plan.
 *
 * CORE PRINCIPLES:
 *
 * 1. REST PRIORITY
 *    - A short nap is ALWAYS better than no nap
 *    - Baby should never reach bedtime with wake window exceeding max_wake_window
 *    - Better: 20-min micro-nap at 17:30 + bedtime at 20:15
 *    - Worse: No nap, awake since 14:00, overtired meltdown
 *
 * 2. TOTAL ELASTICITY
 *    - Bedtime = Last_activity_end + Final_wake_window_for_age
 *    - No arbitrary cutoffs that hide needed naps
 *    - Schedule adapts to actual day events, not vice versa
 *
 * 3. COMPRESSION LOGIC
 *    - If projected bedtime > ideal + 60min, compress last nap to micro-nap (20min)
 *    - This preserves rest while protecting reasonable bedtime
 *
 * 4. FULL-DAY SIMULATION
 *    - Project entire day forward from current state
 *    - Show all remaining naps needed, even if schedule is "late"
 *    - Let parents make informed decisions
 *
 * =============================================================================
 */

// ============================================================================
// SLEEP DEVELOPMENT MAP - Biological Configuration by Age
// ============================================================================

/**
 * Complete sleep configuration for an age range.
 * Based on pediatric sleep science and development milestones.
 */
export interface AgeSleepConfig {
  /** Age range in months (inclusive) */
  ageRange: { minMonths: number; maxMonths: number };

  /** Target number of naps for this age */
  targetNaps: number;

  /** Wake windows in minutes */
  wakeWindows: {
    first: number;    // After morning wake → first nap
    mid: number;      // Between naps (average)
    final: number;    // After last nap → bedtime (minimum acceptable)
    max: number;      // Maximum tolerable before overtired
  };

  /** Nap durations in minutes */
  napDurations: {
    standard: number; // Normal restorative nap
    minimum: number;  // Minimum for one sleep cycle
    micro: number;    // Emergency micro-nap to bridge to bedtime
  };

  /** Bedtime window */
  bedtime: {
    earliest: { hour: number; minute: number };
    ideal: { hour: number; minute: number };
    latest: { hour: number; minute: number };
  };

  /** Default morning wake time */
  defaultWakeTime: { hour: number; minute: number };

  /** Regression period info */
  regression?: {
    type: '4-month' | '8-month' | '12-month' | '18-month';
    note: string;
  };
}

/**
 * Complete development map covering 0-24 months.
 * Each config is based on pediatric sleep research.
 */
export const SLEEP_DEVELOPMENT_MAP: AgeSleepConfig[] = [
  // 0-6 weeks: Newborn - very short wake tolerance, frequent feeding
  {
    ageRange: { minMonths: 0, maxMonths: 1.5 },
    targetNaps: 5,
    wakeWindows: { first: 45, mid: 45, final: 45, max: 60 },
    napDurations: { standard: 45, minimum: 30, micro: 20 },
    bedtime: {
      earliest: { hour: 19, minute: 0 },
      ideal: { hour: 20, minute: 0 },
      latest: { hour: 21, minute: 0 },
    },
    defaultWakeTime: { hour: 7, minute: 0 },
  },

  // 6-12 weeks: Emerging patterns, still needs frequent sleep
  {
    ageRange: { minMonths: 1.5, maxMonths: 3 },
    targetNaps: 4,
    wakeWindows: { first: 60, mid: 75, final: 75, max: 90 },
    napDurations: { standard: 60, minimum: 40, micro: 20 },
    bedtime: {
      earliest: { hour: 19, minute: 0 },
      ideal: { hour: 19, minute: 30 },
      latest: { hour: 20, minute: 30 },
    },
    defaultWakeTime: { hour: 7, minute: 0 },
  },

  // 3-4 months: Pre-regression, sleep architecture developing
  {
    ageRange: { minMonths: 3, maxMonths: 4 },
    targetNaps: 4,
    wakeWindows: { first: 75, mid: 90, final: 90, max: 120 },
    napDurations: { standard: 60, minimum: 40, micro: 20 },
    bedtime: {
      earliest: { hour: 18, minute: 30 },
      ideal: { hour: 19, minute: 0 },
      latest: { hour: 20, minute: 0 },
    },
    defaultWakeTime: { hour: 7, minute: 0 },
    regression: {
      type: '4-month',
      note: 'Sleep architecture maturing. May need extra nap on hard days.',
    },
  },

  // 4-5 months: 4-month regression, transitioning 4→3 naps
  {
    ageRange: { minMonths: 4, maxMonths: 5 },
    targetNaps: 3,
    wakeWindows: { first: 90, mid: 105, final: 105, max: 135 },
    napDurations: { standard: 60, minimum: 40, micro: 20 },
    bedtime: {
      earliest: { hour: 18, minute: 30 },
      ideal: { hour: 19, minute: 0 },
      latest: { hour: 19, minute: 30 },
    },
    defaultWakeTime: { hour: 7, minute: 0 },
    regression: {
      type: '4-month',
      note: 'Transition period. 4th nap may still be needed some days.',
    },
  },

  // 5-6 months: Stabilizing on 3 naps
  {
    ageRange: { minMonths: 5, maxMonths: 6 },
    targetNaps: 3,
    wakeWindows: { first: 105, mid: 120, final: 120, max: 150 },
    napDurations: { standard: 60, minimum: 40, micro: 20 },
    bedtime: {
      earliest: { hour: 18, minute: 30 },
      ideal: { hour: 19, minute: 0 },
      latest: { hour: 19, minute: 30 },
    },
    defaultWakeTime: { hour: 7, minute: 0 },
  },

  // 6-7 months: Solid 3-nap schedule
  {
    ageRange: { minMonths: 6, maxMonths: 7 },
    targetNaps: 3,
    wakeWindows: { first: 120, mid: 135, final: 150, max: 180 },
    napDurations: { standard: 60, minimum: 45, micro: 20 },
    bedtime: {
      earliest: { hour: 18, minute: 30 },
      ideal: { hour: 19, minute: 0 },
      latest: { hour: 19, minute: 30 },
    },
    defaultWakeTime: { hour: 7, minute: 0 },
  },

  // 7-8 months: Late 3-nap schedule, approaching transition
  {
    ageRange: { minMonths: 7, maxMonths: 8 },
    targetNaps: 3,
    wakeWindows: { first: 135, mid: 150, final: 180, max: 210 },
    napDurations: { standard: 60, minimum: 45, micro: 20 },
    bedtime: {
      earliest: { hour: 18, minute: 30 },
      ideal: { hour: 19, minute: 30 },
      latest: { hour: 20, minute: 30 },
    },
    defaultWakeTime: { hour: 6, minute: 30 },
  },

  // 8-9 months: 8-month regression, transitioning 3→2 naps
  {
    ageRange: { minMonths: 8, maxMonths: 9 },
    targetNaps: 2,
    wakeWindows: { first: 150, mid: 180, final: 195, max: 225 },
    napDurations: { standard: 75, minimum: 45, micro: 25 },
    bedtime: {
      earliest: { hour: 18, minute: 30 },
      ideal: { hour: 19, minute: 0 },
      latest: { hour: 19, minute: 30 },
    },
    defaultWakeTime: { hour: 6, minute: 30 },
    regression: {
      type: '8-month',
      note: 'Motor milestones + separation anxiety. 3rd nap may still be needed.',
    },
  },

  // 9-10 months: Settling into 2 naps
  {
    ageRange: { minMonths: 9, maxMonths: 10 },
    targetNaps: 2,
    wakeWindows: { first: 165, mid: 195, final: 210, max: 240 },
    napDurations: { standard: 90, minimum: 45, micro: 25 },
    bedtime: {
      earliest: { hour: 18, minute: 30 },
      ideal: { hour: 19, minute: 0 },
      latest: { hour: 19, minute: 30 },
    },
    defaultWakeTime: { hour: 6, minute: 30 },
  },

  // 10-12 months: Solid 2-nap schedule
  {
    ageRange: { minMonths: 10, maxMonths: 12 },
    targetNaps: 2,
    wakeWindows: { first: 180, mid: 210, final: 225, max: 255 },
    napDurations: { standard: 90, minimum: 45, micro: 25 },
    bedtime: {
      earliest: { hour: 18, minute: 30 },
      ideal: { hour: 19, minute: 0 },
      latest: { hour: 19, minute: 30 },
    },
    defaultWakeTime: { hour: 6, minute: 30 },
    regression: {
      type: '12-month',
      note: 'Walking milestone. Temporary sleep disruption common.',
    },
  },

  // 12-15 months: Late 2-nap schedule
  {
    ageRange: { minMonths: 12, maxMonths: 15 },
    targetNaps: 2,
    wakeWindows: { first: 195, mid: 225, final: 240, max: 270 },
    napDurations: { standard: 90, minimum: 45, micro: 30 },
    bedtime: {
      earliest: { hour: 18, minute: 30 },
      ideal: { hour: 19, minute: 15 },
      latest: { hour: 19, minute: 45 },
    },
    defaultWakeTime: { hour: 6, minute: 30 },
  },

  // 15-18 months: Transitioning 2→1 nap
  {
    ageRange: { minMonths: 15, maxMonths: 18 },
    targetNaps: 1,
    wakeWindows: { first: 300, mid: 300, final: 270, max: 330 },
    napDurations: { standard: 120, minimum: 60, micro: 30 },
    bedtime: {
      earliest: { hour: 19, minute: 0 },
      ideal: { hour: 19, minute: 30 },
      latest: { hour: 20, minute: 0 },
    },
    defaultWakeTime: { hour: 7, minute: 0 },
    regression: {
      type: '18-month',
      note: 'Language explosion + independence. May refuse naps temporarily.',
    },
  },

  // 18-24 months: Solid 1-nap schedule
  {
    ageRange: { minMonths: 18, maxMonths: 24 },
    targetNaps: 1,
    wakeWindows: { first: 330, mid: 330, final: 300, max: 360 },
    napDurations: { standard: 120, minimum: 60, micro: 30 },
    bedtime: {
      earliest: { hour: 19, minute: 0 },
      ideal: { hour: 19, minute: 30 },
      latest: { hour: 20, minute: 0 },
    },
    defaultWakeTime: { hour: 7, minute: 0 },
  },
];

// ============================================================================
// CONFIGURATION LOOKUP
// ============================================================================

/**
 * Get the sleep configuration for a baby's current age.
 */
export function getSleepConfigForAge(dateOfBirth: string): AgeSleepConfig {
  const dob = parseISO(dateOfBirth);
  const now = new Date();
  const ageInMonths = differenceInMonths(now, dob) + (differenceInDays(now, dob) % 30) / 30;

  // Find matching config
  for (const config of SLEEP_DEVELOPMENT_MAP) {
    if (ageInMonths >= config.ageRange.minMonths && ageInMonths < config.ageRange.maxMonths) {
      return config;
    }
  }

  // Default to last config for babies > 24 months
  return SLEEP_DEVELOPMENT_MAP[SLEEP_DEVELOPMENT_MAP.length - 1];
}

// ============================================================================
// LEGACY COMPATIBILITY LAYER
// ============================================================================

export interface WakeWindowRange {
  min: number;
  max: number;
  avg: number;
}

export function getWakeWindowForAge(dateOfBirth: string): WakeWindowRange {
  const config = getSleepConfigForAge(dateOfBirth);
  return {
    min: config.wakeWindows.first,
    max: config.wakeWindows.max,
    avg: config.wakeWindows.mid,
  };
}

export type NapIndex = 'first' | 'second' | 'third_plus' | 'bedtime';

export function getProgressiveWakeWindow(dateOfBirth: string, napIndex: NapIndex): number {
  const config = getSleepConfigForAge(dateOfBirth);

  switch (napIndex) {
    case 'first':
      return config.wakeWindows.first;
    case 'second':
      return config.wakeWindows.mid;
    case 'third_plus':
      return config.wakeWindows.mid; // Use mid for 3rd+ naps
    case 'bedtime':
      return config.wakeWindows.final;
  }
}

// ============================================================================
// AAA DYNAMIC PREDICTION SYSTEM - Biologically-Calibrated Algorithms
// ============================================================================

/**
 * Minimum nap duration (in minutes) considered restorative.
 * Naps shorter than this don't fully reset adenosine (sleep pressure).
 */
export const MIN_RESTORATIVE_NAP_DURATION = 30;

// ============================================================================
// ALGORITHM STATUS TIERS - User-facing transparency about prediction maturity
// ============================================================================

/**
 * Algorithm status thresholds (extends existing MIN_CALIBRATION_ENTRIES = 5)
 */
export const ALGORITHM_STATUS_THRESHOLDS = {
  LEARNING_MAX: 5,      // 0-5 entries = Learning
  CALIBRATING_MAX: 15,  // 6-15 entries = Calibrating
  // 15+ = Optimized
};

export type AlgorithmStatusTier = 'learning' | 'calibrating' | 'optimized';

/**
 * Determine the algorithm's maturity tier based on total sleep entries.
 */
export function getAlgorithmStatusTier(totalEntries: number): AlgorithmStatusTier {
  if (totalEntries <= ALGORITHM_STATUS_THRESHOLDS.LEARNING_MAX) return 'learning';
  if (totalEntries <= ALGORITHM_STATUS_THRESHOLDS.CALIBRATING_MAX) return 'calibrating';
  return 'optimized';
}

/**
 * Short nap penalty factor - reduces next wake window by 20%
 * when previous nap was non-restorative.
 */
export const SHORT_NAP_PENALTY = 0.80;

/**
 * Minimum entries required before predictions are considered "calibrated"
 */
export const MIN_CALIBRATION_ENTRIES = 5;

/**
 * Maximum acceptable standard deviation ratio (30%) before marking as "calibrating"
 */
export const MAX_ACCEPTABLE_STD_DEV_RATIO = 0.30;

/**
 * Prediction result with confidence metadata
 */
export interface NapPrediction {
  /** Predicted nap time, null if cannot predict */
  predictedTime: Date | null;
  /** Confidence score from 0 (no confidence) to 1 (high confidence) */
  confidenceScore: number;
  /** True if system is still learning baby's patterns */
  isCalibrating: boolean;
  /** Reason for calibration state (for debugging/display) */
  calibrationReason?: 'insufficient_data' | 'high_variability' | 'first_nap_of_day';
}

/**
 * Historical wake window data for adaptive predictions
 */
export interface WakeWindowHistory {
  /** Wake window duration in minutes */
  durationMinutes: number;
  /** When this wake window occurred */
  date: Date;
  /** Whether this was the first wake window of the day */
  isFirstOfDay: boolean;
  /** Duration of the nap that followed (if any) */
  followingNapDuration?: number;
}

/**
 * Calculate exponential decay weight for recency-based averaging.
 * More recent entries get exponentially higher weights.
 *
 * @param index - Index of the entry (0 = most recent)
 * @param totalEntries - Total number of entries
 * @param todayWeight - Weight proportion for today's entries (default 0.6 = 60%)
 */
export function calculateExponentialWeight(
  index: number,
  totalEntries: number,
  _todayWeight: number = 0.6
): number {
  if (totalEntries <= 1) return 1;

  // Decay factor - determines how quickly weights decrease
  const decayFactor = 0.5;

  // Calculate raw weight using exponential decay
  const rawWeight = Math.pow(decayFactor, index);

  // Normalize so sum = 1
  let totalRawWeight = 0;
  for (let i = 0; i < totalEntries; i++) {
    totalRawWeight += Math.pow(decayFactor, i);
  }

  return rawWeight / totalRawWeight;
}

/**
 * Calculate weighted average of wake windows with exponential decay.
 * Today's entries contribute ~60% of the total weight.
 *
 * @param wakeWindows - Array of wake window durations (most recent first)
 * @param todaysCount - Number of entries from today (will get 60% weight)
 */
export function calculateWeightedWakeWindowAverage(
  wakeWindows: number[],
  todaysCount: number = 0
): number {
  if (wakeWindows.length === 0) return 0;
  if (wakeWindows.length === 1) return wakeWindows[0];

  const TODAY_WEIGHT = 0.6;
  const HISTORICAL_WEIGHT = 0.4;

  // Split into today and historical
  const todayWindows = wakeWindows.slice(0, todaysCount);
  const historicalWindows = wakeWindows.slice(todaysCount);

  let weightedSum = 0;
  let totalWeight = 0;

  // Today's entries (60% total weight, distributed with decay)
  if (todayWindows.length > 0) {
    const todayDecaySum = todayWindows.reduce((sum, val, idx) => {
      const weight = calculateExponentialWeight(idx, todayWindows.length);
      return sum + val * weight;
    }, 0);
    weightedSum += todayDecaySum * TODAY_WEIGHT;
    totalWeight += TODAY_WEIGHT;
  }

  // Historical entries (40% total weight, distributed with decay)
  if (historicalWindows.length > 0) {
    const histDecaySum = historicalWindows.reduce((sum, val, idx) => {
      const weight = calculateExponentialWeight(idx, historicalWindows.length);
      return sum + val * weight;
    }, 0);
    weightedSum += histDecaySum * HISTORICAL_WEIGHT;
    totalWeight += HISTORICAL_WEIGHT;
  }

  // Handle edge case where only one group exists
  if (totalWeight === 0) return wakeWindows[0];

  return Math.round(weightedSum / totalWeight);
}

/**
 * Calculate standard deviation of an array of numbers.
 */
export function calculateStandardDeviation(values: number[]): number {
  if (values.length < 2) return 0;

  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;

  return Math.sqrt(avgSquaredDiff);
}

/**
 * Calculate confidence score based on data quality.
 *
 * @param entriesCount - Total number of historical entries
 * @param stdDevRatio - Standard deviation as ratio of mean
 */
export function calculateConfidenceScore(
  entriesCount: number,
  stdDevRatio: number
): number {
  // Base confidence from entry count (0-0.5)
  const entryConfidence = Math.min(entriesCount / 10, 0.5);

  // Variability penalty (0-0.5)
  // Lower std dev ratio = higher confidence
  const variabilityConfidence = Math.max(0, 0.5 - stdDevRatio);

  return Math.min(1, entryConfidence + variabilityConfidence);
}

/**
 * Determine calibration state based on data quality.
 */
export function determineCalibrationState(
  totalEntries: number,
  todayWakeWindows: number[],
  historicalMean: number
): { isCalibrating: boolean; reason?: 'insufficient_data' | 'high_variability' } {
  // Check minimum entries
  if (totalEntries < MIN_CALIBRATION_ENTRIES) {
    return { isCalibrating: true, reason: 'insufficient_data' };
  }

  // Check variability of today's wake windows against historical mean
  if (todayWakeWindows.length >= 2 && historicalMean > 0) {
    const todayStdDev = calculateStandardDeviation(todayWakeWindows);
    const stdDevRatio = todayStdDev / historicalMean;

    if (stdDevRatio > MAX_ACCEPTABLE_STD_DEV_RATIO) {
      return { isCalibrating: true, reason: 'high_variability' };
    }
  }

  return { isCalibrating: false };
}

export function getShortNapCompensation(napDurationMinutes: number): number {
  // AAA Dynamic Prediction: Short nap penalty
  // If previous nap was non-restorative (<30 min), apply 20% penalty
  if (napDurationMinutes < MIN_RESTORATIVE_NAP_DURATION) {
    return SHORT_NAP_PENALTY; // 0.80 = reduce next WW by 20%
  }
  if (napDurationMinutes < 45) {
    return 0.85; // Slightly short: reduce next WW by 15%
  }
  if (napDurationMinutes < 60) {
    return 0.90; // One cycle: reduce next WW by 10%
  }
  return 1.0;
}

/**
 * Calculate suggested nap time (legacy function - returns Date only).
 * For new code, use calculateSuggestedNapTimeWithMetadata.
 */
export function calculateSuggestedNapTime(
  dateOfBirth: string,
  lastWakeTime: string,
  lastNapDurationMinutes: number | null,
  napIndex: NapIndex = 'second'
): Date {
  let suggestedWindowMinutes = getProgressiveWakeWindow(dateOfBirth, napIndex);

  if (lastNapDurationMinutes !== null) {
    const compensation = getShortNapCompensation(lastNapDurationMinutes);
    suggestedWindowMinutes = Math.round(suggestedWindowMinutes * compensation);
  }

  const wakeTime = parseISO(lastWakeTime);
  return new Date(wakeTime.getTime() + suggestedWindowMinutes * 60 * 1000);
}

/**
 * Calculate suggested nap time with full prediction metadata.
 * AAA Dynamic Prediction System with:
 * - Exponential decay weighting (60% today, 40% historical)
 * - Short nap penalty (20% reduction for non-restorative naps)
 * - Calibration state detection
 * - First nap of day adjustment
 *
 * @param dateOfBirth - Baby's date of birth
 * @param lastWakeTime - Time when baby last woke up
 * @param lastNapDurationMinutes - Duration of last nap (null if first nap of day)
 * @param napIndex - Which nap of the day this is
 * @param historicalWakeWindows - Array of historical wake windows (most recent first)
 * @param todaysWakeWindowCount - Number of wake windows from today
 * @param totalEntriesCount - Total sleep entries in history
 */
export function calculateSuggestedNapTimeWithMetadata(
  dateOfBirth: string,
  lastWakeTime: string,
  lastNapDurationMinutes: number | null,
  napIndex: NapIndex = 'second',
  historicalWakeWindows: number[] = [],
  todaysWakeWindowCount: number = 0,
  totalEntriesCount: number = 0
): NapPrediction {
  const config = getSleepConfigForAge(dateOfBirth);

  // Determine if this is the first nap of the day
  const isFirstNapOfDay = napIndex === 'first';

  // Get base wake window for this nap position
  let baseWindowMinutes = getProgressiveWakeWindow(dateOfBirth, napIndex);

  // A. Exponential Decay Weighting - apply if we have historical data
  if (historicalWakeWindows.length > 0) {
    const weightedAverage = calculateWeightedWakeWindowAverage(
      historicalWakeWindows,
      todaysWakeWindowCount
    );

    // Blend base window with weighted historical average (70% config, 30% learned)
    // This prevents wild swings while still adapting
    if (weightedAverage > 0) {
      baseWindowMinutes = Math.round(baseWindowMinutes * 0.7 + weightedAverage * 0.3);
    }
  }

  // B. Short Nap Penalty - if previous nap was non-restorative
  if (lastNapDurationMinutes !== null) {
    const compensation = getShortNapCompensation(lastNapDurationMinutes);
    baseWindowMinutes = Math.round(baseWindowMinutes * compensation);
  }

  // D. First Nap of Day Adjustment - use shorter window
  // First wake window is naturally shorter as baby is less fatigued
  if (isFirstNapOfDay && napIndex === 'first') {
    // Already handled by getProgressiveWakeWindow returning config.wakeWindows.first
    // But ensure we're using the first window, not mid
    baseWindowMinutes = Math.min(baseWindowMinutes, config.wakeWindows.first);
  }

  // Calculate predicted time
  const wakeTime = parseISO(lastWakeTime);
  const predictedTime = new Date(wakeTime.getTime() + baseWindowMinutes * 60 * 1000);

  // C. Calculate calibration state
  const calibrationState = determineCalibrationState(
    totalEntriesCount,
    historicalWakeWindows.slice(0, todaysWakeWindowCount),
    config.wakeWindows.mid
  );

  // Calculate confidence score
  const todayVariability =
    todaysWakeWindowCount > 1
      ? calculateStandardDeviation(historicalWakeWindows.slice(0, todaysWakeWindowCount)) /
        config.wakeWindows.mid
      : 0;

  const confidenceScore = calculateConfidenceScore(totalEntriesCount, todayVariability);

  // Mark as calibrating for first nap of day if no morning activity yet
  const isFirstNapCalibrating = isFirstNapOfDay && todaysWakeWindowCount === 0;

  return {
    predictedTime,
    confidenceScore: isFirstNapCalibrating ? confidenceScore * 0.8 : confidenceScore,
    isCalibrating: calibrationState.isCalibrating || isFirstNapCalibrating,
    calibrationReason: isFirstNapCalibrating
      ? 'first_nap_of_day'
      : calibrationState.reason,
  };
}

export interface DailySchedule {
  wakeTime: { hour: number; minute: number };
  bedtimeWindow: {
    earliest: { hour: number; minute: number };
    latest: { hour: number; minute: number };
  };
  numberOfNaps: number;
  isRegressionPeriod: boolean;
  regressionType?: '4-month' | '8-month';
}

/**
 * Extract wake windows from sleep entries for adaptive prediction.
 * Returns wake windows sorted by recency (most recent first).
 *
 * @param entries - Sleep entries to analyze
 * @param maxDays - Maximum days of history to consider (default 7)
 */
export function extractWakeWindowsFromEntries(
  entries: { startTime: string; endTime: string | null; type: 'nap' | 'night' }[],
  maxDays: number = 7
): { wakeWindows: number[]; todaysCount: number } {
  const now = new Date();
  const cutoffDate = subDays(startOfDay(now), maxDays);

  // Filter and sort entries by start time (most recent first)
  const relevantEntries = entries
    .filter((e) => {
      const start = parseISO(e.startTime);
      return start >= cutoffDate && e.endTime !== null;
    })
    .sort((a, b) => parseISO(b.startTime).getTime() - parseISO(a.startTime).getTime());

  const wakeWindows: number[] = [];
  let todaysCount = 0;

  // Calculate wake windows between consecutive sleep periods
  for (let i = 0; i < relevantEntries.length - 1; i++) {
    const currentEntry = relevantEntries[i];
    const nextEntry = relevantEntries[i + 1]; // This is actually the previous entry in time

    if (nextEntry.endTime) {
      const currentStart = parseISO(currentEntry.startTime);
      const previousEnd = parseISO(nextEntry.endTime);

      // Only count if same day or reasonable gap (< 12 hours for night sleep)
      const gapMinutes = differenceInMinutes(currentStart, previousEnd);

      if (gapMinutes > 0 && gapMinutes < 720) {
        // Max 12 hours
        wakeWindows.push(gapMinutes);

        // Count today's wake windows
        if (isToday(currentStart)) {
          todaysCount++;
        }
      }
    }
  }

  return { wakeWindows, todaysCount };
}

export function getRecommendedSchedule(dateOfBirth: string): DailySchedule {
  const config = getSleepConfigForAge(dateOfBirth);
  return {
    wakeTime: config.defaultWakeTime,
    bedtimeWindow: {
      earliest: config.bedtime.earliest,
      latest: config.bedtime.latest,
    },
    numberOfNaps: config.targetNaps,
    isRegressionPeriod: !!config.regression,
    regressionType: config.regression?.type as '4-month' | '8-month' | undefined,
  };
}

// ============================================================================
// FULL-DAY SIMULATION ENGINE
// ============================================================================

/**
 * A projected nap in the simulated day.
 */
export interface ProjectedNap {
  /** Nap start time in minutes from midnight */
  startMinutes: number;
  /** Nap end time in minutes from midnight */
  endMinutes: number;
  /** Duration in minutes */
  durationMinutes: number;
  /** Is this a compressed micro-nap? */
  isMicroNap: boolean;
  /** Is this after the catnap cutoff (16:00)? */
  isCatnap: boolean;
  /** Nap index (0-based) */
  index: number;
  /** Wake window before this nap */
  wakeWindowBefore: number;
}

/**
 * Complete day simulation result.
 */
export interface DaySimulation {
  /** Morning wake time in minutes from midnight */
  wakeTimeMinutes: number;
  /** All projected naps */
  projectedNaps: ProjectedNap[];
  /** Calculated bedtime in minutes from midnight */
  bedtimeMinutes: number;
  /** Final wake window (last nap end → bedtime) */
  finalWakeWindow: number;
  /** Is bedtime within the ideal window? */
  bedtimeIsIdeal: boolean;
  /** Is bedtime acceptable (within latest)? */
  bedtimeIsAcceptable: boolean;
  /** Did we apply compression to fit schedule? */
  appliedCompression: boolean;
  /** Total daytime sleep in minutes */
  totalDaytimeSleep: number;
  /** Age-appropriate config used */
  config: AgeSleepConfig;
}

/** Catnap cutoff hour (naps after this are automatically short) */
const CATNAP_CUTOFF_HOUR = 16;

/**
 * Simulate a full day's sleep schedule starting from a given state.
 *
 * This is the core engine that:
 * 1. Projects all remaining naps forward
 * 2. Applies compression if bedtime would be too late
 * 3. Always ensures baby doesn't exceed max wake window
 * 4. Returns elastic bedtime based on actual schedule
 */
export function simulateDay(
  dateOfBirth: string,
  morningWakeMinutes: number,
  completedNaps: { startMinutes: number; endMinutes: number }[] = []
): DaySimulation {
  const config = getSleepConfigForAge(dateOfBirth);

  // Calculate state from completed naps
  let currentMinutes = morningWakeMinutes;
  let napCount = completedNaps.length;
  let totalSleep = 0;

  // Update current time to end of last completed nap
  if (completedNaps.length > 0) {
    const lastNap = completedNaps[completedNaps.length - 1];
    currentMinutes = lastNap.endMinutes;
    totalSleep = completedNaps.reduce((sum, n) => sum + (n.endMinutes - n.startMinutes), 0);
  }

  // Project remaining naps
  const projectedNaps: ProjectedNap[] = [];
  let appliedCompression = false;

  // Keep adding naps until we've reached target or it's bedtime
  while (napCount < config.targetNaps) {
    // Calculate wake window for this nap position
    let wakeWindow: number;
    if (napCount === 0) {
      wakeWindow = config.wakeWindows.first;
    } else if (napCount === 1) {
      wakeWindow = config.wakeWindows.mid;
    } else {
      wakeWindow = config.wakeWindows.mid;
    }

    // Apply short nap compensation if previous nap was short
    if (projectedNaps.length > 0) {
      const lastProjected = projectedNaps[projectedNaps.length - 1];
      const compensation = getShortNapCompensation(lastProjected.durationMinutes);
      wakeWindow = Math.round(wakeWindow * compensation);
    } else if (completedNaps.length > 0) {
      const lastCompleted = completedNaps[completedNaps.length - 1];
      const lastDuration = lastCompleted.endMinutes - lastCompleted.startMinutes;
      const compensation = getShortNapCompensation(lastDuration);
      wakeWindow = Math.round(wakeWindow * compensation);
    }

    // Calculate nap start time
    const napStartMinutes = currentMinutes + wakeWindow;

    // Check if this is a catnap (after 16:00)
    const isCatnap = napStartMinutes >= CATNAP_CUTOFF_HOUR * 60;

    // Determine nap duration
    let napDuration: number;
    if (isCatnap) {
      napDuration = config.napDurations.micro; // Catnaps are always short
    } else {
      napDuration = config.napDurations.standard;
    }

    // Calculate what bedtime would be after this nap
    const napEndMinutes = napStartMinutes + napDuration;
    const potentialBedtime = napEndMinutes + config.wakeWindows.final;
    const idealBedtimeMinutes = config.bedtime.ideal.hour * 60 + config.bedtime.ideal.minute;
    const latestBedtimeMinutes = config.bedtime.latest.hour * 60 + config.bedtime.latest.minute;

    // COMPRESSION LOGIC: If bedtime would be > 60 min past ideal, compress the nap
    let isMicroNap = false;
    if (potentialBedtime > idealBedtimeMinutes + 60 && !isCatnap) {
      napDuration = config.napDurations.micro;
      isMicroNap = true;
      appliedCompression = true;
    }

    // REST PRIORITY CHECK: Would skipping this nap cause too long a wake window?
    const wakeWindowIfSkipped = (latestBedtimeMinutes) - currentMinutes;
    const shouldAddNapForRest = wakeWindowIfSkipped > config.wakeWindows.max;

    // Add the nap if:
    // 1. We haven't reached target naps yet AND
    // 2. Either: nap fits reasonably OR baby needs rest (would exceed max wake window)
    if (shouldAddNapForRest || potentialBedtime <= latestBedtimeMinutes + 45) {
      projectedNaps.push({
        startMinutes: napStartMinutes,
        endMinutes: napStartMinutes + napDuration,
        durationMinutes: napDuration,
        isMicroNap,
        isCatnap,
        index: napCount,
        wakeWindowBefore: wakeWindow,
      });

      currentMinutes = napStartMinutes + napDuration;
      totalSleep += napDuration;
      napCount++;
    } else {
      // Can't fit another nap, calculate bedtime from current state
      break;
    }
  }

  // ELASTIC BEDTIME: Always = last activity end + final wake window
  const finalWakeWindow = config.wakeWindows.final;
  const bedtimeMinutes = currentMinutes + finalWakeWindow;

  // Check bedtime quality
  const idealBedtimeMinutes = config.bedtime.ideal.hour * 60 + config.bedtime.ideal.minute;
  const latestBedtimeMinutes = config.bedtime.latest.hour * 60 + config.bedtime.latest.minute;

  return {
    wakeTimeMinutes: morningWakeMinutes,
    projectedNaps,
    bedtimeMinutes,
    finalWakeWindow,
    bedtimeIsIdeal: Math.abs(bedtimeMinutes - idealBedtimeMinutes) <= 30,
    bedtimeIsAcceptable: bedtimeMinutes <= latestBedtimeMinutes + 30,
    appliedCompression,
    totalDaytimeSleep: totalSleep,
    config,
  };
}

/**
 * Calculate dynamic bedtime based on actual day's sleep.
 * Uses elastic formula: Last_nap_end + Final_wake_window
 */
export function calculateDynamicBedtime(
  dateOfBirth: string,
  lastNapEndTime: string,
  _totalDaytimeSleepMinutes: number
): Date {
  const config = getSleepConfigForAge(dateOfBirth);
  const lastNapEnd = parseISO(lastNapEndTime);

  // Elastic bedtime: last nap end + final wake window
  const bedtime = new Date(lastNapEnd.getTime() + config.wakeWindows.final * 60 * 1000);

  return bedtime;
}

// ============================================================================
// NAP WINDOWS - Enhanced with Simulation
// ============================================================================

export interface NapWindow {
  hour: number;
  minute: number;
  isCatnap: boolean;
  isMicroNap: boolean;
  napIndex: NapIndex;
  expectedDurationMinutes: number;
  wakeWindowBeforeMinutes: number;
}

/**
 * Calculate all recommended nap windows for the day using full simulation.
 * This replaces the old algorithm that had arbitrary cutoffs.
 */
export function calculateAllNapWindows(
  dateOfBirth: string,
  completedNaps: { endTime: string; durationMinutes: number }[] = []
): NapWindow[] {
  const config = getSleepConfigForAge(dateOfBirth);

  // Convert completed naps to simulation format
  const wakeTimeMinutes = config.defaultWakeTime.hour * 60 + config.defaultWakeTime.minute;

  // Build completed naps in minutes format
  const completedInMinutes: { startMinutes: number; endMinutes: number }[] = [];

  for (const nap of completedNaps) {
    const endTime = parseISO(nap.endTime);
    const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();
    const startMinutes = endMinutes - nap.durationMinutes;

    completedInMinutes.push({ startMinutes, endMinutes });
  }

  // Run simulation
  const simulation = simulateDay(dateOfBirth, wakeTimeMinutes, completedInMinutes);

  // Convert projected naps to NapWindow format
  return simulation.projectedNaps.map((nap) => {
    const napIndex: NapIndex =
      nap.index === 0 ? 'first' : nap.index === 1 ? 'second' : 'third_plus';

    return {
      hour: Math.floor(nap.startMinutes / 60),
      minute: nap.startMinutes % 60,
      isCatnap: nap.isCatnap,
      isMicroNap: nap.isMicroNap,
      napIndex,
      expectedDurationMinutes: nap.durationMinutes,
      wakeWindowBeforeMinutes: nap.wakeWindowBefore,
    };
  });
}

// ============================================================================
// NIGHT WAKE-UP PREDICTION
// ============================================================================

/**
 * Predict when baby will wake up from night sleep.
 *
 * Uses a hybrid approach:
 * - If >= 3 completed nights in last 7 days: average duration → bedtimeStart + avgDuration
 * - Otherwise: age-based defaultWakeTime applied to today's date
 *
 * @returns predicted wake time and the source used for the prediction
 */
export function getExpectedNightWakeTime(
  bedtimeStart: string,
  dateOfBirth: string,
  entries: { startTime: string; endTime: string | null; type: 'nap' | 'night' }[]
): { predictedWakeTime: Date; source: 'historical' | 'age-based' } {
  const bedtimeDate = parseISO(bedtimeStart);
  const cutoff = subDays(startOfDay(new Date()), 7);

  // Collect last 7 completed night entries
  const completedNights = entries
    .filter((e) => {
      if (e.type !== 'night' || !e.endTime) return false;
      const start = parseISO(e.startTime);
      return start >= cutoff;
    })
    .sort((a, b) => parseISO(b.startTime).getTime() - parseISO(a.startTime).getTime())
    .slice(0, 7);

  // Historical average if we have enough data
  if (completedNights.length >= 3) {
    const totalMinutes = completedNights.reduce((sum, e) => {
      return sum + differenceInMinutes(parseISO(e.endTime!), parseISO(e.startTime));
    }, 0);
    const avgMinutes = Math.round(totalMinutes / completedNights.length);
    return {
      predictedWakeTime: fnsAddMinutes(bedtimeDate, avgMinutes),
      source: 'historical',
    };
  }

  // Age-based fallback: use defaultWakeTime for today
  const config = getSleepConfigForAge(dateOfBirth);
  const today = new Date();
  const wakeTime = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    config.defaultWakeTime.hour,
    config.defaultWakeTime.minute
  );

  return { predictedWakeTime: wakeTime, source: 'age-based' };
}
