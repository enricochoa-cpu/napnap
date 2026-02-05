import { useState, useEffect } from 'react';
import type { BabyProfile as BabyProfileType, UserProfile, BabyShare } from '../../types';
import { calculateAge } from '../../utils/dateUtils';
import { ShareAccess } from '../ShareAccess';
import { BabyAvatarPicker } from './BabyAvatarPicker';

interface SharedBabyProfile extends BabyProfileType {
  isOwner: boolean;
  ownerName?: string;
}

interface MyBabiesViewProps {
  profile: BabyProfileType | null;
  sharedProfiles: SharedBabyProfile[];
  activeBabyId: string | null;
  onActiveBabyChange: (babyId: string) => void;
  onSave: (data: Omit<BabyProfileType, 'id'> & Partial<Omit<UserProfile, 'email'>>) => void;
  onUpdate: (data: Partial<Omit<BabyProfileType, 'id'>>) => void;
  onUploadAvatar?: (file: File) => Promise<string | null>;
  onBack: () => void;
  // Sharing props
  myShares: BabyShare[];
  onInvite: (email: string, role: 'caregiver' | 'viewer') => Promise<{ success: boolean; error?: string }>;
  onRevokeAccess: (shareId: string) => Promise<{ success: boolean; error?: string }>;
}

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export function MyBabiesView({
  profile,
  sharedProfiles,
  activeBabyId,
  onActiveBabyChange,
  onSave,
  onUpdate,
  onUploadAvatar,
  onBack,
  myShares,
  onInvite,
  onRevokeAccess,
}: MyBabiesViewProps) {
  const hasAnyBabies = sharedProfiles.length > 0;
  const [isEditingBaby, setIsEditingBaby] = useState(false);
  const [showAddBabyForm, setShowAddBabyForm] = useState(!hasAnyBabies && !profile);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [babyFormData, setBabyFormData] = useState({
    name: profile?.name || '',
    dateOfBirth: profile?.dateOfBirth || '',
    gender: profile?.gender || 'other' as const,
    weight: profile?.weight || 0,
    height: profile?.height || 0,
  });

  useEffect(() => {
    if (profile) {
      setBabyFormData({
        name: profile.name,
        dateOfBirth: profile.dateOfBirth,
        gender: profile.gender,
        weight: profile.weight,
        height: profile.height,
      });
      if (profile.name) {
        setIsEditingBaby(false);
        setShowAddBabyForm(false);
      }
    }
  }, [profile]);

  useEffect(() => {
    if (sharedProfiles.length > 0 && !profile) {
      setShowAddBabyForm(false);
    }
  }, [sharedProfiles, profile]);

  const handleBabySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile) {
      onUpdate(babyFormData);
    } else {
      onSave(babyFormData);
    }
    setIsEditingBaby(false);
    setShowAddBabyForm(false);
  };

  const handleBabyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setBabyFormData((prev) => ({
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
        onUpdate({ avatarUrl });
      }
    } catch (error) {
      console.error('Avatar upload failed:', error);
    } finally {
      setAvatarUploading(false);
    }
  };

  const ownBabies = sharedProfiles.filter(b => b.isOwner);

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors"
          aria-label="Go back"
        >
          <BackIcon />
        </button>
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">
            My babies
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Edit your baby details
          </p>
        </div>
      </div>

      {/* Babies You're Tracking */}
      {hasAnyBabies && (
        <div className="card p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-display font-bold text-[var(--text-primary)]">
              Babies you're tracking
            </h2>
          </div>

          <div className="space-y-3">
            {sharedProfiles.map((baby) => (
              <button
                key={baby.id}
                onClick={() => onActiveBabyChange(baby.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                  activeBabyId === baby.id
                    ? 'bg-[var(--nap-color)]/15 border-2 border-[var(--nap-color)]/40'
                    : 'bg-[var(--bg-soft)] border-2 border-transparent hover:border-[var(--text-muted)]/20'
                }`}
              >
                <div className="flex-shrink-0">
                  <BabyAvatarPicker
                    avatarUrl={baby.avatarUrl}
                    babyName={baby.name || '?'}
                    size="sm"
                    editable={false}
                  />
                </div>

                <div className="flex-1 text-left min-w-0">
                  <p className={`font-display font-semibold truncate ${
                    activeBabyId === baby.id
                      ? 'text-[var(--text-primary)]'
                      : 'text-[var(--text-secondary)]'
                  }`}>
                    {baby.name || 'Unnamed baby'}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {baby.isOwner ? 'Your baby' : <>Shared by {baby.ownerName || 'parent'}</>}
                    {baby.dateOfBirth && <> · {calculateAge(baby.dateOfBirth)}</>}
                  </p>
                </div>

                {activeBabyId === baby.id && (
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-[var(--nap-color)]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          {!profile && !showAddBabyForm && (
            <button
              onClick={() => setShowAddBabyForm(true)}
              className="w-full mt-4 p-4 rounded-xl border-2 border-dashed border-[var(--text-muted)]/30 text-[var(--text-muted)] hover:border-[var(--nap-color)]/50 hover:text-[var(--nap-color)] transition-colors"
            >
              + Add your own baby
            </button>
          )}
        </div>
      )}

      {/* Baby Form */}
      {(showAddBabyForm || isEditingBaby || (!hasAnyBabies && !profile)) && (
        <div className="card p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-display font-bold text-[var(--text-primary)]">
              {profile ? 'Edit your baby' : 'Add your baby'}
            </h2>
            {(showAddBabyForm || isEditingBaby) && hasAnyBabies && (
              <button
                onClick={() => {
                  setShowAddBabyForm(false);
                  setIsEditingBaby(false);
                }}
                className="text-[var(--text-muted)] text-sm font-medium font-display"
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleBabySubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
                Baby's Name
              </label>
              <input
                type="text"
                name="name"
                value={babyFormData.name}
                onChange={handleBabyChange}
                required
                placeholder="Enter name..."
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={babyFormData.dateOfBirth}
                onChange={handleBabyChange}
                required
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
                Gender
              </label>
              <select
                name="gender"
                value={babyFormData.gender}
                onChange={handleBabyChange}
                className="input"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Not relevant</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={babyFormData.weight || ''}
                  onChange={handleBabyChange}
                  step="0.1"
                  min="0"
                  placeholder="0.0"
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
                  Height (cm)
                </label>
                <input
                  type="number"
                  name="height"
                  value={babyFormData.height || ''}
                  onChange={handleBabyChange}
                  step="0.1"
                  min="0"
                  placeholder="0.0"
                  className="input"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn btn-nap flex-1">
                {profile ? 'Save Changes' : 'Add Baby'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Own baby display (when not editing and has profile) */}
      {profile && !isEditingBaby && !showAddBabyForm && hasAnyBabies && ownBabies.length > 0 && (
        <div className="card p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-display font-bold text-[var(--text-primary)]">
              Your baby's details
            </h2>
            <button
              onClick={() => setIsEditingBaby(true)}
              className="text-[var(--nap-color)] text-sm font-medium font-display"
            >
              Edit
            </button>
          </div>

          {/* Editable avatar */}
          <div className="flex flex-col items-center mb-6">
            <BabyAvatarPicker
              avatarUrl={profile.avatarUrl}
              babyName={profile.name}
              size="lg"
              editable={!!onUploadAvatar}
              onUpload={handleAvatarUpload}
              uploading={avatarUploading}
            />
            {onUploadAvatar && (
              <p className="text-sm text-[var(--text-muted)] mt-2">
                Tap to change photo
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[var(--text-muted)] mb-1">Gender</p>
              <p className="text-[var(--text-primary)]">
                {profile.gender === 'male' ? 'Male' : profile.gender === 'female' ? 'Female' : 'Not specified'}
              </p>
            </div>
            {profile.weight > 0 && (
              <div>
                <p className="text-[var(--text-muted)] mb-1">Weight</p>
                <p className="text-[var(--text-primary)]">{profile.weight} kg</p>
              </div>
            )}
            {profile.height > 0 && (
              <div>
                <p className="text-[var(--text-muted)] mb-1">Height</p>
                <p className="text-[var(--text-primary)]">{profile.height} cm</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Share Access Section (only for profile owner) */}
      {profile && onInvite && onRevokeAccess && (
        <ShareAccess
          myShares={myShares}
          pendingInvitations={[]}
          onInvite={onInvite}
          onRevokeAccess={onRevokeAccess}
          onAcceptInvitation={async () => ({ success: true })}
          onDeclineInvitation={async () => ({ success: true })}
        />
      )}
    </div>
  );
}
