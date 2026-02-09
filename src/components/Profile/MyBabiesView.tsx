import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BabyProfile as BabyProfileType, UserProfile, BabyShare } from '../../types';
import { calculateAge } from '../../utils/dateUtils';
import { ShareAccess } from '../ShareAccess';
import { BabyAvatarPicker } from './BabyAvatarPicker';
import { BabyEditSheet } from './BabyEditSheet';
import { SubViewHeader } from './SubViewHeader';

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
  onInvite: (email: string, role: 'caregiver' | 'viewer', inviterName?: string, babyName?: string) => Promise<{ success: boolean; error?: string }>;
  onUpdateRole: (shareId: string, role: 'caregiver' | 'viewer') => Promise<{ success: boolean; error?: string }>;
  onRevokeAccess: (shareId: string) => Promise<{ success: boolean; error?: string }>;
  inviterName?: string;
}

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

// Premium Baby Profile Card - Single edit trigger (the whole card for owned babies)
interface BabyProfileCardProps {
  baby: SharedBabyProfile;
  isActive: boolean;
  onSelect: () => void;
  onEdit?: () => void;
}

function BabyProfileCard({ baby, isActive, onSelect, onEdit }: BabyProfileCardProps) {
  const handleClick = () => {
    if (baby.isOwner && onEdit) {
      // For owned babies, clicking opens edit sheet
      onEdit();
    } else {
      // For shared babies, clicking selects them
      onSelect();
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <button
        onClick={handleClick}
        className="w-full flex items-center gap-4 p-5 rounded-[40px] backdrop-blur-xl active:scale-[0.97] transition-all duration-200"
        style={{
          background: isActive ? 'color-mix(in srgb, var(--nap-color) 12%, var(--glass-bg))' : 'var(--glass-bg)',
          border: isActive ? '1px solid color-mix(in srgb, var(--nap-color) 40%, transparent)' : '1px solid var(--glass-border)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* Left: Avatar */}
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

        {/* Right: Active indicator or Edit hint */}
        <div className="flex-shrink-0">
          {isActive ? (
            <div className="w-8 h-8 rounded-full bg-[var(--nap-color)]/20 flex items-center justify-center">
              <span className="text-[var(--nap-color)]">
                <CheckIcon />
              </span>
            </div>
          ) : baby.isOwner ? (
            <span className="text-xs text-[var(--text-muted)]/50 font-display">
              Tap to edit
            </span>
          ) : null}
        </div>
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
      className="w-full flex flex-col items-center justify-center gap-3 p-8 rounded-[40px] bg-transparent border-2 border-dashed border-[var(--text-muted)]/25 hover:border-[var(--text-muted)]/40 active:scale-[0.97] transition-all duration-200"
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
  onUpdate,
  onUploadAvatar,
  onBack,
  myShares,
  onInvite,
  onUpdateRole,
  onRevokeAccess,
  inviterName,
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
      onSave(data as Omit<BabyProfileType, 'id'>);
    } else {
      onUpdate(data);
    }
  };

  return (
    <div className="space-y-6">
      <SubViewHeader title="My babies" subtitle="Manage your little ones" onBack={onBack} />

      {/* Baby Gallery - Clean floating cards */}
      <AnimatePresence mode="popLayout">
        <motion.div layout className="space-y-4">
          {sharedProfiles.map((baby) => (
            <BabyProfileCard
              key={baby.id}
              baby={baby}
              isActive={activeBabyId === baby.id}
              onSelect={() => onActiveBabyChange(baby.id)}
              onEdit={baby.isOwner ? handleEditBaby : undefined}
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
          inviterName={inviterName}
          babyName={profile.name}
        />
      )}

      {/* Edit Sheet */}
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
