import { existsSync, unlinkSync } from "node:fs";
import { commandError, parseCommandArgs } from "../lib/cli";
import { emptyContext, hasEventName, upsertEvent } from "../lib/context";
import { parseEventDate } from "../lib/event-date";
import { loadScratchContext, saveScratchContext } from "../lib/file";
import { renderTimeContext } from "../lib/renderer";
import { scratchFilePath } from "../lib/scratch";

function scratchCreate(label?: string): void {
  const context = emptyContext();
  process.stdout.write(saveScratchContext(context, label));
}

function scratchAdd(args: string[]): void {
  const parsed = parseCommandArgs(args, {
    in: { type: "string" },
    on: { type: "string" },
    at: { type: "string" },
    scratch: { type: "string" },
  });

  const eventName = parsed.positionals[0];
  if (!eventName) {
    commandError("Error: Missing event name. Usage: temporal scratch add <event> (--in|--on|--at ...)");
  }

  const label = parsed.values.scratch;
  const context = loadScratchContext(label);
  if (hasEventName(context, eventName)) {
    commandError(`Error: Event '${eventName}' already exists in the scratch pad.`);
  }

  const now = new Date(context.now.timestamp);
  const eventDate = parseEventDate(parsed.values.in, parsed.values.on, parsed.values.at, now);

  upsertEvent(context, {
    name: eventName,
    iso: eventDate.toISOString(),
    distance: "",
    type: undefined,
    notes: undefined,
  });

  process.stdout.write(saveScratchContext(context, label));
}

function scratchShow(args: string[]): void {
  const parsed = parseCommandArgs(args, {
    scratch: { type: "string" },
  });

  if (parsed.positionals.length > 0) {
    commandError("Error: Usage: temporal scratch show [--scratch <label>]");
  }

  const context = loadScratchContext(parsed.values.scratch);
  process.stdout.write(renderTimeContext(context, { includeMetaSections: false }));
}

function scratchClear(args: string[]): void {
  const parsed = parseCommandArgs(args, {
    scratch: { type: "string" },
  });

  if (parsed.positionals.length > 0) {
    commandError("Error: Usage: temporal scratch clear [--scratch <label>]");
  }

  const path = scratchFilePath(parsed.values.scratch);
  if (!existsSync(path)) {
    process.stderr.write(`Warning: No scratch pad found at ${path}. Nothing to clear.\n`);
    return;
  }

  unlinkSync(path);
}

export function scratchCommand(args: string[]): void {
  const mode = args[0];
  if (mode === "add") {
    scratchAdd(args.slice(1));
    return;
  }
  if (mode === "show") {
    scratchShow(args.slice(1));
    return;
  }
  if (mode === "clear") {
    scratchClear(args.slice(1));
    return;
  }

  if (args.length > 1) {
    commandError("Error: Usage: temporal scratch [label]");
  }

  scratchCreate(mode);
}
