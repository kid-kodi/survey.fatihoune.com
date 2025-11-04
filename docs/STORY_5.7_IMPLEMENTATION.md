# Story 5.7: Create Custom Roles - Implementation Guide

**Status**: ✅ Complete
**Epic**: Epic 5 - RBAC & Organization Management
**Date**: 2025-11-03

---

## 📋 Story Overview

**User Story**:
As an organization owner, I want to create custom roles with specific permissions, so that I can tailor access control to my team's needs.

**Implementation Summary**:
This story implements a complete role management system allowing organization owners to create, edit, and delete custom roles with granular permission selection. The system includes a beautiful UI with permission checkboxes organized by category, comprehensive validation, and real-time updates.

---

## ✅ Acceptance Criteria Checklist

- [x] **AC1**: Organization settings includes "Roles" tab
- [x] **AC2**: Roles tab displays all roles (system + custom)
- [x] **AC3**: System roles shown with lock icon and label
- [x] **AC4**: "Create Role" button opens role creation modal
- [x] **AC5**: Role form with fields: Role Name (required), Description (optional), Permissions (checkboxes)
- [x] **AC6**: Permission checkboxes organized by category (Organization, Surveys, Analytics, Data)
- [x] **AC7**: Each permission has translated name and description
- [x] **AC8**: API endpoint created (POST /api/organizations/[id]/roles)
- [x] **AC9**: Custom role created with isSystemRole=false
- [x] **AC10**: Custom role appears in role dropdown for invitations and member management
- [x] **AC11**: Role can be edited via "Edit" button
- [x] **AC12**: Role can be deleted if not assigned to any members
- [x] **AC13**: Deleting role shows warning if members have it
- [x] **AC14**: All form labels, categories, and messages fully translated

---

## 📁 Files Created/Modified

### 1. API Endpoints

#### POST /api/organizations/[id]/roles
**File**: `app/api/organizations/[id]/roles/route.ts` ✅ MODIFIED

**Purpose**: Create a new custom role

**Request**:
```json
{
  "name": "Content Editor",
  "description": "Can create and edit content",
  "permissionIds": [
    "perm-create-surveys",
    "perm-manage-own-surveys",
    "perm-view-own-analytics"
  ]
}
```

**Response (201)**:
```json
{
  "role": {
    "id": "role-123",
    "name": "Content Editor",
    "description": "Can create and edit content",
    "isSystemRole": false,
    "permissions": [
      {
        "id": "perm-1",
        "name": "create_surveys",
        "description": "Create new surveys",
        "category": "surveys"
      }
    ],
    "memberCount": 0
  }
}
```

**Validation**:
- ✅ Checks `manage_roles` permission
- ✅ Validates role name is unique in organization
- ✅ Validates permission IDs exist
- ✅ Requires at least one permission
- ✅ Sets isSystemRole=false automatically

#### GET /api/organizations/[id]/roles/[roleId]
**File**: `app/api/organizations/[id]/roles/[roleId]/route.ts` ✅ NEW

**Purpose**: Get a specific role with its permissions

**Response**:
```json
{
  "role": {
    "id": "role-123",
    "name": "Content Editor",
    "description": "...",
    "isSystemRole": false,
    "permissions": [...],
    "memberCount": 3
  }
}
```

#### PATCH /api/organizations/[id]/roles/[roleId]
**File**: `app/api/organizations/[id]/roles/[roleId]/route.ts` ✅ NEW

**Purpose**: Update a custom role

**Request**:
```json
{
  "name": "Senior Editor",
  "description": "Updated description",
  "permissionIds": ["perm-1", "perm-2", "perm-3"]
}
```

**Validation**:
- ✅ Checks `manage_roles` permission
- ✅ Cannot edit system roles
- ✅ Validates new name is unique (if changed)
- ✅ Validates permission IDs exist
- ✅ Updates permissions atomically in transaction

#### DELETE /api/organizations/[id]/roles/[roleId]
**File**: `app/api/organizations/[id]/roles/[roleId]/route.ts` ✅ NEW

**Purpose**: Delete a custom role

