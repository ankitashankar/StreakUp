export type HabitId = 'project' | 'dsa' | 'typing' | 'english';

export interface Habit {
  id: HabitId;
  name: string;
  description: string;
  icon: string; // lucide icon name
  target: string; // e.g. "2 hours", "3 problems"
  color: 'sage' | 'violet' | 'amber' | 'sky';
}

export interface CompletionRecord {
  habitId: HabitId;
  date: string; // YYYY-MM-DD
}

export interface CustomTask {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'none';
  deadline?: string; // YYYY-MM-DD
  createdAt: string; // ISO
  completedDates: string[]; // YYYY-MM-DD list — task is "done for today" if today in list
}

export interface DsaRecord {
  date: string; // YYYY-MM-DD
  count: number; // questions solved that day
  minGoalMet: boolean;
  targetMet: boolean;
}

export type ProductiveCategory =
  | 'Learning'
  | 'Reading'
  | 'Technical Event'
  | 'Podcast/Video'
  | 'Skill Development'
  | 'Other';

export interface ProductiveActivity {
  id: string;
  name: string;
  category: ProductiveCategory;
  description?: string;
  date: string; // YYYY-MM-DD
  duration?: string; // optional, free-text e.g. "30 min"
  createdAt: string; // ISO
}

export interface Settings {
  theme: 'light' | 'dark' | 'system';
  timezone: string; // IANA tz, default from browser
  reminderEnabled: boolean;
  reminderTime: string; // "HH:MM"
  weeklyGoal: number; // target completions per week
  dsaMinGoal: number; // daily minimum DSA questions
  dsaTargetGoal: number; // daily target DSA questions
}

export interface AppData {
  completions: CompletionRecord[];
  customTasks: CustomTask[];
  dsaRecords: DsaRecord[];
  productiveActivities: ProductiveActivity[];
  settings: Settings;
  version: number;
  seeded: boolean;
}

export const PERMANENT_HABITS: Habit[] = [
  {
    id: 'project',
    name: 'Project Work',
    description: 'College, development, or personal projects',
    icon: 'FolderGit2',
    target: '2 hours',
    color: 'sage',
  },
  {
    id: 'dsa',
    name: 'DSA Practice',
    description: 'Solve data structures & algorithms problems',
    icon: 'Binary',
    target: '3 problems',
    color: 'violet',
  },
  {
    id: 'typing',
    name: 'Typing Practice',
    description: 'Typing speed and accuracy drills',
    icon: 'Keyboard',
    target: '15 minutes',
    color: 'amber',
  },
  {
    id: 'english',
    name: 'English Speaking',
    description: 'Spoken English, fluency and communication',
    icon: 'Languages',
    target: '20 minutes',
    color: 'sky',
  },
];

/** Secondary habits displayed below the DSA card (excludes DSA). */
export const SECONDARY_HABITS: Habit[] = PERMANENT_HABITS.filter((h) => h.id !== 'dsa');

export const PRODUCTIVE_CATEGORIES: ProductiveCategory[] = [
  'Learning',
  'Reading',
  'Technical Event',
  'Podcast/Video',
  'Skill Development',
  'Other',
];

export const MILESTONES = [3, 7, 14, 30, 60, 100];

export const MOTIVATION_MESSAGES = [
  "One step closer!",
  "You're building discipline!",
  "Another day, another win!",
  "Small steps, big change.",
  "Consistency is your superpower.",
  "Show up. That's the win.",
];

export const FRESH_START_MESSAGES = [
  "Yesterday wasn't perfect. Today is a fresh start!",
  "A new day, a new chance. Let's go!",
  "Missing once is fine. Let's rebuild today.",
];
