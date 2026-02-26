# Nav icon recommendations (Napper-style: filled when selected)

## Current icons (what we have)

| Tab     | Current icon        | Issue you noted              |
|---------|---------------------|------------------------------|
| **Today**  | Clock (circle + hands) | Feels like a "watch" – not very serious |
| **History**| Document / clipboard with lines | OK |
| **Stats**  | Bar chart (3 vertical bars) | "Report" icon not very serious |
| **Profile**| Person outline (head + shoulders) | OK |

Active state today: we only change **color** (muted → `--nap-color`). We do **not** switch to a filled icon yet.

---

## Filled when selected (like Napper)

In the screenshots, the **selected** tab uses a **filled** icon (solid shape) and the others stay **outlined** (stroke only). To get that:

- Use **two variants per tab**: outline (default) and solid (when `nav-tab-active`).
- In code: render outline SVG when `currentView !== 'X'`, and solid SVG when `currentView === 'X'`, **or** use one SVG and toggle `fill="none"` + `stroke="currentColor"` (outline) vs `fill="currentColor"` + `stroke="none"` (filled) based on active state.

Many icon sets (Heroicons, Lucide) provide both outline and solid versions of the same icon.

---

## Icon suggestions you can check

### 1. Today (replace clock/watch)

We need something that reads “today” or “home” without looking like a watch.

| Option        | Name / concept        | Where to check |
|---------------|------------------------|----------------|
| **Home**      | House outline / solid | [Heroicons – Home](https://heroicons.com/) (Outline + Solid). Very standard for “main” view. |
| **Sun / Sun with rays** | “Today” / daytime | [Heroicons – Sun](https://heroicons.com/), [Lucide – Sun](https://lucide.dev/icons/sun). Fits “today” and sleep app. |
| **Calendar day** | Single day / today | [Heroicons – CalendarDays](https://heroicons.com/), [Lucide – CalendarDays](https://lucide.dev/icons/calendar-days). Clear “today” meaning. |

Recommendation: **Home** (house) for “main view” like Napper, or **Sun** if you want to stress “today / day” in a sleep app.

---

### 2. History (optional refresh)

Current document/list icon is fine; if you want something more “past / timeline”:

| Option        | Name / concept     | Where to check |
|---------------|--------------------|----------------|
| **History / Clock arrow** | Back-in-time, “past” | [Heroicons – ArrowPath](https://heroicons.com/) (or “Clock” with arrow), [Lucide – History](https://lucide.dev/icons/history). |
| **Calendar**  | Calendar (days)     | [Heroicons – Calendar](https://heroicons.com/), [Lucide – Calendar](https://lucide.dev/icons/calendar). |
| **List / Scroll** | Log / list of events | [Lucide – ScrollText](https://lucide.dev/icons/scroll-text). Keeps “log” feel. |

No strong need to change unless you want a clearer “history” metaphor.

---

### 3. Stats / Reports (replace “report” bar chart)

You want something that feels more “serious” and less toy-like.

| Option        | Name / concept     | Where to check |
|---------------|--------------------|----------------|
| **Chart bar (alt)** | Bar chart, cleaner style | [Heroicons – ChartBar](https://heroicons.com/) (Outline + Solid). Same idea, often looks a bit more refined. |
| **Chart bar square** | Bar chart in a frame | [Heroicons – ChartBarSquare](https://heroicons.com/). Slightly more “dashboard”. |
| **Line chart / trend** | Upward trend line   | [Heroicons – PresentationChartLine](https://heroicons.com/), [Lucide – LineChart](https://lucide.dev/icons/line-chart) or [TrendingUp](https://lucide.dev/icons/trending-up). Feels more “analytics”. |
| **Table / grid** | Data overview        | [Heroicons – TableCells](https://heroicons.com/), [Lucide – LayoutGrid](https://lucide.dev/icons/layout-grid). More “data” than “report”. |

Recommendation: **ChartBar** or **ChartBarSquare** (Heroicons) for a cleaner bar chart, or **PresentationChartLine** / **LineChart** if you want a more “serious” analytics look.

---

### 4. Profile

Current person outline is standard. If you ever want alternatives:

- [Heroicons – User](https://heroicons.com/) (Outline + Solid)
- [Lucide – User](https://lucide.dev/icons/user)

No change needed unless you want to align with a specific set.

---

## Where to look (summary)

- **Heroicons** (Outline + Solid): https://heroicons.com/  
  - Good for: Home, Sun, CalendarDays, ChartBar, ChartBarSquare, PresentationChartLine, User.  
  - Filled when selected: use “Solid” variant for active tab, “Outline” for inactive.

- **Lucide** (outline by default, many have a “filled” variant): https://lucide.dev/icons  
  - Good for: home, sun, calendar-days, history, line-chart, trending-up, bar-chart-2, user.  
  - Search by name; check “Filled” in the inspector if you want solid.

- **Phosphor** (multiple weights: thin, light, regular, bold, fill): https://phosphoricons.com/  
  - Same idea: use “Regular” for outline and “Fill” for selected.

---

## Implementation note (when you’re ready)

1. **Replace SVGs** in `App.tsx` (nav section) with the chosen icons (outline + solid per tab).
2. **Filled when selected**: for each tab, render the **solid** icon when `currentView === 'X'` and the **outline** icon otherwise (or one path with `fill`/`stroke` toggled by active state).
3. Keep **color**: inactive = `var(--text-muted)`, active = `var(--nap-color)` (and optionally a light background on the active tab like Napper).

If you tell me which set you prefer (e.g. Heroicons) and which exact icons (e.g. Home for Today, ChartBarSquare for Stats), I can suggest the exact SVG paths or a small component structure for outline/solid swap.
