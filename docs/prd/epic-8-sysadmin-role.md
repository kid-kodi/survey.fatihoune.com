# Epic 8: System Administrator (sys_admin) Role - Brownfield Enhancement

**Epic ID:** epic-8
**Status:** Draft
**Created:** 2025-11-06

---

## Epic Goal

Enable platform-level super-administrator capabilities through a sys_admin role with user impersonation (with audit trail and notifications), subscription management, and unrestricted access to all platform features.

---

## Epic Description

### Existing System Context

- **Current authentication**: better-auth with session management via HTTP-only cookies
- **Current RBAC**: Organization-based roles (Owner, Admin, Agent) with permissions (manage_organization, manage_users, create_surveys, etc.)
- **Current subscription system**: Free/Pro/Premium tiers with usage limits (surveys, organizations, members) enforced via middleware
- **Technology stack**: Next.js 16, React 19, TypeScript, PostgreSQL, Prisma ORM
- **Integration points**: User model, Session model, Subscription/SubscriptionPlan models, Organization/Role/Permission system

### Enhancement Details

**What's being added/changed:**

1. **sys_admin Role (Platform-Level)**
   - New `isSysAdmin` boolean flag on User model
   - Distinct from organization roles (platform-wide super-admin)
   - Multiple sys_admins supported
   - One sys_admin created via seed script

2. **User Impersonation System**
   - sys_admin can impersonate any user account
   - Full audit trail with ImpersonationSession model
   - User receives notification when impersonated
   - sys_admin can switch back to their own account
   - Impersonation history viewable by sys_admins

3. **Subscription Management**
   - sys_admin can extend/modify any user's subscription
   - Flexible subscription modification (period, plan, limits)
   - Audit logging for all subscription changes
   - Admin UI to view and manage all subscriptions

4. **Unrestricted Access**
   - sys_admins bypass all subscription limits
   - Full access to all platform features without payment
   - All user capabilities available
   - Permission middleware updated to check sys_admin status

**How it integrates:**

- Extends User model with `isSysAdmin` field and sys_admin metadata
- Hooks into existing permission middleware (`requirePermission`) to bypass checks for sys_admins
- Creates new audit models (ImpersonationSession, AdminAction) for compliance
- Integrates with better-auth session system for impersonation switching
- Extends subscription API endpoints with admin-only modification routes
- Creates new admin dashboard at `/admin` for sys_admin tools

**Success criteria:**

- ✅ sys_admin can impersonate any user with full functionality
- ✅ All impersonation events logged with timestamp, reason, duration
- ✅ Impersonated users receive in-app notification (and optional email)
- ✅ sys_admin can switch back to own account instantly
- ✅ sys_admin can extend subscriptions with flexible date/plan changes
- ✅ sys_admin bypasses all subscription limits (surveys, organizations, members)
- ✅ One sys_admin account seeded in database
- ✅ Multiple sys_admins can be created via admin promotion UI
- ✅ All admin actions audited and viewable in admin dashboard

---

## Stories

### Story 8.1: System Administrator Role & Database Schema

**Description:** Extend the User model with sys_admin capabilities, create audit models (ImpersonationSession, AdminAction), update database schema with migrations, create seed script for initial sys_admin, and implement basic permission middleware updates.

**Key Tasks:**
- Add `isSysAdmin` boolean field to User model
- Create ImpersonationSession model (id, adminId, targetUserId, startedAt, endedAt, reason, ipAddress)
- Create AdminAction model (id, adminId, action, targetResource, metadata, performedAt)
- Create and run Prisma migration
- Create seed script to insert one sys_admin user (email: admin@survey.fatihoune.com)
- Update permission middleware to check `isSysAdmin` and bypass normal checks
- Add indexes for performance (isSysAdmin, adminId, targetUserId)

### Story 8.2: User Impersonation System with Audit Trail

**Description:** Build the impersonation system allowing sys_admins to log in as any user, with full audit logging, user notifications, and the ability to switch back. Create admin dashboard UI for impersonation search and session management.

**Key Tasks:**
- Create admin dashboard page at `/admin` (protected: only isSysAdmin=true)
- Build user search UI with autocomplete (search by email, name, ID)
- Create "Start Impersonation" button with reason field (optional)
- Implement impersonation API endpoint (POST /api/admin/impersonate) that:
  - Creates ImpersonationSession record
  - Switches session to target user (preserve original admin session)
  - Logs AdminAction
