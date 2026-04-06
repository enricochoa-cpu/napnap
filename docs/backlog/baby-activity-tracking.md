# Baby Activity Tracking (Baby Perks)

> Bottle feeding, breast feeding, pumping, solids, diaper change, temperature, medicine

## Overview

Expand NapNap from a pure sleep tracker into a **sleep-first baby tracker** by adding non-sleep events to the daily timeline. These are quick, point-in-time (or short-duration) events that parents log throughout the day alongside naps and bedtimes.

**Important tension:** The PRD currently lists feeding/nappy as "out of scope" and warns against becoming a "generic parenting super-app." This feature must be implemented with restraint — these events support the sleep story (e.g., "last fed 2h ago, nap coming"), they don't become the main character.

---

## What the user wants

Seven new event types that appear in the daily timeline:
1. **Bottle feeding** — time + amount (ml/oz)
2. **Breast feeding** — time + duration + side (left/right/both)
3. **Pumping** — time + duration + amount
4. **Solids** — time + optional note
5. **Diaper change** — time + type (wet/dirty/both)
6. **Temperature** — time + value (C/F)
7. **Medicine** — time + name/note

Each event has a distinct icon and is shown on the timeline as part of the day.

## How Napper does it

- **QuickActionSheet:** Expanded from 3 actions (Wake up, Nap, Bedtime) to a scrollable grid. Row 1: sleep actions (Wake up, Nap, Bedtime). Row 2+: activity actions (Night waking, Bottle feeding, Nursing, Pumping, Solids, Diaper, etc.). Non-sleep actions show a lock icon (premium/paywall in Napper).
- **Each activity opens its own mini-sheet** with type-specific fields (e.g., bottle → amount picker, breast → side selector + timer, diaper → wet/dirty chips).
- **Timeline integration:** Activities appear as small icon dots on the circular 24h clock and as compact cards in the list view, interleaved with sleep entries by time.
- **No prediction impact:** These events don't feed the sleep prediction engine in Napper — they're informational context.

## Key UX/UI decisions

| Decision | Rationale |
|----------|-----------|
| Sleep stays primary, activities are secondary | NapNap's identity is sleep prediction. Activities are supporting context, not equal citizens. Sleep cards remain visually dominant (larger, coloured). Activity cards are compact and muted. |
| Unified `ActivityEvent` model (not 7 separate tables) | All activities share: id, babyId, type, timestamp, optional duration, optional amount, optional note. Type-specific fields handled via a flexible schema (JSON or typed union). One table, one hook, one component. |
| QuickActionSheet becomes scrollable grid | Current 3-column grid expands to 3x3 or 3x4. Sleep actions stay on row 1 (always visible without scrolling). Activity actions below, scrollable. |
| Each activity type has a mini entry sheet | Reuse the bottom-sheet pattern from SleepEntrySheet. Keep each sheet minimal — time (defaulting to now) + 1-2 type-specific fields + optional note. No heavy forms. |
| Compact timeline cards for activities | Activities on the Sleep Log (history) view use a smaller card format (~36-40px) with icon + label + time + key detail (e.g., "120ml", "wet", "37.2C"). Visually distinct from sleep cards. |
| No prediction impact (initially) | Activities don't affect nap/bedtime predictions in Phase 1. Future: feeding times could inform "fed recently, likely to sleep soon" signals. |
| Free tier — no paywall | Unlike Napper, NapNap doesn't have a paywall. All activities are free. No lock icons. |
| Localised units | Temperature: C or F based on locale. Volume: ml (default) with oz toggle. Weight: g/oz for solids. Respect `UserProfile.locale`. |

## Event types — detail

### Bottle feeding
- **Fields:** time (default: now), amount (ml/oz, number input), note (optional)
- **Icon:** Baby bottle (teal/sage)
- **Card display:** "Bottle — 120ml" + time

