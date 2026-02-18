import { describe, expect, test } from "bun:test";
import { parseDateInput } from "../../src/lib/date-parse";

const BASE = new Date("2026-02-17T12:00:00Z");

describe("parseDateInput", () => {
  test("parses ISO dates", () => {
    const date = parseDateInput("2026-02-20", BASE);
    expect(date.toISOString().startsWith("2026-02-20")).toBe(true);
  });

  test("parses relative keywords", () => {
    expect(parseDateInput("tomorrow", BASE).toISOString()).toBe("2026-02-18T12:00:00.000Z");
    expect(parseDateInput("yesterday", BASE).toISOString()).toBe("2026-02-16T12:00:00.000Z");
  });

  test("parses next weekday", () => {
    const nextMonday = parseDateInput("next monday", BASE);
    expect(nextMonday.toISOString()).toBe("2026-02-23T12:00:00.000Z");
  });

  test("parses common date format", () => {
    const date = parseDateInput("Feb 20 2026", BASE);
    expect(date.toISOString().startsWith("2026-02-20")).toBe(true);
  });

  test("parses duration expressions", () => {
    const date = parseDateInput("2 days ago", BASE);
    expect(date.toISOString()).toBe("2026-02-15T12:00:00.000Z");
  });

  test("rejects invalid date", () => {
    expect(() => parseDateInput("totally invalid", BASE)).toThrow();
  });
});
