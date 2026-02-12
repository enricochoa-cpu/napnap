import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import type { BabyProfile } from '../../types';
import { BabyAvatarPicker } from './BabyAvatarPicker';
import { ConfirmationModal } from '../ConfirmationModal';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface BabyEditSheetProps {
  baby: BabyProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Omit<BabyProfile, 'id'>>) => void;
  onUploadAvatar?: (file: File) => Promise<string | null>;
  onDeleteBaby?: () => Promise<void>;
  isNewBaby?: boolean;
}

export function BabyEditSheet({
  baby,
  isOpen,
  onClose,
  onSave,
  onUploadAvatar,
  onDeleteBaby,
  isNewBaby = false,
}: BabyEditSheetProps) {
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    gender: 'other' as 'male' | 'female' | 'other',
    weight: 0,
    height: 0,
    avatarUrl: undefined as string | undefined,
  });

  // Reset form when sheet opens
  useEffect(() => {
    if (isOpen && baby) {
      setFormData({
        name: baby.name || '',
        dateOfBirth: baby.dateOfBirth || '',
        gender: baby.gender || 'other',
        weight: baby.weight || 0,
        height: baby.height || 0,
        avatarUrl: baby.avatarUrl,
      });
    } else if (isOpen && isNewBaby) {
      setFormData({
        name: '',
        dateOfBirth: '',
        gender: 'other',
        weight: 0,
        height: 0,
        avatarUrl: undefined,
      });
    }
  }, [isOpen, baby, isNewBaby]);

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

  const handleSave = () => {
    if (!formData.name || !formData.dateOfBirth) return;
    onSave(formData);
    onClose();
  };

  const isValid = formData.name.trim() !== '' && formData.dateOfBirth !== '';

  const dialogRef = useFocusTrap(isOpen, onClose);

  // Motion values for drag-to-dismiss
  const y = useMotionValue(0);
  const backdropOpacity = useTransform(y, [0, 300], [1, 0]);

  const handleDragEnd = (_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
    if (info.offset.y > 150 || info.velocity.y > 500) {
      onClose();
    }
  };

  return (
    <>
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dark overlay with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ opacity: backdropOpacity }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Glass Bottom Sheet */}
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={isNewBaby ? 'Add baby' : 'Edit baby profile'}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              duration: 0.25,
              ease: 'easeOut',
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={handleDragEnd}
            style={{ y }}
            className="fixed bottom-0 left-0 right-0 z-50 touch-none max-h-[90dvh] overflow-hidden"
          >
            <div className="backdrop-blur-2xl rounded-t-[40px] max-h-[90dvh] overflow-y-auto" style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--glass-border)', boxShadow: '0 -8px 40px rgba(0,0,0,0.2)' }}>
              {/* Drag Handle */}
              <div className="flex justify-center pt-4 pb-2 cursor-grab active:cursor-grabbing sticky top-0 backdrop-blur-2xl rounded-t-[40px]" style={{ background: 'var(--bg-card)' }}>
                <div className="w-10 h-1 bg-[var(--text-muted)]/25 rounded-full" />
              </div>

              {/* Avatar - Star of the Show */}
              <div className="flex flex-col items-center pt-4 pb-6 px-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <BabyAvatarPicker
                    avatarUrl={formData.avatarUrl}
                    babyName={formData.name || '?'}
                    size="lg"
                    editable={!!onUploadAvatar}
                    onUpload={handleAvatarUpload}
                    uploading={avatarUploading}
                  />
                </motion.div>
                {onUploadAvatar && (
                  <p className="text-xs text-[var(--text-muted)] mt-3">
                    Tap photo to change
                  </p>
                )}
              </div>

              {/* Form Fields - Grouped in Soft Cards */}
              <div className="px-6 pb-4 space-y-3">
                {/* Name & Birthday */}
                <div className="rounded-2xl bg-[var(--bg-soft)] border border-[var(--glass-border)] p-4 space-y-4">
                  <div>
                    <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1.5 font-display uppercase tracking-wider">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Baby's name"
                      className="w-full bg-transparent border-none text-[var(--text-primary)] text-lg font-display font-medium placeholder:text-[var(--text-muted)]/40 focus:outline-none focus:ring-0"
                      autoFocus
                    />
                  </div>

                  <div className="border-t border-[var(--text-muted)]/15 pt-4">
                    <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1.5 font-display uppercase tracking-wider">
                      Birthday
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="w-full bg-transparent border-none text-[var(--text-primary)] text-base font-display focus:outline-none focus:ring-0"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div className="rounded-2xl bg-[var(--bg-soft)] border border-[var(--glass-border)] p-4">
                  <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1.5 font-display uppercase tracking-wider">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full bg-transparent border-none text-[var(--text-primary)] text-base font-display focus:outline-none focus:ring-0"
                  >
                    <option value="male">Boy</option>
                    <option value="female">Girl</option>
                    <option value="other">Not specified</option>
                  </select>
                </div>

                {/* Measurements */}
                <div className="rounded-2xl bg-[var(--bg-soft)] border border-[var(--glass-border)] p-4">
                  <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-3 font-display uppercase tracking-wider">
                    Measurements
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-[var(--text-muted)] mb-1">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight || ''}
                        onChange={handleChange}
                        step="0.1"
                        min="0"
                        placeholder="—"
                        className="w-full bg-transparent border-none text-[var(--text-primary)] text-base font-display focus:outline-none focus:ring-0 placeholder:text-[var(--text-muted)]/30"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[var(--text-muted)] mb-1">
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        name="height"
                        value={formData.height || ''}
                        onChange={handleChange}
                        step="0.1"
                        min="0"
                        placeholder="—"
                        className="w-full bg-transparent border-none text-[var(--text-primary)] text-base font-display focus:outline-none focus:ring-0 placeholder:text-[var(--text-muted)]/30"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 pt-2 pb-6 space-y-3">
                {/* Save Button */}
                <button
                  onClick={handleSave}
                  disabled={!isValid}
                  className={`w-full py-4 rounded-2xl font-display font-semibold text-base transition-all active:scale-[0.98] ${
                    isValid
                      ? 'bg-[var(--nap-color)] text-white shadow-lg shadow-[var(--nap-color)]/20'
                      : 'bg-[var(--bg-soft)] text-[var(--text-muted)]/40 cursor-not-allowed'
                  }`}
                >
                  {isNewBaby ? 'Add Baby' : 'Save Changes'}
                </button>

                {/* Cancel Link */}
                <button
                  onClick={onClose}
                  className="w-full py-2 text-[var(--text-muted)] font-display font-medium text-sm hover:text-[var(--text-primary)] transition-colors"
                >
                  Cancel
                </button>
              </div>

              {/* Delete Baby - Subtle at bottom (only for existing babies) */}
              {!isNewBaby && baby && onDeleteBaby && (
                <div className="px-6 pb-8 pt-4 border-t border-[var(--text-muted)]/10">
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full text-center text-xs text-[var(--danger-color)]/60 hover:text-[var(--danger-color)] transition-colors font-display"
                  >
                    Delete baby profile
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>

    <ConfirmationModal
      isOpen={showDeleteConfirm}
      onConfirm={async () => {
        if (onDeleteBaby) {
          await onDeleteBaby();
          setShowDeleteConfirm(false);
          onClose();
        }
      }}
      onCancel={() => setShowDeleteConfirm(false)}
      title="Delete baby profile?"
      description={`${baby?.name || 'This baby'}'s profile and all associated sleep entries will be permanently removed.`}
    />
    </>
  );
}
