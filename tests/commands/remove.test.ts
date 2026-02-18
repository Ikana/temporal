import { describe, expect, test } from "bun:test";
import { runCli, withTempDir } from "../helpers/cli";

describe("temporal remove", () => {
  test("removes event from timeline and sequences", () => {
    withTempDir((dir) => {
      expect(runCli(["init"], dir).status).toBe(0);
      expect(runCli(["add", "a", "--on", "2020-01-01"], dir).status).toBe(0);
      expect(runCli(["add", "b", "--in", "1 day"], dir).status).toBe(0);
      expect(runCli(["seq", "flow", "a", "b"], dir).status).toBe(0);

      const removed = runCli(["remove", "a"], dir);
      expect(removed.status).toBe(0);
      expect(removed.stdout).not.toContain("| a |");
      expect(removed.stdout).not.toContain("flow\na");
    });
  });

  test("errors on nonexistent event with available list", () => {
    withTempDir((dir) => {
      expect(runCli(["init"], dir).status).toBe(0);
      expect(runCli(["add", "existing", "--in", "1 day"], dir).status).toBe(0);

      const result = runCli(["remove", "missing"], dir);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("Available events");
      expect(result.stderr).toContain("existing");
    });
  });
});
