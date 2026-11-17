import type { CompletionRecord, DsaRecord, HabitId, ProductiveActivity } from '@/types';
import { PERMANENT_HABITS, SECONDARY_HABITS } from '@/types';
import { todayDateStr, addDays, diffDays, parseDate, lastNDays, startOfWeek, dayName } from '@/utils/dates';

export interface StreakStats {
  current: number;
  best: number;
  totalDays: number;
}

export interface OverallStreakStats extends StreakStats {
  perfectDays: string[]; // dates all 4 completed
}

const ALL_HABIT_IDS = PERMANENT_HABITS.map((h) => h.id);
const SECONDARY_HABIT_IDS = SECONDARY_HABITS.map((h) => h.id);

/** Set of dates the given habit was completed. */
export function habitDates(completions: CompletionRecord[], habitId: HabitId): Set<string> {
  return new Set(completions.filter((c) => c.habitId === habitId).map((c) => c.date));
}

/** Dates (sorted asc) on which ALL four permanent habits were completed. */
export function perfectDays(completions: CompletionRecord[]): string[] {
  const byDate = new Map<string, Set<HabitId>>();
  for (const c of completions) {
    if (!ALL_HABIT_IDS.includes(c.habitId)) continue;
    if (!byDate.has(c.date)) byDate.set(c.date, new Set());
    byDate.get(c.date)!.add(c.habitId);
  }
  const perfect: string[] = [];
  for (const [date, set] of byDate) {
    if (set.size === 4) perfect.push(date);
  }
  return perfect.sort();
}

/** Generic consecutive-day streak from a set of completed dates.
 *  Streak counts back from today: if today completed, streak includes today and
 *  consecutive prior days. If today not completed but yesterday was, streak still
 *  counts the consecutive run ending yesterday (gives "active" streak until day ends). */
export function computeStreak(dateSet: Set<string>, tz?: string): StreakStats {
  const today = todayDateStr(tz);
  const dates = Array.from(dateSet).filter((d) => d <= today).sort();
  if (dates.length === 0) return { current: 0, best: 0, totalDays: 0 };

  let current = 0;
  let cursor = today;
  const hasToday = dateSet.has(today);
  if (hasToday) {
    current = 1;
    cursor = addDays(today, -1);
    while (dateSet.has(cursor)) {
      current++;
      cursor = addDays(cursor, -1);
    }
  } else {
    cursor = addDays(today, -1);
    if (dateSet.has(cursor)) {
      current = 1;
      cursor = addDays(cursor, -1);
      while (dateSet.has(cursor)) {
        current++;
        cursor = addDays(cursor, -1);
      }
    } else {
      current = 0;
    }
  }

  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of dates) {
    if (prev !== null && diffDays(d, prev) === 1) {
      run++;
    } else {
      run = 1;
    }
    if (run > best) best = run;
    prev = d;
  }

  return { current, best, totalDays: dates.length };
}

export function habitStreak(completions: CompletionRecord[], habitId: HabitId, tz?: string): StreakStats {
  return computeStreak(habitDates(completions, habitId), tz);
}

export function overallStreak(completions: CompletionRecord[], tz?: string): OverallStreakStats {
  const perfect = perfectDays(completions);
  const stats = computeStreak(new Set(perfect), tz);
  return { ...stats, perfectDays: perfect };
}

/** Today's completed permanent habit ids. */
export function todayCompletions(completions: CompletionRecord[], tz?: string): HabitId[] {
  const today = todayDateStr(tz);
  return completions.filter((c) => c.date === today && ALL_HABIT_IDS.includes(c.habitId)).map((c) => c.habitId);
}

export function isHabitDoneToday(completions: CompletionRecord[], habitId: HabitId, tz?: string): boolean {
  return todayCompletions(completions, tz).includes(habitId);
}

/** Count of completions in a date range (inclusive). */
export function completionsInRange(completions: CompletionRecord[], from: string, to: string): number {
  return completions.filter((c) => c.date >= from && c.date <= to && ALL_HABIT_IDS.includes(c.habitId)).length;
}

/** Map of date -> count of completed permanent habits (0..4) for given dates. */
export function countsByDate(completions: CompletionRecord[], dates: string[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const d of dates) map.set(d, 0);
  for (const c of completions) {
    if (!ALL_HABIT_IDS.includes(c.habitId)) continue;
    if (map.has(c.date)) map.set(c.date, (map.get(c.date) || 0) + 1);
  }
  return map;
}

