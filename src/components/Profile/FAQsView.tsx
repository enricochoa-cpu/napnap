import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { SubViewHeader } from './SubViewHeader';

interface FAQsViewProps {
  onBack: () => void;
}

const FAQ_IDS = ['about', '1', '2', '3', '4', '5', '6', '7', '8', 'science'] as const;

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
  const { t } = useTranslation();
  const [openId, setOpenId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <SubViewHeader title={t('support.faqs')} subtitle={t('support.faqsSubtitle')} onBack={onBack} />

      <div className="card p-5">
        {FAQ_IDS.map((id) => (
          <AccordionItem
            key={id}
            question={t(`faq.${id}.question`)}
            answer={t(`faq.${id}.answer`)}
            isOpen={openId === id}
            onToggle={() => handleToggle(id)}
          />
        ))}
      </div>
    </div>
  );
}
