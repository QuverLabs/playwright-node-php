# Contributing and releases

Keep changes focused on the container image, build tools and smoke tests.
Examples should work without private services or credentials.

## Updating components

1. Check the current stable releases from npm (`npm view playwright version`),
   [Node.js](https://nodejs.org/en/download) and
   [PHP](https://www.php.net/downloads.php). Use Node.js Current and exclude
   prereleases, as described in the README's version policy.
2. Update the exact `playwright-core` dependency and its lockfile with
   `npm install --save-exact --ignore-scripts playwright-core@VERSION`.
3. Update the Node.js and PHP image tags and **multi-platform index digests** in
   `Dockerfile`. Keep both images on the same supported Debian release. Check
   that each index includes AMD64 and ARM64. Update tooling Node.js pins in the
   workflows as needed.
4. Update the README's version table, update date and examples. Record
   any compatibility changes in the pull request.
5. Run `npm test`, `npm run build`, `npm run test:image`,
   `shellcheck scripts/*.sh` and `actionlint .github/workflows/*.yml`.
6. Require the CI smoke tests on both native architectures before releasing.

## Repository setup

Enable Actions and package creation for the repository. The workflows authenticate
with `GITHUB_TOKEN`; a separate registry token is not needed. Protect `main` and
release tags from deletion or force updates, and enable private vulnerability
reporting.

After the first publication, set the GHCR package visibility to **Public** and
verify a pull from an unauthenticated Docker client. Package visibility is
configured separately from repository visibility. Update the README's quick
start to remove the notice that the first release is pending.

## Creating a release

Choose `v<Playwright>` for the first release of that Playwright version. If it has
already been released, use the next `-rN` suffix, starting with `-r2`. Node.js,
PHP and other components may change in either kind of release. Never move or
reuse an existing release tag.

After the reviewed changes are on `main` and CI is green:

```sh
git switch main
git pull --ff-only
node scripts/release.mjs validate v1.64.1
git tag -a v1.64.1 -m 'Playwright 1.64.1 image'
git push origin v1.64.1
```

Replace the example tag with the version you are releasing. Pushing a `v*` tag
starts the release workflow:

1. Validate the tag against the pinned Playwright version.
2. Build and run offline smoke tests on native AMD64 and ARM64 runners.
3. Push the tested images under temporary `build-*` tags.
4. Validate both version reports and check that the release tag is unused in GHCR.
5. Publish a combined image manifest and create a GitHub Release with version
   reports and image digests.

Reports must agree on Node.js, npm, PHP and OS versions. Browser versions are
reported separately because upstream builds can differ by architecture. The
smoke test writes its JSON report to stdout and progress messages to stderr.

The workflow prevents accidental tag overwrites. Users with registry write access
can still change tags directly; consumers can pin digests for reproducibility.

## Failure recovery

- Failure before the combined release tag is published: fix the cause and rerun
  the failed workflow when appropriate. Each attempt uses separate temporary
  `build-*` tags. Do not move an existing Git tag to changed source; use a new tag
  if a source fix is needed.
- Image published but GitHub Release creation failed: do **not** rebuild or
  overwrite the image. Download the `release-metadata` workflow artifact and
  create the missing release with its `release.md`, `amd64.json`, `arm64.json`
  and `manifest.json`. Verify the recorded index digest against GHCR first.
- A published image needs a fix: issue the next revision. Leave previous release
  tags available for consumers and rollback.

The temporary `build-*` tags are not intended for consumers. Keep their image
manifests while published release indexes reference them.
