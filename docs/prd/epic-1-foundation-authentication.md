# Epic 1: Foundation & Authentication

**Epic Goal**: Establish the foundational technical infrastructure for the survey platform, including project setup, development environment, database configuration, and complete authentication system. This epic delivers a fully functional authentication flow with user registration, login (email/password and Google OAuth), session management, and basic account management. By the end of this epic, users can securely create accounts, authenticate, and access a basic dashboard.

## Story 1.1: Project Setup & Development Environment

As a developer,
I want to initialize the Next.js project with all required dependencies and configuration,
so that I have a solid foundation for building the survey platform.

### Acceptance Criteria

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

## Story 1.2: Database Setup & Configuration

As a developer,
I want to set up PostgreSQL database and Prisma ORM with initial schema,
so that I can store user accounts and survey data.

### Acceptance Criteria

1. PostgreSQL database created (Railway, Supabase, or local instance)
2. Prisma initialized with database connection string in .env file
3. Initial Prisma schema defined with User model (id, email, name, passwordHash, createdAt, updatedAt)
4. Database migrations created and successfully applied
5. Prisma Client generated and importable in application code
6. Seed script created for development data (optional test users)
7. Database connection tested successfully from API route
8. .env.example file created documenting required environment variables
9. Documentation added for database setup in README.md

## Story 1.3: Authentication System - Email/Password

As a user,
I want to register and login with email and password,
so that I can securely access my survey account.

### Acceptance Criteria

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

## Story 1.4: Authentication System - Google OAuth

As a user,
I want to sign in with my Google account,
so that I can quickly access the platform without creating a new password.

### Acceptance Criteria

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

## Story 1.5: User Dashboard & Session Management

As a logged-in user,
I want to access my dashboard and have my session persist across page refreshes,
so that I can navigate the application seamlessly.

### Acceptance Criteria

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

## Story 1.6: Account Settings & Profile Management

As a logged-in user,
I want to view and update my profile information,
so that I can keep my account details current.

### Acceptance Criteria

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
