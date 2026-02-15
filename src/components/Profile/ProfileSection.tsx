import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BabyProfile, UserProfile, BabyShare } from '../../types';
import type { SharedBabyProfile } from '../../hooks/useBabyProfile';
import { ProfileMenu, type ProfileView } from './ProfileMenu';
import { MyBabiesView } from './MyBabiesView';
import { BabyDetailView } from './BabyDetailView';
import { FAQsView } from './FAQsView';
import { ContactView } from './ContactView';
import { AccountSettingsView } from './AccountSettingsView';
import { SupportView } from './SupportView';
import { PrivacyPolicyView } from './PrivacyPolicyView';

interface ProfileSectionProps {
  profile: BabyProfile | null;
  userProfile: UserProfile | null;
  sharedProfiles: SharedBabyProfile[];
  activeBabyId: string | null;
  onActiveBabyChange: (babyId: string) => void;
  onSave: (data: Omit<BabyProfile, 'id'> & Partial<Omit<UserProfile, 'email'>>) => void;
  onUpdate: (data: Partial<Omit<BabyProfile, 'id'>> & Partial<Omit<UserProfile, 'email'>>) => void;
  onUploadAvatar?: (file: File) => Promise<string | null>;
  onSignOut: () => void;
  // Sharing props
  myShares: BabyShare[];
  pendingInvitations: BabyShare[];
  onInvite: (email: string, role: 'caregiver' | 'viewer', inviterName?: string, babyName?: string) => Promise<{ success: boolean; error?: string }>;
  onUpdateRole: (shareId: string, role: 'caregiver' | 'viewer') => Promise<{ success: boolean; error?: string }>;
  onRevokeAccess: (shareId: string) => Promise<{ success: boolean; error?: string }>;
  onAcceptInvitation: (shareId: string) => Promise<{ success: boolean; error?: string }>;
  onDeclineInvitation: (shareId: string) => Promise<{ success: boolean; error?: string }>;
  onDeleteBaby?: () => Promise<void>;
  onDeleteAccount: () => Promise<void>;
  isDeletingAccount: boolean;
  deleteAccountError: string | null;
  /** When true, switch to My Babies and open add-baby sheet (e.g. from FAB when user has no baby) */
  requestOpenAddBaby?: boolean;
  onClearRequestOpenAddBaby?: () => void;
}

