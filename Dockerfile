# syntax=docker/dockerfile:1
FROM node:26.12.1-trixie-slim@sha256:36793bcbb160a6a16cede1e62b93f84e26b78a972a8a4c0b879c1c12f22761ec AS node

FROM php:8.5.11-cli-trixie@sha256:01a109229f4465bc9ef042d9198f09a4d9da7775a825dbd8572dcdbd8756c4d3

COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/lib/node_modules/ /usr/local/lib/node_modules/
COPY --from=node /usr/local/LICENSE /usr/local/share/licenses/node/LICENSE
RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
WORKDIR /opt/playwright
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund \
    && ./node_modules/.bin/playwright-core install --with-deps chromium firefox webkit \
    && chmod -R a+rX /ms-playwright \
    && npm cache clean --force \
    && rm -rf /var/lib/apt/lists/*

COPY LICENSE THIRD_PARTY_NOTICES.md /usr/local/share/licenses/playwright-node-php/
ARG IMAGE_VERSION=development
ARG SOURCE_REVISION=unknown
LABEL org.opencontainers.image.title="playwright-node-php" \
      org.opencontainers.image.description="Playwright Docker images with Node.js and PHP CLI." \
      org.opencontainers.image.source="https://github.com/QuverLabs/playwright-node-php" \
      org.opencontainers.image.licenses="MIT" \
      org.opencontainers.image.version="${IMAGE_VERSION}" \
      org.opencontainers.image.revision="${SOURCE_REVISION}"

WORKDIR /work
# Override the PHP image entrypoint so arbitrary commands behave consistently.
ENTRYPOINT []
CMD ["node", "--version"]
