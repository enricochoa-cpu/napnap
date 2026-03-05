import { useEffect, useRef, useState } from 'react';
import { SkyBackground } from './SkyBackground';

const LANDING_FAQS: { question: string; answer: string }[] = [
  {
    question: 'What is NapNap?',
    answer:
      'NapNap is a sleep tracker for babies (0–18 months) that helps you log naps and night sleep and get simple, age-based suggestions for when your baby might need to sleep next. We focus on clear next steps—like "Next nap around 13:42" or "Bedtime around 19:30"—with a calm, non-judgmental tone.',
  },
  {
    question: 'Is NapNap a sleep training program?',
    answer:
      'No. NapNap helps you with timing and patterns. It does not prescribe a specific method. You choose how to settle your baby.',
  },
  {
    question: 'What is a wake window?',
    answer:
      'A wake window is the amount of time your baby can comfortably stay awake between sleep periods. They vary by age—from about 45–60 minutes for newborns to several hours for older babies. NapNap uses age-based wake windows to suggest when to offer the next nap or bedtime.',
  },
  {
    question: 'Do I have to log every single nap?',
    answer:
      'No. The app works best when you log regularly, but it is built to forgive gaps and late entries. Perfect data is not required.',
  },
  {
    question: 'Is my data private?',
    answer:
      'Yes. Sleep and growth data stays with your account. You control who has access through caregiver sharing.',
  },
];

