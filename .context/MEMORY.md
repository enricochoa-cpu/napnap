# Napnap: Long-Term Memory & Project DNA

## 1. Core Philosophy: "The AAA Standard"

**Relief over Insight**: El objetivo no es solo dar datos, sino aliviar la carga cognitiva de los padres. "Decision Replacement" en lugar de "Decision Support".

**Night-First Aesthetic**: La app se usa principalmente de noche (3 AM). Todo debe ser oscuro, suave y evitar el deslumbramiento. Colores desaturados, tipografía grande, contraste calmado.

**Precision without Friction**: El registro debe ser veloz (mínimos clics), pero la lógica de fondo debe ser extremadamente precisa (compensación de siestas cortas, elasticidad del bedtime).

**Emotional Safety**: Tono no-judgmental ("gentle friend" persona). Permitir edición retrospectiva sin penalización.

---

## 2. Technical Stack & Architecture

| Layer | Technology |
|-------|------------|
| Framework | React 18 + TypeScript (SPA Mobile-First via Browser) |
| Styling | Tailwind CSS + CSS Custom Properties para temas circadianos |
| Database | Supabase (Auth, PostgreSQL, RLS) |
| Animations | Framer Motion (Spring Physics) |
| Build | Vite |

### Animation Standards (Framer Motion)
- **Route Transitions**: `AnimatePresence` con slide horizontal (`stiffness: 300, damping: 30`)
- **Bottom Sheets**: Tween para open/close (`duration: 0.25, ease: 'easeOut'` — sin bounce). Cualquier sheet con handle bar debe tener drag-to-dismiss (`drag="y"`, `onDragEnd`; dismiss en `offset.y > 150` o `velocity.y > 500`).
- **Modals**: Scale-in con backdrop blur

### Viewport & Mobile
- Uso de `dvh` (Dynamic Viewport Height) para evitar cortes con barras dinámicas de Safari/Chrome
- `env(safe-area-inset-bottom)` para notch/home indicator
- Touch targets mínimos: 56px (idealmente 60px)

### Performance Patterns
- **Skeleton Screens**: `SkeletonTimelineCard` con altura exacta (48px) para evitar layout shift
- **Lazy computation**: `useMemo` para cálculos de predicciones
- **Minute-level refresh**: `setInterval` cada 60s para countdowns en vivo

---

## 3. Core Sleep Logic

### Dynamic Age Profiles
El sistema calcula wake windows y necesidades de sueño basándose en `dateOfBirth` del bebé activo. Configuraciones en `dateUtils.ts`.

### Algoritmo de Ventanas Progresivas
Las wake windows se expanden a lo largo del día:
- **WW1 (Mañana)**: La más corta (presión de sueño residual)
- **WW2+**: Incremento progresivo
- **WW Final (Pre-Bedtime)**: La más larga para presión homeostática

### Compensación de Siestas Cortas
- **Umbral reparador**: ~45-50 min (un ciclo de sueño)
- **Penalización**: Si duración < umbral, multiplicador 0.75x a la siguiente wake window

### Bedtime Dinámico y Elástico
- **No es hora fija**: Es un rango óptimo recalculado tras cada evento
- **Anclaje**: Se basa en `lastNapEndTime + finalWakeWindow`
- **Early Bedtime Trigger**: Si sueño diurno acumulado < mínimo, adelanta al límite inferior del rango

### Predicciones Durante Nap Activa
Cuando hay una nap en curso:
1. Se cuenta como "consumida" en el total (`effectiveNapCount = completedNaps + 1`)
2. Se usa `expectedWakeTime` como anchor para predicciones futuras
3. Se filtran predicciones que caerían antes del expected wake

### Overdue Nap Handling (Critical)
Cuando una predicción de nap está en el pasado ("overdue"):
1. **NO filtrar silenciosamente** - esto causa que bedtime se ancle en datos viejos
2. Si no hay nap activa y es la primera predicción: mostrar como "now"
3. Esto asegura que bedtime calcule desde el tiempo actual, no desde hace horas
4. **Key learning:** El padre puede "saltarse" la ventana óptima; el sistema debe adaptarse

---

## 4. Key UI/UX Patterns

### Quick Actions (FAB → Bottom Sheet)
- Botón "+" central en nav bar abre `QuickActionSheet`
- Grid 3 columnas: Wake Up, Nap, Bedtime
- Si hay sleep activo: solo muestra "Wake Up"

