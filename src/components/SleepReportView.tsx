/**
 * Sleep Report view: narrative report with Overview, Summary table,
 * Bedtime & wake times, Patterns, and What to try (from .context/sleep-report-prd.md).
 * Report always uses the last 30 days of data so parents see a precise, recent picture.
 */

import { useMemo } from 'react';
import { startOfDay, subDays } from 'date-fns';
import type { SleepEntry } from '../types';
import type { BabyProfile } from '../types';
import {
  getReportData,
  formatMinutesToHours,
  getBedtimeCopy,
  getWakeUpCopy,
  getPatternsCopy,
} from '../utils/reportData';

const REPORT_CAP_DAYS = 30;

interface SleepReportViewProps {
  entries: SleepEntry[];
  profile: BabyProfile | null;
  onBack: () => void;
}

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const MoonIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);
const SunIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);
const PatternIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18" />
    <path d="M7 16v-5M12 16v-8M17 16v-2" />
  </svg>
);
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const BULLET_LIST_CLASS = 'space-y-2 leading-relaxed text-sm text-[var(--text-primary)]';
function ReportBulletItem({ icon: Icon, children }: { icon: React.ComponentType; children: React.ReactNode }) {
  return (
    <li className="flex gap-2 items-start">
      <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center" style={{ color: 'var(--night-color)' }} aria-hidden>
        <Icon />
      </span>
      <span className="flex-1">{children}</span>
    </li>
  );
}

export function SleepReportView({
  entries,
  profile,
  onBack,
}: SleepReportViewProps) {
  const data = useMemo(() => {
    const today = startOfDay(new Date());
    const reportEndDate = today;
    const reportStartDate = subDays(today, REPORT_CAP_DAYS - 1);
    const filteredEntries = entries.filter((e) => {
      const t = new Date(e.startTime).getTime();
      return t >= reportStartDate.getTime() && t <= reportEndDate.getTime() + 86400000;
    });
    return getReportData(filteredEntries, reportStartDate, reportEndDate, profile);
  }, [entries, profile]);

  const patternsLines = useMemo(() => getPatternsCopy(data), [data]);

  const isEmpty = !data.flags.hasEnoughData;

  const overviewCopy = useMemo(() => {
    const name = data.babyName;
    if (!data.ageLabel) {
      return `This is ${name}'s sleep so far. Here's what we're seeing.`;
    }
    const pronoun = profile?.gender === 'male' ? "He's" : profile?.gender === 'female' ? "She's" : "They're";
    return `This is ${name}'s sleep so far. ${pronoun} ${data.ageLabel} — here's what we're seeing.`;
  }, [data.babyName, data.ageLabel, profile?.gender]);

  return (
    <div className="pb-32 px-6 fade-in">
      {/* Header with Back */}
      <div className="pt-6 pb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center w-10 h-10 rounded-full text-[var(--text-primary)] hover:bg-[var(--bg-soft)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--night-color)]"
          aria-label="Back to trends"
        >
          <BackIcon />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-display font-bold text-[var(--text-primary)]">
            Sleep report
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Last 30 days
          </p>
        </div>
      </div>

      {isEmpty ? (
        <div
          className="rounded-3xl backdrop-blur-xl p-8 text-center"
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--nap-color)]/20 flex items-center justify-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--nap-color)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
              <path d="M16 13H8" />
              <path d="M16 17H8" />
              <path d="M10 9H8" />
            </svg>
          </div>
          <h2 className="text-lg font-display font-semibold text-[var(--text-primary)] mb-2">
            Not enough data yet
          </h2>
          <p className="text-[var(--text-muted)] text-sm">
            Log a few more days of sleep to see your first report.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overview */}
          <section
            className="rounded-2xl backdrop-blur-xl p-4"
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h2 className="text-sm font-display font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">
              Overview
            </h2>
            <p className="text-[var(--text-primary)]">
              {overviewCopy}
            </p>
            <p className="text-sm text-[var(--text-muted)] mt-2">
              Based on the last 30 days of logs.
            </p>
          </section>

          {/* Summary table */}
          <section
            className="rounded-2xl backdrop-blur-xl p-4"
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h2 className="text-sm font-display font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">
              Summary
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-[var(--text-muted)] font-display">Avg. total sleep</p>
                <p className="text-lg font-display font-semibold text-[var(--text-primary)]">
                  {formatMinutesToHours(data.averages.avgTotal)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)] font-display">Avg. naps per day</p>
                <p className="text-lg font-display font-semibold text-[var(--text-primary)]">
                  {data.averages.avgNapCount.toFixed(1)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)] font-display">Avg. nap length</p>
                <p className="text-lg font-display font-semibold text-[var(--nap-color)]">
                  {formatMinutesToHours(data.averages.avgNapDuration)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)] font-display">Avg. night sleep</p>
                <p className="text-lg font-display font-semibold text-[var(--night-color)]">
                  {formatMinutesToHours(data.averages.avgNight)}
                </p>
              </div>
            </div>
          </section>

          {/* Bedtime & wake times — bullets with icons, same line height as other sections */}
          <section
            className="rounded-2xl backdrop-blur-xl p-4"
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h2 className="text-sm font-display font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">
              Bedtime & wake times
            </h2>
            <ul className={BULLET_LIST_CLASS}>
              <ReportBulletItem icon={MoonIcon}>{getBedtimeCopy(data)}</ReportBulletItem>
              <ReportBulletItem icon={SunIcon}>{getWakeUpCopy(data)}</ReportBulletItem>
            </ul>
          </section>

          {/* Patterns we're seeing */}
          {patternsLines.length > 0 && (
            <section
              className="rounded-2xl backdrop-blur-xl p-4"
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h2 className="text-sm font-display font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">
                Patterns we’re seeing
              </h2>
              <ul className={BULLET_LIST_CLASS}>
                {patternsLines.map((line, i) => (
                  <ReportBulletItem key={i} icon={PatternIcon}>{line}</ReportBulletItem>
                ))}
              </ul>
            </section>
          )}

          {/* What to try — same bullet style and line height as Bedtime & Patterns (icon from design system: night-color) */}
          {data.tips.length > 0 && (
            <section
              className="rounded-2xl backdrop-blur-xl p-4"
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h2 className="text-sm font-display font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">
                What to try
              </h2>
              <ul className={BULLET_LIST_CLASS}>
                {data.tips.map((tip) => (
                  <ReportBulletItem key={tip.id} icon={CheckIcon}>{tip.copy}</ReportBulletItem>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
