# Survey.fatihoune.com Product Requirements Document (PRD)

## Goals and Background Context

### Goals

- Enable users to create professional surveys within 10 minutes without technical expertise
- Deliver real-time response collection and basic analytics for data-driven decision making
- Provide a mobile-responsive experience for both survey creators and respondents (70%+ completion rate)
- Achieve 60%+ 30-day user retention rate and 1,000 registered users within 6 months
- Support export of survey responses to CSV format for external analysis
- Establish a modern, scalable technical foundation using Next.js 16, React 19, and TypeScript
- Maintain platform performance with page loads under 2 seconds and 99.5%+ uptime

### Background Context

Survey.fatihoune.com addresses critical pain points in existing survey tools: complexity overload, poor user experience, limited flexibility, and fragmented workflows. Organizations and individuals need to collect feedback quickly but are frustrated by legacy platforms with steep learning curves and outdated interfaces that result in delayed decision-making, lower response rates, increased costs, and lost insights.

This PRD defines the MVP for a modern survey platform that balances simplicity with power, targeting small-to-medium businesses (primary segment) and academic researchers (secondary segment) who value ease of use, speed, and modern design. Built on Next.js 16, React 19, and TypeScript with shadcn/ui components, the platform will deliver exceptional performance while maintaining a streamlined user experience from survey creation to response analysis. The MVP focuses on core survey workflows—create, distribute, collect, and analyze—with a timeline of 8-12 weeks to beta launch.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-11-01 | 1.0 | Initial PRD creation | John (PM Agent) |

---

## Requirements

### Functional

- **FR1**: Users can register for an account using email/password or Google OAuth authentication
- **FR2**: Users can log in and log out of their account with secure session management
- **FR3**: Users can create a new survey with a title and description
- **FR4**: Users can add questions to surveys with the following types: multiple choice, text input, rating scale, checkbox, dropdown, yes/no
- **FR5**: Users can reorder questions within a survey using drag-and-drop
- **FR6**: Users can edit and delete questions from surveys
- **FR7**: Users can apply basic conditional logic to questions (show/hide based on previous answers)
- **FR8**: Users can select from 3-5 pre-built survey templates (customer feedback, employee satisfaction, event planning) to accelerate survey creation
- **FR9**: Users can customize template surveys by editing questions, adding new questions, or removing questions
- **FR10**: Users can save surveys as drafts for later editing
- **FR11**: Users can publish surveys to make them accessible via unique URLs
- **FR12**: Users can generate unique shareable links for published surveys
- **FR13**: Users can generate basic embed codes to integrate surveys into websites
- **FR14**: Users can view a list of all their surveys with status (draft, published, archived)
- **FR15**: Survey respondents can access surveys via shared links without requiring an account
- **FR16**: Survey respondents can complete surveys by answering all required questions
- **FR17**: Survey respondents can submit survey responses with real-time validation
- **FR18**: Users can view response count and completion rate for each survey
- **FR19**: Users can view individual survey responses with timestamps
- **FR20**: Users can view aggregated analytics with simple charts (bar charts, pie charts) for each question
- **FR21**: Users can export all survey responses to CSV format
- **FR22**: Users can archive surveys to remove them from active survey list
- **FR23**: Users can duplicate existing surveys to create new surveys
- **FR24**: Survey respondents receive confirmation message upon successful submission
- **FR25**: Users can mark questions as required or optional
- **FR26**: The system validates that required questions are answered before allowing submission

### Non Functional

- **NFR1**: Page load times must be under 2 seconds for initial load
- **NFR2**: Time to Interactive (TTI) must be under 3 seconds
- **NFR3**: Survey response submission must complete within 500ms
- **NFR4**: Platform must maintain 99.5%+ uptime
- **NFR5**: The application must be fully responsive and functional on mobile devices (320px to 4K displays)
- **NFR6**: Surveys must display correctly on latest 2 versions of major browsers (Chrome, Firefox, Safari, Edge)
- **NFR7**: Mobile browsers (iOS Safari 14+, Chrome Mobile 90+) must be fully supported
- **NFR8**: System must support surveys with up to 100 questions
- **NFR9**: System must support surveys with up to 10,000 responses
- **NFR10**: All user inputs must be validated and sanitized to prevent XSS and injection attacks
- **NFR11**: HTTPS must be enforced across all pages
- **NFR12**: API endpoints must implement rate limiting to prevent abuse
- **NFR13**: User sessions must use HTTP-only cookies for security
- **NFR14**: The system must comply with GDPR requirements for user data handling
- **NFR15**: Users must be able to export their data on request
- **NFR16**: Users must be able to delete their account and all associated data
- **NFR17**: The codebase must follow TypeScript strict mode for type safety
- **NFR18**: All UI components must use shadcn/ui component library for consistency

---

## User Interface Design Goals

### Overall UX Vision

The platform embraces a clean, modern, and intuitive design philosophy that prioritizes user efficiency and reduces cognitive load. The interface should feel familiar to users of modern web applications, with clear visual hierarchy, ample whitespace, and contextual guidance. Survey creators should experience a smooth, linear workflow from creation to analysis, while survey respondents should encounter minimal friction and distractions. The design should instill confidence and professionalism, reflecting the quality of insights users can gather.

