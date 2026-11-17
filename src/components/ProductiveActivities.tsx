import { useState } from 'react';
import type { ProductiveCategory } from '@/types';
import { PRODUCTIVE_CATEGORIES } from '@/types';
import { useData } from '@/context/useData';
import { Icon } from '@/components/Icon';
import { prettyDate, todayDateStr } from '@/utils/dates';
import { productiveStreak } from '@/utils/streaks';

const CATEGORY_ICONS: Record<ProductiveCategory, string> = {
  'Learning': 'BookOpen',
  'Reading': 'BookOpen',
  'Technical Event': 'Users',
  'Podcast/Video': 'Video',
  'Skill Development': 'GraduationCap',
  'Other': 'Sparkles',
};

const CATEGORY_COLORS: Record<ProductiveCategory, string> = {
  'Learning': 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400',
  'Reading': 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  'Technical Event': 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
  'Podcast/Video': 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
  'Skill Development': 'bg-sage-50 text-sage-600 dark:bg-sage-950/40 dark:text-sage-400',
  'Other': 'bg-stone-100 text-ink-muted dark:bg-zinc-800 dark:text-zinc-400',
};

export function ProductiveActivities() {
  const { productiveActivities, addProductiveActivity, deleteProductiveActivity, today, tz, completions } = useData();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: 'Learning' as ProductiveCategory,
    description: '',
    date: today,
    duration: '',
  });

  const resetForm = () => {
    setForm({ name: '', category: 'Learning', description: '', date: today, duration: '' });
  };

  const submit = () => {
    if (!form.name.trim()) return;
    addProductiveActivity({
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim() || undefined,
      date: form.date,
      duration: form.duration.trim() || undefined,
    });
    resetForm();
    setShowForm(false);
  };

  // Show today's activities and recent ones
  const todayActivities = productiveActivities.filter((a) => a.date === today);
  const recentActivities = [...productiveActivities]
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8);

  const pStreak = productiveStreak(completions, productiveActivities, tz);

  return (
    <div className="card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-ink dark:text-zinc-100 flex items-center gap-2">
            <Icon name="Zap" size={18} className="text-amber-600 dark:text-amber-400" />
            Log a Productive Activity
          </h3>
          <p className="text-xs text-ink-muted dark:text-zinc-500 mt-0.5">
            Track any learning or self-development activity — counts toward your productive day streak
          </p>
        </div>
        <button onClick={() => { resetForm(); setShowForm((v) => !v); }} className="btn-primary">
          <Icon name="Plus" size={16} />
          {showForm ? 'Cancel' : 'Log Activity'}
        </button>
      </div>

      {/* Productive streak badge */}
      <div className="mb-4 flex items-center gap-3 rounded-xl bg-amber-50 px-4 py-3 dark:bg-amber-900/20">
        <Icon name="Flame" size={20} className={`text-amber-500 ${pStreak.current > 0 ? 'animate-flameFlicker' : ''}`} />
        <div className="flex-1">
          <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
            {pStreak.current > 0 ? `${pStreak.current} consecutive productive day${pStreak.current !== 1 ? 's' : ''}!` : 'Start your productive streak today!'}
          </span>
          <span className="ml-2 text-xs text-amber-600/70 dark:text-amber-400/70">
            Best: {pStreak.best} · Total: {pStreak.totalProductiveDays}
          </span>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-4 rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50 animate-slideUp">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Activity Name</label>
              <input className="input" placeholder="e.g. Attended an AI workshop" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus onKeyDown={(e) => { if (e.key === 'Enter') submit(); }} />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ProductiveCategory })}>
                {PRODUCTIVE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Date</label>
              <input type="date" className="input" value={form.date} max={todayDateStr(tz)} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description (optional)</label>
              <input className="input" placeholder="Short note about this activity" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Duration (optional)</label>
              <input className="input max-w-[200px]" placeholder="e.g. 30 min" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button onClick={() => { resetForm(); setShowForm(false); }} className="btn-ghost">Cancel</button>
            <button onClick={submit} className="btn-primary">Log Activity</button>
          </div>
        </div>
      )}

      {/* Today's activities */}
      {todayActivities.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-ink-muted dark:text-zinc-500 mb-2">Today</div>
          <ul className="flex flex-col gap-2">
            {todayActivities.map((a) => (
              <li key={a.id} className="group flex items-start gap-3 rounded-xl border border-sage-200 bg-sage-50/50 p-3 dark:border-sage-800 dark:bg-sage-950/20">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${CATEGORY_COLORS[a.category]}`}>
                  <Icon name={CATEGORY_ICONS[a.category]} size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-ink dark:text-zinc-100">{a.name}</span>
                    <span className={`chip ${CATEGORY_COLORS[a.category]}`}>{a.category}</span>
                    {a.duration && <span className="chip bg-stone-100 text-ink-muted dark:bg-zinc-800 dark:text-zinc-500"><Icon name="Clock" size={11} />{a.duration}</span>}
                  </div>
                  {a.description && <p className="text-xs text-ink-muted dark:text-zinc-500 mt-1">{a.description}</p>}
                </div>
                <button onClick={() => deleteProductiveActivity(a.id)} className="btn-icon h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100 hover:text-rose-500" aria-label="Delete activity">
                  <Icon name="Trash2" size={15} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recent activities */}
      {recentActivities.length > 0 && (
        <div>
          {todayActivities.length > 0 && <div className="text-xs font-semibold uppercase tracking-wide text-ink-muted dark:text-zinc-500 mb-2">Recent</div>}
          <ul className="flex flex-col gap-2">
            {recentActivities
              .filter((a) => a.date !== today)
              .slice(0, 5)
              .map((a) => (
                <li key={a.id} className="group flex items-start gap-3 rounded-xl border border-stone-200 p-3 dark:border-zinc-800">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${CATEGORY_COLORS[a.category]}`}>
                    <Icon name={CATEGORY_ICONS[a.category]} size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-ink dark:text-zinc-100">{a.name}</span>
                      <span className={`chip ${CATEGORY_COLORS[a.category]}`}>{a.category}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-ink-muted dark:text-zinc-500"><Icon name="Calendar" size={11} className="inline mr-1" />{prettyDate(a.date)}</span>
                      {a.duration && <span className="text-xs text-ink-muted dark:text-zinc-500"><Icon name="Clock" size={11} className="inline mr-1" />{a.duration}</span>}
                    </div>
                  </div>
                  <button onClick={() => deleteProductiveActivity(a.id)} className="btn-icon h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100 hover:text-rose-500" aria-label="Delete activity">
                    <Icon name="Trash2" size={15} />
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}

      {productiveActivities.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 dark:bg-amber-900/30 dark:text-amber-400 mb-3">
            <Icon name="Zap" size={24} />
          </div>
          <p className="text-sm font-medium text-ink-soft dark:text-zinc-300">No productive activities logged yet</p>
          <p className="text-xs text-ink-muted dark:text-zinc-500 mt-1 max-w-xs">Log workshops, books, podcasts, courses, or any self-development activity. Each one counts as a productive day!</p>
        </div>
      )}
    </div>
  );
}
