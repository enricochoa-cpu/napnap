interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-[var(--bg-deep)] flex flex-col items-center justify-center z-50">
      {/* Animated Moon */}
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#f0c674] to-[#d4ae5e] animate-pulse-soft" />
        <div className="absolute inset-0 w-20 h-20 rounded-full bg-[var(--bg-deep)] translate-x-3 -translate-y-1" />
      </div>

      {/* Loading Dots */}
      <div className="loader mb-4">
        <div className="loader-dot" />
        <div className="loader-dot" />
        <div className="loader-dot" />
      </div>

      {/* Message */}
      <p className="font-display text-[var(--text-secondary)] text-lg">{message}</p>
    </div>
  );
}

export function Loader() {
  return (
    <div className="loader">
      <div className="loader-dot" />
      <div className="loader-dot" />
      <div className="loader-dot" />
    </div>
  );
}

export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full border-[rgba(255,255,255,0.1)] border-t-[var(--nap-color)] animate-spin`}
      style={{ animation: 'spin 1s linear infinite' }}
    />
  );
}
