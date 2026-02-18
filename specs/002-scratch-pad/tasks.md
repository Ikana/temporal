# Tasks: Scratch Pad Mode for Temporal

**Input**: Design documents from `/specs/002-scratch-pad/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included — the existing project follows a test-driven pattern with both unit and integration tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Register the scratch subcommand and establish shared scratch pad utilities

- [x] T001 Add scratch file path resolution and label sanitization in src/lib/scratch.ts — export `scratchFilePath(label?: string): string` (returns `/tmp/time-scratch.md` or `/tmp/time-scratch-<label>.md`) and `sanitizeLabel(input: string): string` (lowercase, replace non-alphanumeric with hyphens, collapse consecutive hyphens, trim, error if empty)
- [x] T002 Add scratch file I/O helpers in src/lib/file.ts — export `loadScratchContext(label?: string): TimeContext` (reads and parses scratch file at computed path, throws CliError if not found) and `saveScratchContext(context: TimeContext, label?: string): string` (renders and writes to computed path, returns rendered content)
- [x] T003 Add scratch error constants in src/lib/errors.ts — add `MISSING_SCRATCH_FILE_ERROR` message: `"No scratch pad found. Run 'temporal scratch' first."`
- [x] T004 Create scratch subcommand dispatcher in src/commands/scratch.ts — export `scratchCommand(args: string[]): void` that dispatches `args[0]` to internal handlers: `add` → scratchAdd, `show` → scratchShow, `clear` → scratchClear, anything else (or empty) → scratchCreate with `args[0]` as optional label
- [x] T005 Register scratch command in src/index.ts — import `scratchCommand` from `src/commands/scratch.ts` and add `scratch: scratchCommand` to the commands dispatch table
- [x] T006 Update USAGE string in src/lib/cli.ts — add scratch subcommands: `scratch [label]`, `scratch add <event> --in/--on/--at [--scratch <label>]`, `scratch show [--scratch <label>]`, `scratch clear [--scratch <label>]`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Unit tests for the shared scratch utilities that all user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 [P] Unit tests for label sanitization in tests/lib/scratch.test.ts — test `sanitizeLabel`: lowercase conversion, space-to-hyphen, slash-to-hyphen, consecutive hyphen collapse, leading/trailing hyphen trim, already-valid passthrough, empty-after-sanitization error
- [x] T008 [P] Unit tests for scratch file path resolution in tests/lib/scratch.test.ts — test `scratchFilePath`: no label returns `/tmp/time-scratch.md`, with label returns `/tmp/time-scratch-<sanitized>.md`, label sanitization is applied before path construction

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Create a Scratch Pad (Priority: P1) MVP

**Goal**: `temporal scratch [label]` creates an ephemeral scratch file in `/tmp/` with a NOW section

**Independent Test**: Run `temporal scratch "my-label"` and verify `/tmp/time-scratch-my-label.md` exists with correct NOW section

### Tests for User Story 1

- [x] T009 [P] [US1] Integration test for scratch create (default) in tests/commands/scratch.test.ts — run `temporal scratch`, assert exit 0, stdout contains `# Time Context` and `## Now` with valid timestamp, verify `/tmp/time-scratch.md` exists, clean up after
- [x] T010 [P] [US1] Integration test for scratch create (labeled) in tests/commands/scratch.test.ts — run `temporal scratch "test-label"`, assert exit 0, verify `/tmp/time-scratch-test-label.md` exists with NOW section, clean up after
- [x] T011 [P] [US1] Integration test for scratch create (replace existing) in tests/commands/scratch.test.ts — create a scratch pad, run `temporal scratch` again, verify file is replaced with fresh NOW timestamp
- [x] T012 [P] [US1] Integration test for scratch create (does not touch project time.md) in tests/commands/scratch.test.ts — init a time.md in a temp dir, run `temporal scratch`, verify time.md is unmodified and scratch file is in `/tmp/`

### Implementation for User Story 1

- [x] T013 [US1] Implement scratchCreate handler in src/commands/scratch.ts — parse optional label from args, call `emptyContext()`, call `saveScratchContext(context, label)`, write rendered content to stdout

**Checkpoint**: `temporal scratch [label]` works end-to-end. Scratch pad created in `/tmp/` with NOW section.

---

## Phase 4: User Story 2 - Add Events to the Scratch Pad (Priority: P1)

**Goal**: `temporal scratch add <event> --in/--on/--at [--scratch <label>]` adds events to the scratch pad

**Independent Test**: Create a scratch pad, add events with different date specifiers, verify they appear in correct sections with correct distances

**Depends on**: US1 (scratch pad must exist before events can be added)

### Tests for User Story 2

