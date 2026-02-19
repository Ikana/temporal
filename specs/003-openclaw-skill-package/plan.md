# Implementation Plan: OpenClaw Skill Package for temporal CLI

**Branch**: `003-openclaw-skill-package` | **Date**: 2026-02-18 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-openclaw-skill-package/spec.md`

## Summary

Create an OpenClaw skill package (`time/SKILL.md`) that teaches any LLM agent when and how to use the `temporal` CLI for spatial-temporal reasoning. Additionally, create a build script that cross-compiles the `temporal` binary for all supported platforms and packages each into a zip for GitHub Releases.

## Technical Context

**Language/Version**: Markdown (SKILL.md) + Bash (build script)
**Primary Dependencies**: None for the skill; Bun 1.x for the build script (already a project dependency)
**Storage**: N/A — single markdown file + build script producing zip artifacts
**Testing**: Manual validation — SKILL.md line count (<200), build script produces expected zips
**Target Platform**: All platforms (SKILL.md is platform-agnostic; build script targets darwin-arm64, darwin-x64, linux-x64, linux-arm64, windows-x64)
**Project Type**: Single project
**Performance Goals**: N/A
**Constraints**: SKILL.md must be under 200 lines; build script must produce self-contained zips with just the binary
**Scale/Scope**: 1 markdown file (~200 lines), 1 build script (~50 lines), 5 zip artifacts

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spatial-Temporal Grounding | PASS | SKILL.md documents signed distances from NOW, spatial positions |
| II. Ego-Moving Consistency | PASS | SKILL.md explains ego-moving metaphor with correct/incorrect examples |
| III. CLI-First, File-Native | PASS | SKILL.md documents non-interactive CLI, stdout/stderr contract |
| IV. LLM-Readable Output | PASS | SKILL.md is an LLM-readable skill document; includes annotated time.md example |
| V. Simplicity & Minimalism | PASS | Single file skill package; simple build script with no dependencies beyond bun |

No violations. No complexity tracking needed.

## Project Structure

### Documentation (this feature)

```text
specs/003-openclaw-skill-package/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── quickstart.md        # Phase 1 output
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
time/
└── SKILL.md             # The OpenClaw skill document (ClawHub slug: time)

scripts/
└── build-release.sh     # Cross-compile + zip for all platforms
```

**Structure Decision**: Minimal — one skill document in `time/` (required by OpenClaw convention), one build script in `scripts/`. No contracts/ or data-model.md needed since this feature produces documentation and a build script, not application code.

## Deliverables

### 1. time/SKILL.md

The OpenClaw skill document. Contains:
- YAML frontmatter (name, slug, description, when_to_use)
- Prerequisites with install link
- Ego-moving metaphor explanation
- Command reference (init, now, add, show, past, ahead, refresh, seq, span, remove)
- Annotated time.md format example
- Scratch pad pattern
- Key rules

Constraint: under 200 lines.

### 2. scripts/build-release.sh

A bash script that:
1. Cross-compiles `temporal` for 5 platform targets using `bun build --compile --target=<target>`
2. Packages each binary into a zip named `temporal-<platform>-<arch>.zip`
3. Outputs all zips to a `dist/` directory

Target matrix:

| Target | Output binary | Zip name |
|--------|--------------|----------|
| `bun-darwin-arm64` | `temporal` | `temporal-darwin-arm64.zip` |
| `bun-darwin-x64` | `temporal` | `temporal-darwin-x64.zip` |
| `bun-linux-x64` | `temporal` | `temporal-linux-x64.zip` |
| `bun-linux-arm64` | `temporal` | `temporal-linux-arm64.zip` |
| `bun-windows-x64` | `temporal.exe` | `temporal-windows-x64.zip` |

The script:
- Cleans and recreates `dist/`
- Builds each target into a temp directory
- Zips the binary
- Moves zip to `dist/`
- Reports success/failure per target

No CI/CD integration in this feature — the script is run locally or can be wired into GitHub Actions later.
