# Frontend Guidelines

## Component Patterns

### Functional Components Only
Every component is a named `function` export — no class components, no `React.FC`, no `forwardRef`.

```typescript
// Standard pattern
export function TodayView({ profile, entries, onEdit }: TodayViewProps) { ... }
```

### Props Contract
- **Callback props** for parent-child communication: `onEdit`, `onSave`, `onClose`, `onDelete`
- **Data flows down** via props, **events flow up** via callbacks
- **No Context API** — state is prop-drilled from `App.tsx` (acceptable given the shallow component tree)
- **Conditional rendering** via boolean props: `isOpen`, `hasActiveSleep`, `loading`

### Component Roles
| Role | Example | Responsibility |
|------|---------|---------------|
| **Orchestrator** | `App.tsx` | Owns all top-level state, wires hooks to views |
| **Smart view** | `TodayView` | Heavy `useMemo` computations, derives predictions from raw data |
| **Detail view** | `BabyDetailView` | Full-screen drill-in with form state + embedded sub-components (ShareAccess) |
| **Sheet/modal** | `SleepEntrySheet`, `BabyEditSheet` | Framer Motion bottom sheet with internal form state. `BabyEditSheet` now only used for "Add Baby" |
| **Presentational** | `NapEntry`, `DailySummary` | Pure display, no data fetching |
| **Guard** | `AuthGuard` | Early-return pattern: loading → auth forms → children |

### Variant Component Pattern
When one entity has visual variants, export separate named components from a single file:
```typescript
// SleepEntry.tsx exports 3 variants
export function NapEntry({ entry, napNumber, onEdit, onEndSleep }: NapEntryProps)
export function BedtimeEntry({ entry, onEdit, onEndSleep }: BedtimeEntryProps)
export function WakeUpEntry({ entry, onEdit }: WakeUpEntryProps)
```

## File Organisation

```
src/
├── components/
│   ├── Auth/           # Feature folder + barrel export (index.ts)
│   ├── Profile/        # Feature folder, no barrel
│   ├── TodayView.tsx   # Singleton view components at root
│   ├── SleepList.tsx
│   └── ...
├── hooks/              # Custom hooks (useAuth, useSleepEntries, etc.)
├── lib/                # Supabase client + DB types
├── types/              # Shared frontend interfaces
├── utils/              # Pure functions (dateUtils, storage)
├── assets/             # Static assets
├── App.tsx             # Root orchestrator
├── main.tsx            # Entry point (React root + Sentry init)
└── index.css           # Full design system (tokens + utility classes)
```

### Naming Conventions
| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase `.tsx` | `SleepEntrySheet.tsx` |
| Hooks | camelCase `use` prefix `.ts` | `useSleepEntries.ts` |
| Utilities | camelCase `.ts` | `dateUtils.ts` |
| Types | PascalCase interfaces | `BabyProfile`, `SleepEntry` |
| DB columns | snake_case | `baby_date_of_birth` |
| CSS vars | kebab-case | `--nap-color`, `--bg-deep` |

### Barrel Exports
Used in `Auth/index.ts` only. Import feature folders as:
```typescript
import { LoginForm, AuthGuard } from './components/Auth';
```

## Styling Approach

### Hybrid: Tailwind Utilities + CSS Custom Properties

**Tailwind** handles layout, spacing, borders, responsiveness:
```tsx
<div className="flex items-center gap-4 p-5 rounded-2xl border border-white/10">
```

**CSS custom properties** (from `index.css` `:root`) handle theme-aware colours:
```tsx
<span className="text-[var(--nap-color)]">Nap time</span>
<div className="bg-[var(--bg-card)]">...</div>
```

**Predefined CSS classes** (in `index.css`) for recurring patterns:
```tsx
<div className="card">          {/* glass-morphism card */}
<button className="btn btn-nap"> {/* themed button */}
<span className="tag tag-active"> {/* pill badge */}
<p className="stat-value-nap">    {/* coloured stat */}
```

### Theme System — Three Circadian Phases
Themes are CSS class overrides on `:root`, applied by `useApplyCircadianTheme()`:

| Phase | Hours | Class | Palette |
|-------|-------|-------|---------|
| Morning | 06:00–11:59 | `.theme-morning` | Warm golden, saturated accents, white cards |
| Afternoon | 12:00–18:59 | `.theme-afternoon` | Soft earth tones, muted warmth |
| Night | 19:00–05:59 | `:root` (default) | Deep navy, desaturated cool blues |

**All colour values are CSS vars** — components never hardcode hex values for theme-sensitive colours. Non-theme decorative values (e.g. `border-white/10`, `bg-white/[0.08]`) use Tailwind directly.

### Key Design Tokens
```css
/* Typography */
--font-display: 'Plus Jakarta Sans';   /* Headings, display text */
--font-body: 'Plus Jakarta Sans';     /* Body copy, UI text */

/* Semantic colours */
--nap-color    /* Sage/teal — daytime naps */
--night-color  /* Periwinkle/indigo — night sleep */
--wake-color   /* Parchment/amber — wake events, totals */

/* Surfaces */
--bg-deep      /* Page background */
--bg-card      /* Card background */
--bg-elevated  /* Elevated surface */
--glass-bg     /* Frosted glass overlay */
```

