import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import type { BabyShare } from '../types';

type ShareRole = 'caregiver' | 'viewer';

interface ShareAccessProps {
  myShares: BabyShare[];
  pendingInvitations: BabyShare[];
  onInvite: (email: string, role: ShareRole, inviterName?: string, babyName?: string) => Promise<{ success: boolean; error?: string }>;
  onUpdateRole: (shareId: string, role: ShareRole) => Promise<{ success: boolean; error?: string }>;
  onRevokeAccess: (shareId: string) => Promise<{ success: boolean; error?: string }>;
  onAcceptInvitation: (shareId: string) => Promise<{ success: boolean; error?: string }>;
  onDeclineInvitation: (shareId: string) => Promise<{ success: boolean; error?: string }>;
  inviterName?: string;
  babyName?: string;
}

export function ShareAccess({
  myShares,
  pendingInvitations,
  onInvite,
  onUpdateRole,
  onRevokeAccess,
  onAcceptInvitation,
  onDeclineInvitation,
  inviterName,
  babyName,
}: ShareAccessProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<ShareRole>('caregiver');
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Bottom sheet state
  const [selectedShare, setSelectedShare] = useState<BabyShare | null>(null);
  const [editingRole, setEditingRole] = useState<ShareRole>('caregiver');
  const [isUpdating, setIsUpdating] = useState(false);

  // Edit sheet drag — opacity follows drag so swipe-down feels connected
  const shareSheetY = useMotionValue(0);
  const shareSheetBackdropOpacity = useTransform(shareSheetY, [0, 300], [1, 0]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsInviting(true);
    setError(null);
    setSuccess(null);

    const result = await onInvite(email.trim(), role, inviterName, babyName);

    if (result.success) {
      setEmail('');
      setRole('caregiver');
      setSuccess(t('shareAccess.invitationSent'));
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(result.error || t('shareAccess.failedSendInvite'));
    }

    setIsInviting(false);
  };

  const handleRevoke = async (shareId: string) => {
    setIsUpdating(true);
    const result = await onRevokeAccess(shareId);
    if (!result.success) {
      setError(result.error || t('shareAccess.failedRevoke'));
    }
    setSelectedShare(null);
    setIsUpdating(false);
  };

  const handleSaveRole = async () => {
    if (!selectedShare || editingRole === selectedShare.role) {
      setSelectedShare(null);
      return;
    }

    setIsUpdating(true);
    const result = await onUpdateRole(selectedShare.id, editingRole);
    if (!result.success) {
      setError(result.error || t('shareAccess.failedUpdateRole'));
    }
    setSelectedShare(null);
    setIsUpdating(false);
  };

  const handleAccept = async (shareId: string) => {
    const result = await onAcceptInvitation(shareId);
    if (!result.success) {
      setError(result.error || t('shareAccess.failedAccept'));
    }
  };

  const handleDecline = async (shareId: string) => {
    const result = await onDeclineInvitation(shareId);
    if (!result.success) {
      setError(result.error || t('shareAccess.failedDecline'));
    }
  };

  const openEditSheet = (share: BabyShare) => {
    setSelectedShare(share);
    setEditingRole(share.role);
  };

  const acceptedShares = myShares.filter((s) => s.status === 'accepted');
  const pendingShares = myShares.filter((s) => s.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Pending Invitations Received */}
      {pendingInvitations.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-display font-bold text-[var(--text-primary)] mb-4">
            {t('shareAccess.pendingInvitationsTitle')}
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            {t('shareAccess.pendingInvitationsIntro')}
          </p>
          <div className="space-y-3">
            {pendingInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-soft)] border border-[var(--nap-color)]/30"
              >
                <div>
                  <p className="font-display font-semibold text-[var(--text-primary)]">
                    {invitation.babyName || t('common.baby')}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {t('shareAccess.from')} {invitation.ownerName || t('shareAccess.someone')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(invitation.id)}
                    className="px-3 py-1.5 rounded-lg bg-[var(--nap-color)] text-[var(--bg-deep)] text-sm font-display font-semibold"
                  >
                    {t('profile.accept')}
                  </button>
                  <button
                    onClick={() => handleDecline(invitation.id)}
                    className="px-3 py-1.5 rounded-lg bg-[var(--bg-card)] text-[var(--text-muted)] text-sm font-display"
                  >
                    {t('profile.decline')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Share Access Section */}
      <div className="card p-6">
        <h3 className="text-lg font-display font-bold text-[var(--text-primary)] mb-2">
          {t('shareAccess.title')}
        </h3>
        <p className="text-sm text-[var(--text-secondary)] mb-5">
          {t('shareAccess.sectionSubtitle')}
        </p>

        {/* Invite Form */}
        <form onSubmit={handleInvite} className="mb-6">
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('shareAccess.invitePlaceholder')}
              className="input flex-1"
              disabled={isInviting}
            />
            <button
              type="submit"
              disabled={isInviting || !email.trim()}
              className="btn btn-primary px-5 disabled:opacity-50"
            >
              {isInviting ? t('shareAccess.sending') : t('shareAccess.inviteButton')}
            </button>
          </div>

          {/* Role Selector */}
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={() => setRole('caregiver')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-display font-medium transition-all ${
                role === 'caregiver'
                  ? 'bg-[var(--nap-color)]/20 text-[var(--nap-color)] border-2 border-[var(--nap-color)]/40'
                  : 'bg-[var(--bg-soft)] text-[var(--text-muted)] border-2 border-transparent'
              }`}
            >
              <div className="font-semibold">{t('shareAccess.roleCaregiver')}</div>
              <div className="text-xs opacity-70 mt-0.5">{t('shareAccess.caregiverDesc')}</div>
            </button>
            <button
              type="button"
              onClick={() => setRole('viewer')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-display font-medium transition-all ${
                role === 'viewer'
                  ? 'bg-[var(--nap-color)]/20 text-[var(--nap-color)] border-2 border-[var(--nap-color)]/40'
                  : 'bg-[var(--bg-soft)] text-[var(--text-muted)] border-2 border-transparent'
              }`}
            >
              <div className="font-semibold">{t('shareAccess.roleViewer')}</div>
              <div className="text-xs opacity-70 mt-0.5">{t('shareAccess.viewerDesc')}</div>
            </button>
          </div>

          {error && (
            <p className="text-sm text-[var(--danger-color)] mt-2">{error}</p>
          )}
          {success && (
            <p className="text-sm text-[var(--success-color)] mt-2">{success}</p>
          )}
        </form>

        {/* People with Access */}
        {acceptedShares.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-display font-semibold text-[var(--text-secondary)] mb-3">
              {t('shareAccess.peopleWithAccess')}
            </h4>
            <div className="space-y-2">
              {acceptedShares.map((share) => (
                <button
                  key={share.id}
                  onClick={() => openEditSheet(share)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-soft)] hover:bg-[var(--bg-soft)]/80 active:scale-[0.98] transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-[var(--nap-color)]/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-display font-bold text-[var(--nap-color)]">
                      {share.sharedWithEmail.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-display text-[var(--text-primary)] truncate">
                      {share.sharedWithEmail}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {share.role === 'caregiver' ? t('shareAccess.roleCaregiver') : t('shareAccess.roleViewer')}
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-[var(--text-muted)] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Pending Invites Sent */}
        {pendingShares.length > 0 && (
          <div>
            <h4 className="text-sm font-display font-semibold text-[var(--text-secondary)] mb-3">
              {t('shareAccess.pendingInvitations')}
            </h4>
            <div className="space-y-2">
              {pendingShares.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-soft)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--text-muted)]/20 flex items-center justify-center">
                      <span className="text-sm font-display font-bold text-[var(--text-muted)]">
                        {share.sharedWithEmail.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-display text-[var(--text-primary)]">
                        {share.sharedWithEmail}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {t('shareAccess.waitingForResponse')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevoke(share.id)}
                    className="text-xs text-[var(--danger-color)] font-display px-3 py-1.5"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {acceptedShares.length === 0 && pendingShares.length === 0 && (
          <p className="text-sm text-[var(--text-muted)] text-center py-4">
            {t('shareAccess.noOneElseHasAccess')}
          </p>
        )}
      </div>

      {/* Edit Access Bottom Sheet — tween (no bounce), drag down to dismiss */}
      <AnimatePresence>
        {selectedShare && (
          <>
            {/* Backdrop — opacity follows drag */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ opacity: shareSheetBackdropOpacity }}
              onClick={() => !isUpdating && setSelectedShare(null)}
              className="fixed inset-0 bg-black/60 z-50"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={(_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
                if (info.offset.y > 150 || info.velocity.y > 500) setSelectedShare(null);
              }}
              style={{ y: shareSheetY }}
              className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-50 bg-[var(--bg-card)] rounded-t-3xl max-h-[85vh] overflow-hidden touch-none"
            >
              {/* Handle — drag to dismiss */}
              <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
                <div className="w-10 h-1 rounded-full bg-[var(--text-muted)]/30" />
              </div>

              <div className="px-6 pb-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full bg-[var(--nap-color)]/20 flex items-center justify-center">
                    <span className="text-xl font-display font-bold text-[var(--nap-color)]">
                      {selectedShare.sharedWithEmail.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-display font-bold text-[var(--text-primary)]">
                      {t('shareAccess.editAccess')}
                    </h3>
                    <p className="text-sm text-[var(--text-muted)] truncate">
                      {selectedShare.sharedWithEmail}
                    </p>
                  </div>
                </div>

                {/* Role Selector */}
                <div className="mb-6">
                  <label className="text-sm font-display font-semibold text-[var(--text-secondary)] mb-3 block">
                    {t('shareAccess.permissionLevel')}
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingRole('caregiver')}
                      disabled={isUpdating}
                      className={`flex-1 py-3 px-4 rounded-xl text-sm font-display font-medium transition-all ${
                        editingRole === 'caregiver'
                          ? 'bg-[var(--nap-color)]/20 text-[var(--nap-color)] border-2 border-[var(--nap-color)]/40'
                          : 'bg-[var(--bg-soft)] text-[var(--text-muted)] border-2 border-transparent'
                      }`}
                    >
                      <div className="font-semibold">{t('shareAccess.roleCaregiver')}</div>
                      <div className="text-xs opacity-70 mt-0.5">{t('shareAccess.caregiverDesc')}</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingRole('viewer')}
                      disabled={isUpdating}
                      className={`flex-1 py-3 px-4 rounded-xl text-sm font-display font-medium transition-all ${
                        editingRole === 'viewer'
                          ? 'bg-[var(--nap-color)]/20 text-[var(--nap-color)] border-2 border-[var(--nap-color)]/40'
                          : 'bg-[var(--bg-soft)] text-[var(--text-muted)] border-2 border-transparent'
                      }`}
                    >
                      <div className="font-semibold">{t('shareAccess.roleViewer')}</div>
                      <div className="text-xs opacity-70 mt-0.5">{t('shareAccess.viewerDesc')}</div>
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={handleSaveRole}
                    disabled={isUpdating}
                    className="w-full btn btn-primary py-3.5 disabled:opacity-50"
                  >
                    {isUpdating ? t('common.saving') : t('profile.saveChanges')}
                  </button>

                  <button
                    onClick={() => handleRevoke(selectedShare.id)}
                    disabled={isUpdating}
                    className="w-full py-3.5 rounded-xl text-[var(--danger-color)] font-display font-semibold bg-[var(--danger-color)]/10 hover:bg-[var(--danger-color)]/20 transition-colors disabled:opacity-50"
                  >
                    {t('shareAccess.removeAccess')}
                  </button>

                  <button
                    onClick={() => setSelectedShare(null)}
                    disabled={isUpdating}
                    className="w-full py-3 text-[var(--text-muted)] font-display text-sm"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>

              {/* Safe area padding for iOS */}
              <div className="h-[env(safe-area-inset-bottom)]" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
