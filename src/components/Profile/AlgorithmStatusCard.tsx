import { useState } from 'react';
import { getAlgorithmStatusTier, type AlgorithmStatusTier } from '../../utils/dateUtils';

export interface AlgorithmStatusProps {
  totalEntries: number;
  isHighVariability: boolean;
  babyName?: string;
}

// Brain/neural network icon for header
const BrainIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04" />
  </svg>
);

// Baby bottle icon for Learning stage
const BottleIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 2v4" />
    <path d="M14 2v4" />
    <path d="M17 6H7a2 2 0 0 0-2 2v10a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4V8a2 2 0 0 0-2-2Z" />
    <path d="M5 10h14" />
  </svg>
);

// Teddy bear icon for Calibrating stage
const TeddyIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="6" cy="6" r="2" />
    <circle cx="18" cy="6" r="2" />
    <path d="M12 19c-3.314 0-6-2.239-6-5s2.686-5 6-5 6 2.239 6 5-2.686 5-6 5Z" />
    <circle cx="9.5" cy="12" r="1" fill="currentColor" />
    <circle cx="14.5" cy="12" r="1" fill="currentColor" />
    <path d="M9 16c.83.67 1.83 1 3 1s2.17-.33 3-1" />
  </svg>
);

// Magic wand icon for Optimised stage
const WandIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 4V2" />
    <path d="M15 16v-2" />
    <path d="M8 9h2" />
    <path d="M20 9h2" />
    <path d="M17.8 11.8 19 13" />
    <path d="M15 9h.01" />
    <path d="M17.8 6.2 19 5" />
    <path d="m3 21 9-9" />
    <path d="M12.2 6.2 11 5" />
  </svg>
);

// Chevron icon for accordion
const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// Warning icon for variability
const AlertIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

// Status tier configuration
const STATUS_CONFIG: Record<
  AlgorithmStatusTier,
  {
    title: string;
    description: string;
    icon: React.ReactNode;
  }
> = {
  learning: {
    title: 'Learning',
    description: "We're starting to understand your baby's basic sleep patterns.",
    icon: <BottleIcon />,
  },
  calibrating: {
    title: 'Calibrating',
    description: "Fine-tuning wake windows based on recency and individual patterns.",
    icon: <TeddyIcon />,
  },
  optimized: {
    title: 'Optimised',
    description: "The algorithm is fully calibrated and learns from every daily change.",
    icon: <WandIcon />,
  },
};

const TIER_ORDER: AlgorithmStatusTier[] = ['learning', 'calibrating', 'optimized'];

interface TimelineStepProps {
  tier: AlgorithmStatusTier;
  currentTier: AlgorithmStatusTier;
  label: string;
  icon: React.ReactNode;
}