### Inline Styles
Used sparingly, only for dynamic values or complex shadows that Tailwind can't express:
```tsx
style={{ boxShadow: '0 -8px 32px rgba(0,0,0,0.3)' }}
style={{ zIndex: 100 }}  // For modals above .floating-nav (z-index: 50 in CSS)
```

**z-index rule:** Tailwind `z-[n]` classes may not reliably override plain CSS `z-index`. For critical stacking (modals over the fixed nav bar), always use inline `style={{ zIndex: 100 }}`.

## State Management

### Pure React — No External Libraries
No Redux, Zustand, Jotai, or Context API. All state lives in hooks and flows via props.

### Architecture
```
App.tsx (orchestrator)
├── useAuth()             → auth state + operations
├── useBabyProfile()      → baby/user profiles + CRUD
├── useSleepEntries()     → entries + derived values (activeSleep, awakeMinutes)
├── useBabyShares()       → sharing invitations + role management
├── useApplyCircadianTheme() → theme class on <html>
└── useState(...)         → UI state (currentView, editingEntry, selectedDate)
    └── Props drilled to child components
```

### Hook Patterns

**1. Data fetching** — fetch on mount or dependency change, `useCallback` for operations:
```typescript
const [entries, setEntries] = useState<SleepEntry[]>([]);
useEffect(() => { fetchEntries(); }, [babyId]);

const addEntry = useCallback(async (data) => {
  const { error } = await supabase.from('sleep_entries').insert(...);
  if (!error) setEntries(prev => [mapped, ...prev]);
}, [babyId]);
```

**2. Derived state** — `useMemo` for expensive computations:
```typescript
const predictions = useMemo(() => calculateAllNapWindows(...), [entries, profile]);
```

**3. Non-rendering refs** — `useRef` for values that shouldn't trigger re-renders:
```typescript
const previousView = useRef<View>('home');
```

**4. Timed re-renders** — `setInterval` + `useState` for live countdowns:
```typescript
const [, setTick] = useState(0);
useEffect(() => {
  const id = setInterval(() => setTick(t => t + 1), 60000);
  return () => clearInterval(id);
}, []);
```

### DB ↔ Frontend Type Mapping
Database types (`DbProfile`, snake_case) are converted to frontend types (`BabyProfile`, camelCase) inside hooks. Components never see DB schema:
```typescript
// In hook
const profile: BabyProfile = {
  name: data.baby_name || '',
  dateOfBirth: data.baby_date_of_birth || '',
};
```

## Animation Patterns (Framer Motion)

### View Transitions (`App.tsx`)
```typescript
<AnimatePresence mode="wait">
  <motion.div
    key={currentView}
    initial={{ x: direction * 100, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: direction * -100, opacity: 0 }}
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
  />
</AnimatePresence>
```

### Bottom Sheets (all modals)
- **No bounce:** Use tween for open/close so sheets don’t overshoot. Spring is not used for sheet enter/exit.
- **Handle bar = drag-to-dismiss:** If the sheet shows a drag handle (thin bar), it must support `drag="y"` and `onDragEnd` to close (e.g. offset > 150px or velocity > 500). Otherwise the affordance is misleading.

```typescript
<motion.div
  initial={{ y: '100%' }}
  animate={{ y: 0 }}
  exit={{ y: '100%' }}
  transition={{ duration: 0.25, ease: 'easeOut' }}
  drag="y"
  dragConstraints={{ top: 0, bottom: 0 }}
  dragElastic={{ top: 0, bottom: 0.6 }}
  onDragEnd={(_, info) => {
    if (info.velocity.y > 500 || info.offset.y > 150) onClose();
  }}
  style={{ y }}  // useMotionValue + useTransform for backdrop opacity
  className="... touch-none"
/>
```

### Standard Spring Presets
| Context | Stiffness | Damping | Notes |
|---------|-----------|---------|-------|
| View slides | 300 | 30 | Crisp page transitions |
| Bottom sheets enter/exit | — | — | **Tween** `duration: 0.25, ease: 'easeOut'` (no bounce) |
| Card entrances | 400 | 30 | Snappy item animations |
| Backdrop fade | — | — | `duration: 0.2`, no spring |

### Swipeable Strips (DayNavigator)
```typescript
<motion.div
  drag="x"
  dragConstraints={{ left: 0, right: 0 }}
  dragElastic={0.3}
  onDragEnd={(_, info) => {
    if (info.offset.x > 60 || info.velocity.x > 300) prevWeek();
    else if (info.offset.x < -60 || info.velocity.x < -300) nextWeek();
  }}
/>
```
AnimatePresence slide animation on content change (±40px, 0.2s ease-out).

### Interactive Feedback
- **Tap scale**: `active:scale-[0.97]` via Tailwind (CSS transitions)
- **Tap brightness**: `active:brightness-[1.12]` on premium gallery cards for immediate pressed-state feedback
- **Drag-to-dismiss**: Framer Motion `drag="y"` with elastic physics
- **Drag-to-navigate**: Framer Motion `drag="x"` for horizontal strip navigation (week strip)
- **Layout animations**: `layout` prop on cards for FLIP position changes
