import { existsSync, readFileSync, writeFileSync } from "node:fs";
import type { TimeContext } from "../types";
import { CliError, MISSING_SCRATCH_FILE_ERROR, MISSING_TIME_FILE_ERROR, TIME_FILE } from "./errors";
import { parseTimeContext } from "./parser";
import { renderTimeContext } from "./renderer";
import { scratchFilePath } from "./scratch";

function readMarkdownFile(path: string, missingMessage: string): string {
  if (!existsSync(path)) {
    throw new CliError(missingMessage);
  }
  return readFileSync(path, "utf8");
}

export function readTimeFile(): string {
  return readMarkdownFile(TIME_FILE, MISSING_TIME_FILE_ERROR);
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

export function loadScratchContext(label?: string): TimeContext {
  const content = readMarkdownFile(scratchFilePath(label), MISSING_SCRATCH_FILE_ERROR);
  return parseTimeContext(content);
}

export function saveScratchContext(context: TimeContext, label?: string): string {
  const rendered = renderTimeContext(context, { includeMetaSections: false });
  writeFileSync(scratchFilePath(label), rendered, "utf8");
  return rendered;
}

export function printMarkdown(markdown: string): void {
  process.stdout.write(markdown);
}