/** Weekly series: for each of last n weeks (ending current week), completed vs missed out of 28 (4*7). */
export function weeklySeries(completions: CompletionRecord[], weeks: number, tz?: string): { weekStart: string; completed: number; total: number }[] {
  const today = todayDateStr(tz);
  const day = parseDate(today).getDay();
  const offsetToMonday = day === 0 ? -6 : 1 - day;
  let currentMonday = addDays(today, offsetToMonday);
  const series: { weekStart: string; completed: number; total: number }[] = [];
  for (let i = 0; i < weeks; i++) {
    const monday = currentMonday;
    const sunday = addDays(monday, 6);
    const completed = completionsInRange(completions, monday, sunday < today ? sunday : today);
    const totalDays = Math.min(7, diffDays(today, monday) + 1);
    series.push({ weekStart: monday, completed, total: totalDays * 4 });
    currentMonday = addDays(currentMonday, -7);
  }
  return series.reverse();
}

/** Daily series for last n days: count per day. */
export function dailySeries(completions: CompletionRecord[], n: number, tz?: string): { date: string; count: number }[] {
  const today = todayDateStr(tz);
  const dates: string[] = [];
  for (let i = n - 1; i >= 0; i--) dates.push(addDays(today, -i));
  const map = countsByDate(completions, dates);
  return dates.map((d) => ({ date: d, count: map.get(d) || 0 }));
}

/** Monthly summary for current month: completed days / perfect days / consistency %. */
export function monthSummary(completions: CompletionRecord[], tz?: string) {
  const today = todayDateStr(tz);
  const monthPrefix = today.slice(0, 7);
  const monthCompletions = completions.filter((c) => c.date.startsWith(monthPrefix) && ALL_HABIT_IDS.includes(c.habitId));
  const byDate = new Map<string, Set<HabitId>>();
  for (const c of monthCompletions) {
    if (!byDate.has(c.date)) byDate.set(c.date, new Set());
    byDate.get(c.date)!.add(c.habitId);
  }
  const dayOfMonth = parseInt(today.slice(8, 10), 10);
  const perfect = Array.from(byDate.values()).filter((s) => s.size === 4).length;
  const completedDays = byDate.size;
  const totalPossible = dayOfMonth * 4;
  const consistency = totalPossible > 0 ? Math.round((monthCompletions.length / totalPossible) * 100) : 0;
  return { monthPrefix, completedDays, perfect, consistency, totalCompletions: monthCompletions.length };
}

export function bestStreakAcrossHabits(completions: CompletionRecord[], tz?: string): number {
  let best = 0;
  for (const h of ALL_HABIT_IDS) {
    const s = habitStreak(completions, h, tz);
    if (s.best > best) best = s.best;
  }
  const o = overallStreak(completions, tz);
  if (o.best > best) best = o.best;
  return best;
}

// ========================
// DSA-specific logic
// ========================

/** Map of date -> DsaRecord for quick lookup. */
export function dsaRecordMap(dsaRecords: DsaRecord[]): Map<string, DsaRecord> {
  const map = new Map<string, DsaRecord>();
  for (const r of dsaRecords) map.set(r.date, r);
  return map;
}

/** Get today's DSA record (or null). */
export function todayDsaRecord(dsaRecords: DsaRecord[], tz?: string): DsaRecord | null {
  const today = todayDateStr(tz);
  return dsaRecords.find((r) => r.date === today) ?? null;
}

/** Set of dates where the DSA target goal was met (count >= targetGoal). */
export function dsaTargetDates(dsaRecords: DsaRecord[], targetGoal: number): Set<string> {
  return new Set(dsaRecords.filter((r) => r.targetMet && r.count >= targetGoal).map((r) => r.date));
}

/** Set of dates where at least the minimum goal was met. */
export function dsaMinDates(dsaRecords: DsaRecord[]): Set<string> {
  return new Set(dsaRecords.filter((r) => r.minGoalMet && r.count > 0).map((r) => r.date));
}

/** DSA streak stats — streak counts days where the MINIMUM goal was met (at least 1 question).
 *  The target goal is tracked separately for analytics, but does not affect the streak. */
export function dsaStreak(dsaRecords: DsaRecord[], tz?: string): StreakStats {
  const minSet = dsaMinDates(dsaRecords);
  return computeStreak(minSet, tz);
}

/** Total DSA questions solved across all records. */
export function totalDsaQuestions(dsaRecords: DsaRecord[]): number {
  return dsaRecords.reduce((sum, r) => sum + r.count, 0);
}

/** DSA weekly analytics. */
export interface DsaWeekAnalytics {
  totalQuestions: number;
  avgPerDay: number;
  minGoalDays: number;
  targetGoalDays: number;
  currentStreak: number;
  bestStreak: number;
  totalAllTime: number;
  daily: { date: string; count: number; label: string }[];
}

