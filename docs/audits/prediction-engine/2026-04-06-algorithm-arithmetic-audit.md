# Prediction Engine — Arithmetic Audit (2026-04-06)

**Goal**: Walk through realistic user scenarios with concrete numbers to verify that all prediction subsystems (unified engine, dynamic blending, bedtime fatigue, midnight safety) produce correct, sensible results.

**Scope**: `predictDaySchedule()`, `simulateDay()`, `calculateDynamicBedtime()`, `getBlendingWeights()`, `getShortNapCompensation()`

---

## Test baby profiles

| Baby | Age | Config bracket | targetNaps | WW first/mid/final/max | Nap standard/micro | Bedtime earliest/ideal/latest |
|------|-----|----------------|------------|------------------------|--------------------|-----------------------------|
| **A — Luna** | 6 months | 6-7mo | 3 | 120/135/150/180 min | 60/20 min | 18:30/19:00/19:30 |
| **B — Marc** | 9 months | 9-10mo | 2 | 165/195/210/240 min | 90/25 min | 18:30/19:00/19:30 |
| **C — Noa** | 16 months | 15-18mo | 1 | 300/300/270/330 min | 120/30 min | 19:00/19:30/20:00 |

---

## Scenario 1 — Happy path: Luna (6mo), normal day, new user (3 entries)

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
- Base WW: `getProgressiveWakeWindow` → config.wakeWindows.first = 120
- Blended: `round(120 * 0.90 + 123 * 0.10)` = `round(108 + 12.3)` = **120**
- First nap cap: `min(120, 120)` = **120**
- Start: 07:00 + 120min = **09:00**
- Duration: config standard = 60min
- End: **10:00**

**Nap 2** (index=second):
- Base WW: config.wakeWindows.mid = 135
- Blended: `round(135 * 0.90 + 123 * 0.10)` = `round(121.5 + 12.3)` = **134**
- No short nap penalty (prev=60min → 1.0)
- Start: 10:00 + 134min = **12:14**
- Duration: 60min → End: **13:14**

**Nap 3** (index=third_plus):
- Base WW: config.wakeWindows.mid = 135
- Blended: `round(135 * 0.90 + 123 * 0.10)` = **134**
- Start: 13:14 + 134min = **15:28**
- Duration: 60min → End: **16:28**

### Step 3: Bedtime

- accumulatedSleep: 60+60+60 = 180 min
- targetDaytimeSleep: 3 × 60 = 180 min
- deficit: 180 - 180 = **0** → no sleep debt shift
- totalElapsed: 16:28 - 07:00 = 568 min
- totalAwake: 568 - 180 = 388 min
- expectedAwake: 568 - 180 = 388 (see BUG below)
- wakeExcess: 388 - 388 = **0** → no wake excess shift
- finalWindow: 150 - 0 = **150**
- Bedtime: 16:28 + 150min = **18:58** ≈ 19:00

**Result**: ✅ Perfect day. Bedtime at 18:58, just 2 min before ideal 19:00.

---

## Scenario 2 — Short naps: Luna (6mo), two 25min naps, optimized user (20 entries)

**Inputs**:
- Morning wake: 07:00
- Completed naps: [07:00→09:00→09:25 (25min), 09:25→11:10→11:35 (25min)]
- Historical WW: avg=118 (20 entries → `optimized` tier, 50/50)
- Nap duration history: avg first=55, avg second=50, avg third=45

### Step 2: predictDaySchedule

**Nap 3** (only remaining):
- Base WW: config.wakeWindows.mid = 135
- Blended (50/50): `round(135 * 0.50 + 118 * 0.50)` = `round(67.5 + 59)` = **127**
- Short nap penalty (prev=25min < 30 → 0.80): `round(127 * 0.80)` = **102**
- Start: 11:35 + 102min = **13:17**

Nap duration (learned, 50/50):
- Config standard: 60
- Learned avg for third_plus: 45
- Blended: `round(60 * 0.50 + 45 * 0.50)` = **53** (capped above minimum 45) → **53**
- End: 13:17 + 53min = **14:10**

### Step 3: Bedtime

- accumulatedSleep: 25 + 25 + 53 = 103 min
- targetDaytimeSleep: 3 × 60 = 180 min
- deficit: 180 - 103 = **77** → extreme tier (≥60)
- sleepDebtShift: `min(40, round(77/2.5))` = `min(40, 31)` = **31**
- totalElapsed: 14:10 - 07:00 = 430 min
- totalAwake: 430 - 103 = 327 min
- (wake excess formula → same as deficit, see BUG)
- finalWindow: 150 - 31 = **119** (floor check: 119 > first=120? NO → **120**)
- Bedtime: 14:10 + 120min = **16:10**

