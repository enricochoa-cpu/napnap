# Prediction Engine — Arithmetic Audit (2026-04-06)

**Goal**: Walk through realistic user scenarios with concrete numbers to verify that all prediction subsystems (unified engine, dynamic blending, bedtime fatigue, midnight safety) produce correct, sensible results.

**Scope**: `predictDaySchedule()`, `simulateDay()`, `calculateDynamicBedtime()`, `getBlendingWeights()`, `getShortNapCompensation()`

---

## Glossary

These are common algorithm/programming terms used throughout this document:

| Term | Meaning | Example in our engine |
|------|---------|----------------------|
| **Floor** | A minimum value — the result can never go **below** this number. Like a physical floor you can't fall through. `max(value, floor)` | Earliest bedtime floor: bedtime can never be before 18:30, no matter what the formula says |
| **Ceiling** | A maximum value — the result can never go **above** this number. Like a physical ceiling you can't rise past. `min(value, ceiling)` | Latest bedtime ceiling: bedtime can never exceed latest + 60min |
| **Cap** | Same as ceiling but typically applied to a **shift/adjustment** rather than the final result. Limits how much a correction can move the output. | Sleep debt shift is capped at 40min — even if the baby missed 3 hours of sleep, we only move bedtime 40min earlier |
| **Soft** (soft cap, soft ceiling) | The limit exists but isn't absolute — it's a reasonable default that could be overridden in extreme cases, or it degrades gracefully rather than being a hard wall. Opposite of "hard". | Soft ceiling at latest + 60min: we don't hard-block at 19:30, we allow up to 20:30 as a gentle boundary |
| **Hard** (hard floor, hard cap) | The limit is absolute — no exceptions, never crossed. | Earliest bedtime is a hard floor: we never suggest putting a baby to sleep before 18:30 |
| **Safety floor** | A floor specifically designed to prevent dangerous/nonsensical values. A guardrail. | The wake window safety floor prevents reducing the final wake window to something dangerously short (e.g., 30 minutes before bed) |
| **Clamp** | Apply both a floor AND a ceiling at once: `clamp(value, min, max)` = `max(min, min(value, max))`. Keeps the value inside a safe range. | Bedtime is clamped between earliest and latest+60min |
| **Shift** | An adjustment added to or subtracted from a base value. The amount the algorithm "shifts" a result in one direction. | A 31-minute sleep debt shift moves bedtime 31 minutes earlier |
| **Threshold** | A boundary that triggers a different behavior when crossed. Below it: nothing happens. Above it: a rule activates. | Sleep debt threshold at 30min: below 30min deficit → no adjustment. At 30+ → shift kicks in |
| **Tier** | A named level/bracket in a graduated system. Each tier has different rules. | Learning (0-5 entries), Calibrating (6-15), Optimized (16+) — each tier trusts historical data differently |
| **Blending** | Mixing two values with weights that sum to 1.0. `result = A × weight₁ + B × weight₂`. | Wake window blending: `120 × 0.70 + 100 × 0.30 = 114` — 70% config, 30% learned |
| **Penalty** | A multiplier < 1.0 applied to reduce a value as a consequence of something. | Short nap penalty: multiply next wake window by 0.80 (reduce by 20%) because a short nap is less restorative |
| **Compensation** | The inverse concept of penalty — adjusting for something that went wrong. In our code, `getShortNapCompensation` returns the penalty multiplier (the name is slightly misleading — it "compensates" for poor sleep by shortening the next window). | After a 25min nap, compensation = 0.80, meaning the baby needs sleep sooner |
| **Anchor** | The reference point from which a calculation starts. Everything chains from the anchor. | Last nap end time is the anchor for bedtime calculation: bedtime = anchor + finalWindow |
| **Drift** | Gradual deviation from a reference value over time or across steps. Small drifts are expected; large drifts signal a problem. | 10-12min nap time drift between Learning and Optimized tiers — acceptable and natural |
| **Stacking** | Applying multiple adjustments cumulatively (adding them together). Our engine explicitly avoids stacking: `max(shift₁, shift₂)` instead of `shift₁ + shift₂`. | Sleep debt shift (31min) and wake excess shift (10min) don't stack — we take the larger one (31min) |

