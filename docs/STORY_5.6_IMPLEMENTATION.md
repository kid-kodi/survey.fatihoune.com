# Story 5.6: Manage Organization Members - Implementation Guide

**Status**: ✅ Complete
**Epic**: Epic 5 - RBAC & Organization Management
**Date**: 2025-11-03

---

## 📋 Story Overview

**User Story**:
As an organization owner or admin, I want to view and manage organization members, so that I can control who has access and what they can do.

**Implementation Summary**:
This story implements a complete member management system with role-based access control, allowing organization administrators to view all members, change their roles, and remove them from the organization. The system includes comprehensive validation to prevent common issues like removing the last owner or self-removal.

---

## ✅ Acceptance Criteria Checklist

- [x] **AC1**: Organization settings "Members" tab displays list of all members
- [x] **AC2**: Member list shows: name, email, role, joined date, actions
- [x] **AC3**: Owner can change member roles via dropdown
- [x] **AC4**: Role change API endpoint (PATCH /api/organizations/[id]/members/[memberId])
- [x] **AC5**: Owner can remove members via "Remove" button
- [x] **AC6**: Remove member shows confirmation dialog
- [x] **AC7**: Removing member deletes OrganizationMember record
- [x] **AC8**: Removing member revokes access to organization surveys
- [x] **AC9**: Members with manage_users permission can manage other members
- [x] **AC10**: Members cannot remove themselves (must leave organization)
- [x] **AC11**: Organization must have at least one Owner (prevent removing last owner)
- [x] **AC12**: Real-time updates when member roles change
- [x] **AC13**: All table headers, labels, and messages translated

---

## 📁 Files Created/Modified

### 1. API Endpoints

#### GET /api/organizations/[id]/route.ts ✅ NEW
**Purpose**: Get organization details

**Response**:
```json
{
  "organization": {
    "id": "org-123",
    "name": "Acme Corp",
    "slug": "acme-corp",
    "description": "Our company",
    "role": "Owner",
    "memberCount": 5,
    "surveyCount": 12,
    "createdAt": "2025-11-03T...",
    "updatedAt": "2025-11-03T..."
  }
}
```

#### GET /api/organizations/[id]/permissions/route.ts ✅ NEW
**Purpose**: Get current user's permissions for an organization

**Response**:
```json
{
  "role": "Admin",
  "permissions": [
    "manage_users",
    "create_surveys",
    "manage_all_surveys",
    "view_all_analytics",
    "export_data"
  ]
}
```

#### GET /api/organizations/[id]/members/route.ts ✅ EXISTING
**Purpose**: Get all members of an organization

**Response**:
```json
{
  "members": [
    {
      "id": "member-123",
      "userId": "user-456",
      "name": "John Doe",
      "email": "john@example.com",
      "image": "https://...",
      "role": {
        "id": "role-789",
        "name": "Owner",
        "description": "Full access",
        "isSystemRole": false
      },
      "joinedAt": "2025-11-01T..."
    }
  ]
}
```

#### PATCH /api/organizations/[id]/members/[memberId]/route.ts ✅ EXISTING
**Purpose**: Update a member's role

**Request**:
```json
{
  "roleId": "role-new-id"
}
```

**Response**:
```json
{
  "member": {
    "id": "member-123",
    "userId": "user-456",
    "name": "John Doe",
    "email": "john@example.com",
    "role": {
      "id": "role-new-id",
      "name": "Admin",
      "description": "..."
    },
    "joinedAt": "2025-11-01T..."
  }
}
```

**Validation**:
- ✅ Checks `manage_users` permission
- ✅ Validates new role belongs to organization
- ✅ Prevents removing last owner (changing owner to non-owner)
- ✅ Returns 403 if no permission
- ✅ Returns 404 if member not found
- ✅ Returns 400 if invalid role

#### DELETE /api/organizations/[id]/members/[memberId]/route.ts ✅ EXISTING
**Purpose**: Remove a member from the organization

