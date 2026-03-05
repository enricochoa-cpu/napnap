import { useEffect } from 'react';
import { Logo } from './Logo';
import { SkyBackground } from './SkyBackground';

export function LandingPage() {
  const handleLoginClick = () => {
    window.location.href = '/app';
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Use morning palette for the marketing landing, without affecting /app.
  useEffect(() => {
    const root = document.documentElement;
    const previousClassList = Array.from(root.classList);
    if (!root.classList.contains('theme-morning')) {
      root.classList.add('theme-morning');
    }
    return () => {
      root.className = previousClassList.join(' ');
    };
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] text-[var(--text-primary)]">
      <SkyBackground theme="morning" />

      <header className="safe-top px-4 sm:px-6 pt-4">
        <div className="max-w-5xl mx-auto">
          <div className="glass-nav rounded-full border border-[var(--glass-border)] px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Logo size={26} variant="brand" className="text-[var(--nap-color)]" />
              <div className="flex flex-col">
                <span className="font-display text-sm text-[var(--text-primary)]">
                  NapNap
                </span>
                <span className="text-[11px] text-[var(--text-muted)] leading-tight">
                  Find your rhythm.
                </span>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-6 text-xs text-[var(--text-secondary)]">
              <button
                type="button"
                className="pressable bg-transparent border-none p-0"
                onClick={() => scrollToSection('how-it-works')}
              >
                How it works
              </button>
              <button
                type="button"
                className="pressable bg-transparent border-none p-0"
                onClick={() => scrollToSection('sleep-science')}
              >
                Sleep science
              </button>
              <button
                type="button"
                className="pressable bg-transparent border-none p-0"
                onClick={() => scrollToSection('faq')}
              >
                FAQ
              </button>
            </nav>

            <div className="flex items-center">
              <button
                type="button"
                onClick={handleLoginClick}
                className="btn btn-primary text-xs sm:text-sm px-5 py-2 min-h-[40px]"
              >
                Log in
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pb-20 pt-6 space-y-16">
        <section className="grid gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-center">
          <div className="space-y-6">
            <p className="hero-secondary">Rhythmic baby sleep companion</p>
            <h1 className="text-display-lg max-w-xl">
              Stop guessing naps.
              <br />
              Move with your baby&apos;s rhythm.
            </h1>
            <p className="text-[var(--text-secondary)] max-w-lg">
              NapNap turns wake windows and sleep patterns into a calm plan. One place to see
              when to nap, when to sleep, and when to just breathe.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <button
                type="button"
                className="btn btn-primary w-full sm:w-auto"
                onClick={handleLoginClick}
              >
                Create your free sleep plan
              </button>
              <button
                type="button"
                className="btn-link text-[var(--text-secondary)]"
                onClick={() => scrollToSection('how-it-works')}
              >
                See how it works
              </button>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-[var(--text-muted)]">
              <div>Designed for 0–18 months</div>
              <div>Built for tired, busy days</div>
              <div>No judgement. Adjust anytime.</div>
            </div>
          </div>

          <div className="relative">
            <div className="card-glass p-3 sm:p-4 rounded-[2rem] max-w-sm ml-auto shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
              <div
                aria-label="Short clips of parents using NapNap during their day"
                role="group"
                className="flex flex-col gap-3 sm:flex-row sm:gap-4"
              >
                <video
                  className="w-full sm:w-[60%] rounded-[1.5rem] border border-[var(--glass-border)] shadow-[0_12px_40px_rgba(0,0,0,0.35)] object-cover"
                  autoPlay
                  muted
                  playsInline
                  loop
                >
                  <source src="/media/hero-left-1.mp4" type="video/mp4" />
                  <p className="sr-only">
                    Vertical video showing a parent using NapNap with their baby during the day.
                  </p>
                </video>
                <video
                  className="w-full sm:w-[40%] rounded-[1.5rem] border border-[var(--glass-border)] shadow-[0_12px_40px_rgba(0,0,0,0.35)] object-cover"
                  autoPlay
                  muted
                  playsInline
                  loop
                >
                  <source src="/media/hero-right-2.mp4" type="video/mp4" />
                  <p className="sr-only">
                    Vertical video with another everyday moment while NapNap runs in the background.
                  </p>
                </video>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-display-md">How it works</h2>
            <p className="text-[var(--text-secondary)] max-w-xl">
              NapNap learns your baby&apos;s patterns and quietly turns them into a clear daily rhythm
              you can follow, even on very little sleep.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="card p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--nap-glow)] flex items-center justify-center text-xs font-display text-[var(--nap-color)]">
                  1
                </div>
                <h3 className="text-sm font-display">Tell us about your baby</h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Add a name and date of birth. NapNap starts from age‑based wake windows tailored to
                their stage.
              </p>
            </div>
            <div className="card p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--night-glow)] flex items-center justify-center text-xs font-display text-[var(--night-color)]">
                  2
                </div>
                <h3 className="text-sm font-display">Log sleep with one thumb</h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Tap once to start a nap or night sleep and once to wake. Logging is fast, forgiving,
                and built for one‑hand use on a busy day.
              </p>
            </div>
            <div className="card p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--wake-glow)] flex items-center justify-center text-xs font-display text-[var(--wake-color)]">
                  3
                </div>
                <h3 className="text-sm font-display">Follow the next step</h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                See today&apos;s naps and bedtime in one simple plan. Suggestions update as your baby
                sleeps and grows, so you always know what comes next.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-display-md">What you get</h2>
            <p className="text-[var(--text-secondary)] max-w-xl">
              A calm set of tools that work together to keep your baby&apos;s sleep on a gentle rhythm.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="card p-5 space-y-2">
              <h3 className="text-sm font-display">Live nap and bedtime plan</h3>
              <p className="text-xs text-[var(--text-secondary)]">
                See today&apos;s naps, bedtime, and wake windows in one simple view.
              </p>
            </div>
            <div className="card p-5 space-y-2">
              <h3 className="text-sm font-display">Multi‑caregiver sharing</h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Share access with partners or caregivers so everyone works from the same plan.
              </p>
            </div>
            <div className="card p-5 space-y-2">
              <h3 className="text-sm font-display">Growth tracking</h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Log weight, height, and head circumference alongside sleep, without extra clutter.
              </p>
            </div>
            <div className="card p-5 space-y-2">
              <h3 className="text-sm font-display">30‑day sleep report</h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Get a gentle narrative report on the last month to spot patterns without charts overload.
              </p>
            </div>
          </div>
        </section>

        <section aria-label="Inside NapNap" className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-display-md">See inside NapNap</h2>
            <p className="text-[var(--text-secondary)] max-w-xl">
              A calm, single‑plane interface for logging sleep, sharing with caregivers, and
              understanding your baby&apos;s rhythm.
            </p>
          </div>
          <div className="pb-2">
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              <figure className="space-y-2">
                <div className="device-frame">
                  <div className="device-notch" aria-hidden="true" />
                  <img
                    src="/media/napnap-today.png"
                    alt="Today view showing next nap countdown and the day’s sleep plan."
                    className="device-screen"
                    loading="lazy"
                  />
                </div>
                <figcaption className="text-[11px] text-[var(--text-primary)]/80">
                  Today: next nap countdown and your day at a glance.
                </figcaption>
              </figure>
              <figure className="space-y-2">
                <div className="device-frame">
                  <div className="device-notch" aria-hidden="true" />
                  <img
                    src="/media/napnap-history.png"
                    alt="Sleep log view showing calendar and a list of naps and night sleep."
                    className="device-screen"
                    loading="lazy"
                  />
                </div>
                <figcaption className="text-[11px] text-[var(--text-primary)]/80">
                  Sleep log: past days with naps and nights in one timeline.
                </figcaption>
              </figure>
              <figure className="space-y-2">
                <div className="device-frame">
                  <div className="device-notch" aria-hidden="true" />
                  <img
                    src="/media/napnap-share-access.png"
                    alt="Share baby profile screen with caregiver invite options."
                    className="device-screen"
                    loading="lazy"
                  />
                </div>
                <figcaption className="text-[11px] text-[var(--text-primary)]/80">
                  Sharing: invite partners or caregivers with the right level of access.
                </figcaption>
              </figure>
              <figure className="space-y-2">
                <div className="device-frame">
                  <div className="device-notch" aria-hidden="true" />
                  <img
                    src="/media/napnap-stats.png"
                    alt="Stats view with sleep trends and a daily schedule chart."
                    className="device-screen"
                    loading="lazy"
                  />
                </div>
                <figcaption className="text-[11px] text-[var(--text-primary)]/80">
                  Trends: gentle charts of sleep totals and daily schedule.
                </figcaption>
              </figure>
              <figure className="space-y-2">
                <div className="device-frame">
                  <div className="device-notch" aria-hidden="true" />
                  <img
                    src="/media/napnap-faq.png"
                    alt="Frequently asked questions screen explaining key concepts like wake windows."
                    className="device-screen"
                    loading="lazy"
                  />
                </div>
                <figcaption className="text-[11px] text-[var(--text-primary)]/80">
                  FAQs: simple answers to common questions about baby sleep.
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section id="sleep-science" className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-display-md">Sleep science, not guesswork</h2>
            <p className="text-[var(--text-secondary)] max-w-xl">
              NapNap uses gentle, research‑informed patterns to suggest when sleep is likely to go
              well, without promising perfection.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 items-start">
            <div className="card p-5 space-y-3">
              <p className="text-sm font-display">What feeds our suggestions</p>
              <ul className="list-disc list-inside text-xs text-[var(--text-secondary)] space-y-1">
                <li>Age‑based wake windows for 0–18 months.</li>
                <li>How long your baby has been awake since the last sleep.</li>
                <li>Recent nap lengths and when the last nap ended.</li>
                <li>Bedtime trends over the last days and weeks.</li>
              </ul>
              <p className="text-xs text-[var(--text-secondary)]">
                As you log more naps and nights, NapNap quietly adjusts the rhythm it suggests for
                your baby.
              </p>
            </div>
            <div className="card p-5 space-y-3">
              <p className="text-sm font-display">What NapNap does not do</p>
              <ul className="list-disc list-inside text-xs text-[var(--text-secondary)] space-y-1">
                <li>No medical diagnosis or treatment recommendations.</li>
                <li>No strict training method or &ldquo;one right&rdquo; way to settle.</li>
                <li>No scores, grades, or language that implies you are failing.</li>
              </ul>
              <p className="text-xs text-[var(--text-secondary)]">
                You stay in charge of how you care for your baby. NapNap simply keeps track of the
                timing so you do not have to hold it all in your head.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-display-md">For 0–18 months</h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Newborn to toddler, with age‑aware nap transitions.
            </p>
          </div>
          <div className="card p-5 flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <p className="text-xs text-[var(--text-secondary)]">
                From short newborn naps to the final one‑nap days, NapNap adapts the suggested rhythm
                to your baby&apos;s age and recent sleep.
              </p>
            </div>
            <div className="flex gap-2 text-xs text-[var(--text-muted)]">
              <span className="tag tag-nap">Newborn</span>
              <span className="tag bg-[rgba(15,23,42,0.03)] text-[var(--text-secondary)]">
                3–6 months
              </span>
              <span className="tag tag-night">6–12 months</span>
              <span className="tag tag-active">12–18 months</span>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-display-md">Sleep guides for tired parents</h2>
            <p className="text-[var(--text-secondary)] max-w-xl">
              Learn the basics of baby sleep without getting lost in tabs. Short, practical pieces you
              can read during a contact nap.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <article className="card p-4 space-y-2">
              <h3 className="text-sm font-display">Newborn sleep 0–3 months</h3>
              <p className="text-xs text-[var(--text-secondary)]">
                What &ldquo;normal&rdquo; looks like when everything still feels upside down.
              </p>
              <details className="mt-1 text-[11px] text-[var(--text-secondary)] space-y-1">
                <summary className="cursor-pointer font-display text-[11px]">
                  Read the key points
                </summary>
                <p>
                  Newborn sleep is scattered and noisy. Short naps, day‑night confusion, and frequent
                  feeds are expected. The goal is gentle exposure to daylight in the morning and calm,
                  dim evenings.
                </p>
                <p>
                  NapNap helps by tracking how long your baby has been awake and suggesting soft
                  windows for sleep, so you no longer need to count on your fingers at 3am.
                </p>
              </details>
            </article>
            <article className="card p-4 space-y-2">
              <h3 className="text-sm font-display">The 4‑month shift</h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Why sleep suddenly changes and how to keep a gentle rhythm.
              </p>
              <details className="mt-1 text-[11px] text-[var(--text-secondary)] space-y-1">
                <summary className="cursor-pointer font-display text-[11px]">
                  Read the key points
                </summary>
                <p>
                  Around four months, babies move towards more adult‑like sleep cycles. This can mean
                  shorter naps, more wakings, and a sense that everything stopped working overnight.
                </p>
                <p>
                  Keeping wake windows steady and bedtime calm helps the new pattern settle. NapNap
                  highlights when to aim for naps and bedtime so you can stay consistent without
                  memorising charts.
                </p>
              </details>
            </article>
            <article className="card p-4 space-y-2">
              <h3 className="text-sm font-display">When will they sleep through?</h3>
              <p className="text-xs text-[var(--text-secondary)]">
                A calm look at expectations, night wakings, and what you can influence.
              </p>
              <details className="mt-1 text-[11px] text-[var(--text-secondary)] space-y-1">
                <summary className="cursor-pointer font-display text-[11px]">
                  Read the key points
                </summary>
                <p>
                  &ldquo;Sleeping through&rdquo; means different things at different ages. Many healthy
                  babies still wake at night well into the first year.
                </p>
                <p>
                  You can&apos;t control every wake‑up, but you can shape timing. Keeping naps and
                  bedtime in a gentle rhythm reduces overtiredness, which often makes nights harder.
                  That rhythm is what NapNap is built to protect.
                </p>
              </details>
            </article>
          </div>
        </section>

        <section id="faq" aria-labelledby="faq-heading" className="space-y-6">
          <div className="space-y-2">
            <h2 id="faq-heading" className="text-display-md">
              Questions, calmly answered
            </h2>
            <p className="text-[var(--text-secondary)] max-w-xl">
              A few of the things parents usually ask before they start.
            </p>
          </div>
          <div className="space-y-4">
            <details className="card p-4">
              <summary className="text-sm font-display cursor-pointer">
                Is NapNap a sleep training program?
              </summary>
              <p className="mt-2 text-xs text-[var(--text-secondary)]">
                No. NapNap helps you with timing and patterns. It does not prescribe a specific
                method. You choose how to settle your baby.
              </p>
            </details>
            <details className="card p-4">
              <summary className="text-sm font-display cursor-pointer">
                Do I have to log every single nap?
              </summary>
              <p className="mt-2 text-xs text-[var(--text-secondary)]">
                No. The app works best when you log regularly, but it is built to forgive gaps and
                late entries. Perfect data is not required.
              </p>
            </details>
            <details className="card p-4">
              <summary className="text-sm font-display cursor-pointer">
                Is my data private?
              </summary>
              <p className="mt-2 text-xs text-[var(--text-secondary)]">
                Yes. Sleep and growth data stays with your account. You control who has access
                through caregiver sharing.
              </p>
            </details>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--glass-border)] py-8 mt-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-xs text-[var(--text-muted)]">
          <div className="space-y-1">
            <p className="font-display text-sm text-[var(--text-secondary)]">
              Find your rhythm.
            </p>
            <p>NapNap is the quiet voice at 3am that tells you what comes next.</p>
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleLoginClick}
              className="btn-secondary text-xs"
            >
              Log in
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

