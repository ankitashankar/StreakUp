// Date utilities — all streak logic uses local calendar dates (YYYY-MM-DD).

export function todayDateStr(tz?: string): string {
  const now = tz ? toDateInTz(new Date(), tz) : new Date();
  return formatDate(now);
}

export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(s: string, n: number): string {
  const d = parseDate(s);
  d.setDate(d.getDate() + n);
  return formatDate(d);
}

export function diffDays(a: string, b: string): number {
  const da = parseDate(a);
  const db = parseDate(b);
  return Math.round((da.getTime() - db.getTime()) / 86400000);
}

function toDateInTz(d: Date, tz: string): Date {
  // Convert a UTC instant to the wall-clock time in the given timezone.
  try {
    const s = d.toLocaleString('en-US', { timeZone: tz, hour12: false });
    return new Date(s);
  } catch {
    return d;
  }
}

export function isToday(s: string, tz?: string): boolean {
  return s === todayDateStr(tz);
}

export function isFuture(s: string, tz?: string): boolean {
  return s > todayDateStr(tz);
}

export function dayName(s: string): string {
  return parseDate(s).toLocaleDateString('en-US', { weekday: 'short' });
}

export function prettyDate(s: string): string {
  return parseDate(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function monthName(s: string): string {
  return parseDate(s).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/** Returns array of last N day strings ending today (inclusive), oldest first. */
export function lastNDays(n: number, tz?: string): string[] {
  const today = todayDateStr(tz);
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(addDays(today, -i));
  return out;
}

/** Week starting Monday containing the given date. Returns 7 dates oldest-first. */
export function weekContaining(s: string): string[] {
  const d = parseDate(s);
  const day = d.getDay(); // 0=Sun
  const offset = day === 0 ? -6 : 1 - day; // shift to Monday
  const monday = addDays(s, offset);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

export function startOfWeek(s: string): string {
  return weekContaining(s)[0];
}

export function isSameMonth(a: string, b: string): boolean {
  return a.slice(0, 7) === b.slice(0, 7);
}
