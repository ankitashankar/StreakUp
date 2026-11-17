import { useEffect, useMemo, useState, useCallback, type ReactNode } from 'react';
import type { AppData, CustomTask, DsaRecord, HabitId, Settings } from '@/types';
import { todayDateStr } from '@/utils/dates';
import { loadData, saveData, resetData, generateSampleData, cryptoId } from '@/utils/storage';
import { DataContext, type DataContextValue } from './useData';

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData());

  useEffect(() => {
    saveData(data);
  }, [data]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e: StorageEvent) => {
      if (e.key !== 'streakup:data:v2' || !e.newValue) return;
      try {
        const incoming = JSON.parse(e.newValue) as AppData;
        setData((prev) => ({ ...prev, ...incoming, settings: { ...prev.settings, ...incoming.settings } }));
      } catch {
        /* ignore malformed */
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const tz = data.settings.timezone;
  const [, setTodayTick] = useState(0);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let lastDay = todayDateStr(tz);
    const id = window.setInterval(() => {
      const currentDay = todayDateStr(tz);
      if (currentDay !== lastDay) {
        lastDay = currentDay;
        setTodayTick((t) => t + 1);
      }
    }, 30_000);
    return () => window.clearInterval(id);
  }, [tz]);

  const today = todayDateStr(tz);

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    const pref = data.settings.theme;
    const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return pref === 'dark' || (pref === 'system' && prefersDark) ? 'dark' : 'light';
  });
  useEffect(() => {
    const apply = () => {
      const pref = data.settings.theme;
      const root = document.documentElement;
      const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const dark = pref === 'dark' || (pref === 'system' && prefersDark);
      root.classList.toggle('dark', dark);
      setResolvedTheme(dark ? 'dark' : 'light');
    };
    apply();
    if (data.settings.theme === 'system' && typeof window !== 'undefined') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => apply();
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [data.settings.theme]);

  // --- Habit toggle ---
  const toggleHabit = useCallback((habitId: HabitId) => {
    setData((prev) => {
      const todayStr = todayDateStr(prev.settings.timezone);
      const existing = prev.completions.find((c) => c.habitId === habitId && c.date === todayStr);
      if (existing) {
        return { ...prev, completions: prev.completions.filter((c) => c !== existing) };
      }
      return { ...prev, completions: [...prev.completions, { habitId, date: todayStr }] };
    });
  }, []);

  const isHabitDone = useCallback(
    (habitId: HabitId) => data.completions.some((c) => c.habitId === habitId && c.date === today),
    [data.completions, today]
  );

  // --- Custom tasks ---
  const addTask = useCallback<DataContextValue['addTask']>((t) => {
    setData((prev) => ({
      ...prev,
      customTasks: [
        ...prev.customTasks,
        {
          id: cryptoId(),
          title: t.title,
          description: t.description,
          priority: t.priority || 'none',
          deadline: t.deadline,
          createdAt: new Date().toISOString(),
          completedDates: [],
        },
      ],
    }));
  }, []);

  const updateTask = useCallback((id: string, patch: Partial<CustomTask>) => {
    setData((prev) => ({
      ...prev,
      customTasks: prev.customTasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setData((prev) => ({ ...prev, customTasks: prev.customTasks.filter((t) => t.id !== id) }));
  }, []);

  const toggleTaskToday = useCallback((id: string) => {
    setData((prev) => {
      const todayStr = todayDateStr(prev.settings.timezone);
      return {
        ...prev,
        customTasks: prev.customTasks.map((t) => {
          if (t.id !== id) return t;
          const done = t.completedDates.includes(todayStr);
          return {
            ...t,
            completedDates: done ? t.completedDates.filter((d) => d !== todayStr) : [...t.completedDates, todayStr],
          };
        }),
      };
    });
  }, []);

  const isTaskDoneToday = useCallback(
    (id: string) => data.customTasks.find((t) => t.id === id)?.completedDates.includes(today) ?? false,
    [data.customTasks, today]
  );

  // --- DSA records ---
  const setDsaCount = useCallback((date: string, count: number) => {
    setData((prev) => {
      const clamped = Math.max(0, Math.floor(count));
      const minGoal = prev.settings.dsaMinGoal;
      const targetGoal = prev.settings.dsaTargetGoal;
      const minGoalMet = clamped >= minGoal;
      const targetMet = clamped >= targetGoal;

      const existingIdx = prev.dsaRecords.findIndex((r) => r.date === date);
      let newRecords: DsaRecord[];
      if (existingIdx >= 0) {
        newRecords = prev.dsaRecords.map((r, i) =>
          i === existingIdx ? { ...r, count: clamped, minGoalMet, targetMet } : r
        );
      } else {
        newRecords = [...prev.dsaRecords, { date, count: clamped, minGoalMet, targetMet }];
      }

      // Sync DSA completion record: add/remove the 'dsa' completion based on minimum goal met.
      // Min goal met → DSA habit marked complete (streak maintained). Not met → not complete.
      let completions = prev.completions;
      const hasDsaCompletion = completions.some((c) => c.habitId === 'dsa' && c.date === date);
      if (minGoalMet && !hasDsaCompletion) {
        completions = [...completions, { habitId: 'dsa' as HabitId, date }];
      } else if (!minGoalMet && hasDsaCompletion) {
        completions = completions.filter((c) => !(c.habitId === 'dsa' && c.date === date));
      }

      return { ...prev, dsaRecords: newRecords, completions };
    });
  }, []);

  const incrementDsa = useCallback((delta: number) => {
    setData((prev) => {
      const todayStr = todayDateStr(prev.settings.timezone);
      const existing = prev.dsaRecords.find((r) => r.date === todayStr);
      const currentCount = existing?.count ?? 0;
      const newCount = Math.max(0, currentCount + delta);
      const minGoal = prev.settings.dsaMinGoal;
      const targetGoal = prev.settings.dsaTargetGoal;
      const minGoalMet = newCount >= minGoal;
      const targetMet = newCount >= targetGoal;

      let newRecords: DsaRecord[];
      if (existing) {
        newRecords = prev.dsaRecords.map((r) =>
          r.date === todayStr ? { ...r, count: newCount, minGoalMet, targetMet } : r
        );
      } else {
        newRecords = [...prev.dsaRecords, { date: todayStr, count: newCount, minGoalMet, targetMet }];
      }

      let completions = prev.completions;
      const hasDsaCompletion = completions.some((c) => c.habitId === 'dsa' && c.date === todayStr);
      if (minGoalMet && !hasDsaCompletion) {
        completions = [...completions, { habitId: 'dsa' as HabitId, date: todayStr }];
      } else if (!minGoalMet && hasDsaCompletion) {
        completions = completions.filter((c) => !(c.habitId === 'dsa' && c.date === todayStr));
      }

      return { ...prev, dsaRecords: newRecords, completions };
    });
  }, []);

  const todayDsaCount = useMemo(() => {
    const rec = data.dsaRecords.find((r) => r.date === today);
    return rec?.count ?? 0;
  }, [data.dsaRecords, today]);

  // --- Productive activities ---
  const addProductiveActivity = useCallback<DataContextValue['addProductiveActivity']>((a) => {
    setData((prev) => ({
      ...prev,
      productiveActivities: [
        ...prev.productiveActivities,
        {
          id: cryptoId(),
          name: a.name,
          category: a.category,
          description: a.description,
          date: a.date,
          duration: a.duration,
          createdAt: new Date().toISOString(),
        },
      ],
    }));
  }, []);

  const deleteProductiveActivity = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      productiveActivities: prev.productiveActivities.filter((a) => a.id !== id),
    }));
  }, []);

  // --- Settings ---
  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setData((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
  }, []);

  const resetAll = useCallback(() => setData(resetData()), []);
  const loadSample = useCallback(() => setData(generateSampleData()), []);

  const value = useMemo<DataContextValue>(
    () => ({
      data,
      tz,
      today,
      toggleHabit,
      isHabitDone,
      completions: data.completions,
      addTask,
      updateTask,
      deleteTask,
      toggleTaskToday,
      isTaskDoneToday,
      dsaRecords: data.dsaRecords,
      setDsaCount,
      incrementDsa,
      todayDsaCount,
      productiveActivities: data.productiveActivities,
      addProductiveActivity,
      deleteProductiveActivity,
      updateSettings,
      resetAll,
      loadSample,
      hasSample: data.seeded,
      isDark: resolvedTheme === 'dark',
      resolvedTheme,
    }),
    [data, tz, today, toggleHabit, isHabitDone, addTask, updateTask, deleteTask, toggleTaskToday, isTaskDoneToday, setDsaCount, incrementDsa, todayDsaCount, addProductiveActivity, deleteProductiveActivity, updateSettings, resetAll, loadSample, resolvedTheme]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
