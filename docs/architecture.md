# Survey.fatihoune.com Fullstack Architecture Document

## Introduction

This document outlines the complete fullstack architecture for Survey.fatihoune.com, a modern survey creation and management platform. It serves as the single source of truth for AI-driven development, ensuring consistency across the entire technology stack from frontend UI to backend services and database design.

This unified approach combines frontend and backend architecture concerns, streamlining the development process for a modern fullstack application where these concerns are tightly integrated through Next.js's unified framework.

### Starter Template or Existing Project

**Status**: N/A - Greenfield project

This is a greenfield project built from scratch using Next.js 16.0.1 with App Router. While no specific starter template is used, the project leverages established patterns from:
- Next.js App Router conventions and best practices
- shadcn/ui component library setup (New York style)
- Prisma ORM with PostgreSQL patterns
- better-auth authentication library patterns

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-11-01 | 1.0 | Initial architecture document | Winston (Architect Agent) |

---

## High Level Architecture

### Technical Summary

Survey.fatihoune.com is built as a **monolithic Next.js 16 application** leveraging the App Router for unified server and client rendering. The architecture follows a **modern Jamstack pattern** with Server-Side Rendering (SSR) for public survey pages and Client-Side Rendering (CSR) for authenticated dashboards and interactive survey builders. Backend logic is implemented through **Next.js API Routes** deployed as serverless functions, with **Prisma ORM** providing type-safe database access to **PostgreSQL**. The frontend uses **React 19** with **TypeScript 5.x** for type safety, **Tailwind CSS 4.x** for styling, and **shadcn/ui** components for consistent, accessible UI patterns. Authentication is handled by **better-auth** with support for email/password and Google OAuth flows. Development occurs on **Vercel** for rapid iteration, while production deploys to **self-hosted infrastructure** for cost control and flexibility. This architecture achieves the PRD's performance goals (page loads < 2s, TTI < 3s, response submission < 500ms) through Next.js optimizations, efficient database queries, and strategic use of server/client rendering patterns.

### Platform and Infrastructure Choice

**Platform:** Hybrid - Vercel (Development) / Self-Hosted (Production)

**Key Services:**
- **Development Platform**: Vercel for fast iteration, preview deployments, and CI/CD integration
- **Production Platform**: Self-hosted infrastructure (VPS, dedicated server, or containerized deployment)
- **Database**: PostgreSQL (Railway, Supabase, or self-managed instance)
- **Authentication**: better-auth library with database session storage
- **File Storage**: Local filesystem (`/public/uploads` or dedicated directory)
- **Email Service**: Resend or SendGrid for transactional emails
- **Analytics**: PostHog or Mixpanel for product analytics
- **Monitoring**: Sentry (optional, post-MVP) for error tracking

**Deployment Host and Regions:**
- **Development**: Vercel global edge network (automatic region selection)
- **Production**: Self-hosted in single region initially (expand as needed based on user geography)

**Rationale:**
- Vercel provides excellent DX for Next.js development with zero-config deployments and instant preview URLs
- Self-hosted production gives full control over costs, data sovereignty, and infrastructure scaling
- PostgreSQL provides relational integrity for survey/response data with excellent Prisma support
- better-auth offers modern, flexible authentication without vendor lock-in

### Repository Structure

**Structure:** Monorepo (single repository)

**Monorepo Tool:** Native Next.js structure with npm workspaces (lightweight, no additional tooling needed for MVP)

**Package Organization:**
- Single Next.js application containing both frontend and backend
- Shared types, utilities, and constants within `/lib` directory
- Clear separation between `/app` (routes/pages), `/components` (UI), and `/lib` (business logic)
- Prisma schema and migrations in `/prisma` directory
- Future: Can migrate to Turborepo or Nx if additional packages/apps are needed post-MVP

**Rationale:** For an MVP timeline (8-12 weeks) with 1-2 developers, a simple monorepo structure within Next.js provides maximum velocity without monorepo tooling overhead. All code sharing happens through standard imports with TypeScript path aliases.

### High Level Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        Mobile[Mobile Browser]
    end

    subgraph "Next.js Application"
        subgraph "Frontend (React 19)"
            Pages[App Router Pages]
            Components[React Components]
            State[Client State]
        end

        subgraph "Backend (API Routes)"
            AuthAPI[Auth API]
            SurveyAPI[Survey API]
            ResponseAPI[Response API]
            AnalyticsAPI[Analytics API]
        end

        Middleware[Next.js Middleware<br/>Auth & Rate Limiting]
    end

    subgraph "Data Layer"
        Prisma[Prisma ORM]
        PostgreSQL[(PostgreSQL Database)]
    end

    subgraph "External Services"
        BetterAuth[better-auth]
        GoogleOAuth[Google OAuth]
        EmailService[Email Service<br/>Resend/SendGrid]
        Analytics[PostHog/Mixpanel]
    end

    subgraph "File Storage"
        LocalFS[Local Filesystem<br/>/public/uploads]
    end

    Browser --> Pages
    Mobile --> Pages
    Pages --> Components
    Components --> State

    Pages --> Middleware
    Middleware --> AuthAPI
    Middleware --> SurveyAPI
    Middleware --> ResponseAPI
    Middleware --> AnalyticsAPI

    AuthAPI --> BetterAuth
    BetterAuth --> GoogleOAuth
    BetterAuth --> Prisma
    AuthAPI --> EmailService

    SurveyAPI --> Prisma
    ResponseAPI --> Prisma
    AnalyticsAPI --> Prisma

    Prisma --> PostgreSQL

    SurveyAPI --> LocalFS

    Components --> Analytics
```

### Architectural Patterns

- **Jamstack Architecture:** Static site generation for marketing pages with serverless API routes for dynamic functionality - _Rationale:_ Optimal performance and scalability for content-heavy applications while maintaining dynamic survey functionality

- **Server-Side Rendering (SSR):** Public survey pages rendered on server for SEO and initial load performance - _Rationale:_ Ensures survey links are crawlable and respondents experience fast initial page loads regardless of device

- **Client-Side Rendering (CSR):** Authenticated dashboard and survey builder use client-side React for rich interactivity - _Rationale:_ Survey builder requires complex drag-and-drop and real-time preview that benefits from client-side reactivity

- **API Routes as Backend:** Next.js API routes serve as RESTful backend without separate server - _Rationale:_ Reduces architectural complexity and deployment overhead for MVP while leveraging Next.js built-in capabilities

- **Repository Pattern:** Data access abstracted through Prisma ORM with typed models - _Rationale:_ Enables testing, provides type safety, and facilitates future database migration if needed

- **Composition Pattern:** UI built from small, reusable shadcn/ui components - _Rationale:_ Maintainability and consistency across survey builder and dashboard interfaces

- **Optimistic UI Updates:** Client-side state updates before server confirmation for perceived performance - _Rationale:_ Enhances user experience in survey builder during question editing and reordering

- **Progressive Enhancement:** Core survey functionality works without JavaScript, enhanced with interactive features - _Rationale:_ Ensures survey respondents can submit responses even with JavaScript disabled or slow connections

---

## Tech Stack

### Technology Stack Table

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

## Data Models

### User

**Purpose:** Represents registered users who create and manage surveys. Supports both email/password and OAuth authentication methods.

**Key Attributes:**
- `id`: string (UUID) - Unique identifier
- `email`: string (unique) - User's email address for login and communication
- `name`: string | null - User's display name
- `passwordHash`: string | null - Hashed password (null for OAuth-only users)
- `emailVerified`: boolean - Whether email has been verified
- `googleId`: string | null - Google OAuth ID for OAuth users
- `createdAt`: DateTime - Account creation timestamp
- `updatedAt`: DateTime - Last profile update timestamp

#### TypeScript Interface

```typescript
interface User {
  id: string;
  email: string;
  name: string | null;
  passwordHash: string | null;
  emailVerified: boolean;
  googleId: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  surveys: Survey[];
}
```

#### Relationships

- **One-to-Many with Survey**: User owns multiple surveys (Survey.userId → User.id)

---

### Survey

**Purpose:** Represents a survey created by a user. Contains metadata and status, with questions stored as related entities.

**Key Attributes:**
- `id`: string (UUID) - Unique identifier
- `userId`: string - Foreign key to owning user
- `uniqueId`: string (unique, 8 chars) - Short, URL-safe ID for public links (/s/[uniqueId])
- `title`: string - Survey title displayed to creators and respondents
- `description`: string | null - Optional survey description/instructions
- `status`: enum - Survey lifecycle state: 'draft' | 'published' | 'archived'
- `createdAt`: DateTime - Survey creation timestamp
- `updatedAt`: DateTime - Last modification timestamp
- `publishedAt`: DateTime | null - When survey was first published

#### TypeScript Interface

```typescript
type SurveyStatus = 'draft' | 'published' | 'archived';