function TimelineStep({ tier, currentTier, label, icon }: TimelineStepProps) {
  const tierIndex = TIER_ORDER.indexOf(tier);
  const currentIndex = TIER_ORDER.indexOf(currentTier);
  const isActive = tierIndex <= currentIndex;
  const isCurrent = tier === currentTier;

  return (
    <div className="flex flex-col items-center z-10">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
          isActive
            ? isCurrent
              ? 'bg-[var(--nap-color)] text-[var(--bg-deep)] shadow-[0_0_12px_var(--nap-color)]'
              : 'bg-[var(--nap-color)]/80 text-[var(--bg-deep)]'
            : 'bg-[var(--bg-soft)] text-[var(--text-muted)]/50 border border-[var(--text-muted)]/20'
        }`}
      >
        {icon}
      </div>
      <span
        className={`mt-2 text-xs font-display transition-all duration-300 ${
          isCurrent ? 'text-[var(--nap-color)] font-semibold' : 'text-[var(--text-muted)]'
        }`}
      >
        {label}
      </span>
    </div>
  );
}

export function AlgorithmStatusCard({
  totalEntries,
  isHighVariability,
  babyName,
}: AlgorithmStatusProps) {
  const [isEducationOpen, setIsEducationOpen] = useState(false);
  const currentTier = getAlgorithmStatusTier(totalEntries);
  const config = STATUS_CONFIG[currentTier];

  // Calculate progress for the progress line (centered between icons)
  const getProgressPercentage = () => {
    if (currentTier === 'learning') {
      return 0;
    } else if (currentTier === 'calibrating') {
      return 50;
    }
    return 100;
  };

  return (
    <div className="card p-6 space-y-5">
      {/* Header with icon */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-[var(--nap-color)]/20 flex items-center justify-center flex-shrink-0 text-[var(--nap-color)]">
          <BrainIcon />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-[var(--text-primary)] text-lg">
            Our Relationship
          </h3>
          <p className="text-sm text-[var(--text-muted)]">
            {totalEntries} {totalEntries === 1 ? 'entry' : 'entries'} logged
          </p>
        </div>
      </div>

      {/* Timeline progress indicator */}
      <div className="relative pt-2 pb-1">
        {/* Progress line background - positioned to connect circle centers */}
        <div className="absolute top-[22px] left-[calc(2.5rem+0.5rem)] right-[calc(2.5rem+0.5rem)] h-[3px] bg-[var(--text-muted)]/15 rounded-full" />
        {/* Progress line fill */}
        <div
          className="absolute top-[22px] left-[calc(2.5rem+0.5rem)] h-[3px] bg-[var(--nap-color)] rounded-full transition-all duration-500"
          style={{ width: `calc(${getProgressPercentage()}% - ${getProgressPercentage() > 0 ? '3rem' : '0rem'})` }}
        />

        {/* Timeline steps with icons */}
        <div className="relative flex justify-between px-2">
          <TimelineStep
            tier="learning"
            currentTier={currentTier}
            label="Learning"
            icon={STATUS_CONFIG.learning.icon}
          />
          <TimelineStep
            tier="calibrating"
            currentTier={currentTier}
            label="Calibrating"
            icon={STATUS_CONFIG.calibrating.icon}
          />
          <TimelineStep
            tier="optimized"
            currentTier={currentTier}
            label="Optimised"
            icon={STATUS_CONFIG.optimized.icon}
          />
        </div>
      </div>

      {/* Status description */}
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{config.description}</p>

      {/* High variability warning */}
      {isHighVariability && (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--wake-color)]/10 border-l-[3px] border-[var(--wake-color)]">
          <div className="text-[var(--wake-color)] flex-shrink-0 mt-0.5">
            <AlertIcon />
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            <span className="font-semibold text-[var(--wake-color)]">Note:</span> We're currently
            detecting high variability in{babyName ? ` ${babyName}'s` : ' your baby\'s'} sleep
            patterns. The algorithm is prioritising recent data to adapt.
          </p>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-[var(--text-muted)]/20" />

      {/* Educational accordion */}
      <div>
        <button
          onClick={() => setIsEducationOpen(!isEducationOpen)}
          className="w-full flex items-center justify-between gap-4 text-left transition-colors"
          aria-expanded={isEducationOpen}
        >
          <span className="font-display font-medium text-[var(--text-primary)] text-[15px]">
            How NapNap works
          </span>
          <span className="flex-shrink-0 text-[var(--text-muted)]">
            <ChevronIcon isOpen={isEducationOpen} />
          </span>
        </button>

        <div
          className={`grid transition-all duration-300 ease-in-out ${
            isEducationOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            <p className="pt-4 text-sm text-[var(--text-secondary)] leading-relaxed">
              NapNap doesn't use fixed schedules. Our algorithm analyses your baby's sleep pressure
              (adenosine) in real time. If they take a short nap or wake earlier than expected,
              NapNap instantly recalculates the next wake window to prevent overtiredness. The more
              data you log, the closer we get to your baby's unique biological rhythm.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