- [x] T014 [P] [US2] Integration test for scratch add with --in in tests/commands/scratch.test.ts — create default scratch pad, run `temporal scratch add "deadline" --in "5 days"`, assert exit 0, stdout contains "deadline" in Ahead section with "5 days ahead", clean up
- [x] T015 [P] [US2] Integration test for scratch add with --on (past date) in tests/commands/scratch.test.ts — create scratch pad, run `temporal scratch add "kickoff" --on <past-date>`, verify event appears in Behind section
- [x] T016 [P] [US2] Integration test for scratch add with --scratch flag in tests/commands/scratch.test.ts — create labeled scratch pad, run `temporal scratch add "event" --in "3 days" --scratch "test-label"`, verify event added to labeled pad file
- [x] T017 [P] [US2] Integration test for scratch add without existing pad in tests/commands/scratch.test.ts — run `temporal scratch add "event" --in "3 days"` without creating pad first, assert exit 1, stderr contains "Run 'temporal scratch' first"
- [x] T018 [P] [US2] Integration test for scratch add duplicate name in tests/commands/scratch.test.ts — create pad, add event "deadline", add "deadline" again, assert exit 1, stderr contains "already exists"

### Implementation for User Story 2

- [x] T019 [US2] Implement scratchAdd handler in src/commands/scratch.ts — parse args with `parseCommandArgs` for `--in`, `--on`, `--at`, `--scratch` flags, resolve event date using existing `parseEventDate` logic from add.ts, call `loadScratchContext(label)`, check for duplicate event name, call `upsertEvent(context, event)` with type/notes as undefined, call `saveScratchContext(context, label)`, write to stdout

**Checkpoint**: Full create-then-add flow works. Events appear in correct sections with correct distances.

---

## Phase 5: User Story 3 - Show the Scratch Pad Layout (Priority: P1)

**Goal**: `temporal scratch show [--scratch <label>]` prints the scratch pad to stdout in ego-moving spatial format

**Independent Test**: Create a scratch pad with events in both past and future, run `temporal scratch show`, verify output has Behind/Ahead sections with correct sorting

**Depends on**: US1 (needs a created pad), US2 (needs events to show meaningful output)

### Tests for User Story 3

- [x] T020 [P] [US3] Integration test for scratch show with events in tests/commands/scratch.test.ts — create pad, add past and future events, run `temporal scratch show`, assert stdout contains Behind section with past event and Ahead section with future event in correct order
- [x] T021 [P] [US3] Integration test for scratch show empty pad in tests/commands/scratch.test.ts — create pad, run `temporal scratch show`, assert stdout contains NOW section but no event rows
- [x] T022 [P] [US3] Integration test for scratch show with --scratch flag in tests/commands/scratch.test.ts — create labeled pad, add event, run `temporal scratch show --scratch "test-label"`, verify output from correct labeled pad
- [x] T023 [P] [US3] Integration test for scratch show without existing pad in tests/commands/scratch.test.ts — run `temporal scratch show` without creating pad, assert exit 1, stderr contains error message

### Implementation for User Story 3

- [x] T024 [US3] Implement scratchShow handler in src/commands/scratch.ts — parse `--scratch` flag, call `loadScratchContext(label)`, call `renderTimeContext(context)`, write to stdout

**Checkpoint**: Full create → add → show flow works. LLM can read spatial layout for date reasoning.

---

## Phase 6: User Story 4 - Clear the Scratch Pad (Priority: P2)

**Goal**: `temporal scratch clear [--scratch <label>]` deletes the scratch file from `/tmp/`

**Independent Test**: Create a scratch pad, run `temporal scratch clear`, verify file is deleted

**Depends on**: US1 (needs a created pad to clear)

### Tests for User Story 4

- [x] T025 [P] [US4] Integration test for scratch clear existing pad in tests/commands/scratch.test.ts — create pad, run `temporal scratch clear`, assert exit 0, verify `/tmp/time-scratch.md` no longer exists
- [x] T026 [P] [US4] Integration test for scratch clear non-existing pad in tests/commands/scratch.test.ts — run `temporal scratch clear` without creating pad, assert exit 0, stderr contains "Nothing to clear"
- [x] T027 [P] [US4] Integration test for scratch clear with --scratch flag in tests/commands/scratch.test.ts — create labeled pad, run `temporal scratch clear --scratch "test-label"`, verify labeled file deleted

### Implementation for User Story 4

- [x] T028 [US4] Implement scratchClear handler in src/commands/scratch.ts — parse `--scratch` flag, compute file path via `scratchFilePath(label)`, check if file exists, if yes delete it and exit 0, if no emit warning to stderr and exit 0

