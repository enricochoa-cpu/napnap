import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import type { BabyProfile, BabyShare } from '../../types';
import { formatAge, validateDateOfBirth, getDateOfBirthInputBounds } from '../../utils/dateUtils';
import { BabyAvatarPicker } from './BabyAvatarPicker';
import { SubViewHeader } from './SubViewHeader';
import { ConfirmationModal } from '../ConfirmationModal';
import { useGrowthLogs } from '../../hooks/useGrowthLogs';
import { ListRow } from './ProfileMenu';

interface BabyDetailViewProps {
  baby: BabyProfile;
  isOwner: boolean;
  onBack: () => void;
  /** Can return a Promise so we can show loading and prevent double-submit */
  onUpdate: (data: Partial<Omit<BabyProfile, 'id'>>) => void | Promise<void>;
  onUploadAvatar?: (file: File) => Promise<string | null>;
  /** When true, user can add/edit/delete weight and height logs (owner or caregiver). */
  canEditGrowth?: boolean;
  onDeleteBaby?: () => Promise<void>;
  /** Opens the dedicated Share Access screen (owners only). When set, Baby Detail shows a "Share baby profile" row. */
  onOpenShareAccess?: () => void;
  /** Shares for this baby (to show count). Filter by babyOwnerId === baby.id. */
  myShares?: BabyShare[];
  /** Opens the Measures view for this baby. */
  onOpenMeasures?: () => void;
}

const MeasuresIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18" />
    <path d="M18 17V9" />
    <path d="M13 17V5" />
    <path d="M8 17v-3" />
  </svg>
);

const ShareIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

export function BabyDetailView({
  baby,
  isOwner,
  onBack,
  onUpdate,
  onUploadAvatar,
  onDeleteBaby,
  onOpenShareAccess,
  myShares = [],
  onOpenMeasures,
}: BabyDetailViewProps) {
  const { t } = useTranslation();
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);

  const flashSavedToast = useCallback(() => {
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  }, []);

  const { measurementLogs } = useGrowthLogs({ babyId: baby.id });

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
    const recheck = validateDateOfBirth(formData.dateOfBirth);
    if (!recheck.valid) return;
    if (isSaving) return;
    setIsSaving(true);
    try {
      await Promise.resolve(onUpdate(formData));
      flashSavedToast();
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
  // If changes exist but are invalid, warn before discarding.
  const handleBack = async () => {
    const dobOk = validateDateOfBirth(formData.dateOfBirth).valid;
    if (isOwner && hasChanges && isValid && dobOk && !isSaving) {
      // Valid changes — auto-save
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
    } else if (isOwner && hasChanges && !isValid) {
      // Invalid changes — confirm discard
      setShowDiscardConfirm(true);
    } else {
      onBack();
    }
  };

  return (
    <div className="space-y-6">
      <SubViewHeader
        title={formData.name || baby.name || t('common.baby')}
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
              min={getDateOfBirthInputBounds().min}
              max={getDateOfBirthInputBounds().max}
              className="w-full bg-transparent border-none text-[var(--text-primary)] text-base font-display focus:outline-none focus:ring-0 disabled:opacity-60"
              aria-invalid={formData.dateOfBirth.trim() !== '' && !dobValidation.valid}
              aria-describedby={formData.dateOfBirth.trim() !== '' && dobValidation.errorKey ? 'baby-detail-dob-error' : undefined}
            />
            {isOwner && formData.dateOfBirth.trim() !== '' && dobValidation.errorKey && (
              <p id="baby-detail-dob-error" className="text-xs text-[var(--danger-color)] mt-1.5" role="alert">
                {dobValidation.errorKey === 'babyEdit.dobFuture'
                  ? t('babyEdit.dobFuture')
                  : dobValidation.errorKey === 'babyEdit.dobTooOld'
                    ? t('babyEdit.dobTooOld')
                    : t('babyEdit.dobInvalid')}
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

      </div>

      {/* Save button — always visible for owners; disabled when no changes */}
      {isOwner && (
        <div>
          <button
            onClick={handleSave}
            disabled={!hasChanges || !isValid || isSaving}
            className={`w-full py-4 rounded-2xl font-display font-semibold text-base transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
              hasChanges && isValid && !isSaving
                ? 'bg-[var(--nap-color)] text-[var(--text-on-accent)] shadow-lg shadow-[var(--nap-color)]/20'
                : 'bg-[var(--bg-soft)] text-[var(--text-muted)]/40 cursor-not-allowed'
            }`}
            aria-busy={isSaving}
            aria-describedby={hasChanges && !isValid ? 'save-helper' : undefined}
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
          {hasChanges && !isValid && (
            <p id="save-helper" className="text-xs text-[var(--text-muted)] text-center mt-2">
              {t('babyDetail.nameBirthdayRequired')}
            </p>
          )}
        </div>
      )}

      {/* Measures — opens dedicated Measures view */}
      {onOpenMeasures && (
        <ListRow
          icon={<MeasuresIcon />}
          title={t('measures.title')}
          subtitle={measurementLogs.length === 0 ? t('measures.empty') : t('measures.subtitleCount', { count: measurementLogs.length })}
          onClick={onOpenMeasures}
          iconColorClass="bg-[var(--nap-color)]/20 text-[var(--nap-color)]"
        />
      )}

      {/* Section 2 — Sharing: same ListRow pattern as Measures (icon + title + count) */}
      {isOwner && onOpenShareAccess && (
        <ListRow
          icon={<ShareIcon />}
          title={t('babyDetail.manageSharing')}
          subtitle={t('babyDetail.sharedCount', {
            count: myShares.filter((s) => s.babyOwnerId === baby.id && s.status === 'accepted').length,
          })}
          onClick={onOpenShareAccess}
          iconColorClass="bg-[var(--night-color)]/20 text-[var(--night-color)]"
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

      {/* Discard unsaved changes confirmation */}
      <ConfirmationModal
        isOpen={showDiscardConfirm}
        onConfirm={() => {
          setShowDiscardConfirm(false);
          onBack();
        }}
        onCancel={() => setShowDiscardConfirm(false)}
        title={t('babyDetail.discardChangesTitle')}
        description={t('babyDetail.discardChangesDescription')}
      />

      {/* Save confirmation toast */}
      <AnimatePresence>
        {showSavedToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl flex items-center gap-2 shadow-lg"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)' }}
          >
            <span className="text-[var(--success-color)] text-base" aria-hidden="true">&#x2713;</span>
            <span className="text-sm font-display font-medium text-[var(--text-primary)]">
              {t('common.changesSaved')}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