**Validation**:
- ✅ Checks `manage_roles` permission
- ✅ Cannot delete system roles
- ✅ Cannot delete if role has members assigned
- ✅ Returns error with member count if in use
- ✅ Deletes role and permissions in transaction

#### GET /api/permissions
**File**: `app/api/permissions/route.ts` ✅ NEW

**Purpose**: Get all available system permissions

**Response**:
```json
{
  "permissions": {
    "organization": [
      {
        "id": "perm-1",
        "name": "manage_organization",
        "description": "Edit organization settings",
        "category": "organization"
      }
    ],
    "surveys": [...],
    "analytics": [...],
    "data": [...]
  },
  "allPermissions": [...]
}
```

---

### 2. UI Components

#### ManageRoles Component
**File**: `components/organizations/ManageRoles.tsx` ✅ NEW

**Features**:
- Displays all roles in a table (system + custom)
- System roles with lock icon and "System Role" badge
- Shows role name, description, permission count, member count
- Edit button for custom roles (opens EditRoleModal)
- Delete button for custom roles (with confirmation)
- Permission-based visibility (requires `manage_roles`)
- Empty state for no roles
- Real-time updates after create/edit/delete

**Props**:
```typescript
interface ManageRolesProps {
  organizationId: string;
  canManageRoles: boolean;
  onEditRole?: (role: Role) => void;
  onRefresh?: () => void;
}
```

#### CreateRoleModal Component
**File**: `components/organizations/CreateRoleModal.tsx` ✅ NEW

**Features**:
- Modal dialog with form
- Role name input (required, max 50 chars)
- Description textarea (optional)
- Permission checkboxes organized by category
- Categories: Organization, Surveys, Analytics, Data
- Each permission shows translated name and description
- Validation with react-hook-form + Zod
- Loading states
- Full i18n support (EN/FR)
- Scrollable content for long permission lists

**Props**:
```typescript
interface CreateRoleModalProps {
  organizationId: string;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}
```

**Permission Categories**:
1. **Organization** (i18n: `Organization.category_organization`):
   - manage_organization
   - manage_users
   - manage_roles

2. **Surveys** (i18n: `Organization.category_surveys`):
   - create_surveys
   - manage_all_surveys
   - manage_own_surveys

3. **Analytics** (i18n: `Organization.category_analytics`):
   - view_all_analytics
   - view_own_analytics

4. **Data** (i18n: `Organization.category_data`):
   - export_data

#### EditRoleModal Component
**File**: `components/organizations/EditRoleModal.tsx` ✅ NEW

**Features**:
- Similar to CreateRoleModal but pre-fills existing data
- Loads role data with permissions on open
- Updates role and permissions in one transaction
- Cannot edit system roles (disabled at parent level)
- Full validation and error handling

**Props**:
```typescript
interface EditRoleModalProps {
  organizationId: string;
  role: Role | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}
```

---

### 3. Organization Settings Integration
**File**: `app/organizations/[id]/settings/page.tsx` ✅ MODIFIED

**Changes**:
1. Added imports for role components
2. Added state for editing role and refresh key
3. Updated Roles tab with:
   - ManageRoles component
   - CreateRoleModal in header
   - EditRoleModal at page level (controlled by state)
4. Integrated refresh mechanism

---

## 🔄 User Flows

### Creating a Custom Role

```
1. User opens Organization Settings
2. Clicks "Roles" tab
           ↓
3. Clicks "Create Role" button
           ↓
4. Modal opens with form
           ↓
5. User enters:
   - Name: "Content Editor"
   - Description: "Can create and edit surveys"
   - Permissions: [create_surveys, manage_own_surveys, view_own_analytics]
           ↓
6. Clicks "Create Role"
           ↓
7. POST /api/organizations/[id]/roles
           ↓
8. API validates:
   - User has manage_roles permission
   - Role name doesn't exist
   - All permission IDs valid
           ↓
9. Creates role with isSystemRole=false
10. Creates RolePermission records
           ↓
11. Success toast shown
12. Modal closes
13. Roles list refreshes
14. New role appears in table
```

### Editing a Custom Role

