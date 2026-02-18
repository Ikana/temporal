import { commandError } from "./cli";
import { parseDateInput } from "./date-parse";
import { parseDuration } from "./duration";

export function parseEventDate(
  inValue: string | undefined,
  onValue: string | undefined,
  atValue: string | undefined,
  now: Date,
): Date {
  const count = Number(Boolean(inValue)) + Number(Boolean(onValue)) + Number(Boolean(atValue));
  if (count !== 1) {
    commandError("Error: Provide exactly one of --in, --on, or --at.");
  }

  if (inValue) {
    const parsed = parseDuration(inValue);
    return new Date(now.getTime() + (parsed.direction === "future" ? parsed.ms : -parsed.ms));
  }

  if (onValue) {
    return parseDateInput(onValue, now);
  }

  const atDate = new Date(atValue!);
  if (Number.isNaN(atDate.getTime())) {
    commandError("Error: Could not parse --at datetime. Use an ISO datetime like 2026-02-20T14:00:00Z.");
  }

  return atDate;
}