### Breast feeding
- **Fields:** time (default: now), duration (minutes, or live timer), side (left / right / both — chip select), note (optional)
- **Icon:** Nursing mother (sage)
- **Card display:** "Nursing — 15min, left" + time
- **Live timer option:** Like sleep entries, breast feeding can be started as a live event and stopped when done.

### Pumping
- **Fields:** time (default: now), duration (minutes), amount (ml/oz, optional), note (optional)
- **Icon:** Breast pump (muted purple)
- **Card display:** "Pumping — 20min, 90ml" + time

### Solids
- **Fields:** time (default: now), note (optional — "banana, avocado")
- **Icon:** Bowl with spoon (green)
- **Card display:** "Solids" + time + note preview

### Diaper change
- **Fields:** time (default: now), type (wet / dirty / both — chip select), note (optional)
- **Icon:** Diaper (pink/warm)
- **Card display:** "Diaper — wet" + time

### Temperature
- **Fields:** time (default: now), value (numeric, 1 decimal), unit (C/F toggle), note (optional)
- **Icon:** Thermometer (red/warm)
- **Card display:** "37.2 C" + time
- **Validation:** Warn if outside 35-42C / 95-107.6F range

### Medicine
- **Fields:** time (default: now), name (text — "Paracetamol 5ml"), note (optional)
- **Icon:** Pill/medicine (blue)
- **Card display:** "Medicine — Paracetamol" + time

---

## Data model

```typescript
type ActivityType =
  | 'bottle_feeding'
  | 'breast_feeding'
  | 'pumping'
  | 'solids'
  | 'diaper'
  | 'temperature'
  | 'medicine';

interface ActivityEvent {
  id: string;
  babyId: string;
  type: ActivityType;
  timestamp: string;          // ISO datetime
  durationMinutes?: number;   // breast feeding, pumping
  amount?: number;            // ml/oz for bottle/pumping, C/F for temp
  amountUnit?: string;        // 'ml' | 'oz' | 'C' | 'F'
  side?: string;              // 'left' | 'right' | 'both' (breast feeding)
  diaperType?: string;        // 'wet' | 'dirty' | 'both'
  notes?: string;             // free text (medicine name, solid foods, etc.)
}
```

**Database:** Single `baby_activities` table:

```sql
create table baby_activities (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid references profiles(id) on delete cascade not null,
  type text not null,            -- activity type enum
  timestamp timestamptz not null,
  duration_minutes int,
  amount numeric(6,1),
  amount_unit text,
  side text,
  diaper_type text,
  notes text,
  created_at timestamptz default now()
);

-- RLS: same pattern as sleep_entries (owner + shared access)
```

**Why one table, not seven:** All activities share the same lifecycle (create, read, update, delete) and timeline placement. Sparse columns (most activities use 2-3 of the optional fields) are simpler than 7 junction tables. PostgreSQL handles nullable columns efficiently.

---

## UI components

### QuickActionSheet expansion
```
Row 1: [Wake up]  [Nap]       [Bedtime]        ← existing, always visible
Row 2: [Night waking*] [Bottle]  [Nursing]      ← new (requires scroll on small screens)
Row 3: [Pumping]  [Solids]    [Diaper]
Row 4: [Temp]     [Medicine]  [—empty—]
```
*Night waking comes from the sleep-log-enrichment feature.

- Sheet height increases to accommodate rows, or becomes scrollable with snap points
- Sleep row is visually separated (subtle divider or spacing) from activity rows
- Activity icons use muted versions of the theme palette to stay secondary to sleep actions

