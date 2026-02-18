import { existsSync } from "node:fs";
import { commandError, parseCommandArgs } from "../lib/cli";
import { saveContext } from "../lib/file";
import { TIME_FILE } from "../lib/errors";
import { emptyContext } from "../lib/context";

export function initCommand(args: string[]): void {
  const parsed = parseCommandArgs(args, {
    timezone: { type: "string" },
    force: { type: "boolean" },
  });

  if (existsSync(TIME_FILE) && !parsed.values.force) {
    commandError("Error: time.md already exists. Use --force to overwrite.");
  }

  const context = emptyContext(parsed.values.timezone);
  const rendered = saveContext(context);
  process.stdout.write(rendered);
}