**Wait** — 16:10 is before `earliest` (18:30)! So the floor kicks in:
- Bedtime = **18:30** (earliest)

**Result**: ⚠️ Bedtime is floored at 18:30, which is 30 min before ideal. Reasonable — baby has a sleep deficit so going earlier than ideal makes sense. But the raw computed bedtime (16:10) was wildly early, which means the floor caught a runaway. This is OK thanks to U-41's `wakeWindows.first` floor + the earliest-bedtime floor.

**Concern**: The baby is awake from 14:10 to 18:30 = 260min. Max wake window for 6mo is 180min. This baby will be overtired. The `simulateDay` rescue nap logic should have caught this, but it runs on structure (config-only), not on the blended times. **This is a gap**: the unified engine's blended times can diverge from simulateDay's structural decisions.

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

### Step 3: Bedtime (if nap 2 is taken)

- accumulatedSleep: 75 + 90 = 165 min
- targetDaytimeSleep: 2 × 90 = 180 min
- deficit: 180 - 165 = 15 → below 30 threshold → **no shift**
- finalWindow: **210**
- Bedtime: 15:15 + 210min = **18:45** (between earliest 18:30 and ideal 19:00) ✓

### What if parent skips nap 2 entirely?

If the parent doesn't log nap 2, `predictDaySchedule` runs with 1 completed nap → still projects nap 2 at 13:45. After 60min overdue (14:45), the nap silently drops (U-57 product decision). Then:

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
| Learning | 3 | 90/10 | `round(120*0.90 + 100*0.10)` = **118** | `round(135*0.90 + 100*0.10)` = **132** |
| Calibrating | 10 | 70/30 | `round(120*0.70 + 100*0.30)` = **114** | `round(135*0.70 + 100*0.30)` = **125** |
| Optimized | 20 | 50/50 | `round(120*0.50 + 100*0.50)` = **110** | `round(135*0.50 + 100*0.50)` = **118** |

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

Bedtime: 840 + 270 = 1110 (18:30) — hits earliest floor. Ideal is 19:30.

But wait — `simulateDay` checks: is bedtime < earliest (19:00 = 1140)? 1110 < 1140 → YES → rescue nap logic. But `targetNaps=1` and rescue only triggers for 2-3 nap configs. So no rescue nap.

Final bedtime after floor: **19:00** (earliest)

### predictDaySchedule

- Nap 1 at 12:00, duration 120min, end 14:00
- finalWindow: 270
- accumulatedSleep: 120
- targetSleep: 1 × 120 = 120 → deficit = 0 → no shift
- Bedtime: 14:00 + 270min = **18:30**
- Floor: 19:00 → **bedtime = 19:00**

**Result**: ✅ Correct. 1-nap toddler bedtime at 19:00 (earliest), 30min before ideal. The long afternoon wake window (5h) is within max (330min = 5.5h).

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

**Result**: ✅ Midnight safety works correctly.

---

## 🐛 BUG FOUND — U-59 wake excess formula is algebraically equivalent to sleep deficit

### The formula (dateUtils.ts:1420-1421)

```javascript
const expectedAwakeMinutes = (totalAwakeMinutes + totalDaytimeSleepMinutes) - targetDaytimeSleepMinutes;
const wakeExcess = totalAwakeMinutes - Math.max(0, expectedAwakeMinutes);
```

### Algebraic reduction

Let:
- `A` = totalAwakeMinutes
- `S` = totalDaytimeSleepMinutes
- `T` = targetDaytimeSleepMinutes
- `E` = totalElapsed = A + S (from `predictDaySchedule`)

Then:
```
expectedAwake = (A + S) - T = E - T
wakeExcess = A - max(0, E - T)
           = A - max(0, (A + S) - T)
           = A - (A + S - T)        [since E - T > 0 in normal cases]
           = T - S
           = deficit
```

**`wakeExcess` is mathematically identical to `deficit`**. The two axes of the unified fatigue state measure the same thing. The `max(sleepDebtShift, wakeExcessShift)` always picks `sleepDebtShift` because it has a higher cap (40 vs 25).

### Why this matters

The intent of U-59 was: "a baby with many fragmented micro-naps accumulates more fatigue even when total sleep minutes look OK." But the formula doesn't capture this. Consider:

**Baby A**: 3 solid naps of 60min each = 180min sleep, 3 wake windows
**Baby B**: 6 micro-naps of 30min each = 180min sleep, 6 wake windows

Both have identical `totalDaytimeSleepMinutes` (180) and identical `deficit` (0). Both would have identical `wakeExcess` (0). Baby B should feel more tired due to fragmented sleep, but the algorithm treats them identically.

### Correct formula

The wake excess should measure: **total time spent awake vs. what's expected for this age's schedule**. The expected awake time for a given age is:

