import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { scratchFilePath } from "../../src/lib/scratch";
import { runCli, withTempDir } from "../helpers/cli";

function rmFile(path: string): void {
  rmSync(path, { force: true });
}

function label(name: string): string {
  return `${name}-${process.pid}-${Date.now()}`;
}

describe("temporal scratch", () => {
  test("scratch creates default pad", () => {
    const path = scratchFilePath();
    rmFile(path);

    withTempDir((dir) => {
      const result = runCli(["scratch"], dir);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain("# Time Context");
      expect(result.stdout).toContain("## Now");
      expect(existsSync(path)).toBe(true);
    });

    rmFile(path);
  });

  test("scratch creates labeled pad", () => {
    const raw = label("scratch-labeled");
    const path = scratchFilePath(raw);
    rmFile(path);

    withTempDir((dir) => {
      const result = runCli(["scratch", raw], dir);
      expect(result.status).toBe(0);
      expect(existsSync(path)).toBe(true);
      expect(readFileSync(path, "utf8")).toContain("## Now");
    });

    rmFile(path);
  });

  test("scratch create subcommand allows reserved labels", () => {
    const path = scratchFilePath("add");
    rmFile(path);

    withTempDir((dir) => {
      const result = runCli(["scratch", "create", "add"], dir);
      expect(result.status).toBe(0);
      expect(existsSync(path)).toBe(true);
    });

    rmFile(path);
  });

  test("scratch replaces existing pad content", () => {
    const raw = label("replace");
    const path = scratchFilePath(raw);
    rmFile(path);

    withTempDir((dir) => {
      expect(runCli(["scratch", raw], dir).status).toBe(0);
      writeFileSync(path, "stale-data", "utf8");
      const second = runCli(["scratch", raw], dir);
      expect(second.status).toBe(0);
      const content = readFileSync(path, "utf8");
      expect(content).toContain("# Time Context");
      expect(content).not.toContain("stale-data");
    });

    rmFile(path);
  });

  test("scratch does not modify project time.md", () => {
    const path = scratchFilePath();
    rmFile(path);

    withTempDir((dir) => {
      expect(runCli(["init"], dir).status).toBe(0);
      const before = readFileSync(`${dir}/time.md`, "utf8");

      const result = runCli(["scratch"], dir);
      expect(result.status).toBe(0);

      const after = readFileSync(`${dir}/time.md`, "utf8");
      expect(after).toBe(before);
    });

    rmFile(path);
  });

  test("scratch add supports --in", () => {
    const raw = label("add-in");
    const path = scratchFilePath(raw);
    rmFile(path);

    withTempDir((dir) => {
      expect(runCli(["scratch", raw], dir).status).toBe(0);
      const result = runCli(["scratch", "add", "deadline", "--in", "5 days", "--scratch", raw], dir);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain("deadline");
      expect(result.stdout).toContain("ahead");
      expect(readFileSync(path, "utf8")).toContain("deadline");
    });

    rmFile(path);
  });

  test("scratch add supports --on with past date", () => {
    const raw = label("add-on");
    const path = scratchFilePath(raw);
    rmFile(path);

    withTempDir((dir) => {
      expect(runCli(["scratch", raw], dir).status).toBe(0);
      const result = runCli(["scratch", "add", "kickoff", "--on", "2020-01-01", "--scratch", raw], dir);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain("kickoff");
      expect(result.stdout).toContain("behind");
    });

    rmFile(path);
  });

  test("scratch add supports default pad without --scratch", () => {
    const path = scratchFilePath();
    rmFile(path);

    withTempDir((dir) => {
      expect(runCli(["scratch"], dir).status).toBe(0);
      const result = runCli(["scratch", "add", "default-deadline", "--in", "3 days"], dir);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain("default-deadline");
      expect(readFileSync(path, "utf8")).toContain("default-deadline");
    });

    rmFile(path);
  });

  test("scratch add fails when pad does not exist", () => {
    const raw = label("missing-add");
    const path = scratchFilePath(raw);
    rmFile(path);

    withTempDir((dir) => {
      const result = runCli(["scratch", "add", "event", "--in", "3 days", "--scratch", raw], dir);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("Run 'temporal scratch' first");
    });

    rmFile(path);
  });

  test("scratch add rejects duplicate event names", () => {
    const raw = label("duplicate");
    const path = scratchFilePath(raw);
    rmFile(path);

    withTempDir((dir) => {
      expect(runCli(["scratch", raw], dir).status).toBe(0);
      expect(runCli(["scratch", "add", "deadline", "--in", "2 days", "--scratch", raw], dir).status).toBe(0);
      const second = runCli(["scratch", "add", "deadline", "--in", "3 days", "--scratch", raw], dir);
      expect(second.status).toBe(1);
      expect(second.stderr).toContain("already exists");
    });

    rmFile(path);
  });

  test("scratch show prints current scratch pad", () => {
    const raw = label("show");
    const path = scratchFilePath(raw);
    rmFile(path);

    withTempDir((dir) => {
      expect(runCli(["scratch", raw], dir).status).toBe(0);
      expect(runCli(["scratch", "add", "past-event", "--on", "2020-01-01", "--scratch", raw], dir).status).toBe(0);
      expect(runCli(["scratch", "add", "future-event", "--on", "2099-01-01", "--scratch", raw], dir).status).toBe(0);

      const shown = runCli(["scratch", "show", "--scratch", raw], dir);
      expect(shown.status).toBe(0);
      expect(shown.stdout).toContain("### Behind (Past)");
      expect(shown.stdout).toContain("### Ahead (Future)");
      expect(shown.stdout).toContain("past-event");
      expect(shown.stdout).toContain("future-event");
      expect(shown.stdout).not.toContain("## Sequences");
      expect(shown.stdout).not.toContain("## Durations");
    });

    rmFile(path);
  });

  test("scratch show supports empty pad", () => {
    const raw = label("show-empty");
    const path = scratchFilePath(raw);
    rmFile(path);

    withTempDir((dir) => {
      expect(runCli(["scratch", raw], dir).status).toBe(0);

      const shown = runCli(["scratch", "show", "--scratch", raw], dir);
      expect(shown.status).toBe(0);
      expect(shown.stdout).toContain("## Now");
      expect(shown.stdout).not.toContain("## Sequences");
      expect(shown.stdout).not.toContain("## Durations");
    });

    rmFile(path);
  });

  test("scratch show fails without existing pad", () => {
    const raw = label("missing-show");
    const path = scratchFilePath(raw);
    rmFile(path);

    withTempDir((dir) => {
      const result = runCli(["scratch", "show", "--scratch", raw], dir);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("Run 'temporal scratch' first");
    });

    rmFile(path);
  });

  test("scratch clear removes scratch pad", () => {
    const raw = label("clear");
    const path = scratchFilePath(raw);
    rmFile(path);

    withTempDir((dir) => {
      expect(runCli(["scratch", raw], dir).status).toBe(0);
      expect(existsSync(path)).toBe(true);

      const cleared = runCli(["scratch", "clear", "--scratch", raw], dir);
      expect(cleared.status).toBe(0);
      expect(existsSync(path)).toBe(false);
    });

    rmFile(path);
  });

  test("scratch clear warns and exits zero when pad is missing", () => {
    const raw = label("clear-missing");
    const path = scratchFilePath(raw);
    rmFile(path);

    withTempDir((dir) => {
      const result = runCli(["scratch", "clear", "--scratch", raw], dir);
      expect(result.status).toBe(0);
      expect(result.stderr).toContain("Nothing to clear");
    });
  });

  test("scratch label sanitization is applied", () => {
    const raw = "My Email!!";
    const path = scratchFilePath(raw);
    rmFile(path);

    withTempDir((dir) => {
      const result = runCli(["scratch", raw], dir);
      expect(result.status).toBe(0);
      expect(existsSync(path)).toBe(true);
    });

    rmFile(path);
  });

  test("scratch fails when label sanitizes to empty", () => {
    withTempDir((dir) => {
      const result = runCli(["scratch", "////"], dir);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("contains no valid characters");
    });
  });

  test("scratch refuses symlink targets in /tmp", () => {
    const path = scratchFilePath();
    rmFile(path);

    withTempDir((dir) => {
      const victim = `${dir}/victim.txt`;
      writeFileSync(victim, "safe-content", "utf8");
      symlinkSync(victim, path);

      const result = runCli(["scratch"], dir);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("Refusing to follow symlink");
      expect(readFileSync(victim, "utf8")).toBe("safe-content");
    });

    rmFile(path);
  });

  test("init warns when scratch files exist in cwd", () => {
    withTempDir((dir) => {
      writeFileSync(`${dir}/time-scratch-demo.md`, "temp", "utf8");
      const result = runCli(["init"], dir);
      expect(result.status).toBe(0);
      expect(result.stderr).toContain("Scratch pad files found in this directory");
      expect(existsSync(`${dir}/time.md`)).toBe(true);
    });
  });

  test("end-to-end labeled workflow", () => {
    const raw = label("workflow");
    const path = scratchFilePath(raw);
    rmFile(path);

    withTempDir((dir) => {
      expect(runCli(["scratch", raw], dir).status).toBe(0);
      expect(runCli(["scratch", "add", "deliverable", "--in", "14 days", "--scratch", raw], dir).status).toBe(0);
      expect(runCli(["scratch", "add", "meeting", "--in", "15 days", "--scratch", raw], dir).status).toBe(0);

      const shown = runCli(["scratch", "show", "--scratch", raw], dir);
      expect(shown.status).toBe(0);
      expect(shown.stdout.indexOf("deliverable")).toBeLessThan(shown.stdout.indexOf("meeting"));

      const cleared = runCli(["scratch", "clear", "--scratch", raw], dir);
      expect(cleared.status).toBe(0);
      expect(existsSync(path)).toBe(false);
      expect(existsSync(`${dir}/time.md`)).toBe(false);
    });

    rmFile(path);
  });
});
