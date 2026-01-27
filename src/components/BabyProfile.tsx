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
  onInvite?: (email: string) => Promise<{ success: boolean; error?: string }>;
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
  onRevokeAccess,
  onAcceptInvitation,
  onDeclineInvitation,
}: BabyProfileProps) {
  const [isEditingBaby, setIsEditingBaby] = useState(!profile);
  const [isEditingUser, setIsEditingUser] = useState(false);

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

  // Update form data and editing state when profile changes
  useEffect(() => {
    if (profile) {
      setBabyFormData({
        name: profile.name,
        dateOfBirth: profile.dateOfBirth,
        gender: profile.gender,
        weight: profile.weight,
        height: profile.height,
      });
      // If profile exists and has a name, exit editing mode to show the profile
      if (profile.name) {
        setIsEditingBaby(false);
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

  const handleBabySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile) {
      onUpdate(babyFormData);
    } else {
      onSave({ ...babyFormData, ...userFormData });
    }
    setIsEditingBaby(false);
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
          Add information regarding your baby - let us help you better
        </p>
      </div>

      {/* Your babies section */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-display font-bold text-[var(--text-primary)]">
            Your babies
          </h2>
          {profile && !isEditingBaby && (
            <button
              onClick={() => setIsEditingBaby(true)}
              className="text-[var(--nap-color)] text-sm font-medium font-display"
            >
              Edit
            </button>
          )}
        </div>

        {isEditingBaby || !profile ? (
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
                {profile ? 'Save Changes' : 'Create Profile'}
              </button>
              {profile && (
                <button
                  type="button"
                  onClick={() => {
                    setBabyFormData({
                      name: profile.name,
                      dateOfBirth: profile.dateOfBirth,
                      gender: profile.gender,
                      weight: profile.weight,
                      height: profile.height,
                    });
                    setIsEditingBaby(false);
                  }}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        ) : (
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-full bg-[var(--nap-color)]/20 flex items-center justify-center flex-shrink-0">
              <span className="font-display text-xl font-bold text-[var(--nap-color)]">
                {profile.name.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold text-[var(--text-primary)] text-lg truncate">
                {profile.name}
              </h3>
              <p className="text-[var(--nap-color)] font-display font-medium text-sm mt-0.5">
                {calculateAge(profile.dateOfBirth)} old
              </p>

              <div className="flex flex-wrap gap-3 mt-3 text-sm text-[var(--text-muted)]">
                <span>
                  {profile.gender === 'male' ? 'Male' : profile.gender === 'female' ? 'Female' : 'Not specified'}
                </span>
                {profile.weight > 0 && (
                  <span>{profile.weight} kg</span>
                )}
                {profile.height > 0 && (
                  <span>{profile.height} cm</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

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

      {/* Baby Selector (if multiple babies) */}
      {sharedProfiles.length > 1 && onActiveBabyChange && (
        <div className="card p-6">
          <h2 className="text-lg font-display font-bold text-[var(--text-primary)] mb-4">
            Switch Baby
          </h2>
          <div className="space-y-2">
            {sharedProfiles.map((baby) => (
              <button
                key={baby.id}
                onClick={() => onActiveBabyChange(baby.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  activeBabyId === baby.id
                    ? 'bg-[var(--nap-color)]/20 border border-[var(--nap-color)]/40'
                    : 'bg-[var(--bg-soft)] hover:bg-[var(--bg-soft)]/80'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activeBabyId === baby.id
                    ? 'bg-[var(--nap-color)]/30'
                    : 'bg-[var(--text-muted)]/20'
                }`}>
                  <span className={`font-display font-bold ${
                    activeBabyId === baby.id
                      ? 'text-[var(--nap-color)]'
                      : 'text-[var(--text-muted)]'
                  }`}>
                    {baby.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-left flex-1">
                  <p className={`font-display font-semibold ${
                    activeBabyId === baby.id
                      ? 'text-[var(--text-primary)]'
                      : 'text-[var(--text-secondary)]'
                  }`}>
                    {baby.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {baby.isOwner ? 'Your baby' : `Shared by ${baby.ownerName || 'someone'}`}
                  </p>
                </div>
                {activeBabyId === baby.id && (
                  <svg className="w-5 h-5 text-[var(--nap-color)]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Share Access Section (only for profile owner) */}
      {profile && onInvite && onRevokeAccess && onAcceptInvitation && onDeclineInvitation && (
        <ShareAccess
          myShares={myShares}
          pendingInvitations={pendingInvitations}
          onInvite={onInvite}
          onRevokeAccess={onRevokeAccess}
          onAcceptInvitation={onAcceptInvitation}
          onDeclineInvitation={onDeclineInvitation}
        />
      )}
    </div>
  );
}