- Add notification to impersonated user: "An administrator is currently viewing your account"
- Create "Stop Impersonation" button (visible during impersonation) to switch back
- Build impersonation history view showing all past/active sessions
- Display impersonation indicator in app header when active
- Send optional email notification to impersonated user

### Story 8.3: Subscription Management & Admin Tools

**Description:** Create subscription management UI for sys_admins to extend/modify user subscriptions, implement flexible subscription modification APIs with audit logging, and ensure sys_admins bypass all subscription limits.

**Key Tasks:**
- Create "Subscriptions" tab in admin dashboard
- Build subscription list UI showing all user subscriptions (searchable, filterable)
- Create "Edit Subscription" modal with fields:
  - Extend period (add days/months)
  - Change plan (Free/Pro/Premium)
  - Modify limits (custom overrides)
- Implement subscription modification API (PATCH /api/admin/subscriptions/[id]) with:
  - Flexible period extension (currentPeriodEnd + X days)
  - Plan switching without payment
  - Custom limit overrides
  - Audit logging via AdminAction
- Update usage limit enforcement middleware to bypass checks for isSysAdmin=true
- Add "sys_admin bypass" indicator in subscription UI
- Create admin activity log view showing all subscription changes
- Ensure sys_admins can create unlimited surveys/organizations/members

---

## Compatibility Requirements

- ✅ Existing auth system (better-auth) remains unchanged - impersonation uses session switching
- ✅ Organization roles unaffected - sys_admin is platform-level, independent of org roles
- ✅ Subscription models backward compatible - new audit fields added, existing fields unchanged
- ✅ Permission middleware extended, not replaced - existing permission checks still work
- ✅ UI patterns follow existing admin UX (shadcn/ui components, consistent styling)
- ✅ Performance impact minimal - new queries use indexed fields, impersonation uses existing session system

---

## Risk Mitigation

**Primary Risk:** Security vulnerability - unauthorized access to sys_admin functions

**Mitigation:**
- `isSysAdmin` flag strictly controlled (cannot be set via public APIs)
- All admin endpoints protected with middleware checking `isSysAdmin === true`
- Impersonation requires active admin session (cannot be forged)
- Full audit trail for all admin actions (immutable logs)
- Admin dashboard hidden from non-sys_admins (404 if accessed)

**Rollback Plan:**
- Migration includes `down` script to remove `isSysAdmin` field
- Admin routes can be disabled via feature flag (`ENABLE_SYS_ADMIN=false`)
- ImpersonationSession and AdminAction tables can be dropped if needed
- Permission middleware changes isolated in separate functions (easy to revert)

---

## Definition of Done

- ✅ All 3 stories completed with acceptance criteria met
- ✅ Database migration applied successfully (dev and production-ready)
- ✅ One sys_admin seeded in database and functional
- ✅ sys_admin can impersonate users and switch back without errors
- ✅ Impersonation audit trail complete and viewable
- ✅ User notifications working (in-app required, email optional)
- ✅ sys_admin can extend/modify subscriptions via admin UI
- ✅ sys_admins bypass all subscription limits
- ✅ Existing functionality verified (no regressions in auth, RBAC, subscriptions)
- ✅ Permission middleware tested with sys_admin and non-sys_admin users
- ✅ Admin dashboard accessible only to sys_admins (security validated)
- ✅ Code reviewed for security vulnerabilities
- ✅ Documentation updated (README, admin user guide)

---

## Validation Checklist

**Scope Validation:**
- ✅ Epic can be completed in 3 stories maximum
- ✅ No architectural changes required (extends existing patterns)
- ✅ Enhancement follows existing patterns (better-auth sessions, Prisma models, Next.js API routes)
- ✅ Integration complexity is manageable (isolated admin features)

**Risk Assessment:**
- ✅ Risk to existing system is low (admin features isolated, backward compatible)
- ✅ Rollback plan is feasible (migration reversible, feature flag available)
- ✅ Testing approach covers existing functionality (auth, RBAC, subscriptions regression tested)
- ✅ Team has sufficient knowledge of integration points (User model, sessions, middleware)

