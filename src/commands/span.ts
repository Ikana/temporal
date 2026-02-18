import { commandError, parseCommandArgs } from "../lib/cli";
import { parseDateInput } from "../lib/date-parse";
import { formatDistance, formatLength } from "../lib/distance";
import { loadContext, saveContext } from "../lib/file";

export function spanCommand(args: string[]): void {
  const parsed = parseCommandArgs(args, {
    from: { type: "string" },
    to: { type: "string" },
  });

  const name = parsed.positionals[0];
  if (!name) {
    commandError("Error: Missing span name. Usage: temporal span <name> --from <when> --to <when>");
  }

  const fromInput = parsed.values.from;
  const toInput = parsed.values.to;
  if (!fromInput || !toInput) {
    commandError("Error: span requires both --from and --to.");
  }

  const context = loadContext((message) => process.stderr.write(`Warning: ${message}\n`));
  const now = new Date(context.now.timestamp);
  const fromDate = parseDateInput(fromInput, now);
  const toDate = parseDateInput(toInput, now);

  if (fromDate.getTime() > toDate.getTime()) {
    commandError("Error: --from must be before --to.");
  }

  const span = {
    name,
    from: formatDistance(fromDate, now),
    to: formatDistance(toDate, now),
    length: formatLength(toDate.getTime() - fromDate.getTime()),
  };

  const index = context.spans.findIndex((item) => item.name.toLowerCase() === name.toLowerCase());
  if (index >= 0) {
    context.spans[index] = span;
  } else {
    context.spans.push(span);
  }

  process.stdout.write(saveContext(context));
}
