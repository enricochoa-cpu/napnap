// src/data/sleepGuideContent.test.ts
import { describe, it, expect } from 'vitest';
import { SLEEP_GUIDE_CONFIGS, getGuideBySlug, GUIDE_SLUGS } from './sleepGuideContent';

describe('sleepGuideContent', () => {
  it('has exactly 17 guide configs', () => {
    expect(SLEEP_GUIDE_CONFIGS).toHaveLength(17);
  });

  it('covers all expected age values in order', () => {
    const months = SLEEP_GUIDE_CONFIGS.map((g) => g.ageMonths);
    expect(months).toEqual([0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 18, 24]);
  });

  it('has unique slugs', () => {
    const slugs = SLEEP_GUIDE_CONFIGS.map((g) => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('slugs follow valid patterns (N-month-old, week-N, or N-year-old)', () => {
    const validPattern = /^(\d+-month-old|week-\d+|\d+-year-old)$/;
    for (const config of SLEEP_GUIDE_CONFIGS) {
      expect(config.slug).toMatch(validPattern);
    }
  });

  it('each config has required content sections', () => {
    for (const config of SLEEP_GUIDE_CONFIGS) {
      expect(config.sections.length).toBeGreaterThanOrEqual(2);
      expect(config.tips.length).toBeGreaterThanOrEqual(3);
      expect(config.sampleSchedule.length).toBeGreaterThanOrEqual(3);
      expect(config.metaDescription.length).toBeGreaterThan(50);
    }
  });

  it('regression is set for months 4, 8, 12, 18, and 24 only', () => {
    const withRegression = SLEEP_GUIDE_CONFIGS.filter((g) => g.regression);
    const regressionMonths = withRegression.map((g) => g.ageMonths);
    expect(regressionMonths).toEqual([4, 8, 12, 18, 24]);
  });

  it('newborn and toddler guides have displayLabel set', () => {
    const newbornGuides = SLEEP_GUIDE_CONFIGS.filter((g) => g.ageMonths < 3);
    const toddlerGuides = SLEEP_GUIDE_CONFIGS.filter((g) => g.ageMonths > 12);
    for (const guide of [...newbornGuides, ...toddlerGuides]) {
      expect(guide.displayLabel).toBeDefined();
      expect(guide.displayLabel!.length).toBeGreaterThan(0);
    }
  });

  it('newborn and toddler guides have ageLabel set', () => {
    const newbornGuides = SLEEP_GUIDE_CONFIGS.filter((g) => g.ageMonths < 3);
    const toddlerGuides = SLEEP_GUIDE_CONFIGS.filter((g) => g.ageMonths > 12);
    for (const guide of [...newbornGuides, ...toddlerGuides]) {
      expect(guide.ageLabel).toBeDefined();
      expect(guide.ageLabel!.length).toBeGreaterThan(0);
    }
  });

  it('getGuideBySlug returns correct config', () => {
    const guide = getGuideBySlug('6-month-old');
    expect(guide?.ageMonths).toBe(6);
  });

  it('getGuideBySlug works for newborn and toddler slugs', () => {
    expect(getGuideBySlug('week-1')?.ageMonths).toBe(0);
    expect(getGuideBySlug('week-2')?.ageMonths).toBe(0);
    expect(getGuideBySlug('2-year-old')?.ageMonths).toBe(24);
  });

  it('getGuideBySlug returns undefined for unknown slug', () => {
    expect(getGuideBySlug('99-month-old')).toBeUndefined();
  });

  it('GUIDE_SLUGS matches config order', () => {
    expect(GUIDE_SLUGS).toEqual(SLEEP_GUIDE_CONFIGS.map((g) => g.slug));
  });

  it('sample schedules end with bedtime', () => {
    for (const config of SLEEP_GUIDE_CONFIGS) {
      expect(config.sampleSchedule[config.sampleSchedule.length - 1].type).toBe('bedtime');
    }
  });
});
