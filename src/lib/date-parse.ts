import { parseDuration } from "./duration";

const WEEKDAY: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

function addMs(date: Date, ms: number): Date {
  return new Date(date.getTime() + ms);
}

function parseRelativeKeyword(value: string, base: Date): Date | null {
  if (value === "today") {
    return new Date(base);
  }
  if (value === "tomorrow") {
    return addMs(base, 24 * 60 * 60 * 1000);
  }
  if (value === "yesterday") {
    return addMs(base, -24 * 60 * 60 * 1000);
  }

  const nextMatch = value.match(/^next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/);
  if (!nextMatch) {
    return null;
  }

  const weekday = nextMatch[1];
  if (!weekday) {
    return null;
  }
  const target = WEEKDAY[weekday];
  if (target === undefined) {
    return null;
  }
  const current = base.getDay();
  let delta = (target - current + 7) % 7;
  if (delta === 0) {
    delta = 7;
  }
  return addMs(base, delta * 24 * 60 * 60 * 1000);
}

export function parseDateInput(input: string, base: Date = new Date()): Date {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("Date input cannot be empty.");
  }

  const lower = trimmed.toLowerCase();
  const relative = parseRelativeKeyword(lower, base);
  if (relative) {
    return relative;
  }

  try {
    const duration = parseDuration(trimmed);
    return addMs(base, duration.direction === "future" ? duration.ms : -duration.ms);
  } catch {
    // fall through to Date parser
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }

  throw new Error(
    "Could not parse date. Use ISO (2026-02-20), named date (Feb 20 2026), or relative forms (tomorrow, next Monday).",
  );
}
