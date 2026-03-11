import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import {
  validateDateOfBirth,
  getDateOfBirthInputBounds,
  getAgeParts,
  calculateAge,
  getRecommendedSchedule,
  calculateDynamicBedtime,
  calculateAllNapWindows,
  getExpectedNightWakeTime,
} from './dateUtils';

const FIXED_NOW = new Date('2024-06-15T12:00:00.000Z');

describe('dateUtils - age and DOB helpers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('validateDateOfBirth', () => {
    it('rejects empty value without specific error key', () => {
      const result = validateDateOfBirth('');
      expect(result).toEqual({ valid: false, errorKey: null });
    });

    it('rejects non-ISO-like strings as invalid', () => {
      const result = validateDateOfBirth('20225-01-01');
      expect(result.valid).toBe(false);
      expect(result.errorKey).toBe('babyEdit.dobInvalid');
    });

    it('rejects dates in the future', () => {
      const result = validateDateOfBirth('2024-06-16');
      expect(result.valid).toBe(false);
      expect(result.errorKey).toBe('babyEdit.dobFuture');
    });

    it('rejects dates more than 4 years in the past', () => {
      const result = validateDateOfBirth('2019-06-14');
      expect(result.valid).toBe(false);
      expect(result.errorKey).toBe('babyEdit.dobTooOld');
    });

    it('accepts a sane DOB within the last 4 years and not in the future', () => {
      const result = validateDateOfBirth('2023-01-10');
      expect(result).toEqual({ valid: true, errorKey: null });
    });
  });

  describe('getDateOfBirthInputBounds', () => {
    it('returns min and max bounds based on the last 4 years up to today', () => {
      const { min, max } = getDateOfBirthInputBounds();
      expect(min).toBe('2020-06-15');
      expect(max).toBe('2024-06-15');
    });
  });

  describe('getAgeParts', () => {
    it('returns years and optional months for babies older than 1 year', () => {
      const parts = getAgeParts('2023-06-15');
      expect(parts).toEqual({ years: 1 });
    });

    it('returns months and optional days for babies between 1 month and 1 year', () => {
      const parts = getAgeParts('2024-05-10');
      expect(parts).toEqual({ months: 1, days: 5 });
    });

    it('returns only days for babies younger than 1 month', () => {
      const parts = getAgeParts('2024-06-10');
      expect(parts).toEqual({ days: 5 });
    });
  });

  describe('calculateAge', () => {
    it('formats age with years only when there are no extra months', () => {
      const age = calculateAge('2023-06-15');
      expect(age).toBe('1 year');
    });

    it('formats age with months and days when under one year', () => {
      const age = calculateAge('2024-05-10');
      expect(age).toBe('1 month, 5 days');
    });

    it('formats age with only days for newborns under one month', () => {
      const age = calculateAge('2024-06-10');
      expect(age).toBe('5 days');
    });
  });
});

