import { useState, useEffect, useRef } from 'react';
import { useData } from '@/context/useData';
import { Icon } from '@/components/Icon';
import { dsaStreak, totalDsaQuestions, todayDsaRecord } from '@/utils/streaks';
import { Confetti } from '@/components/Confetti';

export function DsaCard() {
  const { data, dsaRecords, incrementDsa, setDsaCount, today, tz } = useData();
  const { settings } = data;
  const minGoal = settings.dsaMinGoal;
  const targetGoal = settings.dsaTargetGoal;

  const streak = dsaStreak(dsaRecords, tz);
  const totalQuestions = totalDsaQuestions(dsaRecords);
  const todayRec = todayDsaRecord(dsaRecords, tz);
  const todayCount = todayRec?.count ?? 0;

  const minMet = todayCount >= minGoal;
  const targetMet = todayCount >= targetGoal;
  const progressPct = targetGoal > 0 ? Math.min(100, (todayCount / targetGoal) * 100) : 0;

  const [inputValue, setInputValue] = useState(String(todayCount));
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [confettiFire, setConfettiFire] = useState(0);
  const prevMinMet = useRef(minMet);
  const prevTargetMet = useRef(targetMet);

  useEffect(() => {
    if (!editing) setInputValue(String(todayCount));
  }, [todayCount, editing]);

  useEffect(() => {
    if ((minMet && !prevMinMet.current) || (targetMet && !prevTargetMet.current)) {
      setConfettiFire((f) => f + 1);
    }
    prevMinMet.current = minMet;
    prevTargetMet.current = targetMet;
  }, [minMet, targetMet]);

  const handleManualSave = () => {
    const n = parseInt(inputValue, 10);
    if (!isNaN(n) && n >= 0) {
      setDsaCount(today, n);
    } else {
      setInputValue(String(todayCount));
    }
    setEditing(false);
  };

  const remaining = targetGoal - todayCount;
  const message = targetMet
    ? 'Daily target achieved!'
    : minMet
      ? 'DSA streak maintained! Daily minimum achieved.'
      : remaining === 1
        ? 'One more question to reach your target!'
        : `${remaining} questions to reach your target`;

  return (
    <section className={`card relative overflow-hidden p-6 transition-all ${minMet ? 'ring-2 ring-sage-400/60 dark:ring-sage-500/40' : ''}`}>
      <Confetti fire={confettiFire} />

      {/* Glow background */}
      <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-sage-100/50 blur-3xl dark:bg-sage-900/20" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${minMet ? 'bg-gradient-to-br from-sage-400 to-sage-600 text-white shadow-lg' : 'bg-sage-50 text-sage-600 dark:bg-sage-950/40 dark:text-sage-400'}`}>
              <Icon name="Binary" size={26} strokeWidth={2.2} />
            </div>
            <div>
              <div className="font-display text-lg font-bold text-ink dark:text-zinc-100 leading-tight">DSA Practice</div>
              <div className="text-xs text-ink-muted dark:text-zinc-500">Solve data structures & algorithms problems</div>
            </div>
          </div>
          {streak.current > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 animate-fadeIn">
              <Icon name="Flame" size={16} className="animate-flameFlicker" />
              {streak.current}
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <DsaStat label="Current Streak" value={`${streak.current}`} suffix="days" icon="Flame" color="text-amber-600 dark:text-amber-400" />
          <DsaStat label="Best Streak" value={`${streak.best}`} suffix="days" icon="Trophy" color="text-violet-600 dark:text-violet-400" />
          <DsaStat label="Total Solved" value={`${totalQuestions}`} suffix="questions" icon="CheckCircle2" color="text-sage-600 dark:text-sage-400" />
          <DsaStat label="Today" value={`${todayCount}`} suffix={`/${targetGoal}`} icon="Target" color="text-sky-600 dark:text-sky-400" />
        </div>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted dark:text-zinc-500">Today's Progress</span>
            <span className="text-sm font-semibold text-ink dark:text-zinc-100 tabular-nums">
              {todayCount} / {targetGoal} Questions
            </span>
          </div>
          <div className="relative h-3 w-full rounded-full bg-stone-100 dark:bg-zinc-800 overflow-hidden">
            {/* Min goal marker */}
            {minGoal > 0 && minGoal < targetGoal && (
              <div className="absolute top-0 bottom-0 z-10 w-0.5 bg-stone-400 dark:bg-zinc-500" style={{ left: `${(minGoal / targetGoal) * 100}%` }} title={`Min goal: ${minGoal}`} />
            )}
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                targetMet
                  ? 'bg-gradient-to-r from-sage-400 to-sage-600'
                  : minMet
                    ? 'bg-gradient-to-r from-amber-300 to-amber-500'
                    : 'bg-gradient-to-r from-sky-300 to-sky-500'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-ink-muted dark:text-zinc-500">
            <span>0</span>
            {minGoal > 0 && minGoal < targetGoal && <span className="font-medium">Min: {minGoal}</span>}
            <span>Target: {targetGoal}</span>
          </div>
        </div>

        {/* Counter controls */}
        <div className="mt-5 flex items-center justify-center gap-4">
          <button
            onClick={() => incrementDsa(-1)}
            disabled={todayCount <= 0}
            aria-label="Decrease question count"
            className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-stone-200 text-ink-soft transition-all hover:border-sage-400 hover:bg-sage-50 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-sage-950/30"
          >
            <Icon name="Minus" size={22} strokeWidth={2.5} />
          </button>

          {editing ? (
            <input
              ref={inputRef}
              type="number"
              min={0}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={handleManualSave}
              onKeyDown={(e) => { if (e.key === 'Enter') handleManualSave(); }}
              autoFocus
              className="w-20 rounded-xl border-2 border-sage-400 bg-white px-2 py-2 text-center font-display text-2xl font-bold text-ink dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none"
            />
          ) : (
            <button
              onClick={() => { setEditing(true); setInputValue(String(todayCount)); }}
              className="flex min-w-[80px] items-center justify-center rounded-xl bg-stone-50 px-4 py-2 font-display text-2xl font-extrabold text-ink tabular-nums transition-all hover:bg-stone-100 dark:bg-zinc-800/50 dark:text-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Click to edit question count"
            >
              {todayCount}
            </button>
          )}

          <button
            onClick={() => incrementDsa(1)}
            aria-label="Increase question count"
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage-600 text-white shadow-sm transition-all hover:bg-sage-700 active:scale-95"
          >
            <Icon name="Plus" size={22} strokeWidth={2.5} />
          </button>
        </div>

        {/* Goal indicators + message */}
        <div className="mt-5 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            {minMet && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-50 px-3 py-1 text-xs font-semibold text-sage-600 dark:bg-sage-950/40 dark:text-sage-400 animate-fadeIn">
                <Icon name="CheckCircle2" size={13} /> DSA streak maintained!
              </span>
            )}
            {targetMet && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 animate-fadeIn">
                <Icon name="Target" size={13} /> Daily target achieved
              </span>
            )}
            {!minMet && !targetMet && (
              <span className="text-xs text-ink-muted dark:text-zinc-500">Daily minimum: {minGoal} question{minGoal !== 1 ? 's' : ''}</span>
            )}
          </div>
          <p className={`text-sm font-medium ${targetMet ? 'text-sage-600 dark:text-sage-400' : minMet ? 'text-sage-600 dark:text-sage-400' : 'text-ink-soft dark:text-zinc-400'}`}>
            {targetMet && todayCount > targetGoal
              ? `Daily target achieved! ${todayCount - targetGoal} extra question${todayCount - targetGoal !== 1 ? 's' : ''} solved today!`
              : message}
          </p>
        </div>
      </div>
    </section>
  );
}

function DsaStat({ label, value, suffix, icon, color }: { label: string; value: string; suffix: string; icon: string; color: string }) {
  return (
    <div className="rounded-xl bg-stone-50 p-3 dark:bg-zinc-800/50">
      <div className={`flex items-center gap-1.5 ${color}`}>
        <Icon name={icon} size={14} />
        <span className="text-[10px] font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="font-display text-xl font-bold text-ink dark:text-zinc-100 tabular-nums">{value}</span>
        <span className="text-[10px] text-ink-muted dark:text-zinc-500">{suffix}</span>
      </div>
    </div>
  );
}
