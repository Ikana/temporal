import { loadContext } from "../lib/file";
import { renderTimeContext } from "../lib/renderer";

export function showCommand(): void {
  const context = loadContext((message) => process.stderr.write(`Warning: ${message}\n`));
  process.stdout.write(renderTimeContext(context));
}
