import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import type { BabyProfile as BabyProfileType, UserProfile, BabyShare } from '../../types';
import type { SharedBabyProfile } from '../../hooks/useBabyProfile';
import { formatAge } from '../../utils/dateUtils';
import { BabyAvatarPicker } from './BabyAvatarPicker';
import { BabyEditSheet } from './BabyEditSheet';
import { SubViewHeader } from './SubViewHeader';

interface MyBabiesViewProps {
  profile: BabyProfileType | null;
  sharedProfiles: SharedBabyProfile[];
  activeBabyId: string | null;
  onActiveBabyChange: (babyId: string) => void;
  onSave: (data: Omit<BabyProfileType, 'id'> & Partial<Omit<UserProfile, 'email'>>) => void;
  onUpdate: (data: Partial<Omit<BabyProfileType, 'id'>>) => void;
  onUploadAvatar?: (file: File) => Promise<string | null>;
  onBack: () => void;
  onNavigateToBabyDetail: (babyId: string) => void;
  // Sharing props passed through for compatibility
  myShares: BabyShare[];
  onInvite: (email: string, role: 'caregiver' | 'viewer', inviterName?: string, babyName?: string) => Promise<{ success: boolean; error?: string }>;
  onUpdateRole: (shareId: string, role: 'caregiver' | 'viewer') => Promise<{ success: boolean; error?: string }>;
  onRevokeAccess: (shareId: string) => Promise<{ success: boolean; error?: string }>;
  inviterName?: string;
  /** Pending baby invites — shown as cards in My Babies (same structure as baby cards, with Accept/Decline). */
  pendingInvitations?: BabyShare[];
  onAcceptInvitation?: (shareId: string) => Promise<{ success: boolean; error?: string }>;
  onDeclineInvitation?: (shareId: string) => Promise<{ success: boolean; error?: string }>;
  /** When true, open the add-baby sheet on mount (e.g. navigated from FAB with no baby) */
  openAddSheetOnMount?: boolean;
  onOpenAddSheetHandled?: () => void;
}

const PlusIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// Invite card — same visual structure as BabyProfileCard, with Accept / Decline instead of Select
interface InviteCardProps {
  invitation: BabyShare;
  onAccept: (shareId: string) => Promise<{ success: boolean; error?: string }>;
  onDecline: (shareId: string) => Promise<{ success: boolean; error?: string }>;
  fromLabel: string;
}

