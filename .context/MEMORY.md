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
- **Bottom Sheets**: Spring physics + drag-to-dismiss (`dragElastic: 0.6`, dismiss en `offset.y > 150` o `velocity.y > 500`)
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
- Duración en tiempo real mientras editas
- Botón save (tick) solo activo si hay cambios
- Trash icon gris sutil, no rojo agresivo

### Circadian Themes
Cambio automático basado en hora del día:
- **Morning (06:00-11:59)**: Fondo cálido, colores vibrantes
- **Afternoon (12:00-18:59)**: Fondo neutro, colores saturados
- **Night (19:00-05:59)**: Fondo oscuro, colores desaturados

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
| `SleepEntrySheet.tsx` | Add/edit entries, Framer Motion drag-to-dismiss |
| `QuickActionSheet.tsx` | 3-column quick actions grid |
| `SleepList.tsx` | History view, uses SleepEntry variants |
| `SleepEntry.tsx` | NapEntry, BedtimeEntry, WakeUpEntry components |

### Hooks
| Hook | Purpose |
|------|---------|
| `useSleepEntries` | CRUD entries, activeSleep, awakeMinutes |
| `useBabyProfile` | Baby/user profiles, multi-baby switching |
| `useBabyShares` | Sharing/invitations between caregivers |
| `useCircadianTheme` | Time-based theme switching |

### Key Utilities
- `dateUtils.ts`: Prediction algorithms, duration formatting, age calculations
- `storage.ts`: localStorage helpers

---

## 7. Memory System (`.context/`)

El proyecto usa un sistema de memoria persistente para mantener contexto entre sesiones de Claude.

### Estructura
```
.context/
├── MEMORY.md      # Este archivo: ADN del proyecto, decisiones fundamentales
├── rules.md       # Reglas de comportamiento para Claude
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

---

*Este archivo es el "cerebro" del proyecto. Actualízalo cuando cambien decisiones fundamentales.*