function FaqChevron({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`flex-shrink-0 text-[var(--text-muted)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ) : (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

const MOBILE_WORDMARK_HIDE_SCROLL_THRESHOLD = 80;

export function LandingPage() {
  const [faqOpenId, setFaqOpenId] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hideMobileWordmark, setHideMobileWordmark] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleLoginClick = () => {
    window.location.href = '/app';
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileMenuOpen(false);
  };

  const handleMenuLogin = () => {
    setMobileMenuOpen(false);
    handleLoginClick();
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

  // On mobile: hide "NapNap" wordmark when user scrolls down so only the burger icon stays visible.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      setHideMobileWordmark(el.scrollTop > MOBILE_WORDMARK_HIDE_SCROLL_THRESHOLD);
    };
    onScroll(); // set initial state
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      ref={scrollRef}
      className={`min-h-screen bg-[var(--bg-deep)] text-[var(--text-primary)] ${mobileMenuOpen ? 'overflow-hidden' : 'overflow-y-auto'}`}
    >
      <SkyBackground theme="morning" />

      {/* Mobile: just "NapNap" top-left (same font/color as hero h1). Desktop: full glass bar */}
      <header
        className="fixed left-0 right-0 z-50 px-4 sm:px-6 flex items-center"
        style={{ top: 'calc(40px + env(safe-area-inset-top, 0px))' }}
      >
        {/* Mobile only: wordmark fades out on scroll so only burger remains visible */}
        <button
          type="button"
          onClick={scrollToTop}
          className={`sm:hidden pressable p-0 border-0 bg-transparent text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nap-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-deep)] rounded transition-opacity duration-200 ${
            hideMobileWordmark ? 'opacity-0 pointer-events-none' : ''
          }`}
          aria-label="Scroll to top"
        >
          <span className="text-display-lg text-[var(--text-primary)]">NapNap</span>
        </button>

        {/* Desktop only: glass pill bar with logo + nav + Log in */}
        <div className="hidden sm:flex max-w-5xl mx-auto w-full">
          <div className="glass-nav glass-nav-landing rounded-full border border-[var(--glass-border)] flex items-center justify-between gap-6 flex-grow-0">
            <div className="flex items-center gap-6 min-w-0" aria-label="NapNap">
              <button
                type="button"
                onClick={scrollToTop}
                className="pressable p-0 border-0 bg-transparent rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nap-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-deep)]"
                aria-label="Scroll to top"
              >
                <span className="text-display-lg text-[var(--text-primary)]">NapNap</span>
              </button>
              <nav className="flex items-center gap-4 text-[var(--text-secondary)] text-base">
                <button
                  type="button"
                  className="pressable bg-transparent border-none p-0 whitespace-nowrap"
                  onClick={() => scrollToSection('how-it-works')}
                >
                  How it works
                </button>
                <button
                  type="button"
                  className="pressable bg-transparent border-none p-0 whitespace-nowrap"
                  onClick={() => scrollToSection('sleep-science')}
                >
                  Sleep science
                </button>
                <button
                  type="button"
                  className="pressable bg-transparent border-none p-0 whitespace-nowrap"
                  onClick={() => scrollToSection('faq')}
                >
                  FAQ
                </button>
              </nav>
            </div>
            <button
              type="button"
              onClick={handleLoginClick}
              className="btn btn-primary text-base px-5 py-2.5 min-h-[40px] flex-shrink-0"
            >
              Log in
            </button>
          </div>
        </div>

        {/* Mobile menu button: fixed top-right, glass pill (Napper-style) */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="fixed focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nap-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-deep)] right-4 w-14 h-14 rounded-full flex items-center justify-center border-none cursor-pointer p-0 box-border transition-colors duration-250 sm:hidden z-[60] text-[var(--text-primary)] landing-mobile-menu-btn"
          style={{ top: 'calc(40px + env(safe-area-inset-top, 0px))' }}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          <MenuIcon open={mobileMenuOpen} />
        </button>
      </header>

      {/* Mobile menu: full-screen takeover (Napper-style). Only menu + Log in visible; gradient hides page. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`sm:hidden fixed inset-0 z-[55] landing-mobile-menu-fullscreen transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <nav
          className="flex flex-col justify-center min-h-full px-6 pt-24 pb-12 gap-2"
          aria-label="Page sections"
        >
          <button
            type="button"
            onClick={() => {
              scrollToTop();
              setMobileMenuOpen(false);
            }}
            className="text-left py-4 text-lg font-display text-white hover:opacity-90 transition-opacity"
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('how-it-works')}
            className="text-left py-4 text-lg font-display text-white/80 hover:text-white hover:opacity-90 transition-colors"
          >
            How it works
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('sleep-science')}
            className="text-left py-4 text-lg font-display text-white/80 hover:text-white hover:opacity-90 transition-colors"
          >
            Sleep science
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('faq')}
            className="text-left py-4 text-lg font-display text-white/80 hover:text-white hover:opacity-90 transition-colors"
          >
            FAQ
          </button>
          <button
            type="button"
            onClick={handleMenuLogin}
            className="btn btn-primary w-full text-base py-3.5 mt-6 max-w-xs"
          >
            Log in
          </button>
        </nav>
      </div>

      {/* Top padding clears fixed bar (Napper-style: 126px mobile, 196px lg) */}
      <main className="main-below-landing-nav max-w-5xl mx-auto px-6 pb-20 space-y-16">
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
                <div className="w-8 h-8 rounded-full bg-[var(--nap-glow)] flex items-center justify-center text-sm font-display text-[var(--nap-color)]">
                  1
                </div>
                <h3 className="text-sm font-display">Tell us about your baby</h3>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                Add a name and date of birth. NapNap starts from age‑based wake windows tailored to
                their stage.
              </p>
            </div>
            <div className="card p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--night-glow)] flex items-center justify-center text-sm font-display text-[var(--night-color)]">
                  2
                </div>
                <h3 className="text-sm font-display">Log sleep with one thumb</h3>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                Tap once to start a nap or night sleep and once to wake. Logging is fast, forgiving,
                and built for one‑hand use on a busy day.
              </p>
            </div>
            <div className="card p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--wake-glow)] flex items-center justify-center text-sm font-display text-[var(--wake-color)]">
                  3
                </div>
                <h3 className="text-sm font-display">Follow the next step</h3>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
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
              <p className="text-sm text-[var(--text-secondary)]">
                See today&apos;s naps, bedtime, and wake windows in one simple view.
              </p>
            </div>
            <div className="card p-5 space-y-2">
              <h3 className="text-sm font-display">Multi‑caregiver sharing</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Share access with partners or caregivers so everyone works from the same plan.
              </p>
            </div>
            <div className="card p-5 space-y-2">
              <h3 className="text-sm font-display">Growth tracking</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Log weight, height, and head circumference alongside sleep, without extra clutter.
              </p>
            </div>
            <div className="card p-5 space-y-2">
              <h3 className="text-sm font-display">30‑day sleep report</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Get a gentle narrative report on the last month to spot patterns without charts overload.
              </p>
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
              <ul className="list-disc list-inside text-sm text-[var(--text-secondary)] space-y-1">
                <li>Age‑based wake windows for 0–18 months.</li>
                <li>How long your baby has been awake since the last sleep.</li>
                <li>Recent nap lengths and when the last nap ended.</li>
                <li>Bedtime trends over the last days and weeks.</li>
              </ul>
              <p className="text-sm text-[var(--text-secondary)]">
                As you log more naps and nights, NapNap quietly adjusts the rhythm it suggests for
                your baby.
              </p>
            </div>
            <div className="card p-5 space-y-3">
              <p className="text-sm font-display">What NapNap does not do</p>
              <ul className="list-disc list-inside text-sm text-[var(--text-secondary)] space-y-1">
                <li>No medical diagnosis or treatment recommendations.</li>
                <li>No strict training method or &ldquo;one right&rdquo; way to settle.</li>
                <li>No scores, grades, or language that implies you are failing.</li>
              </ul>
              <p className="text-sm text-[var(--text-secondary)]">
                You stay in charge of how you care for your baby. NapNap simply keeps track of the
                timing so you do not have to hold it all in your head.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-display-md">For 0–18 months</h2>
            <p className="text-base text-[var(--text-secondary)]">
              Newborn to toddler, with age‑aware nap transitions.
            </p>
          </div>
          <div className="card p-5 flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex-1 space-y-4">
              <p className="text-sm text-[var(--text-secondary)]">
                From short newborn naps to the final one‑nap days, NapNap adapts the suggested rhythm
                to your baby&apos;s age and recent sleep.
              </p>
              <div className="flex flex-wrap gap-2 text-sm text-[var(--text-muted)]">
                <span className="tag tag-nap">Newborn</span>
                <span className="tag tag-neutral">3–6 months</span>
                <span className="tag tag-night">6–12 months</span>
                <span className="tag tag-active">12–18 months</span>
              </div>
            </div>
            <div className="flex-shrink-0 w-full md:w-[280px] rounded-[1.5rem] overflow-hidden border border-[var(--glass-border)] shadow-[0_12px_40px_rgba(0,0,0,0.2)]">
              <video
                className="w-full aspect-[9/16] object-cover"
                autoPlay
                muted
                playsInline
                loop
                aria-label="Short clip showing NapNap used with a baby"
              >
                <source src="/media/hero-right-1.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-display-md">Sleep guides for tired parents</h2>
            <p className="text-base text-[var(--text-secondary)] max-w-xl">
              Learn the basics of baby sleep without getting lost in tabs. Short, practical pieces you
              can read during a contact nap.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <article className="card p-4 space-y-2">
              <h3 className="text-sm font-display">Newborn sleep 0–3 months</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                What &ldquo;normal&rdquo; looks like when everything still feels upside down.
              </p>
              <ul className="list-disc list-inside text-sm text-[var(--text-secondary)] space-y-0.5">
                <li>Short naps and day‑night confusion are expected.</li>
                <li>Gentle morning light and calm evenings help.</li>
                <li>NapNap tracks wake time and suggests when sleep is likely to work.</li>
              </ul>
            </article>
            <article className="card p-4 space-y-2">
              <h3 className="text-sm font-display">The 4‑month shift</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Why sleep suddenly changes and how to keep a gentle rhythm.
              </p>
              <ul className="list-disc list-inside text-sm text-[var(--text-secondary)] space-y-0.5">
                <li>Sleep cycles change; shorter naps and more wakings are common.</li>
                <li>Steady wake windows and calm bedtime help the new pattern settle.</li>
                <li>NapNap shows when to aim for naps and bedtime so you stay consistent.</li>
              </ul>
            </article>
            <article className="card p-4 space-y-2">
              <h3 className="text-sm font-display">When will they sleep through?</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                A calm look at expectations, night wakings, and what you can influence.
              </p>
              <ul className="list-disc list-inside text-sm text-[var(--text-secondary)] space-y-0.5">
                <li>&ldquo;Sleeping through&rdquo; means different things at different ages; many babies wake at night into the first year.</li>
                <li>You can shape timing: a gentle nap and bedtime rhythm reduces overtiredness.</li>
                <li>NapNap helps protect that rhythm so nights are easier to manage.</li>
              </ul>
            </article>
          </div>
        </section>

        <section id="faq" aria-labelledby="faq-heading" className="space-y-6">
          <div className="space-y-2">
            <h2 id="faq-heading" className="text-display-md">
              Questions, calmly answered
            </h2>
            <p className="text-base text-[var(--text-secondary)] max-w-xl">
              A few of the things parents usually ask before they start.
            </p>
          </div>
          <div className="card p-5">
            {LANDING_FAQS.map((faq, index) => (
              <div
                key={index}
                className="border-b border-[var(--text-muted)]/30 last:border-b-0"
              >
                <button
                  type="button"
                  onClick={() => setFaqOpenId(faqOpenId === index ? null : index)}
                  className="w-full flex items-center justify-between gap-4 py-4 text-left"
                  aria-expanded={faqOpenId === index}
                >
                  <span className="font-display font-medium text-[var(--text-primary)] text-[15px] leading-snug pr-2">
                    {faq.question}
                  </span>
                  <FaqChevron isOpen={faqOpenId === index} />
                </button>
                <div
                  className={`grid transition-all duration-200 ease-in-out ${
                    faqOpenId === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="pb-4 pr-8 text-sm text-[var(--text-secondary)] leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--glass-border)] py-8 mt-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-sm text-[var(--text-muted)]">
          <div className="space-y-1">
            <p className="font-display text-sm text-[var(--text-secondary)]">
              Find your rhythm.
            </p>
            <p>NapNap is the quiet voice at 3am that tells you what comes next.</p>
          </div>
          <button
            type="button"
            onClick={handleLoginClick}
            className="pressable text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline-offset-2 hover:underline transition-colors self-start"
          >
            Log in
          </button>
        </div>
      </footer>
    </div>
  );
}

