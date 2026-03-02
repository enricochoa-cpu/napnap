# Bedtime window: research and scenario analysis

**Purpose:** Validate the bedtime-interval constraint (T_earliest ≤ bedtime ≤ T_latest) against external sources and our age bands; identify scenarios where it works and where it can conflict.

**Context:** Fix for “unrealistic early bedtime” (e.g. 16:30 for an 8‑month‑old who still needs a 3rd nap). The solution is to constrain projected bedtime to a valid window and, if raw bedtime &lt; T_earliest, add naps until we land in the window.

**Implemented (2026-02-24):** Rescue nap in `simulateDay()` when bedtime &lt; earliest (2–3 nap ages); bedtime floor in `calculateDynamicBedtime()`. See lessons.md §1.7 and TODAY_VIEW_PREDICTION_SYSTEM.md §3.

---

## 1. Is 18:00–20:30 correct? Research summary

### External sources (clock-time bedtimes by age)

| Source | Age | Bedtime range | Notes |
|--------|-----|---------------|-------|
| **Baby Sleep Site** (reference chart) | 1–4 months | 7–10 p.m. | Later for younger; shift earlier by 3–4 mo. |
| | 4–8 months | **6–7:30 p.m.** | Earlier bedtime during 4→3 nap transition. |
| | 8–10 months | **6–7 p.m.** | 2 naps; earlier if regression/overtired. |
| | 10–15 months | 6–8 p.m. | 2 naps; earlier if 12‑mo regression. |
| | 15 months–3 years | 6–8 p.m. | By 2y use 7 p.m. as earliest (6 p.m. for younger toddlers). |
| **Parents / general guidelines** | 4–8 months | 6–7:30 p.m. | Same idea. |
| | 8–10 months | 6–7 p.m. | |
| **Science Direct (infant study)** | 6–24 weeks | Often 7–8 p.m. | Earlier sleep onset → longer nighttime sleep (≈34 min more per hour earlier). |
| **AAP / AASM** | 4–12 months | — | 12–16 h total sleep; no specific clock times. |

**Takeaways:**

- **18:00 (6 p.m.)** is widely cited as an **appropriate early** bedtime for 4–8 mo and 8–10 mo (and younger toddlers). So using 18:00 as a *floor* for “no bedtime before 6 p.m.” is **supported** for those ages.
- **20:30** is a reasonable **upper** bound for many infants (e.g. 1–4 mo can go to 22:00 in some sources; 8–10 mo often 19:00–19:30). So **18:00–20:30** is a **broad**, age‑spanning range: it fits “most” babies 4 mo–toddler but is not age‑specific.
- **Newborns (0–~2 mo):** Sources say no fixed bedtime; follow cues. A strict 18:00 floor could be wrong for very young infants (e.g. late cluster feeding). So **one fixed interval for all ages is not ideal**.

### Our config (SLEEP_DEVELOPMENT_MAP)

We already have **per‑age** `bedtime: { earliest, ideal, latest }` in `dateUtils.ts`. Examples:

| Age band | earliest | ideal | latest |
|----------|----------|-------|--------|
| 0–1.5 mo (newborn) | 19:00 | 20:00 | 21:00 |
| 6–12 weeks | 19:00 | 19:30 | 20:30 |
| 3–4 mo | 18:30 | 19:00 | 20:00 |
| 4–6 mo | 18:30 | 19:00 | 19:30 |
| 7–8 mo | 18:30 | 19:30 | 20:30 |
| **8–9 mo** (Ferran) | **18:30** | **19:00** | **19:30** |
| 9–12 mo | 18:30 | 19:00 | 19:30 |
| 12–15 mo | 18:30 | 19:15 | 19:45 |
| 15–18 mo | 19:00 | 19:30 | 20:00 |
| 18–24 mo | 19:00 | 19:30 | 20:00 |

**Conclusion:** The interval **18:00–20:30** is **reasonable as a broad fallback** and is consistent with external guidelines for 4–18 months. For implementation we should **use each age band’s own `config.bedtime.earliest` and `config.bedtime.latest`** rather than a single global 18:00–20:30. That way newborns stay later (e.g. 19:00–21:00), 8–9 mo use 18:30–19:30, and toddlers 19:00–20:00, matching the literature and avoiding a one-size-fits-all contradiction.

---

## 2. Scenarios where the constraint works well

