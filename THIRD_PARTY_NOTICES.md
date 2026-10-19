# Third-party software

The repository's Dockerfile, scripts, tests and documentation use the MIT license,
as recorded in the OCI license label. Bundled software retains its own licenses.

| Component | License information and source |
| --- | --- |
| Playwright | [Apache-2.0](https://github.com/microsoft/playwright/blob/main/LICENSE); [source](https://github.com/microsoft/playwright) |
| Node.js | [MIT and bundled third-party notices](https://github.com/nodejs/node/blob/main/LICENSE); [official image](https://github.com/nodejs/docker-node) |
| npm | [Artistic-2.0 and dependency licenses](https://github.com/npm/cli/blob/latest/LICENSE) |
| PHP | [PHP license and bundled notices](https://www.php.net/license/); [official image](https://github.com/docker-library/php) |
| Debian and system packages | Individual package licenses; [Debian copyright information](https://www.debian.org/legal/licenses/) |
| Chromium | [Chromium licenses](https://www.chromium.org/chromium-os/licenses/), including bundled third-party components |
| Firefox | [Mozilla licensing](https://www.mozilla.org/en-US/about/legal/terms/mozilla/) and [source](https://firefox-source-docs.mozilla.org/) |
| WebKit | [WebKit licensing](https://webkit.org/licensing-webkit/) and [source](https://webkit.org/getting-the-code/) |

License and notice files supplied by upstream packages remain in the image.
Node.js's license is also copied to `/usr/local/share/licenses/node/LICENSE`.
Playwright's license and notices are under
`/opt/playwright/node_modules/playwright-core/`; system-package copyright files
are under `/usr/share/doc/`. PHP's source archive and the `docker-php-source`
helper are retained from its official image. Browser distributions are stored
under `/ms-playwright` with the notices included by their distributors.

Before redistributing modified components, check their licenses for attribution
and source-distribution requirements.

This independent project is not affiliated with or endorsed by Microsoft,
the OpenJS Foundation, the PHP Group, or the browser vendors.
