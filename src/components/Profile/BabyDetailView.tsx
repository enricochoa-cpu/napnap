import { useState, useEffect, useMemo } from 'react';
import type { BabyProfile, BabyShare } from '../../types';
import { calculateAge } from '../../utils/dateUtils';
import { BabyAvatarPicker } from './BabyAvatarPicker';
import { SubViewHeader } from './SubViewHeader';
import { ShareAccess } from '../ShareAccess';

interface BabyDetailViewProps {
  baby: BabyProfile;
  isOwner: boolean;
  onBack: () => void;
  onUpdate: (data: Partial<Omit<BabyProfile, 'id'>>) => void;
  onUploadAvatar?: (file: File) => Promise<string | null>;
  // Sharing props (owners only)
  myShares: BabyShare[];
  onInvite: (email: string, role: 'caregiver' | 'viewer', inviterName?: string, babyName?: string) => Promise<{ success: boolean; error?: string }>;
  onUpdateRole: (shareId: string, role: 'caregiver' | 'viewer') => Promise<{ success: boolean; error?: string }>;
  onRevokeAccess: (shareId: string) => Promise<{ success: boolean; error?: string }>;
  inviterName?: string;
}

export function BabyDetailView({
  baby,
  isOwner,
  onBack,
  onUpdate,
  onUploadAvatar,
  myShares,
  onInvite,
  onUpdateRole,
  onRevokeAccess,
  inviterName,
}: BabyDetailViewProps) {
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: baby.name || '',
    dateOfBirth: baby.dateOfBirth || '',
    gender: (baby.gender || 'other') as 'male' | 'female' | 'other',
    weight: baby.weight || 0,
    height: baby.height || 0,
    avatarUrl: baby.avatarUrl,
  });

  // Reset form when baby changes
  useEffect(() => {
    setFormData({
      name: baby.name || '',
      dateOfBirth: baby.dateOfBirth || '',
      gender: (baby.gender || 'other') as 'male' | 'female' | 'other',
      weight: baby.weight || 0,
      height: baby.height || 0,
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
      formData.weight !== (baby.weight || 0) ||
      formData.height !== (baby.height || 0) ||
      formData.avatarUrl !== baby.avatarUrl
    );
  }, [formData, baby]);

  const isValid = formData.name.trim() !== '' && formData.dateOfBirth !== '';

  const handleSave = () => {
    if (!isValid) return;
    onUpdate(formData);
  };

  const age = baby.dateOfBirth ? calculateAge(baby.dateOfBirth) : '';

  return (
    <div className="space-y-6">
      <SubViewHeader
        title={baby.name || 'Baby'}
        subtitle={age ? `${age} old` : 'Edit profile'}
        onBack={onBack}
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
            Tap photo to change
          </p>
        )}
      </div>

      {/* Section 1 — Baby Profile */}
      <div className="space-y-3">
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
              disabled={!isOwner}
              className="w-full bg-transparent border-none text-[var(--text-primary)] text-lg font-display font-medium placeholder:text-[var(--text-muted)]/40 focus:outline-none focus:ring-0 disabled:opacity-60"
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
              disabled={!isOwner}
              className="w-full bg-transparent border-none text-[var(--text-primary)] text-base font-display focus:outline-none focus:ring-0 disabled:opacity-60"
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
            disabled={!isOwner}
            className="w-full bg-transparent border-none text-[var(--text-primary)] text-base font-display focus:outline-none focus:ring-0 disabled:opacity-60"
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
                disabled={!isOwner}
                className="w-full bg-transparent border-none text-[var(--text-primary)] text-base font-display focus:outline-none focus:ring-0 placeholder:text-[var(--text-muted)]/30 disabled:opacity-60"
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
                disabled={!isOwner}
                className="w-full bg-transparent border-none text-[var(--text-primary)] text-base font-display focus:outline-none focus:ring-0 placeholder:text-[var(--text-muted)]/30 disabled:opacity-60"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save button — only visible when form has unsaved changes */}
      {isOwner && hasChanges && (
        <button
          onClick={handleSave}
          disabled={!isValid}
          className={`w-full py-4 rounded-2xl font-display font-semibold text-base transition-all active:scale-[0.98] ${
            isValid
              ? 'bg-[var(--nap-color)] text-white shadow-lg shadow-[var(--nap-color)]/20'
              : 'bg-[var(--bg-soft)] text-[var(--text-muted)]/40 cursor-not-allowed'
          }`}
        >
          Save Changes
        </button>
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
      {isOwner && (
        <div className="pt-4 pb-8 border-t border-[var(--text-muted)]/10">
          <button
            onClick={() => {
              // TODO: Implement delete functionality
              if (confirm('Are you sure you want to remove this baby profile?')) {
                onBack();
              }
            }}
            className="w-full text-center text-xs text-[var(--danger-color)]/60 hover:text-[var(--danger-color)] transition-colors font-display"
          >
            Delete baby profile
          </button>
        </div>
      )}
    </div>
  );
}
