import { commandError } from "../lib/cli";
import { allEvents } from "../lib/context";
import { loadContext, saveContext } from "../lib/file";

export function removeCommand(args: string[]): void {
  const target = args[0];
  if (!target) {
    commandError("Error: Missing event name. Usage: temporal remove <event>");
  }

  const context = loadContext((message) => process.stderr.write(`Warning: ${message}\n`));
  const key = target.toLowerCase();

  const beforeCount = context.behindEvents.length + context.aheadEvents.length;

  context.behindEvents = context.behindEvents.filter((event) => event.name.toLowerCase() !== key);
  context.aheadEvents = context.aheadEvents.filter((event) => event.name.toLowerCase() !== key);

  for (const sequence of context.sequences) {
    sequence.events = sequence.events.filter((eventName) => eventName.toLowerCase() !== key);
  }

  const afterCount = context.behindEvents.length + context.aheadEvents.length;
  if (afterCount === beforeCount) {
    const available = allEvents(context)
      .map((event) => event.name)
      .sort((a, b) => a.localeCompare(b));
    commandError(`Error: Event '${target}' not found. Available events: ${available.join(", ") || "none"}`);
  }

  process.stdout.write(saveContext(context));
}
