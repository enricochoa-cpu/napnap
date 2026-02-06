import { useState, useEffect } from 'react';
import type { BabyProfile as BabyProfileType, UserProfile, BabyShare } from '../types';
import { calculateAge } from '../utils/dateUtils';
import { ShareAccess } from './ShareAccess';

interface SharedBabyProfile extends BabyProfileType {
  isOwner: boolean;
  ownerName?: string;
}

interface BabyProfileProps {
  profile: BabyProfileType | null;
  userProfile: UserProfile | null;
  sharedProfiles?: SharedBabyProfile[];
  activeBabyId?: string | null;
  onActiveBabyChange?: (babyId: string) => void;
  onSave: (data: Omit<BabyProfileType, 'id'> & Partial<Omit<UserProfile, 'email'>>) => void;
  onUpdate: (data: Partial<Omit<BabyProfileType, 'id'>> & Partial<Omit<UserProfile, 'email'>>) => void;
  // Sharing props
  myShares?: BabyShare[];
  pendingInvitations?: BabyShare[];
  onInvite?: (email: string, role: 'caregiver' | 'viewer', inviterName?: string, babyName?: string) => Promise<{ success: boolean; error?: string }>;
  onUpdateRole?: (shareId: string, role: 'caregiver' | 'viewer') => Promise<{ success: boolean; error?: string }>;
  onRevokeAccess?: (shareId: string) => Promise<{ success: boolean; error?: string }>;
  onAcceptInvitation?: (shareId: string) => Promise<{ success: boolean; error?: string }>;
  onDeclineInvitation?: (shareId: string) => Promise<{ success: boolean; error?: string }>;
}