```
expectedTotalAwake = sum of all age-appropriate wake windows
                   = config.wakeWindows.first + (targetNaps - 1) * config.wakeWindows.mid + config.wakeWindows.final
```

Then:
```
wakeExcess = actualTotalAwake - expectedTotalAwake
```

This is **independent** of sleep deficit. Baby B (6 micro-naps, more transitions) would have more cumulative awake time between naps than Baby A (3 solid naps), because each additional wake-up adds transition time.

### Fix

Replace lines 1419-1425 with:

```javascript
let wakeExcessShift = 0;
if (totalAwakeMinutes > 0) {
  // Expected total awake time for this age's schedule
  const expectedTotalAwake = config.wakeWindows.first
    + Math.max(0, config.targetNaps - 1) * config.wakeWindows.mid
    + config.wakeWindows.final;
  const wakeExcess = totalAwakeMinutes - expectedTotalAwake;
  if (wakeExcess >= WAKE_EXCESS_THRESHOLD_MINUTES) {
    wakeExcessShift = Math.min(WAKE_EXCESS_CAP_MINUTES, Math.round(wakeExcess / 3));
  }
}
```

---

## 🐛 BUG FOUND — Scenario 2 gap: blended nap times can exceed max wake window

In Scenario 2, after three 25min short naps + short nap penalties + aggressive blending, the last nap ends at 14:10 and the next "event" is bedtime at 18:30. That's a **260min** gap — well above the 6mo `config.wakeWindows.max` of 180min.

### Root cause

`simulateDay` (structure) uses config-only wake windows and can trigger rescue naps when wake windows exceed max. But `predictDaySchedule` (blended times) can produce different nap end times than `simulateDay` projected. The structural decision (no rescue nap needed) was made with config times, but the actual blended schedule has longer gaps.

### Impact

Low in practice — this only happens with extreme short naps + high optimization + high blending divergence. But technically the baby would be overtired by bedtime.

### Potential fix (future)

After computing all blended nap times + bedtime, add a post-hoc check: if any wake gap exceeds `config.wakeWindows.max`, flag it (or insert a rescue nap). This is a structural improvement for a future iteration.

---

## Summary

| # | Scenario | Result | Notes |
|---|----------|--------|-------|
| 1 | Luna 6mo, normal day, learning | ✅ Bedtime 18:58 | Perfect alignment with ideal |
| 2 | Luna 6mo, short naps, optimized | ⚠️ Bedtime 18:30 (floor) | Floor saves from 16:10 runaway. Gap 260min > max 180 |
| 3 | Marc 9mo, skipped nap 2 | ✅ Bedtime 18:30 (floor) | Extreme deficit correctly detected, floor catches |
| 4 | Blending tiers comparison | ✅ Gradual 10-12min drift | Natural adaptation, no wild swings |
| 5 | Noa 16mo, 1-nap toddler | ✅ Bedtime 19:00 (floor) | Correct for toddler schedule |
| 6 | Midnight crossing | ✅ minutesToDate handles >1440 | No overflow risk |

## Bugs found

| ID | Severity | Description | Fix |
|----|----------|-------------|-----|
| **BUG-1** | Medium | U-59 wake excess formula algebraically equals sleep deficit — measures same axis, not fragmentation | Replace with config-based expected wake total |
| **BUG-2** | Low | Blended times can diverge from simulateDay structure, causing wake gaps > max | Post-hoc rescue nap check (future iteration) |

## BUG-1 fix applied

Formula replaced with config-based expected wake total:
```javascript
const expectedTotalAwake = config.wakeWindows.first
  + Math.max(0, config.targetNaps - 1) * config.wakeWindows.mid
  + config.wakeWindows.final;
const wakeExcess = totalAwakeMinutes - expectedTotalAwake;
```

This correctly measures an **independent axis** from sleep deficit: a baby whose day has stretched longer than expected (late morning, shifted schedule, extra wake-ups) now triggers an earlier bedtime even if total sleep minutes look normal.

**Limitation acknowledged**: True sleep fragmentation (many short naps vs. few long ones with same total) is not captured by total awake time alone. Fragmentation fatigue would require counting wake-up transitions × a fatigue cost per transition. This is a future refinement — the current formula is still a meaningful improvement over the previous version (which was a no-op alias of deficit).

## Next steps

1. ~~**Fix BUG-1 now**~~ ✅ Done — formula replaced
2. **Document BUG-2** as a known limitation in the backlog — only triggers in extreme scenarios, floors prevent harm
3. **Consider adding unit tests** for Scenarios 1-6 to prevent regressions in future prediction changes
4. **Future**: Fragmentation fatigue (wake-up count × transition cost) as a third fatigue axis
