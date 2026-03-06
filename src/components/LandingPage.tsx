import { useEffect, useRef, useState } from 'react';
import { SkyBackground } from './SkyBackground';

// ─── Data ────────────────────────────────────────────────────────────────────

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

const SOCIAL_PROOF = [
  {
    quote: 'Finally, something that tells me what to do next without judging how I got here.',
    author: 'Priya, mum of a 4-month-old',
  },
  {
    quote: "I use it at 3am when my brain doesn't work. One tap and it tells me when to try again.",
    author: 'James, dad of twins',
  },
  {
    quote: "No charts, no scores. Just \"next nap around 14:10.\" That's all I needed.",
    author: 'Sofia, mum of a 7-month-old',
  },
];

// Three video slots for the floating hero composition.
// Left: tallest, tilts left, anchors to bottom.
// Center: mid-height, no tilt, raised (bleeds off top).
// Right: smallest, tilts right, mid-high anchor.
const HERO_VIDEO_SLOTS = [
  {
    playlist: ['/media/train.mp4', '/media/sleeping.mp4', '/media/park.mp4'],
    wrapperClass: 'absolute left-0 bottom-0',
    videoClass:
      'w-[148px] sm:w-[172px] aspect-[9/16] rounded-[1.25rem] object-cover shadow-[0_20px_60px_rgba(0,0,0,0.55)] -rotate-[3deg] origin-bottom-left',
    ariaLabel: 'Lifestyle clip 1',
  },
  {
    playlist: ['/media/sleep-time.mp4', '/media/home-2.mp4', '/media/holidays.mp4'],
    wrapperClass: 'absolute left-1/2 -translate-x-1/2 top-0',
    videoClass:
      'w-[132px] sm:w-[152px] aspect-[9/16] rounded-[1.25rem] object-cover shadow-[0_24px_70px_rgba(0,0,0,0.6)]',
    ariaLabel: 'Lifestyle clip 2',
  },
  {
    playlist: ['/media/sleep-time-2.mp4', '/media/home-3.mp4', '/media/train.mp4'],
    wrapperClass: 'absolute right-0 top-[12%]',
    videoClass:
      'w-[118px] sm:w-[136px] aspect-[9/16] rounded-[1.25rem] object-cover shadow-[0_16px_50px_rgba(0,0,0,0.45)] rotate-[3.5deg] origin-top-right',
    ariaLabel: 'Lifestyle clip 3',
  },
];

const MOBILE_WORDMARK_HIDE_SCROLL_THRESHOLD = 80;

// ─── Small components ─────────────────────────────────────────────────────────

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
      className={`flex-shrink-0 text-[var(--text-muted)] transition-transform duration-200 ${
        isOpen ? 'rotate-180' : ''
      }`}
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

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-[var(--wake-color)]" aria-hidden>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

// ─── Single cycling video slot ────────────────────────────────────────────────

function CyclingVideo({
  playlist,
  wrapperClass,
  videoClass,
  ariaLabel,
}: {
  playlist: string[];
  wrapperClass: string;
  videoClass: string;
  ariaLabel: string;
}) {
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.load();
    el.play().catch(() => {});
  }, [index]);

  return (
    <div className={wrapperClass}>
      <video
        ref={ref}
        className={videoClass}
        src={playlist[index]}
        autoPlay
        muted
        playsInline
        onEnded={() => setIndex((i) => (i + 1) % playlist.length)}
        aria-label={ariaLabel}
      />
    </div>
  );
}

// ─── Staggered floating hero videos ──────────────────────────────────────────
// No card, no glass, no border. Three videos absolutely positioned in a
// fixed-height container — like polaroids casually fanned on a dark table.

function HeroVideos() {
  return (
    <div
      className="relative w-full h-[360px] sm:h-[440px]"
      aria-label="Short clips of parents using NapNap"
      role="group"
    >
      {HERO_VIDEO_SLOTS.map((slot, i) => (
        <CyclingVideo
          key={i}
          playlist={slot.playlist}
          wrapperClass={slot.wrapperClass}
          videoClass={slot.videoClass}
          ariaLabel={slot.ariaLabel}
        />
      ))}
    </div>
  );
}