export function BabyProfile({
  profile,
  userProfile,
  sharedProfiles = [],
  activeBabyId,
  onActiveBabyChange,
  onSave,
  onUpdate,
  myShares = [],
  pendingInvitations = [],
  onInvite,
  onUpdateRole,
  onRevokeAccess,
  onAcceptInvitation,
  onDeclineInvitation,
}: BabyProfileProps) {
  // Only show create form if user has no babies at all (own or shared)
  const hasAnyBabies = sharedProfiles.length > 0;
  const [isEditingBaby, setIsEditingBaby] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [showAddBabyForm, setShowAddBabyForm] = useState(!hasAnyBabies && !profile);

  const [babyFormData, setBabyFormData] = useState({
    name: profile?.name || '',
    dateOfBirth: profile?.dateOfBirth || '',
    gender: profile?.gender || 'other' as const,
    weight: profile?.weight || 0,
    height: profile?.height || 0,
  });

  const [userFormData, setUserFormData] = useState({
    userName: userProfile?.userName || '',
    userRole: userProfile?.userRole || 'other' as const,
  });

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      setBabyFormData({
        name: profile.name,
        dateOfBirth: profile.dateOfBirth,
        gender: profile.gender,
        weight: profile.weight,
        height: profile.height,
      });
      // If profile exists and has a name, exit editing mode
      if (profile.name) {
        setIsEditingBaby(false);
        setShowAddBabyForm(false);
      }
    }
  }, [profile]);

  useEffect(() => {
    if (userProfile) {
      setUserFormData({
        userName: userProfile.userName,
        userRole: userProfile.userRole,
      });
    }
  }, [userProfile]);

  // Update showAddBabyForm when sharedProfiles changes
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
      onSave({ ...babyFormData, ...userFormData });
    }
    setIsEditingBaby(false);
    setShowAddBabyForm(false);
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(userFormData);
    setIsEditingUser(false);
  };

  const handleBabyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setBabyFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Get own babies for display in details section
  const ownBabies = sharedProfiles.filter(b => b.isOwner);

  return (
    <div className="space-y-6">
      {/* Pending Invitations - Show at top for ALL users */}
      {pendingInvitations.length > 0 && onAcceptInvitation && onDeclineInvitation && (
        <div className="card p-6 border-2 border-[var(--nap-color)]/30">
          <h3 className="text-lg font-display font-bold text-[var(--text-primary)] mb-4">
            {pendingInvitations.length === 1 ? 'Pending Invitation' : 'Pending Invitations'}
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            You've been invited to help track {pendingInvitations.length === 1 ? 'a baby' : 'these babies'}
          </p>
          <div className="space-y-3">
            {pendingInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-soft)]"
              >
                <div>
                  <p className="font-display font-semibold text-[var(--text-primary)] text-lg">
                    {invitation.babyName || 'Baby'}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">
                    Invitation from {invitation.ownerName || 'parent'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onAcceptInvitation(invitation.id)}
                    className="px-4 py-2 rounded-lg bg-[var(--nap-color)] text-[var(--bg-deep)] text-sm font-display font-semibold"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => onDeclineInvitation(invitation.id)}
                    className="px-4 py-2 rounded-lg bg-[var(--bg-card)] text-[var(--text-muted)] text-sm font-display"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-2">
          Account details
        </h1>
        <p className="text-[var(--text-secondary)] text-sm">
          {hasAnyBabies ? 'Manage your babies and profile' : 'Add information regarding your baby'}
        </p>
      </div>

      {/* Babies You're Tracking - Show when there are any babies */}
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
                onClick={() => onActiveBabyChange?.(baby.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                  activeBabyId === baby.id
                    ? 'bg-[var(--nap-color)]/15 border-2 border-[var(--nap-color)]/40'
                    : 'bg-[var(--bg-soft)] border-2 border-transparent hover:border-[var(--text-muted)]/20'
                }`}
              >
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  activeBabyId === baby.id
                    ? 'bg-[var(--nap-color)]/30'
                    : 'bg-[var(--text-muted)]/20'
                }`}>
                  <span className={`font-display text-lg font-bold ${
                    activeBabyId === baby.id
                      ? 'text-[var(--nap-color)]'
                      : 'text-[var(--text-muted)]'
                  }`}>
                    {baby.name ? baby.name.charAt(0).toUpperCase() : '?'}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 text-left min-w-0">
                  <p className={`font-display font-semibold truncate ${
                    activeBabyId === baby.id
                      ? 'text-[var(--text-primary)]'
                      : 'text-[var(--text-secondary)]'
                  }`}>
                    {baby.name || 'Unnamed baby'}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {baby.isOwner ? (
                      'Your baby'
                    ) : (
                      <>Shared by {baby.ownerName || 'parent'}</>
                    )}
                    {baby.dateOfBirth && (
                      <> · {calculateAge(baby.dateOfBirth)}</>
                    )}
                  </p>
                </div>

                {/* Active indicator */}
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

          {/* Add your own baby button (if user doesn't have one) */}
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

      {/* Your baby section - Show form when editing or creating */}
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

      {/* Yourself section */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-display font-bold text-[var(--text-primary)]">
            Yourself
          </h2>
          {!isEditingUser && (
            <button
              onClick={() => setIsEditingUser(true)}
              className="text-[var(--nap-color)] text-sm font-medium font-display"
            >
              Edit
            </button>
          )}
        </div>

        {isEditingUser ? (
          <form onSubmit={handleUserSubmit} className="space-y-5">
            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
                Email
              </label>
              <input
                type="email"
                value={userProfile?.email || ''}
                disabled
                className="input opacity-60 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
                Your Name
              </label>
              <input
                type="text"
                name="userName"
                value={userFormData.userName}
                onChange={handleUserChange}
                placeholder="Enter your name..."
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
                Your Role
              </label>
              <select
                name="userRole"
                value={userFormData.userRole}
                onChange={handleUserChange}
                className="input"
              >
                <option value="dad">Dad</option>
                <option value="mum">Mum</option>
                <option value="other">Something else</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn btn-nap flex-1">
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setUserFormData({
                    userName: userProfile?.userName || '',
                    userRole: userProfile?.userRole || 'other',
                  });
                  setIsEditingUser(false);
                }}
                className="btn btn-ghost"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {/* Email */}
            <div>
              <p className="text-sm text-[var(--text-muted)] font-display mb-1">Email</p>
              <p className="text-[var(--text-primary)]">{userProfile?.email || 'Not available'}</p>
            </div>

            {/* Name */}
            <div>
              <p className="text-sm text-[var(--text-muted)] font-display mb-1">Name</p>
              <p className="text-[var(--text-primary)]">{userProfile?.userName || 'Not set'}</p>
            </div>

            {/* Role */}
            <div>
              <p className="text-sm text-[var(--text-muted)] font-display mb-1">Role</p>
              <p className="text-[var(--text-primary)]">
                {userProfile?.userRole === 'dad' ? 'Dad' :
                 userProfile?.userRole === 'mum' ? 'Mum' :
                 'Something else'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Share Access Section (only for profile owner) */}
      {profile && onInvite && onUpdateRole && onRevokeAccess && onAcceptInvitation && onDeclineInvitation && (
        <ShareAccess
          myShares={myShares}
          pendingInvitations={[]} // Don't show pending here, already shown at top
          onInvite={onInvite}
          onUpdateRole={onUpdateRole}
          onRevokeAccess={onRevokeAccess}
          onAcceptInvitation={onAcceptInvitation}
          onDeclineInvitation={onDeclineInvitation}
          inviterName={userProfile?.userName || userProfile?.email}
          babyName={profile.name}
        />
      )}
    </div>
  );
}
