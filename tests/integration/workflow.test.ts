import { describe, expect, test } from "bun:test";
import { runCli, withTempDir } from "../helpers/cli";

function expectMarkdown(output: string): void {
  expect(output.startsWith("# Time Context")).toBe(true);
}

describe("integration workflow", () => {
  test("init -> add -> show -> refresh -> ahead -> past -> remove -> show", () => {
    withTempDir((dir) => {
      const init = runCli(["init"], dir);
      expect(init.status).toBe(0);
      expectMarkdown(init.stdout);

      const add1 = runCli(["add", "release", "--on", "2020-01-01", "--type", "milestone"], dir);
      expect(add1.status).toBe(0);
      expectMarkdown(add1.stdout);

      const add2 = runCli(["add", "review", "--in", "2 days", "--type", "meeting"], dir);
      expect(add2.status).toBe(0);
      expectMarkdown(add2.stdout);

      const show = runCli(["show"], dir);
      expect(show.status).toBe(0);
      expectMarkdown(show.stdout);

      const refresh = runCli(["refresh"], dir);
      expect(refresh.status).toBe(0);
      expectMarkdown(refresh.stdout);

      const ahead = runCli(["ahead"], dir);
      expect(ahead.status).toBe(0);
      expectMarkdown(ahead.stdout);

      const past = runCli(["past"], dir);
      expect(past.status).toBe(0);
      expectMarkdown(past.stdout);

      const remove = runCli(["remove", "review"], dir);
      expect(remove.status).toBe(0);
      expectMarkdown(remove.stdout);

      const showAfter = runCli(["show"], dir);
      expect(showAfter.status).toBe(0);
      expect(showAfter.stdout).not.toContain("review");
      expectMarkdown(showAfter.stdout);
    });
  });
});
