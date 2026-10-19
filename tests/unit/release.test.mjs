import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateTag, validateReports, releaseNotes } from '../../scripts/release.mjs';

const digest = `sha256:${'a'.repeat(64)}`;
const report = (architecture) => ({
  architecture, playwright: '1.64.1', node: '26.12.0', npm: '11.9.0',
  php: '8.5.11', os: 'Debian GNU/Linux 13 (trixie)',
  browsers: { chromium: '145.0', firefox: '147.0', webkit: '26.0' },
  phpExtensions: ['Core', 'json'], digest,
});

test('accepts a first release and revisions starting at two', () => {
  for (const tag of ['v1.64.1', 'v1.64.1-r2', 'v1.64.1-r10']) {
    assert.equal(validateTag(tag, '1.64.1'), tag);
  }
});

test('rejects mismatched Playwright versions and ambiguous release names', () => {
  for (const tag of ['v1.64.2', '1.64.1', 'v1.64.1-r1', 'v1.64.1-r0',
    'v1.64.1-r02', 'v01.64.1', 'v1.64.1-beta', 'v1.64.1\n']) {
    assert.throws(() => validateTag(tag, '1.64.1'));
  }
});

test('requires one tested report for each architecture', () => {
  const reports = [report('amd64'), report('arm64')];
  assert.doesNotThrow(() => validateReports(reports, '1.64.1'));
  assert.throws(() => validateReports(reports.slice(0, 1), '1.64.1'));
  assert.throws(() => validateReports([reports[0], reports[0]], '1.64.1'));
  assert.throws(() => validateReports(reports, '1.65.0'));
  assert.throws(() => validateReports([reports[0], { ...reports[1], node: '24.0.0' }], '1.64.1'));
  assert.throws(() => validateReports([reports[0], { ...reports[1], digest: '' }], '1.64.1'));
  assert.throws(() => validateReports([reports[0], { ...reports[1], browsers: {} }], '1.64.1'));
});

test('release notes use observed versions, both platforms and immutable references', () => {
  const notes = releaseNotes('v1.64.1-r2', 'ghcr.io/example/image', digest,
    [report('amd64'), { ...report('arm64'), browsers: { chromium: '145.1', firefox: '147.0', webkit: '26.0' } }], '1.64.1');
  for (const value of ['v1.64.1-r2', '26.12.0', '11.9.0', '8.5.11', 'Debian GNU/Linux 13',
    'linux/amd64', 'linux/arm64', '145.1', `ghcr.io/example/image@${digest}`, 'Core, json']) {
    assert.ok(notes.includes(value), `Missing ${value}`);
  }
});
