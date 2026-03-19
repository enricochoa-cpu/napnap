import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useNavHiddenWhenModal } from '../../contexts/NavHiddenWhenModalContext';
import type { MeasurementLog } from '../../types';
import type { MeasurementLogPayload } from '../../hooks/useGrowthLogs';
import { ConfirmationModal } from '../ConfirmationModal';

const CloseIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

interface MeasureLogSheetProps {
  isOpen: boolean;
  onClose: () => void;
  /** When set, we're editing; otherwise adding. Enables delete button. */
  existingLog: MeasurementLog | null;
  defaultDate: string;
  onSave: (date: string, payload: MeasurementLogPayload) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
}

interface MeasureWarning {
  suggestedValue: number;
  unit: string;
}

function getMeasureWarning(
  field: 'weight' | 'height' | 'head',
  value: number | ''
): MeasureWarning | null {
  if (value === '' || value <= 0) return null;

  if (field === 'weight') {
    if (value <= 25) return null;
    const suggested = value >= 100 ? value / 100 : value / 10;
    if (suggested >= 1 && suggested <= 25) {
      return { suggestedValue: Math.round(suggested * 100) / 100, unit: 'kg' };
    }
  }

  if (field === 'height') {
    if (value <= 120) return null;
    const suggested = value / 10;
    if (suggested >= 35 && suggested <= 120) {
      return { suggestedValue: Math.round(suggested * 10) / 10, unit: 'cm' };
    }
  }

  if (field === 'head') {
    if (value <= 60) return null;
    const suggested = value / 10;
    if (suggested >= 25 && suggested <= 60) {
      return { suggestedValue: Math.round(suggested * 10) / 10, unit: 'cm' };
    }
  }

  return null;
}

function hasAtLeastOne(payload: { weightKg?: number | null; heightCm?: number | null; headCm?: number | null }): boolean {
  return (
    (payload.weightKg != null && payload.weightKg > 0) ||
    (payload.heightCm != null && payload.heightCm > 0) ||
    (payload.headCm != null && payload.headCm > 0)
  );
}