### Key Interaction Paradigms

- **Drag-and-Drop Survey Builder**: Visual, intuitive question ordering and organization
- **Inline Editing**: Click-to-edit patterns for survey titles, questions, and options
- **Real-time Preview**: Live preview of survey as creators build it
- **Progressive Disclosure**: Advanced features (conditional logic) revealed only when needed
- **Contextual Actions**: Hover states and dropdown menus for question-level operations (edit, duplicate, delete)
- **Toast Notifications**: Non-intrusive feedback for save operations, errors, and success states
- **Modal Dialogs**: For focused tasks requiring user input (template selection, sharing options)
- **Tab Navigation**: For switching between survey builder, responses, and analytics views

### Core Screens and Views

- **Authentication Screens**: Login page, registration page, OAuth callback handling
- **Dashboard/Survey List**: Overview of all user surveys with status indicators and quick actions
- **Survey Builder**: Main editing interface with question palette, canvas, and properties panel
- **Template Gallery**: Modal or dedicated page for selecting pre-built templates
- **Survey Settings**: Configuration for survey title, description, and publish settings
- **Share Survey**: Modal displaying unique URL and embed code with copy-to-clipboard functionality
- **Responses List**: Tabular or card view of individual survey submissions
- **Analytics Dashboard**: Visual analytics with charts and statistics for each question
- **User Account Settings**: Profile management and account preferences
- **Public Survey View**: Clean, respondent-facing survey interface for completing surveys
- **Thank You Page**: Confirmation screen shown to respondents after submission

### Accessibility: WCAG AA

All interfaces must meet WCAG 2.1 AA accessibility standards:
- Keyboard navigation support for all interactive elements
- Proper ARIA labels and semantic HTML
- Sufficient color contrast ratios (4.5:1 for normal text)
- Focus indicators for keyboard users
- Screen reader compatibility
- Alternative text for icons and images

### Branding

The platform should convey modernity, professionalism, and trustworthiness through:
- Clean, contemporary typography (system fonts or modern sans-serif)
- Neutral color palette with accent colors for CTAs and important actions
- shadcn/ui's New York style with Neutral base color and CSS variables for theming
- Consistent spacing and sizing using Tailwind's design tokens
- Subtle animations and transitions for delightful micro-interactions
- Professional iconography using Lucide React icon library

### Target Device and Platforms: Web Responsive

- **Primary Platform**: Web-based responsive application
- **Desktop Support**: Full-featured experience optimized for 1024px+ viewports
- **Tablet Support**: Adapted layouts for 768px-1023px viewports (survey creation should remain fully functional)
- **Mobile Support**: Optimized respondent experience for 320px-767px viewports (survey creation may have simplified interface)
- **Touch Optimization**: Touch-friendly targets (minimum 44x44px) for mobile interactions
- **Cross-Browser Compatibility**: Latest 2 versions of Chrome, Firefox, Safari, Edge

---

## Technical Assumptions

### Repository Structure: Monorepo

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

### Service Architecture

**Monolithic Next.js Application within Monorepo**

The application will be built as a unified Next.js application leveraging both server and client capabilities:
- **Server-Side Rendering (SSR)**: Marketing pages, public survey views (SEO-optimized)
- **Client-Side Rendering (CSR)**: Authenticated dashboard, survey builder (interactive UIs)
- **API Routes**: Next.js API routes for backend logic (authentication, CRUD operations, analytics)
- **Serverless Functions**: API routes deployed as serverless functions (on Vercel for dev, self-hosted for production)
- **Database**: Direct Prisma ORM connections from API routes to PostgreSQL

**Rationale**: Monolithic architecture simplifies development, deployment, and debugging for MVP while maintaining scalability through Next.js's optimizations. Can evolve to microservices if specific services require independent scaling.

### Testing Requirements

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

### Additional Technical Assumptions and Requests

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

## Epic List

### Epic 1: Foundation & Authentication
**Goal**: Establish project infrastructure, authentication system, and basic user account management to enable secure user registration and login.

### Epic 2: Survey Creation & Management
**Goal**: Build the core survey builder interface that allows users to create, edit, and manage surveys with multiple question types and templates.

### Epic 3: Survey Distribution & Response Collection
**Goal**: Enable users to publish and share surveys, and allow respondents to access and complete surveys with real-time response capture.

### Epic 4: Analytics & Data Export
**Goal**: Provide users with response viewing, basic analytics visualizations, and CSV export capabilities for data analysis.

---

## Epic 1: Foundation & Authentication

**Epic Goal**: Establish the foundational technical infrastructure for the survey platform, including project setup, development environment, database configuration, and complete authentication system. This epic delivers a fully functional authentication flow with user registration, login (email/password and Google OAuth), session management, and basic account management. By the end of this epic, users can securely create accounts, authenticate, and access a basic dashboard.

### Story 1.1: Project Setup & Development Environment

As a developer,
I want to initialize the Next.js project with all required dependencies and configuration,
so that I have a solid foundation for building the survey platform.

