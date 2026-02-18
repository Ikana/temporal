# Implementation Plan: Scratch Pad Mode for Temporal

**Branch**: `002-scratch-pad` | **Date**: 2026-02-18 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-scratch-pad/spec.md`

## Summary

Add a `temporal scratch` subcommand family that provides ephemeral, single-session temporal reasoning aids. Scratch pads live in `/tmp/`, use the same ego-moving spatial format as the main timeline, and are deliberately simplified (no sequences, no spans, no metadata). The implementation reuses existing date parsing, distance formatting, NOW building, and markdown rendering infrastructure from the 001-time-cli feature, adding a thin layer for scratch-specific file targeting and a stripped-down render path.

## Technical Context

**Language/Version**: TypeScript on Bun 1.x
**Primary Dependencies**: None (zero external dependencies — same as 001-time-cli)
**Storage**: Ephemeral markdown files in `/tmp/` (`/tmp/time-scratch.md` or `/tmp/time-scratch-<label>.md`)
**Testing**: Bun's built-in test runner (`bun:test`)
**Target Platform**: macOS, Linux (any platform with `/tmp/` and Bun runtime)
**Project Type**: Single project — extends existing `src/` and `tests/` structure
**Performance Goals**: Full scratch session (create + 5 adds + show + clear) under 2 seconds
**Constraints**: No new dependencies. Scratch files never in project directory. No modification to existing `time.md` behavior.
**Scale/Scope**: Small feature — 4 new subcommands, ~200-300 lines of new source

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spatial-Temporal Grounding | PASS | Scratch pad uses same spatial positions relative to NOW, same distance labels, same Behind/Ahead sections |
| II. Ego-Moving Consistency | PASS | Reuses existing ego-moving language from renderer; no new temporal language introduced |
| III. CLI-First, File-Native | PASS | All scratch commands are non-interactive CLI commands; artifact is a plain markdown file in `/tmp/` |
| IV. LLM-Readable Output | PASS | Output format identical to main timeline — LLM reads scratch pad the same way it reads `time.md` |
| V. Simplicity & Minimalism | PASS | No new dependencies; reuses existing parsing/rendering; deliberately omits sequences, spans, and metadata to stay minimal |

All gates pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/002-scratch-pad/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── cli.md           # CLI contract for scratch commands
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── commands/
│   └── scratch.ts       # NEW: scratch subcommand dispatcher + handlers
├── lib/
│   ├── scratch.ts       # NEW: scratch file path resolution, label sanitization
│   ├── context.ts       # EXISTING: reuse emptyContext, upsertEvent, rebuildEventPositions
│   ├── renderer.ts      # EXISTING: reuse renderNowSection, renderEventTable (add scratch view option)
│   ├── parser.ts        # EXISTING: reuse parseTimeContext (scratch files are valid TimeContext subsets)
│   ├── file.ts          # EXISTING: extend with loadScratchContext, saveScratchContext
│   ├── cli.ts           # EXISTING: update USAGE string with scratch commands
│   └── errors.ts        # EXISTING: add SCRATCH_FILE_MISSING error message
├── index.ts             # EXISTING: add "scratch" to commands dispatch table
└── types.ts             # EXISTING: no changes needed (scratch uses subset of TimeContext)

tests/
├── commands/
│   └── scratch.test.ts  # NEW: integration tests for all scratch subcommands
└── lib/
    └── scratch.test.ts  # NEW: unit tests for path resolution, label sanitization
```

**Structure Decision**: Extends the existing single-project layout. Scratch commands are grouped under a single `scratch.ts` command file with internal dispatch (matching the `scratch <subcommand>` CLI pattern), rather than separate files per subcommand, since the subcommands share file-targeting logic.
