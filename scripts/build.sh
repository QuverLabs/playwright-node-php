#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
docker buildx build --load --pull --provenance=false \
  --tag "${IMAGE:-playwright-node-php:local}" \
  --build-arg "IMAGE_VERSION=${IMAGE_VERSION:-development}" \
  --build-arg "SOURCE_REVISION=${SOURCE_REVISION:-unknown}" \
  "$@" "$ROOT"
