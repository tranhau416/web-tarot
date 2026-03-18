# ============================================================
# Tarot Web App — Frontend Dockerfile
# Multi-stage build: deps → builder → runner
# ============================================================

# ── Stage 1: deps — cài node_modules ─────────────────────
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline


# ── Stage 2: builder — build Next.js app ─────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable Next.js telemetry trong CI/CD
ENV NEXT_TELEMETRY_DISABLED=1

# Build production bundle
RUN npm run build


# ── Stage 3: runner — runtime image nhỏ gọn ─────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Tạo non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy chỉ những file cần thiết từ build stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD wget -qO- http://localhost:3000/api/health 2>/dev/null || exit 1

CMD ["node", "server.js"]
