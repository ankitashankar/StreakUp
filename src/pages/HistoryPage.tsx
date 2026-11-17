import { useMemo, useState } from 'react';
import { useData } from '@/context/useData';
import { SECONDARY_HABITS } from '@/types';
import { Icon } from '@/components/Icon';
import { parseDate, formatDate, todayDateStr, prettyDate } from '@/utils/dates';
import { dsaRecordMap, secondaryHabitsForDate, activitiesForDate, allProductiveDates } from '@/utils/streaks';
import type { ProductiveCategory } from '@/types';

const CATEGORY_COLORS: Record<ProductiveCategory, string> = {
  'Learning': 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400',
  'Reading': 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  'Technical Event': 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
  'Podcast/Video': 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
  'Skill Development': 'bg-sage-50 text-sage-600 dark:bg-sage-950/40 dark:text-sage-400',
  'Other': 'bg-stone-100 text-ink-muted dark:bg-zinc-800 dark:text-zinc-400',
};

const CATEGORY_ICONS: Record<ProductiveCategory, string> = {
  'Learning': 'BookOpen',
  'Reading': 'BookOpen',
  'Technical Event': 'Users',
  'Podcast/Video': 'Video',
  'Skill Development': 'GraduationCap',
  'Other': 'Sparkles',
};