// ─── Paired cycling videos (lower sections) ───────────────────────────────────

const PAIRED_VIDEO_CLASS =
  'w-full sm:flex-1 sm:min-w-0 aspect-[9/16] rounded-[1.5rem] border border-[var(--glass-border)] shadow-[0_12px_40px_rgba(0,0,0,0.35)] object-cover';

function PairedCyclingVideos({
  videosLeft,
  videosRight,
  className,
  ariaLabelLeft,
  ariaLabelRight,
}: {
  videosLeft: string[];
  videosRight: string[];
  className?: string;
  ariaLabelLeft?: string;
  ariaLabelRight?: string;
}) {
  const [leftIndex, setLeftIndex] = useState(0);
  const [rightIndex, setRightIndex] = useState(0);
  const leftRef = useRef<HTMLVideoElement>(null);
  const rightRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = leftRef.current;
    if (!el) return;
    el.load();
    el.play().catch(() => {});
  }, [leftIndex]);

  useEffect(() => {
    const el = rightRef.current;
    if (!el) return;
    el.load();
    el.play().catch(() => {});
  }, [rightIndex]);

  return (
    <>
      <video
        ref={leftRef}
        className={className ?? PAIRED_VIDEO_CLASS}
        src={videosLeft[leftIndex]}
        autoPlay
        muted
        playsInline
        onEnded={() => setLeftIndex((i) => (i + 1) % videosLeft.length)}
        aria-label={ariaLabelLeft}
      />
      <video
        ref={rightRef}
        className={className ?? PAIRED_VIDEO_CLASS}
        src={videosRight[rightIndex]}
        autoPlay
        muted
        playsInline
        onEnded={() => setRightIndex((i) => (i + 1) % videosRight.length)}
        aria-label={ariaLabelRight}
      />
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function LandingPage() {
  const [faqOpenId, setFaqOpenId] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hideMobileWordmark, setHideMobileWordmark] = useState(false);
  const [emailValue, setEmailValue] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleLoginClick = () => { window.location.href = '/app'; };
  const scrollToTop = () => { scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileMenuOpen(false);
  };

  const handleEmailSubmit = () => {
    if (emailValue.trim()) setEmailSubmitted(true);
  };

  // Force morning palette on the landing page without affecting /app
  useEffect(() => {
    const root = document.documentElement;
    const prev = Array.from(root.classList);
    if (!root.classList.contains('theme-morning')) root.classList.add('theme-morning');
    return () => { root.className = prev.join(' '); };
  }, []);

  // Hide mobile wordmark once the user scrolls — only burger stays visible
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () =>
      setHideMobileWordmark(el.scrollTop > MOBILE_WORDMARK_HIDE_SCROLL_THRESHOLD);
    onScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] text-[var(--text-primary)]">
      <SkyBackground theme="morning" />

      {/* ── Header ── */}
      <header
        className="fixed left-0 right-0 z-50 px-4 sm:px-6 flex items-center"
        style={{ top: 'calc(40px + env(safe-area-inset-top, 0px))' }}
      >
        {/* Mobile: wordmark fades on scroll */}
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

        {/* Desktop: glass pill nav */}
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
                <button type="button" className="pressable bg-transparent border-none p-0 whitespace-nowrap" onClick={() => scrollToSection('how-it-works')}>
                  How it works
                </button>
                <button type="button" className="pressable bg-transparent border-none p-0 whitespace-nowrap" onClick={() => scrollToSection('sleep-science')}>
                  Sleep science
                </button>
                <button type="button" className="pressable bg-transparent border-none p-0 whitespace-nowrap" onClick={() => scrollToSection('faq')}>
                  FAQ
                </button>
              </nav>
            </div>
            <button type="button" onClick={handleLoginClick} className="btn btn-primary text-base px-5 py-2.5 min-h-[40px] flex-shrink-0">
              Log in
            </button>
          </div>
        </div>

        {/* Mobile burger */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((o) => !o)}
          className="fixed focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nap-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-deep)] right-4 w-14 h-14 rounded-full flex items-center justify-center border-none cursor-pointer p-0 box-border transition-colors duration-250 sm:hidden z-[60] text-[var(--text-primary)] landing-mobile-menu-btn"
          style={{ top: 'calc(40px + env(safe-area-inset-top, 0px))' }}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          <MenuIcon open={mobileMenuOpen} />
        </button>
      </header>

      {/* ── Mobile menu — wordmark inside for brand grounding ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`sm:hidden fixed inset-0 z-[55] landing-mobile-menu-fullscreen transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <nav className="flex flex-col justify-center min-h-full px-6 pt-24 pb-12 gap-2" aria-label="Page sections">
          <span className="text-display-lg text-white mb-4 select-none" aria-hidden>NapNap</span>
          <button type="button" onClick={() => { scrollToTop(); setMobileMenuOpen(false); }} className="text-left py-4 text-lg font-display text-white hover:opacity-90 transition-opacity">
            Home
          </button>
          <button type="button" onClick={() => scrollToSection('how-it-works')} className="text-left py-4 text-lg font-display text-white/80 hover:text-white transition-colors">
            How it works
          </button>
          <button type="button" onClick={() => scrollToSection('sleep-science')} className="text-left py-4 text-lg font-display text-white/80 hover:text-white transition-colors">
            Sleep science
          </button>
          <button type="button" onClick={() => scrollToSection('faq')} className="text-left py-4 text-lg font-display text-white/80 hover:text-white transition-colors">
            FAQ
          </button>
          <button type="button" onClick={() => { setMobileMenuOpen(false); handleLoginClick(); }} className="btn btn-primary w-full text-base py-3.5 mt-6 max-w-xs">
            Start free
          </button>
        </nav>
      </div>

      {/* Inner scroll container: fixes desktop scroll (wheel/trackpad). Same pattern as App.tsx lesson 6.7. */}
      <div
        ref={scrollRef}
        className={`min-h-[100dvh] overflow-x-hidden ${
          mobileMenuOpen ? 'overflow-hidden' : 'overflow-y-auto'
        }`}
        style={{ height: '100dvh' }}
      >
      <main className="main-below-landing-nav max-w-5xl mx-auto px-6 pb-20 space-y-16">

        {/* ── Hero ── */}
        <section className="grid gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-center">
          <div className="space-y-6">
            <p className="hero-secondary">Rhythmic baby sleep companion</p>
            <h1 className="text-display-lg max-w-xl">
              Stop guessing naps.
              <br />
              Move with your baby&apos;s rhythm.
            </h1>

            {/* CTA above the description — faster path to conversion */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <button type="button" className="btn btn-primary w-full sm:w-auto" onClick={handleLoginClick}>
                Create your free sleep plan
              </button>
              <button type="button" className="btn-link text-[var(--text-secondary)]" onClick={() => scrollToSection('how-it-works')}>
                See how it works
              </button>
            </div>

            <p className="text-[var(--text-secondary)] max-w-lg">
              NapNap turns wake windows and sleep patterns into a calm plan. One place to see
              when to nap, when to sleep, and when to just breathe.
            </p>

            {/* Key reassurances surfaced near the hero — not buried in FAQ */}
            <div className="flex flex-wrap gap-2 pt-1">
              {['No sleep training method', 'No scores or grades', 'Free to start'].map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] bg-[var(--glass-bg,rgba(255,255,255,0.06))] border border-[var(--glass-border)] rounded-full px-3 py-1"
                >
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
                    <path d="M2 6.5l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Staggered floating videos — no card, no background, just the videos on the page */}
          <div className="relative flex items-center justify-center md:justify-end">
            <HeroVideos />
          </div>
        </section>

        {/* ── Social proof ── */}
        <section aria-label="What parents say" className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-0.5" aria-label="5 stars">
              {Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} />)}
            </div>
            <span className="text-sm text-[var(--text-muted)]">Loved by tired parents</span>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {SOCIAL_PROOF.map((item) => (
              <figure key={item.author} className="card p-5 space-y-3 flex flex-col justify-between">
                <blockquote className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
                <figcaption className="text-xs text-[var(--text-muted)] font-display">
                  — {item.author}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* ── How it works ── */}
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
                <div className="w-8 h-8 rounded-full bg-[var(--nap-glow)] flex items-center justify-center text-sm font-display text-[var(--nap-color)]">1</div>
                <h3 className="text-sm font-display">Tell us about your baby</h3>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                Add a name and date of birth. NapNap starts from age‑based wake windows tailored to their stage.
              </p>
            </div>
            <div className="card p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--night-glow)] flex items-center justify-center text-sm font-display text-[var(--night-color)]">2</div>
                <h3 className="text-sm font-display">Log sleep with one thumb</h3>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                Tap once to start a nap or night sleep and once to wake. Logging is fast, forgiving, and built for one‑hand use on a busy day.
              </p>
            </div>
            <div className="card p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--wake-glow)] flex items-center justify-center text-sm font-display text-[var(--wake-color)]">3</div>
                <h3 className="text-sm font-display">Follow the next step</h3>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                See today&apos;s naps and bedtime in one simple plan. Suggestions update as your baby sleeps and grows, so you always know what comes next.
              </p>
            </div>
          </div>
        </section>

        {/* ── What you get — feature showcase with icon tokens ── */}
        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-display-md">What you get</h2>
            <p className="text-[var(--text-secondary)] max-w-xl">
              A calm set of tools that work together to keep your baby&apos;s sleep on a gentle rhythm.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="card p-6 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--nap-glow)] flex items-center justify-center mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--nap-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3 className="text-base font-display">Live nap and bedtime plan</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                See today&apos;s naps, bedtime, and wake windows in one simple view. Updates as your baby sleeps.
              </p>
            </div>
            <div className="card p-6 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--night-glow)] flex items-center justify-center mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--night-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="text-base font-display">Multi‑caregiver sharing</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Share access with partners or caregivers so everyone works from the same plan.
              </p>
            </div>
            <div className="card p-6 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--wake-glow)] flex items-center justify-center mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--wake-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <h3 className="text-base font-display">Growth tracking</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Log weight, height, and head circumference alongside sleep, without extra clutter.
              </p>
            </div>
            <div className="card p-6 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--nap-glow)] flex items-center justify-center mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--nap-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <h3 className="text-base font-display">30‑day sleep report</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                A gentle narrative on the last month to spot patterns without chart overload.
              </p>
            </div>
          </div>
        </section>

        {/* ── Sleep science ── */}
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
              <ul className="list-disc pl-5 text-sm text-[var(--text-secondary)] space-y-1">
                <li>Age‑based wake windows for 0–18 months.</li>
                <li>How long your baby has been awake since the last sleep.</li>
                <li>Recent nap lengths and when the last nap ended.</li>
                <li>Bedtime trends over the last days and weeks.</li>
              </ul>
              <p className="text-sm text-[var(--text-secondary)]">
                As you log more naps and nights, NapNap quietly adjusts the rhythm it suggests for your baby.
              </p>
            </div>
            <div className="card p-5 space-y-3">
              <p className="text-sm font-display">What NapNap does not do</p>
              <ul className="list-disc pl-5 text-sm text-[var(--text-secondary)] space-y-1">
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

        {/* ── Age range ── */}
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
            <div className="flex-shrink-0 flex gap-3 w-full md:w-[360px]">
              <PairedCyclingVideos
                videosLeft={['/media/park.mp4', '/media/sleep-time-2.mp4', '/media/sleeping.mp4']}
                videosRight={['/media/sleep-time.mp4', '/media/holidays.mp4', '/media/home-3.mp4']}
                className="flex-1 min-w-0 aspect-[9/16] rounded-[1.5rem] border border-[var(--glass-border)] shadow-[0_12px_40px_rgba(0,0,0,0.2)] object-cover"
                ariaLabelLeft="Short clips: baby and park moments"
                ariaLabelRight="Short clips: sleep and calm moments"
              />
            </div>
          </div>
        </section>

        {/* ── Sleep guides — editorial style, distinct from features ── */}
        <section className="space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-display uppercase tracking-widest text-[var(--text-muted)] mb-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              Reading material
            </div>
            <h2 className="text-display-md">Sleep guides for tired parents</h2>
            <p className="text-base text-[var(--text-secondary)] max-w-xl">
              Short, practical pieces you can read during a contact nap.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <article className="card p-5 space-y-3 border-l-2 border-[var(--nap-color)]">
              <h3 className="text-sm font-display">Newborn sleep 0–3 months</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                What &ldquo;normal&rdquo; looks like when everything still feels upside down.
              </p>
              <ul className="list-disc pl-5 text-sm text-[var(--text-secondary)] space-y-0.5">
                <li>Short naps and day‑night confusion are expected.</li>
                <li>Gentle morning light and calm evenings help.</li>
                <li>NapNap tracks wake time and suggests when sleep is likely to work.</li>
              </ul>
            </article>
            <article className="card p-5 space-y-3 border-l-2 border-[var(--night-color)]">
              <h3 className="text-sm font-display">The 4‑month shift</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Why sleep suddenly changes and how to keep a gentle rhythm.
              </p>
              <ul className="list-disc pl-5 text-sm text-[var(--text-secondary)] space-y-0.5">
                <li>Sleep cycles change; shorter naps and more wakings are common.</li>
                <li>Steady wake windows and calm bedtime help the new pattern settle.</li>
                <li>NapNap shows when to aim for naps and bedtime so you stay consistent.</li>
              </ul>
            </article>
            <article className="card p-5 space-y-3 border-l-2 border-[var(--wake-color)]">
              <h3 className="text-sm font-display">When will they sleep through?</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                A calm look at expectations, night wakings, and what you can influence.
              </p>
              <ul className="list-disc pl-5 text-sm text-[var(--text-secondary)] space-y-0.5">
                <li>&ldquo;Sleeping through&rdquo; means different things at different ages.</li>
                <li>You can shape timing: a gentle nap and bedtime rhythm reduces overtiredness.</li>
                <li>NapNap helps protect that rhythm so nights are easier to manage.</li>
              </ul>
            </article>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" aria-labelledby="faq-heading" className="space-y-6">
          <div className="space-y-2">
            <h2 id="faq-heading" className="text-display-md">Questions, calmly answered</h2>
            <p className="text-base text-[var(--text-secondary)] max-w-xl">
              A few of the things parents usually ask before they start.
            </p>
          </div>
          <div className="card p-5">
            {LANDING_FAQS.map((faq, index) => (
              <div key={index} className="border-b border-[var(--text-muted)]/30 last:border-b-0">
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
                <div className={`grid transition-all duration-200 ease-in-out ${faqOpenId === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
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

        {/* ── Email capture — retains warm intent before visitors leave ── */}
        <section aria-label="Stay in the loop" className="card p-6 sm:p-8 space-y-4 text-center">
          <h2 className="text-display-sm">Not ready yet? That&apos;s fine.</h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto">
            Leave your email and we&apos;ll send one short note when something worth knowing about is
            ready. No drip campaigns.
          </p>
          {emailSubmitted ? (
            <p className="text-sm text-[var(--nap-color)] font-display py-2">
              ✓ Got it. We&apos;ll be in touch gently.
            </p>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto w-full">
              <input
                type="email"
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()}
                placeholder="your@email.com"
                className="flex-1 min-w-0 px-4 py-2.5 rounded-xl bg-[var(--glass-bg,rgba(255,255,255,0.06))] border border-[var(--glass-border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nap-color)]"
                aria-label="Email address"
              />
              <button type="button" onClick={handleEmailSubmit} className="btn btn-primary px-5 py-2.5 text-sm flex-shrink-0">
                Notify me
              </button>
            </div>
          )}
        </section>

      </main>

      {/* ── Footer — "Start free" not "Log in" for warm visitors ── */}
      <footer className="border-t border-[var(--glass-border)] py-8 mt-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-sm text-[var(--text-muted)]">
          <div className="space-y-1">
            <p className="font-display text-sm text-[var(--text-secondary)]">Find your rhythm.</p>
            <p>NapNap is the quiet voice at 3am that tells you what comes next.</p>
          </div>
          <button type="button" onClick={handleLoginClick} className="btn btn-primary text-sm px-5 py-2.5 self-start md:self-auto flex-shrink-0">
            Start free
          </button>
        </div>
      </footer>
      </div>
    </div>
  );
}