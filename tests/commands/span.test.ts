import { describe, expect, test } from "bun:test";
import { runCli, withTempDir } from "../helpers/cli";

describe("temporal span", () => {
  test("creates span with correct from/to/length", () => {
    withTempDir((dir) => {
      expect(runCli(["init"], dir).status).toBe(0);
      const result = runCli(["span", "current sprint", "--from", "5 days ago", "--to", "2 days from now"], dir);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain("| current sprint |");
      expect(result.stdout).toContain("| 5 days behind |");
      expect(result.stdout).toContain("| 2 days ahead |");
      expect(result.stdout).toContain("| 7 days |");
    });
  });

  test("updates an existing span", () => {
    withTempDir((dir) => {
      expect(runCli(["init"], dir).status).toBe(0);
      expect(runCli(["span", "window", "--from", "1 day ago", "--to", "1 day from now"], dir).status).toBe(0);
      const updated = runCli(["span", "window", "--from", "2 days ago", "--to", "2 days from now"], dir);
      expect(updated.status).toBe(0);
      expect(updated.stdout.match(/\| window \|/g)?.length).toBe(1);
    });
  });

  test("errors when from is after to", () => {
    withTempDir((dir) => {
      expect(runCli(["init"], dir).status).toBe(0);
      const result = runCli(["span", "bad", "--from", "2 days from now", "--to", "1 day ago"], dir);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("before --to");
    });
  });

  test("supports date and duration inputs", () => {
    withTempDir((dir) => {
      expect(runCli(["init"], dir).status).toBe(0);
      const result = runCli(["span", "fixed", "--from", "2026-02-01", "--to", "2026-02-03"], dir);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain("| fixed |");
      expect(result.stdout).toContain("| 2 days |");
    });
  });
});
