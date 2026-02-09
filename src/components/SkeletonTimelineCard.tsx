/**
 * Skeleton loading cards that match the exact dimensions of Compact Cards
 * to prevent layout shift during loading.
 *
 * Card height: ~48px (py-2.5 = 10px top + 10px bottom + 28px content)
 */

interface SkeletonTimelineCardProps {
  variant?: 'nap' | 'night' | 'wake';
}

export function SkeletonTimelineCard({ variant = 'nap' }: SkeletonTimelineCardProps) {
  const colors = {
    nap: 'bg-[var(--nap-color)]/10',
    night: 'bg-[var(--night-color)]/10',
    wake: 'bg-[var(--wake-color)]/10',
  };

  const iconColors = {
    nap: 'bg-[var(--nap-color)]/20',
    night: 'bg-[var(--night-color)]/20',
    wake: 'bg-[var(--wake-color)]/20',
  };

  return (
    <div className={`relative ${colors[variant]} py-2.5 px-4 flex items-center gap-3 rounded-xl animate-pulse`}>
      {/* Icon placeholder */}
      <div className={`w-10 h-10 rounded-full ${iconColors[variant]} flex-shrink-0`} />

      {/* Text placeholders */}
      <div className="flex-1 min-w-0">
        <div className="h-2.5 w-16 bg-[var(--text-muted)]/15 rounded mb-2" />
        <div className="h-4 w-28 bg-[var(--text-muted)]/15 rounded" />
      </div>

      {/* Duration placeholder */}
      <div className="h-3.5 w-12 bg-[var(--text-muted)]/15 rounded" />
    </div>
  );
}

/**
 * Full skeleton layout for TodayView timeline
 */
export function SkeletonTimeline() {
  return (
    <div className="space-y-2">
      {/* Predicted bedtime skeleton */}
      <SkeletonTimelineCard variant="night" />

      {/* Predicted nap skeletons */}
      <SkeletonTimelineCard variant="nap" />
      <SkeletonTimelineCard variant="nap" />

      {/* Wake up skeleton */}
      <SkeletonTimelineCard variant="wake" />
    </div>
  );
}

/**
 * Hero section skeleton for countdown
 */
export function SkeletonHero() {
  return (
    <div className="text-center animate-pulse">
      {/* Label */}
      <div className="h-3 w-20 bg-[var(--text-muted)]/15 rounded mx-auto mb-3" />

      {/* Big countdown number */}
      <div className="h-12 w-32 bg-[var(--text-muted)]/15 rounded-lg mx-auto mb-3" />

      {/* Secondary text */}
      <div className="h-3.5 w-28 bg-[var(--text-muted)]/15 rounded mx-auto" />
    </div>
  );
}
