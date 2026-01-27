import { useState } from 'react';
import type { BabyShare } from '../types';

interface ShareAccessProps {
  myShares: BabyShare[];
  pendingInvitations: BabyShare[];
  onInvite: (email: string) => Promise<{ success: boolean; error?: string }>;
  onRevokeAccess: (shareId: string) => Promise<{ success: boolean; error?: string }>;
  onAcceptInvitation: (shareId: string) => Promise<{ success: boolean; error?: string }>;
  onDeclineInvitation: (shareId: string) => Promise<{ success: boolean; error?: string }>;
}

export function ShareAccess({
  myShares,
  pendingInvitations,
  onInvite,
  onRevokeAccess,
  onAcceptInvitation,
  onDeclineInvitation,
}: ShareAccessProps) {
  const [email, setEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsInviting(true);
    setError(null);
    setSuccess(null);

    const result = await onInvite(email.trim());

    if (result.success) {
      setEmail('');
      setSuccess('Invitation sent successfully');
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(result.error || 'Failed to send invitation');
    }

    setIsInviting(false);
  };

  const handleRevoke = async (shareId: string) => {
    const result = await onRevokeAccess(shareId);
    if (!result.success) {
      setError(result.error || 'Failed to revoke access');
    }
  };

  const handleAccept = async (shareId: string) => {
    const result = await onAcceptInvitation(shareId);
    if (!result.success) {
      setError(result.error || 'Failed to accept invitation');
    }
  };

  const handleDecline = async (shareId: string) => {
    const result = await onDeclineInvitation(shareId);
    if (!result.success) {
      setError(result.error || 'Failed to decline invitation');
    }
  };

  const acceptedShares = myShares.filter((s) => s.status === 'accepted');
  const pendingShares = myShares.filter((s) => s.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Pending Invitations Received */}
      {pendingInvitations.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-display font-bold text-[var(--text-primary)] mb-4">
            Pending Invitations
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            You've been invited to help track these babies
          </p>
          <div className="space-y-3">
            {pendingInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-soft)] border border-[var(--nap-color)]/30"
              >
                <div>
                  <p className="font-display font-semibold text-[var(--text-primary)]">
                    {invitation.babyName || 'Baby'}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    from {invitation.ownerName || 'Someone'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(invitation.id)}
                    className="px-3 py-1.5 rounded-lg bg-[var(--nap-color)] text-[var(--bg-deep)] text-sm font-display font-semibold"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDecline(invitation.id)}
                    className="px-3 py-1.5 rounded-lg bg-[var(--bg-card)] text-[var(--text-muted)] text-sm font-display"
                  >
                    Decline
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
          Share Access
        </h3>
        <p className="text-sm text-[var(--text-secondary)] mb-5">
          Let a partner or caregiver help track your baby's sleep
        </p>

        {/* Invite Form */}
        <form onSubmit={handleInvite} className="mb-6">
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="input flex-1"
              disabled={isInviting}
            />
            <button
              type="submit"
              disabled={isInviting || !email.trim()}
              className="btn btn-nap px-5 disabled:opacity-50"
            >
              {isInviting ? 'Sending...' : 'Invite'}
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
              People with access
            </h4>
            <div className="space-y-2">
              {acceptedShares.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-soft)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--nap-color)]/20 flex items-center justify-center">
                      <span className="text-sm font-display font-bold text-[var(--nap-color)]">
                        {share.sharedWithEmail.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-display text-[var(--text-primary)]">
                        {share.sharedWithEmail}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] capitalize">
                        {share.role}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevoke(share.id)}
                    className="text-xs text-[var(--danger-color)] font-display"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Invites Sent */}
        {pendingShares.length > 0 && (
          <div>
            <h4 className="text-sm font-display font-semibold text-[var(--text-secondary)] mb-3">
              Pending invitations
            </h4>
            <div className="space-y-2">
              {pendingShares.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-soft)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--text-muted)]/20 flex items-center justify-center">
                      <span className="text-sm font-display font-bold text-[var(--text-muted)]">
                        {share.sharedWithEmail.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-display text-[var(--text-primary)]">
                        {share.sharedWithEmail}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        Waiting for response...
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevoke(share.id)}
                    className="text-xs text-[var(--danger-color)] font-display"
                  >
                    Cancel
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {acceptedShares.length === 0 && pendingShares.length === 0 && (
          <p className="text-sm text-[var(--text-muted)] text-center py-4">
            No one else has access yet
          </p>
        )}
      </div>
    </div>
  );
}
