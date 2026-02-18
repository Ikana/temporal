import { describe, expect, test } from "bun:test";
import { parseTimeContext } from "../../src/lib/parser";
import { renderTimeContext } from "../../src/lib/renderer";

const SAMPLE = `# Time Context

## Now
- **timestamp**: 2026-02-17T12:00:00.000Z
- **weekday**: Tuesday
- **week**: 8 of 52
- **quarter**: Q1 2026
- **timezone**: UTC

## Timeline

### Behind (Past)

| distance | event | type | notes | iso |
|----------|-------|------|-------|-----|
| 1 day behind | release | milestone | done | 2026-02-16T12:00:00.000Z |

### Ahead (Future)

| distance | event | type | notes | iso |
|----------|-------|------|-------|-----|
| 2 days ahead | review | meeting | demo | 2026-02-19T12:00:00.000Z |

## Sequences

### release-cycle
release → [NOW] → review

## Durations

| span | from | to | length |
|------|------|----|--------|
| current sprint | 5 days behind | 2 days ahead | 7 days |
`;

describe("parseTimeContext", () => {
  test("parses all sections", () => {
    const parsed = parseTimeContext(SAMPLE);

    expect(parsed.now.timezone).toBe("UTC");
    expect(parsed.behindEvents).toHaveLength(1);
    expect(parsed.behindEvents[0]!.name).toBe("release");
    expect(parsed.aheadEvents).toHaveLength(1);
    expect(parsed.aheadEvents[0]!.name).toBe("review");
    expect(parsed.sequences).toHaveLength(1);
    expect(parsed.sequences[0]!.events).toEqual(["release", "review"]);
    expect(parsed.spans).toHaveLength(1);
    expect(parsed.spans[0]!.length).toBe("7 days");
  });

  test("round-trip parse->render->parse preserves model", () => {
    const first = parseTimeContext(SAMPLE);
    const rendered = renderTimeContext(first);
    const second = parseTimeContext(rendered);
    expect(second).toEqual(first);
  });
});
