import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useFocusTrap } from '../../hooks/useFocusTrap';

const CloseIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

export type GrowthLogMode = 'weight' | 'height';

interface GrowthLogSheetProps {
  isOpen: boolean;
  onClose: () => void;
  mode: GrowthLogMode;
  initialDate?: string;
  initialValue?: number;
  existingLogId?: string | null;
  onSave: (date: string, value: number) => void | Promise<void>;
  /** Returns a translation key for warning when value is lower than a later log; called with current date and value. */
  getWarning?: (date: string, value: number) => string | null;
  /** Default date when adding new log (e.g. today in YYYY-MM-DD) */
  defaultDate: string;
}

export function GrowthLogSheet({
  isOpen,
  onClose,
  mode,
  initialDate,
  initialValue,
  existingLogId,
  onSave,
  getWarning,
  defaultDate,
}: GrowthLogSheetProps) {
  const { t } = useTranslation();
  const [date, setDate] = useState(defaultDate);
  const [value, setValue] = useState<number>(existingLogId != null && initialValue != null ? initialValue : 0);
  const [isSaving, setIsSaving] = useState(false);
  // Only show "below later entry" warning when user has entered a value; avoid showing it for default 0 (empty state)
  const warning = value > 0 ? (getWarning?.(date, value) ?? null) : null;

  useEffect(() => {
    if (isOpen) {
      setDate(initialDate ?? defaultDate);
      setValue(existingLogId != null && initialValue != null ? initialValue : 0);
    }
  }, [isOpen, initialDate, initialValue, existingLogId, defaultDate]);

  const dialogRef = useFocusTrap(isOpen, onClose);
  const y = useMotionValue(0);
  const backdropOpacity = useTransform(y, [0, 300], [1, 0]);

  const handleDragEnd = (_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
    if (info.offset.y > 150 || info.velocity.y > 500) onClose();
  };

  const handleSave = async () => {
    const num = mode === 'weight' ? value : value;
    if (num <= 0) return;
    if (isSaving) return;
    setIsSaving(true);
    try {
      await Promise.resolve(onSave(date, num));
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const isWeight = mode === 'weight';
  const valueLabel = isWeight ? t('growth.weightKg') : t('growth.heightCm');
  const title = existingLogId
    ? isWeight
      ? t('growth.editWeight')
      : t('growth.editHeight')
    : isWeight
      ? t('growth.addWeight')
      : t('growth.addHeight');

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
            aria-hidden="true"
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
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
            <div className="bg-[var(--bg-card)] rounded-t-[2rem] shadow-[0_-8px_40px_rgba(0,0,0,0.3)] min-h-[40dvh]">
              <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
                <div className="w-10 h-1 bg-[var(--text-muted)]/30 rounded-full" />
              </div>
              <div className="flex items-center justify-between px-6 pb-4">
                <div className="w-11" />
                <h2 className="text-lg font-display font-semibold text-[var(--text-primary)]">{title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-11 h-11 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  style={{ background: 'color-mix(in srgb, var(--text-muted) 15%, transparent)' }}
                  aria-label={t('common.close')}
                >
                  <CloseIcon />
                </button>
              </div>
              <div className="px-6 pb-8 space-y-4">
                <div>
                  <label htmlFor="growth-log-date" className="block text-[11px] font-medium text-[var(--text-muted)] mb-1.5 font-display uppercase tracking-wider">
                    {t('growth.date')}
                  </label>
                  <input
                    id="growth-log-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl bg-[var(--bg-soft)] border border-[var(--glass-border)] px-4 py-3 text-[var(--text-primary)] font-display focus:outline-none focus:ring-2 focus:ring-[var(--nap-color)]"
                  />
                </div>
                <div>
                  <label htmlFor="growth-log-value" className="block text-[11px] font-medium text-[var(--text-muted)] mb-1.5 font-display uppercase tracking-wider">
                    {valueLabel}
                  </label>
                  <input
                    id="growth-log-value"
                    type="number"
                    min="0"
                    step={isWeight ? 0.1 : 0.1}
                    value={value || ''}
                    onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                    placeholder={isWeight ? '0' : '0'}
                    className="w-full rounded-xl bg-[var(--bg-soft)] border border-[var(--glass-border)] px-4 py-3 text-[var(--text-primary)] font-display focus:outline-none focus:ring-2 focus:ring-[var(--nap-color)]"
                  />
                </div>
                {warning && (
                  <p className="text-sm text-[var(--wake-color)]" role="alert">
                    {t(warning)}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!date || value <= 0 || isSaving}
                  className={`w-full py-4 rounded-2xl font-display font-semibold text-base transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                    date && value > 0 && !isSaving
                      ? 'bg-[var(--nap-color)] text-[var(--text-on-accent)] shadow-lg shadow-[var(--nap-color)]/20'
                      : 'bg-[var(--bg-soft)] text-[var(--text-muted)]/40 cursor-not-allowed'
                  }`}
                  aria-busy={isSaving}
                >
                  {isSaving ? (
                    <>
                      <span className="w-5 h-5 rounded-full border-2 border-current/30 border-t-current animate-spin" aria-hidden="true" />
                      {t('common.loading')}
                    </>
                  ) : (
                    t('common.save')
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
