import { describe, expect, test } from "bun:test";
import { renderTimeContext } from "../../src/lib/renderer";
import type { TimeContext } from "../../src/types";

const CONTEXT: TimeContext = {
  now: {
    timestamp: "2026-02-17T12:00:00.000Z",
    weekday: "Tuesday",
    week: "8 of 52",
    quarter: "Q1 2026",
    timezone: "UTC",
  },
  behindEvents: [
    {
      distance: "1 day behind",
      name: "release",
      type: "milestone",
      notes: "done",
      iso: "2026-02-16T12:00:00.000Z",
    },
  ],
  aheadEvents: [
    {
      distance: "2 days ahead",
      name: "review",
      type: "meeting",
      notes: "demo",
      iso: "2026-02-19T12:00:00.000Z",
    },
  ],
  sequences: [{ name: "release-cycle", events: ["release", "review"] }],
  spans: [{ name: "current sprint", from: "5 days behind", to: "2 days ahead", length: "7 days" }],
};

describe("renderTimeContext", () => {
  test("renders markdown structure", () => {
    const output = renderTimeContext(CONTEXT);
    expect(output).toContain("# Time Context");
    expect(output).toContain("## Now");
    expect(output).toContain("### Behind (Past)");
    expect(output).toContain("### Ahead (Future)");
    expect(output).toContain("### release-cycle");
    expect(output).toContain("release → [NOW] → review");
    expect(output).toContain("| span | from | to | length |");
  });

  test("renders filtered past and ahead views", () => {
    const past = renderTimeContext(CONTEXT, { view: "past" });
    expect(past).toContain("### Behind (Past)");
    expect(past).not.toContain("### Ahead (Future)");

    const ahead = renderTimeContext(CONTEXT, { view: "ahead" });
    expect(ahead).toContain("### Ahead (Future)");
    expect(ahead).not.toContain("### Behind (Past)");
  });
});
