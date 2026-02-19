# Implementation Plan: OpenClaw Skill Package for temporal CLI

**Branch**: `003-openclaw-skill-package` | **Date**: 2026-02-18 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-openclaw-skill-package/spec.md`

## Summary

Create an OpenClaw skill package (`time/SKILL.md`) that teaches any LLM agent when and how to use the `temporal` CLI for spatial-temporal reasoning. Additionally, wire GitHub Actions release automation that builds 4 binaries and publishes them with checksums for GitHub Releases.

## Technical Context

**Language/Version**: Markdown (SKILL.md) + GitHub Actions YAML + Bash (helper build script)
**Primary Dependencies**: None for the skill; Bun 1.x in CI
**Storage**: N/A — markdown docs + release artifacts in GitHub Releases
**Testing**: `bun test` in release workflow + manual SKILL.md validation
**Target Platform**: SKILL.md is platform-agnostic; release binaries target darwin-arm64, darwin-x64, linux-x64, linux-arm64
**Project Type**: Single project
**Performance Goals**: N/A
**Constraints**: SKILL.md must be under 200 lines; release artifacts must match documented install commands
**Scale/Scope**: 1 markdown file (~200 lines), 1 workflow, 1 helper build script, 4 binaries + 1 checksum asset

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spatial-Temporal Grounding | PASS | SKILL.md documents signed distances from NOW, spatial positions |
| II. Ego-Moving Consistency | PASS | SKILL.md explains ego-moving metaphor with correct/incorrect examples |
| III. CLI-First, File-Native | PASS | SKILL.md documents non-interactive CLI, stdout/stderr contract |
| IV. LLM-Readable Output | PASS | SKILL.md is an LLM-readable skill document; includes annotated time.md example |
| V. Simplicity & Minimalism | PASS | Single file skill package; straightforward tag-triggered release workflow |

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
└── build-release.sh     # Helper to mirror CI release artifacts locally
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

### 2. .github/workflows/release.yml

A release workflow that:
1. Triggers on tag push matching `v*`
2. Installs Bun, runs `bun install`, runs `bun test`
3. Builds 4 binaries with `bun build --compile --target=<target>`
4. Generates `temporal-checksums.txt`
5. Creates a GitHub release with binaries + checksum attached

Target matrix:

| Target | Asset name |
|--------|------------|
| `bun-darwin-arm64` | `temporal-darwin-arm64` |
| `bun-darwin-x64` | `temporal-darwin-x64` |
| `bun-linux-x64` | `temporal-linux-x64` |
| `bun-linux-arm64` | `temporal-linux-arm64` |
| n/a | `temporal-checksums.txt` |

### 3. scripts/build-release.sh

A local helper script that mirrors the same 4-target binary build and checksum output in `dist/`.
