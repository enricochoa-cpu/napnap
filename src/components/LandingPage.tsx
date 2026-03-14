import { useEffect, useRef, useState } from 'react';
import { SkyBackground } from './SkyBackground';
import { supabase } from '../lib/supabase';

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
  {
    question: 'How much does NapNap cost?',
    answer:
      'NapNap is free to start. You can track sleep, get nap and bedtime suggestions, and share access with a partner at no cost.',
  },
];

const TESTIMONIALS = [
  {
    quote: 'Finally, something that tells me what to do next without judging how I got here.',
    author: 'Mireia',
    context: 'mum of a 4-month-old',
  },
  {
    quote: "I use it at 3am when my brain doesn't work. One tap and it tells me when to try again.",
    author: 'Rosa',
    context: 'mum of twins',
  },
  {
    quote: "No charts, no scores. Just 'next nap around 14:10.' That's all I needed.",
    author: 'Eva',
    context: 'mum of a 7-month-old',
  },
  {
    quote: "My partner logs naps too. We're finally on the same page without texting back and forth.",
    author: 'Marta',
    context: 'mum of a 10-month-old',
  },
  {
    quote: "It learned my baby's rhythm in two days. Now I actually plan my mornings.",
    author: 'Cristina',
    context: 'mum of a 5-month-old',
  },
  {
    quote: 'My daughter shared access with me. I know exactly when the little one needs to nap.',
    author: 'Pepi',
    context: 'grandmother and caregiver',
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export function LandingPage() {
  const [faqOpenId, setFaqOpenId] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hideMobileWordmark, setHideMobileWordmark] = useState(false);
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const [emailValue, setEmailValue] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailError, setEmailError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleLoginClick = () => { window.location.href = '/app'; };
  const scrollToTop = () => { scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileMenuOpen(false);
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
    const onScroll = () => {
      setHideMobileWordmark(el.scrollTop > MOBILE_WORDMARK_HIDE_SCROLL_THRESHOLD);
      setScrolledPastHero(el.scrollTop > 200);
    };
    onScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const handleEmailSubmit = async () => {
    if (!emailValue || !/\S+@\S+\.\S+/.test(emailValue)) {
      setEmailError('Please enter a valid email.');
      return;
    }
    setEmailSending(true);
    setEmailError('');
    try {
      await supabase.functions.invoke('waitlist-notify', { body: { email: emailValue } });
    } catch {
      // Silent — non-critical feature, don't break UX if Edge Function is down
    }
    setEmailSending(false);
    setEmailSubmitted(true);
  };

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
          <div className={`glass-nav glass-nav-landing rounded-full border border-[var(--glass-border)] flex items-center justify-between gap-6 flex-grow-0 transition-all duration-300${scrolledPastHero ? ' glass-nav-landing--solid' : ''}`}>
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
                <button type="button" className="pressable bg-transparent border-none p-0 whitespace-nowrap" onClick={() => scrollToSection('product-showcase')}>
                  The app
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
          className={`fixed focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nap-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-deep)] right-4 w-14 h-14 rounded-full flex items-center justify-center border-none cursor-pointer p-0 box-border transition-all duration-300 sm:hidden z-[60] text-[var(--text-primary)] landing-mobile-menu-btn${scrolledPastHero ? ' landing-mobile-menu-btn--solid' : ''}`}
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
          <button type="button" onClick={() => scrollToSection('product-showcase')} className="text-left py-4 text-lg font-display text-white/80 hover:text-white transition-colors">
            The app
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

        {/* ── Social proof — testimonial grid ── */}
        <section
          aria-label="What parents say"
          className="bg-[var(--bg-mid)] rounded-3xl py-12 px-6 md:px-10"
        >
          <p className="text-center text-xs tracking-[0.15em] uppercase text-[var(--nap-color)] font-display mb-6">
            Trusted by dozens of families
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {TESTIMONIALS.map((item) => (
              <figure key={item.author} className="card p-5">
                <blockquote className="text-sm text-[var(--text-primary)] italic leading-relaxed">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-3 text-xs text-[var(--text-muted)] font-display">
                  {item.author}, {item.context}
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
              NapNap uses age‑based wake windows and your baby&apos;s recent sleep to build a clear
              daily rhythm you can follow, even on very little sleep. No scores, no training method,
              no judgement.
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

        {/* ── Product showcase — app in device frames ── */}
        <section id="product-showcase" className="space-y-8">
          <div className="space-y-2 text-center">
            <h2 className="text-display-md">See it in action</h2>
            <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
              A calm dashboard that tells you exactly what comes next.
            </p>
          </div>

          <div className="flex gap-8 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-3 md:overflow-visible md:gap-10 justify-items-center">
            <div className="snap-center flex-shrink-0 w-[200px] md:w-auto space-y-3 flex flex-col items-center">
              <div className="device-frame">
                <div className="device-notch" />
                <img
                  src="/media/napnap-today-new.png"
                  alt="NapNap Today view showing NAP NOW alert and daily schedule"
                  className="device-screen"
                  loading="lazy"
                />
              </div>
              <p className="text-sm text-[var(--text-secondary)] text-center font-display">
                Your day at a glance
              </p>
            </div>
            <div className="snap-center flex-shrink-0 w-[200px] md:w-auto space-y-3 flex flex-col items-center">
              <div className="device-frame">
                <div className="device-notch" />
                <img
                  src="/media/napnap-sleeplog.png"
                  alt="NapNap Sleep log with night sleep, naps, and wake times"
                  className="device-screen"
                  loading="lazy"
                />
              </div>
              <p className="text-sm text-[var(--text-secondary)] text-center font-display">
                Every nap and night, logged
              </p>
            </div>
            <div className="snap-center flex-shrink-0 w-[200px] md:w-auto space-y-3 flex flex-col items-center">
              <div className="device-frame">
                <div className="device-notch" />
                <img
                  src="/media/napnap-trends.png"
                  alt="NapNap Trends view with nap averages and sleep distribution charts"
                  className="device-screen"
                  loading="lazy"
                />
              </div>
              <p className="text-sm text-[var(--text-secondary)] text-center font-display">
                Patterns, not spreadsheets
              </p>
            </div>
          </div>
        </section>

        {/* ── Mid-page CTA ── */}
        <section className="text-center space-y-4 py-4">
          <h2 className="text-display-sm">Ready to find your rhythm?</h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
            Free to start. No credit card. No sleep training method required.
          </p>
          <button
            type="button"
            className="btn btn-primary px-8 py-3"
            onClick={handleLoginClick}
          >
            Create your free sleep plan
          </button>
        </section>

        {/* ── What you get — feature showcase with icon tokens (tinted band) ── */}
        <div className="bg-[var(--bg-mid)] -mx-6 px-6 py-12 rounded-none md:rounded-3xl md:mx-0 md:px-8">
          <section className="space-y-8 max-w-5xl mx-auto">
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
        </div>

        {/* ── Age range — lightweight text + tags ── */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-display-md">For 0–18 months</h2>
            <p className="text-base text-[var(--text-secondary)] max-w-xl">
              From short newborn naps to the final one‑nap days, NapNap adapts the suggested rhythm
              to your baby&apos;s age and recent sleep.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="tag tag-nap">Newborn</span>
            <span className="tag tag-neutral">3–6 months</span>
            <span className="tag tag-night">6–12 months</span>
            <span className="tag tag-active">12–18 months</span>
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

        {/* ── Email capture ── */}
        <section aria-label="Stay in the loop" className="card p-6 sm:p-8 space-y-4 text-center">
          <h2 className="text-display-sm">Not ready yet? That&apos;s fine.</h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto">
            Leave your email and we&apos;ll send one short note when something worth knowing about is
            ready. No drip campaigns.
          </p>
          {emailSubmitted ? (
            <p className="text-sm text-[var(--nap-color)] font-display py-2">
              Got it. We&apos;ll be in touch gently.
            </p>
          ) : (
            <div className="space-y-2 max-w-sm mx-auto w-full">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <input
                  type="email"
                  value={emailValue}
                  onChange={(e) => { setEmailValue(e.target.value); setEmailError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()}
                  placeholder="your@email.com"
                  className="flex-1 min-w-0 px-4 py-2.5 rounded-xl bg-[var(--glass-bg,rgba(255,255,255,0.06))] border border-[var(--glass-border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nap-color)]"
                  aria-label="Email address"
                  disabled={emailSending}
                />
                <button
                  type="button"
                  onClick={handleEmailSubmit}
                  disabled={emailSending}
                  className="btn btn-primary px-5 py-2.5 text-sm flex-shrink-0 disabled:opacity-60"
                >
                  {emailSending ? 'Sending...' : 'Notify me'}
                </button>
              </div>
              {emailError && (
                <p className="text-xs text-[var(--danger-color)]">{emailError}</p>
              )}
            </div>
          )}
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--glass-border)] py-10 mt-8">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr_0.8fr] gap-8">
            {/* Brand column */}
            <div className="space-y-3">
              <p className="text-display-sm text-[var(--text-primary)]">NapNap</p>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                The quiet voice at 3am that tells you what comes next.
              </p>
              <div className="flex gap-3 pt-1">
                <a href="#" aria-label="X (Twitter)" className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="#" aria-label="Instagram" className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Product + Legal columns — side by side on mobile */}
            <div className="grid grid-cols-2 md:contents gap-8">
              <div className="space-y-3">
                <p className="text-[10px] tracking-[0.15em] uppercase text-[var(--nap-color)] font-display">Product</p>
                <nav className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                  <button type="button" className="text-left hover:text-[var(--text-secondary)] transition-colors" onClick={() => scrollToSection('how-it-works')}>How it works</button>
                  <button type="button" className="text-left hover:text-[var(--text-secondary)] transition-colors" onClick={() => scrollToSection('product-showcase')}>The app</button>
                  <button type="button" className="text-left hover:text-[var(--text-secondary)] transition-colors" onClick={() => scrollToSection('faq')}>FAQ</button>
                </nav>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] tracking-[0.15em] uppercase text-[var(--nap-color)] font-display">Legal</p>
                <nav className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                  <a href="#" className="hover:text-[var(--text-secondary)] transition-colors">Privacy</a>
                  <a href="#" className="hover:text-[var(--text-secondary)] transition-colors">Terms</a>
                  <a href="#" className="hover:text-[var(--text-secondary)] transition-colors">Contact</a>
                </nav>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-8 pt-4 border-t border-[var(--glass-border)] text-center text-xs text-[var(--text-muted)]">
            &copy; 2026 NapNap. Made with care in Barcelona.
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}

