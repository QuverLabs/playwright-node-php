import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function validateTag(tag, playwright) {
  const match = /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-r([1-9]\d*))?$/.exec(tag);
  assert.ok(match && match[0] === tag, `Invalid release tag: ${JSON.stringify(tag)}`);
  assert.equal(match.slice(1, 4).join('.'), playwright, 'Tag must match the pinned Playwright version');
  assert.ok(!match[4] || BigInt(match[4]) >= 2n, 'Revisions start at r2');
  return tag;
}

export function validateReports(reports, playwright) {
  assert.deepEqual(reports.map((r) => r.architecture).sort(), ['amd64', 'arm64'], 'Both architectures must pass');
  for (const report of reports) {
    assert.equal(report.playwright, playwright, 'Tested Playwright must match the release');
    assert.match(report.digest, /^sha256:[a-f0-9]{64}$/);
    for (const field of ['node', 'npm', 'php', 'os']) {
      assert.ok(typeof report[field] === 'string' && report[field].length > 0, `Missing ${field}`);
      assert.equal(report[field], reports[0][field], `Architectures disagree on ${field}`);
    }
    for (const browser of ['chromium', 'firefox', 'webkit']) {
      assert.ok(typeof report.browsers?.[browser] === 'string' && report.browsers[browser], `Missing ${browser} result`);
    }
    assert.ok(Array.isArray(report.phpExtensions) && report.phpExtensions.length > 0);
  }
}

export function releaseNotes(tag, image, digest, reports, playwright) {
  validateTag(tag, playwright);
  validateReports(reports, playwright);
  assert.match(digest, /^sha256:[a-f0-9]{64}$/);
  const ordered = [...reports].sort((a, b) => a.architecture.localeCompare(b.architecture));
  const first = ordered[0];
  return `# ${tag}

Playwright browsers with Node.js and PHP CLI. Both architectures passed offline browser and PHP smoke tests.

## Included versions

| Component | linux/amd64 | linux/arm64 |
| --- | --- | --- |
${['playwright', 'node', 'npm', 'php', 'os'].map((key) => `| ${key} | ${ordered[0][key]} | ${ordered[1][key]} |`).join('\n')}
${['chromium', 'firefox', 'webkit'].map((key) => `| ${key} | ${ordered[0].browsers[key]} | ${ordered[1].browsers[key]} |`).join('\n')}

## Usage

\`\`\`sh
docker pull ${image}:${tag}
# Pin the complete multi-platform image by digest:
docker pull ${image}@${digest}
\`\`\`

Install \`@playwright/test@${first.playwright}\` in the consuming project.
Every release may update Node.js, PHP and other image components. An \`-rN\` suffix means Playwright is unchanged. Published release tags are never overwritten by this workflow.

## Platform digests

${ordered.map((r) => `- linux/${r.architecture}: \`${image}@${r.digest}\``).join('\n')}

## PHP extensions

${ordered.map((r) => `- linux/${r.architecture}: ${r.phpExtensions.join(', ')}`).join('\n')}

The attached JSON reports contain versions observed in the tested images.
`;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [command, tag, image, digest, ...files] = process.argv.slice(2);
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
  const playwright = pkg.dependencies['playwright-core'];
  if (command === 'validate') validateTag(tag, playwright);
  else if (command === 'notes') process.stdout.write(releaseNotes(tag, image, digest,
    files.map((file) => JSON.parse(readFileSync(file))), playwright));
  else throw new Error('Usage: release.mjs validate TAG | notes TAG IMAGE DIGEST REPORT...');
}
