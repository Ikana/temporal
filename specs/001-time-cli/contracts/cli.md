# CLI Contract: `temporal`

All commands write valid markdown to stdout on success and error messages to stderr on failure. Exit code 0 = success, non-zero = failure.

## Commands

### `temporal init`

Initialize a new `time.md` in the current directory.

```
temporal init [--timezone <iana_tz>] [--force]
```

| Arg | Type | Default | Description |
|-----|------|---------|-------------|
| `--timezone` | string | auto-detected | IANA timezone, e.g. `America/New_York` |
| `--force` | boolean | false | Overwrite existing `time.md` |

**stdout**: The generated `time.md` content.
**stderr**: Warning if file exists (without `--force`).
**exit 0**: File created successfully.
**exit 1**: File exists and `--force` not set, or write failure.

---

### `temporal add <event>`

Add an event to the timeline. Exactly one of `--in`, `--on`, or `--at` is required.

```
temporal add <event> (--in <duration> | --on <date> | --at <datetime>) [--type <type>] [--notes <text>]
```

| Arg | Type | Description |
|-----|------|-------------|
| `<event>` | positional string | Event name (must be unique) |
| `--in` | string | Relative duration: `"3 days"`, `"2 hours"`, `"in 5 days"`, `"3 days ago"` |
| `--on` | string | Date: `2026-02-20`, `"Feb 20 2026"`, `tomorrow`, `"next Monday"` |
| `--at` | string | Datetime: `2026-02-20T14:00:00` |
| `--type` | string | Optional category: `milestone`, `meeting`, `deadline`, etc. |
| `--notes` | string | Optional freeform annotation |

**stdout**: Updated `time.md` content.
**exit 0**: Event added.
**exit 1**: No `time.md` found, duplicate name, or unparseable date/duration.

---

### `temporal now`

Update the NOW section with the current timestamp. Does not recalculate event distances.

```
temporal now [--timezone <iana_tz>]
```

**stdout**: Updated `time.md` content.
**exit 0**: NOW updated.
**exit 1**: No `time.md` found.

---

### `temporal refresh`

Recalculate all distances from current time. Update NOW. Move events between Behind/Ahead if they crossed the NOW boundary. Reposition [NOW] in sequences.

```
temporal refresh
```

**stdout**: Updated `time.md` content.
**exit 0**: All distances recalculated.
**exit 1**: No `time.md` found or parse error.

---

### `temporal show`

Print the full `time.md` to stdout. Equivalent to `cat time.md` but validates the file first.

```
temporal show
```

**stdout**: Full `time.md` content.
**exit 0**: File read successfully.
**exit 1**: No `time.md` found.

---

### `temporal past`

Print only the NOW section and Behind (Past) events.

```
temporal past
```

**stdout**: NOW section + Behind table.
**exit 0**: Success.
**exit 1**: No `time.md` found.

---

### `temporal ahead`

Print only the NOW section and Ahead (Future) events.

```
temporal ahead
```

**stdout**: NOW section + Ahead table.
**exit 0**: Success.
**exit 1**: No `time.md` found.

---

### `temporal remove <event>`

Remove an event by name. Also removes it from any sequences.

```
temporal remove <event>
```

| Arg | Type | Description |
|-----|------|-------------|
| `<event>` | positional string | Event name to remove |

**stdout**: Updated `time.md` content.
**stderr**: Error if event not found (lists available events).
**exit 0**: Event removed.
**exit 1**: No `time.md` found or event not found.

---

### `temporal seq <name> <events...>`

Create or update a named sequence. Events are ordered as given. [NOW] is auto-inserted.

```
temporal seq <name> <event1> <event2> [<event3> ...]
```

| Arg | Type | Description |
|-----|------|-------------|
| `<name>` | positional string | Sequence name, e.g. `release-cycle` |
| `<events...>` | positional strings | Ordered event names |

**stdout**: Updated `time.md` content.
**stderr**: Warning for event names not found in timeline (sequence still created).
**exit 0**: Sequence created/updated.
**exit 1**: No `time.md` found or fewer than 2 events specified.

---

### `temporal span <name>`

Create or update a named duration span.

```
temporal span <name> --from <when> --to <when>
```

| Arg | Type | Description |
|-----|------|-------------|
| `<name>` | positional string | Span name, e.g. `current sprint` |
| `--from` | string | Start: duration, date, or relative expression |
| `--to` | string | End: duration, date, or relative expression |

**stdout**: Updated `time.md` content.
**exit 0**: Span created/updated.
**exit 1**: No `time.md` found, missing args, or `from` is after `to`.

---

## Global Behavior

- All commands that modify `time.md` also print the updated file to stdout.
- If `time.md` does not exist and the command is not `init`, exit 1 with stderr message: `Error: time.md not found. Run 'temporal init' first.`
- All error messages go to stderr. All markdown output goes to stdout.
- No interactive prompts under any circumstances.
