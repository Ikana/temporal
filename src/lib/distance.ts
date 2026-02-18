import type { Event } from "../types";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;

function pluralize(value: number, unit: string): string {
  return `${value} ${unit}${value === 1 ? "" : "s"}`;
}

function unitForMs(ms: number): { value: number; unit: string } {
  if (ms < HOUR) {
    return { value: Math.round(ms / MINUTE), unit: "minute" };
  }
  if (ms < DAY) {
    return { value: Math.round(ms / HOUR), unit: "hour" };
  }
  if (ms < 14 * DAY) {
    return { value: Math.round(ms / DAY), unit: "day" };
  }
  if (ms < 8 * WEEK) {
    return { value: Math.round(ms / WEEK), unit: "week" };
  }
  return { value: Math.round(ms / MONTH), unit: "month" };
}

export function formatDistance(target: Date, now: Date): string {
  const diff = target.getTime() - now.getTime();
  const abs = Math.abs(diff);
  const { value, unit } = unitForMs(abs);
  const amount = Math.max(0, value);
  const direction = diff >= 0 ? "ahead" : "behind";
  return `${pluralize(amount, unit)} ${direction}`;
}

export function formatLength(ms: number): string {
  const abs = Math.abs(ms);
  const { value, unit } = unitForMs(abs);
  return pluralize(Math.max(0, value), unit);
}

export function classifyPosition(target: Date, now: Date): "behind" | "ahead" {
  return target.getTime() < now.getTime() ? "behind" : "ahead";
}

export function sortTimelineEvents(events: Event[]): Event[] {
  return [...events].sort((a, b) => new Date(a.iso).getTime() - new Date(b.iso).getTime());
}
