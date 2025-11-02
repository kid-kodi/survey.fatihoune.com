# Next Steps

## UX Expert Prompt

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

## Architect Prompt

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
