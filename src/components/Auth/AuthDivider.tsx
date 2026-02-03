export function AuthDivider() {
  return (
    <div className="flex items-center gap-4 my-6">
      <div className="flex-1 h-px bg-white/10" />
      <span className="text-sm text-[var(--text-muted)] font-display">or</span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  );
}
