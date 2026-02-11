import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

interface WakeUpSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (wakeUpTime: Date) => void;
  onDelete?: () => void;
  bedtime: string; // ISO datetime string
}

const SunriseIcon = () => (
  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v4" />
    <path d="m4.93 4.93 2.83 2.83" />
    <path d="M2 12h4" />
    <path d="M12 12a4 4 0 0 0-4 4" />
    <path d="M12 12a4 4 0 0 1 4 4" />
    <path d="M20 12h2" />
    <path d="m16.24 7.76 2.83-2.83" />
    <path d="M2 20h20" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const RotateCCWIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

const RotateCWIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
  </svg>
);

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return 'just now';
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  if (mins === 0) return `${hours}h ago`;
  return `${hours}h ${mins}m ago`;
}

function toTimeString(date: Date): string {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

const ICON_CIRCLE_STYLE = { background: 'color-mix(in srgb, var(--text-muted) 15%, transparent)' };

export function WakeUpSheet({ isOpen, onClose, onConfirm, onDelete, bedtime }: WakeUpSheetProps) {
  const [timeValue, setTimeValue] = useState('');
  const [relativeLabel, setRelativeLabel] = useState('');

  // Reset to current time when opening
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      setTimeValue(toTimeString(now));
      setRelativeLabel(formatRelativeTime(now));
    }
  }, [isOpen]);

  // Build a Date from the current timeValue
  const wakeDate = useCallback(() => {
    if (!timeValue) return new Date();
    const [h, m] = timeValue.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  }, [timeValue]);

  // Refresh relative label every 30s
  useEffect(() => {
    if (!isOpen) return;
    setRelativeLabel(formatRelativeTime(wakeDate()));
    const interval = setInterval(() => {
      setRelativeLabel(formatRelativeTime(wakeDate()));
    }, 30000);
    return () => clearInterval(interval);
  }, [isOpen, timeValue, wakeDate]);

  const handleFieldChange = (hours: string, minutes: string) => {
    const val = `${hours}:${minutes}`;
    // Only validate when both fields are complete (2 digits each)
    if (hours.length === 2 && minutes.length === 2) {
      const [h, m] = [Number(hours), Number(minutes)];
      const next = new Date();
      next.setHours(h, m, 0, 0);
      if (next.getTime() > Date.now()) return;
      if (bedtime && next.getTime() <= new Date(bedtime).getTime()) return;
      setRelativeLabel(formatRelativeTime(next));
    }
    setTimeValue(val);
  };

  const adjustTime = useCallback((minutes: number) => {
    const current = wakeDate();
    const next = new Date(current.getTime() + minutes * 60000);
    if (next.getTime() > Date.now()) return;
    if (bedtime && next.getTime() <= new Date(bedtime).getTime()) return;
    setTimeValue(toTimeString(next));
    setRelativeLabel(formatRelativeTime(next));
  }, [bedtime, wakeDate]);

  const handleConfirm = () => {
    onConfirm(wakeDate());
  };

  const handleDelete = () => {
    if (confirm('Delete this sleep entry?')) {
      onDelete?.();
    }
  };

  const y = useMotionValue(0);
  const backdropOpacity = useTransform(y, [0, 300], [1, 0]);

  const handleDragEnd = (_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
    if (info.offset.y > 150 || info.velocity.y > 500) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ opacity: backdropOpacity }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={handleDragEnd}
            style={{ y }}
            className="fixed bottom-0 left-0 right-0 z-50 touch-none"
          >
            <div className="bg-[var(--bg-card)] rounded-t-[2rem] shadow-[0_-8px_40px_rgba(0,0,0,0.3)]">
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
                <div className="w-10 h-1 bg-[var(--text-muted)]/30 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 pb-2">
                {onDelete ? (
                  <button
                    onClick={handleDelete}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--danger-color)] transition-colors"
                    style={ICON_CIRCLE_STYLE}
                    aria-label="Delete"
                  >
                    <TrashIcon />
                  </button>
                ) : (
                  <div className="w-10" />
                )}
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  style={ICON_CIRCLE_STYLE}
                  aria-label="Close"
                >
                  <CloseIcon />
                </button>
              </div>

              {/* Content */}
              <div className="flex flex-col items-center px-6 pt-4 pb-8">
                {/* Sunrise icon */}
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                  style={{
                    background: 'color-mix(in srgb, var(--wake-color) 20%, transparent)',
                    border: '2px solid color-mix(in srgb, var(--wake-color) 40%, transparent)',
                    boxShadow: '0 0 24px color-mix(in srgb, var(--wake-color) 25%, transparent)',
                    color: 'var(--wake-color)',
                  }}
                >
                  <SunriseIcon />
                </div>

                <h2
                  className="text-lg font-display font-semibold mb-6"
                  style={{ color: 'var(--wake-color)' }}
                >
                  Wake Up
                </h2>

                {/* Editable time — two plain inputs for perfect centering */}
                <div className="flex items-baseline justify-center gap-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    value={timeValue.split(':')[0] ?? ''}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 2);
                      const h = Math.min(Number(v) || 0, 23);
                      const padded = v.length === 2 ? h.toString().padStart(2, '0') : v;
                      handleFieldChange(padded, timeValue.split(':')[1] ?? '00');
                    }}
                    onBlur={() => {
                      const [h] = timeValue.split(':');
                      handleFieldChange(h.padStart(2, '0'), timeValue.split(':')[1] ?? '00');
                    }}
                    className="w-[2.4ch] text-right font-display font-bold text-[var(--text-primary)] bg-transparent border-none outline-none"
                    style={{ fontSize: '3.5rem', lineHeight: 1.2 }}
                  />
                  <span className="font-display font-bold text-[var(--text-primary)]" style={{ fontSize: '3.5rem', lineHeight: 1.2 }}>:</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    value={timeValue.split(':')[1] ?? ''}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 2);
                      const m = Math.min(Number(v) || 0, 59);
                      const padded = v.length === 2 ? m.toString().padStart(2, '0') : v;
                      handleFieldChange(timeValue.split(':')[0] ?? '00', padded);
                    }}
                    onBlur={() => {
                      const [, m] = timeValue.split(':');
                      handleFieldChange(timeValue.split(':')[0] ?? '00', (m ?? '00').padStart(2, '0'));
                    }}
                    className="w-[2.4ch] text-left font-display font-bold text-[var(--text-primary)] bg-transparent border-none outline-none"
                    style={{ fontSize: '3.5rem', lineHeight: 1.2 }}
                  />
                </div>

                {/* Relative time */}
                <p className="text-sm text-[var(--text-muted)] mt-2 mb-10">
                  {relativeLabel}
                </p>

                {/* Action buttons: -1 min / Confirm / +1 min */}
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => adjustTime(-1)}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center transition-colors active:scale-95"
                      style={{
                        background: 'var(--glass-bg)',
                        border: '1.5px solid var(--glass-border)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <RotateCCWIcon />
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">-1 min</span>
                  </button>

                  <motion.button
                    onClick={handleConfirm}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    className="rounded-full flex items-center justify-center shadow-lg"
                    style={{
                      width: 72,
                      height: 72,
                      backgroundColor: 'var(--wake-color)',
                      color: 'var(--bg-deep)',
                    }}
                    aria-label="Confirm wake up"
                  >
                    <CheckIcon />
                  </motion.button>

                  <button
                    onClick={() => adjustTime(1)}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center transition-colors active:scale-95"
                      style={{
                        background: 'var(--glass-bg)',
                        border: '1.5px solid var(--glass-border)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <RotateCWIcon />
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">+1 min</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
