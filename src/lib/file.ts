import { existsSync, readFileSync, writeFileSync } from "node:fs";
import type { TimeContext } from "../types";
import { CliError, MISSING_TIME_FILE_ERROR, TIME_FILE } from "./errors";
import { parseTimeContext } from "./parser";
import { renderTimeContext } from "./renderer";

export function readTimeFile(): string {
  if (!existsSync(TIME_FILE)) {
    throw new CliError(MISSING_TIME_FILE_ERROR);
  }
  return readFileSync(TIME_FILE, "utf8");
}

export function writeTimeFile(content: string): void {
  writeFileSync(TIME_FILE, content, "utf8");
}

export function loadContext(warn?: (message: string) => void): TimeContext {
  const content = readTimeFile();
  return parseTimeContext(content, { warn });
}

export function saveContext(context: TimeContext): string {
  const rendered = renderTimeContext(context);
  writeTimeFile(rendered);
  return rendered;
}

export function printMarkdown(markdown: string): void {
  process.stdout.write(markdown);
}
