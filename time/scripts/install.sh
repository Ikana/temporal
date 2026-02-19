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

curl -fsSL "https://github.com/Ikana/temporal/releases/latest/download/temporal-${OS}-${ARCH}" \
  -o /usr/local/bin/temporal
chmod +x /usr/local/bin/temporal
