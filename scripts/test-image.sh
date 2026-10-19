#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# No network: browsers must already exist and the PHP server uses loopback only.
docker run --rm --init --ipc=host --network=none \
  --mount "type=bind,source=$ROOT/tests/smoke,target=/smoke,readonly" \
  --mount "type=bind,source=$ROOT/Dockerfile,target=/expected-Dockerfile,readonly" \
  --mount "type=bind,source=$ROOT/package.json,target=/expected-package.json,readonly" \
  "${IMAGE:-playwright-node-php:local}" node /smoke/check.cjs
