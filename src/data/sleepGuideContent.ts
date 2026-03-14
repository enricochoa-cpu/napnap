// ─────────────────────────────────────────────────────────────────────────────
// Sleep Guide Content
// Powers the /sleep-guides hub and individual age-guide pages.
// ─────────────────────────────────────────────────────────────────────────────

export interface SleepGuideStats {
  napsPerDay: string;
  wakeWindow: string;
  bedtime: string;
  nightSleep: string;
  totalDaySleep: string;
  totalSleep: string;
}

export interface SleepGuideScheduleItem {
  time: string;
  label: string;
  type: 'wake' | 'nap' | 'bedtime';
}

export interface SleepGuideSection {
  heading: string;
  content: string; // Paragraphs separated by \n\n
}

export interface SleepGuideTip {
  title: string;
  description: string;
}

export interface SleepGuideRegression {
  name: string;
  description: string;
}

export interface SleepGuideConfig {
  slug: string;
  ageMonths: number;
  displayLabel?: string;  // Custom label for hub card (e.g. "Wk 1", "2 yr"). Falls back to "{ageMonths} mo"
  ageLabel?: string;      // For CTA text (e.g. "1-week-old", "2-year-old"). Falls back to "{ageMonths}-month-old"
  title: string;
  subtitle: string;
  metaDescription: string;
  stats: SleepGuideStats;
  sampleSchedule: SleepGuideScheduleItem[];
  sections: SleepGuideSection[];
  tips: SleepGuideTip[];
  regression?: SleepGuideRegression;
}

// ─────────────────────────────────────────────────────────────────────────────
// Guide Configs — ordered by ageMonths
// ─────────────────────────────────────────────────────────────────────────────

