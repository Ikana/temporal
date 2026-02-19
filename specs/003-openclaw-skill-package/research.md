# Research: OpenClaw Skill Package for temporal CLI

**Branch**: `003-openclaw-skill-package` | **Date**: 2026-02-18

## R1: Bun Cross-Compilation for Release Binaries

**Decision**: Use `bun build --compile --target=<target> --minify` in GitHub Actions (`ubuntu-latest`) to build 4 release binaries.

**Rationale**: Bun supports cross-compilation from Linux for the required darwin/linux targets. One Ubuntu runner produces all release artifacts with a single workflow.

**Targets**:
- `bun-darwin-arm64` — macOS Apple Silicon
- `bun-darwin-x64` — macOS Intel
- `bun-linux-x64` — Linux x86_64 (glibc)
- `bun-linux-arm64` — Linux ARM64 (glibc)

**Alternatives considered**:
- `macos-latest` runner: Not necessary for the current target set and generally slower/more expensive than Ubuntu runners.
- GitHub Actions matrix builds: More complex than needed for a small target set.
- musl targets (linux-x64-musl, linux-arm64-musl): Excluded for simplicity; glibc targets cover the majority of users.

## R2: OpenClaw SKILL.md Conventions

**Decision**: Use YAML frontmatter with `name`, `slug`, `description`, and `when_to_use` fields. Body is freeform markdown.

**Rationale**: The user specified these fields explicitly. The slug `time` is confirmed available on ClawHub.

**Alternatives considered**: None — the user defined the convention.

## R3: Release Artifact Format

**Decision**: Publish raw binaries as release assets plus a `temporal-checksums.txt` file for verification.

**Rationale**: This matches direct-install commands in SKILL.md (`curl .../download/<binary>`), avoids archive extraction steps, and enables integrity verification.

**Alternatives considered**:
- Zip/tar packaging: Adds extraction steps and mismatches the direct download install flow.
- Signature-based verification: Deferred; checksums are simpler to ship immediately.

## R4: Ego-Moving Metaphor Documentation

**Decision**: SKILL.md will include a prominent metaphor section near the top with explicit correct/incorrect examples.

**Rationale**: Constitution principle II (Ego-Moving Consistency) is non-negotiable. Agents reading the skill must internalize the frame before using any commands.

**Alternatives considered**: Putting the metaphor explanation in a footnote — rejected because it's too important to bury.
