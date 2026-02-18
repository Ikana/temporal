# Tasks: Temporal CLI

**Input**: Design documents from `/specs/001-time-cli/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/cli.md

**Tests**: Included per constitution (Development Workflow: test-driven).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup

**Purpose**: Project initialization and basic structure

- [X] T001 Initialize Bun project with `bun init`, configure package.json with name `temporal`, bin entry, and build script (`bun build --compile --minify src/index.ts --outfile temporal`)
- [X] T002 Create tsconfig.json with strict mode, ESNext target, Bun types
- [X] T003 [P] Create directory structure: `src/commands/`, `src/lib/`, `tests/commands/`, `tests/lib/`, `tests/integration/`
- [X] T004 [P] Define TypeScript interfaces in src/types.ts: `Now`, `Event`, `Sequence`, `Span`, `TimeContext` per data-model.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core library modules that ALL commands depend on. MUST complete before any user story.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T005 Implement duration parser in src/lib/duration.ts — parse strings like "3 days", "2 hours", "1 week", "5 days ago", "in 3 days" into `{ ms: number, direction: "past" | "future" }` using regex + unit lookup table
- [X] T006 [P] Write tests for duration parser in tests/lib/duration.test.ts — cover all unit types (minutes, hours, days, weeks, months), "ago" suffix, "in" prefix, decimal values, invalid input
- [X] T007 Implement date parser in src/lib/date-parse.ts — parse ISO 8601 dates, relative expressions (tomorrow, yesterday, next Monday), and common formats (Feb 20 2026) into Date objects
- [X] T008 [P] Write tests for date parser in tests/lib/date-parse.test.ts — cover ISO dates, relative expressions, common formats, invalid input
- [X] T009 Implement distance formatter in src/lib/distance.ts — compute millisecond difference between two dates, select granularity (minutes/hours/days/weeks/months), format as "X units ahead" or "X units behind"
- [X] T010 [P] Write tests for distance formatter in tests/lib/distance.test.ts — cover all granularity thresholds, ahead/behind, edge cases (exactly 0, exactly 1 day)
- [X] T011 Implement markdown parser in src/lib/parser.ts — parse `time.md` content string into `TimeContext` object: extract Now section (bullet list), Behind/Ahead tables (with iso column), Sequences (arrow chains), Durations table
- [X] T012 [P] Implement markdown renderer in src/lib/renderer.ts — render `TimeContext` object into valid `time.md` markdown string with all sections, tables, and sequences
- [X] T013 Write tests for parser in tests/lib/parser.test.ts — parse a known `time.md` string, verify all fields extracted correctly
- [X] T014 [P] Write tests for renderer in tests/lib/renderer.test.ts — render a known `TimeContext`, verify output matches expected markdown
- [X] T015 Write round-trip test in tests/lib/parser.test.ts — parse → render → parse produces identical `TimeContext` (fidelity invariant)
- [X] T016 Create CLI entry point in src/index.ts — subcommand dispatch via `switch(process.argv[2])`, unknown command prints usage to stderr and exits 1, no command prints usage to stderr and exits 1

**Checkpoint**: Foundation ready — parser, renderer, duration/date/distance libs all working with tests passing. User story implementation can begin.

---

## Phase 3: User Story 1 - Initialize Time Context (Priority: P1) MVP

**Goal**: `temporal init` creates a `time.md` with NOW section.

**Independent Test**: Run `temporal init` in empty dir, verify `time.md` has correct NOW section.

### Tests for User Story 1

> **Write these tests FIRST, ensure they FAIL before implementation**

- [X] T017 [P] [US1] Write tests for init command in tests/commands/init.test.ts — test: creates time.md in empty dir, refuses overwrite without --force, accepts --force, accepts --timezone flag, output is valid markdown on stdout

### Implementation for User Story 1

- [X] T018 [US1] Implement init command in src/commands/init.ts — detect timezone via `Intl.DateTimeFormat`, compute weekday/week/quarter, create TimeContext with empty event lists, render to markdown, write to `time.md`, print to stdout. Support `--timezone` and `--force` flags via `util.parseArgs`.
- [X] T019 [US1] Wire init command in src/index.ts — add `case "init"` to dispatch switch

**Checkpoint**: `temporal init` works. A developer can create a `time.md` with accurate NOW section. MVP foundation is functional.

---

## Phase 4: User Story 2 - Add Events to Timeline (Priority: P1) MVP

**Goal**: `temporal add` places events on the timeline with correct spatial position.

**Independent Test**: Init, add events with --in/--on/--at, verify they appear in correct section with correct distance.

### Tests for User Story 2

> **Write these tests FIRST, ensure they FAIL before implementation**

- [X] T020 [P] [US2] Write tests for add command in tests/commands/add.test.ts — test: adds future event with --in, adds past event with --on, maintains sort order, supports --type and --notes, rejects duplicate name, requires exactly one of --in/--on/--at

### Implementation for User Story 2

- [X] T021 [US2] Implement add command in src/commands/add.ts — parse time.md, parse duration/date from --in/--on/--at flag, create Event with computed distance, insert into correct section (behind/ahead) maintaining sort order, render and write
- [X] T022 [US2] Wire add command in src/index.ts — add `case "add"` to dispatch switch

**Checkpoint**: `temporal init && temporal add "deadline" --in "5 days"` works. Timeline has events with correct spatial positioning.

---

## Phase 5: User Story 3 - Refresh Distances (Priority: P1) MVP

**Goal**: `temporal refresh` recalculates all distances from current time and moves events between sections.

**Independent Test**: Create stale time.md (old NOW), refresh, verify distances updated and events reclassified.

### Tests for User Story 3

> **Write these tests FIRST, ensure they FAIL before implementation**

- [X] T023 [P] [US3] Write tests for refresh command in tests/commands/refresh.test.ts — test: updates NOW timestamp, recalculates all distances, moves events from Ahead to Behind when they cross NOW, updates [NOW] position in sequences, maintains sort order

### Implementation for User Story 3

- [X] T024 [US3] Implement refresh command in src/commands/refresh.ts — parse time.md, update Now to current time, recompute all event distances, reclassify events into behind/ahead, re-sort both sections, update [NOW] in sequences, render and write
- [X] T025 [US3] Wire refresh command in src/index.ts — add `case "refresh"` to dispatch switch
- [X] T048 [P] [US3] Write tests for now command in tests/commands/now.test.ts — test: updates NOW timestamp without recalculating distances, supports --timezone flag, errors when time.md missing
- [X] T026 [US3] Implement now command in src/commands/now.ts — parse time.md, update only the Now section (no distance recalculation), render and write. Wire in index.ts as `case "now"`.

**Checkpoint**: Full MVP working. `temporal init && temporal add "x" --in "1 day" && temporal refresh` produces accurate, up-to-date time.md.

---

## Phase 6: User Story 4 - Show the Timeline (Priority: P2)

**Goal**: `temporal show`, `temporal past`, `temporal ahead` output filtered views.

**Independent Test**: Populate timeline, run each view command, verify correct sections output.

### Tests for User Story 4

> **Write these tests FIRST, ensure they FAIL before implementation**

- [X] T027 [P] [US4] Write tests for show/past/ahead commands in tests/commands/show.test.ts — test: show outputs full file, past outputs NOW + Behind only, ahead outputs NOW + Ahead only, all exit 0

### Implementation for User Story 4

- [X] T028 [P] [US4] Implement show command in src/commands/show.ts — read time.md, print to stdout
- [X] T029 [P] [US4] Implement past command in src/commands/past.ts — parse time.md, render only Now section + Behind table, print to stdout
- [X] T030 [P] [US4] Implement ahead command in src/commands/ahead.ts — parse time.md, render only Now section + Ahead table, print to stdout
- [X] T031 [US4] Wire show, past, ahead commands in src/index.ts

**Checkpoint**: Full read interface working. LLM agents can call `temporal show` or `temporal ahead` to get temporal context.

---

## Phase 7: User Story 5 - Remove Events (Priority: P2)

**Goal**: `temporal remove` removes events from timeline and sequences.

**Independent Test**: Add events, remove one, verify gone from timeline and sequences.

### Tests for User Story 5

> **Write these tests FIRST, ensure they FAIL before implementation**

- [X] T032 [P] [US5] Write tests for remove command in tests/commands/remove.test.ts — test: removes event from timeline, removes event from sequences, errors on nonexistent event with available list

### Implementation for User Story 5

- [X] T033 [US5] Implement remove command in src/commands/remove.ts — parse time.md, find event by name (case-insensitive), remove from behind/ahead events, remove from all sequences, render and write. Error to stderr if not found.
- [X] T034 [US5] Wire remove command in src/index.ts

**Checkpoint**: Timeline management complete. Events can be added and removed.

---

## Phase 8: User Story 6 - Define Event Sequences (Priority: P3)

**Goal**: `temporal seq` creates named event chains with [NOW] auto-positioned.

**Independent Test**: Add events, create sequence, verify [NOW] placed correctly between past and future events.

### Tests for User Story 6

> **Write these tests FIRST, ensure they FAIL before implementation**

- [X] T046 [P] [US6] Write tests for seq command in tests/commands/seq.test.ts — test: creates sequence with [NOW] between past and future events, [NOW] at end when all events past, [NOW] at start when all events future, warns on unrecognized event names, rejects fewer than 2 events

### Implementation for User Story 6

- [X] T035 [US6] Implement seq command in src/commands/seq.ts — parse time.md, create/update Sequence with given event names, warn on stderr for event names not in timeline, render and write. [NOW] positioning handled by renderer.
- [X] T036 [US6] Wire seq command in src/index.ts

**Checkpoint**: Sequences working. LLMs can see where they are in a process.

---

## Phase 9: User Story 7 - Define Durations/Spans (Priority: P3)

**Goal**: `temporal span` creates named duration periods.

**Independent Test**: Create span, verify from/to/length in Durations table.

### Tests for User Story 7

> **Write these tests FIRST, ensure they FAIL before implementation**

- [X] T047 [P] [US7] Write tests for span command in tests/commands/span.test.ts — test: creates span with correct from/to/length, updates existing span, errors when from is after to, supports duration and date inputs for --from/--to

### Implementation for User Story 7

- [X] T037 [US7] Implement span command in src/commands/span.ts — parse time.md, parse --from and --to via duration/date parser, create/update Span with computed distances and length, render and write
- [X] T038 [US7] Wire span command in src/index.ts

**Checkpoint**: Full feature set working. All 10 commands operational.

---

## Phase 10: User Story 8 - OpenClaw Skill Compatibility (Priority: P1)

**Goal**: CLI works as a standalone binary invocable by any LLM agent framework.

**Independent Test**: Script a sequence of CLI calls, verify stdout/stderr separation, exit codes, valid markdown output.

### Tests for User Story 8

- [X] T039 [P] [US8] Write integration test in tests/integration/workflow.test.ts — end-to-end: init → add multiple events → show → refresh → ahead → past → remove → show. Verify all stdout is valid markdown, all exit codes are 0 for success and 1 for errors, no interactive prompts.

### Implementation for User Story 8

- [X] T040 [US8] Build standalone binary with `bun build --compile --minify src/index.ts --outfile temporal` — verify binary runs independently, test on clean environment without Bun installed
- [X] T041 [US8] Add usage/help output — `temporal` with no args or `temporal --help` prints usage to stderr listing all commands

**Checkpoint**: CLI is a shippable binary. Any LLM agent can call it as a subprocess.

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T042 [P] Add error handling for missing time.md across all commands — consistent error message to stderr: `Error: time.md not found. Run 'temporal init' first.`
- [X] T043 [P] Add graceful handling of malformed time.md — parser should warn on stderr for sections it cannot understand but not crash
- [X] T044 Run quickstart.md validation — execute all quickstart examples and verify they work
- [X] T045 Verify all commands use ego-moving language only — audit all user-facing strings for time-moving language (constitution principle II)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - US1 (init) can start after Foundational
  - US2 (add) can start after Foundational (uses duration/date parsers)
  - US3 (refresh) can start after Foundational (uses distance formatter)
  - US4 (show/past/ahead) can start after Foundational
  - US5 (remove) can start after Foundational
  - US6 (seq) can start after Foundational
  - US7 (span) can start after Foundational
  - US8 (integration) depends on US1-US5 being complete
- **Polish (Phase 11)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (init)**: Independent — no dependencies on other stories
- **US2 (add)**: Independent — no dependencies on other stories
- **US3 (refresh)**: Independent — no dependencies on other stories
- **US4 (show/past/ahead)**: Independent — but more useful after US1+US2
- **US5 (remove)**: Independent — but more useful after US2
- **US6 (seq)**: Independent — but more useful after US2
- **US7 (span)**: Independent — no dependencies on other stories
- **US8 (integration)**: Depends on US1-US5 — integration test covers the full workflow

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Implementation before wiring to index.ts
- Story complete before moving to next priority

### Parallel Opportunities

- T003 + T004 (setup tasks) can run in parallel
- T006 + T008 + T010 (foundational test files) can run in parallel
- T011 + T012 (parser + renderer) can run in parallel
- T013 + T014 (parser tests + renderer tests) can run in parallel
- US1 through US7 can all start in parallel after Foundational completes (if team capacity allows)
- T028 + T029 + T030 (show/past/ahead implementations) can run in parallel

---

## Implementation Strategy

### MVP First (User Stories 1-3)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: US1 (init)
4. Complete Phase 4: US2 (add)
5. Complete Phase 5: US3 (refresh)
6. **STOP and VALIDATE**: `temporal init && temporal add "x" --in "3 days" && temporal refresh && cat time.md`
7. Deploy/build binary if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 (init) → Can create time.md (MVP seed)
3. US2 (add) → Can populate timeline (MVP functional)
4. US3 (refresh) → Timeline stays fresh (MVP complete)
5. US4 (show/past/ahead) → Filtered views for LLM agents
6. US5 (remove) → Timeline management
7. US6 (seq) → Process visualization
8. US7 (span) → Duration context
9. US8 (integration) → Binary distribution
10. Polish → Production ready

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
