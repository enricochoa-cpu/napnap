/**
 * Landing screen (Napper-style order): app name → logo → message → buttons.
 */

interface EntryChoiceProps {
  onNew: () => void;
  onHaveAccount: () => void;
}

export function EntryChoice({ onNew, onHaveAccount }: EntryChoiceProps) {
  return (
    <div className="h-screen max-h-dvh overflow-hidden bg-[var(--bg-deep)] flex flex-col items-center justify-center px-4 safe-pad-top safe-pad-bottom">
      {/* 1. App name at top (Napper: "napper" → we use "napnap") */}
      <h1 className="text-display-lg text-[var(--text-primary)] font-display mb-8">
        napnap
      </h1>

      {/* 2. Moon icon */}
      <div
        className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--night-color)]/20 flex items-center justify-center flex-shrink-0"
        aria-hidden
      >
        <svg
          className="w-10 h-10 text-[var(--night-color)]"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </div>

      {/* 3. Short sentence (Napper: "The fastest way to a happy sleeping baby") */}
      <p className="text-[var(--text-secondary)] font-body text-center text-lg max-w-[280px] mb-10">
        Calm guidance for your baby’s sleep
      </p>

      {/* 4. Buttons: Get started / I have an account */}
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