### Timeline River (TodayView)
- Cards compactas horizontales (~48px altura)
- Línea vertical conectora (timeline river)
- Orden: más reciente arriba, wake up al fondo
- Cards sólidas = completado, ghost/dashed = predicción

### Smart Editor (SleepEntrySheet)
- Bottom sheet desde abajo (50dvh)
- **Drag-to-dismiss**: Swipe down para cerrar
- **Header:** solo icono de tipo (nube/luna) + label "Nap"/"Bedtime" — sin fecha en el header
- **Debajo de start time:** duración "Xmin long" / "Xh Ymin long" (o "—" si no hay end). **Debajo de end time:** hoy = "Xh Y min ago"; ayer = "Yesterday"; más viejo = "Feb 10" (mes + día). "Sleeping..." si entry activa sin end. Labels en una sola línea (whitespace-nowrap, min-w-[7ch])
- Botón save con iconos contextuales: Play (nueva sin fin), Stop (entry activa), Check (completada)
- **Temporal Validation**: bloquea duración 0, nap > 5h, night > 14h. Warn: nap > 4h, night > 13h, cross-midnight nap
- Trash icon gris sutil, opacidad completa (era /60, ahora full)

### Circadian Themes
Cambio automático basado en hora del día:
- **Morning (06:00-11:59)**: Fondo cálido, colores vibrantes
- **Afternoon (12:00-18:59)**: Fondo neutro, colores saturados
- **Night (19:00-05:59)**: Fondo oscuro, colores desaturados

### Pre-auth onboarding (UX/UI only)
- **Entry:** AuthGuard muestra primero EntryChoice ("Get started" / "I have an account"). Si "Get started" → OnboardingFlow; si "I have an account" → Login.
- **Flujo:** Welcome (merged) → Baby name → Baby DOB → Your name → Your relationship → Account (SignUp/Login). Layout Napper-style: pregunta arriba, Next abajo; viewport fijo (no scroll); safe-pad-top / safe-pad-bottom para no pegar al browser.
- **Validación:** Next deshabilitado hasta completar el paso (nombre bebé, DOB, nombre usuario). DOB por defecto vacío para forzar elección.
- **Pendiente:** Persistencia (localStorage/Supabase), schema, escribir perfil al primer login.

---

## 5. User Preferences & Style

**Concise Communication**: Soluciones directas, explicaciones técnicas breves.

**Anti-Tosco**: Rechazo a componentes que parezcan formularios web estándar. Premium feel siempre.

**Mobile-Browser-First**: No es una app nativa, pero debe sentirse como una. Gestos naturales, física de movimiento, feedback táctil.

**Data Integrity**:
- El wake up matutino = `endTime` del registro `night`
- "Awake for X" es el KPI más valioso para el padre
- Las predicciones nunca deben contradecir la realidad (no mostrar predicted nap que solape con nap activa)

---

## 6. Files & Architecture Reference

### Core Components
| Component | Responsibility |
|-----------|----------------|
| `App.tsx` | Router, AnimatePresence transitions, collision detection |
| `TodayView.tsx` | Smart dashboard, predictions, skeleton loading |
| `StatsView.tsx` | Sleep statistics with Recharts (bar/area charts), single date range picker (one control opens DateRangePickerSheet for start+end) |
| `SleepEntrySheet.tsx` | Add/edit entries, temporal validation, dynamic labels, Framer Motion drag-to-dismiss |
| `QuickActionSheet.tsx` | 3-column quick actions grid; bottom sheet with drag-to-dismiss |
| `DayNavigator.tsx` | Napper-style week strip + calendar modal (date selection for History view) |
| `SleepList.tsx` | History view, uses SleepEntry variants |
| `SleepEntry.tsx` | NapEntry, BedtimeEntry, WakeUpEntry components |
| `EntryChoice.tsx` | Pre-auth: "Get started" vs "I have an account" |
| `OnboardingFlow.tsx` | Welcome → Baby name → Baby DOB → Your name → Your relationship → Account (multi-step, in-memory draft only) |

### Hooks
| Hook | Purpose |
|------|---------|
| `useSleepEntries` | CRUD entries, activeSleep, awakeMinutes |
| `useBabyProfile` | Baby/user profiles, multi-baby switching, delete baby (anonymize then delete) |
| `useBabyShares` | Sharing/invitations between caregivers |
| `useCircadianTheme` | Time-based theme switching |
| `useDeleteAccount` | Delete account: client deletes storage objects, invokes delete-account Edge Function with JWT, then signOut (ignore 403); redirects via onSignedOut |

