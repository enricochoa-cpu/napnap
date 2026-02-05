import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BabyProfile as BabyProfileType, UserProfile, BabyShare } from '../../types';
import { calculateAge } from '../../utils/dateUtils';
import { ShareAccess } from '../ShareAccess';
import { BabyAvatarPicker } from './BabyAvatarPicker';
import { BabyEditSheet } from './BabyEditSheet';

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
  onUpdateRole: (shareId: string, role: 'caregiver' | 'viewer') => Promise<{ success: boolean; error?: string }>;
  onRevokeAccess: (shareId: string) => Promise<{ success: boolean; error?: string }>;
}

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const PlusIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

// Premium Baby Profile Card
interface BabyProfileCardProps {
  baby: SharedBabyProfile;
  isActive: boolean;
  onClick: () => void;
  onEdit?: () => void;
  showEdit?: boolean;
}

function BabyProfileCard({ baby, isActive, onClick, onEdit, showEdit }: BabyProfileCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="relative"
    >
      <button
        onClick={onClick}
        className={`w-full flex items-center gap-4 p-5 rounded-[40px] backdrop-blur-xl border shadow-[0_8px_30px_rgb(0,0,0,0.06)] active:scale-[0.97] transition-all duration-200 ${
          isActive
            ? 'bg-white/20 border-[var(--nap-color)]/40'
            : 'bg-white/[0.08] border-white/15 hover:bg-white/[0.12]'
        }`}
      >
        {/* Left: Large Avatar */}
        <div className="flex-shrink-0">
          <BabyAvatarPicker
            avatarUrl={baby.avatarUrl}
            babyName={baby.name || '?'}
            size="md"
            editable={false}
          />
        </div>

        {/* Center: Name & Age */}
        <div className="flex-1 text-left min-w-0">
          <p className="font-display font-semibold text-[var(--text-primary)] text-lg truncate">
            {baby.name || 'Unnamed baby'}
          </p>
          <p className="text-sm font-light text-[var(--text-muted)] mt-0.5">
            {baby.dateOfBirth ? calculateAge(baby.dateOfBirth) : 'Age unknown'}
            {!baby.isOwner && (
              <span className="ml-2 opacity-70">· Shared by {baby.ownerName || 'parent'}</span>
            )}
          </p>
        </div>

        {/* Right: Active Indicator */}
        {isActive && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--nap-color)]/20 flex items-center justify-center">
            <span className="text-[var(--nap-color)]">
              <CheckIcon />
            </span>
          </div>
        )}
      </button>

      {/* Edit button overlay - only for owned babies */}
      {showEdit && onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/30 transition-all active:scale-90"
          aria-label="Edit baby"
        >
          <EditIcon />
        </button>
      )}
    </motion.div>
  );
}

// Ghost Card for Add Baby
interface AddBabyGhostCardProps {
  onClick: () => void;
}