```
1. User opens Roles tab
2. Finds custom role in table
3. Clicks "Edit Role" button
           ↓
4. EditRoleModal opens
5. Loads existing role data
6. Fetches all permissions
           ↓
7. User modifies:
   - Name or description
   - Checks/unchecks permissions
           ↓
8. Clicks "Save Changes"
           ↓
9. PATCH /api/organizations/[id]/roles/[roleId]
           ↓
10. API validates:
    - User has manage_roles permission
    - Role is not a system role
    - New name is unique (if changed)
           ↓
11. Updates role in transaction:
    - Updates name/description
    - Deletes old permissions
    - Creates new permissions
           ↓
12. Success toast shown
13. Modal closes
14. Roles list refreshes
15. Updated role shows new data
```

### Deleting a Custom Role

```
1. User opens Roles tab
2. Finds custom role with 0 members
3. Clicks "Delete Role" button
           ↓
4. Confirmation dialog appears
5. User clicks confirm
           ↓
6. DELETE /api/organizations/[id]/roles/[roleId]
           ↓
7. API validates:
   - User has manage_roles permission
   - Role is not a system role
   - Role has no members assigned
           ↓
8. Deletes in transaction:
   - RolePermission records
   - Role record
           ↓
9. Success toast shown
10. Roles list refreshes
11. Role removed from table
```

### Attempting to Delete Role In Use

```
1. User tries to delete role with members
2. Clicks "Delete Role" button
3. Confirms deletion
           ↓
4. API checks member count
5. Finds 3 members with this role
           ↓
6. Returns 400 error:
   "This role is assigned to 3 member(s) and cannot be deleted"
           ↓
7. Error toast shown
8. Role remains in table
9. User must reassign members first
```

---

## 🧪 Testing Guide

### Prerequisites

1. **Ensure Epic 5 migration completed**:
   ```bash
   pnpm prisma migrate dev
   pnpm prisma db seed
   ```

2. **Start development server**:
   ```bash
   pnpm dev
   ```

3. **Create test organization** with you as Owner

### Test Cases

#### Test 1: View Roles Tab
1. Login as organization owner
2. Navigate to Organization Settings
3. Click "Roles" tab
4. **Expected**: Tab is enabled and active
5. **Expected**: Shows table with 3 system roles:
   - Owner (9 permissions, lock icon, "System Role" badge)
   - Admin (6 permissions, lock icon, "System Role" badge)
   - Agent (3 permissions, lock icon, "System Role" badge)

#### Test 2: Create Custom Role - Success
1. Click "Create Role" button
2. **Expected**: Modal opens
3. Enter:
   - Name: "Content Editor"
   - Description: "Can create and edit content"
4. **Expected**: Permission checkboxes grouped by category
5. Select permissions:
   - ✓ create_surveys
   - ✓ manage_own_surveys
   - ✓ view_own_analytics
6. Click "Create Role"
7. **Expected**: Success toast "Role created successfully!"
8. **Expected**: Modal closes
9. **Expected**: New role appears in table
10. **Expected**: Shows "3 permissions, 0 members"

#### Test 3: Create Role - Validation Errors
1. Click "Create Role"
2. Leave name empty
3. Click "Create Role"
4. **Expected**: Error "Role name is required"
5. Enter name with 51+ characters
6. **Expected**: Error "Role name must be less than 50 characters"
7. Uncheck all permissions
8. **Expected**: Error "Select at least one permission"

#### Test 4: Create Role - Duplicate Name
1. Create role named "Editor"
2. Try to create another role named "Editor"
3. **Expected**: Error toast "A role with this name already exists"

#### Test 5: Edit Custom Role
1. Find custom role in table
2. Click "Edit Role" button
3. **Expected**: Modal opens with existing data pre-filled
4. Change name to "Senior Editor"
5. Add permission: export_data
6. Click "Save Changes"
7. **Expected**: Success toast
8. **Expected**: Role updated in table

#### Test 6: Cannot Edit System Roles
1. Find "Owner" role in table
2. **Expected**: No "Edit" button visible
3. **Expected**: Shows "Cannot be modified" text

