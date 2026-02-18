import { closeSync, constants, existsSync, openSync, readFileSync, writeFileSync } from "node:fs";
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

function noFollowFlag(): number {
  return typeof constants.O_NOFOLLOW === "number" ? constants.O_NOFOLLOW : 0;
}

function readScratchFile(path: string): string {
  let fd: number;
  try {
    fd = openSync(path, constants.O_RDONLY | noFollowFlag());
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      throw new CliError(MISSING_SCRATCH_FILE_ERROR);
    }
    if (code === "ELOOP") {
      throw new CliError(`Error: Refusing to follow symlink at '${path}'.`);
    }
    throw error;
  }

  try {
    return readFileSync(fd, "utf8");
  } finally {
    closeSync(fd);
  }
}

function writeScratchFile(path: string, content: string): void {
  let fd: number;
  try {
    fd = openSync(path, constants.O_WRONLY | constants.O_CREAT | constants.O_TRUNC | noFollowFlag(), 0o600);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ELOOP") {
      throw new CliError(`Error: Refusing to follow symlink at '${path}'.`);
    }
    throw error;
  }

  try {
    writeFileSync(fd, content, "utf8");
  } finally {
    closeSync(fd);
  }
}

export function loadScratchContext(label?: string): TimeContext {
  const content = readScratchFile(scratchFilePath(label));
  return parseTimeContext(content);
}

export function saveScratchContext(context: TimeContext, label?: string): string {
  const rendered = renderTimeContext(context, { includeMetaSections: false });
  writeScratchFile(scratchFilePath(label), rendered);
  return rendered;
}

export function printMarkdown(markdown: string): void {
  process.stdout.write(markdown);
}