### ActivityEntrySheet (new component)
- Reusable bottom sheet that adapts fields based on `ActivityType`
- Same motion/drag-to-dismiss as SleepEntrySheet
- Time picker defaults to "now" with -1min / +1min quick-adjust buttons (matches Napper's night waking pattern)
- Type-specific fields rendered conditionally
- Save button: circular, matches existing pattern

### Timeline integration (SleepList / history view)
- Activities interleaved with sleep entries, sorted by timestamp
- Activity cards: ~40px height, single row: `[icon] [label] [detail] [time]`
- Use `var(--text-secondary)` for activity text (sleep cards use primary)
- Group by date (existing DayNavigator pattern)

### TodayView integration
- "Recent activity" section below predictions (optional, Phase 2)
- Shows last 2-3 activities as small pills: "Bottle 45min ago", "Diaper 1h ago"
- Does NOT clutter the hero prediction card

---

## Phased implementation plan

### Phase 1 — Data layer + single activity type (bottle feeding)
**Scope:** Prove the full vertical: DB, types, hook, sheet, timeline card.
- Create `baby_activities` table + RLS policies
- Define `ActivityEvent` type and `ActivityType` union
- Create `useActivities` hook (CRUD, fetch by date range, sorted by timestamp)
- Build `ActivityEntrySheet` component (bottle feeding fields only)
- Add "Bottle feeding" to QuickActionSheet (4th button, row 2)
- Show bottle events in SleepList timeline as compact cards
- i18n for all new strings (en/es/ca)

### Phase 2 — Remaining activity types
**Scope:** Extend the proven pattern to all 7 types.
- Add breast feeding (with live timer option — reuse active sleep timer pattern)
- Add pumping, solids, diaper, temperature, medicine
- Expand QuickActionSheet to full grid (3x3 or 3x4)
- Type-specific validation (temperature range, etc.)
- Update DailySummary to show activity counts ("3 feeds, 5 diapers")

### Phase 3 — Timeline polish + TodayView
**Scope:** Visual refinement and dashboard integration.
- Activity icons: custom or emoji-based, consistent with app's illustration style
- Compact card design polish (colour coding per type, subtle icons)
- TodayView "recent activity" pills
- Activity dots on DayNavigator (different colour/shape from sleep entry dots)
- Stats integration: feeding/diaper frequency charts (simple counts, not complex analytics)

### Phase 4 — Live timers for duration activities
**Scope:** Breast feeding and pumping can run as live events.
- "Start nursing" → live timer with pause/stop
- Active activity indicator on TodayView (similar to active sleep)
- Only one active event at a time (sleep OR activity, not both — or allow both with clear visual separation)
- Collision handling: starting a nap while nursing is active → prompt to stop nursing first, or allow parallel tracking

### Dependencies
```
Phase 1 (Bottle — full vertical)
  └── Phase 2 (All activity types)
       └── Phase 3 (Timeline polish + TodayView)
            └── Phase 4 (Live timers)
```

Phase 1 is independent of the sleep-log-enrichment features and can run in parallel.

---

## Risks and considerations

### Product identity
- **Risk:** NapNap becomes a generic baby tracker and loses its sleep-prediction identity.
- **Mitigation:** Sleep predictions remain the hero. Activities are supporting data. Never show activity stats more prominently than sleep stats. Marketing stays sleep-first.

### Scope creep per activity type
- **Risk:** Each activity type grows its own complex form (e.g., solid food → ingredient tracker → allergy flags → meal planning).
- **Mitigation:** Keep each activity to max 3-4 fields. The `notes` field is the escape valve for anything beyond the structured fields. No sub-features within activities in V1.

### Performance
- **Risk:** Many activities per day (8-12 feeds + 8-10 diapers = 20+ events) could slow timeline rendering.
- **Mitigation:** Paginate by date (already how SleepList works). Activities are lightweight records. Lazy-load activity icons.

### Active event conflicts
- **Risk:** Baby is nursing AND a nap starts — what happens?
- **Mitigation (Phase 4):** Allow parallel tracking (nursing can continue during a nap — baby falls asleep while nursing). Show both active indicators. Auto-stop nursing when nap is stopped (optional).

### Shared access
- **Risk:** Caregivers need to see each other's logged activities.
- **Mitigation:** Same RLS pattern as `sleep_entries` — join through `baby_shares` table. No extra sharing logic.

### PRD update needed
- The current PRD lists feeding/nappy as "out of scope." Before implementing, update the PRD to reflect the expanded scope with clear guardrails (sleep-first, activities as context).