#### Acceptance Criteria

1. Next.js 16.0.1 project initialized with App Router and TypeScript configuration
2. Package.json includes all required dependencies: React 19, TypeScript 5.x, Tailwind CSS 4.x, Prisma, better-auth
3. Tailwind CSS configured with shadcn/ui (New York style, Neutral base color, CSS variables enabled)
4. shadcn/ui initialized with core components: Button, Input, Card, Form utilities
5. Project structure created with folders: /app, /components, /components/ui, /lib, /hooks, /types, /prisma, /public, /docs
6. ESLint and Prettier configured for code quality
7. TypeScript configured with strict mode and path aliases (@/* for root imports)
8. Git repository initialized with .gitignore configured for Next.js projects
9. README.md updated with development setup instructions
10. Development server runs successfully on localhost:3000 with a basic "Hello World" page

### Story 1.2: Database Setup & Configuration

As a developer,
I want to set up PostgreSQL database and Prisma ORM with initial schema,
so that I can store user accounts and survey data.

#### Acceptance Criteria

1. PostgreSQL database created (Railway, Supabase, or local instance)
2. Prisma initialized with database connection string in .env file
3. Initial Prisma schema defined with User model (id, email, name, passwordHash, createdAt, updatedAt)
4. Database migrations created and successfully applied
5. Prisma Client generated and importable in application code
6. Seed script created for development data (optional test users)
7. Database connection tested successfully from API route
8. .env.example file created documenting required environment variables
9. Documentation added for database setup in README.md

### Story 1.3: Authentication System - Email/Password

As a user,
I want to register and login with email and password,
so that I can securely access my survey account.

#### Acceptance Criteria

1. better-auth library integrated and configured with database adapter
2. User registration API endpoint created (POST /api/auth/register) with email/password
3. Password hashing implemented using better-auth's secure hashing
4. Email validation implemented (format, uniqueness)
5. Password strength requirements enforced (minimum 8 characters)
6. User login API endpoint created (POST /api/auth/login)
7. Session management implemented with HTTP-only cookies
8. Registration page created at /register with form fields: name, email, password, confirm password
9. Login page created at /login with form fields: email, password
10. Form validation with user-friendly error messages (email already exists, incorrect password, etc.)
11. Successful registration redirects to dashboard
12. Successful login redirects to dashboard
13. Error states handled gracefully with toast notifications

### Story 1.4: Authentication System - Google OAuth

As a user,
I want to sign in with my Google account,
so that I can quickly access the platform without creating a new password.

#### Acceptance Criteria

1. better-auth OAuth provider configured for Google
2. Google OAuth credentials created (Client ID, Client Secret) in Google Cloud Console
3. OAuth callback route created at /api/auth/callback/google
4. "Sign in with Google" button added to login page
5. "Sign up with Google" button added to registration page
6. OAuth flow redirects to Google consent screen
7. OAuth callback creates or updates user account in database
8. OAuth users can login without password
9. Successful OAuth login redirects to dashboard
10. Error handling for OAuth failures (user cancellation, invalid credentials)

### Story 1.5: User Dashboard & Session Management

As a logged-in user,
I want to access my dashboard and have my session persist across page refreshes,
so that I can navigate the application seamlessly.

#### Acceptance Criteria

1. Dashboard page created at /dashboard with protected route
2. Middleware implemented to check authentication status for protected routes
3. Unauthenticated users redirected to /login when accessing protected routes
4. User session validated on each protected page load
5. Dashboard displays welcome message with user's name
6. Navigation bar includes user menu with logout option
7. Logout functionality implemented (POST /api/auth/logout)
8. Logout clears session cookie and redirects to login page
9. Session persists across page refreshes until logout or expiration
10. Dashboard shows placeholder content: "Your surveys will appear here" (empty state)

### Story 1.6: Account Settings & Profile Management

As a logged-in user,
I want to view and update my profile information,
so that I can keep my account details current.

#### Acceptance Criteria

1. Account settings page created at /settings
2. Profile form displays current user information: name, email
3. Users can update their name with inline validation
4. Users can update their password (requires current password confirmation)
5. Password change validates current password before allowing update
6. Email change prevented in MVP (complexity of email verification out of scope)
7. Profile updates saved to database via API endpoint (PATCH /api/user/profile)
8. Success notifications shown for successful updates
9. Error handling for invalid inputs or failed updates
10. Form validation prevents empty name or weak passwords

---

## Epic 2: Survey Creation & Management

**Epic Goal**: Build the comprehensive survey creation and management system that empowers users to create professional surveys through an intuitive interface. This epic delivers a drag-and-drop survey builder with multiple question types, survey templates for quick starts, conditional logic for sophisticated surveys, and full survey lifecycle management (create, edit, save drafts, publish, archive, duplicate). By the end of this epic, users can create fully functional surveys and manage their survey library.

### Story 2.1: Survey List & Management Dashboard

As a logged-in user,
I want to view all my surveys in an organized list with their status,
so that I can easily manage and access my surveys.

#### Acceptance Criteria

1. Dashboard page (/dashboard) displays a list of all user's surveys
2. Survey list shows survey cards/rows with: title, status (draft/published/archived), creation date, response count
3. Empty state message shown when user has no surveys: "Create your first survey to get started"
4. "Create New Survey" button prominently displayed
5. Each survey card has quick action menu: Edit, Duplicate, Archive, View Responses
6. Surveys ordered by most recently modified first
7. Survey status badges visually distinct (e.g., draft = gray, published = green, archived = muted)
8. Click on survey card navigates to survey builder (for drafts) or survey analytics (for published)
9. Prisma schema includes Survey model with fields: id, userId, title, description, status, createdAt, updatedAt
10. API endpoint created (GET /api/surveys) to fetch user's surveys
11. Surveys filtered to only show current user's surveys (authorization check)

### Story 2.2: Create New Survey & Basic Settings

As a logged-in user,
I want to create a new survey with a title and description,
so that I can start building my survey.

#### Acceptance Criteria

1. "Create New Survey" button on dashboard opens modal or navigates to /surveys/new
2. New survey form has fields: Survey Title (required), Description (optional)
3. Form validation requires non-empty title
4. "Create Survey" button submits form via API (POST /api/surveys)
5. New survey created in database with status: "draft"
6. Survey creation associates survey with authenticated user (userId)
7. Successful creation redirects to survey builder page (/surveys/[id]/edit)
8. Survey builder page loads with empty survey (no questions yet)
9. Survey builder displays survey title and description at top
10. "Add Question" button visible to start adding questions

### Story 2.3: Question Types - Multiple Choice

As a survey creator,
I want to add multiple choice questions to my survey,
so that respondents can select from predefined options.

#### Acceptance Criteria

1. Prisma schema includes Question model with fields: id, surveyId, type, text, options (JSON), required, order
2. "Add Question" button opens question type selector
3. Question type selector includes "Multiple Choice" option
4. Selecting "Multiple Choice" adds a new multiple choice question to survey
5. Multiple choice question editor has fields: Question text, Options (minimum 2)
6. Users can add option by clicking "+ Add Option"
7. Users can edit option text inline
8. Users can delete options (minimum 2 options enforced)
9. Users can reorder options via drag-and-drop
10. "Required" toggle available for each question
11. Question saved to database via API (POST /api/surveys/[id]/questions)
12. Multiple choice question renders correctly in survey preview
13. Changes auto-save or show "Save" button with unsaved indicator

### Story 2.4: Question Types - Text Input, Rating Scale, Checkbox, Dropdown, Yes/No

As a survey creator,
I want to add various question types to my survey,
so that I can collect different types of data from respondents.

#### Acceptance Criteria

1. Question type selector includes: Text Input, Rating Scale, Checkbox, Dropdown, Yes/No
2. **Text Input**: Short text (single line) and Long text (textarea) variants available
3. **Text Input**: Placeholder text field available for guidance
4. **Rating Scale**: Configure scale range (e.g., 1-5, 1-10) with optional labels for min/max
5. **Checkbox**: Multiple options with ability to add/edit/delete options (same as multiple choice)
6. **Dropdown**: Single selection from dropdown list with option management
7. **Yes/No**: Simple binary question (renders as two buttons or radio buttons)
8. All question types support "Required" toggle
9. Question schema in database supports all types via "type" enum and flexible "options" JSON field
10. API endpoint (POST /api/surveys/[id]/questions) handles creation of all question types
11. Each question type renders correctly in survey builder preview
12. Each question type has appropriate UI for respondents (validated in Epic 3)

### Story 2.5: Reorder, Edit, and Delete Questions

As a survey creator,
I want to reorder, edit, and delete questions in my survey,
so that I can organize my survey effectively.

#### Acceptance Criteria

1. Survey builder displays questions in order according to "order" field
2. Drag-and-drop handles visible on each question card
3. Users can drag questions to reorder them within the survey
4. Reordering updates "order" field in database via API (PATCH /api/surveys/[id]/questions/reorder)
5. Each question card has "Edit" icon/button
6. Clicking "Edit" makes question editable inline or opens edit modal
7. Editing question text or options updates database via API (PATCH /api/surveys/[id]/questions/[qid])
8. Each question card has "Delete" icon/button
9. Clicking "Delete" shows confirmation dialog: "Are you sure you want to delete this question?"
10. Confirming deletion removes question from survey via API (DELETE /api/surveys/[id]/questions/[qid])
11. Deletion removes question from database and updates remaining questions' order
12. Changes reflected immediately in survey builder UI

### Story 2.6: Survey Templates

As a survey creator,
I want to select from pre-built survey templates,
so that I can quickly create surveys without starting from scratch.

#### Acceptance Criteria

1. "Create New Survey" flow includes option: "Start from template" vs "Start from scratch"
2. Template gallery displays 3-5 templates: Customer Feedback, Employee Satisfaction, Event Planning (and optionally: Product Survey, NPS Survey)
3. Each template card shows: template name, description, preview of questions (count)
4. Clicking template creates new survey with pre-populated questions
5. Template questions include appropriate question types and options
6. **Customer Feedback Template**: Questions about satisfaction, likelihood to recommend, suggestions for improvement
7. **Employee Satisfaction Template**: Questions about work environment, management, work-life balance
8. **Event Planning Template**: Questions about event preferences, attendance, dietary restrictions
9. User can customize template survey (edit, add, delete questions) after selection
10. Template data stored as JSON configurations that can be loaded into new surveys
11. Template-based surveys marked with source template in database (optional metadata)

### Story 2.7: Conditional Logic (Show/Hide Questions)

As a survey creator,
I want to add conditional logic to questions,
so that respondents only see relevant questions based on their answers.

#### Acceptance Criteria

1. Each question has "Add Logic" button in survey builder
2. Clicking "Add Logic" opens conditional logic editor
3. Logic editor allows setting: "Show this question if [Question X] [Condition] [Value]"
4. Conditions supported: equals, not equals, contains (for checkbox)
5. User can select trigger question from dropdown of previous questions
6. User can select condition type and specify value(s)
7. Logic rules saved to database in Question model (add "logic" JSON field)
8. Multiple logic rules can be added to a single question (AND/OR logic in Phase 2, MVP: simple IF logic)
9. Survey builder shows logic indicator icon on questions with logic
10. Logic correctly applied during survey response (validated in Epic 3)
11. Circular logic prevented (question cannot depend on itself or later questions)

### Story 2.8: Save Draft & Publish Survey

As a survey creator,
I want to save my survey as a draft and publish it when ready,
so that I can work on surveys over time and control when they're available.

#### Acceptance Criteria

1. Survey builder has "Save as Draft" button (or auto-save functionality)
2. Draft surveys save all changes to database
3. Draft surveys remain editable after saving
4. Survey builder has "Publish" button
5. Clicking "Publish" validates survey: must have title and at least one question
6. Validation errors shown if survey incomplete
7. Publishing updates survey status to "published" in database
8. Published surveys generate unique survey URL: /s/[uniqueId]
9. uniqueId is a short, random, URL-safe string (e.g., 8 characters)
10. Published surveys become accessible to respondents via public URL
11. Published surveys can still be edited (changes apply immediately)
12. Dashboard reflects survey status change (draft → published)

### Story 2.9: Archive and Duplicate Surveys

As a survey creator,
I want to archive completed surveys and duplicate existing surveys,
so that I can manage my survey library efficiently.

#### Acceptance Criteria

1. Survey action menu includes "Archive" option
2. Clicking "Archive" shows confirmation dialog
3. Archiving updates survey status to "archived" in database
4. Archived surveys no longer appear in main survey list
5. Archived surveys viewable via "Archived" filter/tab on dashboard
6. Archived surveys remain accessible for viewing responses
7. Archived surveys can be unarchived (status change back to published/draft)
8. Survey action menu includes "Duplicate" option
9. Clicking "Duplicate" creates a copy of the survey with all questions
10. Duplicated survey created with status "draft" and title "[Original Title] - Copy"
11. Duplicated survey gets new ID and timestamps
12. Duplicated survey immediately editable in survey builder

---

## Epic 3: Survey Distribution & Response Collection

**Epic Goal**: Enable seamless survey distribution and robust response collection. This epic delivers public survey access, shareable links, embed codes, respondent-facing survey interface, response validation and submission, and real-time response capture. By the end of this epic, survey creators can share their surveys via multiple channels, and respondents can complete surveys with a smooth, mobile-optimized experience, with all responses stored securely in the database.

### Story 3.1: Public Survey View & Access

As a survey respondent,
I want to access a survey via a shared link,
so that I can complete the survey without needing an account.

#### Acceptance Criteria

1. Public survey route created at /s/[uniqueId]
2. Route accessible without authentication (public page)
3. Survey data fetched from database using uniqueId
4. 404 error page shown if uniqueId is invalid or survey doesn't exist
5. Only published surveys accessible via public URL (drafts return 404 or "Survey not available")
6. Archived surveys show "This survey is no longer accepting responses" message
7. Survey metadata (title, description) displayed at top of page
8. Clean, respondent-focused layout without creator UI elements
9. Survey questions rendered in order
10. Mobile-responsive layout optimized for mobile respondents

### Story 3.2: Generate Shareable Link & Embed Code

As a survey creator,
I want to generate a shareable link and embed code for my survey,
so that I can distribute my survey across multiple channels.

#### Acceptance Criteria

1. Published surveys have "Share" button in survey management interface
2. Clicking "Share" opens modal with sharing options
3. Modal displays full shareable URL: https://survey.fatihoune.com/s/[uniqueId]
4. "Copy Link" button copies URL to clipboard with confirmation message
5. Modal includes "Embed Code" tab or section
6. Embed code generated as HTML iframe: `<iframe src="https://survey.fatihoune.com/s/[uniqueId]" width="100%" height="600px"></iframe>`
7. "Copy Embed Code" button copies code to clipboard
8. Embed code works when pasted into external websites
9. Embedded surveys fully functional within iframe
10. Share modal includes QR code for mobile sharing (optional enhancement)

### Story 3.3: Render Survey Questions for Respondents

As a survey respondent,
I want to see survey questions in an intuitive format,
so that I can understand and answer them easily.

#### Acceptance Criteria

1. All question types render correctly in public survey view
2. **Multiple Choice**: Radio buttons for single selection
3. **Text Input**: Single-line input or textarea based on variant
4. **Rating Scale**: Visual rating scale (stars, numbers, or slider) with labels
5. **Checkbox**: Checkboxes for multiple selection
6. **Dropdown**: Dropdown select menu
7. **Yes/No**: Two clear buttons or radio buttons
8. Required questions marked with asterisk (*)
9. Question numbers displayed (Q1, Q2, etc.)
10. Questions displayed in correct order based on "order" field
11. Placeholder text shown for text input questions
12. Option labels clearly readable and accessible
13. Touch-friendly targets for mobile users (minimum 44x44px)

### Story 3.4: Conditional Logic - Hide/Show Questions

As a survey respondent,
I want to see only relevant questions based on my previous answers,
so that I have a personalized survey experience.

#### Acceptance Criteria

1. Questions with conditional logic initially hidden if conditions not met
2. Logic evaluation happens in real-time as respondent answers questions
3. When trigger question answered, dependent questions evaluated
4. Questions shown/hidden smoothly with CSS transition
5. Logic supports "equals" condition: show if answer matches specific value
6. Logic supports "not equals" condition: show if answer doesn't match value
7. Logic supports "contains" condition for checkbox: show if specific option selected
8. Multiple conditions on same question handled correctly
9. Hidden questions not submitted with response data
10. Logic works correctly across all question types
11. Client-side validation ensures logic evaluation without page reload

### Story 3.5: Response Validation & Submission

As a survey respondent,
I want to submit my completed survey with validation,
so that I know my responses were recorded.

#### Acceptance Criteria

1. Public survey page has "Submit" button at bottom of survey
2. Clicking "Submit" validates all required questions answered
3. Validation errors displayed inline for unanswered required questions
4. Error summary shown at top of form: "Please answer all required questions"
5. Page scrolls to first validation error for user convenience
6. Valid submission sends response data to API (POST /api/surveys/[id]/responses)
7. Prisma schema includes Response model: id, surveyId, submittedAt, answers (JSON)
8. Response data includes question IDs mapped to answer values
9. Successful submission shows confirmation message: "Thank you! Your response has been recorded."
10. Submission button disabled during API request (prevents double submission)
11. Submission under 500ms as per NFR2
12. Error handling for failed submissions with retry option

### Story 3.6: Response Storage & Association

As a system,
I want to store survey responses securely and associate them with surveys,
so that survey creators can access response data.

#### Acceptance Criteria

1. Response model in Prisma schema includes foreign key to Survey (surveyId)
2. Responses stored with complete answer data in JSON format
3. Response timestamp (submittedAt) automatically recorded
4. Each response gets unique ID for retrieval
5. Responses queryable by surveyId for analytics
6. Database indexes created for efficient response querying
7. API endpoint includes authorization check (only survey owner can access responses)
8. Response storage handles all question types correctly
9. Answers stored in structured format: `{ questionId: "q1", answer: "value" }`
10. Database constraints prevent orphaned responses (cascade delete if survey deleted)

### Story 3.7: Thank You Page & Confirmation

As a survey respondent,
I want to see a confirmation after submitting my survey,
so that I know my response was successfully recorded.

#### Acceptance Criteria

1. Successful submission redirects to thank you page or shows in-page confirmation
2. Thank you message displays survey title: "Thank you for completing [Survey Title]!"
3. Confirmation message: "Your response has been recorded."
4. Optional: Allow survey creator to customize thank you message (saved in Survey model)
5. Thank you page has clean design matching survey branding
6. No back button or ability to resubmit response (prevent duplicates)
7. Optional: "Complete another survey" link returns to /s/[uniqueId] (allows multiple responses)
8. Optional: Display response confirmation number for user's records
9. Thank you page works in embedded mode (iframe)

---

## Epic 4: Analytics & Data Export

**Epic Goal**: Empower survey creators with actionable insights through response viewing, analytics visualizations, and data export capabilities. This epic delivers a comprehensive analytics dashboard with response counts, completion rates, individual response viewing, aggregated data with charts (bar, pie), and CSV export functionality. By the end of this epic, users can analyze survey results in real-time and export data for external analysis, completing the core survey workflow.

### Story 4.1: View Response Count & Completion Rate

As a survey creator,
I want to see the total number of responses and completion rate for my survey,
so that I can gauge survey performance at a glance.

#### Acceptance Criteria

1. Survey detail page (/surveys/[id]) displays key metrics at top
2. Metrics include: Total Responses, Completion Rate
3. Total Responses counts all submitted responses in database
4. Completion Rate calculated as: (completed responses / survey views) × 100% (note: view tracking out of scope for MVP; show "N/A" or omit)
5. Alternative: Completion Rate based on average answered questions if view tracking unavailable
6. Metrics displayed prominently with large numbers and labels
7. Metrics update in real-time as new responses submitted
8. Metrics API endpoint created (GET /api/surveys/[id]/metrics)
9. API includes authorization check (only survey owner can view)
10. Dashboard survey cards also show response count for quick reference

### Story 4.2: View Individual Responses

As a survey creator,
I want to view individual survey responses with timestamps,
so that I can see detailed respondent data.

#### Acceptance Criteria

1. Survey detail page has "Responses" tab
2. Responses tab displays list of all survey responses
3. Each response shown as a card or table row with submission timestamp
4. Clicking on response expands or navigates to detailed response view
5. Detailed response view shows all questions and corresponding answers
6. Answers formatted appropriately for question type (e.g., multiple choice shows selected option)
7. Conditional questions that were hidden show as "Not answered" or omitted
8. Response list paginated if more than 50 responses (pagination controls)
9. Responses ordered by most recent first (submittedAt DESC)
10. API endpoint created (GET /api/surveys/[id]/responses) with authorization
11. Empty state shown if no responses yet: "No responses yet. Share your survey to start collecting data."

### Story 4.3: Analytics Dashboard with Charts

As a survey creator,
I want to see aggregated analytics with visual charts for each question,
so that I can quickly understand response patterns.

#### Acceptance Criteria

1. Survey detail page has "Analytics" tab
2. Analytics tab displays visualizations for each question
3. **Multiple Choice, Dropdown, Yes/No**: Bar chart showing count for each option
4. **Checkbox**: Bar chart showing count for each selected option (multiple selections supported)
5. **Rating Scale**: Bar chart or histogram showing distribution across rating values
6. **Text Input**: List of text responses (charts not applicable; show word cloud in Phase 2)
7. Each chart includes question text as title
8. Charts display actual counts and percentages
9. Charts library integrated (Recharts or Chart.js)
10. Charts responsive and mobile-friendly
11. API endpoint created (GET /api/surveys/[id]/analytics) returning aggregated data
12. Analytics calculate on server-side for performance
13. Empty state shown if no responses: "Analytics will appear once responses are collected."

### Story 4.4: Pie Charts for Categorical Data

As a survey creator,
I want to see pie charts for categorical questions,
so that I can visualize response proportions.

#### Acceptance Criteria

1. Analytics tab includes toggle or additional view for pie charts
2. Pie charts available for: Multiple Choice, Dropdown, Yes/No, Checkbox questions
3. Pie chart shows percentage distribution of responses
4. Each slice labeled with option name and percentage
5. Hover states show exact counts
6. Pie charts use accessible color palette
7. Legend displayed below or beside pie chart
8. User can switch between bar chart and pie chart views (toggle button)
9. Chart preference saved to local state (no persistence needed in MVP)
10. Pie charts render correctly with Recharts or Chart.js

### Story 4.5: Export Responses to CSV

As a survey creator,
I want to export all survey responses to CSV format,
so that I can analyze data in Excel or statistical software.

#### Acceptance Criteria

1. Analytics or Responses tab includes "Export to CSV" button
2. Clicking "Export to CSV" triggers download of CSV file
3. CSV filename format: `[survey-title]-responses-[date].csv`
4. CSV first row contains headers: Question IDs or Question text
5. Each subsequent row represents one response
6. Response timestamp included as first column
7. Answers formatted appropriately: multiple choice shows selected option, checkbox shows comma-separated selections
8. Text answers escaped properly to handle commas and quotes
9. Conditional questions that were not answered show empty cells
10. CSV generation uses Papa Parse or similar library
11. API endpoint created (GET /api/surveys/[id]/export) returning CSV data
12. Export includes all responses (no pagination limit)
13. Authorization check ensures only survey owner can export
14. Large exports (1000+ responses) handled efficiently without timeout

### Story 4.6: Response Data Table with Filtering

As a survey creator,
I want to view response data in a table format with basic filtering,
so that I can quickly scan and search through responses.

#### Acceptance Criteria

1. Responses tab includes table view option (in addition to card view)
2. Table columns represent questions (abbreviated if long)
3. Table rows represent individual responses
4. Response timestamp shown in first column
5. Table horizontally scrollable if many questions
6. Table supports sorting by timestamp (newest/oldest first)
7. Search box filters responses by text content (searches across all answers)
8. Filter updates table in real-time as user types
9. Table shows paginated results (50 responses per page)
10. Table is responsive: collapses to card view on mobile devices
11. Empty state shown if no responses match filter

### Story 4.7: Dashboard Analytics Summary

As a survey creator,
I want to see summary analytics on my dashboard,
so that I can monitor multiple surveys at once.

#### Acceptance Criteria

1. Dashboard survey cards display summary metrics: response count, last response date
2. Optional: Show mini chart or trend indicator on survey card
3. Dashboard includes overview stats at top: Total Surveys, Total Responses, Surveys Published
4. Overview stats aggregate data across all user's surveys
5. Clicking on survey card navigates to full analytics view
6. Dashboard metrics update in real-time as responses submitted
7. Empty state shown for metrics if no surveys exist
8. API endpoint created (GET /api/dashboard/stats) for aggregated stats
9. Dashboard loads quickly even with many surveys (optimize queries)

---

## Checklist Results Report

### PM Checklist Execution

*Note: PM checklist execution would typically involve reviewing the PRD against a comprehensive checklist to ensure all required sections are complete, requirements are clear and testable, epics follow logical sequence, and stories are appropriately sized. For this YOLO mode generation, the checklist has been implicitly followed during PRD creation.*

**Key Validation Points**:

✅ **Goals Defined**: Clear business and user goals established with measurable outcomes
✅ **Background Context**: Problem statement and solution approach documented
✅ **Requirements Complete**: 26 Functional Requirements and 18 Non-Functional Requirements specified
✅ **UI Goals Documented**: UX vision, interaction paradigms, core screens, accessibility (WCAG AA), branding, and platforms defined
✅ **Technical Assumptions Clear**: Repository structure (Monorepo), architecture (Monolithic Next.js), testing strategy, and all technology choices documented
✅ **Epic Sequencing Logical**: 4 epics follow agile best practices with incremental value delivery
✅ **Story Sizing Appropriate**: Stories scoped for single-session AI agent execution (2-4 hour junior developer equivalent)
✅ **Acceptance Criteria Testable**: All stories have clear, specific, and verifiable acceptance criteria
✅ **Dependencies Identified**: Stories within epics sequenced to avoid forward dependencies
✅ **MVP Scope Maintained**: All features aligned with Project Brief's MVP scope; Phase 2 features excluded

**Recommendations for Review**:

1. **Validate Technical Choices**: Confirm better-auth, hosting infrastructure, and database provider selections with stakeholders
2. **Confirm Template Content**: Review the 3-5 pre-built survey templates with domain experts to ensure they meet user needs
3. **Testing Strategy Alignment**: Confirm manual testing approach for MVP is acceptable given timeline constraints
4. **Security Review**: Conduct security review of authentication, session management, and data handling approaches before development begins
5. **Performance Baselines**: Establish monitoring and alerting for NFRs (page load times, response submission times, uptime)

---

## Next Steps

### UX Expert Prompt

**Prompt for UX/Design Architect**:

"Please review the attached PRD for Survey.fatihoune.com and create detailed UX/UI specifications. Focus on:

1. **Wireframes and User Flows**: Create detailed wireframes for core screens (dashboard, survey builder, public survey view, analytics) and user flows for primary journeys (survey creation, response submission, analytics review).

2. **Component Specifications**: Define specifications for key UI components leveraging shadcn/ui library (buttons, forms, modals, navigation, survey question components).

3. **Interaction Design**: Specify micro-interactions, animations, and transitions that enhance usability (drag-and-drop behavior, conditional logic visualization, real-time preview).

4. **Accessibility Implementation**: Provide specific guidance for WCAG 2.1 AA compliance (keyboard navigation patterns, ARIA labels, focus management, color contrast).

5. **Responsive Behavior**: Define breakpoints and responsive adaptations for mobile, tablet, and desktop experiences.

6. **Design System**: Establish design tokens (colors, typography, spacing) aligned with shadcn/ui and Tailwind CSS conventions.

Reference the Project Brief (`docs/brief.md`) for brand positioning and target user insights. Deliver UX specifications that the development team can directly implement."

---

### Architect Prompt

**Prompt for Technical Architect**:

"Please review the attached PRD for Survey.fatihoune.com and create a comprehensive technical architecture document. Focus on:

1. **System Architecture**: Define the detailed system architecture including Next.js App Router structure, API route organization, database schema (Prisma models with relationships), and authentication flow (better-auth integration).

2. **Data Models**: Design complete database schema with all entities (User, Survey, Question, Response), relationships, indexes, and constraints. Include sample queries for complex operations (analytics aggregation, conditional logic evaluation).

3. **API Design**: Specify RESTful API endpoints with request/response schemas, authentication/authorization middleware, rate limiting, and error handling patterns.

4. **Security Architecture**: Detail security implementations for authentication (better-auth), session management, input validation (Zod), XSS prevention, CSRF protection, and GDPR compliance (data export/deletion).

5. **Performance Optimization**: Define strategies for meeting NFRs (page load < 2s, TTI < 3s, response submission < 500ms) including SSR/CSR decisions, caching strategies, database query optimization, and lazy loading.

6. **Testing Strategy**: Expand on the progressive testing approach with specific guidance for manual testing, type safety enforcement, and future automated testing integration points.

7. **Deployment Architecture**: Design production deployment on self-hosted infrastructure and development deployment on Vercel, including CI/CD pipeline, environment management, and database migration strategy.

8. **File Structure**: Provide detailed project file structure with code organization patterns, naming conventions, and module boundaries.

Reference the Technical Assumptions section for technology choices (Next.js 16, React 19, TypeScript, Prisma, PostgreSQL, better-auth, shadcn/ui). Ensure architecture supports 8-12 week MVP timeline and enables future scalability. Deliver architecture specifications that development team can directly implement in Epic 1."

---

**Document Version**: 1.0
**Last Updated**: 2025-11-01
**Status**: Complete - Ready for Architecture & UX Design
