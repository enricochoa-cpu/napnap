import { useState } from 'react';
import type { BabyProfile, UserProfile, BabyShare } from '../../types';
import { ProfileMenu, type ProfileView } from './ProfileMenu';
import { MyBabiesView } from './MyBabiesView';
import { FAQsView } from './FAQsView';
import { ContactView } from './ContactView';
import { AccountSettingsView } from './AccountSettingsView';

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
  onSignOut: () => void;
  // Sharing props
  myShares: BabyShare[];
  pendingInvitations: BabyShare[];
  onInvite: (email: string) => Promise<{ success: boolean; error?: string }>;
  onRevokeAccess: (shareId: string) => Promise<{ success: boolean; error?: string }>;
  onAcceptInvitation: (shareId: string) => Promise<{ success: boolean; error?: string }>;
  onDeclineInvitation: (shareId: string) => Promise<{ success: boolean; error?: string }>;
}

export function ProfileSection({
  profile,
  userProfile,
  sharedProfiles,
  activeBabyId,
  onActiveBabyChange,
  onSave,
  onUpdate,
  onSignOut,
  myShares,
  pendingInvitations,
  onInvite,
  onRevokeAccess,
  onAcceptInvitation,
  onDeclineInvitation,
}: ProfileSectionProps) {
  const [currentView, setCurrentView] = useState<ProfileView>('menu');

  const handleBack = () => {
    setCurrentView('menu');
  };

  return (
    <div className="pb-32 px-6 pt-8 fade-in">
      {currentView === 'menu' && (
        <ProfileMenu
          sharedProfiles={sharedProfiles}
          pendingInvitations={pendingInvitations}
          onNavigate={setCurrentView}
          onAcceptInvitation={onAcceptInvitation}
          onDeclineInvitation={onDeclineInvitation}
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
          onBack={handleBack}
          myShares={myShares}
          onInvite={onInvite}
          onRevokeAccess={onRevokeAccess}
        />
      )}

      {currentView === 'faqs' && (
        <FAQsView onBack={handleBack} />
      )}

      {currentView === 'contact' && (
        <ContactView onBack={handleBack} />
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
