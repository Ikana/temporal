# Quickstart: OpenClaw Skill Package for temporal CLI

**Branch**: `003-openclaw-skill-package` | **Date**: 2026-02-18

## What gets built

1. **`time/SKILL.md`** — The OpenClaw skill document (under 200 lines)
2. **`scripts/build-release.sh`** — Cross-compiles temporal for 4 platforms and generates checksums

## How to build release artifacts

```sh
# From repo root:
bash scripts/build-release.sh

# Output in dist/:
#   temporal-darwin-arm64
#   temporal-darwin-x64
#   temporal-linux-x64
#   temporal-linux-arm64
#   temporal-checksums.txt
```

## How to validate SKILL.md

```sh
# Check line count (must be under 200):
wc -l time/SKILL.md

# Verify frontmatter fields exist:
head -15 time/SKILL.md
```

## How to publish to ClawHub

Publish the skill folder directly:

```sh
npx clawhub publish /Users/roderik/time/time --version 0.1.0
```

Important: `--version` must be valid semver with no `v` prefix (use `0.1.0`, not `v0.1.0`).

Then push a Git tag (for example `v0.1.0`) to trigger the GitHub Actions release workflow that publishes binaries/checksums to github.com/Ikana/temporal.