Assumption: we enforce **T_bedtime ∈ [config.bedtime.earliest, config.bedtime.latest]** and, when raw bedtime &lt; T_earliest, we add nap(s) until we land in the window (or hit max naps).

### 2.1 Ferran (8 months) – the bug we fixed

- **Config:** 8–9 mo, targetNaps 2, earliest 18:30, latest 19:30, final WW 195 min.
- **Day:** Wake 08:20, Nap1 10:20–10:51, Nap2 13:10–13:35. No 3rd nap in current logic.
- **Raw bedtime:** 13:35 + 195 min = 16:50 ≈ 16:30 (with rounding).
- **Problem:** 16:30 &lt; 18:30 → invalid.
- **With constraint:** Add one more nap (catnap). e.g. last activity 13:35 + 180 min → nap start ~16:35, catnap 25 min → end ~17:00, bedtime 17:00 + 195 min = 20:15. 20:15 &gt; 19:30, so we’d use compression (micro‑nap) or accept “slightly late” within a small buffer; in any case bedtime moves into **evening**, e.g. 19:00–19:30. **Result:** 3rd nap appears, bedtime in window. ✓

### 2.2 6‑month‑old, 3 naps, on schedule

- **Config:** 6–7 mo, targetNaps 3, earliest 18:30, latest 19:30.
- **Day:** Wake 07:00, Nap1 09:00–10:00, Nap2 12:00–13:00, Nap3 15:30–16:15 (catnap).
- **Raw bedtime:** 16:15 + 150 min = 18:45. 18:30 ≤ 18:45 ≤ 19:30 ✓
- **Constraint:** No change; no extra nap. **Result:** Works as-is. ✓

### 2.3 12‑month‑old, 2 naps, last nap ends early

- **Config:** 10–12 mo, targetNaps 2, earliest 18:30, latest 19:30, final 225 min.
- **Day:** Wake 06:30, Nap1 09:30–10:30, Nap2 13:00–14:00 (baby woke early from nap).
- **Raw bedtime:** 14:00 + 225 min = 17:45. 17:45 &lt; 18:30.
- **With constraint:** Add catnap. 14:00 + 210 min → nap ~17:30, 25 min → end 17:55, bedtime 17:55 + 225 = 21:40 &gt; 19:30. Compression: last nap 25 min → end 17:55, bedtime 17:55 + 225 still 21:40; so we’d compress final WW or show “consider short nap then bedtime ~19:30”. Either way we **avoid 17:45** and land in evening. **Result:** No 17:45 bedtime; evening bedtime. ✓

### 2.4 18‑month‑old, 1 nap

- **Config:** 15–18 mo, targetNaps 1, earliest 19:00, latest 20:00, final 270 min.
- **Day:** Wake 07:00, Nap 12:00–14:00.
- **Raw bedtime:** 14:00 + 270 min = 18:30. 18:30 &lt; 19:00.
- **With constraint:** We’re at targetNaps (1). Options: (a) allow “one extra” bridge nap so bedtime moves into 19:00–20:00, or (b) cap: “bedtime not before 19:00” and show 19:00 as suggested bedtime (last activity 14:00, but we don’t force a 2nd nap for a 1‑nap toddler). **Result:** Either one micro‑nap ending ~18:00 → bedtime 19:00, or display 19:00 as minimum. Both avoid 18:30. ✓ (See corner case 3.2 for nuance.)

---

## 3. Corner cases and contradictions

### 3.1 Newborn (0–1.5 mo): fixed “earliest” can be wrong

- **Config:** 5 naps, earliest 19:00, latest 21:00, very short wake windows.
- **Risk:** With 5 naps and 45 min windows, last nap could end ~16:00–17:00 → raw bedtime 16:45–17:45. Enforcing “bedtime ≥ 19:00” would imply “add a 6th nap.” Biologically, newborns don’t follow a strict clock; forcing a 6th nap to satisfy 19:00 may be **inappropriate**.
- **Mitigation:** (1) Only apply “add nap if bedtime &lt; T_earliest” when **nap_count ≤ targetNaps** (we’re not already over target). So if we already have 5 naps (target 5), do **not** add a 6th; instead **cap** displayed bedtime at T_earliest (“Bedtime from 19:00” or “Consider bedtime around 19:00”). (2) Or exempt age bands with targetNaps ≥ 4 from the “add nap” rule and only use “floor display” (never show bedtime before T_earliest). **Conclusion:** Use constraint as a **floor for display** for newborns; avoid forcing extra naps above targetNaps.

