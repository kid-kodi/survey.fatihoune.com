# Story 5.2: Create Organization & Default Setup - Implementation Guide

**Status**: ✅ Complete
**Epic**: Epic 5 - RBAC & Organization Management
**Date**: 2025-11-03

---

## 📋 Story Overview

**User Story**:
As a user, I want to create an organization and automatically become its owner, so that I can invite team members to collaborate.

**Implementation Summary**:
This story implements the complete organization creation flow, including API endpoints, database operations, and UI components with full internationalization support.

---

## ✅ Acceptance Criteria Checklist

- [x] **AC1**: "Create Organization" button added to dashboard with i18n key `Organization.create_organization`
- [x] **AC2**: Create organization form with fields: Organization Name (required), Description (optional) - fully translated
- [x] **AC3**: API endpoint created (POST /api/organizations) with Zod validation
- [x] **AC4**: Organization slug auto-generated from name (lowercase, hyphenated)
- [x] **AC5**: Slug uniqueness validated (append numbers if conflict)
- [x] **AC6**: Creating organization automatically creates OrganizationMember record with Owner role
- [x] **AC7**: Default roles (Owner, Admin, Agent) automatically created for organization with permissions
- [x] **AC8**: Success notification shown (i18n: `Organization.created_successfully`)
- [x] **AC9**: Error handling for failures (i18n: `Organization.create_failed`)
- [x] **AC10**: All UI labels and messages fully translated (en.json, fr.json)
- [x] **AC11**: User automatically becomes owner with full permissions

---

## 📁 Files Created

### 1. Utility Functions
**File**: `lib/utils/slug.ts`
**Purpose**: Generate and validate URL-safe slugs
**Functions**:
- `generateSlug(text: string)` - Converts text to URL-safe slug
- `makeSlugUnique(baseSlug: string, existingSlugs: string[])` - Ensures slug uniqueness
- `isValidSlug(slug: string)` - Validates slug format

**Example**:
```typescript
generateSlug("My Organization Name") // "my-organization-name"
makeSlugUnique("my-org", ["my-org", "my-org-1"]) // "my-org-2"
```

### 2. Organization Repository
**File**: `lib/repositories/organization-repository.ts`
**Purpose**: Data access layer for organization operations
**Methods**:
- `findById(organizationId)` - Get organization with members
- `findBySlug(slug)` - Find by URL slug
- `findByUserId(userId)` - Get all user's organizations
- `generateUniqueSlug(name)` - Generate collision-free slug
- `create(data)` - Create org with owner and default roles
- `update(organizationId, data)` - Update organization
- `delete(organizationId)` - Delete organization
- `isMember(organizationId, userId)` - Check membership
- `getUserRole(organizationId, userId)` - Get user's role with permissions

### 3. API Route
**File**: `app/api/organizations/route.ts`
**Endpoints**:

#### GET /api/organizations
Returns all organizations for authenticated user.

**Response**:
```json
{
  "organizations": [
    {
      "id": "org-123",
      "name": "Acme Corp",
      "slug": "acme-corp",
      "description": "Our organization",
      "createdAt": "2025-11-03T...",
      "updatedAt": "2025-11-03T...",
      "role": "Owner",
      "memberCount": 5,
      "surveyCount": 12
    }
  ]
}
```

#### POST /api/organizations
Creates a new organization.

**Request**:
```json
{
  "name": "Acme Corporation",
  "description": "Optional description"
}
```

**Response (201)**:
```json
{
  "organization": {
    "id": "org-123",
    "name": "Acme Corporation",
    "slug": "acme-corporation",
    "description": "Optional description",
    "role": "Owner",
    "memberCount": 1,
    "surveyCount": 0
  }
}
```

**Errors**:
- 401: Unauthorized (no session)
- 400: Validation error (invalid input)
- 500: Server error

### 4. UI Component
**File**: `components/organizations/CreateOrganizationModal.tsx`
**Features**:
- Modal dialog with form
- react-hook-form with Zod validation
- Full i18n support (English & French)
- Loading states during submission
- Success/error toast notifications
- Auto-refresh after creation

