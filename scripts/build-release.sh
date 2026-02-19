#!/usr/bin/env bash
set -u

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"
TMP_DIR="$ROOT_DIR/.build-release-tmp"

rm -rf "$DIST_DIR" "$TMP_DIR"
mkdir -p "$DIST_DIR" "$TMP_DIR"

TARGETS=(
  "bun-darwin-arm64|darwin-arm64|temporal"
  "bun-darwin-x64|darwin-x64|temporal"
  "bun-linux-x64|linux-x64|temporal"
  "bun-linux-arm64|linux-arm64|temporal"
  "bun-windows-x64|windows-x64|temporal.exe"
)

failures=0

for entry in "${TARGETS[@]}"; do
  IFS='|' read -r target label binary <<< "$entry"
  out_dir="$TMP_DIR/$label"
  out_bin="$out_dir/$binary"
  out_zip="$DIST_DIR/temporal-$label.zip"

  mkdir -p "$out_dir"
  printf '[%s] Building...\n' "$target"

  if bun build --compile --minify --target="$target" "$ROOT_DIR/src/index.ts" --outfile "$out_bin"; then
    if (cd "$out_dir" && zip -q "$out_zip" "$binary"); then
      printf '[%s] OK -> %s\n' "$target" "$out_zip"
    else
      printf '[%s] FAIL (zip)\n' "$target" >&2
      failures=$((failures + 1))
    fi
  else
    printf '[%s] FAIL (build)\n' "$target" >&2
    failures=$((failures + 1))
  fi

done

rm -rf "$TMP_DIR"

if [ "$failures" -gt 0 ]; then
  printf 'Build completed with %d failure(s).\n' "$failures" >&2
  exit 1
fi

printf 'Build completed successfully. Artifacts in %s\n' "$DIST_DIR"
