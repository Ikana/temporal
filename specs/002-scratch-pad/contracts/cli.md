# CLI Contract: `temporal scratch`

All scratch commands write valid markdown to stdout on success and error messages to stderr on failure. Exit code 0 = success, non-zero = failure. Scratch commands never read, write, or modify the project `time.md`.

## Commands

### `temporal scratch [label]`

Create a new scratch pad in `/tmp/`. If one already exists at the target path, it is replaced.

```
temporal scratch [label]
```

| Arg | Type | Default | Description |
|-----|------|---------|-------------|
| `[label]` | positional string | (none) | Optional context label. Sanitized to filename-safe slug. |

**stdout**: The generated scratch pad content (NOW section only, no events).
**stderr**: (none on success)
**exit 0**: Scratch pad created at `/tmp/time-scratch.md` or `/tmp/time-scratch-<label>.md`.
**exit 1**: `/tmp/` not writable, or label sanitizes to empty string.

**File path rules**:
- No label: `/tmp/time-scratch.md`
- With label: `/tmp/time-scratch-<sanitized-label>.md`

---

### `temporal scratch add <event>`

Add an event to the scratch pad. Exactly one of `--in`, `--on`, or `--at` is required.

```
temporal scratch add <event> (--in <duration> | --on <date> | --at <datetime>) [--scratch <label>]
```

| Arg | Type | Description |
|-----|------|-------------|
| `<event>` | positional string | Event name (must be unique within the pad) |
| `--in` | string | Relative duration: `"3 days"`, `"2 hours"`, `"in 5 days"`, `"3 days ago"` |
| `--on` | string | Date: `2026-02-20`, `"Feb 20 2026"`, `tomorrow`, `"next Monday"` |
| `--at` | string | Datetime: `2026-02-20T14:00:00` |
| `--scratch` | string | Optional label to target a labeled scratch pad |

**stdout**: Updated scratch pad content.
**exit 0**: Event added.
**exit 1**: No scratch pad found, duplicate name, or unparseable date/duration.

**Note**: Unlike `temporal add`, the `--type` and `--notes` flags are not accepted. Scratch pads are minimal.

---

### `temporal scratch show`

Print the scratch pad to stdout.

```
temporal scratch show [--scratch <label>]
```

| Arg | Type | Description |
|-----|------|-------------|
| `--scratch` | string | Optional label to target a labeled scratch pad |

**stdout**: Full scratch pad content.
**exit 0**: File read successfully.
**exit 1**: No scratch pad found at the target path.

---

### `temporal scratch clear`

Delete the scratch pad file.

```
temporal scratch clear [--scratch <label>]
```

| Arg | Type | Description |
|-----|------|-------------|
| `--scratch` | string | Optional label to target a labeled scratch pad |

**stdout**: (none)
**stderr**: Warning if no scratch pad exists at the target path.
**exit 0**: File deleted, or no file to delete (warning emitted).
**exit 1**: Filesystem error during deletion.

---

### `temporal init` (modification to existing command)

When `temporal init` runs, it MUST check the current working directory for files matching `time-scratch*.md`. If found, emit a warning to stderr:

```
Warning: Scratch pad files found in this directory. If you need an ephemeral
timeline, use 'temporal scratch' instead. 'temporal init' creates a persistent
project timeline.
```

The `init` command still proceeds normally after the warning.

---

## Global Behavior

- All scratch commands that read or write scratch pad files target `/tmp/time-scratch.md` (default) or `/tmp/time-scratch-<label>.md` (when `--scratch <label>` is provided).
- If the target scratch pad does not exist and the command is not `scratch` (create) or `scratch clear`, exit 1 with stderr message: `Error: No scratch pad found. Run 'temporal scratch' first.`
- All error messages go to stderr. All markdown output goes to stdout.
- No interactive prompts under any circumstances.
- Label sanitization: lowercase, replace non-alphanumeric with hyphens, collapse consecutive hyphens, trim leading/trailing hyphens.

## Error Messages

| Condition | stderr message | Exit |
|-----------|---------------|------|
| No scratch pad at target path (add/show) | `Error: No scratch pad found. Run 'temporal scratch' first.` | 1 |
| No scratch pad at target path (clear) | `Warning: No scratch pad found at <path>. Nothing to clear.` | 0 |
| Duplicate event name | `Error: Event '<name>' already exists in the scratch pad.` | 1 |
| Label sanitizes to empty | `Error: Label '<input>' contains no valid characters.` | 1 |
| `/tmp/` not writable | `Error: Cannot write to /tmp/. Check directory permissions.` | 1 |
| Missing date specifier | `Error: Exactly one of --in, --on, or --at is required.` | 1 |
| Unparseable date/duration | `Error: Cannot parse "<value>". Expected a date, duration, or ISO datetime.` | 1 |
