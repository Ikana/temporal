import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { runCli, withTempDir } from "../helpers/cli";

describe("temporal init", () => {
  test("creates time.md in empty directory", () => {
    withTempDir((dir) => {
      const result = runCli(["init"], dir);
      expect(result.status).toBe(0);
      expect(existsSync(`${dir}/time.md`)).toBe(true);
      expect(result.stdout).toContain("# Time Context");
      expect(result.stdout).toContain("## Now");
    });
  });

  test("refuses overwrite without --force", () => {
    withTempDir((dir) => {
      expect(runCli(["init"], dir).status).toBe(0);
      const second = runCli(["init"], dir);
      expect(second.status).toBe(1);
      expect(second.stderr).toContain("already exists");
    });
  });

  test("accepts --force", () => {
    withTempDir((dir) => {
      expect(runCli(["init"], dir).status).toBe(0);
      const second = runCli(["init", "--force"], dir);
      expect(second.status).toBe(0);
    });
  });

  test("accepts --timezone", () => {
    withTempDir((dir) => {
      const result = runCli(["init", "--timezone", "America/New_York"], dir);
      expect(result.status).toBe(0);
      const content = readFileSync(`${dir}/time.md`, "utf8");
      expect(content).toContain("- **timezone**: America/New_York");
    });
  });
});
