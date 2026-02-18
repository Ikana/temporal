<!--
  Sync Impact Report
  Version change: 0.0.0 → 1.0.0 (initial ratification)
  Added principles:
    - I. Spatial-Temporal Grounding
    - II. Ego-Moving Consistency
    - III. CLI-First, File-Native
    - IV. LLM-Readable Output
    - V. Simplicity & Minimalism
  Added sections:
    - Research Foundation
    - Development Workflow
    - Governance
  Templates requiring updates:
    - .specify/templates/plan-template.md ✅ no changes needed (Constitution Check section is dynamic)
    - .specify/templates/spec-template.md ✅ no changes needed (structure compatible)
    - .specify/templates/tasks-template.md ✅ no changes needed (user-story phasing compatible)
  Follow-up TODOs: None
-->

# Temporal Constitution

## Core Principles

### I. Spatial-Temporal Grounding

All temporal information MUST be represented using spatial metaphors derived from cognitive science research on how humans reason about time. Time is abstract; space is concrete. This project bridges the two by giving LLMs the same spatial scaffolding that humans use naturally — ordered positions on a one-dimensional line, signed distances from an origin, and directional orientation (ahead/behind).

- Every temporal fact MUST have a spatial position relative to a known origin (NOW).
- Temporal relations MUST be expressed as spatial distances, not just absolute dates.
- Events MUST be ordered linearly, preserving the one-dimensional spatial structure that underlies human temporal reasoning.

### II. Ego-Moving Consistency

The project MUST use the ego-moving metaphor exclusively and never mix it with the time-moving metaphor. Research (Gentner, 2003) demonstrates that mixing spatial-temporal metaphor systems causes measurable processing slowdowns. The ego-moving system is preferred because it requires fewer conceptual points (two-point relation: observer ↔ event) and is faster to process.

- The observer is always at NOW, facing the future.
- Future events are "ahead." Past events are "behind."
- Language like "the deadline is approaching" (time-moving) MUST NOT appear in output. Use "we are approaching the deadline" (ego-moving) framing instead.
- All output — `time.md` files, CLI messages, documentation — MUST maintain one consistent spatial frame.

### III. CLI-First, File-Native

Every capability MUST be accessible as a non-interactive CLI command. The primary artifact is a plain markdown file (`time.md`). There is no server, no database, no API — just a binary on `$PATH` and a file on disk.

- All input comes via command-line arguments. No interactive prompts.
- All output goes to stdout (valid markdown) or stderr (errors). Exit codes: 0 success, non-zero failure.
- The `time.md` file is the single source of truth. The CLI reads and writes it; LLMs and humans read it directly.
- The tool MUST be usable as a subprocess by any LLM agent framework without manifests, registration, or configuration.

### IV. LLM-Readable Output

Every piece of output MUST be optimized for consumption by language models. The format is designed not just for human readability but specifically for LLM token-based reasoning about temporal relationships.

- Output MUST be valid markdown that renders correctly in any viewer.
- Temporal distances MUST use human-readable units ("3 days ahead") alongside machine-parseable ISO 8601 timestamps.
- The file MUST be self-documenting — an LLM reading `time.md` with no prior context MUST be able to understand where NOW is, what happened before, and what is coming next.
- Sequences MUST include [NOW] as a spatial landmark so the LLM can "see" where it is in a process.

### V. Simplicity & Minimalism

Complexity MUST be justified. The tool solves one problem — giving LLMs a temporal scaffold — and MUST NOT grow beyond that scope.

- No dependencies beyond the runtime (Bun). Date math uses native APIs.
- Single binary distribution. No plugins, no configuration files, no package ecosystem.
- Features MUST earn their place: if a capability does not directly improve an LLM's ability to reason about time, it does not belong in this tool.
- Prefer fewer, composable commands over many specialized ones.

## Research Foundation

This project is grounded in Dedre Gentner's "Spatial Metaphors in Temporal Reasoning" (MIT Press, 2003), which provides experimental evidence that:

1. Humans use two distinct spatial systems (ego-moving and time-moving) to reason about time.
2. These systems function as coherent conceptual frames — mixing them causes measurable processing costs.
3. The ego-moving metaphor is faster to process (two-point relation vs. three-point).
4. Spatial ordering is the cognitive primitive for temporal reasoning — position on a line, not calendar labels.
5. Relational structure (before/after/ahead/behind) carries the reasoning, not event properties.

All design decisions in this project MUST be traceable to these findings. When in doubt, ask: "Does this help an LLM reason about time the way a human would?"

## Development Workflow

- **Test-driven**: Write tests that express temporal reasoning expectations, verify they fail, then implement.
- **Spec-driven**: Use the spec-kit workflow (`/speckit.specify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement`) for all feature work.
- **Incremental delivery**: Each user story MUST be independently functional and testable. Ship the MVP (init + add + refresh + show) before pursuing enrichment features (sequences, spans).
- **Dogfooding**: Use `temporal` on this project itself. The project's own `time.md` MUST be maintained using the CLI.

## Governance

- This constitution supersedes all other development practices in the project.
- Amendments require: (1) documented rationale linking to research or user evidence, (2) version bump per semantic versioning, (3) update to all dependent artifacts.
- All code changes MUST be evaluated against these principles. If a change contradicts a principle, either the change is rejected or the principle is amended through the governance process.
- The ego-moving consistency principle (II) is NON-NEGOTIABLE and cannot be amended without replacing the entire theoretical foundation.

**Version**: 1.0.0 | **Ratified**: 2026-02-17 | **Last Amended**: 2026-02-17
