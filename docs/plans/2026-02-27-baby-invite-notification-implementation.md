# Baby Invite Notification Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a calm notification dot for pending baby invites on both the new header avatar and existing Profile tab, and wire the header avatar to open the “My babies” view directly.

**Architecture:** Reuse existing `useBabyShares` hook to derive a `hasPendingBabyInvite` flag in `App.tsx`, introduce a simple header avatar button above the main content, and extend `ProfileSection` so `App` can open the `MyBabiesView` directly. The same `hasPendingBabyInvite` flag will drive a small dot badge rendered both on the header avatar and the bottom Profile tab icon.

**Tech Stack:** React + TypeScript, Framer Motion, existing CSS variables/theme, hooks (`useBabyShares`, `useBabyProfile`).

---

### Task 1: Derive pending invite flag in `App.tsx`

**Files:**
- Modify: `src/App.tsx`

**Steps:**
1. After destructuring `useBabyShares`, compute `const hasPendingBabyInvite = pendingInvitations.length > 0;`.
2. Keep this boolean close to other high-level state (`hasAnyBaby`) so it can be passed into view components and used in the nav.

### Task 2: Add header avatar button above main content

**Files:**
- Modify: `src/App.tsx`

**Steps:**
1. Inside the `<main>` element, above `<AnimatePresence>`, add a slim header row (`div`) with padding matching other screens (e.g. `px-6 pt-6 flex items-center justify-between`).
2. In this header, render a `button` with:
   - `type="button"`, `className="relative inline-flex items-center justify-center rounded-full bg-[var(--bg-card)] border border-[var(--bg-soft)] w-10 h-10 text-sm font-display text-[var(--text-primary)]"`.
   - Inside, show either:
     - The active baby’s avatar initial (first letter of `activeBabyProfile?.name || profile?.name`), uppercased.
     - Fallback to the user’s initial or `"?"` if no names exist.
3. Add a conditionally rendered `span` inside the button for the notification dot when `hasPendingBabyInvite` is true:
   - `className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--wake-color)] border border-[var(--bg-deep)]"`.
4. Set the button’s `onClick` to navigate directly to the `My babies` view (see Task 3 for wiring).
5. Ensure the button has an accessible label that reflects pending invites state (e.g. `"My babies"` vs `"My babies, you have a baby invite waiting"`).

### Task 3: Allow `ProfileSection` to open directly on “My babies”

**Files:**
- Modify: `src/components/Profile/ProfileSection.tsx`
- Modify: `src/App.tsx`

**Steps:**
1. In `ProfileSectionProps`, add an optional `initialView?: ProfileView;`.
2. In the `ProfileSection` function signature, destructure `initialView = 'menu'` and use it to initialize `currentView`:
   - `const [currentView, setCurrentView] = useState<ProfileView>(initialView);`
3. Add a `useEffect` that updates `currentView` when `initialView` changes (to respond when `App` requests a specific sub-view):
   - `useEffect(() => { setCurrentView(initialView); }, [initialView]);`
4. In `App.tsx`, add a small piece of state to remember which profile sub-view should open:
   - `const [profileInitialView, setProfileInitialView] = useState<'menu' | 'my-babies'>('menu');`
5. Pass `initialView={profileInitialView}` into `ProfileSection` in `renderProfileView`.
6. Update the Profile tab button’s `onClick` to:
   - Set `profileInitialView` to `'menu'`.
   - Then call `handleViewChange('profile')`.
7. Update the header avatar button’s `onClick` (from Task 2) to:
   - Set `profileInitialView` to `'my-babies'`.
   - Then call `handleViewChange('profile')`.

### Task 4: Add notification dot to Profile tab icon

**Files:**
- Modify: `src/App.tsx`

**Steps:**
1. Wrap the Profile tab SVG icon(s) in a `div` with `className="relative inline-flex items-center justify-center"`.
2. Conditionally render the same dot `span` used in Task 2 (same classes and size) when `hasPendingBabyInvite` is true.
3. Ensure the dot is rendered for both the active (filled) and inactive (outline) icon states.

### Task 5: Quick visual and behavior check

**Files / Actions:**
- Run app via `npm run dev` and verify:

**Steps:**
1. With no pending invites:
   - Confirm the header avatar shows correct initial, with no dot.
   - Confirm the Profile tab shows no dot.
2. Create or simulate at least one pending invitation (or temporarily mock `hasPendingBabyInvite = true` for manual visual QA):
   - Confirm dot appears on header avatar and Profile tab.
   - Confirm tapping the avatar opens the Profile section directly on “My babies”.
   - Confirm tapping the Profile tab opens the Profile menu as before (when `profileInitialView` is `'menu'`).
3. After accepting/declining invitations such that there are no pending invites, confirm the dot disappears from both places.

