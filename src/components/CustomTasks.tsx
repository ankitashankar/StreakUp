import { useState } from 'react';
import type { CustomTask } from '@/types';
import { useData } from '@/context/useData';
import { Icon } from './Icon';
import { prettyDate } from '@/utils/dates';

const PRIORITY_STYLES: Record<CustomTask['priority'], { label: string; chip: string; dot: string }> = {
  high: { label: 'High', chip: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', dot: 'bg-rose-500' },
  medium: { label: 'Medium', chip: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', dot: 'bg-amber-500' },
  low: { label: 'Low', chip: 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400', dot: 'bg-sky-500' },
  none: { label: 'No priority', chip: 'bg-stone-100 text-ink-muted dark:bg-zinc-800 dark:text-zinc-500', dot: 'bg-stone-400' },
};

export function CustomTasks() {
  const { data, addTask, updateTask, deleteTask, toggleTaskToday, isTaskDoneToday, today } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', priority: 'none' as CustomTask['priority'], deadline: '' });

  const tasks = data.customTasks;
  const resetForm = () => { setForm({ title: '', description: '', priority: 'none', deadline: '' }); setEditingId(null); };

  const submit = () => {
    if (!form.title.trim()) return;
    if (editingId) {
      updateTask(editingId, { title: form.title.trim(), description: form.description.trim() || undefined, priority: form.priority, deadline: form.deadline || undefined });
    } else {
      addTask({ title: form.title.trim(), description: form.description.trim() || undefined, priority: form.priority, deadline: form.deadline || undefined });
    }
    resetForm();
    setShowForm(false);
  };

  const startEdit = (t: CustomTask) => {
    setEditingId(t.id);
    setForm({ title: t.title, description: t.description || '', priority: t.priority, deadline: t.deadline || '' });
    setShowForm(true);
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-ink dark:text-zinc-100 flex items-center gap-2">
            <Icon name="ListTodo" size={18} className="text-violet-600 dark:text-violet-400" />
            Today's Tasks
          </h3>
          <p className="text-xs text-ink-muted dark:text-zinc-500 mt-0.5">Custom tasks — separate from your four habits</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm((v) => !v); }} className="btn-primary">
          <Icon name="Plus" size={16} />
          {showForm ? 'Cancel' : 'Add Task'}
        </button>
      </div>

      {showForm && (
        <div className="mb-4 rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50 animate-slideUp">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Title</label>
              <input className="input" placeholder="e.g. Study ML for 1 hour" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description (optional)</label>
              <input className="input" placeholder="Notes about this task" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as CustomTask['priority'] })}>
                <option value="none">None</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="label">Deadline (optional)</label>
              <input type="date" className="input" value={form.deadline} min={today} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button onClick={() => { resetForm(); setShowForm(false); }} className="btn-ghost">Cancel</button>
            <button onClick={submit} className="btn-primary">{editingId ? 'Save' : 'Add'}</button>
          </div>
        </div>
      )}

      {tasks.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-500 dark:bg-violet-900/30 dark:text-violet-400 mb-3">
            <Icon name="Sparkles" size={26} />
          </div>
          <p className="text-sm font-medium text-ink-soft dark:text-zinc-300">No custom tasks yet</p>
          <p className="text-xs text-ink-muted dark:text-zinc-500 mt-1 max-w-xs">Add extra daily tasks like studying ML, reading, or exercising. They won't affect your four habit streaks.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {tasks.map((t) => {
            const done = isTaskDoneToday(t.id);
            const ps = PRIORITY_STYLES[t.priority];
            const overdue = t.deadline && t.deadline < today && !t.completedDates.includes(today);
            return (
              <li key={t.id} className={`group flex items-start gap-3 rounded-xl border p-3 transition-all ${done ? 'border-sage-300 bg-sage-50/60 dark:border-sage-800 dark:bg-sage-950/30' : 'border-stone-200 dark:border-zinc-800 hover:border-stone-300 dark:hover:border-zinc-700'}`}>
                <button
                  onClick={() => toggleTaskToday(t.id)}
                  aria-pressed={done}
                  aria-label={done ? 'Mark task not done' : 'Mark task done'}
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-all active:scale-90 ${
                    done ? 'border-sage-500 bg-sage-500 text-white' : 'border-stone-300 text-transparent hover:border-sage-400 dark:border-zinc-600'
                  }`}
                >
                  {done && <Icon name="Check" size={14} strokeWidth={3} className="animate-checkPop" />}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-medium ${done ? 'text-sage-700 line-through dark:text-sage-400' : 'text-ink dark:text-zinc-100'}`}>{t.title}</span>
                    {t.priority !== 'none' && <span className={`chip ${ps.chip}`}><span className={`h-1.5 w-1.5 rounded-full ${ps.dot}`} />{ps.label}</span>}
                    {t.deadline && (
                      <span className={`chip ${overdue ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-stone-100 text-ink-muted dark:bg-zinc-800 dark:text-zinc-500'}`}>
                        <Icon name="Calendar" size={11} />
                        {prettyDate(t.deadline)}
                        {overdue && ' · overdue'}
                      </span>
                    )}
                  </div>
                  {t.description && <p className="text-xs text-ink-muted dark:text-zinc-500 mt-1">{t.description}</p>}
                </div>
                <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={() => startEdit(t)} className="btn-icon h-8 w-8" aria-label="Edit task"><Icon name="Pencil" size={15} /></button>
                  <button onClick={() => deleteTask(t.id)} className="btn-icon h-8 w-8 hover:text-rose-500" aria-label="Delete task"><Icon name="Trash2" size={15} /></button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
