/**
 * Landing screen (Napper-style order): app name → logo → message → buttons.
 */
import { useTranslation } from 'react-i18next';
import { EntryIllustration } from '../illustrations/AuthIllustrations';

interface EntryChoiceProps {
  onNew: () => void;
  onHaveAccount: () => void;
}

export function EntryChoice({ onNew, onHaveAccount }: EntryChoiceProps) {
  const { t } = useTranslation();
  return (
    <div className="h-screen max-h-dvh overflow-hidden bg-[var(--bg-deep)] flex flex-col items-center justify-center px-4 safe-pad-top safe-pad-bottom">
      {/* 1. Illustration as visual anchor */}
      <div className="mx-auto mb-6 w-[200px] h-[140px]" aria-hidden="true">
        <EntryIllustration />
      </div>

      {/* 2. App name */}
      <h1 className="text-display-lg text-[var(--text-primary)] font-display mb-3">
        NapNap
      </h1>

      {/* 3. Short sentence */}
      <p className="text-[var(--text-primary)] font-body text-center text-lg max-w-[280px] mb-10">
        {t('entry.tagline')}
      </p>

      {/* 4. Buttons: Get started / I have an account */}
      <div className="w-full max-w-sm space-y-3">
        <button
          type="button"
          onClick={onNew}
          className="btn btn-primary w-full min-h-[56px]"
        >
          {t('entry.getStarted')}
        </button>
        <button
          type="button"
          onClick={onHaveAccount}
          className="btn btn-secondary w-full min-h-[56px]"
        >
          {t('entry.haveAccount')}
        </button>
      </div>
    </div>
  );
}
