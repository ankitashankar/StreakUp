import { useState } from 'react';
import { useData } from '@/context/useData';
import { Icon } from '@/components/Icon';

const COMMON_TZ = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Sao_Paulo', 'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Madrid',
  'Africa/Cairo', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Karachi', 'Asia/Dhaka',
  'Asia/Bangkok', 'Asia/Shanghai', 'Asia/Tokyo', 'Asia/Singapore', 'Australia/Sydney',
  'Pacific/Auckland',
];

export function SettingsPage() {
  const { data, updateSettings, resetAll, loadSample, hasSample } = useData();
  const { settings } = data;
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink dark:text-zinc-100 sm:text-3xl">Settings</h1>
        <p className="text-sm text-ink-muted dark:text-zinc-500 mt-1">Personalise StreakUp to fit your routine.</p>
      </div>

      {/* Appearance */}
      <section className="card p-5">
        <h2 className="font-display font-semibold text-ink dark:text-zinc-100 flex items-center gap-2 mb-4">
          <Icon name="Monitor" size={18} className="text-violet-600 dark:text-violet-400" /> Appearance
        </h2>
        <label className="label">Theme</label>
        <div className="grid grid-cols-3 gap-2">
          {(['light', 'dark', 'system'] as const).map((t) => (
            <button
              key={t}
              onClick={() => updateSettings({ theme: t })}
              className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium capitalize transition-all ${
                settings.theme === t
                  ? 'border-sage-500 bg-sage-50 text-sage-700 dark:bg-sage-950/40 dark:text-sage-300'
                  : 'border-stone-200 text-ink-soft hover:border-stone-300 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600'
              }`}
            >
              <Icon name={t === 'light' ? 'Sun' : t === 'dark' ? 'Moon' : 'Monitor'} size={16} />
              {t}
            </button>
          ))}
        </div>
      </section>

      {/* Timezone */}
      <section className="card p-5">
        <h2 className="font-display font-semibold text-ink dark:text-zinc-100 flex items-center gap-2 mb-4">
          <Icon name="Globe" size={18} className="text-sage-600 dark:text-sage-400" /> Timezone
        </h2>
        <label className="label">Your local timezone</label>
        <select
          className="input"
          value={settings.timezone}
          onChange={(e) => updateSettings({ timezone: e.target.value })}
        >
          {!COMMON_TZ.includes(settings.timezone) && <option value={settings.timezone}>{settings.timezone}</option>}
          {COMMON_TZ.map((tz) => <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>)}
        </select>
        <p className="text-xs text-ink-muted dark:text-zinc-500 mt-2">Streaks are calculated using calendar days in this timezone.</p>
      </section>

      {/* Reminders */}
      <section className="card p-5">
        <h2 className="font-display font-semibold text-ink dark:text-zinc-100 flex items-center gap-2 mb-4">
          <Icon name="Bell" size={18} className="text-amber-600 dark:text-amber-400" /> Daily Reminder
        </h2>
        <label className="flex items-center justify-between gap-3 rounded-xl bg-stone-50 px-4 py-3 dark:bg-zinc-800/50">
          <div>
            <div className="text-sm font-medium text-ink dark:text-zinc-100">Enable daily reminder</div>
            <div className="text-xs text-ink-muted dark:text-zinc-500">A gentle nudge to complete your habits (browser notification).</div>
          </div>
          <button
            role="switch"
            aria-checked={settings.reminderEnabled}
            onClick={() => updateSettings({ reminderEnabled: !settings.reminderEnabled })}
            className={`relative h-6 w-11 rounded-full transition-colors ${settings.reminderEnabled ? 'bg-sage-500' : 'bg-stone-300 dark:bg-zinc-600'}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${settings.reminderEnabled ? 'left-[22px]' : 'left-0.5'}`} />
          </button>
        </label>
        {settings.reminderEnabled && (
          <div className="mt-3">
            <label className="label">Reminder time</label>
            <input type="time" className="input max-w-[160px]" value={settings.reminderTime} onChange={(e) => updateSettings({ reminderTime: e.target.value })} />
          </div>
        )}
      </section>

      {/* Weekly goal */}
      <section className="card p-5">
        <h2 className="font-display font-semibold text-ink dark:text-zinc-100 flex items-center gap-2 mb-4">
          <Icon name="Target" size={18} className="text-violet-600 dark:text-violet-400" /> Weekly Goal
        </h2>
        <label className="label">Target habit completions per week (out of 28)</label>
        <input
          type="range" min={4} max={28} step={1}
          value={settings.weeklyGoal}
          onChange={(e) => updateSettings({ weeklyGoal: parseInt(e.target.value, 10) })}
          className="w-full accent-sage-600"
        />
        <div className="mt-1 flex justify-between text-xs text-ink-muted dark:text-zinc-500">
          <span>4</span><span className="font-semibold text-ink dark:text-zinc-200">{settings.weeklyGoal} / week</span><span>28</span>
        </div>
      </section>

      {/* Data management */}
      <section className="card p-5">
        <h2 className="font-display font-semibold text-ink dark:text-zinc-100 flex items-center gap-2 mb-4">
          <Icon name="RotateCcw" size={18} className="text-ink-soft dark:text-zinc-300" /> Data
        </h2>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 rounded-xl bg-stone-50 px-4 py-3 dark:bg-zinc-800/50">
            <div>
              <div className="text-sm font-medium text-ink dark:text-zinc-100">Sample data</div>
              <div className="text-xs text-ink-muted dark:text-zinc-500">{hasSample ? 'Currently loaded — replace with realistic preview history' : 'Load ~6 weeks of sample history to preview the app'}</div>
            </div>
            <button onClick={loadSample} className="btn-ghost border border-stone-200 dark:border-zinc-700">Load sample</button>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl bg-rose-50 px-4 py-3 dark:bg-rose-950/30">
            <div>
              <div className="text-sm font-medium text-rose-700 dark:text-rose-300">Reset all data</div>
              <div className="text-xs text-rose-600/80 dark:text-rose-400/70">Erases all completions, custom tasks, and streaks. This cannot be undone.</div>
            </div>
            {confirmReset ? (
              <div className="flex gap-2">
                <button onClick={() => setConfirmReset(false)} className="btn-ghost">Cancel</button>
                <button onClick={() => { resetAll(); setConfirmReset(false); }} className="btn bg-rose-600 text-white hover:bg-rose-700 px-4 py-2 text-sm rounded-xl">Confirm reset</button>
              </div>
            ) : (
              <button onClick={() => setConfirmReset(true)} className="btn border border-rose-300 text-rose-600 hover:bg-rose-100 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/50 px-4 py-2 text-sm rounded-xl">Reset</button>
            )}
          </div>
        </div>
      </section>

      <p className="text-center text-xs text-ink-muted dark:text-zinc-500 pb-2">StreakUp · Never miss twice. Show up every day.</p>
    </div>
  );
}
