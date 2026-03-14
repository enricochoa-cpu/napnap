// src/data/sleepGuideContent.test.ts
import { describe, it, expect } from 'vitest';
import { SLEEP_GUIDE_CONFIGS, getGuideBySlug, GUIDE_SLUGS } from './sleepGuideContent';

describe('sleepGuideContent', () => {
  it('has exactly 10 guide configs', () => {
    expect(SLEEP_GUIDE_CONFIGS).toHaveLength(10);
  });

  it('covers months 3 through 12', () => {
    const months = SLEEP_GUIDE_CONFIGS.map((g) => g.ageMonths);
    expect(months).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it('has unique slugs', () => {
    const slugs = SLEEP_GUIDE_CONFIGS.map((g) => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('slugs follow the pattern N-month-old', () => {
    for (const config of SLEEP_GUIDE_CONFIGS) {
      expect(config.slug).toBe(`${config.ageMonths}-month-old`);
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

  it('regression is set for months 4, 8, and 12 only', () => {
    const withRegression = SLEEP_GUIDE_CONFIGS.filter((g) => g.regression);
    const regressionMonths = withRegression.map((g) => g.ageMonths);
    expect(regressionMonths).toEqual([4, 8, 12]);
  });

  it('getGuideBySlug returns correct config', () => {
    const guide = getGuideBySlug('6-month-old');
    expect(guide?.ageMonths).toBe(6);
  });

  it('getGuideBySlug returns undefined for unknown slug', () => {
    expect(getGuideBySlug('99-month-old')).toBeUndefined();
  });

  it('GUIDE_SLUGS matches config order', () => {
    expect(GUIDE_SLUGS).toEqual(SLEEP_GUIDE_CONFIGS.map((g) => g.slug));
  });

  it('sample schedules start with wake and end with bedtime', () => {
    for (const config of SLEEP_GUIDE_CONFIGS) {
      expect(config.sampleSchedule[0].type).toBe('wake');
      expect(config.sampleSchedule[config.sampleSchedule.length - 1].type).toBe('bedtime');
    }
  });
});
