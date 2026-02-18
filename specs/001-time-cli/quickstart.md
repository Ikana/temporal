# Quickstart: Temporal CLI

## Install

```bash
# From source (requires Bun)
bun install
bun run build

# Move binary to PATH
cp ./temporal /usr/local/bin/temporal
```

## Basic Usage

```bash
# 1. Initialize time context in your project
cd my-project
temporal init

# 2. Add some events
temporal add "v1.0 released" --on 2026-02-10 --type milestone
temporal add "sprint review" --in "2 days" --type meeting
temporal add "v1.1 deadline" --on 2026-03-01 --type milestone --notes "new auth flow"

# 3. View the timeline
temporal show

# 4. View only what's ahead
temporal ahead

# 5. Refresh distances (after time passes)
temporal refresh

# 6. Remove a cancelled event
temporal remove "sprint review"
```

## Using with an LLM Agent

The CLI is designed to be called by LLM agents as a subprocess:

```bash
# Agent reads current temporal context
temporal show

# Agent adds a deadline it discovered
temporal add "PR review due" --in "4 hours" --type deadline

# Agent refreshes and checks what's coming
temporal refresh && temporal ahead
```

All output is valid markdown on stdout. Errors go to stderr. Exit code 0 = success.

## Example `time.md` Output

After running `temporal init && temporal add "sprint review" --in "2 days" --type meeting`:

```markdown
# Time Context

## Now
- **timestamp**: 2026-02-17T21:30:00+01:00
- **weekday**: Monday
- **week**: 8 of 52
- **quarter**: Q1 2026
- **timezone**: Europe/Amsterdam

## Timeline

### Behind (Past)

| distance | event | type | notes | iso |
|----------|-------|------|-------|-----|

### Ahead (Future)

| distance | event | type | notes | iso |
|----------|-------|------|-------|-----|
| 2 days ahead | sprint review | meeting | | 2026-02-19T21:30:00+01:00 |
```

## Development

```bash
# Run from source
bun run src/index.ts init

# Run tests
bun test

# Build standalone binary
bun run build
```
