import { useState, useEffect } from 'react';
import type { UserProfile } from '../../types';
import { SubViewHeader } from './SubViewHeader';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface AccountSettingsViewProps {
  userProfile: UserProfile | null;
  onBack: () => void;
  onSignOut: () => void;
  onUpdateUser: (data: Partial<Omit<UserProfile, 'email'>>) => void;
}

const LogoutIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const TrashIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

export function AccountSettingsView({ userProfile, onBack, onSignOut, onUpdateUser }: AccountSettingsViewProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const logoutDialogRef = useFocusTrap(showLogoutConfirm, () => setShowLogoutConfirm(false));
  const deleteDialogRef = useFocusTrap(showDeleteConfirm, () => setShowDeleteConfirm(false));

  const [formData, setFormData] = useState({
    userName: userProfile?.userName || '',
    userRole: userProfile?.userRole || 'other' as const,
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        userName: userProfile.userName,
        userRole: userProfile.userRole,
      });
    }
  }, [userProfile]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser(formData);
    setIsEditingProfile(false);
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'dad': return 'Dad';
      case 'mum': return 'Mum';
      default: return 'Something else';
    }
  };

  return (
    <div className="space-y-6">
      <SubViewHeader title="Account settings" subtitle="Manage your account preferences" onBack={onBack} />

      {/* Profile Info */}
      <div className="card p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-display font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            Your profile
          </h3>
          {!isEditingProfile && (
            <button
              onClick={() => setIsEditingProfile(true)}
              className="text-[var(--nap-color)] text-sm font-medium font-display"
            >
              Edit
            </button>
          )}
        </div>

        {isEditingProfile ? (
          <form onSubmit={handleSubmit} className="space-y-4">
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
                value={formData.userName}
                onChange={handleFormChange}
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
                value={formData.userRole}
                onChange={handleFormChange}
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
                  setFormData({
                    userName: userProfile?.userName || '',
                    userRole: userProfile?.userRole || 'other',
                  });
                  setIsEditingProfile(false);
                }}
                className="btn btn-ghost"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-[var(--bg-soft)]">
              <p className="text-sm text-[var(--text-muted)] mb-1">Email</p>
              <p className="text-[var(--text-primary)] font-medium">
                {userProfile?.email || 'Not available'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-soft)]">
              <p className="text-sm text-[var(--text-muted)] mb-1">Name</p>
              <p className="text-[var(--text-primary)] font-medium">
                {userProfile?.userName || 'Not set'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-soft)]">
              <p className="text-sm text-[var(--text-muted)] mb-1">Role</p>
              <p className="text-[var(--text-primary)] font-medium">
                {getRoleDisplay(userProfile?.userRole || 'other')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sign Out - Prominent standalone card */}
      <button
        onClick={() => setShowLogoutConfirm(true)}
        className="w-full flex items-center gap-4 p-5 rounded-3xl active:scale-[0.98] transition-all"
        style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}
      >
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-[var(--danger-color)]/15">
          <span className="text-[var(--danger-color)]">
            <LogoutIcon />
          </span>
        </div>
        <div className="flex-1 text-left">
          <p className="font-display font-semibold text-[var(--danger-color)] text-[17px]">
            Sign out
          </p>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            You can always sign back in
          </p>
        </div>
      </button>

      {/* Delete Account - Subtle text link at bottom */}
      <div className="mt-8 text-center">
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="text-xs text-[var(--text-muted)] opacity-50 hover:opacity-75 transition-opacity"
        >
          Delete account
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-50"
            onClick={() => setShowLogoutConfirm(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto">
            <div
              ref={logoutDialogRef}
              role="alertdialog"
              aria-modal="true"
              aria-label="Sign out confirmation"
              className="card p-6"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--text-muted)]/20 flex items-center justify-center text-[var(--text-muted)]">
                <LogoutIcon />
              </div>
              <h3 className="text-xl font-display font-bold text-[var(--text-primary)] text-center mb-2">
                Sign out?
              </h3>
              <p className="text-[var(--text-muted)] text-sm text-center mb-6">
                You can always sign back in with your email and password.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-[var(--bg-soft)] text-[var(--text-primary)] font-display font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    onSignOut();
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-[var(--night-color)] text-white font-display font-semibold"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-50"
            onClick={() => setShowDeleteConfirm(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto">
            <div
              ref={deleteDialogRef}
              role="alertdialog"
              aria-modal="true"
              aria-label="Delete account confirmation"
              className="card p-6"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--danger-color)]/20 flex items-center justify-center text-[var(--danger-color)]">
                <TrashIcon />
              </div>
              <h3 className="text-xl font-display font-bold text-[var(--text-primary)] text-center mb-2">
                Delete account?
              </h3>
              <p className="text-[var(--text-muted)] text-sm text-center mb-6">
                Account deletion is not yet available. Please contact support if you need to delete your account.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-[var(--bg-soft)] text-[var(--text-primary)] font-display font-medium"
                >
                  Cancel
                </button>
                <button
                  disabled
                  className="flex-1 px-4 py-3 rounded-xl bg-[var(--danger-color)] text-white font-display font-semibold opacity-40 cursor-not-allowed"
                >
                  Not yet available
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
