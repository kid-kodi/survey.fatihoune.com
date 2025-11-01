# Coding Standards

## Critical Fullstack Rules

- **Type Sharing:** Always define shared types in `/types` directory and import from there. Never duplicate type definitions between frontend and backend
- **API Calls:** Never make direct HTTP calls from components - use the service layer in `/lib/api/*-service.ts`
- **Environment Variables:** Access only through config objects in `/lib/config.ts`, never `process.env` directly in components or API routes
- **Error Handling:** All API routes must use the standard error handler from `/lib/errors.ts` with consistent error response format
- **State Updates:** Never mutate state directly - use proper state management patterns (React setState, Zustand actions)
- **Prisma Client:** Always use the singleton Prisma client from `/lib/prisma.ts`, never instantiate `new PrismaClient()`
- **Authentication Checks:** Use `requireAuth()` and `requireOwnership()` helpers from `/lib/auth.ts` instead of manual session checks
- **Validation:** All user inputs (forms, API requests) must be validated with Zod schemas defined in `/lib/validation.ts`
- **Database Queries:** Use repository pattern in `/lib/repositories/*` for complex queries; simple queries can go directly in API routes
- **File Uploads:** Save to `/public/uploads` with unique filenames (CUID); validate file types and sizes before accepting

---

## Naming Conventions

| Element | Frontend | Backend | Example |
|---------|----------|---------|---------|
| Components | PascalCase | - | `SurveyBuilder.tsx` |
| Hooks | camelCase with 'use' | - | `useSurvey.ts` |
| API Routes | kebab-case (folder names) | Next.js convention | `/api/surveys/[id]/questions` |
| API Route Files | route.ts | route.ts | `route.ts` (Next.js convention) |
| Database Tables | PascalCase (Prisma models) | snake_case (actual tables) | Model: `Survey`, Table: `surveys` |
| Database Fields | camelCase (Prisma) | snake_case (SQL) | Prisma: `createdAt`, SQL: `created_at` |
| Service Files | kebab-case with -service | - | `survey-service.ts` |
| Type Files | kebab-case | - | `survey.ts` |
| Constants | SCREAMING_SNAKE_CASE | - | `MAX_SURVEY_QUESTIONS = 100` |
| Functions | camelCase | camelCase | `createSurvey()`, `validateInput()` |

---