### Key Utilities
- `dateUtils.ts`: Prediction algorithms, duration formatting, age calculations
- `storage.ts`: localStorage helpers

---

## 7. Memory System (`.context/`)

El proyecto usa un sistema de memoria persistente para mantener contexto entre sesiones de Claude.

### Estructura
```
.context/
├── MEMORY.md          # Este archivo: ADN del proyecto, decisiones fundamentales
├── rules.md           # Reglas de comportamiento para Claude
├── design_system.md   # Full token reference (colours, typography, spacing, radii per theme)
├── frontend_guidelines.md # Component patterns, styling approach, state management
├── app_flow.md        # Every screen mapped with primary goal, golden path, escape routes
├── prd.md             # Product requirements (north star, user persona, constraints)
├── tech_stack.md      # Languages, frameworks, deployment details
├── lessons.md         # Past bugs and decisions (Problem → Root Cause → Fix)
├── progress.txt       # Project progress tracking
└── logs/
    └── YYYY-MM-DD.md  # Daily logs con cambios técnicos
```

### Protocolos
- **Auto-Log**: Al finalizar una sesión, generar `.context/logs/YYYY-MM-DD.md` con cambios, decisiones y pendientes
- **Auto-Update**: Si una decisión cambia el ADN del proyecto, actualizar inmediatamente este archivo
- **Golden Rule**: Si algo no está documentado en `.context/`, no existe

---

## 8. Project History & Milestones

| Date | Milestone |
|------|-----------|
| 2026-01-27 | Implementación inicial de lógica circadiana |
| 2026-02-01 | Refactorización de TodayView para densidad móvil (Compact Cards) |
| 2026-02-02 | Migración a Framer Motion: route transitions, drag-to-dismiss |
| 2026-02-02 | Skeleton loading states (SkeletonTimelineCard) |
| 2026-02-02 | Fix: predicciones durante nap activa |
| 2026-02-02 | Dead code cleanup (547 líneas eliminadas) |
| 2026-02-02 | Sistema de memoria unificado en `.context/` |
| 2026-02-03 | Google OAuth login (social auth) |
| 2026-02-04 | AlgorithmStatusCard (transparency about prediction maturity) |
| 2026-02-04 | Fix: overdue nap predictions now show as "now" instead of being filtered |
| 2026-02-05 | Baby profile pictures with client-side compression (BabyAvatarPicker) |
| 2026-02-05 | Share access roles (caregiver/viewer) with bottom sheet editing UI |
| 2026-02-05 | RLS policies for shared user permissions on sleep_entries |
| 2026-02-06 | Invitation emails via Supabase Edge Function + Resend (pending domain verification) |
| 2026-02-06 | Re-invite flow: cancel → re-invite reactivates existing DB row |
| 2026-02-06 | Algorithm StatusPill moved from TodayView to ProfileMenu baby card |
| 2026-02-08 | Design-led `.context/` documentation system (7 files: design_system, frontend_guidelines, app_flow, prd, tech_stack, progress, lessons) |
| 2026-02-09 | Full codebase light-mode sweep — fixed white-on-white bugs in 9 components |
| 2026-02-09 | Design audit Phase 1-3: hero card tokens, prediction labels, redundant nav removal, SubViewHeader, ListRow, AnimatePresence transitions |
| 2026-02-09 | BabyDetailView: full-screen baby editing replaces BabyEditSheet for owned babies |
| 2026-02-09 | SleepEntrySheet: temporal validation, dynamic relative labels, Play/Stop/Check icons, alignment polish |
| 2026-02-10 | DayNavigator redesign: Napper-style swipeable week strip + calendar bottom sheet modal |
| 2026-02-12 | StatsView: single date range picker (DateRangePickerSheet), no more two separate date inputs |
| 2026-02-12 | All bottom sheets: tween open/close (no bounce); QuickActionSheet + ShareAccess Edit sheet: added drag-to-dismiss |
| 2026-02-13 | Delete account + anonymization: anonymized_baby_profiles / anonymized_sleep_entries tables, RLS (separate block SELECT/UPDATE/DELETE; authenticated INSERT + SELECT on anonymized_baby for .select('id')); delete baby copies to anonymized then deletes; Edge Function delete-account (verify_jwt off, getUser inside), client storage cleanup → invoke with Bearer token → signOut (try/catch 403); config.toml verify_jwt = false for delete-account |

---

*Este archivo es el "cerebro" del proyecto. Actualízalo cuando cambien decisiones fundamentales.*
