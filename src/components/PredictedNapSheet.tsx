import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { ConfirmationModal } from './ConfirmationModal';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useNavHiddenWhenModal } from '../contexts/NavHiddenWhenModalContext';
import { formatTime, formatDuration } from '../utils/dateUtils';
import { subMinutes } from 'date-fns';

// ============================================================================
// Types
// ============================================================================

export interface PredictedNapData {
  displayStart: Date;
  expectedEnd: Date;
  expectedDuration: number;
  isCatnap: boolean;
  napNumber: number;
  napIndex: number;
}

interface PredictedNapSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onStartNap: (startTime: Date) => void;
  onSkipNap: (napIndex: number) => void;
  onUnskipNap?: (napIndex: number) => void;
  prediction: PredictedNapData | null;
  isSkipped?: boolean;
}

// ============================================================================
// Icons
// ============================================================================

const CloudIcon = ({ className = 'w-8 h-8' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-8 h-8 ml-1" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
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

const SkipIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

// ============================================================================
// Helpers
// ============================================================================

function toTimeString(date: Date): string {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

// ============================================================================
// Component
// ============================================================================

type Step = 'preview' | 'track';

export function PredictedNapSheet({
  isOpen,
  onClose,
  onStartNap,
  onSkipNap,
  onUnskipNap,
  prediction,
  isSkipped = false,
}: PredictedNapSheetProps) {
  const { t } = useTranslation();
  const { addModal, removeModal } = useNavHiddenWhenModal();

  const [step, setStep] = useState<Step>('preview');
  const [timeValue, setTimeValue] = useState('');
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  // Hide nav when sheet is open
  useEffect(() => {
    if (isOpen) {
      addModal();
      return () => removeModal();
    }
  }, [isOpen, addModal, removeModal]);

  // Reset to preview step & initialize time when opening
  useEffect(() => {
    if (isOpen && prediction) {
      setStep('preview');
      setShowSkipConfirm(false);
      setTimeValue(toTimeString(new Date()));
    }
  }, [isOpen, prediction]);

  // Build a Date from current timeValue
  const timeDate = useCallback(() => {
    if (!timeValue) return new Date();
    const [h, m] = timeValue.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  }, [timeValue]);

  const handleTimeChange = (val: string) => {
    if (!val) return;
    setTimeValue(val);
  };

  const adjustTime = useCallback((minutes: number) => {
    const current = timeDate();
    const next = new Date(current.getTime() + minutes * 60000);
    setTimeValue(toTimeString(next));
  }, [timeDate]);

  const handlePlay = () => {
    onStartNap(timeDate());
  };

  const handleSkipConfirm = () => {
    if (prediction) {
      onSkipNap(prediction.napIndex);
    }
    setShowSkipConfirm(false);
  };

  const dialogRef = useFocusTrap(isOpen, onClose);

  // Drag-to-dismiss (same pattern as WakeUpSheet)
  const y = useMotionValue(0);
  const backdropOpacity = useTransform(y, [0, 300], [1, 0]);

  const handleDragEnd = (_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
    if (info.offset.y > 150 || info.velocity.y > 500) {
      onClose();
    }
  };

  if (!prediction) return null;

  // Compute tip time: 30 min before predicted start
  const tipTime = subMinutes(prediction.displayStart, 30);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ opacity: backdropOpacity }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={onClose}
              aria-hidden="true"
            />

            {/* Sheet */}
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label={t('predictedNap.ariaSheet')}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={handleDragEnd}
              style={{ y }}
              className="fixed bottom-0 left-0 right-0 z-50 touch-none"
            >
              <div className="bg-[var(--bg-card)] rounded-t-[2rem] shadow-[0_-8px_40px_rgba(0,0,0,0.3)] max-w-lg mx-auto">
                {/* Handle bar */}
                <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
                  <div className="w-10 h-1 bg-[var(--text-muted)]/30 rounded-full" />
                </div>

                {/* Animated step content */}
                <AnimatePresence mode="wait">
                  {isSkipped ? (
                    <motion.div
                      key="skipped"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* ====== SKIPPED NAP VIEW ====== */}
                      <div className="flex flex-col items-center px-6 pt-4 pb-8">
                        {/* Cloud icon in dashed circle (dimmed) */}
                        <div
                          className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                          style={{
                            border: '2px dashed color-mix(in srgb, var(--text-muted) 40%, transparent)',
                            color: 'var(--text-muted)',
                          }}
                        >
                          <CloudIcon className="w-9 h-9" />
                        </div>

                        {/* Title */}
                        <h2
                          className="text-lg font-display font-semibold mb-4"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {t('predictedNap.napTitle')}
                        </h2>

                        {/* Start time */}
                        <p
                          className="font-display font-bold text-[var(--text-primary)] mb-6"
                          style={{ fontSize: '2.75rem', lineHeight: 1.1 }}
                        >
                          {formatTime(prediction.displayStart)}
                        </p>

                        {/* Skipped message */}
                        <div
                          className="rounded-2xl px-4 py-3 mb-8 w-full"
                          style={{
                            background: 'color-mix(in srgb, var(--text-muted) 8%, var(--bg-card))',
                            border: '1px solid color-mix(in srgb, var(--text-muted) 20%, transparent)',
                          }}
                        >
                          <p className="text-[var(--text-secondary)] text-sm text-center leading-relaxed">
                            {t('predictedNap.skippedMessage')}
                          </p>
                        </div>

                        {/* Open nap button → un-skip & transition to track step */}
                        <button
                          onClick={() => {
                            if (prediction) {
                              onUnskipNap?.(prediction.napIndex);
                              setTimeValue(toTimeString(new Date()));
                              setStep('track');
                            }
                          }}
                          className="w-full py-3.5 rounded-2xl font-display font-semibold text-sm text-[var(--bg-deep)] transition-all active:scale-[0.97]"
                          style={{
                            background: 'linear-gradient(135deg, var(--nap-color), color-mix(in srgb, var(--nap-color) 80%, white))',
                          }}
                        >
                          {t('predictedNap.openNap')}
                        </button>
                      </div>
                    </motion.div>
                  ) : step === 'preview' ? (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, x: 0 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -80 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* ====== STEP 1: Estimated Nap Preview ====== */}
                      <div className="flex flex-col items-center px-6 pt-4 pb-8">
                        {/* Cloud icon in dashed circle */}
                        <div
                          className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                          style={{
                            border: '2px dashed color-mix(in srgb, var(--nap-color) 50%, transparent)',
                            color: 'var(--nap-color)',
                          }}
                        >
                          <CloudIcon className="w-9 h-9" />
                        </div>

                        {/* Title */}
                        <h2
                          className="text-lg font-display font-semibold mb-4"
                          style={{ color: 'var(--nap-color)' }}
                        >
                          {t('predictedNap.estimatedNap')}
                        </h2>

                        {/* Large time range */}
                        <p
                          className="font-display font-bold text-[var(--text-primary)] mb-1"
                          style={{ fontSize: '2.75rem', lineHeight: 1.1 }}
                        >
                          {formatTime(prediction.displayStart)} – {formatTime(prediction.expectedEnd)}
                        </p>

                        {/* Duration */}
                        <p className="text-[var(--text-muted)] font-display text-sm mb-5">
                          {t('predictedNap.durationLong', { duration: formatDuration(prediction.expectedDuration) })}
                        </p>

                        {/* Tip */}
                        <div
                          className="rounded-2xl px-4 py-3 mb-8 w-full"
                          style={{
                            background: 'color-mix(in srgb, var(--nap-color) 8%, var(--bg-card))',
                            border: '1px solid color-mix(in srgb, var(--nap-color) 20%, transparent)',
                          }}
                        >
                          <p className="text-[var(--text-secondary)] text-sm text-center leading-relaxed">
                            {t('predictedNap.tip', { time: formatTime(tipTime) })}
                          </p>
                        </div>

                        {/* Action buttons: Skip / Track */}
                        <div className="flex gap-3 w-full">
                          <button
                            onClick={() => setShowSkipConfirm(true)}
                            className="flex-1 py-3.5 rounded-2xl font-display font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                            style={{
                              background: 'var(--glass-bg)',
                              border: '1.5px solid var(--glass-border)',
                              color: 'var(--text-secondary)',
                            }}
                          >
                            {t('predictedNap.skip')}
                          </button>
                          <button
                            onClick={() => {
                              setStep('track');
                              setTimeValue(toTimeString(new Date()));
                            }}
                            className="flex-1 py-3.5 rounded-2xl font-display font-semibold text-sm text-[var(--bg-deep)] transition-all active:scale-[0.97]"
                            style={{
                              background: 'linear-gradient(135deg, var(--nap-color), color-mix(in srgb, var(--nap-color) 80%, white))',
                            }}
                          >
                            {t('predictedNap.track')}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="track"
                      initial={{ opacity: 0, x: 80 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 80 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* ====== STEP 2: Nap Tracker ====== */}
                      <div className="flex flex-col items-center px-6 pt-4 pb-8">
                        {/* Cloud icon (solid circle) */}
                        <div
                          className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                          style={{
                            background: 'color-mix(in srgb, var(--nap-color) 20%, transparent)',
                            border: '2px solid color-mix(in srgb, var(--nap-color) 40%, transparent)',
                            boxShadow: '0 0 24px color-mix(in srgb, var(--nap-color) 25%, transparent)',
                            color: 'var(--nap-color)',
                          }}
                        >
                          <CloudIcon className="w-9 h-9" />
                        </div>

                        {/* Title */}
                        <h2
                          className="text-lg font-display font-semibold mb-6"
                          style={{ color: 'var(--nap-color)' }}
                        >
                          {t('predictedNap.napTitle')}
                        </h2>

                        {/* Editable time — native scroll picker */}
                        <input
                          type="time"
                          value={timeValue}
                          onChange={(e) => handleTimeChange(e.target.value)}
                          aria-label={t('predictedNap.ariaSheet')}
                          className="text-center font-display font-bold text-[var(--text-primary)] bg-transparent border-none outline-none appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-datetime-edit-fields-wrapper]:p-0"
                          style={{ fontSize: '2.75rem', lineHeight: 1.2 }}
                        />

                        {/* Spacer */}
                        <div className="mb-10" />

                        {/* Action buttons: -1 min / Play / +1 min */}
                        <div className="flex items-center gap-6">
                          <button
                            onClick={() => adjustTime(-1)}
                            className="flex flex-col items-center gap-1.5"
                            aria-label={t('predictedNap.ariaAdjustMinus')}
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
                            onClick={handlePlay}
                            whileTap={{ scale: 0.9 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                            className="rounded-full flex items-center justify-center shadow-lg"
                            style={{
                              width: 72,
                              height: 72,
                              backgroundColor: 'var(--nap-color)',
                              color: 'var(--bg-deep)',
                            }}
                            aria-label={t('predictedNap.ariaPlay')}
                          >
                            <PlayIcon />
                          </motion.button>

                          <button
                            onClick={() => adjustTime(1)}
                            className="flex flex-col items-center gap-1.5"
                            aria-label={t('predictedNap.ariaAdjustPlus')}
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Skip Confirmation Modal (z-100, above the sheet) */}
      <ConfirmationModal
        isOpen={showSkipConfirm}
        onConfirm={handleSkipConfirm}
        onCancel={() => setShowSkipConfirm(false)}
        title={t('predictedNap.skipTitle')}
        description={t('predictedNap.skipBody')}
        confirmLabel={t('predictedNap.skipConfirm')}
        cancelLabel={t('predictedNap.skipCancel')}
        confirmVariant="primary"
        icon={<SkipIcon />}
      />
    </>
  );
}
