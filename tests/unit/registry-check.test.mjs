import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

// Supply deterministic registry responses at the Docker CLI boundary.
// A network/auth error must never be mistaken for permission to overwrite a tag.
function check(response, exitCode) {
  const directory = mkdtempSync(join(tmpdir(), 'registry-check-'));
  try {
    writeFileSync(join(directory, 'docker'), '#!/bin/sh\nprintf "%s\\n" "$REGISTRY_RESPONSE" >&2\nexit "$REGISTRY_EXIT"\n', { mode: 0o755 });
    return spawnSync('bash', [fileURLToPath(new URL('../../scripts/assert-tag-available.sh', import.meta.url)), 'ghcr.io/example/image:v1.64.1'], {
      encoding: 'utf8',
      env: { ...process.env, PATH: `${directory}:${process.env.PATH}`, REGISTRY_RESPONSE: response, REGISTRY_EXIT: String(exitCode) },
    });
  } finally { rmSync(directory, { recursive: true }); }
}

test('existing manifests cannot be overwritten', () => {
  const result = check('existing image', 0);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Refusing to overwrite/);
});

test('an explicitly absent manifest permits a new release', () => {
  assert.equal(check('ERROR: ghcr.io/example/image:v1.64.1: not found', 1).status, 0);
  assert.equal(check('ERROR: manifest unknown', 1).status, 0);
});

test('network and authorization errors fail closed', () => {
  for (const response of ['ERROR: unauthorized', 'ERROR: denied', 'ERROR: dial tcp: lookup ghcr.io: no such host', 'ERROR: timeout']) {
    const result = check(response, 1);
    assert.equal(result.status, 1);
    assert.ok(result.stderr.includes(response));
  }
});
