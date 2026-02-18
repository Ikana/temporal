import { rebuildEventPositions } from "../lib/context";
import { loadContext, saveContext } from "../lib/file";
import { buildNow } from "../lib/time";

export function refreshCommand(): void {
  const context = loadContext((message) => process.stderr.write(`Warning: ${message}\n`));
  context.now = buildNow(new Date(), context.now.timezone);
  rebuildEventPositions(context);
  process.stdout.write(saveContext(context));
}