### 3.2 18‑month‑old (1 nap): forcing a 2nd nap

- **Config:** targetNaps 1, earliest 19:00. Last nap ended 14:00 → raw 18:30.
- **Risk:** If we “add nap until bedtime ≥ 19:00”, we add a **2nd** nap. Many 18‑mo are firmly on 1 nap; a 2nd nap can cause resistance or late bedtime. So “add nap” can **contradict** age-appropriate nap count.
- **Mitigation:** Apply “add nap” only when **current nap_count &lt; targetNaps** (we haven’t reached the age‑based target yet). For 18 mo, nap_count = 1 = targetNaps → do **not** add another nap; instead **floor** bedtime to T_earliest (show 19:00). **Conclusion:** “Add nap” only when we stopped *because* we hit targetNaps and that led to too-early bedtime (e.g. 8 mo with 2 naps); do not add naps when we’re already at target (e.g. 1‑nap toddler).

### 3.3 Very late last nap (all ages)

- **Scenario:** Last nap ends 18:00, final WW 3 h → raw bedtime 21:00. If latest is 20:00, we’re **over** the window.
- **Current behaviour:** We already have “compression” (micro‑nap) and “can’t fit” logic; bedtime can be slightly past latest. So we already allow “slightly late” in some cases.
- **With constraint:** We only **add** naps when bedtime is **below** T_earliest. When bedtime is **above** T_latest we don’t remove naps; we keep existing logic (compress or show slightly late). **Conclusion:** No new contradiction; T_latest remains an upper guideline, not a hard “add/remove nap” trigger.

### 3.4 8–9 mo: 3rd nap pushes bedtime past latest

- **Scenario:** After adding 3rd nap (catnap), nap end 17:00, final 195 min → 20:15. Latest 19:30.
- **Options:** (1) Compress final WW (e.g. 90 min instead of 195) so bedtime 18:30. (2) Show 19:30 as “aim for this” and accept 20:15 as “if baby wakes late from catnap.” (3) Compress 3rd nap to micro (e.g. 20 min) so it ends 16:50, bedtime 16:50 + 195 = 20:05, still a bit late. So we may land **slightly past latest** when we add the rescue nap. **Conclusion:** Prefer “bedtime in [earliest, latest]” when possible; if adding one nap puts us just past latest, that’s acceptable (better than 16:30). Optional: shorten final WW when “we added nap for floor” so we target ideal rather than latest.

### 3.5 Summary of rules to avoid contradictions

| Condition | Action |
|-----------|--------|
| raw_bedtime &lt; T_earliest **and** nap_count &lt; targetNaps | **Add** nap(s) until bedtime ∈ [T_earliest, T_latest] (or we hit targetNaps). |
| raw_bedtime &lt; T_earliest **and** nap_count ≥ targetNaps | **Do not** add more naps. **Floor** displayed bedtime to T_earliest (“Bedtime from 19:00” / “Consider 19:00”). |
| raw_bedtime &gt; T_latest | Keep current behaviour (compression / slightly late); no change. |
| Newborn (e.g. targetNaps ≥ 4) | Prefer floor-only; avoid “add nap” above targetNaps. |

---

## 4. Recommendation

- **Use per‑age windows** from `config.bedtime.earliest` and `config.bedtime.latest` (not a single 18:00–20:30) so newborns and toddlers each get appropriate bounds.
- **18:00–20:30** remains a **sanity range** in line with the literature for 4–18 months; our config’s 18:30–19:30 (e.g. 8–9 mo) and 19:00–20:00 (toddler) sit inside it.
- **Implementation:** In `simulateDay` (or equivalent), when we would **exit** the “add naps” loop:
  - If **candidate_bedtime &lt; config.bedtime.earliest** (in minutes) **and** nap_count &lt; targetNaps → do **not** exit; add one more nap (catnap if needed), then re-check.
  - If **candidate_bedtime &lt; config.bedtime.earliest** **and** nap_count ≥ targetNaps → exit anyway; later, when **displaying** bedtime, use **max(candidate_bedtime, T_earliest)** so we never show a time before earliest (floor only, no extra nap).
- This gives a **mathematical**, age‑aware rule that fixes the “8‑month 16:30” case, respects newborns and 1‑nap toddlers, and stays consistent with external bedtime guidelines.