function InviteCard({ invitation, onAccept, onDecline, fromLabel }: InviteCardProps) {
  const [busy, setBusy] = useState(false);
  const handleAccept = async () => {
    setBusy(true);
    try {
      await onAccept(invitation.id);
    } finally {
      setBusy(false);
    }
  };
  const handleDecline = async () => {
    setBusy(true);
    try {
      await onDecline(invitation.id);
    } finally {
      setBusy(false);
    }
  };
  const babyName = invitation.babyName || 'Baby';
  const initial = babyName.charAt(0).toUpperCase();

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="w-full flex items-center gap-4 p-5 rounded-3xl backdrop-blur-xl transition-all duration-200"
      style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div className="flex-1 flex items-center gap-4 min-w-0">
        <div className="flex-shrink-0">
          {invitation.babyAvatarUrl ? (
            <BabyAvatarPicker
              avatarUrl={invitation.babyAvatarUrl}
              babyName={babyName}
              size="md"
              editable={false}
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[var(--nap-color)]/20 flex items-center justify-center text-[var(--nap-color)] text-2xl font-display font-semibold">
              {initial}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-semibold text-[var(--text-primary)] text-lg truncate">
            {babyName}
          </p>
          <p className="text-sm font-light text-[var(--text-muted)] mt-0.5">
            {fromLabel} {invitation.ownerName || 'parent'}
          </p>
        </div>
      </div>
      <div className="flex-shrink-0 flex gap-2">
        <button
          type="button"
          onClick={handleAccept}
          disabled={busy}
          className="px-4 py-2 rounded-full text-xs font-display font-semibold min-w-[72px] touch-manipulation transition-colors active:scale-95 disabled:opacity-60"
          style={{ background: 'var(--nap-color)', color: 'var(--bg-deep)', border: 'none' }}
        >
          Accept
        </button>
        <button
          type="button"
          onClick={handleDecline}
          disabled={busy}
          className="px-4 py-2 rounded-full text-xs font-display font-semibold min-w-[72px] touch-manipulation transition-colors active:scale-95 border disabled:opacity-60"
          style={{ background: 'transparent', color: 'var(--text-muted)', borderColor: 'var(--glass-border)' }}
        >
          Decline
        </button>
      </div>
    </motion.div>
  );
}

// Premium Baby Profile Card - Single edit trigger (the whole card for owned babies)
interface BabyProfileCardProps {
  baby: SharedBabyProfile;
  isActive: boolean;
  onSelect: () => void;
  onEdit?: () => void;
}

function BabyProfileCard({ baby, isActive, onSelect, onEdit }: BabyProfileCardProps) {
  const { t } = useTranslation();
  const cardStyle = {
    background: 'var(--glass-bg)',
    border: isActive ? '1px solid var(--nap-color)' : '1px solid var(--glass-border)',
    boxShadow: 'var(--shadow-md)',
  };

  return (
    <motion.div
      // Use a very soft opacity-only fade so cards don't "bounce"
      // when the view mounts or when the active baby changes.
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="w-full flex items-center gap-4 p-5 rounded-3xl backdrop-blur-xl transition-all duration-200"
      style={cardStyle}
    >
      {/* Main area: tap opens detail (edit or view) */}
      <button
        type="button"
        onClick={onEdit}
        className="flex-1 flex items-center gap-4 min-w-0 text-left active:scale-[0.99] active:brightness-[1.08] transition-transform"
      >
        <div className="flex-shrink-0">
          <BabyAvatarPicker
            avatarUrl={baby.avatarUrl}
            babyName={baby.name || '?'}
            size="md"
            editable={false}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-semibold text-[var(--text-primary)] text-lg truncate">
            {baby.name || 'Unnamed baby'}
          </p>
          <p className="text-sm font-light text-[var(--text-muted)] mt-0.5">
            {baby.dateOfBirth ? formatAge(t, baby.dateOfBirth) : t('myBabies.ageUnknown')}
            {!baby.isOwner && (
              <span className="ml-2 opacity-70">· Shared by {baby.ownerName || 'parent'}</span>
            )}
          </p>
        </div>
      </button>

      {/* Right: tap to set as active baby (sleep logs / Today / History refer to this baby) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        className="flex-shrink-0 px-4 py-2 rounded-full min-w-[72px] touch-manipulation transition-colors active:scale-95 border text-xs font-display font-semibold"
        title={isActive ? 'Selected baby for sleep logs' : 'Select this baby for sleep logs'}
        aria-pressed={isActive}
        aria-label={isActive ? 'Selected baby for sleep logs' : 'Select this baby for sleep logs'}
        style={
          isActive
            ? { background: 'var(--nap-color)', color: 'var(--bg-deep)', borderColor: 'transparent' }
            : { background: 'transparent', color: 'var(--text-muted)', borderColor: 'var(--glass-border)' }
        }
      >
        {isActive ? 'Selected' : 'Select'}
      </button>
    </motion.div>
  );
}

// Ghost Card for Add Baby
function AddBabyGhostCard({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onClick={onClick}
      className="w-full flex flex-col items-center justify-center gap-3 p-8 rounded-[40px] bg-transparent border-2 border-dashed border-[var(--text-muted)]/25 hover:border-[var(--text-muted)]/40 active:scale-[0.97] active:brightness-[1.12] transition-all duration-200"
      style={{ background: 'transparent' }}
    >
      <div className="w-14 h-14 rounded-full bg-[var(--text-muted)]/10 flex items-center justify-center text-[var(--text-muted)]">
        <PlusIcon />
      </div>
      <p className="font-display font-medium text-[var(--text-muted)]">
        Add your baby
      </p>
    </motion.button>
  );
}

export function MyBabiesView({
  profile,
  sharedProfiles,
  activeBabyId,
  onActiveBabyChange,
  onSave,
  onUploadAvatar,
  onBack,
  onNavigateToBabyDetail,
  pendingInvitations = [],
  onAcceptInvitation,
  onDeclineInvitation,
  openAddSheetOnMount = false,
  onOpenAddSheetHandled,
}: MyBabiesViewProps) {
  const { t } = useTranslation();
  const hasAnyBabies = sharedProfiles.length > 0;
  const hasMultipleBabies = sharedProfiles.length > 1;
  const hasPendingInvites = pendingInvitations.length > 0;

  // Sheet state — only used for adding new babies; user opens via empty state / Add card
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);

  // When parent requested "open add baby" (e.g. FAB with no baby), open sheet and clear request
  useEffect(() => {
    if (openAddSheetOnMount) {
      setIsAddSheetOpen(true);
      onOpenAddSheetHandled?.();
    }
  }, [openAddSheetOnMount]); // eslint-disable-line react-hooks/exhaustive-deps -- only when flag is set

  const handleAddBaby = () => {
    setIsAddSheetOpen(true);
  };

  const handleSheetClose = () => {
    setIsAddSheetOpen(false);
  };

  const handleSheetSave = (data: Partial<Omit<BabyProfileType, 'id'>>) => {
    onSave(data as Omit<BabyProfileType, 'id'>);
  };

  return (
    <div className="space-y-8">
      <SubViewHeader
        title="Baby profiles"
        subtitle={
          hasPendingInvites
            ? (hasAnyBabies ? 'Review invites and manage babies' : 'You have an invite — accept to start logging sleep')
            : hasMultipleBabies
            ? 'Select which baby you want to see sleep logs for'
            : 'Edit your baby’s information'
        }
        onBack={onBack}
      />

      {/* Pending invites — same card structure as babies, with Accept/Decline */}
      {hasPendingInvites && onAcceptInvitation && onDeclineInvitation && (
        <AnimatePresence mode="popLayout">
          <motion.div layout className="space-y-4">
            {pendingInvitations.map((invitation) => (
              <InviteCard
                key={invitation.id}
                invitation={invitation}
                onAccept={onAcceptInvitation}
                onDecline={onDeclineInvitation}
                fromLabel={t('profile.from')}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Baby Gallery - Clean floating cards */}
      <AnimatePresence mode="popLayout">
        <motion.div layout className="space-y-4">
          {sharedProfiles.map((baby) => (
            <BabyProfileCard
              key={baby.id}
              baby={baby}
              isActive={activeBabyId === baby.id}
              onSelect={() => onActiveBabyChange(baby.id)}
              onEdit={() => onNavigateToBabyDetail(baby.id)}
            />
          ))}

          {/* Ghost Card - Add Baby (only if user doesn't have their own baby) */}
          {!profile && hasAnyBabies && (
            <AddBabyGhostCard onClick={handleAddBaby} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Empty state */}
      {!hasAnyBabies && !profile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <p className="text-[var(--text-muted)] mb-4">
            Add your first baby to get started
          </p>
          <AddBabyGhostCard onClick={handleAddBaby} />
        </motion.div>
      )}

      {/* Add Baby Sheet */}
      <BabyEditSheet
        baby={null}
        isOpen={isAddSheetOpen}
        onClose={handleSheetClose}
        onSave={handleSheetSave}
        onUploadAvatar={onUploadAvatar}
        isNewBaby={true}
      />
    </div>
  );
}
