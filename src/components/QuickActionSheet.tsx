import { motion, AnimatePresence } from 'framer-motion';

interface QuickActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWakeUp: () => void;
  onSelectNap: () => void;
  onSelectBedtime: () => void;
  hasActiveSleep: boolean;
  onEndSleep?: () => void;
}

// Icons
const SunIcon = ({ className = "w-10 h-10" }: { className?: string }) => (
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

const CloudIcon = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
  </svg>
);

const MoonIcon = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export function QuickActionSheet({
  isOpen,
  onClose,
  onSelectWakeUp,
  onSelectNap,
  onSelectBedtime,
  hasActiveSleep,
  onEndSleep,
}: QuickActionSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-40"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300,
            }}
            className="fixed bottom-0 left-0 right-0 z-50"
          >
            <div
              className="bg-[var(--bg-card)] rounded-t-[32px] px-6 pt-4 pb-10 max-w-lg mx-auto"
              style={{ boxShadow: '0 -8px 32px rgba(0,0,0,0.3)' }}
            >
              {/* Handle bar */}
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6" />

              {/* If baby is sleeping, show only Wake Up option */}
              {hasActiveSleep ? (
                <div className="flex justify-center">
                  <button
                    onClick={onEndSleep}
                    className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-[var(--wake-color)]/10 active:bg-[var(--wake-color)]/20 active:scale-95 transition-all w-32"
                  >
                    <div className="w-16 h-16 rounded-full bg-[var(--wake-color)] flex items-center justify-center text-[var(--bg-deep)]">
                      <SunIcon />
                    </div>
                    <span className="font-display font-semibold text-[var(--wake-color)]">
                      Wake Up
                    </span>
                  </button>
                </div>
              ) : (
                /* Quick Action Grid - 3 columns */
                <div className="grid grid-cols-3 gap-4">
                  {/* Wake Up */}
                  <button
                    onClick={onSelectWakeUp}
                    className="flex flex-col items-center gap-3 p-4 rounded-3xl bg-[var(--wake-color)]/10 active:bg-[var(--wake-color)]/20 active:scale-95 transition-all"
                  >
                    <div className="w-14 h-14 rounded-full bg-[var(--wake-color)] flex items-center justify-center text-[var(--bg-deep)]">
                      <SunIcon className="w-7 h-7" />
                    </div>
                    <span className="font-display font-semibold text-sm text-[var(--wake-color)]">
                      Wake Up
                    </span>
                  </button>

                  {/* Nap */}
                  <button
                    onClick={onSelectNap}
                    className="flex flex-col items-center gap-3 p-4 rounded-3xl bg-[var(--nap-color)]/10 active:bg-[var(--nap-color)]/20 active:scale-95 transition-all"
                  >
                    <div className="w-14 h-14 rounded-full bg-[var(--nap-color)] flex items-center justify-center text-[var(--bg-deep)]">
                      <CloudIcon className="w-7 h-7" />
                    </div>
                    <span className="font-display font-semibold text-sm text-[var(--nap-color)]">
                      Nap
                    </span>
                  </button>

                  {/* Bedtime */}
                  <button
                    onClick={onSelectBedtime}
                    className="flex flex-col items-center gap-3 p-4 rounded-3xl bg-[var(--night-color)]/10 active:bg-[var(--night-color)]/20 active:scale-95 transition-all"
                  >
                    <div className="w-14 h-14 rounded-full bg-[var(--night-color)] flex items-center justify-center text-white">
                      <MoonIcon className="w-7 h-7" />
                    </div>
                    <span className="font-display font-semibold text-sm text-[var(--night-color)]">
                      Bedtime
                    </span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
