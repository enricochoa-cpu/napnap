import { useTranslation } from 'react-i18next';

export function AuthDivider() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-4 my-6">
      <div className="flex-1 h-px bg-white/10" />
      <span className="text-sm text-[var(--text-muted)] font-display">{t('auth.or')}</span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  );
}
