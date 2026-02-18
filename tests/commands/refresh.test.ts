import { describe, expect, test } from "bun:test";
import { writeFileSync } from "node:fs";
import { runCli, withTempDir } from "../helpers/cli";

const STALE = `# Time Context

## Now
- **timestamp**: 2026-02-10T10:00:00.000Z
- **weekday**: Tuesday
- **week**: 7 of 52
- **quarter**: Q1 2026
- **timezone**: UTC

## Timeline

### Behind (Past)

| distance | event | type | notes | iso |
|----------|-------|------|-------|-----|

### Ahead (Future)

| distance | event | type | notes | iso |
|----------|-------|------|-------|-----|
| 1 day ahead | crossing-event | milestone | | 2026-02-11T10:00:00.000Z |

## Sequences

### cycle
crossing-event

## Durations

| span | from | to | length |
|------|------|----|--------|
`;

describe("temporal refresh", () => {
  test("updates NOW, recalculates distances, and reclassifies events", () => {
    withTempDir((dir) => {
      writeFileSync(`${dir}/time.md`, STALE, "utf8");
      const result = runCli(["refresh"], dir);
      expect(result.status).toBe(0);
      expect(result.stdout).not.toContain("2026-02-10T10:00:00.000Z");
      expect(result.stdout).toContain("crossing-event");
      expect(result.stdout).toContain("behind");
      expect(result.stdout).toContain("crossing-event → [NOW]");
    });
  });
});
