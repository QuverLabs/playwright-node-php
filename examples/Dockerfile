FROM ghcr.io/quverlabs/playwright-node-php:v1.64.1
WORKDIR /work
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
CMD ["npx", "--no-install", "playwright", "test"]
