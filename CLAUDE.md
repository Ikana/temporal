# time Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-17

## Active Technologies
- TypeScript on Bun 1.x + None (zero external dependencies — same as 001-time-cli) (002-scratch-pad)
- Ephemeral markdown files in `/tmp/` (`/tmp/time-scratch.md` or `/tmp/time-scratch-<label>.md`) (002-scratch-pad)
- Markdown (SKILL.md) + Bash (build script) + None for the skill; Bun 1.x for the build script (already a project dependency) (003-openclaw-skill-package)
- N/A — single markdown file + build script producing zip artifacts (003-openclaw-skill-package)

- TypeScript on Bun 1.x + None (zero external dependencies) (001-time-cli)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript on Bun 1.x: Follow standard conventions

## Recent Changes
- 003-openclaw-skill-package: Added Markdown (SKILL.md) + Bash (build script) + None for the skill; Bun 1.x for the build script (already a project dependency)
- 002-scratch-pad: Added TypeScript on Bun 1.x + None (zero external dependencies — same as 001-time-cli)

- 001-time-cli: Added TypeScript on Bun 1.x + None (zero external dependencies)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
