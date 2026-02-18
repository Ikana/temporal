import { commandError, parseCommandArgs } from "../lib/cli";
import { hasEventName, upsertEvent } from "../lib/context";
import { parseEventDate } from "../lib/event-date";
import { loadContext, saveContext } from "../lib/file";

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
