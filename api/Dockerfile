# --- Base Stage ---
FROM node:18-alpine AS base
WORKDIR /usr/src/app
RUN npm install -g pnpm

# --- Dependencies Stage ---
FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile --prod

# --- Build Stage ---
FROM base AS build
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile
COPY . .
# We need the shared package to build
COPY ../shared ./shared
RUN pnpm --filter api build

# --- Production Stage ---
FROM base AS production
ENV NODE_ENV=production
# Copy built app from build stage
COPY --from=build /usr/src/app/dist ./dist
# Copy production dependencies from deps stage
COPY --from=deps /usr/src/app/node_modules ./node_modules
# Copy prisma schema for runtime access
COPY prisma ./prisma
# Copy package.json
COPY package.json .

# This command is used by Prisma to generate the client based on the schema.
# It's necessary for production environments where you might run migrations.
RUN pnpm exec prisma generate

EXPOSE 4000
CMD ["node", "dist/server.js"]