**Response**:
```json
{
  "message": "Member removed successfully"
}
```

**Validation**:
- ✅ Checks `manage_users` permission
- ✅ Prevents self-removal (returns error)
- ✅ Prevents removing last owner
- ✅ Returns 403 if no permission
- ✅ Returns 404 if member not found
- ✅ Returns 400 if attempting to remove self or last owner

#### GET /api/auth/session/route.ts ✅ NEW
**Purpose**: Get current user session

**Response**:
```json
{
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe",
    "image": "https://..."
  }
}
```

### 2. UI Components

#### ManageMembers Component
**File**: `components/organizations/ManageMembers.tsx` ✅ NEW

**Features**:
- Member table with avatar, name, email, role, joined date
- Search/filter members by name, email, or role
- Role dropdown for changing member roles (inline editing)
- Remove button with confirmation dialog
- Permission-based UI (hides actions if no permission)
- Real-time updates after role change or removal
- Loading states during operations
- Full i18n support (EN/FR)

**Props**:
```typescript
interface ManageMembersProps {
  organizationId: string;      // Organization ID
  currentUserId: string;        // Current user's ID
  canManageUsers: boolean;      // Permission flag
}
```

**Key Features**:
1. **Member Table**:
   - Avatar with fallback initials
   - Name and email display
   - "You" badge for current user
   - Role display (badge or dropdown)
   - Joined date formatting
   - Remove button (hidden for current user)

2. **Role Change**:
   - Dropdown with all organization roles
   - System role badge indicator
   - Disabled during update operation
   - Toast notification on success/error
   - Auto-refresh member list after change

3. **Remove Member**:
   - Confirmation dialog before removal
   - Prevents self-removal (no button shown)
   - Prevents removing last owner (API validates)
   - Toast notification on success/error
   - Auto-refresh member list after removal

4. **Search**:
   - Real-time filtering
   - Searches name, email, and role
   - Case-insensitive

#### Organization Settings Page
**File**: `app/organizations/[id]/settings/page.tsx` ✅ NEW

**Features**:
- Tabbed interface: Members, Roles, General
- Permission-based tab visibility
- Back to dashboard button
- Organization name in header
- Members tab with ManageMembers component
- Invite Member button in header
- Pending invitations section
- Full i18n support

**Tabs**:
1. **Members Tab** (always visible):
   - ManageMembers component
   - Invite Member button (if has permission)
   - Pending invitations section (placeholder)

2. **Roles Tab** (requires `manage_roles`):
   - Placeholder for Story 5.7
   - Disabled if no permission

3. **General Tab** (requires `manage_organization`):
   - Placeholder for future settings
   - Disabled if no permission

### 3. Dashboard Integration
**File**: `app/dashboard/page.tsx` ✅ MODIFIED

**Changes**:
- Added "Organization Settings" button when in organization context
- Button appears next to "Invite Member" button
- Routes to `/organizations/[id]/settings`
- Only visible when not in personal workspace

**Location**: Header section, after organization name

---

## 🔄 User Flow

### Viewing Members

```
1. User navigates to dashboard
2. Switches to an organization (via selector)
3. Clicks "Organization Settings" button
           ↓
4. Settings page loads with Members tab active
           ↓
5. Fetches organization details
6. Fetches user permissions
7. Fetches all members
           ↓
8. Displays member table with:
   - Name, email, avatar
   - Role (dropdown if can manage)
   - Joined date
   - Remove button (if can manage)
```

### Changing Member Role

```
1. User with manage_users permission opens settings
2. Views member list
3. Clicks role dropdown for a member
           ↓
4. Dropdown shows all organization roles
5. User selects new role
           ↓
6. PATCH /api/organizations/[id]/members/[memberId]
           ↓
7. API validates:
   - User has manage_users permission
   - New role exists and belongs to organization
   - Not removing last owner (if changing from Owner)
           ↓
8. Updates member's roleId in database
           ↓
9. Returns updated member
           ↓
10. Success toast shown
11. Member list refreshes
12. Member row updates with new role
```

