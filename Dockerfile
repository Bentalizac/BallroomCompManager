# Multi-stage build for the server
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@10.17.1

WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Copy all packages
COPY shared ./shared
COPY server ./server

# Install dependencies for all packages
RUN pnpm install --frozen-lockfile

# Build shared package first
WORKDIR /app/shared
RUN pnpm build

# Build server
WORKDIR /app/server
RUN pnpm build

# Production stage
FROM node:20-alpine AS runner
RUN npm install -g pnpm@10.17.1

WORKDIR /app

# Copy built files and dependencies
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/server ./server
COPY --from=builder /app/pnpm-workspace.yaml /app/pnpm-lock.yaml /app/package.json ./

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

EXPOSE 3001

CMD ["node", "server/dist/server.js"]
