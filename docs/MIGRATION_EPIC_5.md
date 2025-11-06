# Epic 5: RBAC & Organization Management - Migration Guide

This document provides step-by-step instructions for migrating your database to support the new RBAC & Organization Management features introduced in Epic 5.

## 📋 Overview

**Migration Name**: `add_rbac_organization_management`
**Epic**: Epic 5 - RBAC & Organization Management
**Date**: 2025-11-03
**Database Changes**:
- 6 new tables: `Organization`, `OrganizationMember`, `Role`, `Permission`, `RolePermission`, `OrganizationInvitation`
- 2 updated tables: `User`, `Survey`
- 1 new enum: `SurveyVisibility`
- 9 system permissions
- 3 system roles (Owner, Admin, Agent)

---

## ⚠️ Pre-Migration Checklist

Before running the migration, ensure:

- [ ] **Backup your database** (CRITICAL!)
  ```bash
  # PostgreSQL backup example
  pg_dump -h localhost -U your_user -d survey_db > backup_pre_epic5_$(date +%Y%m%d_%H%M%S).sql
  ```

- [ ] **Review the schema changes** in `prisma/schema.prisma`
- [ ] **Ensure no active user sessions** or put application in maintenance mode
- [ ] **Test on staging environment first** (if available)
- [ ] **Set environment variable for Prisma consent**:
  ```bash
  # Windows PowerShell
  $env:PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION="1"

  # Windows CMD
  set PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION=1

  # Linux/Mac
  export PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION=1
  ```

---

## 🚀 Migration Steps

### Step 1: Install Dependencies

Ensure you have the latest Prisma version:

```bash
pnpm install
```

### Step 2: Generate Prisma Client

Generate the Prisma client with the new schema:

```bash
pnpm prisma generate
```

### Step 3: Create Migration

Create the migration file:

```bash
# This will create a new migration with all schema changes
pnpm prisma migrate dev --name add_rbac_organization_management
```

**What this does**:
- Creates new tables: `Organization`, `OrganizationMember`, `Role`, `Permission`, `RolePermission`, `OrganizationInvitation`
- Adds `organizationId` and `visibility` columns to `Survey` table
- Adds organization relationships to `User` table
- Creates indexes for optimal query performance

### Step 4: Run Seed Script

Seed the database with system permissions and roles:

```bash
pnpm prisma db seed
```

**What this seeds**:
- 9 system permissions (manage_organization, manage_users, manage_roles, etc.)
- 3 system roles:
  - **Owner**: 9 permissions (full access)
  - **Admin**: 6 permissions (no manage_organization)
  - **Agent**: 3 permissions (create/manage own surveys)

### Step 5: Verify Migration

Check that all tables were created successfully:

```bash
pnpm prisma studio
```

Navigate to the following tables and verify they exist:
- ✅ Organization
- ✅ OrganizationMember
- ✅ Role (should have 3 system roles)
- ✅ Permission (should have 9 permissions)
- ✅ RolePermission
- ✅ OrganizationInvitation
- ✅ Survey (check for new `organizationId` and `visibility` columns)

---

## 📊 Expected Database State After Migration

### System Permissions (9 total)

| Permission Name | Category | Description |
|----------------|----------|-------------|
| `manage_organization` | organization | Edit organization settings and delete organization |
| `manage_users` | organization | Invite, remove, and change roles of organization members |
| `manage_roles` | organization | Create, edit, and delete custom roles |
| `create_surveys` | surveys | Create new surveys in the organization |
| `manage_all_surveys` | surveys | Edit and delete all organization surveys |
| `manage_own_surveys` | surveys | Edit and delete only surveys you created |
| `view_all_analytics` | analytics | View analytics for all organization surveys |
| `view_own_analytics` | analytics | View analytics only for surveys you created |
| `export_data` | data | Export survey responses to CSV |

### System Roles (3 total)

| Role | Permissions | Use Case |
|------|------------|----------|
| **Owner** | All 9 permissions | Organization owner, full control |
| **Admin** | 6 permissions (all except `manage_organization`) | Team lead, can manage everything except org settings |
| **Agent** | 3 permissions (`create_surveys`, `manage_own_surveys`, `view_own_analytics`) | Regular team member, limited access |

---

## 🔄 Backward Compatibility

### Existing Surveys

All existing surveys will remain **personal surveys** (not associated with any organization):
- `organizationId` will be `NULL`
- `visibility` will default to `organization` (but has no effect without organizationId)
- Users retain full access to their existing surveys

### Migration Path for Existing Surveys

If you want to migrate existing surveys to an organization:

1. Create an organization for the user
2. Update the survey's `organizationId`:
   ```sql
   UPDATE "Survey"
   SET "organizationId" = 'org-id-here'
   WHERE "userId" = 'user-id-here';
   ```

