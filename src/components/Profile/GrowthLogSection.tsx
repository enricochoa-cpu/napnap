import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { getDateFnsLocale } from '../../utils/dateFnsLocale';
import { GrowthLogList, type GrowthLogListItem } from './GrowthLogList';

const ChevronDown = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ChevronUp = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

interface GrowthLogSectionProps {
  titleKey: string;
  items: GrowthLogListItem[];
  unitLabel: string;
  canEdit: boolean;
  onAdd: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

/** Compact by default: shows latest entry + Add + "View all (N)". Expand to see full list. */
export function GrowthLogSection({
  titleKey,
  items,
  unitLabel,
  canEdit,
  onAdd,
  onEdit,
  onDelete,
}: GrowthLogSectionProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const locale = getDateFnsLocale();

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'dd MMM yyyy', { locale });
    } catch {
      return dateStr;
    }
  };

  // Items are assumed ascending by date; latest is last
  const latest = items.length > 0 ? items[items.length - 1] : null;
  // For expanded list, show newest first (reverse)
  const listItems = [...items].reverse();

  return (
    <div className="rounded-2xl bg-[var(--bg-soft)] border border-[var(--glass-border)] p-4">
      <div className="flex items-center justify-between mb-3">
        <label className="block text-[11px] font-medium text-[var(--text-muted)] font-display uppercase tracking-wider">
          {t(titleKey)}
        </label>
        {canEdit && (
          <button
            type="button"
            onClick={onAdd}
            className="text-sm font-display font-medium text-[var(--nap-color)]"
          >
            {t('growth.add')}
          </button>
        )}
      </div>

      {!expanded ? (
        <>
          {latest ? (
            <div className="flex items-center justify-between py-2">
              <span className="text-[var(--text-primary)] font-display">
                {latest.value} {unitLabel}
                <span className="text-[var(--text-muted)] font-normal ml-2">· {formatDate(latest.date)}</span>
              </span>
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)] py-2">
              {t('growth.noEntries')}
            </p>
          )}
          {items.length > 1 && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="mt-2 flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            >
              {t('growth.viewAllEntries', { count: items.length })}
              <ChevronDown />
            </button>
          )}
        </>
      ) : (
        <>
          <GrowthLogList
            items={listItems}
            unitLabel={unitLabel}
            canEdit={canEdit}
            onEdit={onEdit}
            onDelete={onDelete}
          />
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="mt-3 flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            {t('growth.showLess')}
            <ChevronUp />
          </button>
        </>
      )}
    </div>
  );
}
