# Stats Screen Graphs — Audit and Proposal

This document audits the Stats screen graphs (data, sections, implementation), describes **how we use the Recharts resource**, and proposes improvements so charts match Napper-style clarity.

---

## 1. Documents Involved

| Document | Role |
|----------|------|
| **`.context/prd.md`** | Product scope: Stats view (Sleep Trends), “Sleep statistics with visual charts”; principles (calm, one glance, night-first). |
| **`.context/app_flow.md`** | Stats flow: path, component (`StatsView`), section chips (Summary, Naps, Night, Growth), date range, report entry. |
| **`.context/design_system.md`** | Theme tokens (`--nap-color`, `--night-color`, `--wake-color`, etc.); no chart-specific tokens. |
| **`.context/lessons.md`** §7 | Stats bugs: §7.4 documents X/Y axis overlap and the fix with `CHART_MARGIN_LONG_Y` (left 88, bottom 48). |
| **`.context/tech_stack.md`** | Recharts 3.7 for sleep statistics. |
| **`product-research/ux-ui-findings.md`** | Napper UX: calming palette, visual restraint. |
| **Figma (Playground)** | Reference for axis placement and Y-axis width. |
| **`src/components/StatsView.tsx`** | Single implementation: all chart logic, data, and Recharts usage. |

---

## 2. How We Use the Recharts Resource

Recharts is used **only in `StatsView.tsx`** for the Stats tab. Version: **recharts ^3.7.0** (see `package.json`).

### 2.1 Imports

We import from `'recharts'`:

- **Chart containers:** `AreaChart`, `BarChart`, `PieChart`
- **Data series:** `Area`, `Bar`, `Pie`, `Cell`
- **Axes:** `XAxis`, `YAxis`
- **Decoration / UX:** `Tooltip`, `ResponsiveContainer`, `CartesianGrid`, `ReferenceLine`

No `Legend`, `ComposedChart`, `Line`, or `Brush`. The Daily Schedule chart is **not** Recharts; it is a custom flex layout with absolute-positioned divs (Gantt-style).

### 2.2 Wrapper Pattern: ResponsiveContainer

Every Recharts chart is wrapped in:

```tsx
<ResponsiveContainer width="100%" height="100%">
  <AreaChart|BarChart|PieChart ... />
</ResponsiveContainer>
```

The parent div sets height (e.g. `h-48`, `h-40`) or fixed size (e.g. 180×180 for donuts). Recharts then fills that space; we do not pass numeric `width`/`height` to the chart. This keeps charts responsive and consistent with the card layout.

### 2.3 BarChart Usage

**Where:** Daily Sleep (Summary + Naps), Average nap (Naps).

**Props on BarChart:**

- `data` — array of objects (e.g. `rangeData`, `averageNapChartData`) with at least `day` and the value keys (`night`, `nap` or `avgNapMinutes`).
- `margin` — `CHART_MARGIN` for all bar charts.

**Children (order matters for Recharts):**

1. **CartesianGrid** — `strokeDasharray="3 3"`, `stroke={gridColor}` (e.g. `var(--text-muted)`), `strokeOpacity={0.1}`, `vertical={false}` (horizontal lines only).
2. **XAxis** — `dataKey="day"`, `tick={<DayDateTick data={...} />}`, `tickLine={false}`, `axisLine={false}`, `interval={daysInRange > 8 ? 1 : 0}` (skip every other tick when many days). No `padding` prop today.
3. **YAxis** — `domain={...}`, `ticks={...}` (from our helpers), `tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}`, `tickLine={false}`, `axisLine={false}`, `tickFormatter={formatDurationAxis}`.
4. **Tooltip** — `content={<BarTooltip />}` or `<AvgNapTooltip />`, and for bar charts often `cursor={{ fill: 'var(--bg-soft)', opacity: 0.5 }}`.
5. **Bar** — one or two. Stacked: `stackId="sleep"`, `dataKey="night"` / `dataKey="nap"`, `fill={nightColor}` / `napColor`, `radius={[0,0,4,4]}` or `[4,4,0,0]`. Single series: `dataKey="avgNapMinutes"`, `fill={napColor}`, `radius={[4,4,0,0]}`.

We do not use `Bar`’s `label` or `background`; tooltips provide detail.

### 2.4 AreaChart Usage

**Where:** Sleep Trend (Summary), Woke Up (Night), Bedtime (Night), Weight over time (Growth), Height over time (Growth).

**Props on AreaChart:**

- `data` — e.g. `rangeData`, `wakeUpData.points`, `bedtimeData.points`, `weightChartData`, `heightChartData`.
- `margin` — `CHART_MARGIN` for Sleep Trend; `CHART_MARGIN_LONG_Y` for Woke Up, Bedtime, Weight, Height.

