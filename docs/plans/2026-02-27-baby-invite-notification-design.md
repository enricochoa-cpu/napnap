# Baby Invite Notification & Header Avatar Design

## Goal

Gently indicate to users that they have a pending baby invite to accept, using calm, night-friendly visuals that fit the existing Baby Sleep Tracker design system. The notification should feel like a **positive opportunity** (“something nice is waiting”) rather than a warning or error, and should be discoverable both in the main app header and via the Profile tab.

## Placement Overview

- **Header avatar chip (new)**
  - A small circular avatar chip is placed in the **top-left safe area** of main screens (e.g. Today view), on its own row above the hero/bento card.
  - Tapping the avatar navigates directly to the **“My babies”** screen.
  - When there is at least one pending baby invite, a **small warm dot badge** appears on the avatar.

- **Profile tab icon (existing)**
  - The Profile tab in the bottom navigation keeps its current behavior.
  - When there is at least one pending baby invite, the same **small warm dot badge** appears on the top-right of the Profile tab icon.

Both entry points (avatar header and Profile tab) reflect the **same underlying state**: whether the current user has pending baby invites.

## Visual Design

### Avatar Chip

- **Shape**: Circle, 32–36px diameter (exact sizing aligned to existing avatar components and touch targets).
- **Content**:
  - If the user has a selected baby with an avatar image, show that image.
  - If not, fall back to the baby’s initial (first letter of name) or a generic avatar glyph, matching existing Profile UI.
- **Ring**:
  - 2px outline using `var(--night-color)` or the same token used for selected / active baby cards, to keep consistency with the rest of the design.
  - Optional very subtle glow (`box-shadow`) to separate it from the background without feeling “lit up”.
- **Background**: `var(--bg-card)` on top of `var(--bg-deep)`.

### Notification Dot Badge (shared between avatar and Profile tab)

- **Shape**: Circle.
- **Size**: 7–8px diameter (small but clear on modern mobile screens).
- **Color**: `var(--wake-color)` (warm parchment) to signal “new / positive / opportunity”.
- **Border**: 1px solid `var(--bg-deep)` to maintain crisp edges against dark backgrounds.
- **Position**:
  - **Avatar**: Anchored to the **top-right quadrant** of the avatar circle, slightly overlapping (roughly at 1–2 o’clock).
  - **Profile tab icon**: Anchored to the **top-right** of the tab icon glyph, within the tab button bounds.
- **Elevation**: No extra drop shadow beyond the border; the high-contrast color is enough for salience.
- **Animation**:
  - No continuous pulsing to avoid visual noise for sleep-deprived users.
  - A one-time **fade-in** (150–200ms) when the dot first appears is acceptable but not required.

### Color & Tone Considerations

- **No red**: Avoid red entirely (including dark reds) to prevent “error” or “danger” associations.
- **Warm & welcoming**: `var(--wake-color)` fits the “morning wake” palette and feels like sunrise / opportunity.
- **Emotional safety**: The dot should visually read as “you have something nice waiting” rather than “you forgot something important”.

## Layout With Existing Hero/Bento Card

- The main Today/hero view currently uses a **bento-box style hero card** near the top of the screen.
- To avoid clutter and keep hierarchy:
  - Introduce a **thin header row** above the hero:
    - Left: avatar chip with potential dot.
    - Right: (empty for now, or reserved for future subtle actions like settings/help).
  - The hero/bento card remains **unchanged** in size and layout, and simply starts below this header row with the same horizontal padding.
- This preserves:
  - Clear vertical stack: Status bar → avatar header → hero → timeline/cards.
  - Focus on the hero as the main decision surface.

## Interaction & Behavior

### Avatar Chip (Header)

- **Tap**:
  - Always navigates to **“My babies”** screen.
- **Long-press** (optional, not required for v1):
  - Could later be used for quick baby switching or contextual options, but is out of scope for this iteration.

### Profile Tab Icon

- **Tap**:
  - Continues to behave as it does today (navigating to Profile section).
  - The dot is purely a visual indication that there is unfinished business related to babies (pending invites).

### Notification State Logic

- Define a derived boolean or count, e.g. `hasPendingBabyInvite` or `pendingBabyInviteCount`, via existing hooks (likely `useBabyShares`) or a new selector.
- **Dot visibility**:
  - If `hasPendingBabyInvite === false` → dot **hidden** on both avatar and Profile tab.
  - If `hasPendingBabyInvite === true` → dot **visible** on both avatar and Profile tab.
- **Clearing the dot**:
  - The dot should disappear when:
    - The user **accepts or declines all pending invites**, and the backend reflects zero pending items.
  - Merely opening “My babies” should not clear the dot unless the invites are actually handled; this keeps it honest and predictable.

## Edge Cases

- **No babies yet & no invites**:
  - Avatar still appears (generic avatar), but without dot.
  - Tapping avatar still navigates to “My babies”, which likely shows an empty state with “Add baby” / “I have an invite”.
- **Multiple babies, no pending invites**:
  - Avatar shows the currently active baby’s avatar (or the first baby), no dot.
- **Multiple pending invites**:
  - Dot remains a single dot (no numeric badge) to keep the UI calm and non-urgent.
  - The “My babies” screen is responsible for item-level clarity (e.g. list of invites).

## Accessibility

- **Touch target**:
  - Although the visual avatar is ~32–36px, ensure the interactive area is at least 44x44px, using extra padding around the avatar chip.
- **Screen reader**:
  - Expose an accessible label like:
    - Without invites: “My babies”.
    - With invites: “My babies, you have a baby invite waiting”.
- **Color contrast**:
  - `var(--wake-color)` on `var(--bg-deep)` is expected to be sufficiently distinct; verify contrast in implementation.

## Summary

This design adds a simple, emotionally safe notification mechanic for pending baby invites:

- A **top-left avatar chip** that always navigates to “My babies”.
- A **small warm dot** on both the avatar and the Profile tab when there are pending invites.
- No red, no aggressive pulsing, and no changes to the hero/bento layout beyond introducing a slim header row for the avatar.

