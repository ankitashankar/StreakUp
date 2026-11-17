import { useMemo, useState } from 'react';
import { useData } from '@/context/useData';
import { PERMANENT_HABITS } from '@/types';
import { Icon } from '@/components/Icon';
import {
  dsaStreak,
  totalDsaQuestions,
  productiveStreak,
  allProductiveDates,
  dsaRecordMap,
  activitiesForDate,
} from '@/utils/streaks';
import { startOfWeek, addDays, parseDate, prettyDate } from '@/utils/dates';
import { DsaContributionCalendar } from '@/components/DsaContributionCalendar';

function shiftMonth(monthStr: string, delta: number): string {
  const [y, m] = monthStr.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(monthStr: string): string {
  const [y, m] = monthStr.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function ProgressPage() {
  const { completions, productiveActivities, dsaRecords, data, tz, today } = useData();
  const minGoal = data.settings.dsaMinGoal;
  const targetGoal = data.settings.dsaTargetGoal;

  const dsaStreakStats = useMemo(() => dsaStreak(dsaRecords, tz), [dsaRecords, tz]);
  const totalDsa = useMemo(() => totalDsaQuestions(dsaRecords), [dsaRecords]);
  const pStreak = useMemo(
    () => productiveStreak(completions, productiveActivities, tz),
    [completions, productiveActivities, tz],
  );

  const [selectedMonth, setSelectedMonth] = useState(today.slice(0, 7));
  const [selectedDate, setSelectedDate] = useState(today);

  const allProductive = useMemo(
    () => allProductiveDates(completions, productiveActivities),
    [completions, productiveActivities],
  );

  const [calYear, calMonth] = selectedMonth.split('-').map(Number);
  const daysInMonth = new Date(calYear, calMonth, 0).getDate();
  const firstDayOfMonth = parseDate(`${selectedMonth}-01`);
  const lead = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1;
  const isCurrentMonth = selectedMonth >= today.slice(0, 7);

  const dayCompletions = useMemo(
    () => new Set(completions.filter((c) => c.date === selectedDate).map((c) => c.habitId)),
    [completions, selectedDate],
  );
  const dayDsa = useMemo(
    () => dsaRecords.find((r) => r.date === selectedDate) ?? null,
    [dsaRecords, selectedDate],
  );
  const dayActivities = useMemo(
    () => activitiesForDate(productiveActivities, selectedDate),
    [productiveActivities, selectedDate],
  );
  const isDayProductive = allProductive.has(selectedDate);

  const [weekOffset, setWeekOffset] = useState(0);
  const currentWeekStart = startOfWeek(today);
  const chartWeekStart = addDays(currentWeekStart, weekOffset * 7);
  const recMap = useMemo(() => dsaRecordMap(dsaRecords), [dsaRecords]);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(chartWeekStart, i));
  const maxCount = Math.max(...weekDays.map((d) => recMap.get(d)?.count ?? 0), targetGoal, 1);
  const canGoNextWeek = weekOffset < 0;

  const weekStartLabel = parseDate(chartWeekStart).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  const weekEndLabel = parseDate(addDays(chartWeekStart, 6)).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold text-ink dark:text-zinc-100 sm:text-3xl">
        Your Progress
      </h1>

      {/* Compact statistics */}
      <div className="grid gap-6 sm:grid-cols-2">
        <StatGroup
          icon="Zap"
          title="Overall Productivity"
          accent="text-amber-600 dark:text-amber-400"
          stats={[
            { value: pStreak.current, label: 'current' },
            { value: pStreak.best, label: 'best' },
            { value: pStreak.totalProductiveDays, label: 'days' },
          ]}
        />
        <StatGroup
          icon="Binary"
          title="DSA Progress"
          accent="text-sage-600 dark:text-sage-400"
          stats={[
            { value: dsaStreakStats.current, label: 'current' },
            { value: dsaStreakStats.best, label: 'best' },
            { value: totalDsa, label: 'solved' },
          ]}
        />
      </div>

      {/* Monthly calendars: productivity + DSA contribution, side by side */}
      <div className="grid gap-6 lg:grid-cols-2">
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
            const productive = allProductive.has(dateStr);
            const isFuture = dateStr > today;
            const isToday = dateStr === today;
            const isSelected = dateStr === selectedDate;

            return (
              <button
                key={dateStr}
                disabled={isFuture}
                onClick={() => setSelectedDate(dateStr)}
                className={[
                  'flex aspect-square items-center justify-center rounded-lg text-sm transition-all',
                  isFuture
                    ? 'text-stone-300 dark:text-zinc-700 cursor-default'
                    : productive
                      ? 'bg-sage-600 text-white font-medium hover:bg-sage-500 dark:bg-sage-500/30 dark:text-sage-200 dark:hover:bg-sage-500/45'
                      : 'text-stone-400 dark:text-zinc-600 hover:bg-stone-100 dark:hover:bg-zinc-800/50',
                  isToday ? 'ring-2 ring-sage-400 ring-offset-1 dark:ring-offset-zinc-900' : '',
                  isSelected && !isToday
                    ? 'ring-2 ring-sage-300 dark:ring-sage-400/50 ring-offset-1 dark:ring-offset-zinc-900'
                    : '',
                ].join(' ')}
              >
                {d}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-4 text-[11px] text-ink-muted dark:text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-sage-600 dark:bg-sage-500/30" /> Productive
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded border border-stone-300 dark:border-zinc-700" /> No activity
          </span>
        </div>

        {/* Day summary */}
        <div className="mt-5 border-t border-stone-200 dark:border-zinc-800 pt-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink dark:text-zinc-200">
              {prettyDate(selectedDate)}
            </h3>
            <span
              className={`chip ${
                isDayProductive
                  ? 'bg-sage-100 text-sage-700 dark:bg-sage-500/20 dark:text-sage-300'
                  : 'bg-stone-100 text-stone-500 dark:bg-zinc-800 dark:text-zinc-500'
              }`}
            >
              {isDayProductive ? 'Productive Day' : 'No Activity'}
            </span>
          </div>
          <div className="space-y-2">
            <DayRow
              icon="Binary"
              label="DSA"
              value={dayDsa && dayDsa.count > 0 ? `${dayDsa.count} question${dayDsa.count !== 1 ? 's' : ''} solved` : 'Not practiced'}
              done={!!dayDsa && dayDsa.count > 0}
            />
            {PERMANENT_HABITS.filter((h) => h.id !== 'dsa').map((h) => {
              const done = dayCompletions.has(h.id);
              return (
                <DayRow
                  key={h.id}
                  icon={h.icon}
                  label={h.name}
                  value={done ? 'Completed' : 'Not completed'}
                  done={done}
                />
              );
            })}
            {dayActivities.map((a) => (
              <DayRow
                key={a.id}
                icon="Sparkles"
                label={a.category}
                value={a.name + (a.duration ? ` · ${a.duration}` : '')}
                done={true}
              />
            ))}
          </div>
        </div>
      </section>

      <DsaContributionCalendar />
      </div>

      {/* Weekly DSA chart */}
      <section className="card p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-display text-sm font-semibold text-ink dark:text-zinc-100">
              DSA Questions
            </h2>
            <p className="mt-0.5 text-xs text-ink-muted dark:text-zinc-500">
              {weekStartLabel} – {weekEndLabel}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setWeekOffset((w) => w - 1)}
              className="btn-icon"
              aria-label="Previous week"
            >
              <Icon name="ChevronLeft" size={18} />
            </button>
            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              disabled={!canGoNextWeek}
              className="btn-icon disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Next week"
            >
              <Icon name="ChevronRight" size={18} />
            </button>
          </div>
        </div>

        <div className="flex items-end justify-between gap-2 h-32">
          {weekDays.map((d) => {
            const rec = recMap.get(d);
            const count = rec?.count ?? 0;
            const pct = (count / maxCount) * 100;
            const minMet = count >= minGoal;
            const isFuture = d > today;
            const isToday = d === today;
            return (
              <div key={d} className="flex flex-1 flex-col items-center justify-end h-full gap-1.5">
                {!isFuture && count > 0 && (
                  <span className="text-[10px] font-medium text-ink-muted dark:text-zinc-400 tabular-nums">
                    {count}
                  </span>
                )}
                <div
                  className={[
                    'w-full max-w-[32px] rounded-md transition-all duration-300',
                    isFuture
                      ? 'bg-stone-100 dark:bg-zinc-800/50'
                      : minMet
                        ? 'bg-gradient-to-t from-sage-600 to-sage-400'
                        : count > 0
                          ? 'bg-sage-300 dark:bg-sage-700/50'
                          : 'bg-stone-200 dark:bg-zinc-800',
                    isToday ? 'ring-2 ring-sage-400 ring-offset-1 dark:ring-offset-zinc-900' : '',
                  ].join(' ')}
                  style={{ height: `${Math.max(pct, count > 0 ? 8 : 4)}%`, minHeight: count > 0 ? 8 : 4 }}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex justify-between text-[10px] font-medium text-ink-muted dark:text-zinc-500">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <span key={i} className="flex-1 text-center">
              {d}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatGroup({
  icon,
  title,
  accent,
  stats,
}: {
  icon: string;
  title: string;
  accent: string;
  stats: { value: number; label: string }[];
}) {
  return (
    <div>
      <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${accent}`}>
        <Icon name={icon} size={14} />
        {title}
      </div>
      <div className="mt-3 flex flex-wrap items-baseline gap-x-5 gap-y-1">
        {stats.map((s, i) => (
          <div key={i} className="flex items-baseline gap-1.5">
            {i > 0 && <span className="text-stone-300 dark:text-zinc-700">·</span>}
            <span className="font-display text-2xl font-bold text-ink dark:text-zinc-100 tabular-nums">
              {s.value}
            </span>
            <span className="text-xs text-ink-muted dark:text-zinc-500">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DayRow({
  icon,
  label,
  value,
  done,
}: {
  icon: string;
  label: string;
  value: string;
  done: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
          done
            ? 'bg-sage-100 text-sage-600 dark:bg-sage-500/20 dark:text-sage-400'
            : 'bg-stone-100 text-stone-400 dark:bg-zinc-800 dark:text-zinc-600'
        }`}
      >
        <Icon name={icon} size={14} />
      </div>
      <span className="shrink-0 text-sm font-medium text-ink dark:text-zinc-200">{label}</span>
      <span
        className={`ml-auto text-right text-sm ${
          done ? 'text-ink-soft dark:text-zinc-300' : 'text-ink-muted dark:text-zinc-500'
        }`}
      >
        {value}
      </span>
    </div>
  );
}