interface Survey {
  id: string;
  userId: string;
  uniqueId: string;
  title: string;
  description: string | null;
  status: SurveyStatus;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;

  // Relations
  user: User;
  questions: Question[];
  responses: Response[];
}
```

#### Relationships

- **Many-to-One with User**: Survey belongs to one user (Survey.userId → User.id)
- **One-to-Many with Question**: Survey has multiple questions (Question.surveyId → Survey.id)
- **One-to-Many with Response**: Survey receives multiple responses (Response.surveyId → Survey.id)

---

### Question

**Purpose:** Represents a single question within a survey. Supports multiple question types with flexible options and conditional logic.

**Key Attributes:**
- `id`: string (UUID) - Unique identifier
- `surveyId`: string - Foreign key to parent survey
- `type`: enum - Question type: 'multiple_choice' | 'text_input' | 'rating_scale' | 'checkbox' | 'dropdown' | 'yes_no'
- `text`: string - Question text displayed to respondents
- `options`: JSON - Question-specific options (e.g., choices for multiple choice, scale range for rating)
- `required`: boolean - Whether question must be answered
- `order`: number - Display order within survey (0-indexed)
- `logic`: JSON | null - Conditional logic rules for show/hide behavior
- `createdAt`: DateTime - Question creation timestamp

#### TypeScript Interface

```typescript
type QuestionType = 'multiple_choice' | 'text_input' | 'rating_scale' | 'checkbox' | 'dropdown' | 'yes_no';

interface QuestionOptions {
  // For multiple_choice, checkbox, dropdown
  choices?: string[];

  // For rating_scale
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;

  // For text_input
  variant?: 'short' | 'long';
  placeholder?: string;
}

interface ConditionalLogic {
  triggerQuestionId: string;
  condition: 'equals' | 'not_equals' | 'contains';
  value: string | string[];
}

interface Question {
  id: string;
  surveyId: string;
  type: QuestionType;
  text: string;
  options: QuestionOptions;
  required: boolean;
  order: number;
  logic: ConditionalLogic | null;
  createdAt: Date;

  // Relations
  survey: Survey;
}
```

#### Relationships

- **Many-to-One with Survey**: Question belongs to one survey (Question.surveyId → Survey.id)

---

### Response

**Purpose:** Stores a completed survey submission from a respondent. Contains all answers in JSON format for flexible querying and export.

**Key Attributes:**
- `id`: string (UUID) - Unique identifier
- `surveyId`: string - Foreign key to the survey being responded to
- `answers`: JSON - Complete response data mapping question IDs to answers
- `submittedAt`: DateTime - Response submission timestamp
- `ipAddress`: string | null - Respondent IP address (optional, for duplicate detection)
- `userAgent`: string | null - Respondent browser/device info (optional, for analytics)

#### TypeScript Interface

```typescript
interface Answer {
  questionId: string;
  answer: string | string[] | number;
}

interface Response {
  id: string;
  surveyId: string;
  answers: Answer[];
  submittedAt: Date;
  ipAddress: string | null;
  userAgent: string | null;

  // Relations
  survey: Survey;
}
```

#### Relationships

- **Many-to-One with Survey**: Response belongs to one survey (Response.surveyId → Survey.id)

---

## API Specification

### REST API Specification

```yaml
openapi: 3.0.0
info:
  title: Survey.fatihoune.com API
  version: 1.0.0
  description: RESTful API for survey creation, distribution, and analytics

servers:
  - url: https://survey.fatihoune.com/api
    description: Production server
  - url: http://localhost:3000/api
    description: Local development server

components:
  securitySchemes:
    sessionAuth:
      type: apiKey
      in: cookie
      name: session
      description: HTTP-only session cookie set by better-auth

  schemas:
    Error:
      type: object
      properties:
        error:
          type: object
          properties:
            code:
              type: string
            message:
              type: string
            details:
              type: object
            timestamp:
              type: string
              format: date-time
            requestId:
              type: string

    User:
      type: object
      properties:
        id:
          type: string
        email:
          type: string
        name:
          type: string
        createdAt:
          type: string
          format: date-time

    Survey:
      type: object
      properties:
        id:
          type: string
        uniqueId:
          type: string
        title:
          type: string
        description:
          type: string
        status:
          type: string
          enum: [draft, published, archived]
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    Question:
      type: object
      properties:
        id:
          type: string
        type:
          type: string
          enum: [multiple_choice, text_input, rating_scale, checkbox, dropdown, yes_no]
        text:
          type: string
        options:
          type: object
        required:
          type: boolean
        order:
          type: number
        logic:
          type: object

paths:
  # Authentication Endpoints
  /auth/register:
    post:
      summary: Register new user with email/password
      tags: [Authentication]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password, name]
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  minLength: 8
                name:
                  type: string
      responses:
        '201':
          description: User created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '400':
          description: Invalid input or email already exists
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /auth/login:
    post:
      summary: Login with email/password
      tags: [Authentication]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password]
              properties:
                email:
                  type: string
                password:
                  type: string
      responses:
        '200':
          description: Login successful, session cookie set
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '401':
          description: Invalid credentials
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /auth/logout:
    post:
      summary: Logout and clear session
      tags: [Authentication]
      security:
        - sessionAuth: []
      responses:
        '200':
          description: Logout successful
        '401':
          description: Not authenticated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /auth/callback/google:
    get:
      summary: Google OAuth callback handler
      tags: [Authentication]
      parameters:
        - name: code
          in: query
          required: true
          schema:
            type: string
      responses:
        '302':
          description: Redirect to dashboard after successful OAuth
        '400':
          description: OAuth error

  # Survey Endpoints
  /surveys:
    get:
      summary: List all surveys for authenticated user
      tags: [Surveys]
      security:
        - sessionAuth: []
      responses:
        '200':
          description: List of surveys
          content:
            application/json:
              schema:
                type: object
                properties:
                  surveys:
                    type: array
                    items:
                      $ref: '#/components/schemas/Survey'

    post:
      summary: Create a new survey
      tags: [Surveys]
      security:
        - sessionAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [title]
              properties:
                title:
                  type: string
                description:
                  type: string
      responses:
        '201':
          description: Survey created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Survey'

  /surveys/{surveyId}:
    get:
      summary: Get survey details
      tags: [Surveys]
      security:
        - sessionAuth: []
      parameters:
        - name: surveyId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Survey details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Survey'
        '404':
          description: Survey not found

    patch:
      summary: Update survey metadata
      tags: [Surveys]
      security:
        - sessionAuth: []
      parameters:
        - name: surveyId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                title:
                  type: string
                description:
                  type: string
                status:
                  type: string
                  enum: [draft, published, archived]
      responses:
        '200':
          description: Survey updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Survey'

    delete:
      summary: Delete survey
      tags: [Surveys]
      security:
        - sessionAuth: []
      parameters:
        - name: surveyId
          in: path
          required: true
          schema:
            type: string
      responses:
        '204':
          description: Survey deleted
        '404':
          description: Survey not found

  /surveys/{surveyId}/questions:
    post:
      summary: Add question to survey
      tags: [Questions]
      security:
        - sessionAuth: []
      parameters:
        - name: surveyId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Question'
      responses:
        '201':
          description: Question created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Question'

  /surveys/{surveyId}/questions/{questionId}:
    patch:
      summary: Update question
      tags: [Questions]
      security:
        - sessionAuth: []
      parameters:
        - name: surveyId
          in: path
          required: true
          schema:
            type: string
        - name: questionId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Question'
      responses:
        '200':
          description: Question updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Question'

    delete:
      summary: Delete question
      tags: [Questions]
      security:
        - sessionAuth: []
      parameters:
        - name: surveyId
          in: path
          required: true
          schema:
            type: string
        - name: questionId
          in: path
          required: true
          schema:
            type: string
      responses:
        '204':
          description: Question deleted

  /surveys/{surveyId}/questions/reorder:
    patch:
      summary: Reorder questions in survey
      tags: [Questions]
      security:
        - sessionAuth: []
      parameters:
        - name: surveyId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                questionIds:
                  type: array
                  items:
                    type: string
      responses:
        '200':
          description: Questions reordered

  /surveys/{surveyId}/responses:
    post:
      summary: Submit survey response (public endpoint)
      tags: [Responses]
      parameters:
        - name: surveyId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                answers:
                  type: array
                  items:
                    type: object
                    properties:
                      questionId:
                        type: string
                      answer:
                        oneOf:
                          - type: string
                          - type: number
                          - type: array
                            items:
                              type: string
      responses:
        '201':
          description: Response submitted
        '400':
          description: Validation error (missing required questions)

    get:
      summary: Get all responses for survey (authenticated)
      tags: [Responses]
      security:
        - sessionAuth: []
      parameters:
        - name: surveyId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: List of responses
          content:
            application/json:
              schema:
                type: object
                properties:
                  responses:
                    type: array
                    items:
                      type: object

  /surveys/{surveyId}/analytics:
    get:
      summary: Get aggregated analytics for survey
      tags: [Analytics]
      security:
        - sessionAuth: []
      parameters:
        - name: surveyId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Analytics data
          content:
            application/json:
              schema:
                type: object
                properties:
                  totalResponses:
                    type: number
                  questionAnalytics:
                    type: array
                    items:
                      type: object

  /surveys/{surveyId}/export:
    get:
      summary: Export responses to CSV
      tags: [Export]
      security:
        - sessionAuth: []
      parameters:
        - name: surveyId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: CSV file
          content:
            text/csv:
              schema:
                type: string

  # User Endpoints
  /user/profile:
    get:
      summary: Get current user profile
      tags: [User]
      security:
        - sessionAuth: []
      responses:
        '200':
          description: User profile
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'

    patch:
      summary: Update user profile
      tags: [User]
      security:
        - sessionAuth: []
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                password:
                  type: string
                currentPassword:
                  type: string
      responses:
        '200':
          description: Profile updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'

  /dashboard/stats:
    get:
      summary: Get dashboard overview statistics
      tags: [Dashboard]
      security:
        - sessionAuth: []
      responses:
        '200':
          description: Dashboard statistics
          content:
            application/json:
              schema:
                type: object
                properties:
                  totalSurveys:
                    type: number
                  totalResponses:
                    type: number
                  surveysPublished:
                    type: number
