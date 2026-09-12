# Stage 1: Build NestJS API using Nx
FROM node:24-alpine AS builder

WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace package manifests and lockfiles
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml nx.json ./

# Install workspace dependencies
RUN pnpm install --frozen-lockfile

# Copy codebase
COPY . .

# Build NestJS API using Nx
RUN pnpm nx build api --configuration=production

# Install production dependencies for built output
WORKDIR /app/dist/apps/api
RUN pnpm install --prod --frozen-lockfile

# Stage 2: Runtime image
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy built app output and production node_modules from builder
COPY --from=builder /app/dist/apps/api ./

# Expose container port
EXPOSE 3000

CMD ["node", "main.js"]
