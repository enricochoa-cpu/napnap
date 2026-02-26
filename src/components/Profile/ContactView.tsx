import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORT_EMAIL } from '../../constants/legal';
import { SubViewHeader } from './SubViewHeader';

interface ContactViewProps {
  onBack: () => void;
}

const EmailIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

/** Build mailto link with optional subject and body (both URI-encoded). */
function mailtoLink(email: string, subject?: string, body?: string): string {
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);
  const query = params.toString();
  return query ? `mailto:${email}?${query}` : `mailto:${email}`;
}

export function ContactView({ onBack }: ContactViewProps) {
  const { t } = useTranslation();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSendEmail = () => {
    window.location.href = mailtoLink(SUPPORT_EMAIL, subject.trim() || undefined, message.trim() || undefined);
  };

  return (
    <div className="space-y-6">
      <SubViewHeader title={t('contact.title')} subtitle={t('contact.subtitle')} onBack={onBack} />

      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[var(--wake-color)]/20 flex items-center justify-center text-[var(--wake-color)] flex-shrink-0">
            <EmailIcon />
          </div>
          <div>
            <h3 className="font-display font-semibold text-[var(--text-primary)]">
              {t('contact.getInTouch')}
            </h3>
            <p className="text-sm text-[var(--text-muted)]">
              {t('contact.formHint')}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
            {t('contact.subject')}
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={t('contact.subjectPlaceholder')}
            className="input w-full"
            aria-label={t('contact.subject')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
            {t('contact.message')}
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('contact.messagePlaceholder')}
            className="input w-full min-h-[120px] resize-y"
            rows={4}
            aria-label={t('contact.message')}
          />
        </div>
        <button
          type="button"
          onClick={handleSendEmail}
          className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl bg-[var(--wake-color)] text-[var(--bg-deep)] font-display font-semibold transition-transform active:scale-[0.98]"
        >
          <EmailIcon />
          <span>{t('contact.sendEmail')}</span>
        </button>
        <p className="text-xs text-[var(--text-muted)] text-center">
          {t('contact.opensEmail', { email: SUPPORT_EMAIL })}
        </p>
      </div>
    </div>
  );
}
