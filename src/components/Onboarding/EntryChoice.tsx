/**
 * Landing screen (Napper-style order): app name → logo → message → buttons.
 */
import { useTranslation } from 'react-i18next';
import { Logo } from '../Logo';

interface EntryChoiceProps {
  onNew: () => void;
  onHaveAccount: () => void;
}

export function EntryChoice({ onNew, onHaveAccount }: EntryChoiceProps) {
  const { t } = useTranslation();
  return (
    <div className="h-screen max-h-dvh overflow-hidden bg-[var(--bg-deep)] flex flex-col items-center justify-center px-4 safe-pad-top safe-pad-bottom">
      {/* 1. App name at top (Napper-style: "NapNap") */}
      <h1 className="text-display-lg text-[var(--text-primary)] font-display mb-8">
        NapNap
      </h1>

      {/* 2. Logo — Rhythmic NN symbol */}
      <div className="mx-auto mb-6 flex-shrink-0 flex items-center justify-center">
        <Logo size={80} />
      </div>

      {/* 3. Short sentence (Napper: "The fastest way to a happy sleeping baby") */}
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
