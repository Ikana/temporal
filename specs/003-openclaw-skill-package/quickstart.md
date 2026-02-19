# Quickstart: OpenClaw Skill Package for temporal CLI

**Branch**: `003-openclaw-skill-package` | **Date**: 2026-02-18

## What gets built

1. **`time/SKILL.md`** — The OpenClaw skill document (under 200 lines)
2. **`scripts/build-release.sh`** — Cross-compiles and zips temporal for 5 platforms

## How to build release artifacts

```sh
# From repo root:
bash scripts/build-release.sh

# Output in dist/:
#   temporal-darwin-arm64.zip
#   temporal-darwin-x64.zip
#   temporal-linux-x64.zip
#   temporal-linux-arm64.zip
#   temporal-windows-x64.zip
```

## How to validate SKILL.md

```sh
# Check line count (must be under 200):
wc -l time/SKILL.md

# Verify frontmatter fields exist:
head -15 time/SKILL.md
```

## How to publish to ClawHub

Upload `time/SKILL.md` to ClawHub under slug `time`. Upload zip artifacts to GitHub Releases at github.com/Ikana/temporal.
