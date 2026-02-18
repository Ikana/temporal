# Feature Specification: Time CLI — LLM-Friendly Temporal Scaffold

**Feature Branch**: `001-time-cli`
**Created**: 2026-02-17
**Status**: Draft
**Input**: User description: "Create the first version of the time CLI so that it is usable as an OpenClaw skill"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Initialize Time Context in a Project (Priority: P1)

A developer working with an LLM coding agent wants to give the agent a sense of "when." They run `temporal init` in their project directory. A `time.md` file is created with the current timestamp as the NOW anchor, including weekday, week number, quarter, and timezone. The LLM can now read this file and know exactly where it stands in time.

**Why this priority**: Without initialization, nothing else works. This is the foundation — creating the spatial origin point that all other temporal reasoning is relative to.

**Independent Test**: Can be fully tested by running `temporal init` in an empty directory and verifying the generated `time.md` contains a valid NOW section with correct current timestamp, weekday, week, quarter, and timezone.

**Acceptance Scenarios**:

1. **Given** an empty project directory, **When** the user runs `temporal init`, **Then** a `time.md` file is created with a NOW section containing the current timestamp, weekday, week number, quarter, and detected timezone.
2. **Given** a project directory that already has a `time.md`, **When** the user runs `temporal init`, **Then** the command warns that `time.md` already exists and does not overwrite it (unless `--force` is passed).
3. **Given** the user runs `temporal init --timezone America/New_York`, **When** the file is created, **Then** the timezone in the NOW section reflects the specified timezone rather than the auto-detected one.

---

### User Story 2 - Add Events to the Timeline (Priority: P1)

A developer wants to tell the LLM about upcoming deadlines, past milestones, or scheduled meetings. They run `temporal add "sprint review" --in "2 days"` or `temporal add "v1.0 released" --on 2026-02-10`. The event appears in the timeline, positioned spatially relative to NOW with a human-readable distance label.

**Why this priority**: Adding events is the core operation. Without events on the timeline, the scaffold is empty and useless to the LLM.

**Independent Test**: Can be fully tested by initializing a `time.md`, adding events with different temporal specifiers (`--in`, `--on`, `--at`), and verifying they appear in the correct section (Behind/Ahead) with correct distance labels, sorted by position.

**Acceptance Scenarios**:

1. **Given** an initialized `time.md`, **When** the user runs `temporal add "sprint review" --in "2 days"`, **Then** "sprint review" appears in the Ahead section with distance "2 days ahead."
2. **Given** an initialized `time.md`, **When** the user runs `temporal add "v1.0 released" --on 2026-02-10`, **Then** "v1.0 released" appears in the Behind section with a correctly calculated distance from NOW.
3. **Given** an initialized `time.md` with existing events, **When** a new event is added, **Then** all events remain sorted by timeline position (furthest past first, furthest future last).
4. **Given** the user adds an event with `--type milestone`, **When** the timeline is rendered, **Then** the event's type column shows "milestone."
5. **Given** the user adds an event with `--notes "deployed to prod"`, **When** the timeline is rendered, **Then** the event's notes column shows the provided text.

---

### User Story 3 - Refresh Distances from Current NOW (Priority: P1)

Time passes. An event that was "2 days ahead" yesterday is now "1 day ahead." The developer (or an LLM agent running a hook) runs `temporal refresh`. All distances in the file are recalculated from the current time. Events that have crossed from future to past are moved from the Ahead section to the Behind section. The NOW timestamp is updated.

**Why this priority**: Without refresh, the file becomes stale and misleading. This is what keeps the spatial scaffold accurate.

**Independent Test**: Can be fully tested by creating a `time.md` with a known past NOW timestamp and events, running `temporal refresh`, and verifying that all distances are recalculated, the NOW timestamp is updated, and events are in the correct sections.

**Acceptance Scenarios**:

1. **Given** a `time.md` with NOW set to yesterday and an event "1 day ahead," **When** `temporal refresh` is run today, **Then** that event moves to the Behind section and NOW is updated to the current timestamp.
2. **Given** a `time.md` with multiple events, **When** `temporal refresh` is run, **Then** all distance labels are recalculated relative to the new NOW and the sort order is maintained.
3. **Given** a `time.md` with sequences containing [NOW], **When** `temporal refresh` is run, **Then** the [NOW] marker position in sequences is updated if events have crossed from ahead to behind.

---

### User Story 4 - Show the Timeline (Priority: P2)

A developer or LLM wants to read the current temporal context. They run `temporal show` and the full `time.md` is printed to stdout. They can also run `temporal past` or `temporal ahead` to see only the relevant section.

**Why this priority**: Reading the timeline is essential but the file can also be read directly. The filtered views (`past`/`ahead`) add convenience.

**Independent Test**: Can be fully tested by populating a timeline with events in both past and future, then running `temporal show`, `temporal past`, and `temporal ahead`, verifying the correct sections are output.

**Acceptance Scenarios**:

