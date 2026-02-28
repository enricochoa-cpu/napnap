import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { BabyProfile, BabyShare, WeightLog, HeightLog } from '../../types';
import { formatAge, validateDateOfBirth } from '../../utils/dateUtils';
import { BabyAvatarPicker } from './BabyAvatarPicker';
import { SubViewHeader } from './SubViewHeader';
import { ShareAccess } from '../ShareAccess';
import { ConfirmationModal } from '../ConfirmationModal';
import { useGrowthLogs } from '../../hooks/useGrowthLogs';
import { GrowthLogSheet } from './GrowthLogSheet';
import { GrowthLogSection } from './GrowthLogSection';

interface BabyDetailViewProps {
  baby: BabyProfile;
  isOwner: boolean;
  onBack: () => void;
  /** Can return a Promise so we can show loading and prevent double-submit */
  onUpdate: (data: Partial<Omit<BabyProfile, 'id'>>) => void | Promise<void>;
  onUploadAvatar?: (file: File) => Promise<string | null>;
  /** When true, user can add/edit/delete weight and height logs (owner or caregiver). */
  canEditGrowth?: boolean;
  // Sharing props (owners only)
  myShares: BabyShare[];
  onInvite: (email: string, role: 'caregiver' | 'viewer', inviterName?: string, babyName?: string) => Promise<{ success: boolean; error?: string }>;
  onUpdateRole: (shareId: string, role: 'caregiver' | 'viewer') => Promise<{ success: boolean; error?: string }>;
  onRevokeAccess: (shareId: string) => Promise<{ success: boolean; error?: string }>;
  onDeleteBaby?: () => Promise<void>;
  inviterName?: string;
}

function getTodayDateStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function BabyDetailView({
  baby,
  isOwner,
  onBack,
  onUpdate,
  onUploadAvatar,
  canEditGrowth = isOwner,
  myShares,
  onInvite,
  onUpdateRole,
  onRevokeAccess,
  onDeleteBaby,
  inviterName,
}: BabyDetailViewProps) {
  const { t } = useTranslation();
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    weightLogs,
    heightLogs,
    addWeightLog,
    addHeightLog,
    updateWeightLog,
    updateHeightLog,
    deleteWeightLog,
    deleteHeightLog,
    getWeightWarning,
    getHeightWarning,
  } = useGrowthLogs({ babyId: baby.id });

  const [growthSheet, setGrowthSheet] = useState<'weight' | 'height' | null>(null);
  const [editingWeightLog, setEditingWeightLog] = useState<WeightLog | null>(null);
  const [editingHeightLog, setEditingHeightLog] = useState<HeightLog | null>(null);
  const [growthDeleteConfirm, setGrowthDeleteConfirm] = useState<{ type: 'weight' | 'height'; id: string } | null>(null);
  const [formData, setFormData] = useState({
    name: baby.name || '',
    dateOfBirth: baby.dateOfBirth || '',
    gender: (baby.gender || 'other') as 'male' | 'female' | 'other',
    avatarUrl: baby.avatarUrl,
  });

  // Reset form when baby changes
  useEffect(() => {
    setFormData({
      name: baby.name || '',
      dateOfBirth: baby.dateOfBirth || '',
      gender: (baby.gender || 'other') as 'male' | 'female' | 'other',
      avatarUrl: baby.avatarUrl,
    });
  }, [baby]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleAvatarUpload = async (file: File) => {
    if (!onUploadAvatar) return;
    setAvatarUploading(true);
    try {
      const avatarUrl = await onUploadAvatar(file);
      if (avatarUrl) {
        setFormData((prev) => ({ ...prev, avatarUrl }));
      }
    } catch (error) {
      console.error('Avatar upload failed:', error);
    } finally {
      setAvatarUploading(false);
    }
  };

  // Check if form has unsaved changes
  const hasChanges = useMemo(() => {
    return (
      formData.name !== (baby.name || '') ||
      formData.dateOfBirth !== (baby.dateOfBirth || '') ||
      formData.gender !== (baby.gender || 'other') ||
      formData.avatarUrl !== baby.avatarUrl
    );
  }, [formData, baby]);

  const dobValidation = validateDateOfBirth(formData.dateOfBirth);
  const isValid =
    formData.name.trim() !== '' &&
    formData.dateOfBirth.trim() !== '' &&
    dobValidation.valid;

  const handleSave = async () => {
    if (!isValid) return;
    if (isSaving) return;
    setIsSaving(true);
    try {
      await Promise.resolve(onUpdate(formData));
    } finally {
      setIsSaving(false);
    }
  };

  const age = baby.dateOfBirth ? formatAge(t, baby.dateOfBirth) : '';
  const subtitle = age
    ? t('babyDetail.ageOld', { age })
    : isOwner
      ? t('babyDetail.editProfile')
      : t('babyDetail.viewProfile');

  // When user taps back: save first if there are valid unsaved changes, then navigate.
  // This matches the expectation that "back" = done and keeps changes (many users never tap "Save").
  const handleBack = async () => {
    if (isOwner && hasChanges && isValid && !isSaving) {
      setIsSaving(true);
      try {
        await Promise.resolve(onUpdate(formData));
        onBack();
      } catch (err) {
        console.error('Save on back failed:', err);
        // Stay on screen so user can retry or tap Save Changes
      } finally {
        setIsSaving(false);
      }
    } else {
      onBack();
    }
  };

  return (
    <div className="space-y-6">
      <SubViewHeader
        title={baby.name || t('common.baby')}
        subtitle={subtitle}
        onBack={handleBack}
      />

      {/* Avatar */}
      <div className="flex flex-col items-center pt-2 pb-2">
        <BabyAvatarPicker
          avatarUrl={formData.avatarUrl}
          babyName={formData.name || '?'}
          size="lg"
          editable={isOwner && !!onUploadAvatar}
          onUpload={handleAvatarUpload}
          uploading={avatarUploading}
        />
        {isOwner && onUploadAvatar && (
          <p className="text-xs text-[var(--text-muted)] mt-3">
            {t('babyEdit.tapPhotoToChange')}
          </p>
        )}
      </div>

      {/* Section 1 — Baby Profile */}
      <div className="space-y-3">
        {/* Name & Birthday */}
        <div className="rounded-2xl bg-[var(--bg-soft)] border border-[var(--glass-border)] p-4 space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1.5 font-display uppercase tracking-wider">
              {t('common.name')}
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t('babyEdit.babyName')}
              disabled={!isOwner}
              className="w-full bg-transparent border-none text-[var(--text-primary)] text-lg font-display font-medium placeholder:text-[var(--text-muted)]/40 focus:outline-none focus:ring-0 disabled:opacity-60"
            />
          </div>

          <div className="border-t border-[var(--text-muted)]/15 pt-4">
            <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1.5 font-display uppercase tracking-wider">
              {t('babyEdit.dateOfBirth')}
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              disabled={!isOwner}
              className="w-full bg-transparent border-none text-[var(--text-primary)] text-base font-display focus:outline-none focus:ring-0 disabled:opacity-60"
              aria-invalid={formData.dateOfBirth.trim() !== '' && !dobValidation.valid}
              aria-describedby={formData.dateOfBirth.trim() !== '' && dobValidation.errorKey ? 'baby-detail-dob-error' : undefined}
            />
            {isOwner && formData.dateOfBirth.trim() !== '' && dobValidation.errorKey && (
              <p id="baby-detail-dob-error" className="text-xs text-[var(--danger-color)] mt-1.5">
                {dobValidation.errorKey === 'babyEdit.dobFuture' ? t('babyEdit.dobFuture') : t('babyEdit.dobInvalid', { year: new Date().getFullYear() })}
              </p>
            )}
          </div>
        </div>

        {/* Gender — dropdown for owners, plain text for view-only */}
        <div className="rounded-2xl bg-[var(--bg-soft)] border border-[var(--glass-border)] p-4">
          <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1.5 font-display uppercase tracking-wider">
            {t('babyEdit.gender')}
          </label>
          {isOwner ? (
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full bg-transparent border-none text-[var(--text-primary)] text-base font-display focus:outline-none focus:ring-0"
            >
              <option value="male">{t('babyEdit.male')}</option>
              <option value="female">{t('babyEdit.female')}</option>
              <option value="other">{t('babyEdit.other')}</option>
            </select>
          ) : (
            <p className="text-[var(--text-primary)] text-base font-display">
              {formData.gender === 'male' ? t('babyEdit.male') : formData.gender === 'female' ? t('babyEdit.female') : t('babyEdit.other')}
            </p>
          )}
        </div>

        {/* Baby weight — compact: latest + Add + View all */}
        <GrowthLogSection
          titleKey="growth.babyWeight"
          items={weightLogs.map((l) => ({ id: l.id, date: l.date, value: l.valueKg }))}
          unitLabel={t('growth.kg')}
          canEdit={canEditGrowth}
          onAdd={() => {
            setEditingWeightLog(null);
            setGrowthSheet('weight');
          }}
          onEdit={(id) => {
            const log = weightLogs.find((l) => l.id === id);
            if (log) {
              setEditingWeightLog(log);
              setGrowthSheet('weight');
            }
          }}
          onDelete={(id) => setGrowthDeleteConfirm({ type: 'weight', id })}
        />

        {/* Baby height — compact: latest + Add + View all */}
        <GrowthLogSection
          titleKey="growth.babyHeight"
          items={heightLogs.map((l) => ({ id: l.id, date: l.date, value: l.valueCm }))}
          unitLabel={t('growth.cm')}
          canEdit={canEditGrowth}
          onAdd={() => {
            setEditingHeightLog(null);
            setGrowthSheet('height');
          }}
          onEdit={(id) => {
            const log = heightLogs.find((l) => l.id === id);
            if (log) {
              setEditingHeightLog(log);
              setGrowthSheet('height');
            }
          }}
          onDelete={(id) => setGrowthDeleteConfirm({ type: 'height', id })}
        />
      </div>

      {/* Growth log sheet (weight or height) */}
      <GrowthLogSheet
        isOpen={growthSheet !== null}
        onClose={() => {
          setGrowthSheet(null);
          setEditingWeightLog(null);
          setEditingHeightLog(null);
        }}
        mode={growthSheet === 'height' ? 'height' : 'weight'}
        initialDate={editingWeightLog?.date ?? editingHeightLog?.date}
        initialValue={editingWeightLog?.valueKg ?? editingHeightLog?.valueCm}
        existingLogId={editingWeightLog?.id ?? editingHeightLog?.id ?? null}
        defaultDate={getTodayDateStr()}
        getWarning={growthSheet === 'weight' ? getWeightWarning : growthSheet === 'height' ? getHeightWarning : undefined}
        onSave={async (date, value) => {
          if (growthSheet === 'weight') {
            if (editingWeightLog) {
              await updateWeightLog(editingWeightLog.id, date, value);
            } else {
              await addWeightLog(baby.id, date, value);
            }
          } else if (growthSheet === 'height') {
            if (editingHeightLog) {
              await updateHeightLog(editingHeightLog.id, date, value);
            } else {
              await addHeightLog(baby.id, date, value);
            }
          }
        }}
      />

      {/* Delete growth log confirmation */}
      <ConfirmationModal
        isOpen={growthDeleteConfirm !== null}
        onConfirm={async () => {
          if (growthDeleteConfirm) {
            if (growthDeleteConfirm.type === 'weight') {
              await deleteWeightLog(growthDeleteConfirm.id);
            } else {
              await deleteHeightLog(growthDeleteConfirm.id);
            }
            setGrowthDeleteConfirm(null);
          }
        }}
        onCancel={() => setGrowthDeleteConfirm(null)}
        title={t('growth.deleteConfirmTitle')}
        description={t('growth.deleteConfirmDescription')}
      />

      {/* Save button — only visible when form has unsaved changes */}
      {isOwner && hasChanges && (
        <div>
          <button
            onClick={handleSave}
            disabled={!isValid || isSaving}
            className={`w-full py-4 rounded-2xl font-display font-semibold text-base transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
              isValid && !isSaving
                ? 'bg-[var(--nap-color)] text-[var(--text-on-accent)] shadow-lg shadow-[var(--nap-color)]/20'
                : 'bg-[var(--bg-soft)] text-[var(--text-muted)]/40 cursor-not-allowed'
            }`}
            aria-busy={isSaving}
            aria-describedby={!isValid ? 'save-helper' : undefined}
          >
            {isSaving ? (
              <>
                <span className="w-5 h-5 rounded-full border-2 border-current/30 border-t-current animate-spin" aria-hidden="true" />
                {t('common.saving')}
              </>
            ) : (
              t('profile.saveChanges')
            )}
          </button>
          {!isValid && (
            <p id="save-helper" className="text-xs text-[var(--text-muted)] text-center mt-2">
              {t('babyDetail.nameBirthdayRequired')}
            </p>
          )}
        </div>
      )}

      {/* Section 2 — Sharing (owners only) */}
      {isOwner && (
        <ShareAccess
          myShares={myShares}
          pendingInvitations={[]}
          onInvite={onInvite}
          onUpdateRole={onUpdateRole}
          onRevokeAccess={onRevokeAccess}
          onAcceptInvitation={async () => ({ success: true })}
          onDeclineInvitation={async () => ({ success: true })}
          inviterName={inviterName}
          babyName={formData.name}
        />
      )}

      {/* Delete baby — subtle at bottom (owners only) */}
      {isOwner && onDeleteBaby && (
        <div className="pt-4 pb-8 border-t border-[var(--text-muted)]/10">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full text-center text-xs text-[var(--danger-color)]/60 hover:text-[var(--danger-color)] transition-colors font-display"
          >
            {t('babyEdit.deleteBaby')}
          </button>
        </div>
      )}

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onConfirm={async () => {
          if (onDeleteBaby) {
            await onDeleteBaby();
            setShowDeleteConfirm(false);
            onBack();
          }
        }}
        onCancel={() => setShowDeleteConfirm(false)}
        title={t('babyEdit.deleteProfileConfirmTitle')}
        description={t('babyEdit.deleteProfileConfirmDescription', { name: baby?.name || t('common.baby') })}
      />
    </div>
  );
}
