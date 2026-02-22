import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { getDateFnsLocale } from '../../utils/dateFnsLocale';

const TrashIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

export interface GrowthLogListItem {
  id: string;
  date: string;
  value: number;
}

interface GrowthLogListProps {
  items: GrowthLogListItem[];
  unitLabel: string;
  canEdit: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function GrowthLogList({ items, unitLabel, canEdit, onEdit, onDelete }: GrowthLogListProps) {
  const { t } = useTranslation();
  const locale = getDateFnsLocale();

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'dd MMM yyyy', { locale });
    } catch {
      return dateStr;
    }
  };

  if (items.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)] py-2">
        {t('growth.noEntries')}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-[var(--text-muted)]/10">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex items-center justify-between py-3 first:pt-0"
        >
          <button
            type="button"
            onClick={() => onEdit(item.id)}
            className="flex-1 text-left focus:outline-none focus:ring-0 rounded-lg focus-visible:ring-2 focus-visible:ring-[var(--nap-color)]"
          >
            <span className="text-[var(--text-primary)] font-display">{formatDate(item.date)}</span>
            <span className="ml-2 text-[var(--text-secondary)]">
              {item.value} {unitLabel}
            </span>
          </button>
          {canEdit && (
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--danger-color)] transition-colors"
              aria-label={t('common.delete')}
            >
              <TrashIcon />
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
