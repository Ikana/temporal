#!/bin/bash

set -euo pipefail

# Detect platform and download the right binary
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

case "$ARCH" in
  arm64|aarch64) ARCH="arm64" ;;
  x86_64) ARCH="x64" ;;
  *)
    echo "Unsupported architecture: $ARCH" >&2
    exit 1
    ;;
esac

URL="https://github.com/Ikana/temporal/releases/latest/download/temporal-${OS}-${ARCH}"
DEST="/usr/local/bin/temporal"

curl -fsSL "$URL" -o "$DEST"
chmod +x "$DEST"
echo "Installed temporal to $DEST"