---

## ⏮️ Rollback Instructions

If you need to rollback the migration:

### Option 1: Restore from Backup (Recommended)

```bash
# PostgreSQL restore example
psql -h localhost -U your_user -d survey_db < backup_pre_epic5_TIMESTAMP.sql
```

### Option 2: Manual Rollback Migration

Create a rollback migration:

```bash
pnpm prisma migrate dev --name rollback_rbac_organization_management
```

Then manually edit the migration file to drop the new tables:

```sql
-- Drop new tables (in order to avoid foreign key constraints)
DROP TABLE IF EXISTS "OrganizationInvitation" CASCADE;
DROP TABLE IF EXISTS "RolePermission" CASCADE;
DROP TABLE IF EXISTS "Permission" CASCADE;
DROP TABLE IF EXISTS "OrganizationMember" CASCADE;
DROP TABLE IF EXISTS "Role" CASCADE;
DROP TABLE IF EXISTS "Organization" CASCADE;

-- Drop new enum
DROP TYPE IF EXISTS "SurveyVisibility";

-- Remove new columns from Survey
ALTER TABLE "Survey" DROP COLUMN IF EXISTS "organizationId";
ALTER TABLE "Survey" DROP COLUMN IF EXISTS "visibility";

-- Note: User table changes are relationships only, no column drops needed
```

Apply the rollback:

```bash
pnpm prisma migrate deploy
```

---

## 🧪 Testing the Migration

### Test 1: Verify Permissions

```bash
pnpm prisma studio
```

Navigate to `Permission` table and verify 9 records exist.

### Test 2: Verify Roles

Navigate to `Role` table and verify:
- 3 records exist
- All have `isSystemRole = true`
- Names are: Owner, Admin, Agent

### Test 3: Verify Role-Permission Mappings

Navigate to `RolePermission` table and verify:
- Owner has 9 permissions
- Admin has 6 permissions
- Agent has 3 permissions

### Test 4: Create Test Organization

```typescript
// Run this in Prisma Studio or via script
const testOrg = await prisma.organization.create({
  data: {
    name: 'Test Organization',
    slug: 'test-org',
    description: 'Test organization for migration verification',
  },
});
```

### Test 5: Verify Existing Surveys

```sql
SELECT id, title, "userId", "organizationId", visibility
FROM "Survey"
LIMIT 10;
```

Verify:
- Existing surveys have `organizationId = NULL`
- All surveys have a `visibility` value

---

## 🐛 Troubleshooting

### Error: "Foreign key constraint fails"

**Cause**: Trying to delete/modify data that has dependencies.
**Solution**: Follow the correct deletion order (child → parent).

### Error: "Unique constraint violation on organizationId_name"

**Cause**: Trying to create duplicate role names in the same organization.
**Solution**: Ensure role names are unique per organization.

### Error: "Cannot create organization member without valid roleId"

**Cause**: Attempting to add a member without a role.
**Solution**: Ensure system roles are seeded before creating organization members.

### Migration Hangs or Times Out

**Cause**: Large database with many surveys/responses.
**Solution**:
1. Increase migration timeout
2. Run migration during low-traffic period
3. Consider maintenance window

---

## 📝 Post-Migration Tasks

After successful migration:

1. **Update Application Code**:
   - Implement organization management UI
   - Add permission middleware to API routes
   - Update survey creation to support organizations

2. **User Communication**:
   - Notify users about new organization features
   - Provide documentation/tutorials
   - Offer migration assistance for moving personal surveys to organizations

3. **Monitor Performance**:
   - Watch for slow queries on new tables
   - Verify indexes are being used
   - Monitor database size growth

4. **Security Audit**:
   - Test permission enforcement
   - Verify no unauthorized access
   - Test role-based restrictions

---

## 📚 Additional Resources

- **PRD**: `docs/prd.md` - Epic 5
- **Architecture**: `docs/architecture.md` - Database Schema section
- **Prisma Schema**: `prisma/schema.prisma`
- **Seed Script**: `prisma/seed.ts`

---

## ✅ Migration Checklist Summary

- [ ] Database backed up
- [ ] Dependencies installed
- [ ] Prisma client generated
- [ ] Migration created and applied
- [ ] Seed script executed successfully
- [ ] Verified all tables created
- [ ] Verified permissions (9 records)
- [ ] Verified roles (3 records)
- [ ] Verified role-permission mappings
- [ ] Tested creating organization
- [ ] Verified existing surveys intact
- [ ] Application code updated
- [ ] Users notified

---

**Need Help?** Check the troubleshooting section above or review the Epic 5 stories in `docs/prd.md`.
