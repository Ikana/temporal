# Feature Specification: OpenClaw Skill Package for temporal CLI

**Feature Branch**: `003-openclaw-skill-package`
**Created**: 2026-02-18
**Status**: Draft
**Input**: User description: "Create an OpenClaw skill package for the temporal CLI — an LLM-friendly temporal reasoning tool. The skill will be published to ClawHub so any OpenClaw agent can use it."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Agent discovers and uses temporal for date reasoning (Priority: P1)

An OpenClaw agent receives a task involving dates, deadlines, or scheduling. The agent's skill registry matches the `time` skill. The agent reads SKILL.md, understands when and how to use `temporal`, initializes a timeline, adds relevant events, and reads the spatial layout to reason about temporal relationships — all without human intervention.

**Why this priority**: This is the core value proposition — an agent that can self-serve temporal reasoning by reading the skill document. If this doesn't work, nothing else matters.

**Independent Test**: Can be fully tested by having an agent with the skill installed receive a date-reasoning task and successfully produce correct temporal output by following SKILL.md instructions alone.

**Acceptance Scenarios**:

1. **Given** an agent with the `time` skill installed and `temporal` on PATH, **When** the agent receives a task like "when is the Q2 deadline relative to the sprint end?", **Then** the agent reads SKILL.md, runs `temporal init`, adds relevant events, runs `temporal show`, and uses the spatial layout to answer correctly.
2. **Given** an agent with the `time` skill installed but `temporal` not on PATH, **When** the agent attempts to use the skill, **Then** SKILL.md's prerequisites section directs the agent to install from github.com/Ikana/temporal.
3. **Given** an agent with no prior knowledge of temporal, **When** the agent reads SKILL.md for the first time, **Then** the agent can successfully execute all basic commands (init, add, show) without external help.

---

### User Story 2 - Agent uses scratch pad pattern for one-shot reasoning (Priority: P2)

An agent needs to draft content that references dates (e.g., a project status email). The agent uses the scratch pad pattern: initializes `temporal` in /tmp, adds relevant dates, reads the spatial layout to understand temporal relationships, drafts the content with correct date references, then cleans up.

**Why this priority**: The scratch pad pattern enables transient temporal reasoning without polluting the project directory — a common agent workflow for drafting tasks.

**Independent Test**: Can be tested by having an agent draft a date-referencing document using the scratch pad workflow and verifying the dates are spatially correct.

**Acceptance Scenarios**:

1. **Given** an agent drafting a status report with multiple date references, **When** the agent follows the scratch pad pattern from SKILL.md, **Then** the agent creates time.md in /tmp, reasons about dates spatially, drafts correct content, and removes time.md afterward.
2. **Given** an agent using the scratch pad pattern, **When** the agent finishes drafting, **Then** no time.md file remains in the project directory or /tmp.

---

### User Story 3 - Agent uses sequences and spans for project planning (Priority: P3)

An agent is helping plan a project timeline. The agent uses `temporal seq` to define ordered event chains (e.g., release phases) and `temporal span` to define durations (e.g., sprints), then reads the full spatial timeline to reason about overlaps and ordering.

**Why this priority**: Sequences and spans enable richer temporal reasoning for planning tasks, building on the core event-based timeline.

**Independent Test**: Can be tested by having an agent create a multi-phase project timeline using sequences and spans, and verifying the spatial relationships are correct.

**Acceptance Scenarios**:

1. **Given** an agent planning a release cycle, **When** the agent follows SKILL.md to create a sequence with `temporal seq`, **Then** the output shows events in order with [NOW] correctly positioned among them.
2. **Given** an agent tracking a sprint, **When** the agent creates a span with `temporal span`, **Then** the output shows the duration with correct from/to distances and total length.

---

### Edge Cases

- What happens when an agent reads a stale time.md without running `temporal refresh` first? SKILL.md must clearly instruct agents to refresh before reading.
- What happens when an agent uses time-moving language (e.g., "the deadline is approaching") instead of ego-moving language? SKILL.md must clearly define the ego-moving metaphor and provide correct/incorrect examples.
- What happens when an agent tries to add a duplicate event name? SKILL.md must document that event names must be unique and instruct removal before re-adding.
- What happens when the skill document exceeds 200 lines? The skill becomes harder for agents to process; it must stay concise.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The skill package MUST consist of a single `time/SKILL.md` file with no other files.
- **FR-002**: SKILL.md MUST contain YAML frontmatter with name, slug, description, and when_to_use fields for ClawHub discovery.
- **FR-003**: SKILL.md MUST document all temporal CLI commands: init, now, add, show, past, ahead, refresh, seq, span, remove.
- **FR-004**: SKILL.md MUST include a prerequisites section that states `temporal` must be on $PATH and links to github.com/Ikana/temporal for installation.
- **FR-005**: SKILL.md MUST explain the ego-moving metaphor with correct and incorrect usage examples ("we are approaching the deadline" vs. "the deadline is approaching").
- **FR-006**: SKILL.md MUST document the scratch pad pattern for one-shot temporal reasoning in /tmp.
- **FR-007**: SKILL.md MUST include an annotated example of the time.md file format so agents understand the spatial layout without running the tool.
- **FR-008**: SKILL.md MUST instruct agents to run `temporal refresh` before reading time.md if it might be stale.
- **FR-009**: SKILL.md MUST document that all output goes to stdout as valid markdown and errors go to stderr.
- **FR-010**: SKILL.md MUST document that temporal is fully non-interactive (no prompts).
- **FR-011**: SKILL.md MUST be under 200 lines total to remain concise and agent-friendly.
- **FR-012**: The ClawHub slug MUST be `time`.

### Key Entities

- **SKILL.md**: The skill document — a structured markdown file with YAML frontmatter that teaches an OpenClaw agent when and how to use `temporal`. Contains command reference, usage patterns, constraints, and an annotated output example.
- **time.md**: The spatial timeline file generated by `temporal` — a self-documenting markdown file that maps events as signed distances from NOW. Not part of the skill package but documented within SKILL.md so agents understand its format.

## Assumptions

- The `temporal` binary is already built, tested, and available on GitHub releases. The skill does not bundle or build the binary.
- The SKILL.md YAML frontmatter fields (name, slug, description, when_to_use) follow OpenClaw/ClawHub conventions for skill discovery.
- Agents consuming the skill have access to a shell to run CLI commands.
- The `time` slug is confirmed available on ClawHub.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An agent with no prior knowledge of temporal can read SKILL.md and successfully execute a complete workflow (init, add events, show timeline) on the first attempt.
- **SC-002**: SKILL.md is under 200 lines and covers all 10 temporal CLI commands.
- **SC-003**: The skill package contains exactly one file (SKILL.md) in a `time/` directory.
- **SC-004**: An agent following SKILL.md consistently uses ego-moving language in its temporal reasoning output.
- **SC-005**: The skill is discoverable on ClawHub via the `time` slug and triggers for tasks involving dates, deadlines, scheduling, or time-relative reasoning.
