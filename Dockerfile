# Production environment Docker image
# Two stage build

# Stage 1 - builder
FROM node:16-alpine AS builder

WORKDIR /app

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Copy package
COPY ./components ./components
COPY ./lib ./lib
COPY ./pages ./pages
COPY ./problems ./problems
COPY ./public ./public
COPY ./scripts ./scripts
COPY ./styles ./styles
COPY ./types ./types
COPY package.json package-lock.json ./
COPY next.config.js .
COPY tsconfig.json .

# Build
RUN npm ci && \
    npm run build && \
    ./scripts/compile-problems.sh



# Stage 2 - runtime
FROM node:16-alpine

WORKDIR /app

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=builder /app/public ./public
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/scripts ./scripts

COPY --from=builder /app/next.config.js .
COPY --from=builder /app/package.json .
COPY --from=builder /app/package-lock.json .

# Fetch dependencies again for potential use in scripts
RUN npm ci

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# The project is configured to output the Next.js app as a self-contained
# standalone project
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

CMD node server.js
