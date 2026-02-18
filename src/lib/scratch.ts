import { fail } from "./errors";

const SCRATCH_DIR = "/tmp";
const SCRATCH_BASENAME = "time-scratch";

export function sanitizeLabel(input: string): string {
  const sanitized = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!sanitized) {
    fail(`Error: Label '${input}' contains no valid characters.`);
  }

  return sanitized;
}

export function scratchFilePath(label?: string): string {
  if (label === undefined) {
    return `${SCRATCH_DIR}/${SCRATCH_BASENAME}.md`;
  }

  return `${SCRATCH_DIR}/${SCRATCH_BASENAME}-${sanitizeLabel(label)}.md`;
}
