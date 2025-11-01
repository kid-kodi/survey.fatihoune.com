# Tech Stack

## Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|-----------|---------|---------|-----------|
| Frontend Language | TypeScript | 5.x | Type-safe frontend development | Catches errors at compile time, improves IDE support, essential for large React applications |
| Frontend Framework | Next.js | 16.0.1 | Full-stack React framework with App Router | Industry-leading React framework with excellent DX, SSR/CSR flexibility, and built-in API routes |
| UI Library | React | 19 | Component-based UI library | Latest React with improved performance, Server Components support, and modern concurrent features |
| UI Component Library | shadcn/ui | Latest | Accessible, customizable component primitives | High-quality, accessible components built on Radix UI with full customization via Tailwind |
| State Management | React Context + Hooks | 19 | Local and shared state management | Built-in React features sufficient for MVP; avoids Redux complexity; Server Components handle server state |
| Backend Language | TypeScript | 5.x | Type-safe backend development | Shared types between frontend/backend, end-to-end type safety via Prisma |
| Backend Framework | Next.js API Routes | 16.0.1 | Serverless backend functions | Native Next.js backend without separate server; deployed as serverless functions |
| API Style | REST | N/A | RESTful HTTP API | Simple, widely understood, sufficient for CRUD operations; tRPC considered for future type-safety gains |
| Database | PostgreSQL | 15+ | Relational database for surveys/responses | ACID compliance for data integrity, excellent relational support for survey hierarchies, mature ecosystem |
| ORM | Prisma | 5.x | Type-safe database access | Best-in-class TypeScript ORM with automatic migrations, type generation, and excellent DX |
| Cache | Redis (Post-MVP) | 7.x | Session storage and caching | Not needed for MVP; consider for session storage and response caching in production |
| File Storage | Local Filesystem | N/A | User-uploaded logos and images | Simple file storage in `/public/uploads` for MVP; migrate to S3 if scaling requires |
| Authentication | better-auth | Latest | OAuth and credential authentication | Modern, flexible auth library with Google OAuth, session management, and TypeScript support |
| Frontend Testing | React Testing Library + Jest | Latest | Component and unit testing | Industry standard for React testing; deferred to Phase 2 per progressive testing strategy |
| Backend Testing | Jest + Supertest | Latest | API endpoint testing | Node.js testing standard; deferred to Phase 2 per progressive testing strategy |
| E2E Testing | Playwright (Phase 3) | Latest | End-to-end user journey testing | Modern E2E tool with excellent Next.js support; added in Phase 3 pre-production |
| Build Tool | Next.js CLI | 16.0.1 | Project build and development | Native Next.js tooling handles all build concerns |
| Bundler | Turbopack (Next.js 16) | Latest | Fast module bundling | Next.js 16's default bundler; significantly faster than Webpack |
| IaC Tool | Docker + Docker Compose (Production) | Latest | Infrastructure as code for self-hosted deployment | Containerizes app for consistent deployment across environments |
| CI/CD | GitHub Actions | N/A | Automated testing and deployment | Free for public repos, excellent GitHub integration, simple YAML configuration |
| Monitoring | Sentry (Post-MVP) | Latest | Error tracking and performance monitoring | Industry standard for error tracking; added post-MVP when product is validated |
| Logging | Pino (Production) | Latest | Structured logging for backend | Fast, low-overhead JSON logging for production debugging |
| CSS Framework | Tailwind CSS | 4.x | Utility-first styling | Rapid UI development, excellent with shadcn/ui, eliminates CSS conflicts |
| Validation Library | Zod | Latest | Runtime schema validation | TypeScript-first validation for forms and API inputs; integrates with React Hook Form |
| Form Handling | React Hook Form | Latest | Performant form management | Minimal re-renders, excellent validation support, works seamlessly with Zod |
| Charts Library | Recharts | 2.x | Analytics visualizations | React-native charting library with declarative API for bar/pie charts |
| CSV Export | Papa Parse | 5.x | CSV generation and parsing | Fast, reliable CSV handling for response exports |
| Email Service | Resend | Latest | Transactional emails | Modern email API with excellent DX, generous free tier |
| Analytics | PostHog | Latest | Product analytics and feature tracking | Open-source analytics with self-hosting option, privacy-friendly, generous free tier |
| Icon Library | Lucide React | Latest | Icon components | Consistent, customizable icons; official shadcn/ui icon library |
| Date Handling | date-fns | Latest | Date manipulation and formatting | Lightweight, immutable, tree-shakeable alternative to Moment.js |

---
