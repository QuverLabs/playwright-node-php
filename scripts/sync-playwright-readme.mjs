import { readFileSync, writeFileSync } from 'node:fs';

const version = JSON.parse(readFileSync('package.json', 'utf8')).dependencies['playwright-core'];
if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error('Playwright must have an exact stable version');
let readme = readFileSync('README.md', 'utf8');
const original = readme;
function replace(pattern, replacement, expected) {
  const matches = [...readme.matchAll(pattern)];
  if (matches.length !== expected) throw new Error(`Expected ${expected} matches for ${pattern}, found ${matches.length}`);
  readme = readme.replace(pattern, replacement);
}
const semver = String.raw`\d+\.\d+\.\d+`;
replace(new RegExp(`(^\\| Playwright \\| )${semver}`, 'gm'), `$1${version}`, 1);
replace(new RegExp(`(ghcr\\.io/quverlabs/playwright-node-php:v)${semver}(?![-\\d.])`, 'g'), `$1${version}`, 2);
replace(new RegExp(`(@playwright/test@)${semver}`, 'g'), `$1${version}`, 1);
replace(new RegExp(`(^\\| \\x60v)${semver}(\\x60 \\| First image release for Playwright )${semver}`, 'gm'), `$1${version}$2${version}`, 1);
replace(new RegExp(`(^\\| \\x60v)${semver}(-r2\\x60, \\x60v)${semver}(-r3\\x60 \\| Subsequent releases with the same Playwright version \\|)`, 'gm'), `$1${version}$2${version}$3`, 1);
if (readme !== original) {
  const date = new Date().toISOString().slice(0, 10);
  replace(/^Versions pinned in the source, updated on \d{4}-\d{2}-\d{2}:/gm, `Versions pinned in the source, updated on ${date}:`, 1);
}
writeFileSync('README.md', readme);
