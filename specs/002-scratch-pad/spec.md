# Feature Specification: Scratch Pad Mode for Temporal

**Feature Branch**: `002-scratch-pad`
**Created**: 2026-02-18
**Status**: Draft
**Input**: User description: "Add a temporal scratch subcommand — an ephemeral, one-shot temporal reasoning aid for tasks that involve dates (drafting emails, proposals, schedules)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create a Scratch Pad (Priority: P1)

An LLM agent is about to draft an email that mentions several dates — a project deadline, a board meeting, and a deliverable handoff. Before writing anything, the agent runs `temporal scratch "quarterly-email"` to create a fresh scratch pad anchored at NOW. The scratch file is created in `/tmp/` (never in the project directory), giving the agent a clean spatial canvas to work with for this single drafting session.

**Why this priority**: Without creating the scratch pad, no other scratch commands work. This establishes the ephemeral spatial origin point.

**Independent Test**: Can be fully tested by running `temporal scratch "my-label"` and verifying a file is created at `/tmp/time-scratch-my-label.md` with a correct NOW section.

**Acceptance Scenarios**:

1. **Given** no existing scratch pad, **When** the user runs `temporal scratch "quarterly-email"`, **Then** a scratch file is created in `/tmp/` with a NOW section containing the current timestamp, weekday, week number, quarter, and timezone.
2. **Given** no existing scratch pad, **When** the user runs `temporal scratch` (no label), **Then** a scratch file is created at `/tmp/time-scratch.md` with a NOW section.
3. **Given** a scratch pad already exists at the target path, **When** the user runs `temporal scratch "quarterly-email"`, **Then** the existing scratch pad is replaced with a fresh one anchored at the current NOW.
4. **Given** a project directory with an existing `time.md`, **When** the user runs `temporal scratch`, **Then** the scratch file is created in `/tmp/` and the project `time.md` is not modified or referenced.

---

### User Story 2 - Add Events to the Scratch Pad (Priority: P1)

The agent has created a labeled scratch pad and now needs to populate it with the dates it will reference while drafting. It runs `temporal scratch add "deliverable handoff" --in "14 days" --scratch "quarterly-email"` and `temporal scratch add "board meeting" --on 2026-03-05 --scratch "quarterly-email"`. Each event appears in the scratch pad in the correct spatial section (Behind or Ahead) with a human-readable distance from NOW, sorted by position. Omitting `--scratch` targets the default unlabeled pad.

**Why this priority**: Adding events is the core value of the scratch pad. Without events, the spatial scaffold is empty and provides no reasoning aid.

**Independent Test**: Can be fully tested by creating a scratch pad, adding events with `--in`, `--on`, and `--at`, and verifying they appear in the correct section with correct distance labels.

**Acceptance Scenarios**:

1. **Given** an existing default scratch pad, **When** the user runs `temporal scratch add "deliverable" --in "14 days"`, **Then** "deliverable" appears in the Ahead section with distance "14 days ahead."
2. **Given** an existing labeled scratch pad "quarterly-email", **When** the user runs `temporal scratch add "kickoff" --on 2026-02-10 --scratch "quarterly-email"`, **Then** "kickoff" appears in the Behind section of that labeled pad with a correctly calculated distance from NOW.
3. **Given** a scratch pad with existing events, **When** a new event is added, **Then** all events remain sorted by timeline position within their section.
4. **Given** no scratch pad exists, **When** the user runs `temporal scratch add "event" --in "3 days"`, **Then** the command exits with an error suggesting `temporal scratch` first.
5. **Given** an event name that already exists in the scratch pad, **When** the user tries to add it again, **Then** the command exits with an error indicating the name is already used.

---

### User Story 3 - Show the Scratch Pad Layout (Priority: P1)

The agent needs to read the spatial layout before drafting. It runs `temporal scratch show --scratch "quarterly-email"` (or `temporal scratch show` for the default pad). The scratch pad is printed to stdout in the same ego-moving spatial format as the main timeline — Behind section (past events sorted furthest-first), NOW anchor, Ahead section (future events sorted soonest-first). The agent can now see that "the deliverable is 14 days ahead and the board meeting is 15 days ahead — so delivery is the day before the board meeting."

**Why this priority**: Reading the spatial layout is the entire point of the scratch pad. This is how the LLM extracts date relationships for reasoning.

