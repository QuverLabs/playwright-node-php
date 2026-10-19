const assert = require('node:assert/strict');
const { execFileSync, spawn } = require('node:child_process');
const { readFileSync } = require('node:fs');
const { setTimeout: delay } = require('node:timers/promises');
const { createRequire } = require('node:module');
const imageRequire = createRequire('/opt/playwright/package.json');
const playwright = imageRequire('playwright-core');
const version = imageRequire('playwright-core/package.json').version;

async function main() {
  const php = execFileSync('php', ['-r', 'echo PHP_VERSION;'], { encoding: 'utf8' }).trim();
  const dockerfile = readFileSync('/expected-Dockerfile', 'utf8');
  const expectedPackage = JSON.parse(readFileSync('/expected-package.json', 'utf8'));
  assert.equal(process.versions.node, dockerfile.match(/^FROM node:([\d.]+)-/m)?.[1], 'Node version must match its base-image tag');
  assert.equal(php, dockerfile.match(/^FROM php:([\d.]+)-/m)?.[1], 'PHP version must match its base-image tag');
  assert.equal(version, expectedPackage.dependencies['playwright-core'], 'Playwright version must match the source pin');
  const server = spawn('php', ['-S', '127.0.0.1:8080', '-t', '/smoke'], { stdio: 'ignore' });
  server.on('error', (error) => { console.error(error); process.exitCode = 1; });
  try {
    let ready = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      try {
        const response = await fetch('http://127.0.0.1:8080', { signal: AbortSignal.timeout(1000) });
        if (response.ok) { ready = true; break; }
      } catch { /* PHP is still starting. */ }
      if (server.exitCode !== null) throw new Error('PHP server exited before becoming ready');
      await delay(100);
    }
    assert.ok(ready, 'PHP server did not become ready');
    const browsers = {};
    for (const name of ['chromium', 'firefox', 'webkit']) {
      const browser = await playwright[name].launch({ headless: true, timeout: 30_000 });
      try {
        const page = await browser.newPage();
        await page.goto('http://127.0.0.1:8080', { timeout: 15_000 });
        assert.equal(await page.title(), 'Container smoke test');
        assert.equal(await page.locator('h1').textContent(), `PHP ${php}`);
        assert.equal(await page.evaluate(() => 6 * 7), 42);
        browsers[name] = browser.version();
        console.error(`${name}: ${browsers[name]} — passed`);
      } finally { await browser.close(); }
    }
    const os = readFileSync('/etc/os-release', 'utf8').match(/^PRETTY_NAME="(.+)"$/m)?.[1];
    assert.ok(os, 'Missing operating system name');
    const architecture = { x64: 'amd64', arm64: 'arm64' }[process.arch];
    assert.ok(architecture, `Unsupported architecture: ${process.arch}`);
    console.log(JSON.stringify({
      architecture, playwright: version, node: process.versions.node,
      npm: execFileSync('npm', ['--version'], { encoding: 'utf8' }).trim(), php, os, browsers,
      phpExtensions: JSON.parse(execFileSync('php', ['-r', 'echo json_encode(get_loaded_extensions());'], { encoding: 'utf8' })).sort(),
    }, null, 2));
  } finally { server.kill('SIGTERM'); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
