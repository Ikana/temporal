# Data Model: Temporal CLI

## Entities

### TimeContext

The root entity representing the entire `time.md` file contents.

| Field | Type | Description |
|-------|------|-------------|
| now | Now | The temporal origin point |
| behindEvents | Event[] | Past events, sorted furthest-first |
| aheadEvents | Event[] | Future events, sorted soonest-first |
| sequences | Sequence[] | Named event chains |
| spans | Span[] | Named duration periods |

### Now

The spatial origin. All other entities are positioned relative to this.

| Field | Type | Description |
|-------|------|-------------|
| timestamp | string (ISO 8601) | Absolute time, e.g. `2026-02-17T21:30:00+01:00` |
| weekday | string | Day name, e.g. `Monday` |
| week | string | Week of year, e.g. `8 of 52` |
| quarter | string | Quarter, e.g. `Q1 2026` |
| timezone | string (IANA) | Timezone, e.g. `Europe/Amsterdam` |

### Event

A named point on the timeline.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Unique identifier, e.g. `sprint review` |
| iso | string (ISO 8601) | yes | Absolute timestamp |
| distance | string | yes (computed) | Human-readable distance from NOW, e.g. `3 days ahead` |
| type | string | no | Category label, e.g. `milestone`, `meeting`, `deadline` |
| notes | string | no | Freeform annotation |

**Identity**: Events are uniquely identified by `name` (case-insensitive match). Duplicate names are rejected.

**State transitions**: Events do not have states. They move between the Behind and Ahead sections when `temporal refresh` recalculates and their position relative to NOW has changed.

### Sequence

A named ordered chain of events with [NOW] as a spatial landmark.

| Field | Type | Description |
|-------|------|-------------|
| name | string | Unique identifier, e.g. `release-cycle` |
| events | string[] | Ordered list of event names |

**Rendering**: When rendered to markdown, [NOW] is inserted between the last past event and the first future event in the chain. If all events are past, [NOW] appears at the end. If all are future, [NOW] appears at the start.

### Span

A named duration occupying a stretch of the timeline.

| Field | Type | Description |
|-------|------|-------------|
| name | string | Unique identifier, e.g. `current sprint` |
| from | string (ISO 8601) | Start timestamp |
| to | string (ISO 8601) | End timestamp |
| fromDistance | string | Computed distance of start from NOW |
| toDistance | string | Computed distance of end from NOW |
| length | string | Human-readable total duration, e.g. `7 days` |

## Relationships

```
TimeContext
├── has one Now
├── has many Event (split into behind/ahead by position relative to Now)
├── has many Sequence (each references Events by name)
└── has many Span (independent of Events)
```

## File Format Mapping

The data model maps directly to sections of `time.md`:

| Entity | Markdown Section | Format |
|--------|-----------------|--------|
| Now | `## Now` | Bullet list of key-value pairs |
| Event (past) | `### Behind (Past)` | Table: distance, event, type, notes, iso |
| Event (future) | `### Ahead (Future)` | Table: distance, event, type, notes, iso |
| Sequence | `### <name>` under `## Sequences` | Arrow chain: `event1 → event2 → [NOW] → event3` |
| Span | `## Durations` | Table: span, from, to, length |

## Validation Rules

- Event names MUST be unique (case-insensitive).
- Event ISO timestamps MUST be valid ISO 8601.
- Sequence event references SHOULD match existing event names (warn if not).
- Span `from` MUST be temporally before `to`.
- All distances are recomputed on `temporal refresh` — they are derived, not stored as source of truth.

## Scale Assumptions

- Typical usage: 5-50 events per project.
- Upper bound tested: 100+ events (per SC-005).
- File size at 100 events: ~5KB markdown — trivially small.