**Props**:
```typescript
interface CreateOrganizationModalProps {
  trigger?: React.ReactNode;  // Custom trigger button
  onSuccess?: (organization: any) => void;  // Callback after creation
}
```

### 5. Dashboard Integration
**File**: `app/dashboard/page.tsx` (updated)
**Changes**:
- Added import for `CreateOrganizationModal`
- Added button to header section next to "Create Survey"
- Button displays with Building2 icon and translated text

---

## 🔄 Flow Diagram

```
User clicks "Create Organization" button
           ↓
Modal opens with form
           ↓
User enters: Name (required), Description (optional)
           ↓
Form validates with Zod schema
           ↓
POST /api/organizations
           ↓
API validates session (better-auth)
           ↓
API validates request body (Zod)
           ↓
Repository generates unique slug
           ↓
Database transaction begins:
  1. Create Organization
  2. Copy 3 system roles (Owner, Admin, Agent)
  3. Copy all role permissions
  4. Create OrganizationMember (user + Owner role)
           ↓
Transaction commits
           ↓
Success response returned
           ↓
Modal closes, toast shown, dashboard refreshes
           ↓
User sees new organization in list
```

---

## 🧪 Testing Guide

### Prerequisites

1. **Run Migration**:
   ```bash
   pnpm prisma migrate dev --name add_rbac_organization_management
   ```

2. **Seed Database**:
   ```bash
   pnpm prisma db seed
   ```

3. **Start Development Server**:
   ```bash
   pnpm dev
   ```

### Manual Test Cases

#### Test 1: Create Organization Successfully
1. Navigate to dashboard (`/dashboard`)
2. Click "Create Organization" button
3. Enter:
   - Name: "Test Organization"
   - Description: "This is a test"
4. Click "Create Organization"
5. **Expected**:
   - Success toast: "Organization created successfully!"
   - Modal closes
   - Dashboard refreshes
   - Organization accessible

#### Test 2: Validation - Empty Name
1. Click "Create Organization"
2. Leave name empty
3. Click "Create Organization"
4. **Expected**: Error message "Organization name is required"

#### Test 3: Validation - Name Too Long
1. Click "Create Organization"
2. Enter name with 101+ characters
3. **Expected**: Error message "Organization name must be less than 100 characters"

#### Test 4: Slug Generation
1. Create organization: "My Awesome Company"
2. **Expected**: Slug = "my-awesome-company"
3. Verify in database:
   ```sql
   SELECT slug FROM "Organization" WHERE name = 'My Awesome Company';
   ```

#### Test 5: Slug Uniqueness
1. Create organization: "Test Org"
2. Create another: "Test Org"
3. **Expected**:
   - First slug: "test-org"
   - Second slug: "test-org-1"

#### Test 6: Special Characters in Name
1. Create organization: "Café & Restaurant"
2. **Expected**: Slug = "cafe-restaurant"

#### Test 7: Owner Role Assignment
1. Create organization
2. Query database:
   ```sql
   SELECT
     om.userId,
     r.name as role,
     COUNT(rp.permissionId) as permission_count
   FROM "OrganizationMember" om
   JOIN "Role" r ON om.roleId = r.id
   LEFT JOIN "RolePermission" rp ON r.id = rp.roleId
   WHERE om.organizationId = 'your-org-id'
   GROUP BY om.userId, r.name;
   ```
3. **Expected**: User has "Owner" role with 9 permissions

#### Test 8: Default Roles Created
1. Create organization
2. Query roles:
   ```sql
   SELECT name, "isSystemRole"
   FROM "Role"
   WHERE "organizationId" = 'your-org-id';
   ```
3. **Expected**: 3 roles (Owner, Admin, Agent), `isSystemRole = false`

#### Test 9: Internationalization (French)
1. Change browser language to French (or locale cookie)
2. Click "Créer une organisation"
3. **Expected**: All labels in French
4. Create successfully
5. **Expected**: Toast "Organisation créée avec succès !"

#### Test 10: Network Error Handling
1. Stop backend server
2. Try to create organization
3. **Expected**: Error toast "Failed to create organization"
4. Modal stays open

