# Unified Project Structure

```
survey.fatihoune.com/
├── .github/                        # CI/CD workflows
│   └── workflows/
│       ├── ci.yaml                 # Continuous integration (lint, type-check)
│       └── deploy.yaml             # Deployment workflow
├── app/                            # Next.js App Router
│   ├── (auth)/                     # Auth route group (shared layout)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx              # Auth pages layout
│   ├── (dashboard)/                # Dashboard route group (protected)
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── surveys/
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx        # Analytics view
│   │   │   │   └── edit/
│   │   │   │       └── page.tsx    # Survey builder
│   │   │   └── new/
│   │   │       └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   └── layout.tsx              # Dashboard layout with nav
│   ├── s/
│   │   └── [uniqueId]/
│   │       └── page.tsx            # Public survey view (SSR)
│   ├── api/                        # API routes
│   │   ├── auth/
│   │   │   ├── register/route.ts
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   └── callback/
│   │   │       └── google/route.ts
│   │   ├── surveys/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       ├── questions/
│   │   │       │   ├── route.ts
│   │   │       │   ├── [qid]/route.ts
│   │   │       │   └── reorder/route.ts
│   │   │       ├── responses/route.ts
│   │   │       ├── analytics/route.ts
│   │   │       └── export/route.ts
│   │   ├── user/
│   │   │   └── profile/route.ts
│   │   └── dashboard/
│   │       └── stats/route.ts
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Landing page
│   └── globals.css                 # Global styles (Tailwind imports)
├── components/
│   ├── ui/                         # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── form.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── survey/                     # Survey builder components
│   │   ├── survey-builder.tsx
│   │   ├── question-palette.tsx
│   │   ├── question-editor.tsx
│   │   ├── question-list.tsx
│   │   └── conditional-logic-editor.tsx
│   ├── dashboard/
│   │   ├── survey-card.tsx
│   │   ├── empty-state.tsx
│   │   └── stats-overview.tsx
│   ├── analytics/
│   │   ├── chart-renderer.tsx
│   │   ├── response-table.tsx
│   │   └── export-button.tsx
│   ├── public/
│   │   ├── public-survey.tsx
│   │   ├── question-renderer.tsx
│   │   └── thank-you.tsx
│   └── shared/
│       ├── navbar.tsx
│       ├── footer.tsx
│       └── loading.tsx
├── hooks/                          # Custom React hooks
│   ├── use-survey.ts
│   ├── use-auth.ts
│   └── use-analytics.ts
├── lib/                            # Utilities and business logic
│   ├── api/
│   │   ├── client.ts               # Axios client setup
│   │   ├── survey-service.ts
│   │   ├── auth-service.ts
│   │   └── analytics-service.ts
│   ├── repositories/               # Data access layer
│   │   ├── survey-repository.ts
│   │   ├── question-repository.ts
│   │   └── response-repository.ts
│   ├── auth.ts                     # Auth utilities (better-auth wrapper)
│   ├── prisma.ts                   # Prisma client singleton
│   ├── errors.ts                   # Error handling utilities
│   ├── validation.ts               # Zod schemas
│   ├── utils.ts                    # General utilities (cn, formatDate, etc.)
│   └── constants.ts                # App constants
├── types/                          # TypeScript type definitions
│   ├── survey.ts
│   ├── question.ts
│   ├── response.ts
│   └── user.ts
├── prisma/                         # Database schema and migrations
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts                     # Database seed script
├── public/                         # Static assets
│   ├── uploads/                    # User-uploaded files
│   ├── images/
│   └── favicon.ico
├── docs/                           # Project documentation
│   ├── brief.md
│   ├── prd.md
│   └── architecture.md
├── .env.example                    # Environment variables template
├── .env.local                      # Local environment variables (gitignored)
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
├── components.json                 # shadcn/ui configuration
├── middleware.ts                   # Next.js middleware (auth)
├── postcss.config.mjs
├── README.md
└── pnpm-lock.yaml
```

---
