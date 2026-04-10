# UX Audit: Profile & Account Flows

**Date:** 2026-04-10  
**Account tested:** enric@graavia.com  
**App language tested:** English + Catalan  
**Baby context:** Ferran (shared baby, owned by Enric) + temporary owned baby for edit flow testing

---

## Summary

The Profile section is well-structured with a clean 3-item menu (My Babies, Settings, Support) plus Sign out. Language switching is instant and fully translated. Baby profiles, measures, and sharing are intuitive for owned babies. However, there are several issues ranging from a critical scroll bug to minor UX polish items.

---

## Findings

### CRITICAL — Content hidden behind floating nav bar

**Where:** Settings view, Baby detail view (owned baby)  
**What:** The bottom of the Settings page is unreachable. The floating nav bar covers:
- The **Sign out** card (in Settings)
- **Privacy Policy** and **Delete account** links (in Settings)
- **Delete baby** button (in Baby detail)
- **Share baby profile** row is partially obscured (in Baby detail)

The page does not scroll far enough to reveal these items. Users cannot access critical actions like deleting their account or seeing privacy policy from Settings without the content being clipped.

**Impact:** High — users literally cannot reach important actions.  
**Recommendation:** Add bottom padding (`pb-32` or similar) to the Settings and Baby detail scroll containers to account for the nav bar height.

---

### HIGH — Duplicate "Sign out" / "Tancar sessió"

**Where:** Profile menu AND inside Settings  
**What:** "Sign out" appears in two places:
1. Profile menu (main level) — as a standalone button
2. Settings page — as a card at the bottom with subtitle "You can always sign back in"

When the app is in Catalan, "Tancar sessió" appears twice across these two screens.

**Impact:** Medium — creates redundancy and decision fatigue. Users see the same action in two places and may wonder if they do different things.  
**Recommendation:** Remove "Sign out" from inside Settings. It belongs at the Profile menu level (where it already is) as a top-level action. Settings should focus on account preferences only.

---

### MEDIUM — Profile greeting shows "Good evening, there" instead of user's name

**Where:** Profile menu header  
**What:** The greeting says "Good evening, there" with subtitle "Almost there". The user's name is "Not set" in the profile, so it falls back to "there". The subtitle "Almost there" is unclear — it seems to be a motivational message but doesn't convey what's "almost" done.

**Impact:** Low-medium — feels impersonal. A sleep-deprived parent seeing "Almost there" might find it confusing.  
**Recommendation:** 
- When name is not set, show "Good evening" without the trailing "there" (or prompt to set name)
- Clarify or remove the "Almost there" subtitle — if it refers to incomplete profile setup, make that explicit (e.g., "Set your name in Settings")

---

### MEDIUM — "Tap photo to change" text on baby profile

**Where:** Baby detail view (owned babies), Add baby sheet  
**What:** Below the avatar circle, there's always a "Tap photo to change" hint text. 

**Impact:** Low — this is unnecessary UI noise on an existing profile. The camera icon overlay on the avatar is already a clear affordance. The text adds clutter, especially since it's always visible (not just on first visit).  
**Recommendation:** Remove the "Tap photo to change" text. The camera icon inside the circle is sufficient. If you want to keep a hint, show it only once (first time) or only when no photo is set.

---

### MEDIUM — Date of birth shows raw ISO format on shared baby

**Where:** Baby detail view for shared baby (Ferran)  
**What:** The DOB field shows `2025-06-16` (raw ISO format). On the Add baby sheet and owned baby detail, it displays as `15/01/2025` (localized format). The shared baby view uses a disabled textbox that doesn't format the date.

**Impact:** Low-medium — inconsistent and less readable.  
**Recommendation:** Format the DOB consistently as `DD/MM/YYYY` (or locale-appropriate) across all views, including the read-only shared baby view.

---

### MEDIUM — No way to add a second owned baby