**Independent Test**: Can be fully tested by creating a scratch pad with events in both past and future, running `temporal scratch show`, and verifying the output matches the ego-moving spatial format with correct sorting.

**Acceptance Scenarios**:

1. **Given** a scratch pad with events in both Behind and Ahead sections, **When** the user runs `temporal scratch show`, **Then** the full scratch pad is printed to stdout with Behind events sorted furthest-past-first and Ahead events sorted soonest-first.
2. **Given** an empty scratch pad (no events, just NOW), **When** the user runs `temporal scratch show`, **Then** only the NOW section is printed.
3. **Given** no scratch pad exists, **When** the user runs `temporal scratch show`, **Then** the command exits with an error suggesting `temporal scratch` first.

---

### User Story 4 - Clear the Scratch Pad (Priority: P2)

The agent has finished drafting and no longer needs the scratch pad. It runs `temporal scratch clear --scratch "quarterly-email"` (or `temporal scratch clear` for the default pad) to delete the scratch file from `/tmp/`. This keeps the system clean and reinforces the single-session, ephemeral nature of the scratch pad.

**Why this priority**: Cleanup is important for hygiene but not critical — `/tmp/` is cleaned by the OS eventually. Still, explicit cleanup is good practice and avoids stale scratch pads from confusing future sessions.

**Independent Test**: Can be fully tested by creating a scratch pad, running `temporal scratch clear`, and verifying the file no longer exists.

**Acceptance Scenarios**:

1. **Given** an existing scratch pad, **When** the user runs `temporal scratch clear`, **Then** the scratch file is deleted from `/tmp/`.
2. **Given** no scratch pad exists, **When** the user runs `temporal scratch clear`, **Then** the command exits with a warning that no scratch pad was found (exit 0, not an error).
3. **Given** a labeled scratch pad at `/tmp/time-scratch-quarterly-email.md`, **When** the user runs `temporal scratch clear --scratch "quarterly-email"`, **Then** the correct labeled scratch file is deleted.

---

### Edge Cases

- What happens when the label contains characters invalid for filenames (spaces, slashes)? The CLI sanitizes the label to a filename-safe slug (lowercase, hyphens, alphanumeric only).
- What happens when `/tmp/` is not writable? The CLI exits with a clear error on stderr explaining it cannot create the scratch file.
- What happens when two scratch sessions use the same label? The second `temporal scratch "label"` replaces the first — scratch pads are intentionally ephemeral and non-precious.
- What happens when the user accidentally runs `temporal scratch add` against the project `time.md`? The `scratch add` command only operates on scratch files in `/tmp/` — it never touches project files.
- What happens when `temporal scratch clear` is run without `--scratch` but a labeled scratch pad exists? Only the default (unlabeled) scratch pad is affected. Labeled pads require `--scratch <label>`.
- What happens when `temporal init` is run in `/tmp/` (or any directory containing scratch pad files)? The `init` command MUST warn on stderr that scratch pad files exist in the current directory and that `time.md` is a persistent project file — suggesting `temporal scratch` instead if ephemeral use is intended.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: CLI MUST provide a `temporal scratch [label]` command that creates an ephemeral scratch file in `/tmp/` with a NOW section containing timestamp, weekday, week number, quarter, and timezone.
- **FR-002**: CLI MUST create scratch files at `/tmp/time-scratch.md` (no label) or `/tmp/time-scratch-<label>.md` (with label), never in the project directory.
- **FR-002a**: Scratch file reads and writes MUST fail safely if the target path is a symlink (never follow symlinks).
- **FR-003**: CLI MUST provide a `temporal scratch add <event>` command with `--in`, `--on`, and `--at` options, identical in syntax to `temporal add`. Accepts `--scratch <label>` to target a labeled pad.
- **FR-004**: CLI MUST provide a `temporal scratch show` command that prints the scratch pad to stdout in the ego-moving spatial format. Accepts `--scratch <label>` to target a labeled pad.
- **FR-005**: CLI MUST provide a `temporal scratch clear` command that deletes the scratch file from `/tmp/`. Accepts `--scratch <label>` to target a labeled pad.
- **FR-006**: Scratch pad output MUST use the same ego-moving spatial format as the main timeline: Behind (past) and Ahead (future) sections, sorted by position, with human-readable distance labels.
- **FR-007**: Scratch pads MUST NOT include sequences or spans — only NOW + events.
- **FR-008**: Labels MUST be sanitized to filename-safe slugs (lowercase, hyphens, alphanumeric only).
- **FR-009**: Creating a scratch pad when one already exists at the same path MUST replace it with a fresh pad.
- **FR-010**: Scratch commands MUST never read, write, or modify the project `time.md`.
- **FR-011**: All scratch commands MUST follow the same stdout/stderr/exit-code conventions as the main CLI (valid markdown to stdout, errors to stderr, exit 0 success / non-zero failure).
- **FR-012**: Scratch commands MUST never present interactive prompts.
- **FR-013**: The scratch pad file MUST include an `iso` column in its event table for absolute timestamps, consistent with the main timeline format.
- **FR-014**: When no scratch pad exists, `scratch add` and `scratch show` MUST exit with a helpful error suggesting `temporal scratch` first. `scratch clear` MUST warn but exit 0.
- **FR-015**: The `scratch add`, `scratch show`, and `scratch clear` subcommands MUST accept an optional `--scratch <label>` flag. When provided, the command targets `/tmp/time-scratch-<label>.md`. When omitted, it targets the default `/tmp/time-scratch.md`.
- **FR-016**: `temporal init` MUST warn on stderr if scratch pad files (`time-scratch*.md`) exist in the current working directory, advising the user to use `temporal scratch` for ephemeral use instead. The `init` command still proceeds (creating `time.md`) but the warning prevents accidental confusion between persistent and ephemeral modes.
- **FR-017**: CLI MUST provide `temporal scratch create [label]` as an explicit create alias so labels that collide with reserved subcommand names (`add`, `show`, `clear`) can still be created unambiguously.

