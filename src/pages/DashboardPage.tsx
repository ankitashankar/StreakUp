import { useMemo } from 'react';
import { useData } from '@/context/useData';
import { SECONDARY_HABITS, MILESTONES, MOTIVATION_MESSAGES } from '@/types';
import { HabitCard } from '@/components/HabitCard';
import { CustomTasks } from '@/components/CustomTasks';
import { DsaCard } from '@/components/DsaCard';
import { ProductiveActivities } from '@/components/ProductiveActivities';
import { Icon } from '@/components/Icon';
import {
  productiveStreak, dsaStreak, todayCompletions,
} from '@/utils/streaks';

export function DashboardPage() {
  const { completions, productiveActivities, dsaRecords, tz } = useData();

  const pStreak = useMemo(() => productiveStreak(completions, productiveActivities, tz), [completions, productiveActivities, tz]);
  const dsaStreakStats = useMemo(() => dsaStreak(dsaRecords, tz), [dsaRecords, tz]);
  const doneToday = useMemo(() => todayCompletions(completions, tz), [completions, tz]);

  const todayPretty = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }, []);

  const milestone = MILESTONES.includes(dsaStreakStats.current) && dsaStreakStats.current > 0;

  const motivation = useMemo(() => {
    if (dsaStreakStats.current > 0 && milestone) return `Milestone reached: ${dsaStreakStats.current}-day DSA streak! Keep going.`;
    if (dsaStreakStats.current > 0) return MOTIVATION_MESSAGES[dsaStreakStats.current % MOTIVATION_MESSAGES.length];
    return 'Solve your first DSA question today to start your streak!';
  }, [dsaStreakStats, milestone]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-bold text-ink dark:text-zinc-100 sm:text-3xl">Become 1% Better Every Day</h1>
        <p className="text-sm text-ink-muted dark:text-zinc-500">{todayPretty}</p>
      </div>

      {/* Motivation banner */}
      <div className="rounded-xl bg-stone-50 px-4 py-3 text-sm font-medium text-ink-soft dark:bg-zinc-800/50 dark:text-zinc-300">
        <span className="inline-flex items-center gap-2">
          <Icon name="Sparkles" size={16} className="text-sage-500" />
          {motivation}
        </span>
      </div>

      {/* DSA Practice — main feature */}
      <DsaCard />

      {/* Secondary activities */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-muted dark:text-zinc-500">Secondary Activities</h2>
          <span className="text-xs text-ink-muted dark:text-zinc-500">Click to toggle · independent of DSA</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {SECONDARY_HABITS.map((h) => (
            <HabitCard key={h.id} habit={h} />
          ))}
        </div>
      </section>

      {/* Overall productive streak — small secondary stat */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="card flex items-center gap-4 p-5">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${pStreak.current > 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-sm' : 'bg-stone-100 text-stone-400 dark:bg-zinc-800 dark:text-zinc-600'}`}>
            <Icon name="Flame" size={24} strokeWidth={2.2} className={pStreak.current > 0 ? 'animate-flameFlicker' : ''} />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-ink-muted dark:text-zinc-500">Productive Streak</div>
            <div className="font-display text-2xl font-bold text-ink dark:text-zinc-100 tabular-nums">
              {pStreak.current} <span className="text-sm font-normal text-ink-muted dark:text-zinc-500">days</span>
            </div>
            <div className="text-xs text-ink-muted dark:text-zinc-500 mt-0.5">
              {pStreak.current > 0
                ? `${pStreak.current} consecutive productive day${pStreak.current !== 1 ? 's' : ''}!`
                : 'Do anything productive today!'}
            </div>
          </div>
        </div>

        <div className="card flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
            <Icon name="Trophy" size={24} />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-ink-muted dark:text-zinc-500">Best Productive Streak</div>
            <div className="font-display text-2xl font-bold text-ink dark:text-zinc-100 tabular-nums">{pStreak.best}</div>
            <div className="text-xs text-ink-muted dark:text-zinc-500 mt-0.5">days</div>
          </div>
        </div>

        <div className="card flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage-50 text-sage-600 dark:bg-sage-950/40 dark:text-sage-400">
            <Icon name="CheckCircle2" size={24} />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-ink-muted dark:text-zinc-500">Total Productive Days</div>
            <div className="font-display text-2xl font-bold text-ink dark:text-zinc-100 tabular-nums">{pStreak.totalProductiveDays}</div>
            <div className="text-xs text-ink-muted dark:text-zinc-500 mt-0.5">{doneToday.length} habits done today</div>
          </div>
        </div>
      </section>

      {/* Productive activity logger */}
      <section>
        <ProductiveActivities />
      </section>

      {/* Custom tasks */}
      <section>
        <CustomTasks />
      </section>
    </div>
  );
}
