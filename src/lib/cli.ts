import { parseArgs } from "node:util";
import { CliError, isCliError } from "./errors";

export const USAGE = `Usage: temporal <command> [options]

Commands:
  init [--timezone <iana_tz>] [--force]
  now [--timezone <iana_tz>]
  add <event> (--in <duration> | --on <date> | --at <datetime>) [--type <type>] [--notes <text>]
  refresh
  show
  past
  ahead
  remove <event>
  seq <name> <event1> <event2> [event3...]
  span <name> --from <when> --to <when>
  scratch [label]
  scratch create [label]
  scratch add <event> (--in <duration> | --on <date> | --at <datetime>) [--scratch <label>]
  scratch show [--scratch <label>]
  scratch clear [--scratch <label>]
`;

export function commandError(message: string): never {
  throw new CliError(message);
}

export function parseCommandArgs<T extends Record<string, { type: "boolean" | "string" }>>(
  args: string[],
  options: T,
) {
  return parseArgs({
    args,
    options,
    allowPositionals: true,
    strict: true,
  });
}

export function runWithErrors(action: () => void): number {
  try {
    action();
    return 0;
  } catch (error) {
    if (isCliError(error)) {
      process.stderr.write(`${error.message}\n`);
      return 1;
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    process.stderr.write(`Error: ${message}\n`);
    return 1;
  }
}