```

---

## Components

### Frontend Components

#### Survey Builder Component
**Responsibility:** Provides the core drag-and-drop survey creation interface with real-time preview and question editing.

**Key Interfaces:**
- `<SurveyBuilder surveyId={string}>` - Main survey builder container
- `<QuestionPalette onAddQuestion={handler}>` - Question type selector
- `<QuestionEditor question={Question} onUpdate={handler}>` - Individual question editor
- `<QuestionList questions={Question[]} onReorder={handler}>` - Drag-drop question list

**Dependencies:** Survey API, shadcn/ui components (drag-drop from dnd-kit), Zod validation

**Technology Stack:** React 19, TypeScript, @dnd-kit/core for drag-and-drop, React Hook Form for question forms

---

#### Dashboard Component
**Responsibility:** Displays user's survey list with status badges, metrics, and quick actions (edit, duplicate, archive, view responses).

**Key Interfaces:**
- `<Dashboard>` - Main dashboard container fetching user surveys
- `<SurveyCard survey={Survey} onAction={handler}>` - Individual survey card with metrics
- `<EmptyState onCreate={handler}>` - Empty state when no surveys exist

**Dependencies:** Survey API, Dashboard Stats API

**Technology Stack:** React 19, TypeScript, shadcn/ui Card components, tanstack/react-query for data fetching

---

#### Public Survey Component
**Responsibility:** Renders survey for respondents with question rendering, conditional logic evaluation, and submission handling.

**Key Interfaces:**
- `<PublicSurvey uniqueId={string}>` - Main public survey view
- `<QuestionRenderer question={Question} onChange={handler}>` - Renders question based on type
- `<ConditionalLogicEvaluator logic={Logic} answers={Answers}>` - Evaluates show/hide logic

**Dependencies:** Survey API (public endpoint), Response API

**Technology Stack:** React 19, TypeScript, React Hook Form, Zod validation

---

#### Analytics Dashboard Component
**Responsibility:** Visualizes survey response data with charts (bar, pie) and provides data table view with filtering.

**Key Interfaces:**
- `<AnalyticsDashboard surveyId={string}>` - Main analytics container
- `<QuestionChart question={Question} data={AnalyticsData}>` - Chart renderer per question
- `<ResponseTable responses={Response[]} onFilter={handler}>` - Tabular response view

**Dependencies:** Analytics API, Recharts library, Papa Parse for CSV export

**Technology Stack:** React 19, TypeScript, Recharts, shadcn/ui Table components

---

### Backend Components

#### Authentication Service
**Responsibility:** Handles user registration, login (email/password and OAuth), session management, and password resets.

**Key Interfaces:**
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate user and create session
- `POST /api/auth/logout` - Destroy session
- `GET /api/auth/callback/google` - OAuth callback handler

**Dependencies:** better-auth library, Prisma (User model), Email service

**Technology Stack:** Next.js API Routes, better-auth, Prisma ORM, bcrypt for password hashing

---

#### Survey Management Service
**Responsibility:** CRUD operations for surveys and questions, including draft/publish status management and conditional logic storage.

**Key Interfaces:**
- `GET /api/surveys` - List user's surveys
- `POST /api/surveys` - Create new survey
- `PATCH /api/surveys/[id]` - Update survey metadata/status
- `POST /api/surveys/[id]/questions` - Add question
- `PATCH /api/surveys/[id]/questions/[qid]` - Update question
- `DELETE /api/surveys/[id]/questions/[qid]` - Delete question

**Dependencies:** Prisma (Survey, Question models), Auth middleware

**Technology Stack:** Next.js API Routes, Prisma ORM, Zod validation

---

#### Response Collection Service
**Responsibility:** Accepts and validates survey responses from public endpoints, stores in database with timestamp and metadata.

**Key Interfaces:**
- `POST /api/surveys/[id]/responses` - Submit response (public, no auth)
- `GET /api/surveys/[id]/responses` - Fetch responses (authenticated, owner only)

**Dependencies:** Prisma (Response model), Zod validation, Rate limiting middleware

**Technology Stack:** Next.js API Routes, Prisma ORM, Zod validation

---

#### Analytics Aggregation Service
**Responsibility:** Aggregates response data for analytics dashboard, calculates distributions for charts, and generates CSV exports.

**Key Interfaces:**
- `GET /api/surveys/[id]/analytics` - Get aggregated analytics data
- `GET /api/surveys/[id]/export` - Export responses to CSV
- `GET /api/dashboard/stats` - Get user-level statistics

**Dependencies:** Prisma (Response model), Papa Parse for CSV generation

**Technology Stack:** Next.js API Routes, Prisma ORM with aggregation queries, Papa Parse

---

### Component Diagrams

```mermaid
graph TB
    subgraph "Frontend Components"
        Dashboard[Dashboard Component]
        SurveyBuilder[Survey Builder Component]
        PublicSurvey[Public Survey Component]
        Analytics[Analytics Component]
        Auth[Auth Components]
    end

    subgraph "API Layer"
        AuthAPI[Authentication Service]
        SurveyAPI[Survey Management Service]
        ResponseAPI[Response Collection Service]
        AnalyticsAPI[Analytics Aggregation Service]
    end

    subgraph "Data Layer"
        Prisma[Prisma ORM]
        DB[(PostgreSQL)]
    end

    Dashboard --> SurveyAPI
    SurveyBuilder --> SurveyAPI
    PublicSurvey --> ResponseAPI
    Analytics --> AnalyticsAPI
    Auth --> AuthAPI

    AuthAPI --> Prisma
    SurveyAPI --> Prisma
    ResponseAPI --> Prisma
    AnalyticsAPI --> Prisma

    Prisma --> DB
