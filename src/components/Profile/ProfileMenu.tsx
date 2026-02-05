import { useMemo, useState } from 'react';
import type { BabyProfile, BabyShare, UserProfile } from '../../types';
import { AlgorithmStatusCard, type AlgorithmStatusProps } from './AlgorithmStatusCard';
import { BabyAvatarPicker } from './BabyAvatarPicker';
import { calculateAge, getAlgorithmStatusTier } from '../../utils/dateUtils';

interface SharedBabyProfile extends BabyProfile {
  isOwner: boolean;
  ownerName?: string;
}

export type ProfileView = 'menu' | 'my-babies' | 'faqs' | 'contact' | 'account-settings' | 'support';

interface ProfileMenuProps {
  sharedProfiles: SharedBabyProfile[];
  pendingInvitations: BabyShare[];
  onNavigate: (view: ProfileView) => void;
  onAcceptInvitation: (shareId: string) => Promise<{ success: boolean; error?: string }>;
  onDeclineInvitation: (shareId: string) => Promise<{ success: boolean; error?: string }>;
  algorithmStatus?: AlgorithmStatusProps;
  userProfile?: UserProfile | null;
  activeBaby?: BabyProfile | null;
}

// Icons
const BabyIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M20 21a8 8 0 1 0-16 0" />
  </svg>
);

const SupportIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const SparklesIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M3 5h4" />
    <path d="M19 17v4" />
    <path d="M17 19h4" />
  </svg>
);


// Status Pill Button
interface StatusPillProps {
  totalEntries: number;
  onClick: () => void;
}

function StatusPill({ totalEntries, onClick }: StatusPillProps) {
  const tier = getAlgorithmStatusTier(totalEntries);
  const label = tier === 'learning' ? 'Learning' : tier === 'calibrating' ? 'Calibrating' : 'Optimised';
  const color =
    tier === 'optimized'
      ? 'var(--success-color)'
      : tier === 'calibrating'
        ? 'var(--nap-color)'
        : 'var(--wake-color)';

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 hover:bg-white/30 active:scale-95 transition-all"
    >
      <span style={{ color }}>
        <SparklesIcon />
      </span>
      <span className="text-xs font-display font-semibold" style={{ color }}>
        {label}
      </span>
    </button>
  );
}

// Premium List Row with glassmorphism
interface ListRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onClick: () => void;
  iconColorClass: string;
  rightElement?: React.ReactNode;
}

function ListRow({ icon, title, subtitle, onClick, iconColorClass, rightElement }: ListRowProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl bg-white/[0.08] backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:bg-white/[0.12] active:scale-[0.98] transition-all"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColorClass}`}>
        {icon}
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="font-display font-medium text-[var(--text-primary)] text-[15px]">{title}</p>
        {subtitle && <p className="text-xs text-[var(--text-muted)] mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex-shrink-0 text-[var(--text-muted)]/50">
        {rightElement || <ChevronRightIcon />}
      </div>
    </button>
  );
}


// Greetings based on time of day
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

// Encouraging messages
const ENCOURAGING_MESSAGES = [
  "You're doing amazing",
  'Keep it up, superstar',
  'Every moment counts',
  'One step at a time',
  "You've got this",
];

function getEncouragingMessage(): string {
  const index = Math.floor(Math.random() * ENCOURAGING_MESSAGES.length);
  return ENCOURAGING_MESSAGES[index];
}

