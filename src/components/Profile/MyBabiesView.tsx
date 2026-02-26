import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BabyProfile as BabyProfileType, UserProfile, BabyShare } from '../../types';
import type { SharedBabyProfile } from '../../hooks/useBabyProfile';
import { calculateAge } from '../../utils/dateUtils';
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
  /** When true, open the add-baby sheet on mount (e.g. navigated from FAB with no baby) */
  openAddSheetOnMount?: boolean;
  onOpenAddSheetHandled?: () => void;
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
  const cardStyle = {
    background: isActive ? 'color-mix(in srgb, var(--nap-color) 12%, var(--glass-bg))' : 'var(--glass-bg)',
    border: isActive ? '1px solid color-mix(in srgb, var(--nap-color) 40%, transparent)' : '1px solid var(--glass-border)',
    boxShadow: 'var(--shadow-md)',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="w-full flex items-center gap-4 p-5 rounded-[40px] backdrop-blur-xl transition-all duration-200"
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
            {baby.dateOfBirth ? calculateAge(baby.dateOfBirth) : 'Age unknown'}
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
        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center min-w-[44px] min-h-[44px] touch-manipulation transition-colors hover:bg-[var(--text-muted)]/10 active:scale-95"
        title={isActive ? 'Selected for sleep logs' : 'Use this baby for sleep logs'}
        aria-pressed={isActive}
        aria-label={isActive ? 'Selected for sleep logs' : 'Use this baby for sleep logs'}
      >
        {isActive ? (
          <div className="w-8 h-8 rounded-full bg-[var(--nap-color)]/20 flex items-center justify-center">
            <span className="text-[var(--nap-color)]">
              <CheckIcon />
            </span>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full border-2 border-[var(--text-muted)]/40" aria-hidden />
        )}
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
  openAddSheetOnMount = false,
  onOpenAddSheetHandled,
}: MyBabiesViewProps) {
  const hasAnyBabies = sharedProfiles.length > 0;
  const hasMultipleBabies = sharedProfiles.length > 1;

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
    <div className="space-y-6">
      <SubViewHeader
        title="My babies"
        subtitle={
          hasMultipleBabies
            ? 'Tap the circle to choose whose sleep logs you see'
            : 'Manage your little ones'
        }
        onBack={onBack}
      />

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
