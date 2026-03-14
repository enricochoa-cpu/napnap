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
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

export function getGuideBySlug(slug: string): SleepGuideConfig | undefined {
  return SLEEP_GUIDE_CONFIGS.find((g) => g.slug === slug);
}

export const GUIDE_SLUGS = SLEEP_GUIDE_CONFIGS.map((g) => g.slug);