export function MeasureLogSheet({
  isOpen,
  onClose,
  existingLog,
  defaultDate,
  onSave,
  onDelete,
}: MeasureLogSheetProps) {
  const { t } = useTranslation();
  const { addModal, removeModal } = useNavHiddenWhenModal();
  const [date, setDate] = useState(defaultDate);
  const [weightKg, setWeightKg] = useState<number | ''>(existingLog?.weightKg ?? '');
  const [heightCm, setHeightCm] = useState<number | ''>(existingLog?.heightCm ?? '');
  const [headCm, setHeadCm] = useState<number | ''>(existingLog?.headCm ?? '');
  const [notes, setNotes] = useState(existingLog?.notes ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDate(existingLog?.date ?? defaultDate);
      setWeightKg(existingLog?.weightKg ?? '');
      setHeightCm(existingLog?.heightCm ?? '');
      setHeadCm(existingLog?.headCm ?? '');
      setNotes(existingLog?.notes ?? '');
    }
  }, [isOpen, existingLog, defaultDate]);

  // Hide nav bar while sheet is open so Save button is visible above where nav would be
  useEffect(() => {
    if (isOpen) {
      addModal();
      return () => removeModal();
    }
  }, [isOpen, addModal, removeModal]);

  const dialogRef = useFocusTrap(isOpen, onClose);
  const y = useMotionValue(0);
  const backdropOpacity = useTransform(y, [0, 300], [1, 0]);

  const handleDragEnd = (_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
    if (info.offset.y > 150 || info.velocity.y > 500) onClose();
  };

  const payload: MeasurementLogPayload = {
    weightKg: typeof weightKg === 'number' ? weightKg : (weightKg !== '' ? Number(weightKg) : null),
    heightCm: typeof heightCm === 'number' ? heightCm : (heightCm !== '' ? Number(heightCm) : null),
    headCm: typeof headCm === 'number' ? headCm : (headCm !== '' ? Number(headCm) : null),
    notes: notes.trim() || null,
  };

  const isValid = hasAtLeastOne(payload);

  const handleSave = async () => {
    if (!isValid || isSaving) return;
    setIsSaving(true);
    try {
      await Promise.resolve(onSave(date, payload));
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existingLog || !onDelete) return;
    await Promise.resolve(onDelete(existingLog.id));
    setShowDeleteConfirm(false);
    onClose();
  };

  const title = existingLog ? t('measures.editMeasurement') : t('measures.addMeasurement');

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* z-[60] so sheet and backdrop sit above the floating nav (z-index: 50 in index.css) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ opacity: backdropOpacity }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
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
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={handleDragEnd}
              style={{ y }}
              className="fixed bottom-0 left-0 right-0 z-[60] touch-none flex flex-col max-h-[85dvh]"
            >
              <div className="bg-[var(--bg-card)] rounded-t-[2rem] shadow-[0_-8px_40px_rgba(0,0,0,0.3)] flex flex-col min-h-0 max-h-[85dvh]">
                {/* Handle + header: Delete (left when editing), title, Close (right) — same as SleepEntrySheet so footer has only Save */}
                <div className="flex-shrink-0">
                  <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
                    <div className="w-10 h-1 bg-[var(--text-muted)]/30 rounded-full" />
                  </div>
                  <div className="flex items-center justify-between px-6 pb-4">
                    {existingLog && onDelete ? (
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-11 h-11 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--danger-color)] transition-colors"
                        style={{ background: 'color-mix(in srgb, var(--text-muted) 15%, transparent)' }}
                        aria-label={t('measures.deleteMeasurement')}
                      >
                        <TrashIcon />
                      </button>
                    ) : (
                      <div className="w-11" />
                    )}
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
                </div>
                {/* Form fields: scrollable so buttons stay visible above nav */}
                <div className="flex-1 min-h-0 overflow-y-auto px-6 space-y-4">
                  <div>
                    <label htmlFor="measure-log-date" className="block text-[11px] font-medium text-[var(--text-muted)] mb-1.5 font-display uppercase tracking-wider">
                      {t('growth.date')}
                    </label>
                    <input
                      id="measure-log-date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full rounded-xl bg-[var(--bg-soft)] border border-[var(--glass-border)] px-4 py-3 text-[var(--text-primary)] font-display focus:outline-none focus:ring-2 focus:ring-[var(--nap-color)]"
                    />
                  </div>
                  <div>
                    <label htmlFor="measure-log-weight" className="block text-[11px] font-medium text-[var(--text-muted)] mb-1.5 font-display uppercase tracking-wider">
                      {t('measures.weightKg')}
                    </label>
                    <input
                      id="measure-log-weight"
                      type="number"
                      min="0"
                      step="0.01"
                      value={weightKg === '' ? '' : weightKg}
                      onChange={(e) => setWeightKg(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full rounded-xl bg-[var(--bg-soft)] border border-[var(--glass-border)] px-4 py-3 text-[var(--text-primary)] font-display focus:outline-none focus:ring-2 focus:ring-[var(--nap-color)]"
                    />
                    {(() => {
                      const w = getMeasureWarning('weight', weightKg);
                      if (!w) return null;
                      return (
                        <p className="text-xs text-[var(--wake-color)] mt-1" role="alert">
                          {t('measures.valueSeemsHigh')}{' '}
                          <button
                            type="button"
                            onClick={() => setWeightKg(w.suggestedValue)}
                            className="underline underline-offset-2 font-semibold"
                          >
                            {w.suggestedValue} {w.unit}
                          </button>
                          ?
                        </p>
                      );
                    })()}
                  </div>
                  <div>
                    <label htmlFor="measure-log-height" className="block text-[11px] font-medium text-[var(--text-muted)] mb-1.5 font-display uppercase tracking-wider">
                      {t('measures.heightCm')}
                    </label>
                    <input
                      id="measure-log-height"
                      type="number"
                      min="0"
                      step="0.1"
                      value={heightCm === '' ? '' : heightCm}
                      onChange={(e) => setHeightCm(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full rounded-xl bg-[var(--bg-soft)] border border-[var(--glass-border)] px-4 py-3 text-[var(--text-primary)] font-display focus:outline-none focus:ring-2 focus:ring-[var(--nap-color)]"
                    />
                    {(() => {
                      const w = getMeasureWarning('height', heightCm);
                      if (!w) return null;
                      return (
                        <p className="text-xs text-[var(--wake-color)] mt-1" role="alert">
                          {t('measures.valueSeemsHigh')}{' '}
                          <button
                            type="button"
                            onClick={() => setHeightCm(w.suggestedValue)}
                            className="underline underline-offset-2 font-semibold"
                          >
                            {w.suggestedValue} {w.unit}
                          </button>
                          ?
                        </p>
                      );
                    })()}
                  </div>
                  <div>
                    <label htmlFor="measure-log-head" className="block text-[11px] font-medium text-[var(--text-muted)] mb-1.5 font-display uppercase tracking-wider">
                      {t('measures.headCm')}
                    </label>
                    <input
                      id="measure-log-head"
                      type="number"
                      min="0"
                      step="0.1"
                      value={headCm === '' ? '' : headCm}
                      onChange={(e) => setHeadCm(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full rounded-xl bg-[var(--bg-soft)] border border-[var(--glass-border)] px-4 py-3 text-[var(--text-primary)] font-display focus:outline-none focus:ring-2 focus:ring-[var(--nap-color)]"
                    />
                    {(() => {
                      const w = getMeasureWarning('head', headCm);
                      if (!w) return null;
                      return (
                        <p className="text-xs text-[var(--wake-color)] mt-1" role="alert">
                          {t('measures.valueSeemsHigh')}{' '}
                          <button
                            type="button"
                            onClick={() => setHeadCm(w.suggestedValue)}
                            className="underline underline-offset-2 font-semibold"
                          >
                            {w.suggestedValue} {w.unit}
                          </button>
                          ?
                        </p>
                      );
                    })()}
                  </div>
                  <div>
                    <label htmlFor="measure-log-notes" className="block text-[11px] font-medium text-[var(--text-muted)] mb-1.5 font-display uppercase tracking-wider">
                      {t('measures.notesOptional')}
                    </label>
                    <textarea
                      id="measure-log-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t('measures.notesPlaceholder')}
                      rows={2}
                      className="w-full rounded-xl bg-[var(--bg-soft)] border border-[var(--glass-border)] px-4 py-3 text-[var(--text-primary)] font-display focus:outline-none focus:ring-2 focus:ring-[var(--nap-color)] resize-none"
                    />
                  </div>
                  {!isValid && (weightKg !== '' || heightCm !== '' || headCm !== '') && (
                    <p className="text-sm text-[var(--wake-color)]" role="alert">
                      {t('measures.atLeastOneRequired')}
                    </p>
                  )}
                </div>
                {/* Sticky footer: only Save so it always fits above nav */}
                <div className="flex-shrink-0 px-6 pt-4 pb-8 border-t border-[var(--text-muted)]/10 bg-[var(--bg-card)]" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 0px))' }}>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!isValid || isSaving}
                    className={`w-full py-4 rounded-2xl font-display font-semibold text-base transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                      isValid && !isSaving
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
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        title={t('measures.deleteConfirmTitle')}
        description={t('measures.deleteConfirmDescription')}
        confirmLabel={t('common.delete')}
        confirmVariant="danger"
      />
    </>
  );
}