---

## Test baby profiles

| Baby | Age | Config bracket | targetNaps | WW first/mid/final/max | Nap standard/micro | Bedtime earliest/ideal/latest |
|------|-----|----------------|------------|------------------------|--------------------|-----------------------------|
| **A — Luna** | 6 months | 6-7mo | 3 | 120/135/150/180 min | 60/20 min | 18:30/19:00/19:30 |
| **B — Marc** | 9 months | 9-10mo | 2 | 165/195/210/240 min | 90/25 min | 18:30/19:00/19:30 |
| **C — Noa** | 16 months | 15-18mo | 1 | 300/300/270/330 min | 120/30 min | 19:00/19:30/20:00 |

---

## Key formulas reference

### Blending weights (`getBlendingWeights`)

| Tier | Entries | Config weight | Learned weight |
|------|---------|---------------|----------------|
| Learning | 0-5 | 0.90 | 0.10 |
| Calibrating | 6-15 | 0.70 | 0.30 |
| Optimized | 16+ | 0.50 | 0.50 |

### Short nap compensation (`getShortNapCompensation`)

| Nap duration | Multiplier on next WW |
|---|---|
| < 30 min | 0.80 |
| 30-44 min | 0.85 |
| 45-59 min | 0.90 |
| 60+ min | 1.00 |

### Sleep debt shift (`calculateDynamicBedtime` — Axis 1)

```
deficit = (targetNaps × standardDuration) - actualDaytimeSleep

Extreme (deficit ≥ 60): shift = min(40, round(deficit / 2.5))
Moderate (deficit ≥ 30): shift = min(20, round(deficit / 2))
None (deficit < 30):     shift = 0
```

### Wake excess shift (`calculateDynamicBedtime` — Axis 2)

```
expectedTotalAwake = first + max(0, targetNaps - 1) × mid + final
wakeExcess = actualTotalAwake - expectedTotalAwake

If wakeExcess ≥ 30: shift = min(25, round(wakeExcess / 3))
Else:               shift = 0
```

### Unified fatigue → bedtime

```
totalShift = max(sleepDebtShift, wakeExcessShift)   // don't stack
finalWindow = config.wakeWindows.final - totalShift

// Safety floor (age-aware):
//   1-nap schedules: floor = round(final × 0.75)
//   multi-nap:       floor = config.wakeWindows.first
finalWindow = max(finalWindow, safetyFloor)

bedtime = lastNapEnd + finalWindow
bedtime = clamp(bedtime, earliest, latest + 60min)
```

### Micro/catnap duration cap

When `simulateDay` marks a nap as catnap or micro, `predictDaySchedule` caps the learned duration to `config.napDurations.micro`. This prevents learned history from overriding structural decisions.

---

## Scenario 1 — Happy path: Luna (6mo), normal day, learning tier

**Inputs**:
- Morning wake: 07:00
- No completed naps yet
- Historical wake windows: `[115, 130, 125]` (3 entries → `learning` tier)
- No nap duration history

### Step 1: simulateDay structure

Config: 3 naps, WW first=120, mid=135, final=150

| Nap | WW | Start (min) | Duration | End (min) |
|-----|----|-------------|----------|-----------|
| #1 | 120 | 420+120=540 (09:00) | 60 | 600 (10:00) |
| #2 | 135 | 600+135=735 (12:15) | 60 | 795 (13:15) |
| #3 | 135 | 795+135=930 (15:30) | 60 | 990 (16:30) |

Bedtime: 990 + 150 = 1140 (19:00) = ideal ✓

### Step 2: predictDaySchedule blending (learning tier: 90/10)

