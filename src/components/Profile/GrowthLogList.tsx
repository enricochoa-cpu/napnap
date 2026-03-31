import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { getDateFnsLocale } from '../../utils/dateFnsLocale';
import { TrashIcon } from '../icons/ActionIcons';

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
