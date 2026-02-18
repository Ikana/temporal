# Time CLI — LLM-Friendly Temporal Reasoning Tool

## Problem

LLMs are bad at time. They lack persistent temporal context — no sense of "now," no feel for duration, and no spatial scaffold for ordering events. Humans solve temporal reasoning by mapping time onto space (Gentner, 2001). LLMs need the same scaffold made explicit.

## Theoretical Foundation

Based on Dedre Gentner's "Spatial Metaphors in Temporal Reasoning" (MIT Press, 2001), humans use two coherent spatial systems to reason about time:

### Ego-Moving Metaphor
The observer moves forward along a timeline toward the future. Future is "ahead," past is "behind." This is a two-point relation (observer ↔ event) and is cognitively easier to process.

```
PAST ○ ○ ○ ○ 🧍 ○ ○ ○ ○ FUTURE
              →
```

Examples: "We are approaching the deadline." "I'm looking forward to it."

### Time-Moving Metaphor
The observer is stationary and time flows past them from future to past, like a river. This is a three-point relation (event1 ↔ observer ↔ event2) and is harder to process.

```
PAST ◇ ◇ ◇ ◇ ◇ ◇ ◇ ◇ ◇ FUTURE
              ←
            🧍 (stationary)
```

Examples: "The deadline is approaching." "The holidays are coming."

### Key Findings Relevant to This Tool

1. **Consistency matters**: Mixing the two metaphor systems causes processing slowdowns. The `time.md` format must pick ONE consistent spatial system.
2. **Ego-moving is easier**: Fewer conceptual points needed, faster processing. We adopt the ego-moving perspective as default.
3. **Spatial ordering is the primitive**: Time is reasoned about via ordered position on a one-dimensional line. The format should make this linear ordering explicit.
4. **Relational, not attributive**: Space-time metaphors derive meaning from relative position (before/after/ahead/behind), not from properties of events themselves. The format must emphasize relations between events.
5. **Front/back orientation maps to future/past**: Using directional spatial terms (ahead, behind, before, after) is not decoration — it is how the reasoning actually works.

## What This CLI Does

The `time` CLI creates and manages a `time.md` file in the current project directory. This file gives an LLM a spatial-temporal scaffold: a snapshot of "now," an ordered timeline of relevant events, and relational context — all in a format designed to be unambiguous for token-based reasoning.

## The `time.md` Format

The file uses the ego-moving metaphor throughout. The observer ("you") is always at NOW, facing the future. Events behind you are past. Events ahead are future. All temporal relations are expressed as spatial distance from NOW.

```markdown
# Time Context

## Now
<!-- The anchor point. All other events are positioned relative to this. -->
- **timestamp**: 2026-02-17T21:30:00Z
- **weekday**: Monday
- **week**: 8 of 52
- **quarter**: Q1 2026
- **timezone**: Europe/Amsterdam

## Timeline
<!-- Events ordered spatially: furthest past first, furthest future last. -->
<!-- Distance from NOW expressed in human-readable units. -->

### Behind (Past)
| distance | event | type | notes |
|----------|-------|------|-------|
| 3 days behind | v0.2.0 released | milestone | deployed to prod |
| 1 day behind | bug #42 reported | issue | auth timeout |
| 2 hours behind | fix pushed to main | commit | resolved #42 |

### Ahead (Future)
| distance | event | type | notes |
|----------|-------|------|-------|
| 4 hours ahead | standup meeting | meeting | daily sync |
| 2 days ahead | sprint review | ceremony | demo v0.2.1 |
| 13 days ahead | v0.3.0 deadline | milestone | new auth flow |

## Sequences
<!-- Explicit ordering of related events. Each sequence is a spatial chain. -->

### release-cycle
v0.2.0 released → bug #42 reported → fix pushed → [NOW] → sprint review → v0.3.0 deadline

### auth-rework
RFC drafted → [NOW] → implementation starts (3 days ahead) → testing (8 days ahead) → v0.3.0 deadline (13 days ahead)

## Durations
<!-- How "long" things are in spatial terms — how much of the timeline they occupy. -->
| span | from | to | length |
|------|------|----|--------|
| current sprint | 5 days behind | 2 days ahead | 7 days |
| Q1 2026 | 48 days behind | 41 days ahead | 89 days |
```

## CLI Commands

```
time init                     # Create time.md with current NOW anchor
time now                      # Update the NOW section with current timestamp
time add <event> --at <when>  # Add an event to the timeline
time add <event> --in <duration>  # Add event relative to now ("3 days", "2 hours")
time add <event> --on <date>  # Add event on a specific date
time seq <name> <events...>   # Create or update a named sequence
time span <name> --from <x> --to <y>  # Define a duration/span
time show                     # Print the current time.md to stdout
time refresh                  # Recalculate all distances from current NOW
time remove <event>           # Remove an event from the timeline
time past                     # Show only events behind NOW
time ahead                    # Show only events ahead of NOW
```

## Architecture

- **Language**: TypeScript (Bun runtime)
- **Distribution**: Single binary via `bun build --compile`
- **Storage**: Single `time.md` file per project directory
- **No dependencies beyond Bun**: date math is handled with native `Temporal` API or simple offset arithmetic
- **Output**: Always valid markdown, always readable by both humans and LLMs

## Design Principles

1. **One metaphor, consistently**: Always ego-moving. Never mix systems. The LLM (and human) should never have to switch spatial frames mid-document.
2. **NOW is the origin**: Every temporal fact is a signed distance from NOW. No orphaned dates without spatial context.
3. **Linear ordering is king**: Events are always sorted by position on the timeline. No grouping by category that would break the spatial sequence.
4. **Relations over absolutes**: "3 days behind" is more useful than "2026-02-14" because it gives the LLM spatial position, not just a label. (Absolute dates are kept as metadata.)
5. **Sequences make causality spatial**: By laying out related events as a chain with [NOW] as a landmark, the LLM can "see" where it is in a process.
6. **Refresh is cheap**: Running `time refresh` recalculates all distances from current NOW. The file is always fresh when read.
7. **Flat file, no server**: A `.md` file is the most LLM-native format. No API, no database, no state beyond the file itself.