**Children:**

1. **defs (optional)** — `<defs>` with `<linearGradient>` for area fill. Each chart uses a unique gradient id (e.g. `napGradient`, `nightGradient`, `wakeGradient`, `bedGradient`, `weightGradientChip`, `heightGradientChip`, `weightGradientNoSleep`, `heightGradientNoSleep`) to avoid SVG id clashes when multiple charts mount. Gradient: vertical (`x1="0" y1="0" x2="0" y2="1"`), `stop offset="5%" stopOpacity={0.4}`, `stop offset="95%" stopOpacity={0}`.
2. **CartesianGrid** — same as BarChart (horizontal only, dashed, muted).
3. **XAxis** — same pattern as BarChart: `dataKey="day"`, `tick={<DayDateTick data={...} />}`, `tickLine={false}`, `axisLine={false}`, `interval` when many points. No `padding` prop.
4. **YAxis** — same styling; `domain`/`ticks`/`tickFormatter` vary by chart (duration, time-of-day `formatWakeTime`, or `v => \`${v} kg\`` / `\`${v} cm\``).
5. **Tooltip** — `content={<CustomTooltip />}`, `<WakeTooltip />`, `<BedTooltip />`, or `<GrowthTooltip unit="kg"|"cm" />`. No cursor on area charts.
6. **ReferenceLine** (only Woke Up and Bedtime) — `y={wakeUpData.avg}` or `bedtimeData.avg`, `stroke={wakeColor|nightColor}`, `strokeDasharray="6 4"`, `strokeOpacity={0.6}` to show average line.
7. **Area** — `type="monotone"`, `dataKey` (e.g. `night`, `nap`, `wakeMinutes`, `bedMinutes`, `value`), `stroke`, `strokeWidth={2}`, `fill="url(#...)"` (gradient id).

Multiple `Area` components can be stacked (Sleep Trend: night + nap) or single (Woke Up, Bedtime, Weight, Height).

### 2.5 PieChart Usage

**Where:** Total Sleep Distribution (Summary), Daytime Sleep Distribution by nap slot (Naps).

**Props on PieChart:** None (no `data` or `margin` on the container).

**Children:**

1. **Pie** — `data={...slices}`, `cx="50%"`, `cy="50%"`, `innerRadius={60}`, `outerRadius={80}` (donut), `dataKey="value"`, `startAngle={90}`, `endAngle={-270}` (starts at top, goes clockwise), `stroke="none"`. Children: `Cell` per slice with `fill={nightColor}` etc. We do not use Recharts’ built-in label; legend and centre text are custom HTML overlay (e.g. “100% Total”).

Pie charts are inside a fixed 180×180 div; `ResponsiveContainer` makes the PieChart fill it. Gradient ids for Pie are not used; we use solid fills via `Cell`.

### 2.6 XAxis and YAxis Conventions

- **XAxis:** Always category from `dataKey="day"`. Custom tick: **DayDateTick**, an SVG `<g>` with `transform={`translate(${x},${y})`}` and two `<tspan>`s (day name, then date). Recharts passes `x`, `y`, `payload`, `index`; we also pass `data` so the tick can resolve `dayName` for the row. We always set `tickLine={false}` and `axisLine={false}` for a minimal look.
- **YAxis:** We never let Recharts auto-generate domain/ticks for bar/area charts. We pass:
  - `domain={[min, max]}` from our helpers (`durationAxisProps`, `timeOfDayAxisTicks`, `adaptiveWeightDomain` / `weightAxisTicks`, etc.).
  - `ticks={[...]}` explicit array so label count is capped (e.g. 6) and no duplicate labels (see lessons §7.2, §7.3).
  - `tickFormatter` for units: duration → "0h"/"30m"/"1h 30m", time → "07:00", weight → "2 kg", height → "70 cm".
  - `tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}`, `tickLine={false}`, `axisLine={false}`.

Recharts draws the Y-axis labels **inside** the chart’s left margin (the `margin.left` we pass to the chart). If `margin.left` is too small, labels overlap the plot or the first X tick; if too large, the plot appears to start too far right.

### 2.7 Tooltips

All tooltips are **custom React components** passed as `content={<... />}`. They receive Recharts’ `active`, `payload`, `label` and render a small card (e.g. `bg-[var(--bg-elevated)]`, rounded border). We do not use Recharts’ default tooltip. Bar charts often add `cursor={{ fill: 'var(--bg-soft)', opacity: 0.5 }}` for the hover highlight.

### 2.8 Margin Constants and Where They Apply (current implementation)

