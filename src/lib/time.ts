import type { Now } from "../types";

function isValidTimezone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

export function detectTimezone(preferred?: string): string {
  const candidates = [preferred, process.env.TZ, Intl.DateTimeFormat().resolvedOptions().timeZone, "UTC"];
  for (const candidate of candidates) {
    if (candidate && isValidTimezone(candidate)) {
      return candidate;
    }
  }
  return "UTC";
}

function getWeekday(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: timezone }).format(date);
}

function isoWeekNumber(date: Date): number {
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  return Math.ceil((((utcDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function isoWeeksInYear(year: number): number {
  return isoWeekNumber(new Date(Date.UTC(year, 11, 28)));
}

function quarterForDate(date: Date): string {
  const month = date.getUTCMonth();
  const quarter = Math.floor(month / 3) + 1;
  return `Q${quarter} ${date.getUTCFullYear()}`;
}

export function buildNow(date: Date = new Date(), timezone?: string): Now {
  const resolvedTimezone = detectTimezone(timezone);
  const year = date.getUTCFullYear();
  return {
    timestamp: date.toISOString(),
    weekday: getWeekday(date, resolvedTimezone),
    week: `${isoWeekNumber(date)} of ${isoWeeksInYear(year)}`,
    quarter: quarterForDate(date),
    timezone: resolvedTimezone,
  };
}
