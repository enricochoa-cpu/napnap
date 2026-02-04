import type { BabyProfile, BabyShare } from '../../types';
import { AlgorithmStatusCard, type AlgorithmStatusProps } from './AlgorithmStatusCard';

interface SharedBabyProfile extends BabyProfile {
  isOwner: boolean;
  ownerName?: string;
}

export type ProfileView = 'menu' | 'my-babies' | 'faqs' | 'contact' | 'account-settings';

interface ProfileMenuProps {
  sharedProfiles: SharedBabyProfile[];
  pendingInvitations: BabyShare[];
  onNavigate: (view: ProfileView) => void;
  onAcceptInvitation: (shareId: string) => Promise<{ success: boolean; error?: string }>;
  onDeclineInvitation: (shareId: string) => Promise<{ success: boolean; error?: string }>;
  algorithmStatus?: AlgorithmStatusProps;
}

// Icons
const BabyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M20 21a8 8 0 1 0-16 0" />
  </svg>
);

const HelpIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const MessageIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

interface MenuCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
  iconBgClass?: string;
}

function MenuCard({ icon, title, subtitle, onClick, iconBgClass = 'bg-[var(--nap-color)]/20' }: MenuCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-card)] shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
    >
      <div className={`w-12 h-12 rounded-xl ${iconBgClass} flex items-center justify-center flex-shrink-0 text-[var(--nap-color)]`}>
        {icon}
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="font-display font-semibold text-[var(--text-primary)] text-base">
          {title}
        </p>
        <p className="text-sm text-[var(--text-muted)] truncate">
          {subtitle}
        </p>
      </div>
      <div className="flex-shrink-0 text-[var(--text-muted)]">
        <ChevronRightIcon />
      </div>
    </button>
  );
}

export function ProfileMenu({
  sharedProfiles,
  pendingInvitations,
  onNavigate,
  onAcceptInvitation,
  onDeclineInvitation,
  algorithmStatus,
}: ProfileMenuProps) {
  const babyCount = sharedProfiles.length;

  return (
    <div className="space-y-8">
      {/* Algorithm Status - Top for transparency */}
      {algorithmStatus && (
        <AlgorithmStatusCard
          totalEntries={algorithmStatus.totalEntries}
          isHighVariability={algorithmStatus.isHighVariability}
          babyName={algorithmStatus.babyName}
        />
      )}

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div className="card p-6 border-2 border-[var(--nap-color)]/30">
          <h3 className="text-lg font-display font-bold text-[var(--text-primary)] mb-4">
            {pendingInvitations.length === 1 ? 'Pending Invitation' : 'Pending Invitations'}
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            You've been invited to help track {pendingInvitations.length === 1 ? 'a baby' : 'these babies'}
          </p>
          <div className="space-y-3">
            {pendingInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-soft)]"
              >
                <div>
                  <p className="font-display font-semibold text-[var(--text-primary)] text-lg">
                    {invitation.babyName || 'Baby'}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">
                    Invitation from {invitation.ownerName || 'parent'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onAcceptInvitation(invitation.id)}
                    className="px-4 py-2 rounded-lg bg-[var(--nap-color)] text-[var(--bg-deep)] text-sm font-display font-semibold"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => onDeclineInvitation(invitation.id)}
                    className="px-4 py-2 rounded-lg bg-[var(--bg-card)] text-[var(--text-muted)] text-sm font-display"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-2">
          Account details
        </h1>
        <p className="text-[var(--text-secondary)] text-sm">
          Add your baby, check our FAQs or contact us
        </p>
      </div>

      {/* My Babies Section */}
      <div className="space-y-3">
        <div className="px-1">
          <h2 className="text-lg font-display font-semibold text-[var(--text-primary)]">
            My babies
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            Edit your baby details
          </p>
        </div>
        <MenuCard
          icon={<BabyIcon />}
          title={babyCount > 0 ? `${babyCount} ${babyCount === 1 ? 'baby' : 'babies'}` : 'Add your baby'}
          subtitle={babyCount > 0 ? 'Manage, edit or share' : 'Get started by adding your little one'}
          onClick={() => onNavigate('my-babies')}
        />
      </div>

      {/* Support Section */}
      <div className="space-y-3">
        <div className="px-1">
          <h2 className="text-lg font-display font-semibold text-[var(--text-primary)]">
            Support
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            We are here to help you and your baby
          </p>
        </div>
        <div className="space-y-3">
          <MenuCard
            icon={<HelpIcon />}
            title="FAQs"
            subtitle="Let's solve your doubts"
            onClick={() => onNavigate('faqs')}
            iconBgClass="bg-[var(--night-color)]/20"
          />
          <MenuCard
            icon={<MessageIcon />}
            title="Contact us"
            subtitle="Any questions? A suggestion? We are here to help! 😊"
            onClick={() => onNavigate('contact')}
            iconBgClass="bg-[var(--wake-color)]/20"
          />
        </div>
      </div>

      {/* Account Settings Section */}
      <div className="space-y-3">
        <div className="px-1">
          <h2 className="text-lg font-display font-semibold text-[var(--text-primary)]">
            Account settings
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            Manage your account preferences
          </p>
        </div>
        <MenuCard
          icon={<SettingsIcon />}
          title="Settings"
          subtitle="Logout, delete account, notifications"
          onClick={() => onNavigate('account-settings')}
          iconBgClass="bg-[var(--text-muted)]/20"
        />
      </div>
    </div>
  );
}