export function dsaWeekAnalytics(
  dsaRecords: DsaRecord[],
  targetGoal: number,
  tz?: string
): DsaWeekAnalytics {
  const today = todayDateStr(tz);
  const weekStart = startOfWeek(today);
  const recMap = dsaRecordMap(dsaRecords);

  const weekDays: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = addDays(weekStart, i);
    if (d > today) break;
    weekDays.push(d);
  }

  let totalQuestions = 0;
  let minGoalDays = 0;
  let targetGoalDays = 0;
  const daily: { date: string; count: number; label: string }[] = [];

  // Full Mon-Sun for chart
  for (let i = 0; i < 7; i++) {
    const d = addDays(weekStart, i);
    const rec = recMap.get(d);
    const count = rec?.count ?? 0;
    daily.push({ date: d, count, label: dayName(d) });
  }

  for (const d of weekDays) {
    const rec = recMap.get(d);
    if (!rec) continue;
    totalQuestions += rec.count;
    if (rec.minGoalMet && rec.count > 0) minGoalDays++;
    if (rec.targetMet && rec.count >= targetGoal) targetGoalDays++;
  }

  const streak = dsaStreak(dsaRecords, tz);
  const daysCount = weekDays.length || 1;

  return {
    totalQuestions,
    avgPerDay: Math.round((totalQuestions / daysCount) * 10) / 10,
    minGoalDays,
    targetGoalDays,
    currentStreak: streak.current,
    bestStreak: streak.best,
    totalAllTime: totalDsaQuestions(dsaRecords),
    daily,
  };
}

/** DSA monthly analytics — daily counts for the current month. */
export function dsaMonthAnalytics(
  dsaRecords: DsaRecord[],
  targetGoal: number,
  tz?: string
): { daily: { date: string; count: number; label: string }[]; totalQuestions: number; minGoalDays: number; targetGoalDays: number } {
  const today = todayDateStr(tz);
  const monthPrefix = today.slice(0, 7);
  const recMap = dsaRecordMap(dsaRecords);
  const dayOfMonth = parseInt(today.slice(8, 10), 10);

  const daily: { date: string; count: number; label: string }[] = [];
  let totalQuestions = 0;
  let minGoalDays = 0;
  let targetGoalDays = 0;

  for (let d = 1; d <= dayOfMonth; d++) {
    const dateStr = `${monthPrefix}-${String(d).padStart(2, '0')}`;
    const rec = recMap.get(dateStr);
    const count = rec?.count ?? 0;
    daily.push({ date: dateStr, count, label: String(d) });
    if (rec) {
      totalQuestions += rec.count;
      if (rec.minGoalMet && rec.count > 0) minGoalDays++;
      if (rec.targetMet && rec.count >= targetGoal) targetGoalDays++;
    }
  }

  return { daily, totalQuestions, minGoalDays, targetGoalDays };
}

// ========================
// Productive Day logic
// ========================

/** Set of dates where at least one of the four habits was completed. */
export function habitActivityDates(completions: CompletionRecord[]): Set<string> {
  return new Set(
    completions
      .filter((c) => ALL_HABIT_IDS.includes(c.habitId))
      .map((c) => c.date)
  );
}

/** Set of dates where at least one custom productive activity was logged. */
export function productiveActivityDates(activities: ProductiveActivity[]): Set<string> {
  return new Set(activities.map((a) => a.date));
}

/** Union of all productive dates: habit completions + custom productive activities. */
export function allProductiveDates(
  completions: CompletionRecord[],
  activities: ProductiveActivity[]
): Set<string> {
  return new Set([
    ...habitActivityDates(completions),
    ...productiveActivityDates(activities),
  ]);
}

export interface ProductiveStreakStats extends StreakStats {
  totalProductiveDays: number;
}

/** Overall productive streak — consecutive calendar days with at least one productive activity. */
export function productiveStreak(
  completions: CompletionRecord[],
  activities: ProductiveActivity[],
  tz?: string
): ProductiveStreakStats {
  const dates = allProductiveDates(completions, activities);
  const stats = computeStreak(dates, tz);
  return {
    ...stats,
    totalProductiveDays: dates.size,
  };
}

/** Productive days in a given month (set of date strings). */
export function productiveDaysInMonth(
  completions: CompletionRecord[],
  activities: ProductiveActivity[],
  monthPrefix: string
): Set<string> {
  const all = allProductiveDates(completions, activities);
  return new Set(Array.from(all).filter((d) => d.startsWith(monthPrefix)));
}

// ========================
// Secondary habit helpers
// ========================

/** Completion status for secondary habits on a given date. */
export function secondaryHabitsForDate(
  completions: CompletionRecord[],
  date: string
): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  for (const h of SECONDARY_HABIT_IDS) {
    result[h] = completions.some((c) => c.habitId === h && c.date === date);
  }
  return result;
}

/** Productive activities for a given date. */
export function activitiesForDate(activities: ProductiveActivity[], date: string): ProductiveActivity[] {
  return activities.filter((a) => a.date === date);
}

/** Last n days of productive status for calendar/heatmap. */
export function productiveDaysLastN(
  completions: CompletionRecord[],
  activities: ProductiveActivity[],
  n: number,
  tz?: string
): { date: string; productive: boolean }[] {
  const days = lastNDays(n, tz);
  const allDates = allProductiveDates(completions, activities);
  return days.map((d) => ({ date: d, productive: allDates.has(d) }));
}
