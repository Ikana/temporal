# Research: OpenClaw Skill Package for temporal CLI

**Branch**: `003-openclaw-skill-package` | **Date**: 2026-02-18

## R1: Bun Cross-Compilation for Release Binaries

**Decision**: Use `bun build --compile --target=<target> --minify` to cross-compile from macOS to all 5 target platforms.

**Rationale**: Bun natively supports cross-compilation from any host to any target. No external toolchain or CI matrix needed. A single macOS machine can produce all release artifacts.

**Targets**:
- `bun-darwin-arm64` — macOS Apple Silicon
- `bun-darwin-x64` — macOS Intel
- `bun-linux-x64` — Linux x86_64 (glibc)
- `bun-linux-arm64` — Linux ARM64 (glibc)
- `bun-windows-x64` — Windows x86_64

**Alternatives considered**:
- GitHub Actions CI matrix: More complex, requires CI setup, not needed for a simple binary. Can be added later.
- Docker-based cross-compilation: Unnecessary since bun handles cross-compilation natively.
- musl targets (linux-x64-musl, linux-arm64-musl): Excluded for simplicity; glibc targets cover the vast majority of users. Can add later if requested.

## R2: OpenClaw SKILL.md Conventions

**Decision**: Use YAML frontmatter with `name`, `slug`, `description`, and `when_to_use` fields. Body is freeform markdown.

**Rationale**: The user specified these fields explicitly. The slug `time` is confirmed available on ClawHub.

**Alternatives considered**: None — the user defined the convention.

## R3: Zip Packaging Format

**Decision**: Each zip contains only the binary (`temporal` or `temporal.exe`). No README, no LICENSE, no wrapper scripts.

**Rationale**: Constitution principle V (Simplicity & Minimalism) — single binary distribution. The SKILL.md on ClawHub teaches agents how to use it. Users downloading from GitHub Releases get the binary and nothing else.

**Alternatives considered**:
- Tarball (.tar.gz): More Unix-native but zip is universal across all 3 OS targets.
- Include a README in the zip: Unnecessary — the binary is self-contained and SKILL.md is the documentation.

## R4: Ego-Moving Metaphor Documentation

**Decision**: SKILL.md will include a prominent metaphor section near the top with explicit correct/incorrect examples.

**Rationale**: Constitution principle II (Ego-Moving Consistency) is non-negotiable. Agents reading the skill must internalize the frame before using any commands.

**Alternatives considered**: Putting the metaphor explanation in a footnote — rejected because it's too important to bury.