export const SLEEP_GUIDE_CONFIGS: SleepGuideConfig[] = [
  // ── Week 1 (Newborn) ────────────────────────────────────────────────────
  {
    slug: 'week-1',
    ageMonths: 0,
    displayLabel: 'Wk 1',
    ageLabel: '1-week-old',
    title: 'Week 1 Newborn Sleep Guide',
    subtitle: 'What to expect in your baby\'s first week of sleep',
    metaDescription:
      'A gentle guide to your newborn\'s first week of sleep. Learn about typical sleep patterns, safe sleep basics, and why unpredictable schedules are completely normal.',
    stats: {
      napsPerDay: 'Varies',
      wakeWindow: '30–90 min',
      bedtime: 'No set bedtime',
      nightSleep: '9–12h (with wakings)',
      totalDaySleep: '5–6h',
      totalSleep: '15.5–17h',
    },
    sampleSchedule: [
      { time: '—', label: 'Wake, feed, brief alert time', type: 'wake' },
      { time: '—', label: 'Sleep (30 min–2h stretches)', type: 'nap' },
      { time: '—', label: 'Feed, sleep, repeat throughout day', type: 'nap' },
      { time: '—', label: 'Longest stretch often 2–4h overnight', type: 'bedtime' },
    ],
    sections: [
      {
        heading: 'What to expect in week one',
        content:
          'Welcome to the first week. Everything is new — for your baby, and for you. Right now, your newborn doesn\'t know the difference between day and night. They sleep in short bursts of 30 minutes to 2 hours, wake to feed, and drift off again. There is no schedule, and there shouldn\'t be. This is exactly how a healthy newborn sleeps.\n\nYour baby needs somewhere between 15.5 and 17 hours of sleep in a 24-hour period, but it arrives in unpredictable fragments. Some stretches will be 20 minutes, others might be 3 hours. Both are normal. The longest block of sleep is often just 2–4 hours, and it may happen during the day rather than at night. That will shift in the coming weeks, but right now, your only job is to follow your baby\'s lead.\n\nIf it feels chaotic, that\'s because it is — and that\'s okay. There is nothing to fix at this stage. Your baby is adjusting to life outside the womb, and the most helpful thing you can do is respond to their cues, keep them fed, and rest whenever you can.',
      },
      {
        heading: 'Sleepy cues to watch for',
        content:
          'Even at one week old, your baby gives signals when they\'re ready to sleep. The classic cues are yawning, staring off into the distance, becoming very still, and fussiness that isn\'t about hunger. These signals come quickly — a newborn can go from alert to overtired in minutes, not the longer windows you\'ll see in older babies.\n\nWake windows at this age are incredibly short: 30 to 90 minutes, and often closer to the shorter end. After a feed and a few minutes of quiet alertness, your baby is likely ready to sleep again. Don\'t worry about "keeping them awake" to consolidate sleep later — that approach doesn\'t work with newborns and can lead to an overtired, harder-to-settle baby.',
      },
    ],
    tips: [
      {
        title: 'Always place baby on their back to sleep',
        description:
          'Back sleeping is the safest position for every sleep, day and night. A firm, flat mattress with no loose bedding, pillows, or toys is the gold standard for safe sleep.',
      },
      {
        title: 'Follow your baby\'s cues, not the clock',
        description:
          'There is no schedule to follow this week. Feed on demand, let your baby sleep when they\'re tired, and trust that the unpredictability is temporary and completely normal.',
      },
      {
        title: 'Swaddling can help with the startle reflex',
        description:
          'Many newborns settle more easily when swaddled snugly with arms in. Make sure the swaddle is firm around the chest but loose at the hips to allow healthy hip development.',
      },
    ],
  },

  // ── Week 2 (Newborn) ────────────────────────────────────────────────────
  {
    slug: 'week-2',
    ageMonths: 0,
    displayLabel: 'Wk 2',
    ageLabel: '2-week-old',
    title: 'Week 2 Newborn Sleep Guide',
    subtitle: 'Sleep patterns and tips for your 2-week-old baby',
    metaDescription:
      'What does sleep look like at 2 weeks? Learn about typical newborn sleep amounts, wake windows of 30–90 minutes, and practical tips for surviving the early days.',
    stats: {
      napsPerDay: 'Varies',
      wakeWindow: '30–90 min',
      bedtime: 'No set bedtime',
      nightSleep: '9–12h (with wakings)',
      totalDaySleep: '5–6h',
      totalSleep: '15.5–17h',
    },
    sampleSchedule: [
      { time: '—', label: 'Wake and feed', type: 'wake' },
      { time: '—', label: 'Short alert period (10–30 min)', type: 'nap' },
      { time: '—', label: 'Sleep (45 min–2h stretches)', type: 'nap' },
      { time: '—', label: 'Feed-sleep cycles continue overnight', type: 'bedtime' },
    ],
    sections: [
      {
        heading: 'What to expect at 2 weeks',
        content:
          'Two weeks in, and you\'re starting to find your feet — even if it doesn\'t feel that way. Your baby is still sleeping around 15.5 to 17 hours a day in short, irregular chunks. Day-night confusion is very real right now: your baby may have their longest sleep stretch during the day and be wide-eyed at 2 AM. This is normal and resolves naturally around 3–4 months as the circadian rhythm develops.\n\nYou might notice slightly longer alert periods this week compared to week one — your baby may stay awake for 20–40 minutes at a stretch, looking at your face or responding to your voice. These moments of connection are precious, but they\'re also tiring for your baby. Wake windows are still very short, between 30 and 90 minutes including the feed, and the shortest windows tend to happen in the morning.\n\nFeeding on demand remains the priority. Night feeds are frequent and necessary — your baby\'s stomach is tiny and they need to eat every 2–3 hours around the clock. Every feed is supporting their growth and helping establish your milk supply if you\'re breastfeeding.',
      },
      {
        heading: 'Building the foundation for day-night awareness',
        content:
          'While a true schedule is months away, you can gently start helping your baby\'s brain learn the difference between day and night. During daytime feeds and alert periods, keep the environment bright and normally noisy — don\'t tiptoe around. Open curtains, go about your day, and let household sounds be part of the background.\n\nAt night, do the opposite. Keep feeds dim, quiet, and business-like — low lighting, minimal stimulation, no play. You\'re not training your baby; you\'re simply providing environmental cues that their developing brain will gradually pick up on. This gentle contrast between day and night is one of the most helpful things you can do in these early weeks.',
      },
    ],
    tips: [
      {
        title: 'Bright days, dark nights',
        description:
          'Expose your baby to natural daylight during awake periods and keep night-time interactions dim and calm. This simple contrast helps their circadian rhythm begin to develop.',
      },
      {
        title: 'Feed on demand — don\'t watch the clock',
        description:
          'Your baby knows when they\'re hungry. Feeding on demand supports healthy weight gain and helps establish feeding patterns naturally. Night feeds are essential and expected.',
      },
      {
        title: 'Accept help and rest when baby sleeps',
        description:
          'The advice to "sleep when the baby sleeps" sounds simple but matters enormously right now. Your recovery is important. Accept every offer of help and protect your own rest.',
      },
      {
        title: 'Safe sleep environment for every sleep',
        description:
          'Whether it\'s a 20-minute nap or a 3-hour stretch, always use a firm, flat sleep surface. No cushions, no inclined sleepers, no sleeping on sofas or armchairs — even when you\'re exhausted.',
      },
    ],
  },

  // ── 1 Month ─────────────────────────────────────────────────────────────
  {
    slug: '1-month-old',
    ageMonths: 1,
    displayLabel: '1 mo',
    ageLabel: '1-month-old',
    title: '1 Month Old Sleep Schedule',
    subtitle: 'Sleep patterns, wake windows, and tips for your 1-month-old',
    metaDescription:
      'Learn what sleep looks like at 1 month: 15.5 hours total, 30–90 min wake windows, and why unpredictable naps are perfectly normal. Practical tips for new parents.',
    stats: {
      napsPerDay: 'Varies',
      wakeWindow: '30–90 min',
      bedtime: 'Often 10 PM+',
      nightSleep: '9–12h (with wakings)',
      totalDaySleep: '5–6h',
      totalSleep: '15.5h',
    },
    sampleSchedule: [
      { time: '07:00', label: 'Wake and feed', type: 'wake' },
      { time: '08:00', label: 'Nap (variable length)', type: 'nap' },
      { time: '10:00', label: 'Feed, alert time, nap', type: 'nap' },
      { time: '12:30', label: 'Feed-wake-sleep cycle continues', type: 'nap' },
      { time: '22:00', label: 'Late evening "bedtime"', type: 'bedtime' },
    ],
    sections: [
      {
        heading: 'What to expect at 1 month',
        content:
          'At one month, you\'re past the initial shock of the first two weeks, but the sleep landscape hasn\'t changed dramatically. Your baby still needs around 15.5 hours of sleep across the day and night, and naps remain highly unpredictable — some days you\'ll get several long stretches, other days it\'ll feel like your baby only naps for 20 minutes at a time. Both patterns are within the range of normal.\n\nBedtime is typically late at this age — often 10 PM or later — and that\'s okay. Your baby\'s circadian rhythm is still developing, and an artificially early bedtime doesn\'t work yet. The natural late bedtime will gradually shift earlier over the next two months. For now, follow the "eat, play, sleep" rhythm as a loose guide rather than a rigid schedule.\n\nYou may start to notice your baby having a slightly longer sleep stretch at night — perhaps 3–4 hours — which is a wonderful early sign of consolidation. Celebrate these stretches when they appear, but don\'t expect them every night. Consistency is still weeks away, and that\'s perfectly fine.',
      },
      {
        heading: 'The "eat, play, sleep" rhythm',
        content:
          'Around one month, many parents find it helpful to follow a gentle "eat, play, sleep" cycle. Feed your baby when they wake, enjoy a short period of alert interaction (even just quiet eye contact or gentle talking), and then help them settle back to sleep when you notice drowsy cues. The "play" portion at this age is very brief — sometimes just 10–15 minutes of calm alertness.\n\nThis isn\'t a schedule — it\'s a rhythm. Some cycles will be 1.5 hours, others 2.5 hours. Some days the pattern will be clear; other days it\'ll feel formless. That\'s all normal. The value of the rhythm is that it gives your day a gentle shape without the pressure of clock-based targets that simply don\'t apply to a 1-month-old.',
      },
    ],
    tips: [
      {
        title: 'Use the "eat, play, sleep" pattern loosely',
        description:
          'Feed after waking, enjoy brief alert time, then settle back to sleep. This gentle rhythm prevents feeding-to-sleep associations from forming while keeping things flexible enough for a newborn.',
      },
      {
        title: 'Day-night contrast remains your best tool',
        description:
          'Bright, active daytime with open curtains and normal noise. Dim, quiet night-time with minimal interaction during feeds. Your baby\'s brain is slowly absorbing these cues.',
      },
      {
        title: 'Don\'t compare your baby\'s sleep to others',
        description:
          'Every baby at this age has a different pattern. Some sleep in long stretches; others are frequent catnap champions. Neither is a problem. Your baby\'s sleep will consolidate on their own timeline.',
      },
      {
        title: 'Overnight feeds are nourishing, not failures',
        description:
          'Your baby needs 2–3 overnight feeds at this age. This isn\'t a sleep problem to solve — it\'s healthy, normal nutrition. Keep night feeds calm and low-stimulus to help everyone get back to sleep quickly.',
      },
    ],
  },

  // ── 2 Months ────────────────────────────────────────────────────────────
  {
    slug: '2-month-old',
    ageMonths: 2,
    displayLabel: '2 mo',
    ageLabel: '2-month-old',
    title: '2 Month Old Sleep Schedule',
    subtitle: 'Wake windows, emerging nap patterns, and tips for your 2-month-old',
    metaDescription:
      'A practical 2-month-old sleep guide: 15.5 hours total sleep, 45 min–1.75h wake windows, 4–5 naps per day, and tips for building early sleep foundations.',
    stats: {
      napsPerDay: '4–5',
      wakeWindow: '45 min–1.75h',
      bedtime: 'Often after 9 PM',
      nightSleep: '9–12h (with wakings)',
      totalDaySleep: '5–6h',
      totalSleep: '15.5h',
    },
    sampleSchedule: [
      { time: '08:00', label: 'Wake up', type: 'wake' },
      { time: '09:15', label: 'Nap 1', type: 'nap' },
      { time: '12:00', label: 'Nap 2', type: 'nap' },
      { time: '15:00', label: 'Nap 3', type: 'nap' },
      { time: '18:00', label: 'Nap 4', type: 'nap' },
      { time: '20:15', label: 'Bedtime', type: 'bedtime' },
    ],
    sections: [
      {
        heading: 'What to expect at 2 months',
        content:
          'Two months is when you start to glimpse the earliest signs of a pattern. Your baby still needs around 15.5 hours of total sleep, but wake windows have stretched slightly — from the newborn range of 30–90 minutes to roughly 45 minutes to 1 hour 45 minutes. This is a meaningful change. It means you have a bit more awake time to enjoy together, and it means naps can start to have a loose structure.\n\nMost 2-month-olds take 4–5 naps per day. Each nap can range anywhere from 10 minutes to 2 hours — the variability is wide and normal. If your baby takes a very long nap (over 2 hours), it\'s generally helpful to gently wake them to protect the rest of the day\'s rhythm and ensure enough daytime feeds.\n\nBedtime is still late — usually after 9 PM — and earlier bedtimes will naturally emerge around 3–4 months as the circadian rhythm matures. You\'re not behind if your baby\'s bedtime is 10 PM right now. That\'s biology, not a problem.',
      },
      {
        heading: 'Reading your baby\'s sleep cues',
        content:
          'At 2 months, your baby\'s sleepy cues are becoming more distinct. Watch for becoming quiet and still, staring into the distance, losing interest in toys or your face, and bringing hands to their face. These early signals appear before the louder cues of yawning and crying — and catching them early makes settling much smoother.\n\nThe wake windows at this age vary through the day: the first window of the morning is usually the shortest (around 45–60 minutes), while later windows can stretch toward 1.5–1.75 hours. Pay attention to when your individual baby tends to signal tiredness rather than following a rigid clock. A consistent wake-up time in the morning is one of the most helpful anchors you can establish right now.',
      },
    ],
    tips: [
      {
        title: 'Anchor the day with a consistent wake-up time',
        description:
          'Picking a regular morning wake time (within 30 minutes) helps your baby\'s internal clock start to organise. It doesn\'t need to be early — 7:30 or 8:00 AM works well at this age.',
      },
      {
        title: 'Cap naps at 2 hours',
        description:
          'If your baby sleeps longer than 2 hours during a single nap, gently wake them. This protects daytime feeds and prevents one long nap from stealing sleep pressure from the rest of the day.',
      },
      {
        title: 'Pacifiers are a helpful tool',
        description:
          'If your baby takes a pacifier, using one at sleep times is both soothing and protective. Research shows pacifier use during sleep is associated with reduced SIDS risk.',
      },
      {
        title: 'Watch your baby, not the internet',
        description:
          'At 2 months, there\'s wide variation in what\'s normal. If your baby is feeding well, gaining weight, and having alert wakeful periods, their sleep is doing exactly what it should — even if it doesn\'t match the sample schedule above.',
      },
    ],
  },

  // ── 3 months ──────────────────────────────────────────────────────────────
  {
    slug: '3-month-old',
    ageMonths: 3,
    title: '3 Month Old Sleep Schedule',
    subtitle: 'Wake windows, nap times, and bedtime for your 3-month-old',
    metaDescription:
      'Learn how much sleep a 3-month-old needs, ideal wake windows (75–90 min), nap counts, and a sample daily schedule to build healthy sleep habits.',
    stats: {
      napsPerDay: '4',
      wakeWindow: '1.25–1.5h',
      bedtime: '18:00–20:00',
      nightSleep: '11–12h',
      totalDaySleep: '4–5h',
      totalSleep: '15–17h',
    },
    sampleSchedule: [
      { time: '07:00', label: 'Wake up', type: 'wake' },
      { time: '08:15', label: 'Nap 1', type: 'nap' },
      { time: '09:45', label: 'Nap 2', type: 'nap' },
      { time: '11:30', label: 'Nap 3', type: 'nap' },
      { time: '13:30', label: 'Nap 4', type: 'nap' },
      { time: '19:00', label: 'Bedtime', type: 'bedtime' },
    ],
    sections: [
      {
        heading: 'What to expect at 3 months',
        content:
          'Three months is a beautiful turning point. Your baby is becoming more alert and social — smiling, cooing, and tracking your face — which means their brain is working overtime even during short stretches of wakefulness. That increased stimulation is wonderful, but it also means they tire quickly. Most 3-month-olds can only manage 75–90 minutes of awake time before they need to sleep again, so frequent naps throughout the day are completely normal and expected.\n\nYou may be noticing the beginning of longer nighttime stretches — some babies this age will string together 4–6 hour blocks, and occasionally more. This is genuinely exciting progress, even if it doesn\'t feel consistent yet. Night feeds are still normal and necessary at this age; the goal right now isn\'t to eliminate them but to gently support longer stretches where your baby is ready.\n\nNaps at 3 months are often short — 30 to 45 minutes is typical — and that\'s completely fine. Your baby hasn\'t yet learned to link sleep cycles, so waking after one cycle is normal biology, not a problem to fix. Four naps a day keeps your baby from building up too much sleep pressure between rests, which actually helps nighttime sleep go more smoothly.',
      },
      {
        heading: 'Understanding wake windows',
        content:
          'A wake window is simply the amount of time your baby can comfortably stay awake between sleeps before becoming overtired. At 3 months, that window is short — roughly 75 to 90 minutes — and it\'s one of the most powerful tools you have. Start the next sleep before you see yawning, eye rubbing, or fussiness, because by the time those cues appear, your baby may already be overtired and harder to settle.\n\nThe first wake window of the day is usually the shortest. Many 3-month-olds can only manage about 75 minutes after their morning wake before needing their first nap. Later in the day, some babies stretch slightly to 90 minutes, but watch your individual baby rather than the clock — they\'ll give you cues when they\'re approaching their limit.',
      },
    ],
    tips: [
      {
        title: 'Start wind-down 15 minutes early',
        description:
          'At 3 months, your baby moves from alert to overtired faster than you\'d expect. Begin dimming lights, reducing noise, and slowing activity about 15 minutes before you want them asleep — not when they\'re already fussing.',
      },
      {
        title: 'Cap late-afternoon naps',
        description:
          'If your baby\'s last nap ends too close to bedtime, they won\'t be tired enough to settle. Aim for the last nap to end at least 1.5–2 hours before bedtime, even if that means waking them gently.',
      },
      {
        title: 'Short naps are normal — don\'t rush to fix them',
        description:
          'A 30–45 minute nap at this age is biologically typical. Your baby is sleeping exactly one sleep cycle. Resettling between cycles is a skill that develops over the coming months.',
      },
      {
        title: 'Consistency beats perfection',
        description:
          'You don\'t need a rigid schedule, but doing similar things in a similar order before each sleep — feed, cuddle, dark room — helps your baby\'s brain start anticipating sleep and settling more easily.',
      },
    ],
  },

  // ── 4 months ──────────────────────────────────────────────────────────────
  {
    slug: '4-month-old',
    ageMonths: 4,
    title: '4 Month Old Sleep Schedule',
    subtitle: 'Wake windows, nap times, and bedtime for your 4-month-old',
    metaDescription:
      'A complete 4-month-old sleep schedule covering the 4-month sleep regression, 3-nap transitions, 90–105 min wake windows, and realistic bedtime guidance.',
    stats: {
      napsPerDay: '3',
      wakeWindow: '1.5–1.75h',
      bedtime: '18:00–20:00',
      nightSleep: '11–12h',
      totalDaySleep: '3–3.5h',
      totalSleep: '14–15.5h',
    },
    sampleSchedule: [
      { time: '07:00', label: 'Wake up', type: 'wake' },
      { time: '08:30', label: 'Nap 1', type: 'nap' },
      { time: '10:30', label: 'Nap 2', type: 'nap' },
      { time: '13:00', label: 'Nap 3', type: 'nap' },
      { time: '19:00', label: 'Bedtime', type: 'bedtime' },
    ],
    sections: [
      {
        heading: 'What to expect at 4 months',
        content:
          'Four months is one of the most talked-about ages in baby sleep — and for good reason. Around this time, your baby\'s sleep architecture permanently matures, shifting from the newborn pattern of dropping into deep sleep quickly to a more adult-like cycle with a lighter initial stage. This is a genuine neurological leap, and it can make sleep feel like it\'s suddenly gotten harder even when things were improving. If you\'re in that phase right now, you\'re not doing anything wrong — it\'s a normal developmental shift.\n\nOn the positive side, your baby is now much more socially engaged and responsive. Interaction, tummy time, and play are more stimulating than they were a month ago, which means wake windows are slightly longer — most 4-month-olds manage 90–105 minutes. Moving from four to three naps is common around this age, though some babies take a few more weeks to be ready for the transition.\n\nNight sleep can be unpredictable during the regression period, but your baby\'s total sleep need hasn\'t decreased — it\'s just being redistributed as their rhythm reorganises. Keeping a consistent bedtime and responding calmly to night wake-ups is the most supportive thing you can do right now.',
      },
      {
        heading: 'Understanding wake windows',
        content:
          'At 4 months, most babies have graduated to wake windows of about 90–105 minutes. You\'ll likely notice the first window of the day is still the shortest — closer to 90 minutes — while windows later in the day may edge toward 105 minutes as your baby\'s stamina builds across the day.\n\nWith three naps, spacing matters more. Aim to keep the last nap of the day short enough (30–45 minutes) that your baby is tired enough to settle at bedtime. If the last nap ends too late and your baby isn\'t showing sleep cues at bedtime, you may need to cap it or nudge it earlier.',
      },
    ],
    tips: [
      {
        title: 'Ride out the regression with consistency',
        description:
          'The 4-month regression is temporary, typically lasting 2–4 weeks. This isn\'t the time to overhaul everything — keep your routines consistent and offer plenty of daytime feeds to compensate for any disrupted nights.',
      },
      {
        title: 'Watch for the 3-nap readiness signs',
        description:
          'Your baby may be ready to drop to 3 naps when they consistently resist the 4th nap, take longer to fall asleep for it, or start waking unusually early in the morning. Don\'t rush it — follow their lead.',
      },
      {
        title: 'Darken the sleep environment',
        description:
          'Now that your baby\'s sleep is lighter in that initial stage, a dark room becomes more important. Blackout curtains can make a meaningful difference in both nap length and nighttime sleep quality.',
      },
      {
        title: 'Introduce a simple pre-sleep ritual',
        description:
          'A short, repeatable sequence before each sleep — even just two minutes of gentle rocking and a soft phrase — helps your baby\'s nervous system anticipate and prepare for sleep. Consistency over complexity.',
      },
    ],
    regression: {
      name: '4-month sleep regression',
      description:
        "Around 4 months, your baby's sleep cycles mature to resemble adult patterns. This can temporarily disrupt sleep with more frequent wake-ups, shorter naps, and increased fussiness at bedtime. It typically lasts 2–4 weeks.",
    },
  },

  // ── 5 months ──────────────────────────────────────────────────────────────
  {
    slug: '5-month-old',
    ageMonths: 5,
    title: '5 Month Old Sleep Schedule',
    subtitle: 'Wake windows, nap times, and bedtime for your 5-month-old',
    metaDescription:
      'Discover the ideal 5-month-old sleep schedule with 3 naps, 105–120 min wake windows, and expert-backed tips to improve nap consolidation and night sleep.',
    stats: {
      napsPerDay: '3',
      wakeWindow: '1.75–2h',
      bedtime: '18:00–19:30',
      nightSleep: '11–12h',
      totalDaySleep: '3–3.5h',
      totalSleep: '14–15.5h',
    },
    sampleSchedule: [
      { time: '07:00', label: 'Wake up', type: 'wake' },
      { time: '08:45', label: 'Nap 1', type: 'nap' },
      { time: '11:00', label: 'Nap 2', type: 'nap' },
      { time: '13:30', label: 'Nap 3 (short)', type: 'nap' },
      { time: '18:30', label: 'Bedtime', type: 'bedtime' },
    ],
    sections: [
      {
        heading: 'What to expect at 5 months',
        content:
          'Five months often feels like a steadier season after the upheaval of the 4-month regression. Your baby is more physically capable — rolling, reaching, and beginning to bear weight on their legs — and their brain is processing a remarkable amount of new sensory input every day. That extra stimulation means wake windows have grown to 105–120 minutes, giving you a little more breathing room between naps.\n\nMost 5-month-olds are still on 3 naps, with the third being a shorter bridging nap to carry them to bedtime without becoming overtired. You might find naps are beginning to consolidate — your baby may start linking sleep cycles and sleeping 45 minutes or longer at a stretch, which is real progress worth celebrating.\n\nNighttime sleep is often more predictable this month. Many babies are capable of longer stretches — sometimes 6–8 hours — though night feeds may still be part of the routine and that\'s completely normal. The key at 5 months is building a bedtime that\'s early enough (around 18:30–19:00) to prevent your baby from going to sleep overtired.',
      },
      {
        heading: 'Understanding wake windows',
        content:
          'At 5 months, wake windows of 105–120 minutes give you a little more flexibility in structuring the day. The first window after morning wake is still typically the shorter end — around 105 minutes. By the afternoon, some babies stretch comfortably to 2 hours.\n\nThe third wake window of the day — between the last nap and bedtime — is often the trickiest. If the third nap ends around 15:30–16:00, aim for bedtime no later than 18:00–18:30 to avoid overtiredness. An early bedtime is not a problem at this age; it does not cause early morning wake-ups (that\'s usually overtiredness doing the opposite).',
      },
    ],
    tips: [
      {
        title: 'Treat the third nap as a "bridge"',
        description:
          'The third nap doesn\'t need to be long — 30–45 minutes is ideal. Its job is simply to bridge your baby to bedtime without crashing. Keep it early enough so it ends at least 1.5 hours before bed.',
      },
      {
        title: 'Try a consistent wake time',
        description:
          'Anchoring the day with a consistent morning wake time (±30 minutes) helps your baby\'s circadian rhythm settle, which makes nap timing and bedtime more predictable over time.',
      },
      {
        title: 'Respond to rolling in the cot',
        description:
          'If your baby has started rolling, they may end up in new positions overnight and startle themselves awake. Give them a few minutes before going in — many babies resettle on their own once they adjust to moving in their sleep space.',
      },
      {
        title: 'Don\'t skip the wind-down even for naps',
        description:
          'A short 5-minute wind-down before each nap — draw the blinds, reduce stimulation, use a consistent phrase or song — signals to your baby\'s nervous system that sleep is coming. It\'s especially useful as awake time lengthens and the brain gets more activated.',
      },
    ],
  },

  // ── 6 months ──────────────────────────────────────────────────────────────
  {
    slug: '6-month-old',
    ageMonths: 6,
    title: '6 Month Old Sleep Schedule',
    subtitle: 'Wake windows, nap times, and bedtime for your 6-month-old',
    metaDescription:
      'Complete 6-month-old sleep schedule guide: 3 naps, 2–2.25h wake windows, ideal bedtime 18:00–19:30, and tips for handling solids and sleep consolidation.',
    stats: {
      napsPerDay: '3',
      wakeWindow: '2–2.25h',
      bedtime: '18:00–19:30',
      nightSleep: '11–12h',
      totalDaySleep: '3–3.5h',
      totalSleep: '14–15.5h',
    },
    sampleSchedule: [
      { time: '07:00', label: 'Wake up', type: 'wake' },
      { time: '09:00', label: 'Nap 1', type: 'nap' },
      { time: '11:30', label: 'Nap 2', type: 'nap' },
      { time: '14:15', label: 'Nap 3 (short)', type: 'nap' },
      { time: '18:30', label: 'Bedtime', type: 'bedtime' },
    ],
    sections: [
      {
        heading: 'What to expect at 6 months',
        content:
          'Six months is a landmark. Your baby is halfway through their first year, sitting with support, showing clear preferences, and often starting to explore solid foods. All of this developmental energy is both exciting and sleep-relevant — a baby who is more mentally and physically engaged during the day tends to sleep more soundly at night.\n\nMost 6-month-olds are still on 3 naps, though the gap between nap 2 and nap 3 can feel long and occasionally that third nap becomes a battle. That\'s a sign your baby\'s capacity is growing but they\'re not quite ready to drop a nap yet. Patience here pays off — forcing the 2-nap transition too early often leads to overtiredness and disrupted nights.\n\nStarting solids around 6 months is exciting, but it won\'t directly improve sleep (despite the common advice to add rice cereal at night). What does help is keeping feeds — breast or bottle — as the primary nutrition source and using mealtimes to anchor the day\'s rhythm. The most powerful sleep lever at this age is a consistent, early-enough bedtime.',
      },
      {
        heading: 'Understanding wake windows',
        content:
          'At 6 months, wake windows typically run 2–2.25 hours. This is a meaningful jump from just a few months ago, and it means your baby can handle more active, varied play before needing a rest. The first window of the day is around 2 hours, and windows can edge toward 2.25 hours as the day progresses.\n\nWatch for subtle early overtiredness cues: losing interest in toys, staring blankly, or becoming clingy with you. These often appear before the classic yawning and eye-rubbing, and acting on them early leads to easier, faster settling.',
      },
    ],
    tips: [
      {
        title: 'Keep solids away from bedtime feeds',
        description:
          'When introducing solid foods, offer them around midday rather than at the last feed before bed. Digestion doesn\'t improve sleep, but an uncomfortable stomach can disrupt it. Keep the pre-bedtime routine centred on milk and calm.',
      },
      {
        title: 'Protect the third nap even when it\'s a fight',
        description:
          'If your baby resists the third nap some days, try a pram walk or contact nap instead of skipping it. An overtired 6-month-old at bedtime usually means more night wake-ups, not fewer.',
      },
      {
        title: 'Practice independent settling in low-stakes moments',
        description:
          'Put your baby down drowsy but awake for at least one nap a day to give them practice settling without full assistance. If they fuss, that\'s fine — a few minutes of gentle protest is different from distress.',
      },
      {
        title: 'Make the sleep environment fully dark',
        description:
          'At 6 months, your baby is more visually aware and easily distracted by light. Full blackout during all sleeps — naps and nights — can meaningfully extend sleep duration.',
      },
    ],
  },

  // ── 7 months ──────────────────────────────────────────────────────────────
  {
    slug: '7-month-old',
    ageMonths: 7,
    title: '7 Month Old Sleep Schedule',
    subtitle: 'Wake windows, nap times, and bedtime for your 7-month-old',
    metaDescription:
      'Everything you need for a 7-month-old sleep schedule: 3 naps, 2–2.5h wake windows, bedtime 18:00–19:30, plus tips for crawling-stage sleep disruption.',
    stats: {
      napsPerDay: '3',
      wakeWindow: '2–2.5h',
      bedtime: '18:00–19:30',
      nightSleep: '11–12h',
      totalDaySleep: '3–3.5h',
      totalSleep: '14–15.5h',
    },
    sampleSchedule: [
      { time: '07:00', label: 'Wake up', type: 'wake' },
      { time: '09:00', label: 'Nap 1', type: 'nap' },
      { time: '11:45', label: 'Nap 2', type: 'nap' },
      { time: '14:30', label: 'Nap 3 (short)', type: 'nap' },
      { time: '18:30', label: 'Bedtime', type: 'bedtime' },
    ],
    sections: [
      {
        heading: 'What to expect at 7 months',
        content:
          'Seven months brings a noticeable surge in physical activity. Many babies this age are commando-crawling, pivoting on their bellies, or starting to pull up on furniture. This motor development is relentless — your baby is practising movement even in their sleep space, which can lead to new overnight wake-ups as they find themselves in unfamiliar positions.\n\nSleep is generally more structured this month. Most 7-month-olds are on 3 naps, though the third is increasingly short and transitional. You may notice your baby starting to resist it or fighting it more than earlier weeks. That\'s normal — their ability to handle longer wake stretches is building, but most babies aren\'t quite ready to drop to 2 naps until 8–9 months.\n\nSeparation awareness can also begin emerging around 7 months. Your baby may become more clingy at sleep time, wanting to be held or fussing when put down. This is not regression — it\'s a healthy sign of cognitive development. A consistent, warm bedtime routine gives your baby the reassurance that you\'ll return even when they can\'t see you.',
      },
      {
        heading: 'Understanding wake windows',
        content:
          'At 7 months, wake windows range from 2 to 2.5 hours depending on the time of day and your baby\'s individual pace. The first window after morning wake is usually around 2 hours; by the time you\'re heading into the third nap period, your baby may handle close to 2.5 hours before showing cues.\n\nPhysical busyness this month can mask tiredness. A baby who\'s actively crawling or exploring may seem energetic right up until they crash. Trust the clock as a backup guide — if 2.5 hours has passed and your baby hasn\'t signalled tiredness, gently start the wind-down anyway.',
      },
    ],
    tips: [
      {
        title: 'Give floor time before naps',
        description:
          'Ample tummy time and free movement during wake windows helps your baby process the physical learning they\'re doing. A baby who has had good physical output often settles to sleep more easily than one who\'s been contained in a seat.',
      },
      {
        title: 'Keep bedtime early during motor leaps',
        description:
          'New physical skills require enormous neural processing, and your baby\'s brain is working hard even during sleep. An early bedtime — 18:00–18:30 during intense developmental weeks — prevents overtiredness and supports better night sleep.',
      },
      {
        title: 'Address separation at the start of the routine',
        description:
          'If your baby is becoming clingy at bedtime, build extra connection time into the beginning of the routine — cuddles, eye contact, calm talking — before the final put-down. Meeting the need early means less protest later.',
      },
      {
        title: 'Check the sleep space for movement hazards',
        description:
          'Now that your baby is moving more, check that the cot is clear and the mattress is at a safe height. If they\'re pulling to standing, lower the mattress to prevent falls.',
      },
    ],
  },

  // ── 8 months ──────────────────────────────────────────────────────────────
  {
    slug: '8-month-old',
    ageMonths: 8,
    title: '8 Month Old Sleep Schedule',
    subtitle: 'Wake windows, nap times, and bedtime for your 8-month-old',
    metaDescription:
      'Guide to the 8-month-old sleep schedule: transitioning to 2 naps, 2.5–3h wake windows, the 8-month regression, and separation anxiety sleep tips.',
    stats: {
      napsPerDay: '2',
      wakeWindow: '2.5–3h',
      bedtime: '18:00–19:30',
      nightSleep: '11–12h',
      totalDaySleep: '2.5–3h',
      totalSleep: '13.5–15h',
    },
    sampleSchedule: [
      { time: '07:00', label: 'Wake up', type: 'wake' },
      { time: '09:30', label: 'Nap 1', type: 'nap' },
      { time: '13:30', label: 'Nap 2', type: 'nap' },
      { time: '18:30', label: 'Bedtime', type: 'bedtime' },
    ],
    sections: [
      {
        heading: 'What to expect at 8 months',
        content:
          'Eight months is a significant transition point: most babies are ready to move from 3 naps to 2. The signs are clear when they arrive — your baby consistently refuses the third nap, takes it very late (pushing bedtime), or goes to bed so tired that nights become unsettled. Moving to 2 naps usually goes smoothly when you wait for these readiness cues rather than switching by the calendar.\n\nThe 8-month regression is driven by a combination of milestone stacking — crawling, pulling up, first standing attempts, and the emergence of separation anxiety. Your baby\'s brain is performing complex social and spatial processing around the clock. This can translate into increased night wake-ups, difficulty at bedtime, and shorter naps that had previously been consolidating. Frustrating in the moment, but it\'s a sign of healthy development.\n\nSeparation anxiety peaks around this age and is felt most acutely at sleep time. Your baby now understands object permanence — they know you exist when you leave the room — and they want you back. A warm, predictable bedtime routine is your most effective tool. Consistency signals safety.',
      },
      {
        heading: 'Understanding wake windows',
        content:
          'The jump to 2 naps also means wake windows lengthen considerably — to 2.5–3 hours. The first window of the day is typically around 2.5 hours, while the final window before bedtime often extends closer to 3 hours as your baby builds stamina.\n\nWith two naps, the schedule has more natural anchors. Aim for the first nap around 9:30–10:00 and the second around 13:00–14:00, with bedtime 3–3.5 hours after the second nap ends. The longer afternoon wake window can feel like a lot at first — short outings and active play help fill it without creating overtiredness.',
      },
    ],
    tips: [
      {
        title: 'Transition to 2 naps gradually',
        description:
          'If your baby is fighting the third nap but not quite ready for just two, try pushing nap times slightly later over a week rather than cutting the third nap abruptly. A gradual shift is easier on everyone.',
      },
      {
        title: 'Use a short goodbye ritual at every separation',
        description:
          'When leaving the room at bedtime, use the same phrase every time — "Goodnight, I love you, I\'ll see you in the morning" — and mean it. Predictable words are genuinely soothing to a baby experiencing separation anxiety.',
      },
      {
        title: 'Protect the morning nap anchor',
        description:
          'On the 2-nap schedule, the first nap is the structural backbone of the day. Keeping it at a consistent time (within 30 minutes) helps anchor the afternoon nap and bedtime, making the whole day more predictable.',
      },
      {
        title: 'Offer extra connection before bed during regression',
        description:
          'During the regression period, add 5–10 minutes of quiet, undivided attention at the start of the bedtime routine. Physical closeness before sleep helps your baby\'s nervous system downregulate, making settling easier.',
      },
    ],
    regression: {
      name: '8-month sleep regression',
      description:
        "The 8-month regression often coincides with major milestones — crawling, pulling up, and separation anxiety. Your baby may resist naps, wake more at night, or have trouble settling. This phase usually passes within 2–3 weeks.",
    },
  },

  // ── 9 months ──────────────────────────────────────────────────────────────
  {
    slug: '9-month-old',
    ageMonths: 9,
    title: '9 Month Old Sleep Schedule',
    subtitle: 'Wake windows, nap times, and bedtime for your 9-month-old',
    metaDescription:
      'Practical 9-month-old sleep schedule: 2 naps, 2.5–3.5h wake windows, bedtime 18:00–19:30, and tips for handling standing in the cot and early waking.',
    stats: {
      napsPerDay: '2',
      wakeWindow: '2.5–3.5h',
      bedtime: '18:00–19:30',
      nightSleep: '11–12h',
      totalDaySleep: '2.5–3h',
      totalSleep: '13.5–15h',
    },
    sampleSchedule: [
      { time: '07:00', label: 'Wake up', type: 'wake' },
      { time: '09:30', label: 'Nap 1', type: 'nap' },
      { time: '13:30', label: 'Nap 2', type: 'nap' },
      { time: '18:30', label: 'Bedtime', type: 'bedtime' },
    ],
    sections: [
      {
        heading: 'What to expect at 9 months',
        content:
          'Nine months is a physically bold age. Your baby is likely pulling to stand, cruising along furniture, and may be taking first tentative steps with support. This mobility surge brings enormous cognitive pride — and enormous physical tiredness — so the 2-nap structure established last month continues to serve well.\n\nMany 9-month-olds develop the ability to pull to standing in the cot but haven\'t yet figured out how to get back down. This frequently causes overnight wake-ups that feel confusing — your baby isn\'t distressed by a nightmare or hunger, they\'re just stuck standing and need a gentle lowering back to lying. Practising the sit-down-from-standing movement during floor play during the day speeds up how quickly they learn to do it independently.\n\nSolid foods are becoming more established this month, which can subtly shift the day\'s rhythm. As milk feeds become slightly less frequent, hunger is less likely to be the driver of night wake-ups, and sleep consolidation often improves around this time as a result.',
      },
      {
        heading: 'Understanding wake windows',
        content:
          'By 9 months, wake windows range from about 2.5 to 3.5 hours. The first window is typically 2.5–3 hours, and the final window before bedtime can comfortably stretch to 3–3.5 hours for many babies.\n\nEarly morning wake-ups are a common challenge this month. If your baby is waking before 6:00 AM consistently, the culprit is usually one of three things: total sleep need being met by very long nights, the first nap being offered too soon (reinforcing the early wake), or the sleep environment getting too light. Address the environment first — it\'s the easiest lever.',
      },
    ],
    tips: [
      {
        title: 'Practise sitting down from standing during the day',
        description:
          'If your baby keeps standing in the cot at night, spend time in floor play practising "down" — guide them to lower themselves from a standing hold to sitting. This typically resolves overnight standing within 1–2 weeks.',
      },
      {
        title: 'Don\'t push the morning nap too late',
        description:
          'It\'s tempting to stretch the morning wake window to make the schedule tidier, but at 9 months, a 3-hour morning window is usually the maximum. Pushing past it creates a tired, irritable baby who takes longer to settle.',
      },
      {
        title: 'Audit the early-morning light situation',
        description:
          'Even a small amount of light at 5:30 AM can signal "morning" to a baby\'s developing circadian system. Check for light leaks around blackout blinds, especially as days get longer seasonally.',
      },
      {
        title: 'Keep the second nap from going too late',
        description:
          'With longer wake windows, the second nap can creep later in the afternoon. Aim for the second nap to end by 16:00–16:30 at the latest to protect bedtime drive — a well-timed bedtime is the foundation of a good night.',
      },
    ],
  },

  // ── 10 months ─────────────────────────────────────────────────────────────
  {
    slug: '10-month-old',
    ageMonths: 10,
    title: '10 Month Old Sleep Schedule',
    subtitle: 'Wake windows, nap times, and bedtime for your 10-month-old',
    metaDescription:
      'The definitive 10-month-old sleep guide: 2 naps, 2.75–3.5h wake windows, bedtime 18:00–19:30, and how to handle nap refusals before the 2-to-1 transition.',
    stats: {
      napsPerDay: '2',
      wakeWindow: '2.75–3.5h',
      bedtime: '18:00–19:30',
      nightSleep: '11–12h',
      totalDaySleep: '2.5–3h',
      totalSleep: '13.5–15h',
    },
    sampleSchedule: [
      { time: '07:00', label: 'Wake up', type: 'wake' },
      { time: '09:45', label: 'Nap 1', type: 'nap' },
      { time: '14:00', label: 'Nap 2', type: 'nap' },
      { time: '18:30', label: 'Bedtime', type: 'bedtime' },
    ],
    sections: [
      {
        heading: 'What to expect at 10 months',
        content:
          'Ten months is an age of burgeoning independence. Your baby is likely walking along furniture, exploring everything at floor level, and starting to communicate with intention — pointing, babbling with intonation, and occasionally signing if you\'ve introduced it. This cognitive explosion is matched by a growing self-determination that can show up at sleep time as nap refusals or bedtime protests.\n\nThe 2-nap structure continues to work well for most 10-month-olds, though you may start to see occasional resistance to one nap or the other. This doesn\'t necessarily mean your baby is ready to transition to 1 nap — most children don\'t manage that shift until 14–18 months. What it usually means is that a wake window needs a small adjustment, or an activity choice in the wind-down period is too stimulating.\n\nNighttime sleep is generally good this month. Many 10-month-olds are sleeping 11–12 hours without needing a feed, though some still benefit from one overnight feed. Follow your baby\'s cues and consult your health visitor if you\'re unsure about night feeding at this age.',
      },
      {
        heading: 'Understanding wake windows',
        content:
          'Wake windows at 10 months run approximately 2.75–3.5 hours. The window between morning wake and the first nap is typically around 2.75–3 hours, while the afternoon window before bedtime can stretch to 3.5 hours for some babies.\n\nThe gap between the two naps is now quite long — often 4+ hours of awake time. Structured, engaging play and appropriate outdoor time during this stretch helps prevent overtiredness from building too quickly. If your baby seems to struggle with the long mid-morning window, check that wake windows aren\'t being stretched beyond what your individual baby can manage.',
      },
    ],
    tips: [
      {
        title: 'Don\'t mistake independence for sleep readiness',
        description:
          'A 10-month-old who protests at nap time is often communicating "I want to keep playing" rather than "I\'m not tired." Trust the wake window timing — if 3 hours has passed, your baby\'s brain is ready for sleep even if they\'re telling you otherwise.',
      },
      {
        title: 'Offer predictable choices in the routine',
        description:
          'Giving your baby small choices — "do you want the star blanket or the moon blanket?" — satisfies their growing need for autonomy without undermining the sleep structure. It also makes the routine more engaging and less of a struggle.',
      },
      {
        title: 'Use white noise consistently',
        description:
          'At 10 months, your baby is more aware of household noise and will rouse from light sleep stages more easily. Consistent white noise throughout naps and night helps mask environmental sounds that would otherwise cause unnecessary wake-ups.',
      },
      {
        title: 'Plan an outdoor stretch in the long mid-morning window',
        description:
          'Natural light and physical movement during the long wake window between naps supports circadian rhythm development and helps your baby achieve quality sleep pressure by the second nap.',
      },
    ],
  },

  // ── 11 months ─────────────────────────────────────────────────────────────
  {
    slug: '11-month-old',
    ageMonths: 11,
    title: '11 Month Old Sleep Schedule',
    subtitle: 'Wake windows, nap times, and bedtime for your 11-month-old',
    metaDescription:
      'Complete 11-month-old sleep schedule: 2 naps, 2.75–3.5h wake windows, bedtime guidance, and how to handle nap battles as your baby approaches their first birthday.',
    stats: {
      napsPerDay: '2',
      wakeWindow: '2.75–3.5h',
      bedtime: '18:00–19:30',
      nightSleep: '11–12h',
      totalDaySleep: '2.5–3h',
      totalSleep: '13.5–15h',
    },
    sampleSchedule: [
      { time: '07:00', label: 'Wake up', type: 'wake' },
      { time: '09:45', label: 'Nap 1', type: 'nap' },
      { time: '14:00', label: 'Nap 2', type: 'nap' },
      { time: '18:30', label: 'Bedtime', type: 'bedtime' },
    ],
    sections: [
      {
        heading: 'What to expect at 11 months',
        content:
          'At 11 months, you\'re in the final stretch of your baby\'s first year, and it shows in their sleep patterns. Your baby is likely standing confidently, possibly walking, and demonstrating a very clear sense of what they want — including at bedtime. Nap protests may be more vocal and persistent now, not because your baby needs less sleep, but because their ability to express preferences has grown alongside their awareness of the world.\n\nMost 11-month-olds still need 2 naps. Despite the occasional resistance, the biology is clear: dropping to 1 nap before about 14–15 months typically leads to chronic overtiredness, which shows up as early waking, night wake-ups, and a baby who seems wired rather than tired. Stick with 2 naps and trust the data, even when the battles feel convincing.\n\nLanguage is beginning to emerge this month — many babies say their first words around the 11–12 month mark. The brain activity involved in language acquisition is considerable, and some babies show more restless or lighter sleep patterns during these bursts. It\'s a temporary disruption tied to a huge developmental gain.',
      },
      {
        heading: 'Understanding wake windows',
        content:
          'Wake windows at 11 months mirror the 10-month range: 2.75–3.5 hours. You\'re in the same developmental bracket, but your baby may be nudging toward the longer end of each window more consistently as they approach 12 months.\n\nIf you\'re noticing nap resistance at one consistent nap each day, check whether the wake window before it has drifted too short. A baby who was put down at 2.5 hours but can now comfortably stay awake for 3 hours will protest — not because they\'re giving up the nap, but because there isn\'t enough sleep pressure yet. Gently extend the window by 15 minutes and see if settling improves.',
      },
    ],
    tips: [
      {
        title: 'Don\'t interpret nap protests as readiness to drop a nap',
        description:
          'Vocal nap resistance at 11 months is almost always about wanting to stay in the action, not genuine lack of tiredness. Consistent, calm follow-through with the nap routine wins over time — your baby needs the sleep even when they insist they don\'t.',
      },
      {
        title: 'Cap nap 1 to protect nap 2',
        description:
          'If the first nap is too long (over 1.5 hours), your baby may not build enough sleep pressure for a second nap. Gently cap the morning nap at 1–1.5 hours to keep the afternoon nap accessible.',
      },
      {
        title: 'Build in transition time before the cot',
        description:
          'An 11-month-old who has been playing actively needs time to wind down neurologically. A 10-minute pre-nap routine — dim the room, slow the activity, sing a consistent song — gives the brain time to shift gears before the cot.',
      },
      {
        title: 'Celebrate the milestones even when they disrupt sleep',
        description:
          'First words, first steps, new social awareness — these leaps temporarily disrupt sleep and that\'s a feature, not a bug. Your baby is exactly where they should be. Sleep will restabilise within a week or two of each milestone peak.',
      },
    ],
  },

  // ── 12 months ─────────────────────────────────────────────────────────────
  {
    slug: '12-month-old',
    ageMonths: 12,
    title: '12 Month Old Sleep Schedule',
    subtitle: 'Wake windows, nap times, and bedtime for your 12-month-old',
    metaDescription:
      'Full 12-month-old sleep guide: 2 naps, 3–4h wake windows, bedtime 18:00–19:30, the 12-month sleep regression, and when to consider transitioning to 1 nap.',
    stats: {
      napsPerDay: '2',
      wakeWindow: '3–4h',
      bedtime: '18:00–19:30',
      nightSleep: '11–12h',
      totalDaySleep: '2.5–3h',
      totalSleep: '13.5–15h',
    },
    sampleSchedule: [
      { time: '07:00', label: 'Wake up', type: 'wake' },
      { time: '10:00', label: 'Nap 1', type: 'nap' },
      { time: '14:30', label: 'Nap 2', type: 'nap' },
      { time: '19:00', label: 'Bedtime', type: 'bedtime' },
    ],
    sections: [
      {
        heading: 'What to expect at 12 months',
        content:
          'Happy first birthday. The fact that you\'ve been tracking and supporting your baby\'s sleep for a whole year says a great deal about your commitment to their wellbeing. At 12 months, most babies are walking or on the verge of it, saying a handful of words, and showing distinct personality traits. It\'s a full, busy, exhilarating age — and it comes with its own sleep challenges.\n\nThe 12-month sleep regression is real, and it\'s driven by the same force as most regressions: a surge of neurological development. Walking requires extraordinary coordination, balance, and spatial processing that the brain is actively building even during sleep. Some babies temporarily resist one or both naps, and night wake-ups may reappear after long stretches of consolidated sleep. This is temporary — usually 2–4 weeks — and it passes.\n\nDespite the regression, 12-month-olds still need 2 naps. The most common mistake at this age is transitioning to 1 nap too early because the 2-nap schedule feels like a battle. Most babies aren\'t neurologically ready for 1 nap until 14–18 months. Early elimination of the morning nap often leads to overtiredness that is much harder to manage than a difficult nap transition period.',
      },
      {
        heading: 'Understanding wake windows',
        content:
          'At 12 months, wake windows have grown to 3–4 hours. The first window of the day is typically around 3 hours, while the final window before bedtime can stretch to 4 hours for a baby who has had good naps. This means the day has more natural breathing room, and you may find naps feel more predictable than in earlier months.\n\nWith longer windows comes more risk of genuine overtiredness if you misjudge the timing. A 12-month-old who misses a nap or has a very short one can accumulate significant sleep debt quickly. On those days, an earlier bedtime — even 30–60 minutes earlier than usual — is your best recovery tool. There is no such thing as "too early" for a bedtime when your baby is overtired.',
      },
    ],
    tips: [
      {
        title: 'Use an earlier bedtime as your recovery tool',
        description:
          'When a nap goes wrong — refused, cut short, or delayed — compensate with a bedtime 30–60 minutes earlier than usual. This prevents overtiredness from compounding across multiple days and protects the rest of the week\'s sleep.',
      },
      {
        title: 'Keep 2 naps even through the regression',
        description:
          'Nap refusals during the 12-month regression are a phase, not a developmental signal to drop a nap. Stay consistent with the 2-nap structure, use contact naps or pram naps on hard days, and the regular schedule will re-establish itself.',
      },
      {
        title: 'Acknowledge their new independence in the routine',
        description:
          'A 12-month-old can participate in the bedtime routine in small ways — putting their own dummy in, handing you the sleep sack, choosing a book. This involvement reduces bedtime resistance by giving your baby a sense of agency in the process.',
      },
      {
        title: 'Recognise that first birthday celebrations can disrupt sleep',
        description:
          'Parties, visitors, and exciting stimulation on or around the first birthday can throw off naps and bedtime for a day or two. Plan for it, protect the post-party nap, and expect things to settle within 48 hours.',
      },
    ],
    regression: {
      name: '12-month sleep regression',
      description:
        "Around 12 months, walking and language development can disrupt sleep patterns. Some babies temporarily refuse their second nap, but most still need 2 naps for a few more months. This regression typically lasts 2–4 weeks.",
    },
  },

  // ── 13 months (Toddler) ────────────────────────────────────────────────
  {
    slug: '13-month-old',
    ageMonths: 13,
    displayLabel: '13 mo',
    ageLabel: '13-month-old',
    title: '13 Month Old Sleep Schedule',
    subtitle: 'Wake windows, nap times, and bedtime for your 13-month-old',
    metaDescription:
      'A complete 13-month-old sleep guide: 2 naps, 3.25–4h wake windows, bedtime around 7:15 PM, and tips for handling early nap resistance in toddlers.',
    stats: {
      napsPerDay: '2',
      wakeWindow: '3.25–4h',
      bedtime: '~19:15',
      nightSleep: '11–12h',
      totalDaySleep: '2–3h',
      totalSleep: '13.25h',
    },
    sampleSchedule: [
      { time: '06:30', label: 'Wake up', type: 'wake' },
      { time: '09:45', label: 'Nap 1 (60–90 min)', type: 'nap' },
      { time: '14:15', label: 'Nap 2 (60–90 min)', type: 'nap' },
      { time: '19:15', label: 'Bedtime', type: 'bedtime' },
    ],
    sections: [
      {
        heading: 'What to expect at 13 months',
        content:
          'Thirteen months is a settling-in age. The big milestones of the first birthday have passed, and your toddler is consolidating their walking, expanding their vocabulary, and showing a growing sense of self. Sleep at this age is generally stable — most 13-month-olds are firmly on a 2-nap schedule and sleeping around 13.25 hours in total.\n\nYou may start to see occasional nap resistance, especially at the morning nap. This is usually your toddler testing their expanding independence rather than a genuine sign that they\'re ready to drop to 1 nap. Most children aren\'t ready for that transition until 14–18 months, so stick with 2 naps and adjust wake windows if settling becomes harder.\n\nWake windows have grown to 3.25–4 hours, with the morning window typically a bit shorter (3.25–3.5 hours) and the pre-bedtime window stretching to about 4 hours. This longer afternoon window means your toddler needs engaging activity to stay happy — outdoor play, water play, and physical exploration all help fill the time without creating overtiredness.',
      },
      {
        heading: 'Fine-tuning the schedule',
        content:
          'At 13 months, small adjustments make a big difference. If your toddler is taking a long time to fall asleep at nap 1, try extending the morning wake window by 15 minutes. If nap 2 is being refused, check whether nap 1 was too long — capping it at 90 minutes usually protects the afternoon nap.\n\nDinner timing also starts to matter now. A meal that\'s too close to bedtime can cause discomfort, while eating too early means your toddler is hungry at bedtime. Aim for dinner about 1–1.5 hours before bedtime, with a small milk feed closer to the start of the bedtime routine.',
      },
    ],
    tips: [
      {
        title: 'Lengthen wake windows gradually',
        description:
          'If your toddler is resisting a nap, don\'t eliminate it — try pushing it later by 15–30 minutes. A small adjustment to the wake window often solves the settling problem without dropping a nap too early.',
      },
      {
        title: 'Time dinner thoughtfully',
        description:
          'A substantial dinner 1–1.5 hours before bedtime, followed by a small milk feed in the routine, prevents both hunger-related wake-ups and bedtime discomfort from a too-full stomach.',
      },
      {
        title: 'Keep the bedtime routine short and predictable',
        description:
          'At 13 months, a 15–20 minute routine is ideal: dinner, bath (or wash), pyjamas, book, milk, song, bed. Your toddler\'s growing memory means the predictability itself becomes soothing.',
      },
      {
        title: 'Resist the urge to drop to 1 nap too early',
        description:
          'Most 13-month-olds still need 2 naps. Dropping to 1 nap before they\'re ready typically causes overtiredness, early waking, and worse night sleep. Wait for consistent signs over 2+ weeks before transitioning.',
      },
    ],
  },

  // ── 18 months (Toddler) ────────────────────────────────────────────────
  {
    slug: '18-month-old',
    ageMonths: 18,
    displayLabel: '18 mo',
    ageLabel: '18-month-old',
    title: '18 Month Old Sleep Schedule',
    subtitle: 'Wake windows, the 1-nap transition, and the 18-month regression',
    metaDescription:
      'Navigate the 18-month-old sleep schedule: 1 midday nap, 5–5.75h wake windows, bedtime 6–8 PM, and how to handle the 18-month sleep regression with calm confidence.',
    stats: {
      napsPerDay: '1',
      wakeWindow: '5–5.75h',
      bedtime: '18:00–20:00',
      nightSleep: '11+ hours',
      totalDaySleep: '2–3h',
      totalSleep: '13–14h',
    },
    sampleSchedule: [
      { time: '07:00', label: 'Wake up', type: 'wake' },
      { time: '12:00', label: 'Nap (2–2.5h)', type: 'nap' },
      { time: '20:00', label: 'Bedtime', type: 'bedtime' },
    ],
    sections: [
      {
        heading: 'What to expect at 18 months',
        content:
          'Eighteen months is a big transition point. If your toddler hasn\'t already moved to 1 nap, this is typically when it happens. The single nap lands in the middle of the day — usually around noon — and runs for 2–3 hours. Wake windows have stretched to 5 hours before the nap and 5–5.75 hours before bedtime, which is a significant amount of awake time for a small person.\n\nThe 1-nap schedule has a beautiful simplicity to it. Your mornings are free, the nap is long and restorative, and the afternoon-to-bedtime stretch, while long, is manageable with engaging activities and outdoor time. Many parents find that the transition to 1 nap, once it settles, actually makes daily planning easier.\n\nBedtime at 18 months typically falls between 6 PM and 8 PM, depending on when the nap ends and your family\'s routine. On days when the nap is shorter or skipped entirely (it happens), an earlier bedtime is your best friend. Moving bedtime forward by 30–60 minutes on a rough nap day prevents the overtiredness cascade that leads to night waking.',
      },
      {
        heading: 'The 18-month sleep regression',
        content:
          'The 18-month regression is one of the more challenging ones, because your toddler now has the will and the words to fight sleep more actively. You may see nap refusals, bedtime crying, increased night waking, and sometimes early morning wake-ups. The common drivers are a surge in independence, separation anxiety, teething (molars often arrive around now), and an explosion in language development.\n\nThe best response is consistent, empathetic boundaries. Your toddler needs to know that sleep time is non-negotiable, but they also need to feel safe and connected. Keep the routine exactly the same, offer brief reassurance if they\'re upset, and avoid introducing new sleep crutches just to get through the phase. This regression typically lasts 2–6 weeks and resolves on its own when the developmental surge settles.',
      },
    ],
    tips: [
      {
        title: 'Protect the nap fiercely',
        description:
          'At 18 months, your toddler may insist they don\'t need a nap. They do. Nap refusal at this age is almost always about independence, not genuine lack of tiredness. Keep offering the nap in a consistent, calm way.',
      },
      {
        title: 'Use an earlier bedtime as a safety net',
        description:
          'On days when the nap is short or skipped, move bedtime earlier by 30–60 minutes. An overtired 18-month-old at bedtime is harder to settle and more likely to wake overnight.',
      },
      {
        title: 'Build connection into the routine, not after it',
        description:
          'Separation anxiety peaks around 18 months. Extra cuddles, a special song, or a brief chat about the day — do this during the routine, not as a stalling tactic after lights out.',
      },
    ],
    regression: {
      name: '18-month sleep regression',
      description:
        'Around 18 months, a surge in independence, language development, separation anxiety, and teething can disrupt sleep. Your toddler may fight naps, cry at bedtime, or wake more at night. This phase typically lasts 2–6 weeks.',
    },
  },

  // ── 24 months / 2 years (Toddler) ──────────────────────────────────────
  {
    slug: '2-year-old',
    ageMonths: 24,
    displayLabel: '2 yr',
    ageLabel: '2-year-old',
    title: '2 Year Old Sleep Schedule',
    subtitle: 'Nap, bedtime, and the 2-year sleep regression',
    metaDescription:
      'Your complete 2-year-old sleep guide: 1 midday nap (1.5–2h), 5.5–6h wake windows, bedtime 7–9 PM, and how to navigate the 2-year sleep regression.',
    stats: {
      napsPerDay: '1',
      wakeWindow: '5.5–6h',
      bedtime: '19:00–21:00',
      nightSleep: '10–12h',
      totalDaySleep: '1.5–2h',
      totalSleep: '12+ hours',
    },
    sampleSchedule: [
      { time: '07:00', label: 'Wake up', type: 'wake' },
      { time: '12:30', label: 'Nap (1.5–2h)', type: 'nap' },
      { time: '20:00', label: 'Bedtime', type: 'bedtime' },
    ],
    sections: [
      {
        heading: 'What to expect at 2 years',
        content:
          'Two years old. Your baby is now a full-fledged toddler with opinions, sentences, and a remarkable ability to negotiate at bedtime. Sleep at this age typically totals 12 or more hours across a 24-hour period, split between a 1.5–2 hour midday nap and 10–12 hours of night sleep.\n\nNap resistance is common at 2 years, and it can feel very convincing — your toddler may genuinely seem like they don\'t need the nap. But most children aren\'t ready to drop the nap entirely until age 3 or later. What looks like "not tired" is often "too stimulated to settle" or "exercising independence." Consistency is your most powerful tool here. Keep offering the nap at the same time every day, in a calm, dark environment, and most 2-year-olds will continue napping.\n\nWake windows have stretched to 5.5–6 hours, giving you long, full mornings and afternoons. Bedtime falls anywhere from 7 PM to 9 PM depending on when the nap ends. The daily rhythm at 2 is relatively simple and predictable — which is a gift after the chaos of infancy.',
      },
      {
        heading: 'The 2-year sleep regression',
        content:
          'The 2-year regression is fuelled by the same forces that make this age so exciting: explosive language, growing independence, new fears (the dark, monsters, being alone), and big developmental milestones like potty training. Your toddler may stall at bedtime, call out repeatedly after lights-out, refuse the nap, or start waking at night after months of sleeping through.\n\nThe key is boundaries wrapped in warmth. Acknowledge your toddler\'s feelings — "I know you want to stay up, and it\'s time for sleep" — and hold the line calmly. Avoid introducing new habits you\'ll need to undo later (lying down with them until they sleep, bringing them into your bed if that\'s not your plan). This regression typically lasts 2–4 weeks and passes when the developmental wave settles.',
      },
    ],
    tips: [
      {
        title: 'Don\'t drop the nap yet',
        description:
          'Most 2-year-olds still need a nap, even when they resist it. Dropping the nap too early often causes overtiredness, worse night sleep, and more behavioural challenges during the day. Keep offering it consistently.',
      },
      {
        title: 'Use clear, simple bedtime rules',
        description:
          'At 2, your toddler understands rules. "One more book, then lights out" or "After our song, it\'s sleep time." Simple, predictable boundaries reduce bedtime negotiations and help your toddler feel secure.',
      },
      {
        title: 'Address new fears with empathy, not dismissal',
        description:
          'If your toddler is developing fear of the dark or monsters, take it seriously. A gentle night light, a "monster spray" ritual, or a special stuffed animal can provide genuine comfort without undermining sleep independence.',
      },
      {
        title: 'Consistency through the regression is everything',
        description:
          'The 2-year regression tests your resolve. Keep the routine the same, respond briefly and calmly to night wake-ups, and trust that the phase will pass. Your calm consistency is the most reassuring thing your toddler can experience.',
      },
    ],
    regression: {
      name: '2-year sleep regression',
      description:
        'Around 2 years, growing independence, new fears, language development, and milestones like potty training can disrupt sleep. Bedtime stalling, nap refusal, and night waking are common. This phase typically lasts 2–4 weeks.',
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

export function getGuideBySlug(slug: string): SleepGuideConfig | undefined {
  return SLEEP_GUIDE_CONFIGS.find((g) => g.slug === slug);
}

export const GUIDE_SLUGS = SLEEP_GUIDE_CONFIGS.map((g) => g.slug);
