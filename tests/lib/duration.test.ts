import { describe, expect, test } from "bun:test";
import { parseDuration } from "../../src/lib/duration";

describe("parseDuration", () => {
  test("parses all supported units", () => {
    expect(parseDuration("30 minutes").ms).toBe(30 * 60 * 1000);
    expect(parseDuration("2 hours").ms).toBe(2 * 60 * 60 * 1000);
    expect(parseDuration("3 days").ms).toBe(3 * 24 * 60 * 60 * 1000);
    expect(parseDuration("2 weeks").ms).toBe(2 * 7 * 24 * 60 * 60 * 1000);
    expect(parseDuration("1 month").ms).toBe(30 * 24 * 60 * 60 * 1000);
  });

  test("parses direction with ago and in", () => {
    expect(parseDuration("5 days ago").direction).toBe("past");
    expect(parseDuration("in 5 days").direction).toBe("future");
    expect(parseDuration("2 days from now").direction).toBe("future");
  });

  test("supports decimals", () => {
    const parsed = parseDuration("1.5 hours");
    expect(parsed.ms).toBe(1.5 * 60 * 60 * 1000);
  });

  test("rejects invalid input", () => {
    expect(() => parseDuration("abc")).toThrow();
    expect(() => parseDuration("3 lightyears")).toThrow();
  });
});