### Removing Member

```
1. User with manage_users permission opens settings
2. Views member list
3. Clicks "Remove" button for a member
           ↓
4. Confirmation dialog opens
5. User confirms removal
           ↓
6. DELETE /api/organizations/[id]/members/[memberId]
           ↓
7. API validates:
   - User has manage_users permission
   - Not attempting to remove self
   - Not removing last owner
           ↓
8. Deletes OrganizationMember record
           ↓
9. Returns success message
           ↓
10. Success toast shown
11. Member list refreshes
12. Member row removed from table
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

3. **Create test data**:
   - Create organization
   - Invite and accept 2-3 members with different roles

### Test Cases

#### Test 1: View Members Tab
1. Login as organization owner
2. Navigate to dashboard
3. Switch to an organization
4. Click "Organization Settings"
5. **Expected**: Settings page opens with Members tab active
6. **Expected**: Member table displays all members
7. **Expected**: Each member shows name, email, role, joined date

#### Test 2: Search Members
1. Open organization settings
2. Type in search box
3. **Expected**: Member list filters in real-time
4. Try searching by:
   - Name
   - Email
   - Role
5. **Expected**: All searches work correctly

#### Test 3: Change Member Role (Owner)
1. Login as organization owner
2. Open organization settings
3. Find a member with "Admin" role
4. Click role dropdown
5. Select "Agent"
6. **Expected**: Dropdown disabled during update
7. **Expected**: Success toast shown
8. **Expected**: Member's role updates to "Agent"
9. Check database:
   ```sql
   SELECT u.name, r.name as role
   FROM "OrganizationMember" om
   JOIN "User" u ON om."userId" = u.id
   JOIN "Role" r ON om."roleId" = r.id
   WHERE om."organizationId" = 'org-id';
   ```
10. **Expected**: Role updated in database

#### Test 4: Prevent Changing Last Owner
1. Ensure organization has only 1 owner
2. Try changing owner's role to "Admin"
3. **Expected**: Error toast "Organization must have at least one owner"
4. **Expected**: Role remains "Owner"

#### Test 5: Remove Member (Owner)
1. Login as organization owner
2. Open organization settings
3. Find a member (not yourself)
4. Click "Remove" button
5. **Expected**: Confirmation dialog appears
6. Click "Cancel"
7. **Expected**: Dialog closes, member remains
8. Click "Remove" again and confirm
9. **Expected**: Success toast shown
10. **Expected**: Member removed from list
11. Check database:
    ```sql
    SELECT * FROM "OrganizationMember"
    WHERE "userId" = 'removed-user-id'
    AND "organizationId" = 'org-id';
    ```
12. **Expected**: No records found

#### Test 6: Prevent Self-Removal
1. Login as organization member
2. Open organization settings
3. Find your own row in members table
4. **Expected**: No "Remove" button visible
5. Try API call directly:
   ```bash
   curl -X DELETE http://localhost:3000/api/organizations/org-id/members/your-member-id \
     -H "Cookie: your-session-cookie"
   ```
6. **Expected**: 400 error "You cannot remove yourself..."

#### Test 7: Prevent Removing Last Owner
1. Ensure organization has only 1 owner
2. Try to remove the owner via API
3. **Expected**: 400 error "Cannot remove the last owner..."
4. **Expected**: Owner remains in member list

#### Test 8: Permission Check (Admin with manage_users)
1. Login as user with "Admin" role (has manage_users)
2. Open organization settings
3. **Expected**: Can see role dropdowns
4. **Expected**: Can see remove buttons
5. Change a member's role
6. **Expected**: Success

#### Test 9: Permission Check (Agent without manage_users)
1. Login as user with "Agent" role (no manage_users)
2. Open organization settings
3. **Expected**: Members tab visible
4. **Expected**: Member list shows all members
5. **Expected**: No role dropdowns (shows badges instead)
6. **Expected**: No remove buttons
7. **Expected**: No "Invite Member" button

#### Test 10: Role Dropdown Shows All Roles
1. Create custom roles in organization
2. Open organization settings
3. Click role dropdown for a member
4. **Expected**: Shows all organization roles:
   - Owner (System Role badge)
   - Admin (System Role badge)
   - Agent (System Role badge)
   - Custom Role 1
   - Custom Role 2

#### Test 11: Avatar Display
1. Invite member with profile image
2. Invite member without profile image
3. Open organization settings
4. **Expected**: Member with image shows avatar
5. **Expected**: Member without image shows initials
6. **Expected**: Initials are first letters of name (e.g., "JD" for John Doe)

#### Test 12: "You" Badge Display
1. Open organization settings
2. Find your own row
3. **Expected**: "You" badge appears next to your name
4. **Expected**: Badge has secondary variant styling

#### Test 13: Joined Date Formatting
1. Open organization settings
2. Check joined dates
3. **Expected**: Dates formatted as "Nov 3, 2025" or similar
4. **Expected**: All dates use same format

#### Test 14: Empty State
1. Create new organization (only you as member)
2. Remove yourself (via API workaround or DB)
3. Open organization settings
4. **Expected**: Shows empty state message
5. **Expected**: "No members" text displayed

#### Test 15: Loading States
1. Open organization settings
2. **Expected**: Loading spinner shows while fetching
3. Change member's role
4. **Expected**: Dropdown disabled during update
5. Remove member
6. **Expected**: Appropriate loading indicators

#### Test 16: French Localization
1. Change browser language to French
2. Open organization settings
3. **Expected**: All UI in French:
   - "Membres" tab
   - "Rejoint" for joined date
   - "Retirer" for remove button
   - "Rechercher des membres..." for search
   - Success/error messages in French

#### Test 17: Organization Settings Button Visibility
1. Login and go to dashboard
2. Switch to "Personal Workspace"
3. **Expected**: No "Organization Settings" button
4. Switch to an organization
5. **Expected**: "Organization Settings" button appears
6. Click button
7. **Expected**: Navigates to settings page

#### Test 18: Navigation and Back Button
1. From dashboard, open organization settings
2. Click "Back to Dashboard" button
3. **Expected**: Returns to dashboard
4. **Expected**: Still in same organization context

---

## 🗄️ Database Verification

### Check Member Role Changed
```sql
SELECT
  om.id,
  u.name as member_name,
  r.name as role_name,
  om."updatedAt"
