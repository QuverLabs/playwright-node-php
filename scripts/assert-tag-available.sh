#!/usr/bin/env bash
set -euo pipefail
IMAGE_REF="${1:?Pass the image:tag to check}"
ERROR_FILE="$(mktemp)"
trap 'rm -f "$ERROR_FILE"' EXIT
if docker buildx imagetools inspect "$IMAGE_REF" > /dev/null 2> "$ERROR_FILE"; then
  echo "Refusing to overwrite existing image: $IMAGE_REF" >&2
  exit 1
fi
# Fail closed on network/authentication errors; only an absent manifest is OK.
if ! grep -Eq 'manifest unknown|no such manifest|: not found$' "$ERROR_FILE"; then
  cat "$ERROR_FILE" >&2
  exit 1
fi