1. **Given** a populated `time.md`, **When** the user runs `temporal show`, **Then** the full contents of `time.md` are printed to stdout.
2. **Given** a populated `time.md`, **When** the user runs `temporal past`, **Then** only the NOW section and the Behind (Past) events are printed.
3. **Given** a populated `time.md`, **When** the user runs `temporal ahead`, **Then** only the NOW section and the Ahead (Future) events are printed.

---

### User Story 5 - Remove Events (Priority: P2)

Events become irrelevant. A meeting was cancelled, a deadline moved. The developer runs `temporal remove "sprint review"` and the event is removed from the timeline and from any sequences that reference it.

**Why this priority**: Keeping the timeline clean prevents the LLM from reasoning about stale or irrelevant events.

**Independent Test**: Can be fully tested by adding events, removing one by name, and verifying it is gone from both the timeline table and any sequences.

**Acceptance Scenarios**:

1. **Given** a `time.md` with an event named "sprint review", **When** the user runs `temporal remove "sprint review"`, **Then** the event is removed from the timeline.
2. **Given** an event that appears in a sequence, **When** that event is removed, **Then** it is also removed from the sequence chain.
3. **Given** a name that matches no event, **When** the user runs `temporal remove "nonexistent"`, **Then** an error message is shown listing available events.

---

### User Story 6 - Define Event Sequences (Priority: P3)

A developer wants to show the LLM where they are in a process. They run `temporal seq release-cycle "v1.0 released" "bug reported" "fix pushed" "sprint review" "v1.1 deadline"`. The sequence appears as a spatial chain with [NOW] inserted at the correct position based on which events are past and which are future.

**Why this priority**: Sequences add causal/process context on top of raw temporal ordering. Valuable but not essential for initial usability.

**Independent Test**: Can be fully tested by adding events to the timeline, creating a sequence referencing them, and verifying the [NOW] marker is correctly placed between past and future events.

**Acceptance Scenarios**:

1. **Given** a timeline with events "v1.0 released" (past) and "sprint review" (future), **When** the user runs `temporal seq release-cycle "v1.0 released" "sprint review"`, **Then** the sequence shows: `v1.0 released → [NOW] → sprint review`.
2. **Given** a sequence with events that are all in the past, **When** the sequence is rendered, **Then** [NOW] appears at the end of the chain.
3. **Given** an event referenced in a sequence that does not exist in the timeline, **When** the sequence is created, **Then** a warning is shown but the sequence is still created.

---

### User Story 7 - Define Durations/Spans (Priority: P3)

A developer wants to tell the LLM how long something spans. They run `temporal span "current sprint" --from "5 days ago" --to "2 days from now"`. The span appears in the Durations section showing its start, end, and total length.

**Why this priority**: Durations are enrichment — they help the LLM understand the "size" of time periods but are not critical for initial temporal reasoning.

**Independent Test**: Can be fully tested by creating a span and verifying it appears with correct from/to/length values.

**Acceptance Scenarios**:

1. **Given** an initialized `time.md`, **When** the user runs `temporal span "current sprint" --from "5 days ago" --to "2 days from now"`, **Then** a span appears in the Durations section with from "5 days behind", to "2 days ahead", and length "7 days."
2. **Given** a span that already exists, **When** the user runs the same span command with different values, **Then** the existing span is updated.

---

### User Story 8 - Usable as an OpenClaw Skill (Priority: P1)

An LLM agent using OpenClaw can invoke `temporal` commands as a skill. The CLI outputs valid, parseable markdown to stdout and errors to stderr. Exit codes are 0 for success and non-zero for failure. The CLI works without interactive prompts — all input comes via arguments. This allows an LLM to call `temporal show` before reasoning about scheduling, or `temporal refresh && temporal ahead` to get an up-to-date view of upcoming events.

**Why this priority**: The entire purpose of this tool is to be used by LLMs. If it cannot be invoked non-interactively with clean stdout/stderr separation, it fails its primary mission.

**Independent Test**: Can be fully tested by scripting a sequence of CLI calls, capturing stdout and stderr, verifying exit codes, and confirming all output is valid markdown.

**Acceptance Scenarios**:

1. **Given** a valid command, **When** the CLI runs, **Then** output goes to stdout as valid markdown and the exit code is 0.
2. **Given** an invalid command or missing arguments, **When** the CLI runs, **Then** a helpful error message goes to stderr and the exit code is non-zero.
3. **Given** any command, **When** the CLI runs, **Then** no interactive prompts are presented — the command either succeeds with the given arguments or fails with a clear error.
4. **Given** the CLI is installed, **When** an LLM agent runs `temporal show`, **Then** it receives the full `time.md` content on stdout, ready to be included in context.

---

### Edge Cases

