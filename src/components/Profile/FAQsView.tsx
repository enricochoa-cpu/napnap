import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { SubViewHeader } from './SubViewHeader';

interface FAQsViewProps {
  onBack: () => void;
}

// Hardcoded FAQs - no database needed for static content
const FAQS = [
  {
    id: '1',
    question: 'What is a wake window?',
    answer: `A **wake window** is the amount of time your baby can comfortably stay awake between sleep periods.

Wake windows vary by age:
- **0-4 weeks**: 45-60 minutes
- **4-12 weeks**: 60-90 minutes
- **3-4 months**: 75-120 minutes
- **5-7 months**: 2-3 hours
- **8-12 months**: 2.5-4 hours
- **12-18 months**: 4-6 hours

Watching for your baby's sleepy cues within these windows helps prevent overtiredness.`,
  },
  {
    id: '2',
    question: 'What is a micro-nap and should I be concerned?',
    answer: `A **micro-nap** (or "cat nap") is a short sleep lasting only 20-30 minutes, typically just one sleep cycle.

**Why it happens:**
- Baby wakes between sleep cycles and hasn't learned to self-soothe
- Undertired or overtired at nap time
- Sleep environment issues (too bright, noisy)

**Is it normal?**
Yes! Micro-naps are very common, especially under 5-6 months. Many babies naturally consolidate naps around 6 months as their sleep matures.

**Tips:**
- Ensure appropriate wake windows
- Create a dark, quiet sleep environment
- Stay consistent with your routine`,
  },
  {
    id: '3',
    question: 'What is a sleep regression?',
    answer: `A **sleep regression** is a period when a baby who was sleeping well suddenly has trouble falling asleep, wakes frequently, or takes shorter naps.

**Common regression ages:**
- **4 months**: Sleep architecture changes permanently
- **8-10 months**: Separation anxiety, crawling, standing
- **12 months**: Walking, dropping to one nap
- **18 months**: Toddler independence, language explosion

**How long do they last?**
Typically 2-6 weeks if you stay consistent with your approach.

**What helps:**
- Maintain consistent routines
- Offer extra comfort without creating new sleep associations
- Adjust wake windows if needed
- Be patient – this is temporary!`,
  },
  {
    id: '4',
    question: 'How do I know if my baby is overtired?',
    answer: `An **overtired baby** has been awake too long and their body produces cortisol (stress hormone), making it *harder* to fall and stay asleep.

**Signs of overtiredness:**
- Rubbing eyes, pulling ears
- Yawning excessively
- Fussiness and irritability
- Arching back, stiff limbs
- Hyperactive behavior (counterintuitive!)
- Fighting sleep desperately

**Prevention:**
- Learn your baby's wake windows for their age
- Watch for early sleepy cues
- Start the nap routine *before* they seem tired

**Recovery:**
An earlier bedtime (even 30-60 minutes) can help break the overtired cycle.`,
  },
  {
    id: '5',
    question: 'What are sleepy cues?',
    answer: `**Sleepy cues** are signals your baby gives when they're getting tired and ready for sleep.

**Early cues** (ideal time to start nap routine):
- Staring off into space
- Less active, calmer movements
- Losing interest in toys or people
- Slight eye redness

**Late cues** (may already be overtired):
- Eye rubbing
- Yawning
- Ear or hair pulling
- Fussiness

**Very late cues** (overtired):
- Crying
- Arching back
- Hyperactivity
- Difficult to soothe

**Tip:** Aim to catch the early cues. If you wait for yawning and eye rubbing, you may have already missed the optimal sleep window.`,
  },
  {
    id: '6',
    question: 'Is it normal for night sleep to be longer than naps?',
    answer: `**Yes, absolutely!** Night sleep and day sleep develop differently.

**Why nights are longer:**
- Melatonin (sleep hormone) is produced in darkness
- Baby's circadian rhythm naturally supports longer night stretches
- Sleep pressure builds throughout the day

**Typical patterns:**
- **Newborns**: Night and day may be confused initially
- **2-3 months**: Longest stretch starts appearing at night (4-6 hours)
- **4-6 months**: Night sleep consolidates (8-12 hours with feeds)
- **6+ months**: Many babies can sleep 10-12 hours at night

**Naps remain shorter** because daytime sleep pressure is lower and environmental factors (light, noise) affect sleep differently.

Don't worry if naps are 30-45 minutes while nights are much longer – this is biologically normal!`,
  },
];

const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

interface AccordionItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

function AccordionItem({ question, answer, isOpen, onToggle }: AccordionItemProps) {
  return (
    <div className="border-b border-[var(--text-muted)]/30 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-4 text-left transition-colors"
        aria-expanded={isOpen}
      >
        <span className="font-display font-medium text-[var(--text-primary)] text-[15px] leading-snug pr-2">
          {question}
        </span>
        <span className="flex-shrink-0 text-[var(--text-muted)]">
          <ChevronIcon isOpen={isOpen} />
        </span>
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="pb-4 pr-8">
            <div className="prose-faq text-[var(--text-secondary)] text-sm leading-relaxed">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                  strong: ({ children }) => (
                    <strong className="font-semibold text-[var(--text-primary)]">{children}</strong>
                  ),
                  ul: ({ children }) => <ul className="list-disc pl-4 mb-3 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-4 mb-3 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="text-[var(--text-secondary)]">{children}</li>,
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      className="text-[var(--nap-color)] underline underline-offset-2"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                  em: ({ children }) => <em className="italic">{children}</em>,
                }}
              >
                {answer}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FAQsView({ onBack }: FAQsViewProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <SubViewHeader title="FAQs" subtitle="Let's solve your doubts" onBack={onBack} />

      {/* FAQ Accordion List */}
      <div className="card p-5">
        {FAQS.map((faq) => (
          <AccordionItem
            key={faq.id}
            question={faq.question}
            answer={faq.answer}
            isOpen={openId === faq.id}
            onToggle={() => handleToggle(faq.id)}
          />
        ))}
      </div>
    </div>
  );
}