export function HistoryPage() {
  const { completions, dsaRecords, productiveActivities, data, tz } = useData();
  const today = todayDateStr(tz);
  const targetGoal = data.settings.dsaTargetGoal;
  const minGoal = data.settings.dsaMinGoal;

  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [selected, setSelected] = useState<string>(today);

  const dsaMap = useMemo(() => dsaRecordMap(dsaRecords), [dsaRecords]);
  const productiveDates = useMemo(() => allProductiveDates(completions, productiveActivities), [completions, productiveActivities]);

  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
  const firstDay = new Date(cursor.year, cursor.month, 1);
  const lead = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

  const cells: (string | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(formatDate(new Date(cursor.year, cursor.month, d)));
  }

  const monthLabel = firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const goPrev = () => setCursor((c) => (c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 }));
  const goNext = () => setCursor((c) => (c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 }));

  const selectedDsa = dsaMap.get(selected);
  const selectedActivities = activitiesForDate(productiveActivities, selected);
  const selectedSecondary = secondaryHabitsForDate(completions, selected);
  const isProductiveDay = productiveDates.has(selected);
  const isFuture = selected > today;

  // Calendar dot color: productive (amber), DSA min goal met (sage), nothing (none)
  const dotColor = (date: string): string => {
    const productive = productiveDates.has(date);
    const dsaRec = dsaMap.get(date);
    const dsa = !!dsaRec && dsaRec.count > 0;
    if (productive && dsa) return 'combined';
    if (dsa) return 'dsa';
    if (productive) return 'productive';
    return '';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink dark:text-zinc-100 sm:text-3xl">History</h1>
        <p className="text-sm text-ink-muted dark:text-zinc-500 mt-1">Browse past days and see your activity. Past records are read-only.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        {/* Calendar */}
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <button onClick={goPrev} className="btn-icon" aria-label="Previous month"><Icon name="ChevronLeft" size={18} /></button>
            <h3 className="font-display font-semibold text-ink dark:text-zinc-100">{monthLabel}</h3>
            <button onClick={goNext} className="btn-icon" aria-label="Next month"><Icon name="ChevronRight" size={18} /></button>
          </div>
          <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-ink-muted dark:text-zinc-500 mb-1">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {cells.map((date, i) => {
              if (!date) return <div key={i} />;
              const future = date > today;
              const isSel = date === selected;
              const kind = dotColor(date);
              const dayNum = parseDate(date).getDate();
              const combined = kind === 'combined';
              return (
                <button
                  key={date}
                  onClick={() => setSelected(date)}
                  disabled={future}
                  className={`relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-lg text-sm transition-all ${
                    isSel ? 'ring-2 ring-sage-500 ring-offset-1 dark:ring-offset-zinc-900 font-bold' : ''
                  } ${future ? 'text-stone-300 dark:text-zinc-700 cursor-not-allowed' : 'text-ink-soft hover:bg-stone-100 dark:text-zinc-300 dark:hover:bg-zinc-800'}`}
                  style={
                    combined
                      ? {
                          background:
                            'linear-gradient(135deg, rgba(251,191,36,0.45) 0%, rgba(251,191,36,0.45) 49.5%, rgba(101,134,30,0.4) 50.5%, rgba(101,134,30,0.4) 100%)',
                        }
                      : undefined
                  }
                >
                  {(kind === 'dsa' || kind === 'productive') && (
                    <span className={`absolute inset-0 rounded-lg ${kind === 'dsa' ? 'bg-sage-500/40 dark:bg-sage-500/30' : 'bg-amber-400/50 dark:bg-amber-500/40'}`} />
                  )}
                  <span className="relative">{dayNum}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-ink-muted dark:text-zinc-500">
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-amber-400/50 dark:bg-amber-500/40" /> Productive day</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-sage-500/40 dark:bg-sage-500/30" /> DSA day</span>
            <span className="flex items-center gap-1.5">
              <span
                className="h-3 w-3 rounded"
                style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.45) 0%, rgba(251,191,36,0.45) 49.5%, rgba(101,134,30,0.4) 50.5%, rgba(101,134,30,0.4) 100%)' }}
              /> Both done</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700" /> No activity</span>
          </div>
        </div>

        {/* Day detail */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-ink dark:text-zinc-100">{prettyDate(selected)}</h3>
            {isProductiveDay && !isFuture && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                <Icon name="Flame" size={13} /> Productive Day
              </span>
            )}
          </div>

          {isFuture ? (
            <p className="mt-4 text-sm text-ink-muted dark:text-zinc-500">Future dates can't be completed in advance. Show up when the day comes.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {/* DSA section */}
              <div className="rounded-xl border border-stone-200 p-4 dark:border-zinc-800">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sage-50 text-sage-600 dark:bg-sage-950/40 dark:text-sage-400">
                    <Icon name="Binary" size={16} />
                  </div>
                  <span className="text-sm font-semibold text-ink dark:text-zinc-100">DSA Practice</span>
                </div>
                {selectedDsa ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-ink-soft dark:text-zinc-400">Questions Solved</span>
                      <span className="font-display font-bold text-ink dark:text-zinc-100 tabular-nums">{selectedDsa.count}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GoalBadge met={selectedDsa.minGoalMet && selectedDsa.count > 0} label={`Min ≥ ${minGoal}`} />
                      <GoalBadge met={selectedDsa.targetMet && selectedDsa.count >= targetGoal} label={`Target ≥ ${targetGoal}`} target />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-ink-muted dark:text-zinc-500">No DSA practice recorded.</p>
                )}
              </div>

              {/* Secondary habits */}
              <div className="rounded-xl border border-stone-200 p-4 dark:border-zinc-800">
                <div className="text-xs font-semibold uppercase tracking-wide text-ink-muted dark:text-zinc-500 mb-3">Other Activities</div>
                <ul className="flex flex-col gap-2">
                  {SECONDARY_HABITS.map((h) => {
                    const done = selectedSecondary[h.id];
                    return (
                      <li key={h.id} className={`flex items-center gap-3 rounded-lg border p-2.5 ${done ? 'border-sage-300 bg-sage-50/60 dark:border-sage-800 dark:bg-sage-950/30' : 'border-stone-200 dark:border-zinc-800'}`}>
                        <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${done ? 'bg-sage-500 text-white' : 'bg-stone-100 text-stone-400 dark:bg-zinc-800 dark:text-zinc-600'}`}>
                          <Icon name={done ? 'Check' : h.icon} size={14} />
                        </div>
                        <span className={`text-sm font-medium flex-1 ${done ? 'text-sage-700 dark:text-sage-300' : 'text-ink-soft dark:text-zinc-400'}`}>{h.name}</span>
                        {done ? <span className="text-xs font-semibold text-sage-600 dark:text-sage-400">Done</span> : <span className="text-xs text-ink-muted dark:text-zinc-500">Not done</span>}
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Productive activities */}
              {selectedActivities.length > 0 && (
                <div className="rounded-xl border border-stone-200 p-4 dark:border-zinc-800">
                  <div className="text-xs font-semibold uppercase tracking-wide text-ink-muted dark:text-zinc-500 mb-3">Productive Activities</div>
                  <ul className="flex flex-col gap-2">
                    {selectedActivities.map((a) => (
                      <li key={a.id} className="flex items-start gap-3 rounded-lg border border-stone-200 p-2.5 dark:border-zinc-800">
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${CATEGORY_COLORS[a.category]}`}>
                          <Icon name={CATEGORY_ICONS[a.category]} size={14} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-ink dark:text-zinc-100">{a.name}</span>
                            <span className={`chip ${CATEGORY_COLORS[a.category]}`}>{a.category}</span>
                          </div>
                          {a.description && <p className="text-xs text-ink-muted dark:text-zinc-500 mt-0.5">{a.description}</p>}
                          {a.duration && <span className="text-xs text-ink-muted dark:text-zinc-500 mt-0.5 inline-flex items-center gap-1"><Icon name="Clock" size={11} />{a.duration}</span>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-xs text-ink-muted dark:text-zinc-500">Past records are read-only — they preserve your history accurately.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GoalBadge({ met, label, target }: { met: boolean; label: string; target?: boolean }) {
  if (met) {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${target ? 'bg-sage-50 text-sage-600 dark:bg-sage-950/40 dark:text-sage-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'}`}>
        <Icon name="CheckCircle2" size={12} /> {label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-ink-muted dark:bg-zinc-800 dark:text-zinc-500">
      <Icon name="Circle" size={12} /> {label}
    </span>
  );
}