### Key Entities

- **Scratch Pad**: An ephemeral markdown file in `/tmp/` containing a NOW anchor and zero or more events. Has an optional label for context. Structurally a simplified `time.md` (no sequences, no spans).
- **NOW (scratch)**: The temporal origin point in the scratch pad. Same format as the main timeline NOW section.
- **Scratch Event**: A named point on the scratch timeline. Has a name, absolute timestamp, and computed distance from NOW. No type or notes metadata — kept minimal.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An LLM agent can run `temporal scratch && temporal scratch add "deadline" --in "5 days" && temporal scratch add "meeting" --in "6 days" && temporal scratch show` and receive valid markdown showing the spatial relationship between the two events, in under 2 seconds total.
- **SC-002**: The scratch pad output enables an LLM to correctly reason about date ordering — given two events added with known dates, the spatial layout makes their relative position unambiguous.
- **SC-003**: A complete scratch pad session (create, add 5 events, show, clear) leaves no residual files outside `/tmp/` and no modifications to any project files.
- **SC-004**: The scratch pad format is identical to the main timeline's ego-moving spatial format, so an LLM familiar with `temporal show` output can read `temporal scratch show` output with zero additional learning.
- **SC-005**: The scratch file path never collides with an existing project `time.md`, regardless of where the CLI is invoked from.

## Assumptions

- The scratch pad reuses the same date/duration parsing logic as the main `temporal add` command.
- Scratch pads intentionally omit `--type` and `--notes` metadata to keep the format minimal and focused on date relationships.
- The `/tmp/` directory is available and writable on all target platforms (macOS, Linux). On systems where `/tmp/` is unavailable, the CLI fails with a clear error.
- Scratch pads are intentionally non-precious — replacing an existing scratch pad on re-creation is expected behavior, not data loss.
- The label is purely for human/agent disambiguation when multiple scratch sessions are needed; it has no semantic meaning beyond filename differentiation.
- The `scratch add`, `scratch show`, and `scratch clear` subcommands use a `--scratch <label>` flag to target a labeled pad. When omitted, they target the default unlabeled pad at `/tmp/time-scratch.md`.

## Clarifications

### Session 2026-02-18

- Q: How does the label flow through `scratch add`, `scratch show`, and `scratch clear` when multiple labeled pads could exist? → A: Label passed via `--scratch <label>` flag on `add`/`show`/`clear`; omitting it targets the default unlabeled pad. Additionally, `temporal init` must warn if scratch pad files exist in the current directory to prevent confusion between persistent and ephemeral modes.
