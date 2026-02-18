import { describe, expect, test } from "bun:test";
import { formatDistance } from "../../src/lib/distance";

const NOW = new Date("2026-02-17T12:00:00Z");

describe("formatDistance", () => {
  test("formats minutes", () => {
    const target = new Date("2026-02-17T12:30:00Z");
    expect(formatDistance(target, NOW)).toBe("30 minutes ahead");
  });

  test("formats hours", () => {
    const target = new Date("2026-02-17T18:00:00Z");
    expect(formatDistance(target, NOW)).toBe("6 hours ahead");
  });

  test("formats days", () => {
    const target = new Date("2026-02-20T12:00:00Z");
    expect(formatDistance(target, NOW)).toBe("3 days ahead");
  });

  test("formats weeks", () => {
    const target = new Date("2026-03-03T12:00:00Z");
    expect(formatDistance(target, NOW)).toBe("2 weeks ahead");
  });

  test("formats months", () => {
    const target = new Date("2026-06-17T12:00:00Z");
    expect(formatDistance(target, NOW)).toBe("4 months ahead");
  });

  test("formats behind", () => {
    const target = new Date("2026-02-16T12:00:00Z");
    expect(formatDistance(target, NOW)).toBe("1 day behind");
  });
});
