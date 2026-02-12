/**
 * Entry screen before auth: user chooses "I'm new" (onboarding) or "I have an account" (login).
 * Keeps two equal CTAs; no persistence of choice beyond session.
 */

interface EntryChoiceProps {
  onNew: () => void;
  onHaveAccount: () => void;
}

export function EntryChoice({ onNew, onHaveAccount }: EntryChoiceProps) {
  return (
    <div className="h-screen max-h-dvh overflow-hidden bg-[var(--bg-deep)] flex flex-col items-center justify-center px-4">
      <div className="text-center mb-10">
        <div
          className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--night-color)]/20 flex items-center justify-center"
          aria-hidden
        >
          <svg
            className="w-8 h-8 text-[var(--night-color)]"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </div>
        <h1 className="text-display-lg text-[var(--text-primary)] font-display">Baby Sleep Tracker</h1>
        <p className="text-[var(--text-muted)] font-display mt-2">Calm guidance for your baby’s sleep</p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        <button
          type="button"
          onClick={onNew}
          className="btn btn-night w-full min-h-[56px]"
        >
          Get started
        </button>
        <button
          type="button"
          onClick={onHaveAccount}
          className="btn btn-ghost w-full min-h-[56px] border border-[var(--night-color)]"
        >
          I have an account
        </button>
      </div>
    </div>
  );
}
