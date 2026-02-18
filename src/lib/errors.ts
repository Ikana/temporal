export const TIME_FILE = "time.md";
export const MISSING_TIME_FILE_ERROR = "Error: time.md not found. Run 'temporal init' first.";

export class CliError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CliError";
  }
}

export function fail(message: string): never {
  throw new CliError(message);
}

export function isCliError(error: unknown): error is CliError {
  return error instanceof CliError;
}
