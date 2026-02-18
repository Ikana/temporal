# Research: Scratch Pad Mode for Temporal

**Branch**: `002-scratch-pad` | **Date**: 2026-02-18

## Research Tasks

No NEEDS CLARIFICATION items existed in the Technical Context. All technology choices and patterns are inherited from the 001-time-cli feature. Research focused on integration strategy and reuse analysis.

### 1. Scratch File Path Strategy

**Decision**: Use `/tmp/time-scratch.md` (default) and `/tmp/time-scratch-<label>.md` (labeled), with labels sanitized to filename-safe slugs.

**Rationale**: The `/tmp/` directory is universally available on macOS and Linux, automatically cleaned by the OS, and clearly separates ephemeral files from project artifacts. The `time-scratch` prefix avoids collision with any `time.md` project file and makes scratch files grep-able. Using the sanitized label as a filename suffix (not a subdirectory) keeps the scheme flat and simple.

**Alternatives considered**:
- XDG cache directory (`~/.cache/temporal/`): Too permanent for single-session use. OS doesn't clean it automatically.
- Project-local `.temporal/scratch/`: Violates the spec requirement that scratch files never exist in the project directory. Would pollute git repos.
- `os.tmpdir()` API: Returns `/tmp/` on macOS/Linux anyway. Using the literal path is simpler and more predictable.

### 2. Reuse of Existing Infrastructure

**Decision**: Scratch pad commands reuse the full existing pipeline: `emptyContext()` for initialization, `upsertEvent()` for adding events, `parseTimeContext()` for reading, `renderTimeContext()` for output, and all date/duration parsing. The only new logic is file path resolution, label sanitization, and a render mode that omits sequences/spans sections.

**Rationale**: The scratch pad is structurally a subset of `TimeContext` — it has a `Now`, `behindEvents`, and `aheadEvents`, but no `sequences` or `spans`. Since `TimeContext` already supports empty arrays for sequences and spans, a scratch pad is just a `TimeContext` where those arrays are always empty. No new data types needed.

**Alternatives considered**:
- Separate `ScratchContext` type: Would duplicate `Now`, `Event`, and all rendering logic. Violates DRY. The existing `TimeContext` with empty sequences/spans arrays is functionally identical.
- Dedicated scratch renderer: Unnecessary — `renderTimeContext` already conditionally omits empty sections. A scratch `TimeContext` with no sequences/spans naturally renders without those sections.

### 3. Command Routing for `temporal scratch <subcommand>`

**Decision**: Register `scratch` as a single entry in the top-level `commands` dispatch table. The `scratch.ts` command module internally dispatches based on `args[0]` to `create`, `add`, `show`, or `clear` handlers. If `args[0]` is not a recognized subcommand, it's treated as a label for the `create` handler.

**Rationale**: This matches the existing CLI architecture (flat dispatch table) while keeping the scratch subcommand family grouped logically. Internal dispatch within `scratch.ts` is simpler than registering `scratch-add`, `scratch-show`, etc. as separate top-level commands.

**Alternatives considered**:
- Nested command routing framework: Overkill for 4 subcommands. Would add complexity for no benefit.
- Separate top-level commands (`scratch-add`, `scratch-show`): Breaks the `temporal scratch <action>` UX pattern specified in the spec.

### 4. Label Sanitization

**Decision**: Sanitize labels by lowercasing, replacing non-alphanumeric characters with hyphens, collapsing consecutive hyphens, and trimming leading/trailing hyphens. Result must be non-empty after sanitization or the command errors.

**Rationale**: Filename-safe slugs prevent filesystem errors across platforms. The transformation is simple, predictable, and idempotent. Already-valid labels (e.g., "quarterly-email") pass through unchanged.

**Alternatives considered**:
- Reject invalid labels with an error: Less user-friendly. The agent would need to know the exact character rules.
- URL-encode labels: Produces ugly filenames (`quarterly%20email.md`) that are hard to read in directory listings.

### 5. `temporal init` Warning for Scratch File Presence

**Decision**: When `temporal init` runs, check `cwd` for files matching `time-scratch*.md`. If found, emit a warning to stderr suggesting `temporal scratch` for ephemeral use. The `init` command still proceeds normally.

**Rationale**: This is a guardrail against LLM confusion — an agent running `init` in `/tmp/` would create a persistent `time.md` alongside ephemeral scratch pads, which could lead to reasoning errors. The warning is non-blocking (init still succeeds) to avoid breaking existing workflows.

**Alternatives considered**:
- Block `init` entirely if scratch files exist: Too aggressive. The user/agent might legitimately want both.
- Do nothing: Misses an opportunity to prevent a common agent mistake at near-zero cost.