- What happens when `time.md` is manually edited with invalid formatting? The CLI should attempt to parse it gracefully and warn about sections it cannot understand, but not crash.
- What happens when two events have the same name? The CLI should reject the addition and suggest using a distinct name.
- What happens when an event's date cannot be parsed? The CLI should fail with a clear error on stderr specifying what format is expected.
- What happens when `temporal refresh` is run but `time.md` does not exist? The CLI should exit with an error suggesting `temporal init`.
- What happens when the system clock is wrong or timezone cannot be detected? The CLI should fall back to UTC and note this in the output.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: CLI MUST provide a `temporal init` command that creates a `time.md` file with a NOW section containing timestamp, weekday, week number, quarter, and timezone.
- **FR-002**: CLI MUST provide a `temporal add <event>` command with `--in <duration>`, `--on <date>`, and `--at <datetime>` options for placing events on the timeline.
- **FR-003**: CLI MUST provide a `temporal refresh` command that recalculates all distances from the current time and updates the NOW section.
- **FR-004**: CLI MUST provide a `temporal show` command that outputs the full `time.md` to stdout.
- **FR-005**: CLI MUST provide `temporal past` and `temporal ahead` commands that output filtered views of the timeline.
- **FR-006**: CLI MUST provide a `temporal remove <event>` command that removes an event by name from timeline and sequences.
- **FR-007**: CLI MUST provide a `temporal seq <name> <events...>` command that creates named event sequences with [NOW] auto-positioned.
- **FR-008**: CLI MUST provide a `temporal span <name> --from <x> --to <y>` command for defining temporal spans.
- **FR-009**: CLI MUST provide a `temporal now` command that updates only the NOW section without recalculating event distances.
- **FR-010**: All CLI output MUST be valid markdown written to stdout. Errors MUST go to stderr.
- **FR-011**: CLI MUST use exit code 0 for success and non-zero for failure.
- **FR-012**: CLI MUST never present interactive prompts — all input via command-line arguments.
- **FR-013**: Events in the Behind section MUST be sorted from furthest past to most recent. Events in the Ahead section MUST be sorted from soonest to furthest future.
- **FR-014**: CLI MUST use the ego-moving metaphor consistently: past events are "behind," future events are "ahead." Never use time-moving language.
- **FR-015**: CLI MUST express distances in human-readable units, choosing the most appropriate granularity (minutes, hours, days, weeks, months).
- **FR-016**: CLI MUST support `--type <type>` and `--notes <text>` options on `temporal add` for event metadata.
- **FR-017**: CLI MUST include an `iso` column in timeline tables containing the absolute ISO 8601 timestamp for each event, so that `temporal refresh` can recalculate distances.

### Key Entities

- **NOW**: The temporal origin point. Contains timestamp, weekday, week number, quarter, timezone. All other entities are positioned relative to NOW.
- **Event**: A named point on the timeline. Has a name, absolute timestamp, type (optional), notes (optional), and a computed distance from NOW.
- **Sequence**: A named ordered chain of events with [NOW] as a landmark. Represents a process or workflow.
- **Span**: A named duration with a start point, end point, and computed length. Represents how much timeline a period occupies.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An LLM agent can run `temporal init && temporal add "deadline" --in "5 days" && temporal show` and receive valid, parseable markdown output containing a NOW section and a correctly positioned event, in under 2 seconds total.
- **SC-002**: After running `temporal refresh`, all distance labels in the file accurately reflect the actual temporal distance from the current time, with no events in the wrong section (past event in Ahead or future event in Behind).
- **SC-003**: The CLI can be installed and used as an OpenClaw skill without modification — non-interactive, clean stdout/stderr separation, correct exit codes.
- **SC-004**: A `time.md` file produced by the CLI can be read by a human and understood without knowing the CLI exists — it is self-documenting markdown.
- **SC-005**: The CLI handles a timeline with 100+ events without noticeable performance degradation (all commands complete in under 1 second).
- **SC-006**: Running `temporal refresh` on a stale `time.md` (NOW set 30 days ago) correctly reclassifies all events and produces an accurate, up-to-date file.

## Clarifications

### Session 2026-02-17

- Q: CLI binary name — `time` conflicts with the Unix shell builtin. What should the binary be named? → A: `temporal`
- Q: How should absolute timestamps be stored in `time.md` for `temporal refresh` to recalculate? → A: Extra `iso` column in the timeline tables — always visible, fully transparent
- Q: How does the CLI integrate as an OpenClaw skill? → A: Standalone binary on `$PATH` — no manifest, any agent calls it directly as a subprocess

## Assumptions

- The CLI binary is named `temporal` to avoid conflict with the Unix `time` shell builtin.
- The CLI will be built with TypeScript on the Bun runtime, as specified in `agents.md`.
- The timezone is auto-detected from the system environment (`TZ` variable or OS default), with a `--timezone` flag as an override.
- The `time.md` timeline tables include an `iso` column containing the absolute ISO 8601 timestamp for each event, making timestamps always visible and transparent. This allows `temporal refresh` to recalculate distances without external state.
- "OpenClaw skill" means the CLI is a standalone binary installed on `$PATH`. Any agent framework (OpenClaw, Claude Code, Codex) can invoke it directly as a subprocess — no manifest, MCP server, or registration required.
- Duration parsing supports common human-readable formats: "3 days", "2 hours", "1 week", "5 minutes", "in 3 days", "3 days ago".
- Date parsing supports ISO 8601 dates (2026-02-17), common formats (Feb 17 2026), and relative expressions (tomorrow, yesterday, next Monday).
