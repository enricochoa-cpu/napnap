import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import type { BabyProfile } from '../../types';
import { BabyAvatarPicker } from './BabyAvatarPicker';

interface BabyEditSheetProps {
  baby: BabyProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Omit<BabyProfile, 'id'>>) => void;
  onUploadAvatar?: (file: File) => Promise<string | null>;
  isNewBaby?: boolean;
}

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const CheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export function BabyEditSheet({
  baby,
  isOpen,
  onClose,
  onSave,
  onUploadAvatar,
  isNewBaby = false,
}: BabyEditSheetProps) {
  const [avatarUploading, setAvatarUploading] = useState(false);
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

  // Motion values for drag-to-dismiss
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
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ opacity: backdropOpacity }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
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
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={handleDragEnd}
            style={{ y }}
            className="fixed bottom-0 left-0 right-0 z-50 touch-none max-h-[90dvh] overflow-hidden"
          >
            <div className="bg-[var(--bg-card)] rounded-t-[2rem] shadow-[0_-8px_40px_rgba(0,0,0,0.3)] max-h-[90dvh] overflow-y-auto">
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing sticky top-0 bg-[var(--bg-card)]">
                <div className="w-10 h-1 bg-[var(--text-muted)]/30 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 pb-4 sticky top-6 bg-[var(--bg-card)] z-10">
                <button
                  onClick={onClose}
                  className="p-2 -ml-2 rounded-xl text-[var(--text-muted)] hover:bg-white/10 transition-colors"
                  aria-label="Cancel"
                >
                  <CloseIcon />
                </button>

                <h2 className="font-display font-bold text-lg text-[var(--text-primary)]">
                  {isNewBaby ? 'Add Baby' : 'Edit Baby'}
                </h2>

                <button
                  onClick={handleSave}
                  disabled={!isValid}
                  className={`p-2 -mr-2 rounded-xl transition-colors ${
                    isValid
                      ? 'text-[var(--nap-color)] hover:bg-[var(--nap-color)]/10'
                      : 'text-[var(--text-muted)]/30 cursor-not-allowed'
                  }`}
                  aria-label="Save"
                >
                  <CheckIcon />
                </button>
              </div>

              {/* Avatar - Large & Centered */}
              <div className="flex flex-col items-center pb-6 px-6">
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
                  <p className="text-sm text-[var(--text-muted)] mt-3">
                    Tap to change photo
                  </p>
                )}
              </div>

              {/* Form Fields - Grouped in Glass Cards */}
              <div className="px-6 pb-6 space-y-4">
                {/* Name & Birthday Card */}
                <div className="rounded-3xl bg-white/[0.06] backdrop-blur-xl border border-white/10 p-4 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-muted)] mb-2 font-display uppercase tracking-wider">
                      Baby's Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter name..."
                      className="input"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--text-muted)] mb-2 font-display uppercase tracking-wider">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="input"
                    />
                  </div>
                </div>

                {/* Gender Card */}
                <div className="rounded-3xl bg-white/[0.06] backdrop-blur-xl border border-white/10 p-4">
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-2 font-display uppercase tracking-wider">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Not relevant</option>
                  </select>
                </div>

                {/* Measurements Card */}
                <div className="rounded-3xl bg-white/[0.06] backdrop-blur-xl border border-white/10 p-4">
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-3 font-display uppercase tracking-wider">
                    Measurements (optional)
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[var(--text-muted)] mb-1">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight || ''}
                        onChange={handleChange}
                        step="0.1"
                        min="0"
                        placeholder="0.0"
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--text-muted)] mb-1">
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        name="height"
                        value={formData.height || ''}
                        onChange={handleChange}
                        step="0.1"
                        min="0"
                        placeholder="0.0"
                        className="input"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button - Fixed at bottom */}
              <div className="px-6 pb-8">
                <button
                  onClick={handleSave}
                  disabled={!isValid}
                  className={`w-full py-4 rounded-2xl font-display font-semibold text-lg transition-all active:scale-[0.98] ${
                    isValid
                      ? 'bg-[var(--nap-color)] text-white shadow-lg shadow-[var(--nap-color)]/25'
                      : 'bg-white/10 text-[var(--text-muted)]/50 cursor-not-allowed'
                  }`}
                >
                  {isNewBaby ? 'Add Baby' : 'Save Changes'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
