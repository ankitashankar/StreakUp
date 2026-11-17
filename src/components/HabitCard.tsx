import type { Habit } from '@/types';
import { Icon } from './Icon';
import { ProgressRing } from './ProgressRing';
import { useData } from '@/context/useData';
import { habitStreak } from '@/utils/streaks';

const COLOR_MAP: Record<Habit['color'], { bg: string; text: string; ring: string; doneBg: string; doneBorder: string; doneText: string }> = {
  sage: {
    bg: 'bg-sage-50 dark:bg-sage-950/40',
    text: 'text-sage-600 dark:text-sage-300',
    ring: '#527d4e',
    doneBg: 'bg-sage-500/10 dark:bg-sage-500/15',
    doneBorder: 'border-sage-400 dark:border-sage-500/50',
    doneText: 'text-sage-700 dark:text-sage-300',
  },
  violet: {
    bg: 'bg-violet-50 dark:bg-violet-900/30',
    text: 'text-violet-600 dark:text-violet-300',
    ring: '#7c6fb0',
    doneBg: 'bg-violet-500/10 dark:bg-violet-500/15',
    doneBorder: 'border-violet-400 dark:border-violet-500/50',
    doneText: 'text-violet-700 dark:text-violet-300',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-600 dark:text-amber-400',
    ring: '#e09132',
    doneBg: 'bg-amber-500/10 dark:bg-amber-500/15',
    doneBorder: 'border-amber-400 dark:border-amber-500/50',
    doneText: 'text-amber-700 dark:text-amber-400',
  },
  sky: {
    bg: 'bg-sky-50 dark:bg-sky-900/25',
    text: 'text-sky-600 dark:text-sky-300',
    ring: '#0e9bd6',
    doneBg: 'bg-sky-500/10 dark:bg-sky-500/15',
    doneBorder: 'border-sky-400 dark:border-sky-500/50',
    doneText: 'text-sky-700 dark:text-sky-300',
  },
};

interface HabitCardProps {
  habit: Habit;
  onCelebrate?: () => void;
}

export function HabitCard({ habit, onCelebrate }: HabitCardProps) {
  const { completions, toggleHabit, isHabitDone, tz } = useData();
  const done = isHabitDone(habit.id);
  const streak = habitStreak(completions, habit.id, tz);
  const c = COLOR_MAP[habit.color];

  const handleToggle = () => {
    const wasNotDone = !done;
    toggleHabit(habit.id);
    if (wasNotDone && onCelebrate) onCelebrate();
  };

  return (
    <div
      className={`card p-5 transition-all duration-300 hover:shadow-cardHover ${
        done ? `${c.doneBg} ${c.doneBorder}` : 'hover:border-stone-300 dark:hover:border-zinc-700'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.bg} ${c.text}`}>
            <Icon name={habit.icon} size={22} strokeWidth={2} />
          </div>
          <div>
            <h3 className="font-display font-semibold text-ink dark:text-zinc-100 leading-tight">{habit.name}</h3>
            <p className="text-xs text-ink-muted dark:text-zinc-500 mt-0.5">{habit.target}</p>
          </div>
        </div>
        {streak.current > 0 && (
          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 animate-fadeIn" title={`${streak.current}-day streak`}>
            <Icon name="Flame" size={16} className="animate-flameFlicker" />
            <span className="font-semibold text-sm tabular-nums">{streak.current}</span>
          </div>
        )}
      </div>

      <p className="mt-3 text-sm text-ink-soft dark:text-zinc-400 line-clamp-2 min-h-[2.5rem]">{habit.description}</p>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          onClick={handleToggle}
          aria-pressed={done}
          aria-label={done ? `Mark ${habit.name} as not done` : `Mark ${habit.name} as done`}
          className={`group relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 transition-all duration-200 active:scale-95 ${
            done
              ? `${c.doneBorder} ${c.doneText} bg-white dark:bg-zinc-900`
              : 'border-stone-300 text-transparent hover:border-sage-400 dark:border-zinc-600'
          }`}
        >
          {done && (
            <span className="animate-checkPop">
              <Icon name="Check" size={24} strokeWidth={3} />
            </span>
          )}
        </button>

        <div className="flex-1">
          <ProgressRing
            value={streak.current > 0 ? Math.min(1, streak.current / Math.max(streak.best, streak.current, 7)) : 0}
            size={44}
            stroke={5}
            color={c.ring}
            animate
          />
        </div>

        <div className="text-right">
          <div className="text-xs text-ink-muted dark:text-zinc-500">Streak · Best · Total</div>
          <div className="font-display font-semibold text-sm text-ink dark:text-zinc-100 tabular-nums">
            {streak.current} · {streak.best} · {streak.totalDays}
          </div>
        </div>
      </div>
    </div>
  );
}
