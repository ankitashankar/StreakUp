import { useMemo, useState } from 'react';
import { useData } from '@/context/useData';
import { Icon } from '@/components/Icon';
import { parseDate } from '@/utils/dates';

function shiftMonth(monthStr: string, delta: number): string {
  const [y, m] = monthStr.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(monthStr: string): string {
  const [y, m] = monthStr.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/** Intensity level by questions solved: 0 = none, 1 = light, 2 = medium, 3+ = dark. */
function levelFor(count: number): 0 | 1 | 2 | 3 {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  return 3;
}

const CELL_COLORS: Record<0 | 1 | 2 | 3, string> = {
  0: 'bg-stone-100 text-stone-400 dark:bg-zinc-800/60 dark:text-zinc-600',
  1: 'bg-sage-300 text-sage-900 dark:bg-sage-800 dark:text-sage-100',
  2: 'bg-sage-500 text-white dark:bg-sage-600 dark:text-white',
  3: 'bg-sage-700 text-white dark:bg-sage-400 dark:text-zinc-900',
};

export function DsaContributionCalendar() {
  const { dsaRecords, today } = useData();
  const [selectedMonth, setSelectedMonth] = useState(today.slice(0, 7));

  const countMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of dsaRecords) map.set(r.date, r.count);
    return map;
  }, [dsaRecords]);

  const [calYear, calMonth] = selectedMonth.split('-').map(Number);
  const daysInMonth = new Date(calYear, calMonth, 0).getDate();
  const firstDayOfMonth = parseDate(`${selectedMonth}-01`);
  const lead = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1;
  const isCurrentMonth = selectedMonth >= today.slice(0, 7);

  return (
    <section className="card p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-ink dark:text-zinc-100">
          {monthLabel(selectedMonth)}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSelectedMonth((m) => shiftMonth(m, -1))}
            className="btn-icon"
            aria-label="Previous month"
          >
            <Icon name="ChevronLeft" size={18} />
          </button>
          <button
            onClick={() => setSelectedMonth((m) => shiftMonth(m, 1))}
            disabled={isCurrentMonth}
            className="btn-icon disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next month"
          >
            <Icon name="ChevronRight" size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center text-[10px] font-semibold uppercase tracking-wide text-ink-muted dark:text-zinc-600 mb-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {Array.from({ length: lead }).map((_, i) => (
          <div key={`lead-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const d = i + 1;
          const dateStr = `${selectedMonth}-${String(d).padStart(2, '0')}`;
          const count = countMap.get(dateStr) ?? 0;
          const level = levelFor(count);
          const isFuture = dateStr > today;
          const isToday = dateStr === today;

          return (
            <div
              key={dateStr}
              title={`${dateStr}: ${count} question${count !== 1 ? 's' : ''} solved`}
              className={[
                'flex aspect-square items-center justify-center rounded-lg text-sm transition-all',
                isFuture ? 'text-stone-300 dark:text-zinc-700' : CELL_COLORS[level],
                isToday ? 'ring-2 ring-sage-400 ring-offset-1 dark:ring-offset-zinc-900' : '',
              ].join(' ')}
            >
              {d}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-3 text-[11px] text-ink-muted dark:text-zinc-500">
        <span>Less</span>
        {([0, 1, 2, 3] as const).map((l) => (
          <span key={l} className={`h-3 w-3 rounded ${CELL_COLORS[l]}`} />
        ))}
        <span>More</span>
        <span className="ml-auto tabular-nums">
          {Array.from(countMap.entries())
            .filter(([date]) => date.startsWith(selectedMonth))
            .reduce((sum, [, c]) => sum + c, 0)}{' '}
          questions this month
        </span>
      </div>
    </section>
  );
}