| Constant | Value | Used by |
|----------|--------|---------|
| **CHART_MARGIN** | `{ top: 10, right: 10, left: 38, bottom: 32 }` | All BarCharts (Daily Sleep, Average nap); Sleep Trend AreaChart |
| **CHART_MARGIN_LONG_Y** | `{ top: 10, right: 10, left: 46, bottom: 48 }` | Woke Up, Bedtime, Weight, Height AreaCharts |
| **Y_AXIS_WIDTH_SHORT** | 36 | Duration Y-axes (0h, 1h 30m) |
| **Y_AXIS_WIDTH_LONG** | 44 | Time/weight/height Y-axes (08:30, 2 kg, 70 cm) |

Chart wrapper divs use `-mx-4` so the chart bleeds into the card padding (edge-to-edge feel). **Recharts YAxis `width` must be > 0 or tick labels are not rendered** (see lessons.md §7.5). PieChart does not use margins.

### 2.9 Summary: Recharts Usage at a Glance

| Recharts component | Purpose in our app |
|--------------------|--------------------|
| **ResponsiveContainer** | Wraps every chart; 100% width/height of parent. |
| **BarChart** | Stacked (night + nap) or single (avg nap); duration Y-axis. |
| **AreaChart** | Sleep trend, wake/bedtime, weight/height; gradients + optional ReferenceLine. |
| **PieChart** | Donuts (total sleep, nap-by-slot); no axes. |
| **XAxis** | Category from `day`; custom DayDateTick (two-line label). |
| **YAxis** | Explicit domain/ticks/formatter; no axis line. |
| **CartesianGrid** | Horizontal dashed grid only. |
| **Tooltip** | Custom content component per chart type. |
| **ReferenceLine** | Horizontal average line (Woke Up, Bedtime). |
| **Area / Bar / Pie + Cell** | Data series and slice colors. |

---

## 3. Data and Sections (Concise)

- **rangeData:** Per-day nap/night minutes, `day`, `dayName`; drives Daily Sleep bar, Sleep Trend area, and DayDateTick.
- **averageNapChartData:** Per-day average nap duration; drives Average nap bar.
- **wakeUpData / bedtimeData:** Points with `wakeMinutes` / `bedMinutes` (minutes since midnight); domain and average for Y-axis and ReferenceLine.
- **weightChartData / heightChartData:** One point per log; `day`, `dayName`, `value` (kg or cm); domains from adaptive helpers.
- **Sections:** Summary (donut, daily bar, trend area, Gantt), Naps (avg nap bar, donut by nap, daily bar), Night (woke up area, bedtime area), Growth (weight + height areas). No-sleep fallback shows only Growth when there is growth data.

---

## 4. Audit Findings

- **Axis overlay:** `CHART_MARGIN.left` (24) is too small for Y labels and two-line X tick; they collide. `CHART_MARGIN_LONG_Y.left` (88) fixes overlap but is larger than needed.
- **Graphs start too far right:** 88px left plus default XAxis padding creates an excessive empty band; Napper/Figma suggest “max label width + 12–20px” (≈52–60px).

---

## 5. Proposal: Graph-Only Improvements

1. **Margins:** `CHART_MARGIN` → `left: 48`, `bottom: 32`. `CHART_MARGIN_LONG_Y` → `left: 56`, `bottom: 48`.
2. **XAxis:** Add `padding={{ left: 0, right: 0 }}` on all 9 Recharts XAxis usages (bar and area charts). If the rightmost label clips, use `right: 4` only on that chart.
3. **Scope:** Only `StatsView.tsx` chart layout; no changes to sections, copy, donuts, or Gantt.

Implementation checklist: update the two margin constants; add `padding` to every XAxis in Daily Sleep (×2), Sleep Trend, Average nap, Woke Up, Bedtime, Weight (×2), Height (×2); then verify in the app (no overlay, plot closer to left, last tick visible).

---

## 6. Implemented (2026-02-25)

- **Margins:** CHART_MARGIN left 38, bottom 32; CHART_MARGIN_LONG_Y left 46, bottom 48. Y-axis width constants (36 / 44) so labels always render.
- **Edge-to-edge:** All chart wrapper divs use `-mx-4`; XAxis already has `padding={{ left: 0, right: 0 }}` where needed.
- **Premium look:** All Area charts use `strokeWidth={3}` and `type="monotone"`.
- **One-point growth:** When weight/height has only one data point, show `GrowthOnePointEmptyState` (ghost dashed line + value + “Add another to see your trend” + optional plus button). App passes `onAddWeight` / `onAddHeight` to navigate to Profile.
- **YAxis width:** Never set `width={0}` — Recharts does not render tick labels when width is 0 (lesson §7.5).