**Where:** My Babies list  
**What:** When the user already owns a baby, the "Add your baby" ghost card disappears. There is no "+" button or other affordance to add another baby.

**Impact:** Medium — parents with twins or multiple children cannot add more than one baby profile.  
**Recommendation:** Always show an "Add baby" option (ghost card or "+" button in header) regardless of whether the user already owns a baby.

---

### LOW — Measures list is read-only for shared babies with no indication

**Where:** Measures view (Ferran, shared baby)  
**What:** The 15 measurement cards are displayed but:
- No "+" button to add measurements (correct for shared/viewer role)
- Cards are not tappable for editing (correct for viewer role)
- But there's **no visible indication** that this is read-only. A viewer might tap cards expecting to edit and wonder why nothing happens.

**Impact:** Low — correct behavior but missing feedback.  
**Recommendation:** Add a subtle indicator like "View only" badge or a brief explainer text ("Shared by Enric — view only") at the top of the Measures view for non-owners.

---

### LOW — Password change form partially hidden by nav bar

**Where:** Settings → Change Password (expanded)  
**What:** When the password change form is expanded, the "Confirm new password" field and action buttons are partially obscured by the floating nav bar.

**Impact:** Low — the form is still usable by scrolling on some devices, but the truncation is visible.  
**Recommendation:** Same fix as the critical scroll issue — add bottom padding to the Settings container.

---

### LOW — Gender display inconsistency between owned and shared babies

**Where:** Baby detail view  
**What:**
- **Owned baby:** Gender is an interactive `<select>` dropdown (Boy/Girl/Not specified)
- **Shared baby:** Gender is plain `<p>` text ("Boy")

The shared baby view is correct (read-only), but there's no visual distinction telling the user this is a shared/read-only profile. The fields just look like disabled form elements.

**Recommendation:** Add a small "Shared profile" or "View only" indicator at the top of the shared baby detail view.

---

## Detailed Flow Tests (2026-04-10, session 2)

Playwright MCP walkthrough of Add Baby and Add Measures flows on account enric@graavia.com.

### Add a Baby flow — No new issues

1. Deleted existing owned baby (Lulu) to surface the "Add your baby" ghost card
2. Ghost card appeared correctly in My Babies when no owned baby exists
3. Tapped ghost card → bottom sheet opened with: avatar picker (camera icon), Name (empty), DOB (empty), Gender (defaults "Not specified"), "Add a baby" (disabled), Cancel
4. Filled Name ("Lulu") + DOB (2026-04-10) → "Add a baby" enabled
5. Saved → returned to Profile menu, baby created and auto-selected
6. Verified in My Babies: Lulu (owned, selected) + Ferran (shared by Enric)
7. **Confirmed U-87**: ghost card disappears once an owned baby exists — no way to add a second baby. Already in backlog as P2.

### Add Baby Measures flow — No new issues

1. From Lulu's baby detail → Measures row ("No measurements yet") → Measures view
2. Empty state: "No measurements yet" + "Tap + to add a measurement" + two CTAs (header "+", inline "Add measurement")
3. Tapped inline "Add measurement" → MeasureLogSheet opened with: Date (defaults today), Weight (kg), Height (cm), Head circumference (cm), Notes (optional), Save (disabled)
4. Filled Weight 3.5, Height 50, Head 35 → Save enabled → saved
5. Measurement displayed: "10 Apr 2026" (formatted), Weight 3.5 kg, Height 50 cm, Head 35 cm, Edit button (pencil)
6. Tapped Edit → sheet pre-populated with all values, Delete button in header, Close, Save
7. Tapped Delete → confirmation modal ("Delete this measurement?") → confirmed → back to empty state
8. Full CRUD cycle works correctly, no issues found

### Verified fixes from this session

- **U-84**: Profile greeting shows "Good evening" (no trailing "there"), subtitle "Set your name in Settings" — working
- **U-85**: No "Tap photo to change" text on baby detail or add baby sheet — confirmed removed

