import { describe, expect, test } from "bun:test";
import { runCli, withTempDir } from "../helpers/cli";

describe("temporal seq", () => {
  test("places [NOW] between past and future events", () => {
    withTempDir((dir) => {
      expect(runCli(["init"], dir).status).toBe(0);
      expect(runCli(["add", "past", "--on", "2020-01-01"], dir).status).toBe(0);
      expect(runCli(["add", "future", "--in", "1 day"], dir).status).toBe(0);

      const result = runCli(["seq", "release-cycle", "past", "future"], dir);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain("past → [NOW] → future");
    });
  });

  test("places [NOW] at end when all events are past", () => {
    withTempDir((dir) => {
      expect(runCli(["init"], dir).status).toBe(0);
      expect(runCli(["add", "old1", "--on", "2020-01-01"], dir).status).toBe(0);
      expect(runCli(["add", "old2", "--on", "2020-01-02"], dir).status).toBe(0);

      const result = runCli(["seq", "all-past", "old1", "old2"], dir);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain("old1 → old2 → [NOW]");
    });
  });

  test("places [NOW] at start when all events are future", () => {
    withTempDir((dir) => {
      expect(runCli(["init"], dir).status).toBe(0);
      expect(runCli(["add", "new1", "--in", "1 day"], dir).status).toBe(0);
      expect(runCli(["add", "new2", "--in", "2 days"], dir).status).toBe(0);

      const result = runCli(["seq", "all-future", "new1", "new2"], dir);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain("[NOW] → new1 → new2");
    });
  });

  test("warns on unknown events", () => {
    withTempDir((dir) => {
      expect(runCli(["init"], dir).status).toBe(0);
      expect(runCli(["add", "known", "--in", "1 day"], dir).status).toBe(0);

      const result = runCli(["seq", "mixed", "known", "unknown"], dir);
      expect(result.status).toBe(0);
      expect(result.stderr).toContain("Warning: Unknown events");
    });
  });

  test("rejects fewer than 2 events", () => {
    withTempDir((dir) => {
      expect(runCli(["init"], dir).status).toBe(0);
      const result = runCli(["seq", "bad", "onlyone"], dir);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("at least 2");
    });
  });
});
