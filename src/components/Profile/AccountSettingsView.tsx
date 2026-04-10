import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { UserProfile } from '../../types';
import { SubViewHeader } from './SubViewHeader';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useAuth } from '../../hooks/useAuth';

interface AccountSettingsViewProps {
  userProfile: UserProfile | null;
  onBack: () => void;
  onUpdateUser: (data: Partial<Omit<UserProfile, 'email'>>) => void;
  onDeleteAccount: () => Promise<void>;
  isDeletingAccount: boolean;
  deleteAccountError: string | null;
  onNavigateToPrivacy?: () => void;
}

import { TrashIconDetailed } from '../icons/ActionIcons';

export function AccountSettingsView({
  userProfile,
  onBack,
  onUpdateUser,
  onDeleteAccount,
  isDeletingAccount,
  deleteAccountError,
  onNavigateToPrivacy,
}: AccountSettingsViewProps) {
  const { t } = useTranslation();
  const { user, updatePassword } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const isOAuthUser = user?.app_metadata?.provider === 'google';

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
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (passwordForm.newPassword.length < 6) {
      setPasswordError(t('profile.passwordTooShort'));
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError(t('profile.passwordsNoMatch'));
      return;
    }

    setPasswordUpdating(true);
    const error = await updatePassword(passwordForm.newPassword);
    setPasswordUpdating(false);

    if (error) {
      setPasswordError(error.message);
      return;
    }

    setPasswordForm({ newPassword: '', confirmPassword: '' });
    setIsChangingPassword(false);
    setPasswordSuccess(true);
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'dad': return t('profile.roleDad');
      case 'mum': return t('profile.roleMum');
      default: return t('profile.roleOther');
    }
  };

  const currentLocale = (userProfile?.locale === 'es' || userProfile?.locale === 'ca') ? userProfile.locale : 'en';

  return (
    <div className="space-y-6">
      <SubViewHeader title={t('profile.accountSettings')} subtitle={t('profile.accountSettingsSubtitle')} onBack={onBack} />

      {/* Language */}
      <div className="card p-5">
        <h3 className="text-sm font-display font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
          {t('profile.language')}
        </h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4">{t('profile.languageSubtitle')}</p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => currentLocale !== 'en' && onUpdateUser({ locale: 'en' })}
            className={`flex-1 min-w-0 py-3 min-h-[48px] flex items-center justify-center rounded-xl font-display font-medium transition-all ${
              currentLocale === 'en'
                ? 'bg-[var(--night-color)] text-[var(--text-on-accent)]'
                : 'bg-[var(--bg-soft)] text-[var(--text-secondary)]'
            }`}
          >
            {t('profile.english')}
          </button>
          <button
            type="button"
            onClick={() => currentLocale !== 'es' && onUpdateUser({ locale: 'es' })}
            className={`flex-1 min-w-0 py-3 min-h-[48px] flex items-center justify-center rounded-xl font-display font-medium transition-all ${
              currentLocale === 'es'
                ? 'bg-[var(--night-color)] text-[var(--text-on-accent)]'
                : 'bg-[var(--bg-soft)] text-[var(--text-secondary)]'
            }`}
          >
            {t('profile.spanish')}
          </button>
          <button
            type="button"
            onClick={() => currentLocale !== 'ca' && onUpdateUser({ locale: 'ca' })}
            className={`flex-1 min-w-0 py-3 min-h-[48px] flex items-center justify-center rounded-xl font-display font-medium transition-all ${
              currentLocale === 'ca'
                ? 'bg-[var(--night-color)] text-[var(--text-on-accent)]'
                : 'bg-[var(--bg-soft)] text-[var(--text-secondary)]'
            }`}
          >
            {t('profile.catalan')}
          </button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="card p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-display font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            {t('profile.yourProfile')}
          </h3>
          {!isEditingProfile && (
            <button
              onClick={() => setIsEditingProfile(true)}
              className="text-[var(--nap-color)] text-sm font-medium font-display min-h-[48px] px-3 flex items-center"
            >
              {t('common.edit')}
            </button>
          )}
        </div>

        {isEditingProfile ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
                {t('auth.email')}
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
                {t('profile.yourName')}
              </label>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleFormChange}
                placeholder={t('profile.enterName')}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
                {t('profile.yourRole')}
              </label>
              <select
                name="userRole"
                value={formData.userRole}
                onChange={handleFormChange}
                className="input"
              >
                <option value="dad">{t('profile.roleDad')}</option>
                <option value="mum">{t('profile.roleMum')}</option>
                <option value="other">{t('profile.roleOther')}</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn btn-primary flex-1">
                {t('profile.saveChanges')}
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
                className="btn btn-secondary"
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-[var(--bg-soft)]">
              <p className="text-sm text-[var(--text-muted)] mb-1">{t('auth.email')}</p>
              <p className="text-[var(--text-primary)] font-medium">
                {userProfile?.email || t('profile.notAvailable')}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-soft)]">
              <p className="text-sm text-[var(--text-muted)] mb-1">{t('common.name')}</p>
              <p className="text-[var(--text-primary)] font-medium">
                {userProfile?.userName || t('profile.notSet')}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-soft)]">
              <p className="text-sm text-[var(--text-muted)] mb-1">{t('profile.role')}</p>
              <p className="text-[var(--text-primary)] font-medium">
                {getRoleDisplay(userProfile?.userRole || 'other')}
              </p>
            </div>
          </div>
        )}

        {saveSuccess && (
          <p className="text-center text-sm text-[var(--success-color)] font-display mt-3 fade-in">
            {t('common.saved')}
          </p>
        )}
      </div>

      {/* Change Password — hidden for OAuth users */}
      {!isOAuthUser && (
        <div className="card p-5">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm font-display font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              {t('profile.changePassword')}
            </h3>
            {!isChangingPassword && (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="text-[var(--nap-color)] text-sm font-medium font-display min-h-[48px] px-3 flex items-center"
              >
                {t('common.edit')}
              </button>
            )}
          </div>

          {!isChangingPassword ? (
            <p className="text-sm text-[var(--text-secondary)]">
              {t('profile.changePasswordSubtitle')}
            </p>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4 mt-3">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
                  {t('profile.newPassword')}
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="input"
                  autoComplete="new-password"
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
                  {t('profile.confirmNewPassword')}
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="input"
                  autoComplete="new-password"
                  minLength={6}
                />
              </div>

              {passwordError && (
                <p className="text-sm text-[var(--danger-color)] font-display" role="alert">
                  {passwordError}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={passwordUpdating || !passwordForm.newPassword || !passwordForm.confirmPassword}
                  className="btn btn-primary flex-1 disabled:opacity-50"
                >
                  {passwordUpdating ? t('profile.updating') : t('profile.updatePassword')}
                </button>
                <button
                  type="button"
                  disabled={passwordUpdating}
                  onClick={() => {
                    setPasswordForm({ newPassword: '', confirmPassword: '' });
                    setPasswordError(null);
                    setIsChangingPassword(false);
                  }}
                  className="btn btn-secondary"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          )}

          {passwordSuccess && (
            <p className="text-center text-sm text-[var(--success-color)] font-display mt-3 fade-in">
              {t('profile.passwordUpdated')}
            </p>
          )}
        </div>
      )}

      {/* Footer links — grouped */}
      <div className="mt-8 flex flex-col items-center gap-0 rounded-2xl bg-[var(--bg-soft)] py-1">
        {onNavigateToPrivacy && (
          <button
            type="button"
            onClick={onNavigateToPrivacy}
            className="w-full text-center text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors py-3 px-4 min-h-[48px]"
          >
            {t('auth.privacyPolicy')}
          </button>
        )}
        {onNavigateToPrivacy && (
          <div className="w-4/5 h-px bg-[var(--text-muted)]/10" />
        )}
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full text-center text-sm text-[var(--danger-color)]/60 hover:text-[var(--danger-color)] transition-colors py-3 px-4 min-h-[48px]"
        >
          {t('profile.deleteAccount')}
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => !isDeletingAccount && setShowDeleteConfirm(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto">
            <div
              ref={deleteDialogRef}
              role="alertdialog"
              aria-modal="true"
              aria-label={t('profile.deleteConfirmTitle')}
              className="card p-6"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--danger-color)]/20 flex items-center justify-center text-[var(--danger-color)]">
                <TrashIconDetailed />
              </div>
              <h3 className="text-xl font-display font-bold text-[var(--text-primary)] text-center mb-2">
                {t('profile.deleteConfirmTitle')}
              </h3>
              <div className="text-[var(--text-muted)] text-sm text-center mb-4 space-y-2">
                <p>
                  {t('profile.deleteConfirmBody1')}
                </p>
                <p>
                  {t('profile.deleteConfirmBody2')}
                </p>
                <p className="text-xs">
                  {t('profile.deleteConfirmBody3')}
                </p>
                {onNavigateToPrivacy && (
                  <p className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        onNavigateToPrivacy();
                      }}
                      className="text-[var(--nap-color)] underline underline-offset-2"
                    >
                      {t('auth.privacyPolicy')}
                    </button>
                  </p>
                )}
              </div>
              {deleteAccountError && (
                <p className="text-sm text-[var(--danger-color)] text-center mb-3" role="alert">
                  {deleteAccountError}
                </p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeletingAccount}
                  className="flex-1 px-4 py-4 min-h-[48px] rounded-xl bg-[var(--bg-soft)] text-[var(--text-primary)] font-display font-medium disabled:opacity-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={() => onDeleteAccount()}
                  disabled={isDeletingAccount}
                  className="flex-1 px-4 py-4 min-h-[48px] rounded-xl bg-[var(--danger-color)] text-[var(--text-on-accent)] font-display font-semibold disabled:opacity-70 disabled:cursor-wait"
                >
                  {isDeletingAccount ? t('profile.deleting') : t('profile.deleteAccount')}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