FROM "OrganizationMember" om
JOIN "User" u ON om."userId" = u.id
JOIN "Role" r ON om."roleId" = r.id
WHERE om."organizationId" = 'org-id'
ORDER BY om."updatedAt" DESC;
```

### Check Member Removed
```sql
-- Should return 0 rows after removal
SELECT COUNT(*) as should_be_zero
FROM "OrganizationMember"
WHERE "userId" = 'removed-user-id'
AND "organizationId" = 'org-id';
```

### Check Owner Count
```sql
SELECT COUNT(*) as owner_count
FROM "OrganizationMember" om
JOIN "Role" r ON om."roleId" = r.id
WHERE om."organizationId" = 'org-id'
AND r.name = 'Owner';
-- Should always be >= 1
```

---

## 🔧 Troubleshooting

### Issue: "You don't have permission to manage users"

**Cause**: User lacks `manage_users` permission.

**Solution**: Verify role permissions:
```sql
SELECT
  r.name as role,
  p.name as permission
FROM "OrganizationMember" om
JOIN "Role" r ON om."roleId" = r.id
JOIN "RolePermission" rp ON r.id = rp."roleId"
JOIN "Permission" p ON rp."permissionId" = p.id
WHERE om."userId" = 'user-id'
AND om."organizationId" = 'org-id';
```

Ensure role has `manage_users` permission.

---

### Issue: Settings page shows "Loading..." forever

**Cause**: API request failing.

**Debug**:
1. Check browser console for errors
2. Check Network tab for API responses
3. Verify organization ID in URL is valid

**Solution**: Ensure user is member of organization and organization exists.

---

### Issue: Member list not updating after role change

**Cause**: Refresh not triggered or API error.

**Debug**: Check browser console for fetch errors.

**Solution**:
1. Ensure `fetchMembers()` called after successful update
2. Check API response is successful
3. Verify no JavaScript errors

---

### Issue: Cannot remove last owner

**Expected Behavior**: This is by design.

**Solution**: To remove owner:
1. Promote another member to Owner first
2. Then remove the original owner
3. Or delete the organization entirely

---

### Issue: Role dropdown not showing custom roles

**Cause**: Custom roles not created or API failing.

**Debug**:
```bash
curl http://localhost:3000/api/organizations/org-id/roles \
  -H "Cookie: your-session"
