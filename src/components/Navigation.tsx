import { useData } from '@/context/useData';
import { overallStreak } from '@/utils/streaks';
import { Icon } from './Icon';
import { ProgressRing } from './ProgressRing';

export type Page = 'dashboard' | 'progress' | 'history' | 'settings';

const NAV: { id: Page; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { id: 'progress', label: 'Progress', icon: 'TrendingUp' },
  { id: 'history', label: 'History', icon: 'History' },
  { id: 'settings', label: 'Settings', icon: 'Settings' },
];

export function Sidebar({ page, onNavigate }: { page: Page; onNavigate: (p: Page) => void }) {
  const { completions, tz } = useData();
  const overall = overallStreak(completions, tz);

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-stone-200 bg-white/60 dark:border-zinc-800 dark:bg-zinc-900/40 p-5">
      <div className="flex items-center gap-2.5 px-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sage-600 text-white">
          <Icon name="Flame" size={20} strokeWidth={2.5} />
        </div>
        <div>
          <div className="font-display font-bold text-ink dark:text-zinc-100 leading-none">StreakUp</div>
          <div className="text-[10px] uppercase tracking-wider text-ink-muted dark:text-zinc-500 mt-0.5">Consistency Tracker</div>
        </div>
      </div>

      <nav className="mt-8 flex flex-col gap-1">
        {NAV.map((n) => (
          <button
            key={n.id}
            onClick={() => onNavigate(n.id)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
              page === n.id
                ? 'bg-sage-600 text-white shadow-sm'
                : 'text-ink-soft hover:bg-stone-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
            }`}
          >
            <Icon name={n.icon} size={18} strokeWidth={2} />
            {n.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <ProgressRing value={overall.current > 0 ? 1 : 0} size={48} stroke={5} color="#e09132" label={String(overall.current)} />
            <div>
              <div className="text-xs text-ink-muted dark:text-zinc-500">Overall Streak</div>
              <div className="font-display font-semibold text-ink dark:text-zinc-100">{overall.current} days</div>
            </div>
          </div>
          <p className="mt-3 text-xs text-ink-muted dark:text-zinc-500">Best {overall.best} · Perfect {overall.perfectDays.length}</p>
        </div>
      </div>
    </aside>
  );
}

export function MobileNav({ page, onNavigate }: { page: Page; onNavigate: (p: Page) => void }) {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-stone-200 bg-white/90 dark:border-zinc-800 dark:bg-zinc-900/90 backdrop-blur-md">
      <div className="flex items-stretch justify-around px-2 py-1.5">
        {NAV.map((n) => (
          <button
            key={n.id}
            onClick={() => onNavigate(n.id)}
            className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors ${
              page === n.id ? 'text-sage-600 dark:text-sage-400' : 'text-ink-muted dark:text-zinc-500'
            }`}
          >
            <Icon name={n.icon} size={20} strokeWidth={page === n.id ? 2.5 : 2} />
            {n.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

export function TopBar({ onToggleTheme }: { onToggleTheme?: () => void }) {
  const { completions, tz, isDark } = useData();
  const overall = overallStreak(completions, tz);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-stone-200 bg-stone-100/80 px-5 py-3 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80 lg:px-8">
      <div className="flex items-center gap-2 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sage-600 text-white">
          <Icon name="Flame" size={18} strokeWidth={2.5} />
        </div>
        <span className="font-display font-bold text-ink dark:text-zinc-100">StreakUp</span>
      </div>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-2">
        {overall.current > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
            <Icon name="Flame" size={15} className="animate-flameFlicker" />
            {overall.current}
          </div>
        )}
        <button
          onClick={onToggleTheme}
          className="btn-icon"
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
          <Icon name={isDark ? 'Sun' : 'Moon'} size={18} />
        </button>
      </div>
    </header>
  );
}