function AddBabyGhostCard({ onClick }: AddBabyGhostCardProps) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onClick={onClick}
      className="w-full flex flex-col items-center justify-center gap-3 p-8 rounded-[40px] bg-transparent border-2 border-dashed border-white/30 hover:border-white/50 hover:bg-white/[0.04] active:scale-[0.97] transition-all duration-200"
    >
      <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-[var(--text-muted)]">
        <PlusIcon />
      </div>
      <p className="font-display font-medium text-[var(--text-muted)]">
        Add another baby
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
  onUpdate,
  onUploadAvatar,
  onBack,
  myShares,
  onInvite,
  onUpdateRole,
  onRevokeAccess,
}: MyBabiesViewProps) {
  const hasAnyBabies = sharedProfiles.length > 0;

  // Sheet state
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isAddingNewBaby, setIsAddingNewBaby] = useState(false);

  // Auto-open add sheet if no babies exist
  useEffect(() => {
    if (!hasAnyBabies && !profile) {
      setIsAddingNewBaby(true);
      setIsEditSheetOpen(true);
    }
  }, [hasAnyBabies, profile]);

  const handleEditBaby = () => {
    setIsAddingNewBaby(false);
    setIsEditSheetOpen(true);
  };

  const handleAddBaby = () => {
    setIsAddingNewBaby(true);
    setIsEditSheetOpen(true);
  };

  const handleSheetClose = () => {
    setIsEditSheetOpen(false);
    setIsAddingNewBaby(false);
  };

  const handleSheetSave = (data: Partial<Omit<BabyProfileType, 'id'>>) => {
    if (isAddingNewBaby) {
      // Creating new baby
      onSave(data as Omit<BabyProfileType, 'id'>);
    } else {
      // Updating existing baby
      onUpdate(data);
    }
  };

  const ownBabies = sharedProfiles.filter(b => b.isOwner);

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="w-10 h-10 -ml-1 rounded-2xl flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/10 transition-colors"
          aria-label="Go back"
        >
          <BackIcon />
        </button>
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">
            My babies
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Manage your little ones
          </p>
        </div>
      </div>

      {/* Baby Gallery - Premium Floating Cards */}
      <AnimatePresence mode="popLayout">
        <motion.div layout className="space-y-4">
          {sharedProfiles.map((baby) => (
            <BabyProfileCard
              key={baby.id}
              baby={baby}
              isActive={activeBabyId === baby.id}
              onClick={() => onActiveBabyChange(baby.id)}
              onEdit={baby.isOwner ? handleEditBaby : undefined}
              showEdit={baby.isOwner}
            />
          ))}

          {/* Ghost Card - Add Baby (only if user doesn't have their own baby) */}
          {!profile && hasAnyBabies && (
            <AddBabyGhostCard onClick={handleAddBaby} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Empty state - show ghost card to add first baby */}
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

      {/* Your Baby's Details Card - Compact summary (when profile exists) */}
      {profile && ownBabies.length > 0 && (
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[32px] bg-white/[0.06] backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-5"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-display font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Quick Info
            </h2>
            <button
              onClick={handleEditBaby}
              className="text-[var(--nap-color)] text-sm font-medium font-display flex items-center gap-1.5 hover:opacity-80 transition-opacity"
            >
              <EditIcon />
              Edit
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="p-3 rounded-2xl bg-white/[0.06] text-center">
              <p className="text-[var(--text-muted)] text-xs mb-1">Gender</p>
              <p className="text-[var(--text-primary)] font-medium">
                {profile.gender === 'male' ? 'Boy' : profile.gender === 'female' ? 'Girl' : '—'}
              </p>
            </div>
            {profile.weight > 0 && (
              <div className="p-3 rounded-2xl bg-white/[0.06] text-center">
                <p className="text-[var(--text-muted)] text-xs mb-1">Weight</p>
                <p className="text-[var(--text-primary)] font-medium">{profile.weight} kg</p>
              </div>
            )}
            {profile.height > 0 && (
              <div className="p-3 rounded-2xl bg-white/[0.06] text-center">
                <p className="text-[var(--text-muted)] text-xs mb-1">Height</p>
                <p className="text-[var(--text-primary)] font-medium">{profile.height} cm</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Share Access Section (only for profile owner) */}
      {profile && onInvite && onRevokeAccess && (
        <ShareAccess
          myShares={myShares}
          pendingInvitations={[]}
          onInvite={onInvite}
          onUpdateRole={onUpdateRole}
          onRevokeAccess={onRevokeAccess}
          onAcceptInvitation={async () => ({ success: true })}
          onDeclineInvitation={async () => ({ success: true })}
        />
      )}

      {/* Edit Sheet - Slides up from bottom */}
      <BabyEditSheet
        baby={profile}
        isOpen={isEditSheetOpen}
        onClose={handleSheetClose}
        onSave={handleSheetSave}
        onUploadAvatar={onUploadAvatar}
        isNewBaby={isAddingNewBaby}
      />
    </div>
  );
}