```

**Solution**: Ensure roles API working and custom roles exist.

---

## 🎯 Key Features Delivered

✅ **Complete Member Management** - View all members with details
✅ **Role Management** - Change member roles via inline dropdown
✅ **Member Removal** - Remove members with confirmation
✅ **Permission-Based Access** - UI adapts based on user permissions
✅ **Comprehensive Validation** - Prevents self-removal and last owner removal
✅ **Real-Time Updates** - Member list refreshes after changes
✅ **Search & Filter** - Find members quickly
✅ **Full i18n Support** - English and French translations
✅ **Beautiful UI** - Professional table design with avatars and badges
✅ **Error Handling** - Clear error messages and toast notifications

---

## 🚀 What's Next?

Now that Story 5.6 is complete, you can:

1. **Implement Story 5.7** - Create Custom Roles
   - Build UI for creating/editing roles
   - Permission selection interface
   - Assign custom roles to members

2. **Implement Story 5.8** - Survey Visibility Settings
   - Add visibility selector to survey creation
   - Private vs organization surveys

3. **Implement Story 5.10** - Permission Middleware
   - Protect API routes with permission checks
   - Frontend route guards

4. **Enhance Member Management**:
   - Add "Leave Organization" feature
   - Implement pending invitations view
   - Add member activity logs
   - Bulk role changes

---

## 📚 Related Documentation

- **PRD**: `docs/prd.md` - Epic 5, Story 5.6
- **Story 5.2**: `docs/STORY_5.2_IMPLEMENTATION.md` - Create Organization
- **Story 5.3**: `docs/STORY_5.3_IMPLEMENTATION.md` - Organization Context
- **Story 5.4**: `docs/STORY_5.4_IMPLEMENTATION.md` - Invite Users
- **Migration Guide**: `docs/MIGRATION_EPIC_5.md`

---

## 📝 Implementation Notes

### Design Decisions

1. **Inline Role Editing**: Used dropdown in table instead of separate modal for better UX

2. **No Self-Management**: Users cannot change their own role or remove themselves to prevent accidental lockouts

3. **Last Owner Protection**: Always ensures at least one owner exists to prevent orphaned organizations

4. **Permission-Based UI**: Shows/hides actions based on permissions rather than disabling them

5. **Real-Time Refresh**: Auto-refreshes member list after any change for immediate feedback

### Security Considerations

- All API endpoints verify `manage_users` permission
- Cannot bypass restrictions via direct API calls
- Role changes validated against organization membership
- Self-removal blocked at both UI and API level
- Last owner removal prevented at API level

### Performance

- Member list paginated if needed (future enhancement)
- Search filter happens client-side (fast for < 100 members)
- Optimistic updates not used (waits for API confirmation)
- Avatar images lazy-loaded via Next.js Image component

---

**Implementation Complete** ✅

Story 5.6 is fully implemented with comprehensive member management, role-based access control, and bulletproof validation!

The application is now ready for testing at http://localhost:3000