#### Test 11: Unauthorized Access
1. Log out
2. Try API call:
   ```bash
   curl -X POST http://localhost:3000/api/organizations \
     -H "Content-Type: application/json" \
     -d '{"name":"Test"}'
   ```
3. **Expected**: 401 Unauthorized

---

## 🗄️ Database Verification

### Check Organization Created
```sql
SELECT * FROM "Organization"
WHERE name = 'Your Organization Name';
```

### Check Organization Member
```sql
SELECT
  om.id,
  u.email,
  r.name as role,
  om.joinedAt
FROM "OrganizationMember" om
JOIN "User" u ON om.userId = u.id
JOIN "Role" r ON om.roleId = r.id
WHERE om.organizationId = 'org-id-here';
```

### Check Roles Created for Organization
```sql
SELECT
  r.name,
  r."isSystemRole",
  COUNT(rp.permissionId) as permission_count
FROM "Role" r
LEFT JOIN "RolePermission" rp ON r.id = rp.roleId
WHERE r."organizationId" = 'org-id-here'
GROUP BY r.id, r.name, r."isSystemRole";
```

**Expected Result**:
```
name   | isSystemRole | permission_count
-------|--------------|------------------
Owner  | false        | 9
Admin  | false        | 6
Agent  | false        | 3
```

### Check Permissions Copied Correctly
```sql
SELECT
  r.name as role,
  p.name as permission,
  p.category
FROM "Role" r
JOIN "RolePermission" rp ON r.id = rp.roleId
JOIN "Permission" p ON rp.permissionId = p.id
WHERE r."organizationId" = 'org-id-here'
ORDER BY r.name, p.category, p.name;
```

---

## 🔧 Troubleshooting

### Issue: "System roles not properly seeded"

**Cause**: Database not seeded with system roles and permissions.

**Solution**:
```bash
pnpm prisma db seed
```

### Issue: Modal doesn't open

**Cause**: JavaScript error or missing components.

**Solution**:
1. Check browser console for errors
2. Verify all shadcn/ui components installed:
   ```bash
   npx shadcn@latest add dialog form input textarea button
   ```

### Issue: Slug conflicts not handled

**Cause**: Multiple organizations with same name created simultaneously.

**Solution**: Use database unique constraint. Already handled in schema:
```prisma
slug String @unique
```

### Issue: Translations missing

**Cause**: i18n keys not added to message files.

**Solution**: Verify `messages/en.json` and `messages/fr.json` contain all `Organization.*` keys (already added in Epic 5 implementation).

### Issue: API returns 500 error

**Cause**: Check server logs for specific error.

**Debug**:
```bash
# Check logs
pnpm dev

# Check database connection
pnpm prisma studio
```

---

## 📝 API Usage Examples

### Using fetch (from frontend)
```typescript
const response = await fetch('/api/organizations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'My Organization',
    description: 'Optional description',
  }),
});

const data = await response.json();
console.log(data.organization);
```

### Using curl
```bash
# Create organization
curl -X POST http://localhost:3000/api/organizations \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=YOUR_TOKEN" \
  -d '{
    "name": "Test Organization",
    "description": "Testing API"
  }'

# List user's organizations
curl http://localhost:3000/api/organizations \
  -H "Cookie: better-auth.session_token=YOUR_TOKEN"
```

---

## 🎯 Next Steps

Now that Story 5.2 is complete, proceed with:

1. **Story 5.3**: Organization Switching & Context
   - Add organization selector dropdown to navigation
   - Store current organization in state/session
   - Filter surveys by organization context

2. **Story 5.4**: Invite Users to Organization
   - Build invitation system
   - Email notifications
   - Role selection for invitees

3. **Story 5.10**: Permission Middleware
   - Build reusable permission checking
   - Protect API routes with permissions
   - Add frontend guards

---

## 📚 Related Documentation

- **PRD**: `docs/prd.md` - Epic 5, Story 5.2
- **Architecture**: `docs/architecture.md` - Database Schema
- **Migration Guide**: `docs/MIGRATION_EPIC_5.md`
- **Prisma Schema**: `prisma/schema.prisma`
- **i18n Keys**: `messages/en.json`, `messages/fr.json`

---

**Implementation Complete** ✅
Story 5.2 is fully implemented and ready for testing!
