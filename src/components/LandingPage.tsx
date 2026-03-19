import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SkyBackground } from './SkyBackground';
import { supabase } from '../lib/supabase';
import { LandingFooter } from './LandingFooter';
import { LandingLanguagePicker } from './LandingLanguagePicker';

// ─── Data ────────────────────────────────────────────────────────────────────

const LANDING_FAQ_KEYS: Array<{ questionKey: string; answerKey: string }> = [
  { questionKey: 'landing.faqs.q1', answerKey: 'landing.faqs.a1' },
  { questionKey: 'landing.faqs.q2', answerKey: 'landing.faqs.a2' },
  { questionKey: 'landing.faqs.q3', answerKey: 'landing.faqs.a3' },
  { questionKey: 'landing.faqs.q4', answerKey: 'landing.faqs.a4' },
  { questionKey: 'landing.faqs.q5', answerKey: 'landing.faqs.a5' },
  { questionKey: 'landing.faqs.q6', answerKey: 'landing.faqs.a6' },
];

const TESTIMONIAL_KEYS: Array<{
  quoteKey: string;
  authorKey: string;
  contextKey: string;
}> = [
  { quoteKey: 'landing.testimonials.t1.quote', authorKey: 'landing.testimonials.t1.author', contextKey: 'landing.testimonials.t1.context' },
  { quoteKey: 'landing.testimonials.t2.quote', authorKey: 'landing.testimonials.t2.author', contextKey: 'landing.testimonials.t2.context' },
  { quoteKey: 'landing.testimonials.t3.quote', authorKey: 'landing.testimonials.t3.author', contextKey: 'landing.testimonials.t3.context' },
  { quoteKey: 'landing.testimonials.t4.quote', authorKey: 'landing.testimonials.t4.author', contextKey: 'landing.testimonials.t4.context' },
  { quoteKey: 'landing.testimonials.t5.quote', authorKey: 'landing.testimonials.t5.author', contextKey: 'landing.testimonials.t5.context' },
  { quoteKey: 'landing.testimonials.t6.quote', authorKey: 'landing.testimonials.t6.author', contextKey: 'landing.testimonials.t6.context' },
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
  const { t } = useTranslation();

  const landingFaqs = useMemo(
    () =>
      LANDING_FAQ_KEYS.map((item) => ({
        question: t(item.questionKey),
        answer: t(item.answerKey),
      })),
    [t],
  );

  const testimonials = useMemo(
    () =>
      TESTIMONIAL_KEYS.map((item) => ({
        quote: t(item.quoteKey),
        author: t(item.authorKey),
        context: t(item.contextKey),
      })),
    [t],
  );

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
      setEmailError(t('landing.emailCapture.invalidEmail'));
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
    <div className="min-h-[100dvh] bg-[var(--bg-deep)] text-[var(--text-primary)]">
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
                  {t('landing.nav.howItWorks')}
                </button>
                <button type="button" className="pressable bg-transparent border-none p-0 whitespace-nowrap" onClick={() => scrollToSection('product-showcase')}>
                  {t('landing.nav.theApp')}
                </button>
                <button type="button" className="pressable bg-transparent border-none p-0 whitespace-nowrap" onClick={() => scrollToSection('faq')}>
                  {t('landing.nav.faq')}
                </button>
              </nav>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              <LandingLanguagePicker />
              <button
                type="button"
                onClick={handleLoginClick}
                className="btn btn-primary text-base px-5 py-2.5 min-h-[40px] flex-shrink-0"
              >
                {t('landing.header.login')}
              </button>
            </div>
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
            {t('landing.mobile.home')}
          </button>
          <button type="button" onClick={() => scrollToSection('how-it-works')} className="text-left py-4 text-lg font-display text-white/80 hover:text-white transition-colors">
            {t('landing.nav.howItWorks')}
          </button>
          <button type="button" onClick={() => scrollToSection('product-showcase')} className="text-left py-4 text-lg font-display text-white/80 hover:text-white transition-colors">
            {t('landing.nav.theApp')}
          </button>
          <button type="button" onClick={() => scrollToSection('faq')} className="text-left py-4 text-lg font-display text-white/80 hover:text-white transition-colors">
            {t('landing.nav.faq')}
          </button>
          <div className="pt-2 pb-2">
            <LandingLanguagePicker />
          </div>
          <button type="button" onClick={() => { setMobileMenuOpen(false); handleLoginClick(); }} className="btn btn-primary w-full text-base py-3.5 mt-6 max-w-xs">
            {t('landing.mobile.startFree')}
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
            <p className="hero-secondary">{t('landing.hero.tagline')}</p>
            <h1 className="text-display-lg max-w-xl">
              {t('landing.hero.titleLine1')}
              <br />
              {t('landing.hero.titleLine2')}
            </h1>

            {/* CTA above the description — faster path to conversion */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <button type="button" className="btn btn-primary w-full sm:w-auto" onClick={handleLoginClick}>
                {t('landing.hero.cta.primary')}
              </button>
              <button type="button" className="btn-link text-[var(--text-secondary)]" onClick={() => scrollToSection('how-it-works')}>
                {t('landing.hero.cta.secondary')}
              </button>
            </div>

            <p className="text-[var(--text-secondary)] max-w-lg">{t('landing.hero.description')}</p>

            {/* Key reassurances surfaced near the hero — not buried in FAQ */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                'landing.reassurances.noTrainingMethod',
                'landing.reassurances.noScoresOrGrades',
                'landing.reassurances.freeToStart',
              ].map((key) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] bg-[var(--glass-bg,rgba(255,255,255,0.06))] border border-[var(--glass-border)] rounded-full px-3 py-1"
                >
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
                    <path d="M2 6.5l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {t(key)}
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
            {t('landing.testimonials.heading')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {testimonials.map((item, idx) => (
              <figure key={idx} className="card p-5">
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
            <h2 className="text-display-md">{t('landing.howItWorks.title')}</h2>
            <p className="text-[var(--text-secondary)] max-w-xl">
              {t('landing.howItWorks.description')}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="card p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--nap-glow)] flex items-center justify-center text-sm font-display text-[var(--nap-color)]">1</div>
                <h3 className="text-sm font-display">{t('landing.howItWorks.step1.title')}</h3>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                {t('landing.howItWorks.step1.description')}
              </p>
            </div>
            <div className="card p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--night-glow)] flex items-center justify-center text-sm font-display text-[var(--night-color)]">2</div>
                <h3 className="text-sm font-display">{t('landing.howItWorks.step2.title')}</h3>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                {t('landing.howItWorks.step2.description')}
              </p>
            </div>
            <div className="card p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--wake-glow)] flex items-center justify-center text-sm font-display text-[var(--wake-color)]">3</div>
                <h3 className="text-sm font-display">{t('landing.howItWorks.step3.title')}</h3>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                {t('landing.howItWorks.step3.description')}
              </p>
            </div>
          </div>
        </section>

        {/* ── Product showcase — app in device frames ── */}
        <section id="product-showcase" className="space-y-8">
          <div className="space-y-2 text-center">
            <h2 className="text-display-md">{t('landing.productShowcase.title')}</h2>
            <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
              {t('landing.productShowcase.description')}
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
                {t('landing.productShowcase.card1.caption')}
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
                {t('landing.productShowcase.card2.caption')}
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
                {t('landing.productShowcase.card3.caption')}
              </p>
            </div>
          </div>
        </section>

        {/* ── Mid-page CTA ── */}
        <section className="text-center space-y-4 py-4">
          <h2 className="text-display-sm">{t('landing.midCta.title')}</h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
            {t('landing.midCta.description')}
          </p>
          <button
            type="button"
            className="btn btn-primary px-8 py-3"
            onClick={handleLoginClick}
          >
            {t('landing.midCta.button')}
          </button>
        </section>

        {/* ── What you get — feature showcase with icon tokens (tinted band) ── */}
        <div className="bg-[var(--bg-mid)] -mx-6 px-6 py-12 rounded-none md:rounded-3xl md:mx-0 md:px-8">
          <section className="space-y-8 max-w-5xl mx-auto">
            <div className="space-y-2">
              <h2 className="text-display-md">{t('landing.whatYouGet.title')}</h2>
              <p className="text-[var(--text-secondary)] max-w-xl">
                {t('landing.whatYouGet.description')}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="card p-6 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-[var(--nap-glow)] flex items-center justify-center mb-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--nap-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <h3 className="text-base font-display">{t('landing.features.livePlan.title')}</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {t('landing.features.livePlan.description')}
                </p>
              </div>
              <div className="card p-6 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-[var(--night-glow)] flex items-center justify-center mb-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--night-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3 className="text-base font-display">{t('landing.features.sharing.title')}</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {t('landing.features.sharing.description')}
                </p>
              </div>
              <div className="card p-6 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-[var(--wake-glow)] flex items-center justify-center mb-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--wake-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <h3 className="text-base font-display">{t('landing.features.growth.title')}</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {t('landing.features.growth.description')}
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
                <h3 className="text-base font-display">{t('landing.features.report.title')}</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {t('landing.features.report.description')}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* ── Age range — lightweight text + tags ── */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-display-md">{t('landing.ageRange.title')}</h2>
            <p className="text-base text-[var(--text-secondary)] max-w-xl">
              {t('landing.ageRange.description')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="tag tag-nap">{t('landing.ageTags.newborn')}</span>
            <span className="tag tag-neutral">{t('landing.ageTags.3to6')}</span>
            <span className="tag tag-night">{t('landing.ageTags.6to12')}</span>
            <span className="tag tag-active">{t('landing.ageTags.12to18')}</span>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" aria-labelledby="faq-heading" className="space-y-6">
          <div className="space-y-2">
            <h2 id="faq-heading" className="text-display-md">{t('landing.faq.title')}</h2>
            <p className="text-base text-[var(--text-secondary)] max-w-xl">
              {t('landing.faq.subtitle')}
            </p>
          </div>
          <div className="card p-5">
            {landingFaqs.map((faq, index) => (
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
        <section aria-label={t('landing.emailCapture.sectionAriaLabel')} className="card p-6 sm:p-8 space-y-4 text-center">
          <h2 className="text-display-sm">{t('landing.emailCapture.title')}</h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto">
            {t('landing.emailCapture.description')}
          </p>
          {emailSubmitted ? (
            <p className="text-sm text-[var(--nap-color)] font-display py-2">
              {t('landing.emailCapture.submitted')}
            </p>
          ) : (
            <div className="space-y-2 max-w-sm mx-auto w-full">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <input
                  type="email"
                  value={emailValue}
                  onChange={(e) => { setEmailValue(e.target.value); setEmailError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()}
                  placeholder={t('landing.emailCapture.placeholder')}
                  className="flex-1 min-w-0 px-4 py-2.5 rounded-xl bg-[var(--glass-bg,rgba(255,255,255,0.06))] border border-[var(--glass-border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nap-color)]"
                  aria-label={t('landing.emailCapture.emailAriaLabel')}
                  disabled={emailSending}
                />
                <button
                  type="button"
                  onClick={handleEmailSubmit}
                  disabled={emailSending}
                  className="btn btn-primary px-5 py-2.5 text-sm flex-shrink-0 disabled:opacity-60"
                >
                  {emailSending ? t('landing.emailCapture.sending') : t('landing.emailCapture.notifyMe')}
                </button>
              </div>
              {emailError && (
                <p className="text-xs text-[var(--danger-color)]">{emailError}</p>
              )}
            </div>
          )}
        </section>

      </main>

      <LandingFooter onScrollToSection={scrollToSection} />
      </div>
    </div>
  );
}