#### Test 7: Delete Custom Role - Success
1. Create role with no members
2. Click "Delete Role" button
3. **Expected**: Confirmation dialog appears
4. Click confirm
5. **Expected**: Success toast "Role deleted successfully"
6. **Expected**: Role removed from table

#### Test 8: Delete Custom Role - Has Members
1. Assign role to a member
2. Try to delete the role
3. **Expected**: Error toast showing member count
4. **Expected**: Role remains in table

#### Test 9: Cannot Delete System Roles
1. Find "Admin" role
2. **Expected**: No "Delete" button visible

#### Test 10: Permission Categories
1. Open "Create Role" modal
2. **Expected**: Permissions grouped under headers:
   - Organization (3 permissions)
   - Surveys (3 permissions)
   - Analytics (2 permissions)
   - Data (1 permission)
3. **Expected**: Each permission shows name and description

#### Test 11: Permission Checkbox Interaction
1. Open "Create Role" modal
2. Check "create_surveys"
3. **Expected**: Checkbox checked
4. Uncheck it
5. **Expected**: Checkbox unchecked
6. Check all Organization permissions
7. **Expected**: All 3 checked

#### Test 12: French Localization
1. Change browser language to French
2. Open Roles tab
3. **Expected**: "Rôles" tab label
4. **Expected**: "Créer un rôle" button
5. Open create modal
6. **Expected**: All categories translated:
   - Organisation
   - Enquêtes
   - Analyses
   - Données
7. **Expected**: Permission names translated

#### Test 13: Permission Check (Owner)
1. Login as organization owner
2. **Expected**: Can see "Create Role" button
3. **Expected**: Can edit custom roles
4. **Expected**: Can delete custom roles

#### Test 14: Permission Check (No manage_roles)
1. Login as Agent (no manage_roles permission)
2. Open Organization Settings
3. **Expected**: Roles tab is disabled
4. Try accessing directly via URL
5. **Expected**: Tab content shows but no action buttons

#### Test 15: Role Appears in Member Management
1. Create custom role "Editor"
2. Go to Members tab
3. Change a member's role
4. **Expected**: "Editor" appears in role dropdown
5. **Expected**: Shows with permission count

#### Test 16: Role Appears in Invitations
1. Create custom role "Viewer"
2. Click "Invite Member"
3. **Expected**: "Viewer" appears in role dropdown
4. Invite user with "Viewer" role
5. **Expected**: Invitation created successfully

#### Test 17: Real-Time Updates
1. Open Roles tab in two browser tabs
2. In tab 1, create a new role
3. In tab 2, manually refresh
4. **Expected**: New role appears
5. In tab 1, edit the role
6. In tab 2, refresh
7. **Expected**: Changes reflected

#### Test 18: Empty State
1. Delete all custom roles
2. **Expected**: Shows 3 system roles only
3. **Expected**: "Create your first custom role" message not shown (system roles exist)

---

## 🗄️ Database Verification

### Check Custom Role Created
```sql
SELECT
  r.id,
  r.name,
  r.description,
  r."isSystemRole",
  r."organizationId",
  COUNT(rp."permissionId") as permission_count,
  COUNT(om.id) as member_count
FROM "Role" r
LEFT JOIN "RolePermission" rp ON r.id = rp."roleId"
LEFT JOIN "OrganizationMember" om ON r.id = om."roleId"
WHERE r."organizationId" = 'org-id'
AND r."isSystemRole" = false
GROUP BY r.id;
```

### Check Role Permissions
```sql
SELECT
  r.name as role_name,
  p.name as permission_name,
  p.category
FROM "Role" r
JOIN "RolePermission" rp ON r.id = rp."roleId"
JOIN "Permission" p ON rp."permissionId" = p.id
WHERE r."organizationId" = 'org-id'
AND r.name = 'Content Editor'
ORDER BY p.category, p.name;
```

### Check Role Member Count
```sql
SELECT
  r.name,
  COUNT(om.id) as member_count
FROM "Role" r
LEFT JOIN "OrganizationMember" om ON r.id = om."roleId"
WHERE r."organizationId" = 'org-id'
GROUP BY r.id, r.name;
```

