# Quickstart: Scratch Pad Mode

## Typical Session

```bash
# 1. Create a scratch pad for your drafting session
temporal scratch "project-email"

# 2. Add the dates you'll reference
temporal scratch add "deliverable handoff" --in "14 days" --scratch "project-email"
temporal scratch add "board meeting" --on 2026-03-05 --scratch "project-email"
temporal scratch add "project kickoff" --on 2026-02-10 --scratch "project-email"

# 3. Read the spatial layout — reason about date relationships
temporal scratch show --scratch "project-email"

# Output:
# # Time Context
#
# ## Now
# - **timestamp**: 2026-02-18T14:30:00.000Z
# - **weekday**: Tuesday
# - **week**: 8 of 52
# - **quarter**: Q1 2026
# - **timezone**: America/New_York
#
# ## Timeline
#
# ### Behind (Past)
#
# | distance | event | type | notes | iso |
# |----------|-------|------|-------|-----|
# | 8 days behind | project kickoff | | | 2026-02-10T14:30:00.000Z |
#
# ### Ahead (Future)
#
# | distance | event | type | notes | iso |
# |----------|-------|------|-------|-----|
# | 14 days ahead | deliverable handoff | | | 2026-03-04T14:30:00.000Z |
# | 15 days ahead | board meeting | | | 2026-03-05T14:30:00.000Z |

# Now you can see: deliverable is 14 days ahead, board meeting is 15 days ahead
# → delivery is the day before the board meeting

# 4. Draft your email using the spatial relationships...

# 5. Clean up when done
temporal scratch clear --scratch "project-email"
```

## Default (Unlabeled) Pad

```bash
# When you don't need a label
temporal scratch
temporal scratch add "deadline" --in "5 days"
temporal scratch show
temporal scratch clear
```

## Key Differences from `temporal init`

| | `temporal init` | `temporal scratch` |
|-|-----------------|-------------------|
| **File location** | `./time.md` (project dir) | `/tmp/time-scratch.md` |
| **Persistence** | Permanent project artifact | Ephemeral, single session |
| **Sequences** | Supported | Not available |
| **Spans** | Supported | Not available |
| **Event metadata** | `--type`, `--notes` | Not available |
| **Purpose** | Ongoing project timeline | One-shot date reasoning |
