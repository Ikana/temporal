import { existsSync, readdirSync } from "node:fs";
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

  try {
    const scratchFiles = readdirSync(process.cwd()).filter((name) => /^time-scratch.*\.md$/i.test(name));
    if (scratchFiles.length > 0) {
      process.stderr.write(
        "Warning: Scratch pad files found in this directory. If you need an ephemeral\n" +
          "timeline, use 'temporal scratch' instead. 'temporal init' creates a persistent\n" +
          "project timeline.\n",
      );
    }
  } catch {
    // Best-effort warning only; init should still proceed if listing fails.
  }

  const context = emptyContext(parsed.values.timezone);
  const rendered = saveContext(context);
  process.stdout.write(rendered);
}