```

---

## External APIs

### Google OAuth API

- **Purpose:** Provide "Sign in with Google" authentication for user convenience
- **Documentation:** https://developers.google.com/identity/protocols/oauth2
- **Base URL(s):** https://accounts.google.com/o/oauth2/v2/auth, https://oauth2.googleapis.com/token
- **Authentication:** OAuth 2.0 (Client ID and Client Secret configured in better-auth)
- **Rate Limits:** None specified for basic OAuth flow

**Key Endpoints Used:**
- `GET /o/oauth2/v2/auth` - Initiates OAuth consent flow
- `POST /token` - Exchanges authorization code for access token
- `GET /tokeninfo` - Validates access token (used by better-auth)

**Integration Notes:** better-auth handles the complete OAuth flow. Developer must create OAuth credentials in Google Cloud Console and configure in environment variables (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET).

---

### Resend/SendGrid Email API

- **Purpose:** Send transactional emails for account verification, password resets, and future email distribution feature
- **Documentation:** https://resend.com/docs (or https://docs.sendgrid.com)
- **Base URL(s):** https://api.resend.com (or https://api.sendgrid.com)
- **Authentication:** API Key (header: `Authorization: Bearer {API_KEY}`)
- **Rate Limits:** Resend free tier: 100 emails/day; SendGrid free tier: 100 emails/day

**Key Endpoints Used:**
- `POST /emails` - Send transactional email

**Integration Notes:** MVP uses email sparingly (account verification, password reset). Phase 2 will add survey distribution via email. Choose Resend for better DX or SendGrid for higher volume needs.

---

## Core Workflows

### Survey Creation Workflow

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant Dashboard
    participant SurveyAPI
    participant Prisma
    participant DB

    User->>Browser: Click "Create New Survey"
    Browser->>Dashboard: Open create modal
    User->>Dashboard: Enter title and description
    Dashboard->>SurveyAPI: POST /api/surveys {title, description}
    SurveyAPI->>Prisma: prisma.survey.create()
    Prisma->>DB: INSERT INTO surveys
    DB-->>Prisma: Survey record
    Prisma-->>SurveyAPI: Survey object
    SurveyAPI-->>Dashboard: 201 Created {survey}
    Dashboard->>Browser: Navigate to /surveys/[id]/edit
    Browser->>User: Display survey builder (empty state)
```

### Survey Response Submission Workflow

```mermaid
sequenceDiagram
    actor Respondent
    participant Browser
    participant PublicSurvey
    participant ResponseAPI
    participant Prisma
    participant DB

    Respondent->>Browser: Open /s/[uniqueId]
    Browser->>PublicSurvey: Fetch survey data
    PublicSurvey->>ResponseAPI: GET /api/surveys/[uniqueId] (public)
    ResponseAPI->>Prisma: prisma.survey.findUnique()
    Prisma->>DB: SELECT * FROM surveys WHERE uniqueId=?
    DB-->>Prisma: Survey + Questions
    Prisma-->>ResponseAPI: Survey object
    ResponseAPI-->>PublicSurvey: Survey data
    PublicSurvey-->>Browser: Render questions

    Respondent->>Browser: Fill out survey
    Browser->>PublicSurvey: Evaluate conditional logic
    PublicSurvey->>Browser: Show/hide questions

    Respondent->>Browser: Click "Submit"
    Browser->>PublicSurvey: Validate required questions
    alt Validation fails
        PublicSurvey-->>Browser: Show validation errors
        Browser-->>Respondent: Display errors inline
    else Validation passes
        PublicSurvey->>ResponseAPI: POST /api/surveys/[id]/responses {answers}
        ResponseAPI->>Prisma: prisma.response.create()
        Prisma->>DB: INSERT INTO responses
        DB-->>Prisma: Response record
        Prisma-->>ResponseAPI: Response object
        ResponseAPI-->>PublicSurvey: 201 Created
        PublicSurvey->>Browser: Navigate to thank you page
        Browser-->>Respondent: "Thank you! Your response has been recorded."
    end
```

### Analytics Generation Workflow

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant Analytics
    participant AnalyticsAPI
    participant Prisma
    participant DB

    User->>Browser: Navigate to /surveys/[id] -> Analytics tab
    Browser->>Analytics: Load analytics component
    Analytics->>AnalyticsAPI: GET /api/surveys/[id]/analytics
    AnalyticsAPI->>Prisma: Fetch all responses for survey
    Prisma->>DB: SELECT * FROM responses WHERE surveyId=?
    DB-->>Prisma: Array of responses
    Prisma-->>AnalyticsAPI: Responses array

    AnalyticsAPI->>AnalyticsAPI: Aggregate data by question
    Note over AnalyticsAPI: Calculate counts for each option<br/>Calculate percentages<br/>Group text responses

    AnalyticsAPI-->>Analytics: Analytics data {questionId: stats}
    Analytics->>Browser: Render charts (Recharts)
    Browser-->>User: Display visualizations
```

---

## Database Schema

```prisma
// Prisma schema file - prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  passwordHash  String?   // Null for OAuth-only users
  emailVerified Boolean   @default(false)
  googleId      String?   @unique
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  surveys       Survey[]
  organizationMembers OrganizationMember[]
  sentInvitations     OrganizationInvitation[] @relation("InvitationInviter")
  receivedInvitations OrganizationInvitation[] @relation("InvitationInvitee")

  @@index([email])
  @@index([googleId])
}

model Organization {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?  @db.Text
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  members     OrganizationMember[]
  surveys     Survey[]
  roles       Role[]
  invitations OrganizationInvitation[]

  @@index([slug])
}

model OrganizationMember {
  id             String       @id @default(cuid())
  organizationId String
  userId         String
  roleId         String
  joinedAt       DateTime     @default(now())

  // Relations
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  role           Role         @relation(fields: [roleId], references: [id], onDelete: Restrict)

  @@unique([organizationId, userId])
  @@index([userId])
  @@index([organizationId])
  @@index([roleId])
}

model Role {
  id             String       @id @default(cuid())
  organizationId String?      // Null for system roles
  name           String
  description    String?      @db.Text
  isSystemRole   Boolean      @default(false)
  createdAt      DateTime     @default(now())

  // Relations
  organization   Organization?           @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  members        OrganizationMember[]
  permissions    RolePermission[]

  @@unique([organizationId, name])
  @@index([organizationId])
}

model Permission {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?  @db.Text
  category    String   // e.g., "organization", "surveys", "analytics", "data"

  // Relations
  roles       RolePermission[]

  @@index([category])
}

model RolePermission {
  roleId       String
  permissionId String

  // Relations
  role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@id([roleId, permissionId])
  @@index([roleId])
  @@index([permissionId])
}

model OrganizationInvitation {
  id             String       @id @default(cuid())
  organizationId String
  inviterId      String
  inviteeEmail   String
  roleId         String
  token          String       @unique
  expiresAt      DateTime
  createdAt      DateTime     @default(now())

  // Relations
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  inviter        User         @relation("InvitationInviter", fields: [inviterId], references: [id], onDelete: Cascade)

  @@index([organizationId])
  @@index([inviterId])
  @@index([inviteeEmail])
  @@index([token])
}

model Survey {
  id             String        @id @default(cuid())
  userId         String
  uniqueId       String        @unique @default(cuid()) // 8-char short ID for public URLs
  title          String
  description    String?       @db.Text
  status         SurveyStatus  @default(draft)
  organizationId String?       // Nullable - supports both personal and org surveys
  visibility     SurveyVisibility @default(organization)
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
  publishedAt    DateTime?

  // Relations
  user           User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization   Organization? @relation(fields: [organizationId], references: [id], onDelete: SetNull)
  questions      Question[]
  responses      Response[]

  @@index([userId])
  @@index([uniqueId])
  @@index([status])
  @@index([organizationId])
}

enum SurveyVisibility {
  private
  organization
}

enum SurveyStatus {
  draft
  published
  archived
}

model Question {
  id        String       @id @default(cuid())
  surveyId  String
  type      QuestionType
  text      String       @db.Text
  options   Json         // QuestionOptions type - flexible JSON for different question types
  required  Boolean      @default(false)
  order     Int          // 0-indexed order within survey
  logic     Json?        // ConditionalLogic type - nullable for questions without logic
  createdAt DateTime     @default(now())

  // Relations
  survey    Survey       @relation(fields: [surveyId], references: [id], onDelete: Cascade)

  @@index([surveyId])
  @@index([surveyId, order])
}

enum QuestionType {
  multiple_choice
  text_input
  rating_scale
  checkbox
  dropdown
  yes_no
}