export function ProfileMenu({
  sharedProfiles,
  pendingInvitations,
  onNavigate,
  onAcceptInvitation,
  onDeclineInvitation,
  algorithmStatus,
  userProfile,
  activeBaby,
}: ProfileMenuProps) {
  const [showAlgorithmCard, setShowAlgorithmCard] = useState(false);

  const babyCount = sharedProfiles.length;
  const greeting = getGreeting();
  const encouragement = useMemo(() => getEncouragingMessage(), []);
  const parentName = userProfile?.userName || 'there';
  const primaryBaby = activeBaby || sharedProfiles[0];

  return (
    <div className="space-y-6">
      {/* Identity Header */}
      <div className="text-center pt-2 pb-2">
        <h1 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-1">
          {greeting}, {parentName}
        </h1>
        <p className="text-[var(--text-muted)] text-sm">{encouragement}</p>
      </div>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div className="rounded-2xl bg-gradient-to-br from-[var(--nap-color)]/15 to-[var(--nap-color)]/5 p-4 border border-[var(--nap-color)]/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <h3 className="text-sm font-display font-bold text-[var(--text-primary)] mb-3">
            {pendingInvitations.length === 1 ? 'New Invitation' : `${pendingInvitations.length} Invitations`}
          </h3>
          <div className="space-y-2">
            {pendingInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-card)]/80 backdrop-blur-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-display font-semibold text-[var(--text-primary)] text-sm truncate">
                    {invitation.babyName || 'Baby'}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">from {invitation.ownerName || 'parent'}</p>
                </div>
                <div className="flex gap-2 ml-3">
                  <button
                    onClick={() => onAcceptInvitation(invitation.id)}
                    className="px-3 py-1.5 rounded-lg bg-[var(--nap-color)] text-[var(--bg-deep)] text-sm font-display font-semibold"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => onDeclineInvitation(invitation.id)}
                    className="px-3 py-1.5 rounded-lg bg-[var(--bg-soft)] text-[var(--text-muted)] text-sm font-display"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Primary Baby Card */}
      {primaryBaby && (
        <button
          onClick={() => onNavigate('my-babies')}
          className="w-full rounded-2xl bg-white/[0.08] backdrop-blur-xl p-5 border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:bg-white/[0.12] active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-4">
            <BabyAvatarPicker
              avatarUrl={primaryBaby.avatarUrl}
              babyName={primaryBaby.name}
              size="lg"
              editable={false}
            />
            <div className="flex-1 text-left min-w-0">
              <h2 className="text-xl font-display font-bold text-[var(--text-primary)] truncate">
                {primaryBaby.name}
              </h2>
              <p className="text-sm text-[var(--text-muted)] mt-0.5">
                {calculateAge(primaryBaby.dateOfBirth)} old
              </p>
              {babyCount > 1 && (
                <p className="text-xs text-[var(--nap-color)] mt-1.5 font-display font-medium">
                  +{babyCount - 1} more {babyCount - 1 === 1 ? 'baby' : 'babies'}
                </p>
              )}
            </div>
            {algorithmStatus && (
              <div className="flex-shrink-0">
                <StatusPill
                  totalEntries={algorithmStatus.totalEntries}
                  onClick={() => setShowAlgorithmCard(!showAlgorithmCard)}
                />
              </div>
            )}
          </div>
        </button>
      )}

      {/* Algorithm Status Card - Expandable */}
      {showAlgorithmCard && algorithmStatus && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <AlgorithmStatusCard
            totalEntries={algorithmStatus.totalEntries}
            isHighVariability={algorithmStatus.isHighVariability}
            babyName={algorithmStatus.babyName}
          />
        </div>
      )}

      {/* Empty State */}
      {!primaryBaby && (
        <button
          onClick={() => onNavigate('my-babies')}
          className="w-full rounded-2xl bg-gradient-to-br from-[var(--nap-color)]/10 to-[var(--night-color)]/10 p-8 border-2 border-dashed border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] active:scale-[0.98] transition-transform"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-[var(--nap-color)]/20 flex items-center justify-center text-[var(--nap-color)]">
              <BabyIcon />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-display font-bold text-[var(--text-primary)]">Add your baby</h3>
              <p className="text-sm text-[var(--text-muted)] mt-1">Start tracking sleep patterns</p>
            </div>
          </div>
        </button>
      )}

      {/* Navigation List - No section headers, spacing creates groups */}
      <div className="space-y-3">
        <ListRow
          icon={<BabyIcon />}
          title="My Babies"
          subtitle={babyCount > 0 ? `${babyCount} ${babyCount === 1 ? 'baby' : 'babies'}` : 'Add your first baby'}
          onClick={() => onNavigate('my-babies')}
          iconColorClass="bg-[var(--nap-color)]/20 text-[var(--nap-color)]"
        />
      </div>

      {/* Support - Dedicated route */}
      <div className="space-y-3">
        <ListRow
          icon={<SupportIcon />}
          title="Support"
          subtitle="FAQs and contact us"
          onClick={() => onNavigate('support')}
          iconColorClass="bg-[var(--night-color)]/20 text-[var(--night-color)]"
        />
      </div>

      {/* Settings - Separate implied section */}
      <div className="space-y-3">
        <ListRow
          icon={<SettingsIcon />}
          title="Settings"
          subtitle="Notifications, sign out"
          onClick={() => onNavigate('account-settings')}
          iconColorClass="bg-[var(--text-muted)]/15 text-[var(--text-muted)]"
        />
      </div>
    </div>
  );
}
