import type { AppData, CompletionRecord, DsaRecord, HabitId } from '@/types';
import { todayDateStr, addDays } from '@/utils/dates';

const STORAGE_KEY = 'streakup:data:v2';
const LEGACY_KEY = 'streakup:data:v1';
const DATA_VERSION = 2;

const DEFAULT_DATA: AppData = {
  completions: [],
  customTasks: [],
  dsaRecords: [],
  productiveActivities: [],
  settings: {
    theme: 'dark',
    timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' : 'UTC',
    reminderEnabled: false,
    reminderTime: '20:00',
    weeklyGoal: 20,
    dsaMinGoal: 1,
    dsaTargetGoal: 3,
  },
  version: DATA_VERSION,
  seeded: false,
};

function detectTheme(): 'light' | 'dark' | 'system' {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('streakup:theme');
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  return 'dark';
}

/** Migrate v1 data (no dsaRecords / productiveActivities / DSA goal settings) to v2. */
function migrateV1(parsed: Record<string, unknown>): AppData {
  const v1Settings = (parsed.settings as Record<string, unknown>) || {};
  const completions = (parsed.completions as CompletionRecord[]) || [];

  // Build DSA records from existing DSA completion entries: each completed DSA
  // day gets count = 0 but targetMet = true so the old streak is preserved.
  // Since we don't know the historical question count, we treat old completions
  // as "target met" days so streaks carry over.
  const dsaDates = new Set(
    completions.filter((c) => c.habitId === 'dsa').map((c) => c.date)
  );
  const dsaRecords: DsaRecord[] = Array.from(dsaDates).map((date) => ({
    date,
    count: 0,
    minGoalMet: true,
    targetMet: true,
  }));

  return {
    ...DEFAULT_DATA,
    ...parsed,
    dsaRecords,
    productiveActivities: [],
    settings: {
      ...DEFAULT_DATA.settings,
      ...v1Settings,
      dsaMinGoal: (v1Settings.dsaMinGoal as number) ?? DEFAULT_DATA.settings.dsaMinGoal,
      dsaTargetGoal: (v1Settings.dsaTargetGoal as number) ?? DEFAULT_DATA.settings.dsaTargetGoal,
    },
    version: DATA_VERSION,
  } as AppData;
}

export function loadData(): AppData {
  if (typeof localStorage === 'undefined') return { ...DEFAULT_DATA };
  try {
    // Try v2 first
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Fall back to legacy v1 key and migrate
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy) {
        const parsed = JSON.parse(legacy) as Record<string, unknown>;
        const migrated = migrateV1(parsed);
        saveData(migrated);
        return migrated;
      }
      return { ...DEFAULT_DATA };
    }
    const parsed = JSON.parse(raw) as Partial<AppData>;
    const data: AppData = {
      ...DEFAULT_DATA,
      ...parsed,
      dsaRecords: parsed.dsaRecords ?? [],
      productiveActivities: parsed.productiveActivities ?? [],
      settings: {
        ...DEFAULT_DATA.settings,
        ...(parsed.settings || {}),
        dsaMinGoal: parsed.settings?.dsaMinGoal ?? DEFAULT_DATA.settings.dsaMinGoal,
        dsaTargetGoal: parsed.settings?.dsaTargetGoal ?? DEFAULT_DATA.settings.dsaTargetGoal,
      },
      version: DATA_VERSION,
    };
    data.settings.theme = detectTheme();
    return data;
  } catch {
    return { ...DEFAULT_DATA };
  }
}

export function saveData(data: AppData): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    // Keep legacy key in sync for older code paths
    localStorage.setItem(LEGACY_KEY, JSON.stringify(data));
    if (data.settings.theme) localStorage.setItem('streakup:theme', data.settings.theme);
  } catch {
    /* quota or private mode — ignore */
  }
}

export function resetData(): AppData {
  const fresh = { ...DEFAULT_DATA, seeded: false };
  saveData(fresh);
  return fresh;
}

/** Generate ~6 weeks of realistic sample completion history ending today. */
export function buildSampleCompletions(): CompletionRecord[] {
  const today = todayDateStr();
  const records: CompletionRecord[] = [];
  const habits: HabitId[] = ['project', 'dsa', 'typing', 'english'];

  for (let i = 45; i >= 1; i--) {
    const date = addDays(today, -i);
    const consistency = 0.45 + (45 - i) * 0.012;
    for (const h of habits) {
      let prob = consistency;
      if (h === 'project') prob *= 0.9;
      if (h === 'dsa') prob *= 1.0;
      if (h === 'typing') prob *= 0.95;
      if (h === 'english') prob *= 0.85;
      if (Math.random() < prob) records.push({ habitId: h, date });
    }
  }
  return records;
}

function buildSampleDsaRecords(completions: CompletionRecord[]): DsaRecord[] {
  const dsaDates = completions.filter((c) => c.habitId === 'dsa').map((c) => c.date);
  const records: DsaRecord[] = [];
  const today = todayDateStr();
  // Generate some question counts for the last 45 days
  for (let i = 45; i >= 1; i--) {
    const date = addDays(today, -i);
    if (dsaDates.includes(date)) {
      const count = 1 + Math.floor(Math.random() * 4); // 1-4 questions
      records.push({
        date,
        count,
        minGoalMet: count >= 1,
        targetMet: count >= 3,
      });
    } else if (Math.random() < 0.15) {
      // Some days with minimum goal met but target missed
      const count = 1 + Math.floor(Math.random() * 2); // 1-2
      records.push({
        date,
        count,
        minGoalMet: true,
        targetMet: false,
      });
    }
  }
  return records;
}

export function generateSampleData(): AppData {
  const completions = buildSampleCompletions();
  const data: AppData = {
    ...DEFAULT_DATA,
    completions,
    dsaRecords: buildSampleDsaRecords(completions),
    customTasks: [
      {
        id: cryptoId(),
        title: 'Read 20 pages',
        description: 'Current book — non-fiction or tech',
        priority: 'medium',
        createdAt: new Date().toISOString(),
        completedDates: [],
      },
      {
        id: cryptoId(),
        title: 'Revise Computer Vision notes',
        description: 'Go through CNN architectures',
        priority: 'high',
        deadline: addDays(todayDateStr(), 3),
        createdAt: new Date().toISOString(),
        completedDates: [],
      },
    ],
    productiveActivities: [
      {
        id: cryptoId(),
        name: 'Attended AI workshop',
        category: 'Technical Event',
        date: addDays(todayDateStr(), -2),
        createdAt: new Date().toISOString(),
      },
      {
        id: cryptoId(),
        name: 'Read 15 pages of Clean Code',
        category: 'Reading',
        date: addDays(todayDateStr(), -3),
        duration: '20 min',
        createdAt: new Date().toISOString(),
      },
    ],
    seeded: true,
  };
  saveData(data);
  return data;
}

export function cryptoId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