model Response {
  id          String   @id @default(cuid())
  surveyId    String
  answers     Json     // Array of Answer objects - {questionId, answer}
  submittedAt DateTime @default(now())
  ipAddress   String?  // Optional for duplicate detection
  userAgent   String?  // Optional for analytics

  // Relations
  survey      Survey   @relation(fields: [surveyId], references: [id], onDelete: Cascade)

  @@index([surveyId])
  @@index([surveyId, submittedAt])
}
```

**Key Design Decisions:**

1. **CUID vs UUID**: Using CUID (Collision-resistant Unique Identifier) for better database performance and lexicographically sortable IDs
2. **JSON Fields**: `options`, `logic`, and `answers` use JSON for flexibility without requiring schema migrations for new question types
3. **Cascade Deletes**: Survey deletion cascades to questions and responses to maintain referential integrity
4. **Indexes**: Strategic indexes on frequently queried fields (userId, surveyId, uniqueId, status, order) for query performance
5. **Text Fields**: `description`, `text`, and other long-form content use `@db.Text` for PostgreSQL TEXT type (unlimited length)

---

## Frontend Architecture

### Component Architecture

#### Component Organization

```
/app
  /(auth)
    /login
      page.tsx                  # Login page (SSR)
    /register
      page.tsx                  # Registration page (SSR)
  /(dashboard)
    /dashboard
      page.tsx                  # Dashboard page (CSR)
    /surveys
      /[id]
        /edit
          page.tsx              # Survey builder page (CSR)
        page.tsx                # Survey analytics page (CSR)
    /settings
      page.tsx                  # Account settings (CSR)
  /s
    /[uniqueId]
      page.tsx                  # Public survey view (SSR)
  page.tsx                      # Landing page (SSR)
  layout.tsx                    # Root layout

/components
  /ui                           # shadcn/ui components (auto-generated)
    button.tsx
    card.tsx
    input.tsx
    ...
  /survey
    survey-builder.tsx          # Main builder component
    question-palette.tsx        # Question type selector
    question-editor.tsx         # Question editor
    question-list.tsx           # Drag-drop list
  /dashboard
    survey-card.tsx             # Survey card component
    empty-state.tsx             # Empty state
  /analytics
    chart-renderer.tsx          # Chart component
    response-table.tsx          # Data table
  /public
    public-survey.tsx           # Public survey container
    question-renderer.tsx       # Question renderer by type
  /shared
    navbar.tsx                  # Navigation bar
    protected-route.tsx         # Auth wrapper
```

#### Component Template

```typescript
// Example: components/survey/survey-builder.tsx

'use client';

import { useState } from 'react';
import { useSurvey } from '@/hooks/use-survey';
import { QuestionPalette } from './question-palette';
import { QuestionList } from './question-list';
import { Button } from '@/components/ui/button';
import type { Survey, Question } from '@/types/survey';

interface SurveyBuilderProps {
  surveyId: string;
}

