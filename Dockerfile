# --- Stage 1: Build the application ---
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies based on lock file
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else npm install; fi

# Copy source code and Prisma schema
COPY . .
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Build Next.js app for standalone output
RUN npm run build

# --- Stage 2: Production runner ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy Prisma + dependencies
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3018

CMD ["sh", "-c", "sleep 5 && npx prisma migrate deploy && node server.js"]

