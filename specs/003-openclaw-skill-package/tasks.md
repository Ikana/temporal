# Tasks: OpenClaw Skill Package for temporal CLI

**Input**: Design documents from `/specs/003-openclaw-skill-package/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, quickstart.md

**Tests**: No test tasks — not requested in the feature specification. Validation is manual (line count, build output).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create directories and empty files

- [X] T001 Create `time/` directory and empty `time/SKILL.md` file
- [X] T002 Create `scripts/` directory and empty `scripts/build-release.sh` file

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: SKILL.md frontmatter and structural skeleton — needed before any user story content can be added

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Write YAML frontmatter in `time/SKILL.md` with name (`time`), slug (`time`), description (LLM temporal reasoning scaffold), and when_to_use fields per FR-002
- [X] T004 Write the intro paragraph, ego-moving metaphor section, and prerequisites section in `time/SKILL.md` — link to github.com/Ikana/temporal, include correct/incorrect ego-moving examples per FR-004, FR-005

**Checkpoint**: SKILL.md has frontmatter + intro skeleton. User story content can now be added.

---

## Phase 3: User Story 1 — Agent discovers and uses temporal for date reasoning (Priority: P1) 🎯 MVP

**Goal**: An agent reading SKILL.md can successfully run init, add events, and show the timeline on the first attempt

**Independent Test**: Run `temporal` commands exactly as documented in SKILL.md and verify correct output

### Implementation for User Story 1

- [X] T005 [US1] Write Quick Start section in `time/SKILL.md` showing init → add → show workflow
- [X] T006 [US1] Write Commands section in `time/SKILL.md` documenting `init` (with --timezone, --force), `now`, `add` (with --in, --on, --at, --type, --notes), `show`, `past`, `ahead`, `refresh`, `remove` per FR-003
- [X] T007 [US1] Write the annotated `time.md` format example section in `time/SKILL.md` showing Now anchor, Behind/Ahead tables, Sequences, and Durations per FR-007
- [X] T008 [US1] Write Key Rules section in `time/SKILL.md` covering stdout/stderr contract (FR-009), non-interactive (FR-010), refresh-before-read (FR-008), unique event names

**Checkpoint**: SKILL.md is a complete, standalone skill document for core temporal usage. An agent can discover temporal, learn all commands, and understand the output format. Validate: `wc -l time/SKILL.md` < 200 (FR-011).

---

## Phase 4: User Story 2 — Agent uses scratch pad pattern for one-shot reasoning (Priority: P2)

**Goal**: SKILL.md documents the /tmp scratch pad workflow for transient date reasoning during drafting

**Independent Test**: Follow the scratch pad steps in SKILL.md — init in /tmp, add dates, show, draft, rm time.md — and verify no files remain

### Implementation for User Story 2

- [X] T009 [US2] Write Scratch Pad Pattern section in `time/SKILL.md` with the /tmp workflow (init --force, add dates, show, draft, rm time.md) per FR-006

**Checkpoint**: SKILL.md now covers transient usage. Validate: `wc -l time/SKILL.md` still < 200.

---

## Phase 5: User Story 3 — Agent uses sequences and spans for project planning (Priority: P3)

**Goal**: SKILL.md documents seq and span commands for richer temporal reasoning

**Independent Test**: Follow SKILL.md to create a sequence and a span, verify output matches documented format

### Implementation for User Story 3

- [X] T010 [US3] Write Sequences section in `time/SKILL.md` documenting `temporal seq` with example output showing [NOW] positioning per FR-003
- [X] T011 [US3] Write Spans section in `time/SKILL.md` documenting `temporal span` with --from/--to and example duration output per FR-003

**Checkpoint**: SKILL.md covers all 10 commands. Validate: `wc -l time/SKILL.md` still < 200 (FR-011). Validate: all commands from FR-003 present (init, now, add, show, past, ahead, refresh, seq, span, remove).

---

## Phase 6: Build Script (Cross-Cutting)

**Purpose**: Cross-compile temporal for 5 platforms and package as zips for GitHub Releases

- [X] T012 Write `scripts/build-release.sh` — clean and recreate `dist/`, loop over 5 bun targets (bun-darwin-arm64, bun-darwin-x64, bun-linux-x64, bun-linux-arm64, bun-windows-x64), cross-compile with `bun build --compile --minify --target=<target> src/index.ts --outfile <binary>`, zip each binary into `dist/temporal-<os>-<arch>.zip`, report success/failure per target
- [X] T013 Run `bash scripts/build-release.sh` and verify 5 zips are produced in `dist/` with correct names

**Checkpoint**: `dist/` contains temporal-darwin-arm64.zip, temporal-darwin-x64.zip, temporal-linux-x64.zip, temporal-linux-arm64.zip, temporal-windows-x64.zip.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across all deliverables

- [X] T014 Validate SKILL.md line count is under 200 lines (FR-011)
- [X] T015 Validate SKILL.md contains all 10 commands from FR-003 (init, now, add, show, past, ahead, refresh, seq, span, remove)
- [X] T016 Validate ego-moving language throughout SKILL.md — no instances of time-moving phrasing (FR-005, Constitution II)
- [X] T017 Run quickstart.md validation steps: `wc -l time/SKILL.md`, `head -15 time/SKILL.md`, `bash scripts/build-release.sh`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001, T002)
- **User Story 1 (Phase 3)**: Depends on Foundational (T003, T004)
- **User Story 2 (Phase 4)**: Depends on US1 completion (content ordering in the file)
- **User Story 3 (Phase 5)**: Depends on US2 completion (content ordering in the file)
- **Build Script (Phase 6)**: Depends on Setup (T002) only — can run in parallel with SKILL.md phases
- **Polish (Phase 7)**: Depends on all previous phases

### Parallel Opportunities

- T001 and T002 can run in parallel (different directories)
- T003 and T004 are sequential (same file, ordered sections)
- Phase 6 (build script) can run in parallel with Phases 3–5 (SKILL.md content) since they are different files
- T014, T015, T016 can run in parallel (read-only validation)

---

## Parallel Example: Build Script + SKILL.md

```bash
# These can run simultaneously since they touch different files:
# Agent A: SKILL.md content (Phases 3-5)
Task: "Write Commands section in time/SKILL.md"

# Agent B: Build script (Phase 6)
Task: "Write scripts/build-release.sh"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001, T002)
2. Complete Phase 2: Foundational (T003, T004)
3. Complete Phase 3: User Story 1 (T005–T008)
4. **STOP and VALIDATE**: SKILL.md under 200 lines, all core commands documented, ego-moving language correct
5. Deliverable: A functional skill document that covers the primary use case

### Incremental Delivery

1. Setup + Foundational → SKILL.md skeleton ready
2. Add User Story 1 → Core command reference complete (MVP!)
3. Add User Story 2 → Scratch pad pattern added
4. Add User Story 3 → Sequences and spans added, all 10 commands covered
5. Add Build Script → Release packaging ready
6. Polish → Final validation

---

## Notes

- All SKILL.md tasks are sequential within their phase (same file, ordered sections)
- The build script (Phase 6) is independent and can be developed in parallel
- Line count constraint (< 200) must be validated after each phase that adds SKILL.md content
- No test tasks generated — validation is manual per quickstart.md
