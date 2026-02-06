import { useState, useEffect, useRef } from 'react';
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

  // Track previous view for nested navigation
  const handleNavigate = (view: ProfileView) => {
    previousView.current = currentView;
    setCurrentView(view);
  };

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  const handleBack = () => {
    setCurrentView('menu');
  };

  const handleBackFromSupport = () => {
    setCurrentView('menu');
  };

  const handleBackFromFaqsOrContact = () => {
    // Go back to support if we came from there, otherwise go to menu
    if (previousView.current === 'support') {
      setCurrentView('support');
    } else {
      setCurrentView('menu');
    }
  };

  return (
    <div className="pb-32 px-6 pt-8 fade-in">
      {currentView === 'menu' && (
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
      )}

      {currentView === 'my-babies' && (
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
      )}

      {currentView === 'support' && (
        <SupportView onBack={handleBackFromSupport} onNavigate={handleNavigate} />
      )}

      {currentView === 'faqs' && (
        <FAQsView onBack={handleBackFromFaqsOrContact} />
      )}

      {currentView === 'contact' && (
        <ContactView onBack={handleBackFromFaqsOrContact} />
      )}

      {currentView === 'account-settings' && (
        <AccountSettingsView
          userProfile={userProfile}
          onBack={handleBack}
          onSignOut={onSignOut}
          onUpdateUser={onUpdate}
        />
      )}
    </div>
  );
}
