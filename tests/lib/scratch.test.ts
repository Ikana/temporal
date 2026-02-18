import { describe, expect, test } from "bun:test";
import { sanitizeLabel, scratchFilePath } from "../../src/lib/scratch";

describe("scratch label utilities", () => {
  test("sanitizeLabel lowercases and normalizes separators", () => {
    expect(sanitizeLabel("My Email!!")).toBe("my-email");
    expect(sanitizeLabel("team/alpha")).toBe("team-alpha");
    expect(sanitizeLabel("a---b___c")).toBe("a-b-c");
  });

  test("sanitizeLabel trims leading/trailing hyphens", () => {
    expect(sanitizeLabel("--Hello World--")).toBe("hello-world");
  });

  test("sanitizeLabel passes through valid labels", () => {
    expect(sanitizeLabel("quarterly-email")).toBe("quarterly-email");
  });

  test("sanitizeLabel rejects labels with no valid characters", () => {
    expect(() => sanitizeLabel("////")).toThrow("contains no valid characters");
  });
});

describe("scratch file paths", () => {
  test("default path is /tmp/time-scratch.md", () => {
    expect(scratchFilePath()).toBe("/tmp/time-scratch.md");
  });

  test("labeled path uses sanitized label", () => {
    expect(scratchFilePath("My Email!!")).toBe("/tmp/time-scratch-my-email.md");
    expect(scratchFilePath("team/alpha")).toBe("/tmp/time-scratch-team-alpha.md");
  });
});