export function SurveyBuilder({ surveyId }: SurveyBuilderProps) {
  const { survey, questions, isLoading, updateSurvey, addQuestion } = useSurvey(surveyId);
  const [isSaving, setIsSaving] = useState(false);

  if (isLoading) {
    return <div>Loading survey...</div>;
  }

  if (!survey) {
    return <div>Survey not found</div>;
  }

  const handlePublish = async () => {
    setIsSaving(true);
    await updateSurvey({ status: 'published' });
    setIsSaving(false);
  };

  return (
    <div className="container mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">{survey.title}</h1>
        <p className="text-muted-foreground">{survey.description}</p>
      </header>

      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-3">
          <QuestionPalette onAddQuestion={addQuestion} />
        </aside>

        <main className="col-span-9">
          <QuestionList
            questions={questions}
            surveyId={surveyId}
          />

          <div className="mt-6 flex gap-4">
            <Button variant="outline">Save as Draft</Button>
            <Button onClick={handlePublish} disabled={isSaving}>
              {isSaving ? 'Publishing...' : 'Publish Survey'}
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
```

---

### State Management Architecture

#### State Structure

```typescript
// lib/stores/survey-store.ts

import { create } from 'zustand';
import type { Survey, Question } from '@/types/survey';

interface SurveyState {
  currentSurvey: Survey | null;
  questions: Question[];
  unsavedChanges: boolean;

  // Actions
  setSurvey: (survey: Survey) => void;
  setQuestions: (questions: Question[]) => void;
  addQuestion: (question: Question) => void;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  reorderQuestions: (questionIds: string[]) => void;
  markAsSaved: () => void;
}

export const useSurveyStore = create<SurveyState>((set) => ({
  currentSurvey: null,
  questions: [],
  unsavedChanges: false,

  setSurvey: (survey) => set({ currentSurvey: survey }),
  setQuestions: (questions) => set({ questions }),
  addQuestion: (question) => set((state) => ({
    questions: [...state.questions, question],
    unsavedChanges: true,
  })),
  updateQuestion: (id, updates) => set((state) => ({
    questions: state.questions.map((q) =>
      q.id === id ? { ...q, ...updates } : q
    ),
    unsavedChanges: true,
  })),
  reorderQuestions: (questionIds) => set((state) => ({
    questions: questionIds.map((id) =>
      state.questions.find((q) => q.id === id)!
    ),
    unsavedChanges: true,
  })),
  markAsSaved: () => set({ unsavedChanges: false }),
}));
```

#### State Management Patterns

- **Server State**: Managed by tanstack/react-query for data fetching, caching, and synchronization
- **Client State**: Local component state via `useState` for ephemeral UI state (modals, form inputs)
- **Shared State**: Zustand store for cross-component state (survey builder state, unsaved changes)
- **Form State**: React Hook Form for form validation and submission
- **URL State**: Next.js router for navigation state and query parameters

---

### Routing Architecture

#### Route Organization

```
App Router Structure:
/                           → Landing page (public, SSR)
/(auth)/login               → Login page (public, SSR)
/(auth)/register            → Registration page (public, SSR)
/(dashboard)/dashboard      → Survey list dashboard (protected, CSR)
/(dashboard)/surveys/[id]/edit → Survey builder (protected, CSR)
/(dashboard)/surveys/[id]   → Survey analytics (protected, CSR)
/(dashboard)/settings       → Account settings (protected, CSR)
/(dashboard)/organizations/[id]/settings → Organization management (protected, CSR)
/invitations/[token]        → Invitation accept/decline page (public, SSR)
/s/[uniqueId]               → Public survey view (public, SSR)
/api/auth/[...route]        → Auth API routes
/api/organizations/*        → Organization API routes
/api/invitations/*          → Invitation API routes
/api/surveys/*              → Survey API routes
/api/user/*                 → User API routes
```

#### Protected Route Pattern

```typescript
// middleware.ts - Next.js middleware for route protection

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const session = await getSession(request);
  const { pathname } = request.nextUrl;

  // Protected routes require authentication
  const protectedRoutes = ['/dashboard', '/surveys', '/settings'];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !session) {
    // Redirect to login with return URL
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Auth routes redirect to dashboard if already logged in
  const authRoutes = ['/login', '/register'];
  const isAuthRoute = authRoutes.includes(pathname);

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

---

### Frontend Services Layer

#### API Client Setup

```typescript
// lib/api/client.ts

import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 10000,
  withCredentials: true, // Include cookies for session auth
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token (if using tokens instead of cookies)
apiClient.interceptors.request.use(
  (config) => {
    // Add any request modifications here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login on authentication error
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

#### Service Example

```typescript
// lib/api/survey-service.ts

import apiClient from './client';
import type { Survey, Question, CreateSurveyInput } from '@/types/survey';

export const surveyService = {
  // Get all surveys for current user
  async getSurveys(): Promise<Survey[]> {
    const response = await apiClient.get('/surveys');
    return response.data.surveys;
  },

  // Get single survey by ID
  async getSurvey(surveyId: string): Promise<Survey> {
    const response = await apiClient.get(`/surveys/${surveyId}`);
    return response.data;
  },

  // Create new survey
  async createSurvey(input: CreateSurveyInput): Promise<Survey> {
    const response = await apiClient.post('/surveys', input);
    return response.data;
  },

  // Update survey
  async updateSurvey(
    surveyId: string,
    updates: Partial<Survey>
  ): Promise<Survey> {
    const response = await apiClient.patch(`/surveys/${surveyId}`, updates);
    return response.data;
  },

  // Delete survey
  async deleteSurvey(surveyId: string): Promise<void> {
    await apiClient.delete(`/surveys/${surveyId}`);
  },

  // Add question to survey
  async addQuestion(surveyId: string, question: Omit<Question, 'id'>): Promise<Question> {
    const response = await apiClient.post(
      `/surveys/${surveyId}/questions`,
      question
    );
    return response.data;
  },

  // Update question
  async updateQuestion(
    surveyId: string,
    questionId: string,
    updates: Partial<Question>
  ): Promise<Question> {
    const response = await apiClient.patch(
      `/surveys/${surveyId}/questions/${questionId}`,
      updates
    );
    return response.data;
  },

  // Delete question
  async deleteQuestion(surveyId: string, questionId: string): Promise<void> {
    await apiClient.delete(`/surveys/${surveyId}/questions/${questionId}`);
  },

  // Reorder questions
  async reorderQuestions(
    surveyId: string,
    questionIds: string[]
  ): Promise<void> {
    await apiClient.patch(`/surveys/${surveyId}/questions/reorder`, {
      questionIds,
    });
  },
};
```

---

## Backend Architecture

### Service Architecture

#### Function Organization (Serverless - Next.js API Routes)

```
/app/api
  /auth
    /register
      route.ts              # POST - User registration
    /login
      route.ts              # POST - User login
    /logout
      route.ts              # POST - User logout
    /callback
      /google
        route.ts            # GET - Google OAuth callback
  /organizations
    route.ts                # GET - List user's organizations, POST - Create organization
    /[id]
      route.ts              # GET - Get organization, PATCH - Update, DELETE - Delete
      /members
        route.ts            # GET - List members, POST - Invite member
        /[memberId]
          route.ts          # PATCH - Update member role, DELETE - Remove member
      /roles
        route.ts            # GET - List roles, POST - Create custom role
        /[roleId]
          route.ts          # GET - Get role, PATCH - Update role, DELETE - Delete role
      /invitations
        route.ts            # POST - Send invitation, GET - List pending invitations
        /[invitationId]
          route.ts          # DELETE - Cancel invitation
      /leave
        route.ts            # POST - Leave organization
  /invitations
    /[token]
      /accept
        route.ts            # POST - Accept invitation
      /decline
        route.ts            # POST - Decline invitation
  /surveys
    route.ts                # GET - List surveys, POST - Create survey
    /[id]
      route.ts              # GET - Get survey, PATCH - Update, DELETE - Delete
      /questions
        route.ts            # POST - Add question
        /[qid]
          route.ts          # PATCH - Update question, DELETE - Delete
        /reorder
          route.ts          # PATCH - Reorder questions
      /responses
        route.ts            # GET - List responses (auth), POST - Submit response (public)
      /analytics
        route.ts            # GET - Get analytics
      /export
        route.ts            # GET - Export to CSV
  /user
    /profile
      route.ts              # GET - Get profile, PATCH - Update profile
  /dashboard
    /stats
      route.ts              # GET - Dashboard statistics
```

#### Function Template

```typescript
// app/api/surveys/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { createErrorResponse } from '@/lib/errors';

// Validation schema
const createSurveySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
});

// GET /api/surveys - List all surveys for authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const surveys = await prisma.survey.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { responses: true },
        },
      },
    });

    return NextResponse.json({ surveys }, { status: 200 });
  } catch (error) {
    console.error('Error fetching surveys:', error);
    return createErrorResponse('Failed to fetch surveys', 500);
  }
}

// POST /api/surveys - Create new survey
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const validatedData = createSurveySchema.parse(body);

    const survey = await prisma.survey.create({
      data: {
        userId: user.id,
        title: validatedData.title,
        description: validatedData.description,
        uniqueId: generateUniqueId(), // 8-char unique ID for public URLs
        status: 'draft',
      },
    });

    return NextResponse.json(survey, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse('Validation error', 400, error.errors);
    }
    console.error('Error creating survey:', error);
    return createErrorResponse('Failed to create survey', 500);
  }
}

// Helper function to generate unique ID
function generateUniqueId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
```

---

### Database Architecture

#### Schema Design

*See Database Schema section above for complete Prisma schema*

#### Data Access Layer (Repository Pattern)

```typescript
// lib/repositories/survey-repository.ts

import { prisma } from '@/lib/prisma';
import type { Survey, SurveyStatus, Prisma } from '@prisma/client';

export class SurveyRepository {
  // Find surveys by user ID
  async findByUserId(userId: string): Promise<Survey[]> {
    return prisma.survey.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { responses: true },
        },
      },
    });
  }

  // Find survey by unique ID (for public access)
  async findByUniqueId(uniqueId: string): Promise<Survey | null> {
    return prisma.survey.findUnique({
      where: { uniqueId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  // Find survey by ID with authorization check
  async findByIdForUser(surveyId: string, userId: string): Promise<Survey | null> {
    return prisma.survey.findFirst({
      where: {
        id: surveyId,
        userId,
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  // Create survey
  async create(data: {
    userId: string;
    title: string;
    description?: string;
    uniqueId: string;
  }): Promise<Survey> {
    return prisma.survey.create({
      data: {
        ...data,
        status: 'draft',
      },
    });
  }

  // Update survey
  async update(
    surveyId: string,
    updates: Partial<Pick<Survey, 'title' | 'description' | 'status'>>
  ): Promise<Survey> {
    return prisma.survey.update({
      where: { id: surveyId },
      data: updates,
    });
  }

  // Delete survey (cascades to questions and responses)
  async delete(surveyId: string): Promise<void> {
    await prisma.survey.delete({
      where: { id: surveyId },
    });
  }

  // Get response count for survey
  async getResponseCount(surveyId: string): Promise<number> {
    return prisma.response.count({
      where: { surveyId },
    });
  }
}

export const surveyRepository = new SurveyRepository();
```

---

### Authentication and Authorization

#### Auth Flow

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant Middleware
    participant AuthAPI
    participant BetterAuth
    participant DB

    User->>Browser: Enter email/password
    Browser->>AuthAPI: POST /api/auth/login
    AuthAPI->>BetterAuth: auth.signIn({email, password})
    BetterAuth->>DB: SELECT * FROM users WHERE email=?
    DB-->>BetterAuth: User record
    BetterAuth->>BetterAuth: Verify password hash
    alt Password valid
        BetterAuth->>DB: INSERT INTO sessions
        DB-->>BetterAuth: Session record
        BetterAuth-->>AuthAPI: Session + Set-Cookie header
        AuthAPI-->>Browser: 200 OK + session cookie
        Browser->>Browser: Store HTTP-only cookie
        Browser->>User: Redirect to /dashboard
    else Password invalid
        BetterAuth-->>AuthAPI: Error
        AuthAPI-->>Browser: 401 Unauthorized
        Browser->>User: Display error message
    end

    Note over User,DB: Subsequent Requests

    User->>Browser: Navigate to /dashboard
    Browser->>Middleware: Request + session cookie
    Middleware->>BetterAuth: auth.getSession(cookie)
    BetterAuth->>DB: SELECT * FROM sessions WHERE id=?
    alt Session valid
        DB-->>BetterAuth: Session + User
        BetterAuth-->>Middleware: User object
        Middleware-->>Browser: Allow access
        Browser->>User: Show dashboard
    else Session invalid/expired
        BetterAuth-->>Middleware: null
        Middleware-->>Browser: 302 Redirect to /login
        Browser->>User: Show login page
    end
```

#### Middleware/Guards

```typescript
// lib/auth.ts - Authentication utilities

import { cookies } from 'next/headers';
import { auth } from '@/lib/better-auth';
import type { User } from '@prisma/client';

// Get current user from session
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session');

  if (!sessionCookie) {
    return null;
  }

  try {
    const session = await auth.getSession(sessionCookie.value);
    return session?.user || null;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

// Require authentication or throw error
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

// Check if user owns resource
export async function requireOwnership(
  resourceUserId: string
): Promise<User> {
  const user = await requireAuth();

  if (user.id !== resourceUserId) {
    throw new Error('Forbidden');
  }

  return user;
}
```

---

## Unified Project Structure

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

## Development Workflow

### Local Development Setup

#### Prerequisites

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

#### Initial Setup

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

#### Development Commands

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

### Environment Configuration

#### Required Environment Variables

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

## Deployment Architecture

### Deployment Strategy

**Frontend Deployment:**
- **Platform (Dev):** Vercel (automatic deployment on git push to `dev` branch)
- **Platform (Prod):** Self-hosted (Docker container on VPS/dedicated server)
- **Build Command:** `pnpm build`
- **Output Directory:** `.next` (Next.js build output)
- **CDN/Edge:** Vercel Edge Network (dev), Cloudflare or self-managed nginx (prod)

**Backend Deployment:**
- **Platform (Dev):** Vercel Serverless Functions (API routes deployed with frontend)
- **Platform (Prod):** Self-hosted Node.js server running Next.js in standalone mode
- **Build Command:** `pnpm build`
- **Deployment Method:** Docker container with Node.js 18+ runtime

**Database:**
- **Dev:** Railway PostgreSQL or Supabase (managed service)
- **Prod:** Self-managed PostgreSQL on same VPS or separate database server

---

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yaml

name: CI

on:
  push:
    branches: [dev, main]
  pull_request:
    branches: [dev, main]

jobs:
  lint-and-type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Run ESLint
        run: pnpm lint
      - name: Run TypeScript type check
        run: pnpm tsc --noEmit
      - name: Generate Prisma Client
        run: pnpm prisma generate

  # Phase 2: Add test job
  # test:
  #   runs-on: ubuntu-latest
  #   steps:
  #     - uses: actions/checkout@v3
  #     - uses: pnpm/action-setup@v2
  #       with:
  #         version: 8
  #     - uses: actions/setup-node@v3
  #       with:
  #         node-version: 18
  #         cache: 'pnpm'
  #     - name: Install dependencies
  #       run: pnpm install --frozen-lockfile
  #     - name: Run tests
  #       run: pnpm test:ci
```

```yaml
# .github/workflows/deploy-prod.yaml

name: Deploy Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build application
        run: pnpm build

      - name: Build Docker image
        run: docker build -t survey-app:${{ github.sha }} .

      - name: Push to registry (optional)
        run: |
          echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
          docker tag survey-app:${{ github.sha }} username/survey-app:latest
          docker push username/survey-app:latest

      - name: Deploy to production server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.PROD_SERVER_HOST }}
          username: ${{ secrets.PROD_SERVER_USER }}
          key: ${{ secrets.PROD_SERVER_SSH_KEY }}
          script: |
            cd /opt/survey-app
            docker pull username/survey-app:latest
            docker-compose down
            docker-compose up -d
            docker-compose exec app pnpm prisma migrate deploy
```

---

### Environments

| Environment | Frontend URL | Backend URL | Purpose |
|-------------|--------------|-------------|---------|
| Development | http://localhost:3000 | http://localhost:3000/api | Local development |
| Staging | https://dev-survey.fatihoune.com | https://dev-survey.fatihoune.com/api | Pre-production testing on Vercel |
| Production | https://survey.fatihoune.com | https://survey.fatihoune.com/api | Live environment (self-hosted) |

---

## Security and Performance

### Security Requirements

**Frontend Security:**
- **CSP Headers:** Content-Security-Policy configured via next.config.mjs to restrict script sources and prevent XSS
  ```
  default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
  ```
- **XSS Prevention:** All user inputs sanitized via DOMPurify before rendering HTML; React's built-in escaping for JSX
- **Secure Storage:** Sensitive data never stored in localStorage; HTTP-only cookies for sessions

**Backend Security:**
- **Input Validation:** All API inputs validated with Zod schemas before processing
- **Rate Limiting:** Upstash Rate Limit or custom middleware limiting to 100 requests/minute per IP for public endpoints, 1000 requests/minute for authenticated endpoints
- **CORS Policy:**
  ```typescript
  {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true
  }
  ```

**Authentication Security:**
- **Token Storage:** Session tokens stored in HTTP-only, Secure, SameSite=Lax cookies
- **Session Management:** Sessions expire after 7 days of inactivity; refresh on each request
- **Password Policy:** Minimum 8 characters, requires at least one number and one special character; passwords hashed with bcrypt (cost factor 12)

**Database Security:**
- **Parameterized Queries:** All queries through Prisma ORM using parameterized queries (SQL injection prevention)
- **Encryption at Rest:** PostgreSQL configured with encryption at rest (via cloud provider or LUKS for self-hosted)
- **Connection Security:** Database connections over SSL/TLS only

---

### Performance Optimization

**Frontend Performance:**
- **Bundle Size Target:** Initial bundle < 200KB gzipped (achievable via code splitting and tree shaking)
- **Loading Strategy:**
  - Critical CSS inlined
  - Code splitting by route with Next.js automatic splitting
  - Lazy loading for analytics charts (Recharts) and non-critical components
  - Image optimization via Next.js `<Image>` component
- **Caching Strategy:**
  - Static assets cached with `Cache-Control: public, max-age=31536000, immutable`
  - API responses cached with tanstack/react-query (5-minute stale time for survey lists, 1-minute for analytics)
  - Service Worker for offline survey viewing (Phase 2)

**Backend Performance:**
- **Response Time Target:**
  - Survey list: < 200ms
  - Survey detail: < 150ms
  - Response submission: < 300ms
  - Analytics aggregation: < 500ms
- **Database Optimization:**
  - Indexes on frequently queried columns (userId, surveyId, uniqueId, status)
  - Connection pooling via Prisma (pool size: 10 connections)
  - Query optimization with Prisma's `select` and `include` to fetch only needed fields
  - Pagination for large datasets (50 responses per page)
- **Caching Strategy:**
  - Redis cache for aggregated analytics (15-minute TTL) - Phase 2
  - In-memory cache for survey templates (LRU cache, max 100 items)
  - Database query result caching via Prisma Accelerate (future consideration)

---

## Testing Strategy

### Testing Pyramid

```
        E2E Tests
        /        \
   Integration Tests
   /                \
Frontend Unit    Backend Unit
```

**MVP Testing Philosophy:** Manual testing + TypeScript type safety for speed. Automated testing added progressively as product validates.

---

### Test Organization

#### Frontend Tests (Phase 2)

```
/tests
  /components
    /survey
      survey-builder.test.tsx
      question-editor.test.tsx
    /dashboard
      survey-card.test.tsx
  /hooks
    use-survey.test.ts
  /lib
    validation.test.ts
```

#### Backend Tests (Phase 2)

```
/tests
  /api
    /surveys
      create-survey.test.ts
      update-survey.test.ts
      delete-survey.test.ts
    /auth
      register.test.ts
      login.test.ts
  /repositories
    survey-repository.test.ts
```

#### E2E Tests (Phase 3)

```
/e2e
  /flows
    survey-creation.spec.ts
    response-submission.spec.ts
    analytics-viewing.spec.ts
  /fixtures
    test-surveys.json
```

---

### Test Examples

#### Frontend Component Test

```typescript
// tests/components/survey/question-editor.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { QuestionEditor } from '@/components/survey/question-editor';
import { Question } from '@/types/survey';

describe('QuestionEditor', () => {
  const mockQuestion: Question = {
    id: '1',
    surveyId: 'survey-1',
    type: 'multiple_choice',
    text: 'What is your favorite color?',
    options: { choices: ['Red', 'Blue', 'Green'] },
    required: false,
    order: 0,
    logic: null,
    createdAt: new Date(),
  };

  it('renders question text', () => {
    render(<QuestionEditor question={mockQuestion} onUpdate={jest.fn()} />);
    expect(screen.getByDisplayValue('What is your favorite color?')).toBeInTheDocument();
  });

  it('calls onUpdate when question text changes', () => {
    const onUpdate = jest.fn();
    render(<QuestionEditor question={mockQuestion} onUpdate={onUpdate} />);

    const input = screen.getByDisplayValue('What is your favorite color?');
    fireEvent.change(input, { target: { value: 'What is your favorite color now?' } });

    expect(onUpdate).toHaveBeenCalledWith({
      ...mockQuestion,
      text: 'What is your favorite color now?',
    });
  });

  it('toggles required checkbox', () => {
    const onUpdate = jest.fn();
    render(<QuestionEditor question={mockQuestion} onUpdate={onUpdate} />);

    const checkbox = screen.getByRole('checkbox', { name: /required/i });
    fireEvent.click(checkbox);

    expect(onUpdate).toHaveBeenCalledWith({
      ...mockQuestion,
      required: true,
    });
  });
});
```

#### Backend API Test

```typescript
// tests/api/surveys/create-survey.test.ts

import { POST } from '@/app/api/surveys/route';
import { prisma } from '@/lib/prisma';
import { createMockRequest, createMockUser } from '@/tests/helpers';

jest.mock('@/lib/auth', () => ({
  getCurrentUser: jest.fn(),
}));

describe('POST /api/surveys', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a new survey with valid data', async () => {
    const mockUser = createMockUser();
    (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

    const request = createMockRequest({
      method: 'POST',
      body: {
        title: 'Customer Satisfaction Survey',
        description: 'Please rate your experience',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.title).toBe('Customer Satisfaction Survey');
    expect(data.userId).toBe(mockUser.id);
    expect(data.status).toBe('draft');
  });

  it('returns 401 for unauthenticated requests', async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue(null);

    const request = createMockRequest({
      method: 'POST',
      body: { title: 'Test Survey' },
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('returns 400 for invalid data', async () => {
    const mockUser = createMockUser();
    (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

    const request = createMockRequest({
      method: 'POST',
      body: { title: '' }, // Empty title should fail validation
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
```

#### E2E Test

```typescript
// e2e/flows/survey-creation.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Survey Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('user can create a survey end-to-end', async ({ page }) => {
    // Navigate to create survey
    await page.click('text=Create New Survey');

    // Fill in survey details
    await page.fill('input[name="title"]', 'Employee Feedback Survey');
    await page.fill('textarea[name="description"]', 'Share your thoughts');
    await page.click('button:has-text("Create Survey")');

    // Wait for redirect to survey builder
    await page.waitForURL(/\/surveys\/.*\/edit/);

    // Add a multiple choice question
    await page.click('text=Add Question');
    await page.click('text=Multiple Choice');
    await page.fill('input[placeholder="Question text"]', 'How satisfied are you?');
    await page.fill('input[placeholder="Option 1"]', 'Very Satisfied');
    await page.fill('input[placeholder="Option 2"]', 'Satisfied');
    await page.click('text=+ Add Option');
    await page.fill('input[placeholder="Option 3"]', 'Dissatisfied');

    // Publish survey
    await page.click('button:has-text("Publish Survey")');
    await expect(page.locator('text=Survey published successfully')).toBeVisible();

    // Verify survey appears in dashboard
    await page.goto('/dashboard');
    await expect(page.locator('text=Employee Feedback Survey')).toBeVisible();
  });
});
```

---

## Coding Standards

### Critical Fullstack Rules

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

### Naming Conventions

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

## Error Handling Strategy

### Error Flow

```mermaid
sequenceDiagram
    participant Component
    participant Service
    participant API
    participant Backend

    Component->>Service: Call API method
    Service->>API: HTTP Request
    API->>Backend: Process request

    alt Success
        Backend-->>API: Success response
        API-->>Service: Data
        Service-->>Component: Data
    else Backend Error
        Backend-->>API: Error response
        API-->>Service: Throw error
        Service->>Service: Log error
        Service-->>Component: Throw formatted error
        Component->>Component: Display error toast/message
    end
```

### Error Response Format

```typescript
// lib/errors.ts

interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    requestId: string;
  };
}

export function createErrorResponse(
  message: string,
  status: number,
  details?: any
): NextResponse {
  const error: ApiError = {
    error: {
      code: getErrorCode(status),
      message,
      details,
      timestamp: new Date().toISOString(),
      requestId: generateRequestId(),
    },
  };

  return NextResponse.json(error, { status });
}

function getErrorCode(status: number): string {
  const codes: Record<number, string> = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    500: 'INTERNAL_SERVER_ERROR',
  };
  return codes[status] || 'UNKNOWN_ERROR';
}
```

---

### Frontend Error Handling

```typescript
// lib/api/survey-service.ts

import { toast } from '@/components/ui/use-toast';

export const surveyService = {
  async createSurvey(input: CreateSurveyInput): Promise<Survey> {
    try {
      const response = await apiClient.post('/surveys', input);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiError = error.response?.data?.error;

        // Log error for debugging
        console.error('Create survey error:', apiError);

        // Show user-friendly toast notification
        toast({
          title: 'Failed to create survey',
          description: apiError?.message || 'An unexpected error occurred',
          variant: 'destructive',
        });

        throw new Error(apiError?.message || 'Failed to create survey');
      }
      throw error;
    }
  },
};
```

---

### Backend Error Handling

```typescript
// app/api/surveys/route.ts

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const validatedData = createSurveySchema.parse(body);

    const survey = await prisma.survey.create({
      data: {
        userId: user.id,
        title: validatedData.title,
        description: validatedData.description,
        uniqueId: generateUniqueId(),
        status: 'draft',
      },
    });

    return NextResponse.json(survey, { status: 201 });
  } catch (error) {
    // Validation error (Zod)
    if (error instanceof z.ZodError) {
      return createErrorResponse('Validation error', 400, {
        fields: error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    // Prisma unique constraint error
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return createErrorResponse('Duplicate entry', 409);
      }
    }

    // Generic error
    console.error('Unexpected error in POST /api/surveys:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
```

---

## Monitoring and Observability

### Monitoring Stack

- **Frontend Monitoring:** PostHog for user analytics, feature tracking, and session replays
- **Backend Monitoring:** Pino structured logging to stdout/file; Sentry for error tracking (Phase 2)
- **Error Tracking:** Sentry for both frontend and backend error aggregation (Phase 2)
- **Performance Monitoring:** Next.js built-in analytics, Lighthouse CI for performance budgets

---

### Key Metrics

**Frontend Metrics:**
- **Core Web Vitals:**
  - Largest Contentful Paint (LCP) < 2.5s
  - First Input Delay (FID) < 100ms
  - Cumulative Layout Shift (CLS) < 0.1
- **JavaScript errors:** Track and alert on error rate > 1% of sessions
- **API response times:** Monitor P50, P95, P99 latencies for API calls
- **User interactions:** Track survey creation rate, publish rate, response submission rate

**Backend Metrics:**
- **Request rate:** Requests per second across all endpoints
- **Error rate:** 4xx and 5xx errors as percentage of total requests (target < 1%)
- **Response time:** P50 < 200ms, P95 < 500ms, P99 < 1000ms
- **Database query performance:** Track slow queries (> 100ms) and N+1 query issues
- **Response submission rate:** Track spikes in response submissions (potential bot traffic)
- **Authentication success/failure rate:** Monitor auth endpoint failures

---

## Checklist Results Report

### Architecture Checklist Execution

✅ **High-Level Architecture Defined**: Monolithic Next.js application with SSR/CSR, API routes, PostgreSQL database documented
✅ **Tech Stack Finalized**: Comprehensive tech stack table with all technologies, versions, and rationales provided
✅ **Data Models Designed**: User, Survey, Question, Response models with TypeScript interfaces and relationships defined
✅ **API Specification Created**: Complete OpenAPI 3.0 REST API specification with all endpoints documented
✅ **Components Identified**: Frontend and backend components with responsibilities, interfaces, and dependencies specified
✅ **Database Schema Designed**: Complete Prisma schema with enums, relations, indexes, and constraints
✅ **Frontend Architecture Detailed**: Component organization, state management, routing, and services layer documented
✅ **Backend Architecture Detailed**: API routes organization, repository pattern, authentication flow defined
✅ **Project Structure Defined**: Comprehensive file/folder structure for entire monorepo
✅ **Development Workflow Documented**: Local setup, commands, environment variables specified
✅ **Deployment Strategy Defined**: CI/CD pipelines, Docker configuration, environment breakdown provided
✅ **Security Considered**: Authentication, authorization, input validation, XSS/SQL injection prevention detailed
✅ **Performance Optimized**: Bundle size targets, caching strategies, database optimization specified
✅ **Testing Strategy Outlined**: Progressive testing approach with examples for unit, integration, and E2E tests
✅ **Coding Standards Established**: Critical rules and naming conventions defined for consistency
✅ **Error Handling Unified**: Standard error format and handling patterns across frontend/backend
✅ **Monitoring Planned**: Metrics, logging, and observability strategy documented

---

**Architecture Status:** ✅ Complete and ready for Epic 1 implementation

**Next Steps:**
1. Review architecture document with stakeholders and development team
2. Set up development environment following "Local Development Setup" instructions
3. Initialize project structure as defined in "Unified Project Structure" section
4. Begin Epic 1, Story 1.1: Project Setup & Development Environment
5. Configure CI/CD pipelines using provided GitHub Actions workflows

---

**Document Version**: 1.0
**Last Updated**: 2025-11-01
**Status**: Complete - Ready for Development
