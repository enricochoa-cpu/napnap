import { useTranslation } from 'react-i18next';
import type { BabyProfile, BabyShare } from '../../types';
import { SubViewHeader } from './SubViewHeader';
import { ShareAccess } from '../ShareAccess';

interface ShareAccessViewProps {
  baby: BabyProfile;
  myShares: BabyShare[];
  onInvite: (email: string, role: 'caregiver' | 'viewer', inviterName?: string, babyName?: string) => Promise<{ success: boolean; error?: string }>;
  onUpdateRole: (shareId: string, role: 'caregiver' | 'viewer') => Promise<{ success: boolean; error?: string }>;
  onRevokeAccess: (shareId: string) => Promise<{ success: boolean; error?: string }>;
  inviterName?: string;
  onBack: () => void;
}

/**
 * Full-screen Share Access view. Replaces the inline ShareAccess section that used to live
 * inside Baby Detail, so sharing management has its own screen and is easier to use.
 */
export function ShareAccessView({
  baby,
  myShares,
  onInvite,
  onUpdateRole,
  onRevokeAccess,
  inviterName,
  onBack,
}: ShareAccessViewProps) {
  const { t } = useTranslation();
  const babyName = baby.name || t('common.baby');

  return (
    <div className="space-y-6">
      <SubViewHeader
        title={t('shareAccess.title')}
        subtitle={babyName}
        onBack={onBack}
      />
      <ShareAccess
        myShares={myShares}
        pendingInvitations={[]}
        onInvite={onInvite}
        onUpdateRole={onUpdateRole}
        onRevokeAccess={onRevokeAccess}
        onAcceptInvitation={async () => ({ success: true })}
        onDeclineInvitation={async () => ({ success: true })}
        inviterName={inviterName}
        babyName={babyName}
      />
    </div>
  );
}
