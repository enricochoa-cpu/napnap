# Full App — UX/UI Audit Backlog (2026-03-31)

Source: [2026-03-31 Full App Audit](../../audits/full-app/2026-03-31-full-app-ux-ui-horizontal-audit.md)

---

## P2 — Nice to have

### U-32 — No retry mechanism for data fetch errors

- **Effort**: Medium
- **Impact**: Low
- **Location**: `App.tsx:619-624`
- **Problem**: Global error banner shows "Something went wrong" but provides no way to retry. Only recovery is a full page refresh.
- **Fix**: Add "Tap to retry" button in error banner that calls refresh/refetch from data hooks. May need to expose retry functions from `useSleepEntries`, `useBabyProfile`, `useGrowthLogs`.

### U-33 — Week strip day buttons narrower than standard

- **Effort**: Low
- **Impact**: Low
- **Location**: `DayNavigator.tsx:117`
- **Problem**: `min-w-[44px]` while other touch targets are 56px+. Height meets minimum (56px), width is narrower. Acceptable in 7-column grid but not ideal.
- **Fix**: Increase to `min-w-[48px]` if layout allows on 375px viewports.

### U-34 — No tablet/desktop responsive layouts

- **Effort**: High
- **Impact**: Low
- **Location**: App-wide
- **Problem**: No `lg:` breakpoint layouts. App works on larger screens but doesn't use extra space. Low priority given mobile-first target user.
- **Fix**: Add `lg:` breakpoints for wider viewports (two-column Stats, wider cards, centered containers).

### U-35 — LandingLanguagePicker uses white/ tokens

- **Effort**: Low
- **Impact**: Low
- **Location**: `LandingLanguagePicker.tsx:92-93`
- **Problem**: Stacked variant uses `bg-white/20` and `text-white/60`. Works visually (always-dark menu) but violates project rule of never using `white/` values.
- **Fix**: Replace with `bg-[var(--glass-bg)]` and `text-[var(--text-muted)]`.
