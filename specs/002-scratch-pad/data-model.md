# Data Model: Scratch Pad Mode

**Branch**: `002-scratch-pad` | **Date**: 2026-02-18

## Overview

The scratch pad introduces no new entity types. It reuses the existing `TimeContext` model with the constraint that `sequences` and `spans` are always empty arrays. The only new concept is the **scratch file path**, which is derived from an optional label.

## Entities

### TimeContext (existing — no changes)

The scratch pad is a `TimeContext` instance persisted to a different file path.

```
TimeContext
├── now: Now                    # Temporal origin point
├── behindEvents: Event[]       # Past events, sorted furthest-first
├── aheadEvents: Event[]        # Future events, sorted soonest-first
├── sequences: Sequence[]       # ALWAYS [] for scratch pads
└── spans: Span[]               # ALWAYS [] for scratch pads
```

### Now (existing — no changes)

```
Now
├── timestamp: string           # ISO 8601 (e.g., "2026-02-18T14:30:00.000Z")
├── weekday: string             # "Tuesday"
├── week: string                # "8 of 52"
├── quarter: string             # "Q1 2026"
└── timezone: string            # IANA (e.g., "America/New_York")
```

### Event (existing — subset used)

Scratch pad events use only the core fields. `type` and `notes` are always `undefined`.

```
Event (scratch subset)
├── distance: string            # "14 days ahead" or "3 days behind"
├── name: string                # User-supplied, unique within the pad
├── type: undefined             # Not used in scratch pads
├── notes: undefined            # Not used in scratch pads
└── iso: string                 # ISO 8601 absolute timestamp
```

**Uniqueness rule**: Event names are unique within a single scratch pad (case-insensitive comparison, matching main timeline behavior).

### Scratch File Path (new concept — not a type)

The file path is computed, not stored:

```
scratchFilePath(label?: string): string
├── No label:  "/tmp/time-scratch.md"
└── With label: "/tmp/time-scratch-<sanitized-label>.md"
```

**Label sanitization rules**:
1. Lowercase the input
2. Replace non-alphanumeric characters with hyphens
3. Collapse consecutive hyphens to a single hyphen
4. Trim leading/trailing hyphens
5. If result is empty, error

## Lifecycle

Scratch pads have a trivial lifecycle — no state transitions, no migrations:

```
[not exists] --scratch--> [created with NOW] --scratch add--> [has events] --scratch clear--> [not exists]
                                  ^                                |
                                  |--- scratch (same label) -------|  (replaces)
```

- **Create**: `temporal scratch [label]` → writes fresh `TimeContext` with current NOW and empty event arrays
- **Mutate**: `temporal scratch add` → reads, adds event via `upsertEvent`, writes back
- **Read**: `temporal scratch show` → reads and renders to stdout
- **Delete**: `temporal scratch clear` → removes file from filesystem

## File Format

The scratch pad file is valid `time.md` format — identical markdown structure, parseable by `parseTimeContext`. The only difference is:
- No `## Sequences` section (empty array → omitted by renderer)
- No `## Durations` section (empty array → omitted by renderer)
- Event tables have empty `type` and `notes` columns

Example scratch pad content:

```markdown
# Time Context

## Now
- **timestamp**: 2026-02-18T14:30:00.000Z
- **weekday**: Tuesday
- **week**: 8 of 52
- **quarter**: Q1 2026
- **timezone**: America/New_York

## Timeline

### Behind (Past)

| distance | event | type | notes | iso |
|----------|-------|------|-------|-----|
| 8 days behind | kickoff | | | 2026-02-10T09:00:00.000Z |

### Ahead (Future)

| distance | event | type | notes | iso |
|----------|-------|------|-------|-----|
| 14 days ahead | deliverable | | | 2026-03-04T14:30:00.000Z |
| 15 days ahead | board meeting | | | 2026-03-05T14:30:00.000Z |
```

## Relationship to Existing Model

```
Existing time.md (001-time-cli)          Scratch pad (002-scratch-pad)
─────────────────────────────────        ──────────────────────────────
File: ./time.md (project dir)           File: /tmp/time-scratch[-label].md
Now: ✓                                   Now: ✓ (identical)
Behind Events: ✓                         Behind Events: ✓ (identical)
Ahead Events: ✓                          Ahead Events: ✓ (no type/notes)
Sequences: ✓                             Sequences: ✗ (always empty)
Spans: ✓                                 Spans: ✗ (always empty)
--type flag: ✓                           --type flag: ✗ (not accepted)
--notes flag: ✓                          --notes flag: ✗ (not accepted)
Persistent: ✓                           Ephemeral: ✓ (in /tmp/)
```
