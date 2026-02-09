import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BabyProfile, UserProfile, BabyShare } from '../../types';
import { ProfileMenu, type ProfileView } from './ProfileMenu';
import { MyBabiesView } from './MyBabiesView';
import { FAQsView } from './FAQsView';
import { ContactView } from './ContactView';
import { AccountSettingsView } from './AccountSettingsView';
import { SupportView } from './SupportView';
import type { AlgorithmStatusProps } from './AlgorithmStatusCard';

interface SharedBabyProfile extends BabyProfile {
  isOwner: boolean;
  ownerName?: string;
}

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
  // Algorithm status
  algorithmStatus?: AlgorithmStatusProps;
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
  algorithmStatus,
}: ProfileSectionProps) {
  const [currentView, setCurrentView] = useState<ProfileView>('menu');
  const previousView = useRef<ProfileView>('menu');
  const direction = useRef(1); // 1 = forward (drill in), -1 = backward (go back)

  // Track previous view for nested navigation
  const handleNavigate = (view: ProfileView) => {
    previousView.current = currentView;
    direction.current = 1;
    setCurrentView(view);
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
    // Go back to support if we came from there, otherwise go to menu
    if (previousView.current === 'support') {
      setCurrentView('support');
    } else {
      setCurrentView('menu');
    }
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
              sharedProfiles={sharedProfiles}
              pendingInvitations={pendingInvitations}
              onNavigate={handleNavigate}
              onAcceptInvitation={onAcceptInvitation}
              onDeclineInvitation={onDeclineInvitation}
              algorithmStatus={algorithmStatus}
              userProfile={userProfile}
              activeBaby={profile}
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
              myShares={myShares}
              onInvite={onInvite}
              onUpdateRole={onUpdateRole}
              onRevokeAccess={onRevokeAccess}
              inviterName={userProfile?.userName || userProfile?.email}
            />
          </motion.div>
        )}

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
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
