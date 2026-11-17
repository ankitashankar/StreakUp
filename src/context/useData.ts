import { createContext, useContext } from 'react';
import type { AppData, CompletionRecord, CustomTask, DsaRecord, HabitId, ProductiveActivity, ProductiveCategory, Settings } from '@/types';

export interface DataContextValue {
  data: AppData;
  tz: string;
  today: string;
  // completions
  toggleHabit: (habitId: HabitId) => void;
  isHabitDone: (habitId: HabitId) => boolean;
  completions: CompletionRecord[];
  // custom tasks
  addTask: (t: { title: string; description?: string; priority?: CustomTask['priority']; deadline?: string }) => void;
  updateTask: (id: string, patch: Partial<CustomTask>) => void;
  deleteTask: (id: string) => void;
  toggleTaskToday: (id: string) => void;
  isTaskDoneToday: (id: string) => boolean;
  // DSA records
  dsaRecords: DsaRecord[];
  setDsaCount: (date: string, count: number) => void;
  incrementDsa: (delta: number) => void;
  todayDsaCount: number;
  // productive activities
  productiveActivities: ProductiveActivity[];
  addProductiveActivity: (a: { name: string; category: ProductiveCategory; description?: string; date: string; duration?: string }) => void;
  deleteProductiveActivity: (id: string) => void;
  // settings
  updateSettings: (patch: Partial<Settings>) => void;
  // data management
  resetAll: () => void;
  loadSample: () => void;
  hasSample: boolean;
  isDark: boolean;
  resolvedTheme: 'light' | 'dark';
}

export const DataContext = createContext<DataContextValue | null>(null);

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
