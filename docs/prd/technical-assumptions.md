# Technical Assumptions

## Repository Structure: Monorepo

The project will use a monorepo structure within a single Git repository, with clear separation of concerns:
- `/app` - Next.js App Router pages and layouts
- `/components` - React components (organized by feature/domain)
- `/components/ui` - shadcn/ui components
- `/lib` - Utility functions, helpers, and shared logic
- `/hooks` - Custom React hooks
- `/types` - TypeScript type definitions
- `/prisma` - Database schema and migrations
- `/public` - Static assets
- `/docs` - Project documentation (briefs, PRDs, architecture)

## Service Architecture

**Monolithic Next.js Application within Monorepo**

The application will be built as a unified Next.js application leveraging both server and client capabilities:
- **Server-Side Rendering (SSR)**: Marketing pages, public survey views (SEO-optimized)
- **Client-Side Rendering (CSR)**: Authenticated dashboard, survey builder (interactive UIs)
- **API Routes**: Next.js API routes for backend logic (authentication, CRUD operations, analytics)
- **Serverless Functions**: API routes deployed as serverless functions (on Vercel for dev, self-hosted for production)
- **Database**: Direct Prisma ORM connections from API routes to PostgreSQL

**Rationale**: Monolithic architecture simplifies development, deployment, and debugging for MVP while maintaining scalability through Next.js's optimizations. Can evolve to microservices if specific services require independent scaling.

## Testing Requirements

**Progressive Testing Strategy - Start Simple, Scale with Complexity**

- **Phase 1 (MVP Focus)**:
  - **Manual Testing**: Primary QA method during MVP development (8-12 week timeline constraints)
  - **Type Safety**: TypeScript strict mode as first line of defense against bugs
  - **Manual Testing Convenience**: Development tools and seed data for rapid manual testing

- **Phase 2 (Post-MVP)**:
  - **Unit Tests**: Critical business logic and utility functions (Jest + React Testing Library)
  - **Integration Tests**: API endpoint testing for core workflows

- **Phase 3 (Pre-Production)**:
  - **E2E Tests**: Key user journeys (Playwright or Cypress)
  - **Performance Testing**: Load testing for concurrent survey responses

**Rationale**: Manual testing allows fastest MVP delivery while TypeScript catches many bugs at compile time. Automated testing investment grows as product validates and complexity increases.

## Additional Technical Assumptions and Requests

- **Authentication**: better-auth library will be used for OAuth and credential-based authentication (not NextAuth.js)
- **Database**: PostgreSQL via Prisma ORM; hosted on Railway, Supabase, or self-managed instance
- **Hosting/Infrastructure**:
  - Development: Vercel for fast iteration and preview deployments
  - Production: Self-hosted infrastructure for full control and cost optimization
- **File Storage**: Local server filesystem storage (in `/public/uploads` or dedicated uploads directory) for user uploads like logos
- **Email Service**: Resend or SendGrid for transactional emails (account verification, password resets)
- **Product Analytics**: PostHog or Mixpanel for tracking user behavior and feature usage
- **Form Validation**: Zod for runtime validation of forms and API inputs
- **State Management**: React Context API and hooks for local state; Server Components for data fetching
- **Styling**: Tailwind CSS 4.x with CSS variables; shadcn/ui components for UI consistency
- **Icon Library**: Lucide React for all iconography
- **Data Export**: CSV generation using Papa Parse or similar library
- **Charts/Visualization**: Recharts or Chart.js for analytics dashboard visualizations
- **Rich Text Editing**: Basic textarea for MVP; consider Lexical or Tiptap for future rich question descriptions
- **Security**:
  - Input sanitization using DOMPurify or similar
  - Rate limiting using upstash/ratelimit or custom middleware
  - CSRF protection via better-auth's built-in mechanisms
  - SQL injection prevention via Prisma's parameterized queries
- **Error Tracking**: Consider Sentry for production error monitoring (post-MVP)
- **Code Quality**: ESLint + Prettier for code consistency; Husky for pre-commit hooks

---