---

## Detailed Flow Tests (2026-04-10, session 3)

Playwright MCP walkthrough of Sleep Logging + Night Waking Pauses for baby Lulu on account enric@graavia.com.

### Sleep logging flow — Works well overall

1. **Wake Up action**: Tapped Log sleep → QuickActionSheet (Wake Up / Nap / Bedtime). Tapped Wake Up → opened "Log night sleep" sheet for yesterday (2026-04-09). Set start 20:00, end 07:00. Duration computed correctly as "11h long". "Wake up is next day" helper text shown — nice cross-midnight indicator. Saved successfully.
2. **First nap**: Tapped Log sleep → Nap. Sheet opened with current time as default start. Set to 10:00–11:00. "1h long", "10h 33 min ago". Saved. Timeline: Nap 1 (10:00–11:00) + Morning Wake Up (07:00).
3. **Retroactive (forgotten) nap**: Tapped Log sleep → Nap. Set to 08:00–09:00 (between wake-up and Nap 1). Saved. **Timeline correctly re-ordered and renumbered**: Nap 2 (10:00–11:00), Nap 1 (08:00–09:00), Morning Wake Up (07:00). No collision warning (correct — no overlap).
4. **Bedtime**: Tapped Log sleep → Bedtime. Sheet opened as "Log night sleep" for today. Set start to 20:00, no end (active entry). Saved. Hero updated: "Night Sleep — 1h 38m — Expected wake at 07:00". Night waking button appeared in QuickActionSheet.

### Night waking / pause flow — Issues found

**Test steps:**

1. Tapped active Night Sleep card → Edit sheet opened with: start 20:00, no end, "Sleeping...", qualitative sections. Bottom bar: "Night waking" + "Save".
2. Tapped "Night waking" → **live pause started immediately**. Hero showed "Paused". Bottom bar changed to "Resume" + "Save". The pause is live/running (started at current time). No intermediate step to choose between "start live pause" vs "add a past waking".
3. Tapped "Resume" → pause completed. Night waking 1 appeared as a collapsible card: "Night waking 1 — 21:38 · 1min" with Delete button and ▼ expand arrow. "Night waking" button returned to bottom bar.
4. Expanded Night waking 1 → editable fields: Start (time input: 21:38), Duration (spinbutton: 1 min). Changed start to 21:00, duration to 15.
5. Tapped "Night waking" again → second live pause started. Resumed it. Night waking 2 appeared: "21:39 · 1min".
6. Tapped "Save".

**Findings:**

### BUG — Pause duration edit not persisted

**Where:** SleepEntrySheet → Night waking card (expanded) → Duration spinbutton  
**What:** Edited Night waking 1 duration from 1min to 15min via the spinbutton. The expanded field showed "15", but the collapsed card header still displayed "21:00 · 1min". After saving and reopening the entry, duration was persisted as 1min, not 15min. The spinbutton UI accepted the edit but the value was not propagated to the save payload.  
**Impact:** High — users cannot retroactively correct night waking durations. The edit appears to work (spinbutton updates visually) but silently discards the change.  
**Likely cause:** The `onChange` event from `evaluate()` may not trigger React's synthetic event handler on the spinbutton. However, this could also be a real-device issue if the component reads from stale state. Needs code inspection.

### BUG — Saving active bedtime entry terminates it

