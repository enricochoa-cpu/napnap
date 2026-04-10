import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BabyProfile, UserProfile, BabyShare } from '../../types';
import type { SharedBabyProfile } from '../../hooks/useBabyProfile';
import { ProfileMenu, type ProfileView } from './ProfileMenu';
import { MyBabiesView } from './MyBabiesView';
import { BabyDetailView } from './BabyDetailView';
import { ShareAccessView } from './ShareAccessView';
import { MeasuresView } from './MeasuresView';
import { FAQsView } from './FAQsView';
import { ContactView } from './ContactView';
import { AccountSettingsView } from './AccountSettingsView';
import { SupportView } from './SupportView';
import { AboutView } from './AboutView';
import { PrivacyPolicyView } from './PrivacyPolicyView';
import { TermsOfServiceView } from './TermsOfServiceView';

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
  /** When true, show loading skeleton instead of profile content (avoids empty My babies flash) */
  profileLoading?: boolean;
  /** Optional initial sub-view when opening the Profile section (e.g. directly to My babies) */
  initialView?: ProfileView;
  /** Increment this when the user taps the Profile tab so we reset to menu (avoids having to tap back from Baby Detail, etc.) */
  resetToMenuTrigger?: number;
  /** When the app uses an inner scroll container (e.g. for Chrome), call this to scroll it to top on sub-view change */
  onScrollToTop?: () => void;
  /** Called when user taps back from a view that was entered directly via initialView (e.g. Measures from Stats) — returns to previous tab */
  onExitProfile?: () => void;
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
  profileLoading = false,
  initialView = 'menu',
  resetToMenuTrigger,
  onScrollToTop,
  onExitProfile,
}: ProfileSectionProps) {
  const [currentView, setCurrentView] = useState<ProfileView>(initialView);
  const [selectedBabyId, setSelectedBabyId] = useState<string | null>(null);
  const previousView = useRef<ProfileView>('menu');
  const direction = useRef(1); // 1 = forward (drill in), -1 = backward (go back)
  // Track whether current view was entered directly via initialView (from outside Profile, e.g. Stats → Measures)
  const enteredExternally = useRef(initialView !== 'menu');

  // When user taps the Profile tab from any sub-view (e.g. Baby Detail), reset to menu so they land on Profile root
  useEffect(() => {
    if (resetToMenuTrigger !== undefined && resetToMenuTrigger > 0) {
      setCurrentView('menu');
      setSelectedBabyId(null);
    }
  }, [resetToMenuTrigger]);

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

  const handleNavigateToShareAccess = () => {
    previousView.current = currentView;
    direction.current = 1;
    setCurrentView('share-access');
  };

  const handleBackFromShareAccess = () => {
    direction.current = -1;
    setCurrentView('baby-detail');
  };

  const handleNavigateToMeasures = () => {
    previousView.current = currentView;
    direction.current = 1;
    enteredExternally.current = false; // internal navigation, not from Stats
    setCurrentView('measures');
  };

  const handleBackFromMeasures = () => {
    // When entered directly from another tab (e.g. Stats → Measures), go back to that tab
    if (enteredExternally.current && onExitProfile) {
      enteredExternally.current = false;
      onExitProfile();
      return;
    }
    direction.current = -1;
    setCurrentView('baby-detail');
  };

  // Scroll to top when view changes (window + optional main scroll container used by App)
  useEffect(() => {
    window.scrollTo(0, 0);
    onScrollToTop?.();
  }, [currentView, onScrollToTop]);

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

  const handleBackFromAbout = () => {
    direction.current = -1;
    setCurrentView('support');
  };

  const handleBackFromPrivacy = () => {
    direction.current = -1;
    setCurrentView(previousView.current);
  };

  const handleBackFromTerms = () => {
    direction.current = -1;
    setCurrentView(previousView.current);
  };

  // When the parent component requests a specific initial view (e.g. open directly on My babies
  // from the header avatar), sync the internal view state. This keeps the Profile section
  // navigation self-contained while still allowing high-level entry points to choose where to land.
  useEffect(() => {
    setCurrentView(initialView);
    // Views that require a selected baby — auto-select the active baby
    if ((initialView === 'measures' || initialView === 'baby-detail') && activeBabyId) {
      setSelectedBabyId(activeBabyId);
    }
    // Track external entry so back button can return to previous tab (e.g. Stats)
    enteredExternally.current = initialView !== 'menu';
  }, [initialView, activeBabyId]);

  const slideVariants = {
    initial: (d: number) => ({ x: d * 60, opacity: 0 }),
    animate: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d * -60, opacity: 0 }),
  };

  const slideTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

  // Avoid showing empty/inconsistent profile state while babies are still loading
  if (profileLoading) {
    return (
      <div className="pb-32 px-6 pt-8">
        <div className="space-y-4">
          <div className="h-8 w-48 bg-[var(--text-muted)]/15 rounded-lg animate-pulse" />
          <div className="h-14 w-full bg-[var(--bg-card)] rounded-2xl animate-pulse" />
          <div className="h-14 w-full bg-[var(--bg-card)] rounded-2xl animate-pulse" />
          <div className="h-14 w-full bg-[var(--bg-card)] rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

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
              onNavigate={handleNavigate}
              userProfile={userProfile}
              hasPendingInvite={pendingInvitations.length > 0}
              onSignOut={onSignOut}
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
              pendingInvitations={pendingInvitations}
              onAcceptInvitation={onAcceptInvitation}
              onDeclineInvitation={onDeclineInvitation}
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
                onDeleteBaby={selectedBaby.isOwner ? onDeleteBaby : undefined}
                onOpenShareAccess={selectedBaby.isOwner ? handleNavigateToShareAccess : undefined}
                myShares={myShares}
                onOpenMeasures={handleNavigateToMeasures}
              />
            </motion.div>
          );
        })()}

        {currentView === 'share-access' && selectedBabyId && (() => {
          const selectedBaby = sharedProfiles.find(b => b.id === selectedBabyId);
          if (!selectedBaby?.isOwner) return null;
          return (
            <motion.div
              key="share-access"
              custom={direction.current}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={slideTransition}
            >
              <ShareAccessView
                baby={selectedBaby}
                myShares={myShares}
                onInvite={onInvite}
                onUpdateRole={onUpdateRole}
                onRevokeAccess={onRevokeAccess}
                inviterName={userProfile?.userName || userProfile?.email}
                onBack={handleBackFromShareAccess}
              />
            </motion.div>
          );
        })()}

        {currentView === 'measures' && selectedBabyId && (() => {
          const selectedBaby = sharedProfiles.find(b => b.id === selectedBabyId);
          if (!selectedBaby) return null;
          return (
            <motion.div
              key="measures"
              custom={direction.current}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={slideTransition}
            >
              <MeasuresView
                baby={selectedBaby}
                canEdit={selectedBaby.isOwner}
                onBack={handleBackFromMeasures}
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

        {currentView === 'about' && (
          <motion.div
            key="about"
            custom={direction.current}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={slideTransition}
          >
            <AboutView onBack={handleBackFromAbout} onNavigate={handleNavigate} />
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

        {currentView === 'terms' && (
          <motion.div
            key="terms"
            custom={direction.current}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={slideTransition}
          >
            <TermsOfServiceView onBack={handleBackFromTerms} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
