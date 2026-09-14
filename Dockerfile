FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

FROM base AS dependencies
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM base AS dev-dependencies
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json ./
RUN npm ci

FROM dev-dependencies AS builder
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=dependencies /app/node_modules ./node_modules
COPY --chown=node:node dist ./dist
COPY --chown=node:node package.json ./

USER node
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"
CMD ["node", "dist/index.js"]

FROM dev-dependencies AS development
ENV NODE_ENV=development
COPY tsconfig.json ./
COPY src ./src
EXPOSE 4000
CMD ["npm", "run", "dev"]
