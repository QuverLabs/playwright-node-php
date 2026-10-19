# playwright-node-php

Playwright Docker images with Node.js and PHP CLI for automated testing.

The image includes Chromium, Firefox, WebKit and their Linux dependencies.
Use it for browser tests that need Node.js tooling or PHP's built-in web server.
Install your application's dependencies separately.

This is an independent community project, not affiliated with or endorsed by
Microsoft.

## Included software

Versions pinned in the source, updated on 2026-10-19:

| Component | Pinned version |
| --- | --- |
| Playwright | 1.64.1 |
| Node.js | 26.12.0 (Current) |
| PHP CLI | 8.5.11 |
| Operating system | Debian 13 (Trixie) |
| Platforms | `linux/amd64`, `linux/arm64` |

Release notes list the versions measured in both tested images, including npm,
all three browsers and PHP extensions. JSON reports and image digests are attached
to each [GitHub Release](https://github.com/QuverLabs/playwright-node-php/releases).

## Quick start

The first release is pending. Until then, [build the image locally](#build-and-test-locally).
Once it is published, pull the image:

```sh
docker pull ghcr.io/quverlabs/playwright-node-php:v1.64.1
```

In your project, install the matching Playwright version and commit
your lockfile:

```sh
npm install --save-dev --save-exact @playwright/test@1.64.1
```

Run your project's tests from its root directory:

```sh
docker run --rm --init --ipc=host \
  --volume "$PWD:/work" \
  --volume /work/node_modules \
  --workdir /work \
  ghcr.io/quverlabs/playwright-node-php:v1.64.1 \
  sh -c 'npm ci && npx --no-install playwright test'
```

The anonymous volume keeps Linux dependencies separate from host dependencies.
It is removed when the container exits. Reports written elsewhere in `/work`
remain in your project directory. Files created by the default root user may
require ownership adjustment on Linux hosts.

The image installs `playwright-core` in `/opt/playwright` to manage browsers.
Your project needs its own `@playwright/test` dependency; there is no global
`playwright` command. Keep `PLAYWRIGHT_BROWSERS_PATH=/ms-playwright` to use the
preinstalled browsers without downloading them again.

To add PHP extensions, Composer or application dependencies, extend the image
with your own Dockerfile. See [examples/Dockerfile](examples/Dockerfile)
and [examples/github-actions.yml](examples/github-actions.yml).

## macOS and Linux

Use Docker Desktop on macOS, or another Docker-compatible Linux VM such as Colima.
The same tag contains both architectures:

| Host | Selected image |
| --- | --- |
| Intel Mac or x86-64 Linux | `linux/amd64` |
| Apple Silicon Mac or ARM64 Linux | `linux/arm64` |

Docker automatically selects the platform matching its engine. Browsers run
inside Linux, including on macOS. WebKit in this image is the Linux WebKit build;
it is not macOS Safari. Screenshots can differ between CPU architectures: use the
same image digest and architecture in CI and when updating visual baselines.
Forcing AMD64 on Apple Silicon requires emulation and may be slower.

To reach an application on the host, use `host.docker.internal` on Docker Desktop;
other engines may need additional networking configuration. Inside the container,
`localhost` and `127.0.0.1` refer to the container itself.

## Tags and updates

| Tag | Meaning |
| --- | --- |
| `v1.64.1` | First image release for Playwright 1.64.1 |
| `v1.64.1-r2`, `v1.64.1-r3` | Subsequent releases with the same Playwright version |
| `v1.65.0` | First image release for a new Playwright version; the revision counter resets |

Revisions start at `r2`. Any release may update Node.js, PHP, system packages or
build scripts, so check the release notes before upgrading. Node.js and PHP major
versions can change even when the Playwright version stays the same.

Releases use the latest stable components, including Node.js Current rather than
LTS, and exclude prereleases. Component versions and base image digests are pinned
when preparing each release. Dependabot proposes weekly updates; maintainers
review and publish them.

The release workflow refuses to overwrite existing release tags. Each update
gets a new tag, and there is no `latest` alias.

For strict pinning, use the combined digest from the release description:

```text
ghcr.io/quverlabs/playwright-node-php@sha256:<digest-from-the-release>
```

APT packages are resolved during the build, so rebuilding the same source later
may produce a different image. Use a published digest to pin the exact content.

## Build and test locally

You need Docker with Buildx and Node.js 26 or later. The tooling tests run without
installing dependencies.

```sh
npm test
npm run build
npm run test:image
```

The local image is tagged `playwright-node-php:local`. Use this tag in place of the
GHCR tag in the examples above.

The build uses the local engine's architecture. To select one explicitly:

```sh
npm run build -- --platform linux/arm64
```

The smoke test starts a PHP server and checks page rendering and JavaScript in
all three browsers. External networking is disabled to ensure the browsers work
without downloads. CI runs the same checks on native AMD64 and ARM64 runners.

## Publishing

Pushing a version tag builds and tests both architectures, publishes the images
to GHCR and creates a GitHub Release. See [CONTRIBUTING.md](CONTRIBUTING.md) for
repository setup, release steps and failure recovery.

## Scope and license

This image is intended for trusted automated tests. It runs as root by default;
browser sandboxing and isolation need additional configuration for untrusted
websites. It is not a production PHP application server.

Repository source files are licensed under the [MIT License](LICENSE).
Software included in the container images remains subject to its respective
licenses. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## References

- [Playwright Docker guidance](https://playwright.dev/docs/docker)
- [Playwright system requirements](https://playwright.dev/docs/intro#system-requirements)
- [Docker multi-platform images](https://docs.docker.com/build/building/multi-platform/)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