**Checkpoint**: Full lifecycle works: create → add → show → clear. No residual files.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Init warning, edge cases, and end-to-end validation

- [x] T029 Add scratch file detection warning to temporal init in src/commands/init.ts — before creating time.md, check cwd for files matching `time-scratch*.md` using glob/readdir, if found emit warning to stderr per contract
- [x] T030 [P] Integration test for init warning in tests/commands/scratch.test.ts — create a scratch pad file in a temp dir, run `temporal init` in that dir, assert stderr contains warning about scratch pad files, assert time.md is still created successfully
- [x] T031 [P] Integration test for label sanitization edge cases in tests/commands/scratch.test.ts — test `temporal scratch "My Email!!"` creates `/tmp/time-scratch-my-email.md`, test `temporal scratch "////"` exits with error about no valid characters
- [x] T032 End-to-end workflow test in tests/commands/scratch.test.ts — run full quickstart flow: `scratch "project-email"` → `scratch add "deliverable" --in "14 days" --scratch "project-email"` → `scratch add "meeting" --in "15 days" --scratch "project-email"` → `scratch show --scratch "project-email"` (verify spatial layout shows deliverable before meeting) → `scratch clear --scratch "project-email"` (verify file gone), assert no project files modified
- [x] T033 Verify all existing tests still pass — run `bun test` and confirm no regressions in 001-time-cli functionality

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on T001 (scratch.ts lib) — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 completion — creates the pad other stories need
- **US2 (Phase 4)**: Depends on US1 (needs a pad to add events to)
- **US3 (Phase 5)**: Depends on US1 (needs a pad to show), benefits from US2 (events to display)
- **US4 (Phase 6)**: Depends on US1 (needs a pad to clear)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 2 — no dependencies on other stories
- **User Story 2 (P1)**: Functionally depends on US1 (needs a scratch pad to exist) but code can be written in parallel since they share the same file
- **User Story 3 (P1)**: Functionally depends on US1; benefits from US2 for meaningful test data
- **User Story 4 (P2)**: Functionally depends on US1; independent of US2/US3

### Within Each User Story

- Tests written first, verified to fail before implementation
- Implementation follows test expectations
- Story complete when all tests pass

### Parallel Opportunities

- T007 + T008 can run in parallel (different test subjects in same file)
- All test tasks within a story marked [P] can run in parallel
- T029 + T030 + T031 can run in parallel (different files/concerns)
- US2, US3, US4 implementation could proceed in parallel since they're in the same command file but handle independent subcommands

---

## Parallel Example: User Story 2

```bash
# Launch all tests for User Story 2 together:
Task: "Integration test for scratch add with --in in tests/commands/scratch.test.ts"
Task: "Integration test for scratch add with --on in tests/commands/scratch.test.ts"
Task: "Integration test for scratch add with --scratch flag in tests/commands/scratch.test.ts"
Task: "Integration test for scratch add without existing pad in tests/commands/scratch.test.ts"
Task: "Integration test for scratch add duplicate name in tests/commands/scratch.test.ts"

# Then implement:
Task: "Implement scratchAdd handler in src/commands/scratch.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T008)
3. Complete Phase 3: User Story 1 (T009-T013)
4. **STOP and VALIDATE**: `temporal scratch "test"` creates `/tmp/time-scratch-test.md` with correct NOW
5. Proceed to US2 for core value

### Incremental Delivery

1. Setup + Foundational → scratch infrastructure ready
2. US1 → `temporal scratch` works → pad creation validated
3. US2 → `temporal scratch add` works → events land in correct sections
4. US3 → `temporal scratch show` works → full spatial reasoning available (feature is usable!)
5. US4 → `temporal scratch clear` works → clean lifecycle complete
6. Polish → init warning, edge cases, regression check

### Recommended Execution Order

Since this is a single-developer feature with sequential dependencies:

```
T001 → T002 → T003 → T004 → T005 → T006 (setup, sequential)
T007 + T008 (foundational, parallel)
T009-T012 (US1 tests) → T013 (US1 impl)
T014-T018 (US2 tests) → T019 (US2 impl)
T020-T023 (US3 tests) → T024 (US3 impl)
T025-T027 (US4 tests) → T028 (US4 impl)
T029 + T030 + T031 (polish, parallel) → T032 → T033
```

---

## Notes

- [P] tasks = different files or independent test cases, no dependencies
- [Story] label maps task to specific user story for traceability
- All scratch pad tests must clean up `/tmp/time-scratch*.md` files after running
- Use unique labels per test to avoid test interference (e.g., `test-us1-create`, `test-us2-add`)
- Existing `withTempDir` helper works for project dir isolation; scratch files in `/tmp/` need explicit cleanup
- Commit after each phase or logical group