export function ProfileSection({
  profile,
  userProfile,
  sharedProfiles,
  activeBabyId,
  onActiveBabyChange,
  onSave,
  onUpdate,
  onUploadAvatar,
  onSignOut,
  myShares,
  pendingInvitations,
  onInvite,
  onUpdateRole,
  onRevokeAccess,
  onAcceptInvitation,
  onDeclineInvitation,
  onDeleteBaby,
  onDeleteAccount,
  isDeletingAccount,
  deleteAccountError,
  requestOpenAddBaby = false,
  onClearRequestOpenAddBaby,
}: ProfileSectionProps) {
  const [currentView, setCurrentView] = useState<ProfileView>('menu');
  const [selectedBabyId, setSelectedBabyId] = useState<string | null>(null);
  const previousView = useRef<ProfileView>('menu');
  const direction = useRef(1); // 1 = forward (drill in), -1 = backward (go back)

  // When app requests "open add baby" (e.g. FAB with no baby), go to My Babies; sheet opens in MyBabiesView
  useEffect(() => {
    if (requestOpenAddBaby) {
      previousView.current = currentView;
      direction.current = 1;
      setCurrentView('my-babies');
    }
  }, [requestOpenAddBaby]); // eslint-disable-line react-hooks/exhaustive-deps -- only react to request flag

  // Track previous view for nested navigation
  const handleNavigate = (view: ProfileView) => {
    previousView.current = currentView;
    direction.current = 1;
    setCurrentView(view);
  };

  const handleNavigateToBabyDetail = (babyId: string) => {
    setSelectedBabyId(babyId);
    previousView.current = currentView;
    direction.current = 1;
    setCurrentView('baby-detail');
  };

  const handleBackFromBabyDetail = () => {
    direction.current = -1;
    setCurrentView('my-babies');
    setSelectedBabyId(null);
  };

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  const handleBack = () => {
    direction.current = -1;
    setCurrentView('menu');
  };

  const handleBackFromSupport = () => {
    direction.current = -1;
    setCurrentView('menu');
  };

  const handleBackFromFaqsOrContact = () => {
    direction.current = -1;
    if (previousView.current === 'support') {
      setCurrentView('support');
    } else {
      setCurrentView('menu');
    }
  };

  const handleBackFromPrivacy = () => {
    direction.current = -1;
    setCurrentView(previousView.current);
  };

  const slideVariants = {
    initial: (d: number) => ({ x: d * 60, opacity: 0 }),
    animate: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d * -60, opacity: 0 }),
  };

  const slideTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

  return (
    <div className="pb-32 px-6 pt-8">
      <AnimatePresence mode="wait" custom={direction.current}>
        {currentView === 'menu' && (
          <motion.div
            key="menu"
            custom={direction.current}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={slideTransition}
          >
            <ProfileMenu
              pendingInvitations={pendingInvitations}
              onNavigate={handleNavigate}
              onAcceptInvitation={onAcceptInvitation}
              onDeclineInvitation={onDeclineInvitation}
              userProfile={userProfile}
            />
          </motion.div>
        )}

        {currentView === 'my-babies' && (
          <motion.div
            key="my-babies"
            custom={direction.current}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={slideTransition}
          >
            <MyBabiesView
              profile={profile}
              sharedProfiles={sharedProfiles}
              activeBabyId={activeBabyId}
              onActiveBabyChange={onActiveBabyChange}
              onSave={onSave}
              onUpdate={onUpdate}
              onUploadAvatar={onUploadAvatar}
              onBack={handleBack}
              onNavigateToBabyDetail={handleNavigateToBabyDetail}
              myShares={myShares}
              onInvite={onInvite}
              onUpdateRole={onUpdateRole}
              onRevokeAccess={onRevokeAccess}
              inviterName={userProfile?.userName || userProfile?.email}
              openAddSheetOnMount={requestOpenAddBaby}
              onOpenAddSheetHandled={onClearRequestOpenAddBaby}
            />
          </motion.div>
        )}

        {currentView === 'baby-detail' && selectedBabyId && (() => {
          const selectedBaby = sharedProfiles.find(b => b.id === selectedBabyId);
          if (!selectedBaby) return null;
          return (
            <motion.div
              key="baby-detail"
              custom={direction.current}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={slideTransition}
            >
              <BabyDetailView
                baby={selectedBaby}
                isOwner={selectedBaby.isOwner}
                onBack={handleBackFromBabyDetail}
                onUpdate={onUpdate}
                onUploadAvatar={onUploadAvatar}
                myShares={myShares}
                onInvite={onInvite}
                onUpdateRole={onUpdateRole}
                onRevokeAccess={onRevokeAccess}
                onDeleteBaby={selectedBaby.isOwner ? onDeleteBaby : undefined}
                inviterName={userProfile?.userName || userProfile?.email}
              />
            </motion.div>
          );
        })()}

        {currentView === 'support' && (
          <motion.div
            key="support"
            custom={direction.current}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={slideTransition}
          >
            <SupportView onBack={handleBackFromSupport} onNavigate={handleNavigate} />
          </motion.div>
        )}

        {currentView === 'faqs' && (
          <motion.div
            key="faqs"
            custom={direction.current}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={slideTransition}
          >
            <FAQsView onBack={handleBackFromFaqsOrContact} />
          </motion.div>
        )}

        {currentView === 'contact' && (
          <motion.div
            key="contact"
            custom={direction.current}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={slideTransition}
          >
            <ContactView onBack={handleBackFromFaqsOrContact} />
          </motion.div>
        )}

        {currentView === 'account-settings' && (
          <motion.div
            key="account-settings"
            custom={direction.current}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={slideTransition}
          >
            <AccountSettingsView
              userProfile={userProfile}
              onBack={handleBack}
              onSignOut={onSignOut}
              onUpdateUser={onUpdate}
              onDeleteAccount={onDeleteAccount}
              isDeletingAccount={isDeletingAccount}
              deleteAccountError={deleteAccountError}
              onNavigateToPrivacy={() => handleNavigate('privacy')}
            />
          </motion.div>
        )}

        {currentView === 'privacy' && (
          <motion.div
            key="privacy"
            custom={direction.current}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={slideTransition}
          >
            <PrivacyPolicyView onBack={handleBackFromPrivacy} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
