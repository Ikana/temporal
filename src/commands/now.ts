import { buildNow } from "../lib/time";
import { loadContext, saveContext } from "../lib/file";
import { parseCommandArgs } from "../lib/cli";

export function nowCommand(args: string[]): void {
  const parsed = parseCommandArgs(args, {
    timezone: { type: "string" },
  });

  const context = loadContext((message) => process.stderr.write(`Warning: ${message}\n`));
  const timezone = parsed.values.timezone || context.now.timezone;
  context.now = buildNow(new Date(), timezone);
  process.stdout.write(saveContext(context));
}