**Where:** SleepEntrySheet → active night sleep with pauses → Save  
**What:** After adding two night wakings to an active (no end time) bedtime entry and tapping Save, the entry was saved as **completed** with end time set to 21:39 (the timestamp of the second pause's resume). The bedtime was no longer active — Today view showed "Morning Wake Up 21:39" instead of the ongoing night sleep.  
**Impact:** High — parent logs a night waking during bedtime, saves, and their active bedtime silently ends. They'd need to re-create it or edit the end time back to empty.  
**Expected behavior:** Saving an active entry with pauses should preserve the active state (no end time). The pauses should be saved without terminating the sleep.

### MEDIUM — Collapsed pause card header doesn't reflect edited values

**Where:** SleepEntrySheet → Night waking card (collapsed header summary)  
**What:** After editing the start time and duration in the expanded pause form, the collapsed card header still shows the original values (e.g., "21:00 · 1min" instead of "21:00 · 15min"). The expanded fields show the correct edited values but the collapsed summary is stale.  
**Impact:** Low-medium — confusing, user can't confirm their edit was registered without re-expanding the card.  
**Recommendation:** Derive the collapsed summary text from the same state as the expanded form fields.

### LOW — Missing space in net duration label

**Where:** SleepEntrySheet → completed night sleep with pauses  
**What:** Duration shows "1h 37min long(net)" — missing space before "(net)". Should be "1h 37min long (net)".  
**Impact:** Low — cosmetic.

### What works well in this flow

1. **QuickActionSheet** — clean 3-column grid (Wake Up / Nap / Bedtime) + conditional "Night waking" row when bedtime exists
2. **Retroactive entry insertion** — forgotten naps slot into correct chronological position and all entries renumber automatically
3. **Cross-midnight handling** — "Wake up is next day" helper text, correct duration calculation
4. **Live pause flow** — one-tap to start, one-tap to resume, immediate visual feedback ("Paused" in hero, pulsing ring)
5. **Completed pause cards** — collapsible with editable start time and duration, individual delete buttons
6. **"Add night waking +"** button on completed entries for retrospective pause addition
7. **Qualitative sections** — rich tagging (onset, method, wake reason, mood, notes) without cluttering the primary flow
8. **Sleep Log (History)** — clean vertical timeline with awake gaps calculated and displayed between entries

---

## What Works Well

1. **Language switching** — instant, fully translated across all views (English/Español/Català), persisted correctly
2. **Baby list display** — clean cards with avatar, name, age, shared-by attribution, and Select/Selected toggle
3. **Profile editing** — inline edit with clear Save/Cancel actions, role dropdown is intuitive
4. **Measures view** (owned) — clean empty state with dual CTAs (header "+" and inline "Add measurement" button), well-organized form with date defaulting to today
5. **Share baby profile** — clear email input, permission toggle (Viewer/Caregiver) with role description, clean empty state
6. **Delete confirmation** — proper `alertdialog` with warning message, trash icon, and Cancel/Delete buttons
7. **Support section** — clean About/FAQs/Contact layout with helpful "Quick tip" card
8. **Add baby flow** — smooth bottom sheet with minimal required fields (name + DOB), gender optional, works well
9. **Measures CRUD** — full add/edit/delete cycle works cleanly with proper confirmation modals

---

## Priority Ranking

| # | Finding | Severity | Effort |
|---|---------|----------|--------|
| 1 | Content hidden behind nav bar (Settings, Baby detail) | Critical | Low (add padding) |
| 2 | Duplicate Sign out | High | ~~Done (U-83)~~ |
| 3 | No way to add second baby | Medium | Low (keep ghost card) |
| 4 | Greeting shows "there" + unclear subtitle | Medium | ~~Done (U-84)~~ |
| 5 | "Tap photo to change" clutter | Medium | ~~Done (U-85)~~ |
| 6 | DOB raw ISO format on shared baby | Medium | ~~Done (U-86)~~ |
| 7 | No read-only indicator on shared views | Low | ~~Done (U-88)~~ |
| 8 | Password form obscured by nav | Low | Low (same as #1) |
| 9 | Gender display inconsistency | Low | Low (add indicator) |
| 10 | **Saving active bedtime with pauses terminates it** | **High** | Medium (investigate save logic) |
| 11 | **Pause duration edit not persisted** | **High** | Medium (investigate state binding) |
| 12 | Collapsed pause card header shows stale values | Medium | Low (derive from form state) |
| 13 | Missing space in "(net)" duration label | Low | Low (add space) |
