import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
const extract = (text, pattern, description) => {
  const match = text.match(pattern);
  assert.ok(match, `Could not find ${description}`);
  return match[1];
};

test('documented and CI component versions match the source pins', () => {
  const dockerfile = read('Dockerfile');
  const readme = read('README.md');
  const pkg = JSON.parse(read('package.json'));
  const lock = JSON.parse(read('package-lock.json'));
  const node = extract(dockerfile, /^FROM node:(\d+\.\d+\.\d+)-/m, 'Node image version');
  const php = extract(dockerfile, /^FROM php:(\d+\.\d+\.\d+)-/m, 'PHP image version');
  const playwright = pkg.dependencies['playwright-core'];
  assert.match(playwright, /^\d+\.\d+\.\d+$/, 'Playwright must be pinned to an exact version');

  for (const path of ['.github/workflows/build.yml', '.github/workflows/release.yml']) {
    const versions = [...read(path).matchAll(/^\s*node-version:\s*([^\s#]+)\s*(?:#.*)?$/gm)];
    assert.ok(versions.length, `No pinned Node versions found in ${path}`);
    for (const [, version] of versions) {
      assert.equal(version.replace(/^['"]|['"]$/g, ''), node, `${path} must use Node ${node}`);
    }
  }

  for (const [component, expected] of [['Node.js', node], ['PHP CLI', php], ['Playwright', playwright]]) {
    const escaped = component.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const actual = extract(readme, new RegExp(`^\\| ${escaped} \\| (\\d+\\.\\d+\\.\\d+)`, 'm'), `${component} README version`);
    assert.equal(actual, expected, `README ${component} must match its source pin`);
  }
  assert.equal(lock.packages[''].dependencies['playwright-core'], playwright, 'Lockfile root must match package.json');
  assert.equal(lock.packages['node_modules/playwright-core'].version, playwright, 'Locked Playwright must match package.json');
});