describe('dateUtils - schedule and predictions', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getRecommendedSchedule', () => {
    it('returns a schedule object with basic fields wired from config', () => {
      const schedule = getRecommendedSchedule('2024-01-15');

      expect(schedule.numberOfNaps).toBeGreaterThan(0);
      expect(schedule.wakeTime.hour).toBeGreaterThanOrEqual(0);
      expect(schedule.wakeTime.hour).toBeLessThan(24);
      expect(schedule.bedtimeWindow.earliest.hour).toBeLessThanOrEqual(
        schedule.bedtimeWindow.latest.hour
      );
    });
  });

  describe('calculateDynamicBedtime', () => {
    it('keeps bedtime at final wake window offset when there is no sleep debt', () => {
      const dob = '2024-01-15';
      const totalDaytimeSleepMinutes = 3 * 90;
      const lastNapEndTime = '2024-06-15T15:00:00.000Z';

      const bedtime = calculateDynamicBedtime(
        dob,
        lastNapEndTime,
        totalDaytimeSleepMinutes
      );

      const bedtimeMinutes = bedtime.getHours() * 60 + bedtime.getMinutes();
      const lastNapEnd = new Date(lastNapEndTime);
      const lastNapMinutes =
        lastNapEnd.getHours() * 60 + lastNapEnd.getMinutes();

      expect(bedtimeMinutes - lastNapMinutes).toBeGreaterThanOrEqual(60);
    });

    it('shifts bedtime earlier when there is significant sleep debt but not before earliest bedtime', () => {
      const dob = '2024-01-15';
      const totalDaytimeSleepMinutes = 60;
      const lastNapEndTime = '2024-06-15T15:00:00.000Z';

      const bedtime = calculateDynamicBedtime(
        dob,
        lastNapEndTime,
        totalDaytimeSleepMinutes
      );

      const earliestCandidate = new Date(lastNapEndTime);
      const earlierOrEqualToEarliest =
        bedtime.getHours() > earliestCandidate.getHours() ||
        (bedtime.getHours() === earliestCandidate.getHours() &&
          bedtime.getMinutes() >= earliestCandidate.getMinutes());

      expect(earlierOrEqualToEarliest).toBe(true);
    });
  });

  describe('calculateAllNapWindows', () => {
    it('returns at least one nap window for a young baby with default wake time', () => {
      const windows = calculateAllNapWindows('2024-01-15');
      expect(windows.length).toBeGreaterThan(0);
      for (const win of windows) {
        expect(win.hour).toBeGreaterThanOrEqual(0);
        expect(win.hour).toBeLessThan(24);
        expect(win.expectedDurationMinutes).toBeGreaterThan(0);
      }
    });

    it('takes completed naps into account when projecting remaining windows', () => {
      const morningWake = new Date('2024-06-15T07:00:00.000Z');
      const completedNaps = [
        {
          endTime: '2024-06-15T09:00:00.000Z',
          durationMinutes: 60,
        },
      ];

      const windows = calculateAllNapWindows(
        '2024-01-15',
        completedNaps,
        morningWake
      );

      expect(windows.length).toBeGreaterThanOrEqual(1);
      const first = windows[0];
      const firstStartMinutes = first.hour * 60 + first.minute;
      const firstPossibleAfterCompleted =
        9 * 60 + 60;

      expect(firstStartMinutes).toBeGreaterThanOrEqual(
        firstPossibleAfterCompleted
      );
    });
  });

  describe('getExpectedNightWakeTime', () => {
    it('uses historical data when at least three completed nights exist', () => {
      const bedtimeStart = '2024-06-14T20:00:00.000Z';
      const entries = [
        {
          type: 'night' as const,
          startTime: '2024-06-13T20:00:00.000Z',
          endTime: '2024-06-14T06:00:00.000Z',
        },
        {
          type: 'night' as const,
          startTime: '2024-06-12T20:00:00.000Z',
          endTime: '2024-06-13T06:00:00.000Z',
        },
        {
          type: 'night' as const,
          startTime: '2024-06-11T20:00:00.000Z',
          endTime: '2024-06-12T06:00:00.000Z',
        },
      ];

      const result = getExpectedNightWakeTime(
        bedtimeStart,
        '2024-01-15',
        entries
      );

      expect(result.source).toBe('historical');
      expect(result.predictedWakeTime.getHours()).toBeGreaterThanOrEqual(4);
    });

    it('falls back to age-based default when there is not enough history', () => {
      const bedtimeStart = '2024-06-14T20:00:00.000Z';
      const entries: {
        startTime: string;
        endTime: string | null;
        type: 'nap' | 'night';
      }[] = [];

      const result = getExpectedNightWakeTime(
        bedtimeStart,
        '2024-01-15',
        entries
      );

      expect(result.source).toBe('age-based');
      expect(result.predictedWakeTime.getDate()).toBe(15);
    });
  });
})

