# ============================================
# Stage 1: Build
# ============================================
FROM node:24-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable

# Copy dependency manifests first
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml nx.json ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build NestJS API
RUN pnpm nx build api --configuration=production


# ============================================
# Stage 2: Production
# ============================================
FROM node:24-alpine AS runner

WORKDIR /app

ENV PORT=3000
ENV HOST=0.0.0.0
ENV NODE_OPTIONS="--dns-result-order=ipv4first"

# Copy built NestJS application
COPY --from=builder /app/dist/apps/api ./

# Install only production dependencies
RUN corepack enable \
    && pnpm install --prod --ignore-scripts

EXPOSE 3000

CMD ["node", "main.js"]