import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { getDateFnsLocale } from '../../utils/dateFnsLocale';
import type { BabyProfile, MeasurementLog } from '../../types';
import { useGrowthLogs } from '../../hooks/useGrowthLogs';
import type { MeasurementLogPayload } from '../../hooks/useGrowthLogs';
import { MeasureLogSheet } from './MeasureLogSheet';

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const AddIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

function getTodayDateStr(): string {
  return new Date().toISOString().split('T')[0];
}

interface MeasuresViewProps {
  baby: BabyProfile;
  canEdit: boolean;
  onBack: () => void;
}

export function MeasuresView({ baby, canEdit, onBack }: MeasuresViewProps) {
  const { t } = useTranslation();
  const locale = getDateFnsLocale();
  const {
    measurementLogs,
    loading,
    addMeasurementLog,
    updateMeasurementLog,
    deleteMeasurementLog,
  } = useGrowthLogs({ babyId: baby.id });

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<MeasurementLog | null>(null);

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'dd MMM yyyy', { locale });
    } catch {
      return dateStr;
    }
  };

  const handleOpenAdd = () => {
    setEditingLog(null);
    setSheetOpen(true);
  };

  const handleOpenEdit = (log: MeasurementLog) => {
    setEditingLog(log);
    setSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setSheetOpen(false);
    setEditingLog(null);
  };

  const handleSave = async (date: string, payload: MeasurementLogPayload) => {
    if (editingLog) {
      await updateMeasurementLog(editingLog.id, date, payload);
    } else {
      await addMeasurementLog(baby.id, date, payload);
    }
    handleCloseSheet();
  };

  const handleDelete = async (id: string) => {
    await deleteMeasurementLog(id);
  };

  return (
    <div className="space-y-6">
      {/* Header: back (left), title + subtitle (center), + (right) */}
      <div className="relative flex items-center justify-center min-h-[52px]">
        <button
          onClick={onBack}
          className="absolute left-0 w-11 h-11 -ml-1 rounded-2xl flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          aria-label={t('common.ariaGoBack')}
        >
          <BackIcon />
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">
            {t('measures.title')}
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            {t('measures.subtitle', { name: baby.name || t('common.baby') })}
          </p>
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="absolute right-0 w-11 h-11 rounded-full flex items-center justify-center text-[var(--nap-color)] bg-[var(--bg-soft)] border border-[var(--glass-border)] hover:bg-[var(--nap-color)]/10 transition-colors"
            aria-label={t('measures.addMeasurement')}
          >
            <AddIcon />
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-8 flex justify-center">
          <span className="w-8 h-8 rounded-full border-2 border-[var(--nap-color)]/30 border-t-[var(--nap-color)] animate-spin" aria-hidden="true" />
        </div>
      ) : measurementLogs.length === 0 ? (
        <div className="rounded-2xl bg-[var(--bg-soft)] border border-[var(--glass-border)] p-6 text-center">
          <p className="text-[var(--text-secondary)] font-display">
            {t('measures.empty')}
          </p>
          {canEdit && (
            <>
              <p className="text-sm text-[var(--text-muted)] mt-2">
                {t('measures.emptyHint')}
              </p>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="mt-4 inline-flex items-center gap-2 px-5 py-3 min-h-[48px] rounded-xl bg-[var(--nap-color)] text-[var(--text-on-accent)] font-display font-semibold text-sm transition-all active:scale-[0.97]"
              >
                <AddIcon />
                {t('measures.addMeasurement')}
              </button>
            </>
          )}
        </div>
      ) : (
        <ul className="space-y-6">
          {/* List grouped by day (newest first for readability) */}
          {[...measurementLogs].reverse().map((log) => (
            <li key={log.id} className="rounded-2xl bg-[var(--bg-soft)] border border-[var(--glass-border)] overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--text-muted)]/10 flex items-center justify-between gap-3">
                <span className="text-sm font-display font-medium text-[var(--text-primary)]">
                  {formatDate(log.date)}
                </span>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(log)}
                    className="w-11 h-11 flex items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--nap-color)] hover:bg-[var(--nap-color)]/10 transition-colors"
                    aria-label={t('measures.editMeasurement')}
                  >
                    <EditIcon />
                  </button>
                )}
              </div>
              <div className="px-4 py-3 space-y-1">
                {log.weightKg != null && log.weightKg > 0 && (
                  <p className="text-[var(--text-secondary)] text-sm">
                    <span className="text-[var(--text-muted)]">{t('measures.weight')}:</span>{' '}
                    {log.weightKg} {t('growth.kg')}
                  </p>
                )}
                {log.heightCm != null && log.heightCm > 0 && (
                  <p className="text-[var(--text-secondary)] text-sm">
                    <span className="text-[var(--text-muted)]">{t('measures.height')}:</span>{' '}
                    {log.heightCm} {t('growth.cm')}
                  </p>
                )}
                {log.headCm != null && log.headCm > 0 && (
                  <p className="text-[var(--text-secondary)] text-sm">
                    <span className="text-[var(--text-muted)]">{t('measures.head')}:</span>{' '}
                    {log.headCm} {t('growth.cm')}
                  </p>
                )}
                {log.notes && log.notes.trim() && (
                  <p className="text-[var(--text-muted)] text-xs mt-2 italic">{log.notes}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <MeasureLogSheet
        isOpen={sheetOpen}
        onClose={handleCloseSheet}
        existingLog={editingLog}
        defaultDate={getTodayDateStr()}
        onSave={handleSave}
        onDelete={canEdit ? handleDelete : undefined}
      />
    </div>
  );
}