---

## 🔧 Troubleshooting

### Issue: "You don't have permission to manage roles"

**Cause**: User lacks `manage_roles` permission.

**Solution**: Verify role:
```sql
SELECT
  r.name,
  p.name as permission
FROM "OrganizationMember" om
JOIN "Role" r ON om."roleId" = r.id
JOIN "RolePermission" rp ON r.id = rp."roleId"
JOIN "Permission" p ON rp."permissionId" = p.id
WHERE om."userId" = 'user-id'
AND om."organizationId" = 'org-id';
```

Ensure role has `manage_roles` permission. Only Owner has it by default.

---

### Issue: Permissions not loading in modal

**Cause**: Permissions API failing or not seeded.

**Debug**:
```bash
curl http://localhost:3000/api/permissions \
  -H "Cookie: your-session-cookie"
```

**Solution**: Ensure permissions seeded:
```bash
pnpm prisma db seed
```

---

### Issue: Cannot delete role even with 0 members

**Cause**: Database constraint or API logic issue.

**Debug**: Check member count:
```sql
SELECT COUNT(*) FROM "OrganizationMember"
WHERE "roleId" = 'role-id';
```

**Solution**: Should return 0. If not, reassign members first.

---

### Issue: Created role doesn't appear in member management

**Cause**: Member management not refreshing or role query issue.

**Solution**:
1. Refresh page
2. Check role exists in database
3. Verify role belongs to correct organization

---

### Issue: Permission checkboxes not working

**Cause**: Form state issue or JavaScript error.

**Debug**: Check browser console for errors.

**Solution**: Ensure react-hook-form and Zod properly configured.

---

## 🎯 Key Features Delivered

✅ **Complete Role Management** - Create, edit, delete custom roles
✅ **Granular Permissions** - 9 permissions across 4 categories
✅ **Permission-Based Access** - Only users with `manage_roles` can manage
✅ **System Role Protection** - Cannot edit or delete system roles
✅ **Member Assignment Validation** - Cannot delete roles in use
✅ **Beautiful UI** - Organized checkboxes with categories
✅ **Full i18n Support** - English and French translations
✅ **Real-Time Updates** - Changes reflect immediately
✅ **Transaction Safety** - Atomic operations for consistency

---

## 🚀 What's Next?

Now that Story 5.7 is complete, you can:

1. **Implement Story 5.8** - Survey Visibility Settings
   - Private vs organization surveys
   - Visibility selector in survey creation

2. **Implement Story 5.9** - Permission-Based Survey Access
   - Filter surveys based on permissions
   - Role-based survey visibility

3. **Implement Story 5.10** - Permission Middleware
   - Protect API routes with permission checks
   - Frontend route guards

---

## 📚 Related Documentation

- **PRD**: `docs/prd.md` - Epic 5, Story 5.7
- **Story 5.2**: `docs/STORY_5.2_IMPLEMENTATION.md` - Create Organization
- **Story 5.6**: `docs/STORY_5.6_IMPLEMENTATION.md` - Manage Members
- **Migration Guide**: `docs/MIGRATION_EPIC_5.md`

---

## 📝 Implementation Notes

### Design Decisions

1. **Permission Categories**: Organized into 4 logical groups for better UX

2. **System Role Protection**: System roles are read-only to prevent accidental modification

3. **Member Count Display**: Shows how many members have each role for visibility

4. **Atomic Updates**: All role operations use transactions for data consistency

5. **Checkbox Organization**: Permissions grouped and indented for clarity

### Security Considerations

- All API endpoints verify `manage_roles` permission
- Cannot delete roles with assigned members
- System roles are immutable
- Role names are unique per organization
- Permission IDs are validated before assignment

### Performance

- Permissions fetched once per modal open
- Role list uses refresh key for efficient updates
- No polling - manual refresh required
- Indexed queries for fast lookups

---

**Implementation Complete** ✅

Story 5.7 is fully implemented with comprehensive role management, beautiful permission selection UI, and bulletproof validation!

The application is now ready for testing at **http://localhost:3000**
