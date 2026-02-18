# Implementation Plan: Temporal CLI

**Branch**: `001-time-cli` | **Date**: 2026-02-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-time-cli/spec.md`

## Summary

Build `temporal`, a zero-dependency TypeScript CLI (Bun runtime) that creates and manages a `time.md` file — a spatial-temporal scaffold for LLMs. The file uses the ego-moving metaphor exclusively: NOW is the origin, past events are "behind," future events are "ahead," distances are expressed in human-readable units alongside ISO 8601 timestamps. The CLI is a standalone binary on `$PATH`, invocable by any LLM agent framework as a subprocess.

## Technical Context

**Language/Version**: TypeScript on Bun 1.x
**Primary Dependencies**: None (zero external dependencies)
**Storage**: Single `time.md` markdown file per project directory
**Testing**: `bun:test` (built-in)
**Target Platform**: macOS, Linux (cross-compiled via `bun build --compile`)
**Project Type**: Single CLI project
**Performance Goals**: All commands < 1 second, even with 100+ events
**Constraints**: Zero dependencies, single binary, no interactive prompts
**Scale/Scope**: 5-100 events per project, ~5KB file at 100 events

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Spatial-Temporal Grounding | PASS | All events positioned relative to NOW with signed distances. Linear ordering preserved. |
| II. Ego-Moving Consistency | PASS | "ahead"/"behind" language throughout. No time-moving language. [NOW] as spatial landmark. |
| III. CLI-First, File-Native | PASS | Non-interactive CLI, stdout/stderr separation, `time.md` as single source of truth, binary on `$PATH`. |
| IV. LLM-Readable Output | PASS | Valid markdown, human-readable distances + ISO 8601 `iso` column, self-documenting file. |
| V. Simplicity & Minimalism | PASS | Zero dependencies. Native Date, util.parseArgs, custom string ops. Single binary. |

All gates pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/001-time-cli/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── cli.md
├── checklists/
│   └── requirements.md
└── tasks.md              # Created by /speckit.tasks
```

### Source Code (repository root)

```text
src/
├── index.ts              # Entry point: subcommand dispatch
├── commands/
│   ├── init.ts           # temporal init
│   ├── add.ts            # temporal add
│   ├── now.ts            # temporal now
│   ├── refresh.ts        # temporal refresh
│   ├── show.ts           # temporal show
│   ├── past.ts           # temporal past
│   ├── ahead.ts          # temporal ahead
│   ├── remove.ts         # temporal remove
│   ├── seq.ts            # temporal seq
│   └── span.ts           # temporal span
├── lib/
│   ├── parser.ts         # Parse time.md into TimeContext
│   ├── renderer.ts       # Render TimeContext back to markdown
│   ├── duration.ts       # Parse/format human-readable durations
│   ├── date-parse.ts     # Parse date strings (ISO, relative, natural)
│   └── distance.ts       # Calculate + format distances from NOW
└── types.ts              # TypeScript interfaces (TimeContext, Event, etc.)

tests/
├── commands/
│   ├── init.test.ts
│   ├── add.test.ts
│   ├── refresh.test.ts
│   ├── show.test.ts
│   └── remove.test.ts
├── lib/
│   ├── parser.test.ts
│   ├── renderer.test.ts
│   ├── duration.test.ts
│   └── distance.test.ts
└── integration/
    └── workflow.test.ts  # End-to-end: init → add → refresh → show

package.json
tsconfig.json
```

**Structure Decision**: Single project layout. CLI commands are thin wrappers that parse args, call lib functions, and write output. The `lib/` directory contains all logic: parsing `time.md`, rendering it, and computing temporal distances. This separation allows unit testing of logic independent of CLI concerns.

## Key Design Decisions

### 1. Parse-Modify-Render Pipeline

Every command follows the same pattern:
1. **Parse**: Read `time.md` → `TimeContext` object (via `lib/parser.ts`)
2. **Modify**: Mutate the `TimeContext` (add event, refresh distances, etc.)
3. **Render**: Write `TimeContext` → markdown string (via `lib/renderer.ts`)
4. **Output**: Print to stdout and write to `time.md`

This ensures consistency — the file is always the output of the renderer, never hand-edited fragments.

### 2. Markdown as Data Format

The `time.md` file is simultaneously:
- A human-readable document
- An LLM-readable context file
- The CLI's persistent storage

The parser extracts structured data from markdown tables and bullet lists. The renderer produces deterministic markdown from structured data. Round-trip fidelity (parse → render → parse) is a testable invariant.

### 3. Distance Computation

Distances are always computed, never stored as source of truth. The `iso` column in tables contains the absolute timestamp. On every write, distances are freshly calculated from the difference between `now.timestamp` and each event's `iso` field.

Granularity selection:
- < 60 minutes → `"X minutes ahead/behind"`
- < 24 hours → `"X hours ahead/behind"`
- < 14 days → `"X days ahead/behind"`
- < 8 weeks → `"X weeks ahead/behind"`
- ≥ 8 weeks → `"X months ahead/behind"`

### 4. Subcommand Dispatch

```typescript
// src/index.ts
const command = process.argv[2];
switch (command) {
  case "init": return init(args);
  case "add": return add(args);
  // ...
  default: printUsage(); process.exit(1);
}
```

No framework. `util.parseArgs` for flag parsing within each command.

## Complexity Tracking

No constitution violations. No complexity to justify.
