import { useState, useEffect } from 'react';
import type { UserProfile } from '../../types';

interface AccountSettingsViewProps {
  userProfile: UserProfile | null;
  onBack: () => void;
  onSignOut: () => void;
  onUpdateUser: (data: Partial<Omit<UserProfile, 'email'>>) => void;
}

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

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

const BellIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

interface SettingsItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  variant?: 'default' | 'danger';
  rightElement?: React.ReactNode;
}

function SettingsItem({ icon, title, subtitle, onClick, variant = 'default', rightElement }: SettingsItemProps) {
  const isDanger = variant === 'danger';

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all active:scale-[0.98] ${
        isDanger
          ? 'bg-[var(--danger-color)]/10 hover:bg-[var(--danger-color)]/15'
          : 'bg-[var(--bg-soft)] hover:bg-[var(--bg-card)]'
      }`}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
        isDanger
          ? 'bg-[var(--danger-color)]/20 text-[var(--danger-color)]'
          : 'bg-[var(--text-muted)]/10 text-[var(--text-muted)]'
      }`}>
        {icon}
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className={`font-display font-medium ${
          isDanger ? 'text-[var(--danger-color)]' : 'text-[var(--text-primary)]'
        }`}>
          {title}
        </p>
        {subtitle && (
          <p className="text-sm text-[var(--text-muted)] truncate">
            {subtitle}
          </p>
        )}
      </div>
      {rightElement || (
        <div className="flex-shrink-0 text-[var(--text-muted)]">
          <ChevronRightIcon />
        </div>
      )}
    </button>
  );
}

export function AccountSettingsView({ userProfile, onBack, onSignOut, onUpdateUser }: AccountSettingsViewProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

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
            Account settings
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Manage your account preferences
          </p>
        </div>
      </div>

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

      {/* Preferences */}
      <div className="card p-5">
        <h3 className="text-sm font-display font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4">
          Preferences
        </h3>
        <div className="space-y-2">
          <SettingsItem
            icon={<BellIcon />}
            title="Notifications"
            subtitle="Coming soon"
            onClick={() => {}}
          />
        </div>
      </div>

      {/* Session */}
      <div className="card p-5">
        <h3 className="text-sm font-display font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4">
          Session
        </h3>
        <div className="space-y-2">
          <SettingsItem
            icon={<LogoutIcon />}
            title="Sign out"
            subtitle="You can always sign back in"
            onClick={onSignOut}
          />
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card p-5 border border-[var(--danger-color)]/20">
        <h3 className="text-sm font-display font-semibold text-[var(--danger-color)] uppercase tracking-wider mb-4">
          Danger zone
        </h3>
        <div className="space-y-2">
          <SettingsItem
            icon={<TrashIcon />}
            title="Delete account"
            subtitle="Permanently delete your account and all data"
            onClick={() => setShowDeleteConfirm(true)}
            variant="danger"
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-50"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto">
            <div className="card p-6">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--danger-color)]/20 flex items-center justify-center text-[var(--danger-color)]">
                <TrashIcon />
              </div>
              <h3 className="text-xl font-display font-bold text-[var(--text-primary)] text-center mb-2">
                Delete account?
              </h3>
              <p className="text-[var(--text-muted)] text-sm text-center mb-6">
                This action cannot be undone. All your data including sleep entries and baby profiles will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-[var(--bg-soft)] text-[var(--text-primary)] font-display font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement actual account deletion
                    setShowDeleteConfirm(false);
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-[var(--danger-color)] text-white font-display font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
