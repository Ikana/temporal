#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"

rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

TARGETS=(
  "bun-darwin-arm64|temporal-darwin-arm64"
  "bun-darwin-x64|temporal-darwin-x64"
  "bun-linux-x64|temporal-linux-x64"
  "bun-linux-arm64|temporal-linux-arm64"
)

for entry in "${TARGETS[@]}"; do
  IFS='|' read -r target outfile <<< "$entry"
  printf '[%s] Building %s...\n' "$target" "$outfile"
  bun build --compile --minify --target="$target" "$ROOT_DIR/src/index.ts" --outfile "$DIST_DIR/$outfile"
done

sha256sum "$DIST_DIR"/temporal-* > "$DIST_DIR/temporal-checksums.txt"
printf 'Build completed successfully. Artifacts in %s\n' "$DIST_DIR"
