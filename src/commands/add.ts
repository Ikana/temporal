import { commandError, parseCommandArgs } from "../lib/cli";
import { hasEventName, upsertEvent } from "../lib/context";
import { parseDateInput } from "../lib/date-parse";
import { parseDuration } from "../lib/duration";
import { loadContext, saveContext } from "../lib/file";

function parseEventDate(inValue: string | undefined, onValue: string | undefined, atValue: string | undefined, now: Date): Date {
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

export function addCommand(args: string[]): void {
  const parsed = parseCommandArgs(args, {
    in: { type: "string" },
    on: { type: "string" },
    at: { type: "string" },
    type: { type: "string" },
    notes: { type: "string" },
  });

  const eventName = parsed.positionals[0];
  if (!eventName) {
    commandError("Error: Missing event name. Usage: temporal add <event> (--in|--on|--at ...)");
  }

  const context = loadContext((message) => process.stderr.write(`Warning: ${message}\n`));
  if (hasEventName(context, eventName)) {
    commandError(`Error: Event '${eventName}' already exists. Use a distinct name.`);
  }

  const now = new Date(context.now.timestamp);
  const eventDate = parseEventDate(parsed.values.in, parsed.values.on, parsed.values.at, now);

  upsertEvent(context, {
    name: eventName,
    iso: eventDate.toISOString(),
    distance: "",
    type: parsed.values.type,
    notes: parsed.values.notes,
  });

  process.stdout.write(saveContext(context));
}
