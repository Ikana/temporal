import { commandError } from "../lib/cli";
import { allEvents } from "../lib/context";
import { loadContext, saveContext } from "../lib/file";

export function seqCommand(args: string[]): void {
  const name = args[0];
  const events = args.slice(1);

  if (!name) {
    commandError("Error: Missing sequence name. Usage: temporal seq <name> <event1> <event2> [...]");
  }
  if (events.length < 2) {
    commandError("Error: Sequence requires at least 2 events.");
  }

  const context = loadContext((message) => process.stderr.write(`Warning: ${message}\n`));
  const known = new Set(allEvents(context).map((event) => event.name.toLowerCase()));
  const unknown = events.filter((eventName) => !known.has(eventName.toLowerCase()));
  if (unknown.length > 0) {
    process.stderr.write(`Warning: Unknown events in sequence '${name}': ${unknown.join(", ")}\n`);
  }

  const index = context.sequences.findIndex((sequence) => sequence.name.toLowerCase() === name.toLowerCase());
  if (index >= 0) {
    context.sequences[index] = { name, events };
  } else {
    context.sequences.push({ name, events });
  }

  process.stdout.write(saveContext(context));
}
