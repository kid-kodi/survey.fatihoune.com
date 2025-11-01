# Development Workflow

## Local Development Setup

### Prerequisites

```bash
# Install Node.js 18+ and pnpm
node --version  # Should be 18+
pnpm --version  # Should be 8+

# Install PostgreSQL (or use cloud database)
# Option 1: Local PostgreSQL
# brew install postgresql@15 (macOS)
# sudo apt-get install postgresql-15 (Ubuntu)

# Option 2: Use Railway/Supabase (recommended for simplicity)
```

### Initial Setup

```bash
# Clone repository
git clone https://github.com/kid-kodi/survey.fatihoune.com.git
cd survey.fatihoune.com

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your database URL and secrets
# DATABASE_URL="postgresql://user:password@localhost:5432/survey_db"
# NEXTAUTH_SECRET="your-secret-key"
# GOOGLE_CLIENT_ID="your-google-client-id"
# GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Setup database
pnpm prisma migrate dev
pnpm prisma generate
pnpm prisma db seed  # Optional: seed with test data

# Start development server
pnpm dev
```

### Development Commands

```bash
# Start all services (Next.js dev server)
pnpm dev

# Start frontend only (Next.js is fullstack, so same command)
pnpm dev

# Start backend only (API routes run with Next.js)
pnpm dev

# Run type checking
pnpm tsc --noEmit

# Run linter
pnpm lint

# Run Prisma Studio (database GUI)
pnpm prisma studio

# Generate Prisma Client after schema changes
pnpm prisma generate

# Create and apply database migration
pnpm prisma migrate dev --name migration-name

# Build for production
pnpm build

# Start production server
pnpm start

# Run tests (Phase 2)
pnpm test
pnpm test:watch
pnpm test:e2e
```

---

## Environment Configuration

### Required Environment Variables

```bash
# Frontend (.env.local)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=/api  # Relative URL for same-origin requests

# Backend (.env or .env.local)
DATABASE_URL="postgresql://user:password@localhost:5432/survey_db"

# Authentication (better-auth)
BETTER_AUTH_SECRET="your-secret-key-min-32-chars"
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email Service (Resend)
RESEND_API_KEY="re_your_resend_api_key"
FROM_EMAIL="noreply@survey.fatihoune.com"

# Analytics (PostHog)
NEXT_PUBLIC_POSTHOG_KEY="phc_your_posthog_key"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"

# Shared
NODE_ENV=development
```

---
