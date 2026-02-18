import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { runCli, withTempDir } from "../helpers/cli";

describe("temporal add", () => {
  test("adds future event with --in", () => {
    withTempDir((dir) => {
      expect(runCli(["init"], dir).status).toBe(0);
      const result = runCli(["add", "sprint review", "--in", "2 days"], dir);
      expect(result.status).toBe(0);
      const content = readFileSync(`${dir}/time.md`, "utf8");
      expect(content).toContain("sprint review");
      expect(content).toContain("ahead");
    });
  });

  test("adds past event with --on", () => {
    withTempDir((dir) => {
      expect(runCli(["init"], dir).status).toBe(0);
      const result = runCli(["add", "v1 released", "--on", "2020-01-01"], dir);
      expect(result.status).toBe(0);
      const content = readFileSync(`${dir}/time.md`, "utf8");
      expect(content).toContain("v1 released");
      expect(content).toContain("behind");
    });
  });

  test("maintains sort order and supports type/notes", () => {
    withTempDir((dir) => {
      expect(runCli(["init"], dir).status).toBe(0);
      expect(runCli(["add", "later", "--in", "5 days"], dir).status).toBe(0);
      expect(runCli(["add", "sooner", "--in", "2 days", "--type", "meeting", "--notes", "demo"], dir).status).toBe(0);

      const content = readFileSync(`${dir}/time.md`, "utf8");
      expect(content.indexOf("sooner")).toBeLessThan(content.indexOf("later"));
      expect(content).toContain("| meeting | demo |");
    });
  });

  test("rejects duplicate names", () => {
    withTempDir((dir) => {
      expect(runCli(["init"], dir).status).toBe(0);
      expect(runCli(["add", "deadline", "--in", "1 day"], dir).status).toBe(0);
      const second = runCli(["add", "deadline", "--in", "2 days"], dir);
      expect(second.status).toBe(1);
      expect(second.stderr).toContain("already exists");
    });
  });

  test("requires exactly one time specifier", () => {
    withTempDir((dir) => {
      expect(runCli(["init"], dir).status).toBe(0);
      const result = runCli(["add", "bad", "--in", "1 day", "--on", "2026-02-20"], dir);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("exactly one");
    });
  });
});
