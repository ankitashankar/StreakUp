import { useMemo } from 'react';
import { useData } from '@/context/useData';
import { countsByDate } from '@/utils/streaks';
import { lastNDays, addDays, todayDateStr, parseDate, monthName, isSameMonth } from '@/utils/dates';

/** GitHub-style activity heatmap for the last ~20 weeks. */
export function Heatmap() {
  const { completions, tz } = useData();
  const today = todayDateStr(tz);

  const weeks = useMemo(() => {
    // Build 20 weeks ending this week (columns), 7 days each (rows, Mon-Sun).
    const totalDays = 20 * 7;
    const days = lastNDays(totalDays, tz); // oldest first
    // align so the first column starts on Monday
    const first = parseDate(days[0]);
    const firstDay = first.getDay();
    const lead = firstDay === 0 ? 6 : firstDay - 1; // empty cells before first Monday
    const padded: (string | null)[] = [...Array(lead).fill(null), ...days];
    const cols: (string | null)[][] = [];
    for (let i = 0; i < padded.length; i += 7) cols.push(padded.slice(i, i + 7));
    return cols;
  }, [tz]);

  const counts = useMemo(() => {
    const all = weeks.flat().filter((d): d is string => d !== null);
    return countsByDate(completions, all);
  }, [completions, weeks]);

  const level = (n: number) => {
    if (n <= 0) return 'bg-stone-200/70 dark:bg-zinc-800';
    if (n === 1) return 'bg-sage-200 dark:bg-sage-900';
    if (n === 2) return 'bg-sage-300 dark:bg-sage-700';
    if (n === 3) return 'bg-sage-400 dark:bg-sage-600';
    return 'bg-sage-600 dark:bg-sage-400';
  };

  // month labels across the top
  const monthLabels = weeks.map((col, i) => {
    const first = col.find((d): d is string => d !== null);
    if (!first) return '';
    const show = i === 0 || !isSameMonth(first, weeks[i - 1].find((d): d is string => d !== null) || '');
    return show ? monthName(first).slice(0, 3) : '';
  });

  const total = counts.size > 0 ? Array.from(counts.values()).reduce((a, b) => a + b, 0) : 0;
  const activeDays = Array.from(counts.values()).filter((v) => v > 0).length;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-ink dark:text-zinc-100">Activity Heatmap</h3>
          <p className="text-xs text-ink-muted dark:text-zinc-500 mt-0.5">{activeDays} active days · {total} habit completions in last 20 weeks</p>
        </div>
      </div>
      <div className="overflow-x-auto scrollbar-thin pb-1">
        <div className="inline-block min-w-full">
          <div className="flex gap-[3px] mb-1 pl-6">
            {monthLabels.map((m, i) => (
              <div key={i} className="w-[14px] text-[9px] text-ink-muted dark:text-zinc-500" style={{ minWidth: 14 }}>{m}</div>
            ))}
          </div>
          <div className="flex gap-[3px]">
            <div className="flex flex-col gap-[3px] pr-1.5">
              {['Mon', '', 'Wed', '', 'Fri', '', 'Sun'].map((d, i) => (
                <div key={i} className="h-[14px] text-[9px] leading-[14px] text-ink-muted dark:text-zinc-500 w-4 text-right">{d}</div>
              ))}
            </div>
            {weeks.map((col, ci) => (
              <div key={ci} className="flex flex-col gap-[3px]">
                {Array.from({ length: 7 }).map((_, ri) => {
                  const d = col[ri] || null;
                  if (!d) return <div key={ri} className="h-[14px] w-[14px] rounded-[3px]" />;
                  const n = counts.get(d) || 0;
                  const isFuture = d > today;
                  return (
                    <div
                      key={ri}
                      title={`${d}: ${n}/4 habits`}
                      className={`h-[14px] w-[14px] rounded-[3px] ${isFuture ? 'bg-transparent' : level(n)} transition-colors`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-ink-muted dark:text-zinc-500">
            <span>Less</span>
            {['bg-stone-200/70 dark:bg-zinc-800', 'bg-sage-200 dark:bg-sage-900', 'bg-sage-300 dark:bg-sage-700', 'bg-sage-400 dark:bg-sage-600', 'bg-sage-600 dark:bg-sage-400'].map((c, i) => (
              <div key={i} className={`h-[12px] w-[12px] rounded-[3px] ${c}`} />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Weekly bar chart: completed vs total possible per week. */
export function WeeklyChart({ weeks = 6 }: { weeks?: number }) {
  const { completions, tz } = useData();
  const series = useMemo(() => {
    // reuse weeklySeries logic inline-light
    const today = todayDateStr(tz);
    const day = parseDate(today).getDay();
    const offset = day === 0 ? -6 : 1 - day;
    let monday = addDays(today, offset);
    const out: { weekStart: string; completed: number; total: number }[] = [];
    for (let i = 0; i < weeks; i++) {
      const sunday = addDays(monday, 6);
      const completed = completions.filter((c) => c.date >= monday && c.date <= (sunday < today ? sunday : today)).length;
      const days = Math.min(7, Math.round((parseDate(today).getTime() - parseDate(monday).getTime()) / 86400000) + 1);
      out.push({ weekStart: monday, completed, total: days * 4 });
      monday = addDays(monday, -7);
    }
    return out.reverse();
  }, [completions, tz, weeks]);

  const maxTotal = Math.max(...series.map((s) => s.total), 1);

  return (
    <div className="card p-5">
      <h3 className="font-display font-semibold text-ink dark:text-zinc-100">Weekly Activity</h3>
      <p className="text-xs text-ink-muted dark:text-zinc-500 mt-0.5 mb-4">Completed vs total possible habits per week</p>
      <div className="flex items-end justify-between gap-3 h-40">
        {series.map((s) => {
          const pct = s.total > 0 ? (s.completed / s.total) * 100 : 0;
          const heightPct = (s.total / maxTotal) * 100;
          const fillPct = s.total > 0 ? (s.completed / s.total) * 100 : 0;
          const start = new Date(s.weekStart);
          const label = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          return (
            <div key={s.weekStart} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full flex-1 items-end justify-center">
                <div className="relative w-full max-w-[42px] rounded-lg bg-stone-200 dark:bg-zinc-800 overflow-hidden" style={{ height: `${heightPct}%` }} title={`${s.completed}/${s.total} (${Math.round(pct)}%)`}>
                  <div
                    className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-sage-600 to-sage-400 transition-all duration-700"
                    style={{ height: `${fillPct}%` }}
                  />
                </div>
              </div>
              <div className="text-[10px] text-ink-muted dark:text-zinc-500 text-center leading-tight">{label}</div>
              <div className="text-[10px] font-semibold text-ink dark:text-zinc-300">{s.completed}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