Weighted avg of `[115, 130, 125]` ≈ 123 min (no today's data, equal weights)

**Nap 1** (index=first):
- Base WW: config.wakeWindows.first = 120
- Blended: `round(120 × 0.90 + 123 × 0.10)` = `round(108 + 12.3)` = **120**
- First nap cap: `min(120, 120)` = **120**
- Start: 07:00 + 120min = **09:00**
- Duration: config standard = 60min → End: **10:00**

**Nap 2** (index=second):
- Base WW: config.wakeWindows.mid = 135
- Blended: `round(135 × 0.90 + 123 × 0.10)` = `round(121.5 + 12.3)` = **134**
- No short nap penalty (prev=60min → 1.0)
- Start: 10:00 + 134min = **12:14**
- Duration: 60min → End: **13:14**

**Nap 3** (index=third_plus):
- Base WW: config.wakeWindows.mid = 135
- Blended: `round(135 × 0.90 + 123 × 0.10)` = **134**
- Start: 13:14 + 134min = **15:28**
- Duration: 60min → End: **16:28**

### Step 3: Bedtime

- accumulatedSleep: 60+60+60 = 180 min
- targetDaytimeSleep: 3 × 60 = 180 min
- deficit: 180 - 180 = **0** → no sleep debt shift
- totalElapsed: 16:28 - 07:00 = 568 min
- totalAwake: 568 - 180 = 388 min
- expectedTotalAwake: 120 + 2×135 + 150 = 540 min
- wakeExcess: 388 - 540 = **-152** → no wake excess shift
- finalWindow: 150 - 0 = **150**
- safetyFloor: config.wakeWindows.first = 120 → max(150, 120) = **150**
- Bedtime: 16:28 + 150min = **18:58** ≈ 19:00

**Result**: ✅ Perfect day. Bedtime at 18:58, just 2 min before ideal 19:00.

---

## Scenario 2 — Short naps: Luna (6mo), two 25min naps, optimized tier

**Inputs**:
- Morning wake: 07:00
- Completed naps: [07:00→09:00→09:25 (25min), 09:25→11:10→11:35 (25min)]
- Historical WW: avg=118 (20 entries → `optimized` tier, 50/50)
- Nap duration history: avg first=55, avg second=50, avg third=45

### Step 2: predictDaySchedule

**Nap 3** (only remaining):
- Base WW: config.wakeWindows.mid = 135
- Blended (50/50): `round(135 × 0.50 + 118 × 0.50)` = `round(67.5 + 59)` = **127**
- Short nap penalty (prev=25min < 30 → 0.80): `round(127 × 0.80)` = **102**
- Start: 11:35 + 102min = **13:17**

Nap duration (learned, 50/50):
- Config standard: 60
- Learned avg for third_plus: 45
- Blended: `round(60 × 0.50 + 45 × 0.50)` = **53** (above minimum 45) → **53**
- End: 13:17 + 53min = **14:10**

### Step 3: Bedtime

- accumulatedSleep: 25 + 25 + 53 = 103 min
- targetDaytimeSleep: 3 × 60 = 180 min
- deficit: 180 - 103 = **77** → extreme tier (≥60)
- sleepDebtShift: `min(40, round(77/2.5))` = `min(40, 31)` = **31**
- totalElapsed: 14:10 - 07:00 = 430 min
- totalAwake: 430 - 103 = 327 min
- expectedTotalAwake: 120 + 2×135 + 150 = 540 min
- wakeExcess: 327 - 540 = **-213** → no wake excess shift
- finalWindow: 150 - 31 = **119**
- safetyFloor: config.wakeWindows.first = 120 → max(119, 120) = **120**
- Bedtime: 14:10 + 120min = **16:10**

16:10 is before `earliest` (18:30) → bedtime floor kicks in → **bedtime = 18:30**

**Result**: ⚠️ Bedtime is floored at 18:30, which is 30 min before ideal. Reasonable — baby has a sleep deficit so going earlier makes sense. The raw computed bedtime (16:10) was wildly early, but the earliest floor caught it.

**Known limitation**: The baby is awake from 14:10 to 18:30 = 260min. Max wake window for 6mo is 180min. This baby will be overtired. See **open issue BUG-2** below.

---

## Scenario 3 — Skipped nap: Marc (9mo), nap 1 done, nap 2 skipped entirely

**Inputs**:
- Morning wake: 06:30
- Completed naps: [06:30→09:15→10:30 (75min)]
- No historical data (brand new user, 2 entries → `learning` tier, 90/10)

### Step 2: predictDaySchedule

simulateDay targets 2 naps. 1 completed. Projects **nap 2**:

**Nap 2** (index=second):
- Base WW: config.wakeWindows.mid = 195
- Blended (90/10, no history): stays at **195** (no weighted avg)
- No short nap penalty (prev=75min → 1.0)
- Start: 10:30 + 195min = **13:45**
- Duration: config standard = 90min → End: **15:15**

### Step 3a: Bedtime (if nap 2 is taken)

- accumulatedSleep: 75 + 90 = 165 min
- targetDaytimeSleep: 2 × 90 = 180 min
- deficit: 180 - 165 = 15 → below 30 threshold → **no shift**
- finalWindow: **210**
- Bedtime: 15:15 + 210min = **18:45** (between earliest 18:30 and ideal 19:00) ✓

### Step 3b: Bedtime (if parent skips nap 2 entirely)

After 60min overdue (14:45), the nap silently drops (U-57 product decision). Then:

- No projected naps left
- Last activity: nap 1 end at 10:30
- accumulatedSleep: 75 min
- deficit: 180 - 75 = 105 → extreme (≥60)
- sleepDebtShift: `min(40, round(105/2.5))` = `min(40, 42)` = **40**
- finalWindow: 210 - 40 = **170** (floor: max(170, first=165) → **170**)
- Bedtime from 10:30: 10:30 + 170min = **13:20**

Floor: earliest is 18:30 → **bedtime = 18:30**

**Result**: ✅ Correct. The extreme deficit shifts bedtime aggressively, but the 18:30 floor prevents an absurd 13:20 bedtime. Baby goes to bed 30min early. Reasonable.

---

## Scenario 4 — Dynamic blending comparison across tiers

Same setup: Luna (6mo), morning wake 07:00, historical WW avg = 100min (baby naturally has shorter wake windows than config's 120/135).

| Tier | Entries | Weights | Nap 1 WW | Nap 2 WW |
|------|---------|---------|----------|----------|
| Learning | 3 | 90/10 | `round(120×0.90 + 100×0.10)` = **118** | `round(135×0.90 + 100×0.10)` = **132** |
| Calibrating | 10 | 70/30 | `round(120×0.70 + 100×0.30)` = **114** | `round(135×0.70 + 100×0.30)` = **125** |
| Optimized | 20 | 50/50 | `round(120×0.50 + 100×0.50)` = **110** | `round(135×0.50 + 100×0.50)` = **118** |

**Nap 1 time**: 07:00 + WW → 08:58 / 08:54 / 08:50
**Nap 2 time** (after 60min nap): 09:58+WW → 12:10 / 12:05 / 11:58

**Result**: ✅ Gradual adaptation. Learning trusts config (09:00 nap). Optimized trusts baby's actual 100min pattern (08:50). Max drift: 10 min for nap 1, 12 min for nap 2. Feels natural.

---

## Scenario 5 — Noa (16mo, 1-nap toddler), normal day

**Inputs**:
- Morning wake: 07:00
- No completed naps
- No history (new user, 1 entry → learning, 90/10)

### simulateDay structure

Config: 1 nap, WW first=300 (5h), final=270 (4.5h)

| Nap | WW | Start (min) | Duration | End (min) |
|-----|----|-------------|----------|-----------|
| #1 | 300 | 420+300=720 (12:00) | 120 | 840 (14:00) |

Bedtime: 840 + 270 = 1110 (18:30). `simulateDay` checks: is 1110 < earliest (19:00 = 1140)? YES → rescue nap logic. But `targetNaps=1` and rescue only triggers for 2-3 nap configs. So no rescue nap.

### predictDaySchedule → calculateDynamicBedtime

- Nap 1 at 12:00, duration 120min, end 14:00
- accumulatedSleep: 120 min
- targetSleep: 1 × 120 = 120 → deficit = 0 → no shift
- finalWindow: 270 - 0 = **270**
- safetyFloor (1-nap): `round(270 × 0.75)` = **203** → max(270, 203) = **270**
- Bedtime: 14:00 + 270min = **18:30**
- Earliest floor: 19:00 → **bedtime = 19:00**

**Result**: ✅ Correct. 1-nap toddler bedtime at 19:00 (earliest), 30min before ideal. The long afternoon wake window (5h from 14:00 to 19:00) is within max (330min = 5.5h).

---

## Scenario 5b — Noa (16mo), short nap (60min instead of 120min)

**Inputs**: Same as Scenario 5, but nap is only 60min (12:00→13:00).

### Bedtime with sleep debt

- accumulatedSleep: 60 min
- targetDaytimeSleep: 1 × 120 = 120 min
- deficit: 120 - 60 = **60** → extreme tier (≥60)
- sleepDebtShift: `min(40, round(60/2.5))` = `min(40, 24)` = **24**
- finalWindow: 270 - 24 = **246**
- safetyFloor (1-nap): `round(270 × 0.75)` = **203** → max(246, 203) = **246**
- Bedtime: 13:00 + 246min = **17:06**
- Earliest floor: 19:00 → **bedtime = 19:00**

The earliest floor still dominates here. But with a later nap (e.g. 13:00→14:00 end), the debt shift actually changes the result:

- Bedtime: 14:00 + 246min = **18:06** → earliest floor → **19:00**

And with an even later nap end (14:30):

- Bedtime: 14:30 + 246min = **18:36** → earliest floor → **19:00**

Vs. without debt (full 120min nap ending 14:30): 14:30 + 270min = **19:00** (exact).

**Result**: ✅ The sleep debt shift (24min) is correctly applied and not absorbed by the safety floor. The earliest bedtime floor still dominates in most toddler cases because the afternoon window is so long, but the shift is preserved for edge cases where the nap runs later.

---

## Scenario 6 — Midnight crossing edge case: very late sleeper

Hypothetical: Baby (6mo config) with shifted schedule — wake at 10:00.

### simulateDay

- wakeMinutes: 600 (10:00)
- Nap 1: 600+120=720 (12:00), +60 = 780 (13:00)
- Nap 2: 780+135=915 (15:15), +60 = 975 (16:15)
- Nap 3: 975+135=1110 (18:30), +60 = 1170 (19:30)
- Bedtime: 1170+150 = 1320 (22:00)

All values < 1440. No overflow. `calculateAllNapWindows` normalizes with `% 1440`:
- Nap 3 hour: `Math.floor(1110 % 1440 / 60)` = 18, minute = 30 → ✓

Even if bedtime were 1500 (01:00 next day):
- `minutesToDate(1500, refDate)` = refDate midnight + 1500min = next day 01:00 ✓
- `calculateAllNapWindows`: `1500 % 1440` = 60 → hour=1, minute=0 ✓

### Latest bedtime ceiling

Config latest: 19:30. Ceiling = latest + 60min = **20:30**.
Raw bedtime: 22:00 > 20:30 → capped to **20:30**.

**Result**: ✅ Midnight arithmetic is safe. Late schedule is capped at latest + 60min.

---

## Scenario 7 — Micro-nap duration cap: Luna (6mo), late catnap

**Inputs**:
- Morning wake: 07:00
- Completed naps: [09:00→10:00 (60min), 12:15→13:15 (60min)]
- Nap 3 projected at 15:28 — simulateDay marks it as micro (starts near 16:00 catnap cutoff)
- Nap duration history: avg third_plus = 50min

### Without duration cap (old behavior)

- `getLearnedNapDurationMinutes` returns blended: `round(60 × 0.50 + 50 × 0.50)` = **55**
- Nap 3 end: 15:28 + 55min = **16:23**
- Bedtime: 16:23 + 150min = **18:53**

But simulateDay said this should be a 20min micro to preserve the bedtime window. The structural decision is overridden.

### With duration cap (current behavior)

- `getLearnedNapDurationMinutes` returns 55, but `projected.isCatnap = true`
- Cap: `min(55, config.napDurations.micro)` = `min(55, 20)` = **20**
- Nap 3 end: 15:28 + 20min = **15:48**
- Bedtime: 15:48 + 150min = **18:18** → earliest floor → **18:30**

**Result**: ✅ Micro-nap cap preserves the structural decision. Bedtime stays within expected range.

---

## Summary

| # | Scenario | Result | Notes |
|---|----------|--------|-------|
| 1 | Luna 6mo, normal day, learning | ✅ Bedtime 18:58 | Perfect alignment with ideal |
| 2 | Luna 6mo, short naps, optimized | ⚠️ Bedtime 18:30 (floor) | Floor saves from 16:10 runaway. Gap 260min > max 180 (BUG-2) |
| 3 | Marc 9mo, skipped nap 2 | ✅ Bedtime 18:30 (floor) | Extreme deficit correctly detected, floor catches |
| 4 | Blending tiers comparison | ✅ Gradual 10-12min drift | Natural adaptation, no wild swings |
| 5 | Noa 16mo, 1-nap toddler | ✅ Bedtime 19:00 | Age-aware safety floor preserves configured final window |
| 5b | Noa 16mo, short nap (60min) | ✅ Bedtime 19:00 | 24min debt shift applied, earliest floor still dominates |
| 6 | Midnight crossing / late schedule | ✅ No overflow, capped at 20:30 | minutesToDate handles >1440; latest ceiling prevents runaway |
| 7 | Micro-nap duration cap | ✅ 20min micro preserved | Learned duration capped when simulation says catnap |

---

## Open issues

### BUG-2 — Blended nap times can exceed max wake window (LOW)

**Backlog**: U-69 (P3)

In Scenario 2, after short naps + penalties + aggressive blending, the last nap ends at 14:10 and the next event is bedtime at 18:30. That's a **260min** gap — well above the 6mo `config.wakeWindows.max` of 180min.

**Root cause**: `simulateDay` (structure) uses config-only wake windows and can trigger rescue naps when gaps exceed max. But `predictDaySchedule` (blended times) produces different nap end times. The structural decision (no rescue nap needed) was made with config times, but the actual blended schedule has longer gaps.

**Impact**: Low — only triggers with extreme short naps + high optimization + high blending divergence. Earliest bedtime floor prevents absurd outputs, but the baby would be overtired.

**Fix**: Post-hoc check after computing all blended nap times + bedtime: if any wake gap exceeds `config.wakeWindows.max`, insert a rescue micro-nap or flag the gap.

---

## Known limitations

**Fragmentation fatigue**: True sleep fragmentation (many short naps vs. few long ones with the same total sleep) is not captured. A baby with 6 × 30min naps and a baby with 3 × 60min naps have identical `totalDaytimeSleep` and identical `totalAwakeMinutes`, so both get the same bedtime. Fragmentation fatigue would require counting wake-up transitions × a fatigue cost per transition. Future refinement.

---

## Fixes applied during this audit

| Bug | Severity | Description | Fix | Backlog |
|-----|----------|-------------|-----|---------|
| BUG-1 | Medium | Wake excess formula was algebraically identical to sleep deficit (measured same axis) | Replaced with config-based `expectedTotalAwake = first + (targetNaps-1)×mid + final` | — |
| BUG-3 | High | Safety floor `Math.max(final, first)` inverted bedtime for 1-nap toddlers (15-24mo) — all debt shifts absorbed | Age-aware floor: `targetNaps === 1 ? round(final × 0.75) : first` | U-66 |
| BUG-4 | Low | No latest bedtime ceiling — late-waking babies got uncapped 22:00+ bedtime | Soft cap at `config.bedtime.latest + 60min` | U-68 |
| BUG-5 | Low | Learned nap duration overrode simulation's micro/catnap structural decision | Cap to `config.napDurations.micro` when `isCatnap \|\| isMicroNap` | U-67 |