**Completeness Check:**
- ✅ Epic goal is clear and achievable (sys_admin role with impersonation and subscription management)
- ✅ Stories are properly scoped (database, impersonation, subscription management)
- ✅ Success criteria are measurable (audit trail, notifications, bypass limits)
- ✅ Dependencies are identified (User model, Session system, Subscription models)

---

## Story Manager Handoff

**Story Manager Handoff:**

"Please develop detailed user stories for this brownfield epic. Key considerations:

- This is an enhancement to an existing system running **Next.js 16, React 19, TypeScript, PostgreSQL, Prisma, better-auth**
- Integration points:
  - User model (add `isSysAdmin` field)
  - better-auth session system (for impersonation session switching)
  - Subscription and SubscriptionPlan models (for admin subscription management)
  - Permission middleware (update to bypass checks for sys_admins)
  - Organization/Role/Permission system (sys_admin is platform-level, independent)
- Existing patterns to follow:
  - Prisma schema with migrations (`prisma migrate dev`)
  - Next.js API routes at `/api/admin/*` for admin endpoints
  - shadcn/ui components for admin dashboard UI
  - Permission middleware pattern (`requirePermission`, `hasPermission`)
  - Audit logging via dedicated models (ImpersonationSession, AdminAction)
- Critical compatibility requirements:
  - Do NOT modify existing auth flows (better-auth remains unchanged)
  - Do NOT break organization role system (sys_admin is separate layer)
  - Ensure backward compatibility (existing subscriptions unaffected)
  - Admin endpoints MUST check `isSysAdmin === true` (security critical)
- Each story must include verification that existing functionality remains intact:
  - Regular users can still authenticate and use platform
  - Organization roles and permissions still work
  - Subscription limits still enforced for non-sys_admins
  - No performance degradation

The epic should maintain system integrity while delivering **sys_admin role with impersonation (audit + notifications), subscription management, and unrestricted access**."

---

## Technical Notes

### Database Schema Changes

```prisma
// User model extension
model User {
  // ... existing fields ...
  isSysAdmin Boolean @default(false)

  // Relations
  impersonationSessionsAsAdmin ImpersonationSession[] @relation("AdminSessions")
  impersonationSessionsAsTarget ImpersonationSession[] @relation("TargetSessions")
  adminActions AdminAction[]

  @@index([isSysAdmin])
}

// New models
model ImpersonationSession {
  id           String    @id @default(cuid())
  adminId      String
  targetUserId String
  reason       String?
  startedAt    DateTime  @default(now())
  endedAt      DateTime?
  ipAddress    String?
  userAgent    String?

  admin        User      @relation("AdminSessions", fields: [adminId], references: [id], onDelete: Cascade)
  targetUser   User      @relation("TargetSessions", fields: [targetUserId], references: [id], onDelete: Cascade)

  @@index([adminId])
  @@index([targetUserId])
  @@index([startedAt])
}

model AdminAction {
  id             String   @id @default(cuid())
  adminId        String
  action         String   // "impersonate_user", "extend_subscription", etc.
  targetResource String   // "user:123", "subscription:456"
  metadata       Json     // Additional context
  performedAt    DateTime @default(now())

  admin          User     @relation(fields: [adminId], references: [id], onDelete: Cascade)

  @@index([adminId])
  @@index([action])
  @@index([performedAt])
}
```

### API Endpoints

- `GET /api/admin/users` - Search users for impersonation
- `POST /api/admin/impersonate` - Start impersonation session
- `POST /api/admin/stop-impersonation` - End impersonation and return to admin session
- `GET /api/admin/impersonation-history` - View all impersonation sessions
- `GET /api/admin/subscriptions` - List all user subscriptions
- `PATCH /api/admin/subscriptions/[id]` - Modify subscription
- `GET /api/admin/audit-log` - View all admin actions

### Middleware Updates

```typescript
// Extend permission middleware
export function requirePermission(permission: string) {
  return async (req, res, next) => {
    const user = await getCurrentUser(req)

    // sys_admin bypass
    if (user?.isSysAdmin) {
      return next()
    }

    // Existing permission check logic...
  }
}
```

---

**Epic Status:** Ready for Story Development
**Estimated Effort:** 3 stories × ~4 hours = 12 hours (1.5 days)
**Priority:** Medium
**Dependencies:** None (extends existing system)
