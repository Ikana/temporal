import { describe, expect, test } from "bun:test";
import { runCli, withTempDir } from "../helpers/cli";

describe("temporal show/past/ahead", () => {
  test("show outputs full file", () => {
    withTempDir((dir) => {
      expect(runCli(["init"], dir).status).toBe(0);
      expect(runCli(["add", "past item", "--on", "2020-01-01"], dir).status).toBe(0);
      expect(runCli(["add", "future item", "--in", "1 day"], dir).status).toBe(0);

      const show = runCli(["show"], dir);
      expect(show.status).toBe(0);
      expect(show.stdout).toContain("### Behind (Past)");
      expect(show.stdout).toContain("### Ahead (Future)");
      expect(show.stdout).toContain("## Sequences");
    });
  });

  test("past outputs NOW + Behind only", () => {
    withTempDir((dir) => {
      expect(runCli(["init"], dir).status).toBe(0);
      expect(runCli(["add", "past item", "--on", "2020-01-01"], dir).status).toBe(0);
      expect(runCli(["add", "future item", "--in", "1 day"], dir).status).toBe(0);

      const result = runCli(["past"], dir);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain("## Now");
      expect(result.stdout).toContain("### Behind (Past)");
      expect(result.stdout).not.toContain("### Ahead (Future)");
    });
  });

  test("ahead outputs NOW + Ahead only", () => {
    withTempDir((dir) => {
      expect(runCli(["init"], dir).status).toBe(0);
      expect(runCli(["add", "past item", "--on", "2020-01-01"], dir).status).toBe(0);
      expect(runCli(["add", "future item", "--in", "1 day"], dir).status).toBe(0);

      const result = runCli(["ahead"], dir);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain("## Now");
      expect(result.stdout).toContain("### Ahead (Future)");
      expect(result.stdout).not.toContain("### Behind (Past)");
    });
  });
});
