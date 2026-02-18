import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { runCli, withTempDir } from "../helpers/cli";

describe("temporal now", () => {
  test("updates NOW without recalculating distances", () => {
    withTempDir((dir) => {
      expect(runCli(["init"], dir).status).toBe(0);
      expect(runCli(["add", "deadline", "--in", "2 days"], dir).status).toBe(0);
      const before = readFileSync(`${dir}/time.md`, "utf8");
      const distanceLine = before.split("\n").find((line) => line.includes("deadline")) || "";

      const result = runCli(["now", "--timezone", "America/New_York"], dir);
      expect(result.status).toBe(0);

      const after = readFileSync(`${dir}/time.md`, "utf8");
      const newDistanceLine = after.split("\n").find((line) => line.includes("deadline")) || "";
      expect(newDistanceLine).toBe(distanceLine);
      expect(after).toContain("- **timezone**: America/New_York");
    });
  });

  test("errors when time.md is missing", () => {
    withTempDir((dir) => {
      const result = runCli(["now"], dir);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("time.md not found");
    });
  });
});
