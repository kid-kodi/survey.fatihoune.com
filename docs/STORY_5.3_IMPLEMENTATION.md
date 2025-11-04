# Story 5.3: Organization Switching & Context - Implementation Guide

**Status**: ✅ Complete
**Epic**: Epic 5 - RBAC & Organization Management
**Date**: 2025-11-03

---

## 📋 Story Overview

**User Story**:
As a user, I want to view and switch between organizations I belong to, so that I can manage surveys in different contexts.

**Implementation Summary**:
This story implements organization context management throughout the application, allowing users to seamlessly switch between their personal workspace and multiple organizations. All surveys are automatically filtered based on the selected context.

---

## ✅ Acceptance Criteria Checklist

- [x] **AC1**: User navigation includes organization selector dropdown (i18n: `Organization.switch_organization`)
- [x] **AC2**: Dropdown shows all organizations user belongs to
- [x] **AC3**: Current organization highlighted in dropdown
- [x] **AC4**: Clicking organization switches context (updates all views)
- [x] **AC5**: Organization context stored in localStorage (persists across sessions)
- [x] **AC6**: Dashboard filters surveys by current organization
- [x] **AC7**: API requests include organization context (query parameters)
- [x] **AC8**: "Personal" workspace available for user's private surveys
- [x] **AC9**: Organization switch persists across page refreshes
- [x] **AC10**: Empty state shown if user belongs to no organizations
- [x] **AC11**: All dropdown options and labels translated (en.json, fr.json)

---

## 📁 Files Created/Modified

### 1. Organization Context Provider
**File**: `contexts/OrganizationContext.tsx` ✅ NEW
**Purpose**: Global state management for organization context

**Key Features**:
- Manages current organization state
- Fetches user's organizations on mount
- Persists selection to localStorage
- Provides hooks for switching context
- Supports personal workspace mode

**Exports**:
```typescript
type Organization = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  role: string;
  memberCount: number;
  surveyCount: number;
  createdAt: string;
  updatedAt: string;
};

type OrganizationContextType = {
  organizations: Organization[];           // All user's organizations
  currentOrganization: Organization | null; // Selected organization
  isPersonalWorkspace: boolean;            // True if in personal mode
  isLoading: boolean;                      // Loading state
  error: string | null;                    // Error message
  setCurrentOrganization: (org) => void;   // Switch to organization
  switchToPersonalWorkspace: () => void;   // Switch to personal
  refreshOrganizations: () => Promise<void>; // Reload organizations
};

// Hook
function useOrganization(): OrganizationContextType;
```

**localStorage Key**: `current-organization-id`
- Stores organization ID when org selected
- Stores `"personal"` when in personal workspace

### 2. Organization Selector Component
**File**: `components/organizations/OrganizationSelector.tsx` ✅ NEW
**Purpose**: Dropdown UI for switching between organizations

**Features**:
- Combobox with search functionality
- Shows personal workspace option
- Displays all organizations with metadata
- Visual indicators for current selection
- Fully translated (EN/FR)
- Responsive design

**UI Structure**:
```
┌─────────────────────────────┐
│ [Icon] Current Org    [▼]   │ ← Trigger button
└─────────────────────────────┘
           ↓
┌─────────────────────────────────┐
│ Search organizations...         │ ← Search input
├─────────────────────────────────┤
│ Personal                         │
│ [User Icon] Personal Workspace ✓│ ← Personal option
├─────────────────────────────────┤
│ All Organizations                │
│ [Building] Acme Corp             │
│   Owner • 5 members              │
│ [Building] Test Org ✓            │
│   Admin • 3 members              │
└─────────────────────────────────┘
```

### 3. Root Layout Updates
**File**: `app/layout.tsx` ✅ MODIFIED
**Changes**:
- Added `OrganizationProvider` wrapper
- Wraps all pages with organization context

```tsx
<NextIntlClientProvider>
  <OrganizationProvider>
    {children}
    <Toaster />
  </OrganizationProvider>
</NextIntlClientProvider>
```

### 4. Dashboard Updates
**File**: `app/dashboard/page.tsx` ✅ MODIFIED

**Changes**:
1. Added organization selector to navigation bar
2. Import `useOrganization` hook
3. Fetch surveys with organization filter
4. Refresh on organization change
5. Refresh organizations after creating new org

**Key Code**:
```tsx
const { currentOrganization, isPersonalWorkspace, refreshOrganizations } = useOrganization();

// Auto-refresh when organization changes
useEffect(() => {
  if (session?.user) {
    fetchSurveys();
    fetchDashboardStats();
  }
}, [session, currentOrganization, isPersonalWorkspace]);

// Build query params
const params = new URLSearchParams();
if (!isPersonalWorkspace && currentOrganization) {
  params.set("organizationId", currentOrganization.id);
} else {
  params.set("personal", "true");
}

const response = await fetch(`/api/surveys?${params.toString()}`);
```

### 5. Surveys API Updates
**File**: `app/api/surveys/route.ts` ✅ MODIFIED

**Changes**:
- Added query parameter support for `organizationId` and `personal`
- Filter surveys based on organization context
- Maintain backward compatibility

**Query Parameters**:
- `?personal=true` - Returns surveys with `organizationId = null`
- `?organizationId=org-123` - Returns surveys for that organization
- No params - Returns all user's surveys (backward compatible)

**Updated WHERE Clause**:
```typescript
const whereClause: any = {
  userId: session.user.id,
};

if (isPersonal) {
  whereClause.organizationId = null;
} else if (organizationId) {
  whereClause.organizationId = organizationId;
}
```

### 6. i18n Updates
**Files**: `messages/en.json` & `messages/fr.json` ✅ MODIFIED

**New Keys Added**:
```json
{
  "Organization": {
    "search_organizations": "Search organizations..." / "Rechercher des organisations..."
  }
}
```

---

## 🔄 User Flow

### Switching Between Workspaces

```
1. User clicks Organization Selector in nav bar
           ↓
2. Dropdown opens showing:
   - Personal Workspace (checked if current)
   - All organizations user belongs to
           ↓
3. User clicks "Acme Corp"
           ↓
4. Context switches:
   - currentOrganization = Acme Corp object
   - isPersonalWorkspace = false
   - localStorage updated
           ↓
5. Dashboard re-fetches surveys with ?organizationId=acme-corp-id
           ↓
6. API returns only surveys from Acme Corp
           ↓
7. Dashboard displays filtered surveys
```

### Persisting Across Refreshes

```
1. User refreshes page (F5)
           ↓
2. OrganizationProvider mounts
           ↓
3. Reads localStorage: "current-organization-id"
           ↓
4. Fetches organizations from API
           ↓
5. Finds matching organization by ID
           ↓
6. Restores currentOrganization state
           ↓
7. Dashboard uses restored context
```

---

## 🧪 Testing Guide

### Prerequisites

1. **Apply Migration** (if not done):
   ```bash
   pnpm prisma migrate dev
   pnpm prisma db seed
   ```

2. **Start Dev Server**:
   ```bash
   pnpm dev
   ```

3. **Create Multiple Organizations**:
   - Navigate to `/dashboard`
   - Create 2-3 test organizations

### Test Cases

#### Test 1: Organization Selector Appears
1. Navigate to dashboard
2. **Expected**: Organization selector visible in top navigation
3. **Expected**: Shows "Personal Workspace" by default

#### Test 2: View Organizations List
1. Click organization selector
2. **Expected**: Dropdown opens
3. **Expected**: Shows "Personal Workspace" at top
4. **Expected**: Shows all your organizations below separator
5. **Expected**: Each org shows role and member count

#### Test 3: Switch to Organization
1. Click organization selector
2. Click an organization (e.g., "Test Org")
3. **Expected**: Dropdown closes
4. **Expected**: Selector now shows "Test Org"
5. **Expected**: Dashboard refreshes
6. **Expected**: Shows only surveys from "Test Org"

#### Test 4: Switch Back to Personal
1. Click organization selector
2. Click "Personal Workspace"
3. **Expected**: Selector shows "Personal Workspace"
4. **Expected**: Dashboard shows only personal surveys (no organizationId)

#### Test 5: Context Persists Across Refresh
1. Switch to an organization
2. Refresh page (F5)
3. **Expected**: Still in same organization context
4. **Expected**: Surveys still filtered correctly

#### Test 6: Context Persists Across Navigation
1. Switch to organization
2. Navigate to settings (`/settings`)
3. Return to dashboard
4. **Expected**: Still in same organization

#### Test 7: No Organizations State
1. Delete all your organizations (via Prisma Studio)
2. Refresh dashboard
3. **Expected**: Selector shows "Personal Workspace"
4. **Expected**: Clicking shows "No organizations" message

#### Test 8: Organization Creation Integration
1. Click "Create Organization"
2. Create new organization
3. **Expected**: New org appears in selector immediately
4. **Expected**: Context remains in Personal Workspace (doesn't auto-switch)

#### Test 9: Search Functionality
1. Create 5+ organizations
2. Click organization selector
3. Type in search box
4. **Expected**: List filters to matching organizations

#### Test 10: Visual Current Indicator
1. Switch to organization
2. Open selector
3. **Expected**: Checkmark visible next to current organization
4. Switch to personal
5. **Expected**: Checkmark moves to "Personal Workspace"

#### Test 11: French Localization
1. Change browser language to French
2. **Expected**: "Espace personnel" instead of "Personal Workspace"
3. **Expected**: "Toutes les organisations" as header
4. **Expected**: "Rechercher des organisations..." in search

#### Test 12: API Query Parameters
1. Switch to organization
2. Open browser DevTools → Network tab
3. **Expected**: `/api/surveys?organizationId=org-123`
4. Switch to personal
5. **Expected**: `/api/surveys?personal=true`

#### Test 13: localStorage Verification
1. Switch to organization
2. Open DevTools → Application → Local Storage
3. **Expected**: Key `current-organization-id` = organization ID
4. Switch to personal
5. **Expected**: Value changes to `"personal"`

---

## 🗄️ Database Verification

### Check Surveys by Organization

```sql
-- Personal surveys (no organization)
SELECT id, title, "organizationId"
FROM "Survey"
WHERE "userId" = 'your-user-id'
  AND "organizationId" IS NULL;

-- Organization surveys
SELECT id, title, "organizationId"
FROM "Survey"
WHERE "userId" = 'your-user-id'
  AND "organizationId" = 'org-id';

-- All surveys with org info
SELECT
  s.id,
  s.title,
  COALESCE(o.name, 'Personal') as workspace
FROM "Survey" s
LEFT JOIN "Organization" o ON s."organizationId" = o.id
WHERE s."userId" = 'your-user-id'
ORDER BY s."updatedAt" DESC;
```

### Check User's Organizations

```sql
SELECT
  o.id,
  o.name,
  o.slug,
  r.name as role,
  om."joinedAt"
FROM "Organization" o
JOIN "OrganizationMember" om ON o.id = om."organizationId"
JOIN "Role" r ON om."roleId" = r.id
WHERE om."userId" = 'your-user-id'
ORDER BY om."joinedAt" DESC;
```

---

## 🔧 Troubleshooting

### Issue: Selector shows "Loading..." forever

**Cause**: API request failing or session issue.

**Debug**:
1. Check browser console for errors
2. Check Network tab for `/api/organizations` response
3. Verify you're logged in

**Solution**: Ensure user is authenticated and API is responding.

---

### Issue: Surveys not filtering

**Cause**: API not receiving query parameters.

**Debug**:
```typescript
// In dashboard page, add logging:
console.log('Current org:', currentOrganization?.id);
console.log('Is personal:', isPersonalWorkspace);
console.log('Fetching:', `/api/surveys?${params.toString()}`);
```

**Solution**: Verify query params are being built correctly.

---

### Issue: Context doesn't persist after refresh

**Cause**: localStorage not being read or corrupted.

**Debug**:
1. Open DevTools → Application → Local Storage
2. Check `current-organization-id` value
3. Try clearing localStorage and starting fresh

**Solution**:
```javascript
// In browser console:
localStorage.clear();
location.reload();
```

---

### Issue: Dropdown doesn't show organizations

**Cause**: Organizations not fetched or empty array.

**Debug**:
```typescript
// In OrganizationSelector component, add:
console.log('Organizations:', organizations);
```

**Solution**: Verify organizations exist in database and API returns them.

---

### Issue: Checkmark not showing on current org

**Cause**: ID comparison issue.

**Debug**: Check if IDs are strings vs numbers.

**Solution**: Ensure consistent ID types (should be strings with cuid).

---

## 🎨 UI/UX Notes

### Design Decisions

1. **Personal Workspace First**: Always shows personal workspace as first option, separated from organizations. This makes it easy to access personal surveys.

2. **Current Selection Highlighted**: Uses checkmark icon to clearly indicate current workspace.

3. **Metadata Display**: Shows role and member count for each organization to provide context.

4. **Search Integration**: Allows quick filtering when user has many organizations.

5. **Icons for Context**:
   - User icon for personal workspace
   - Building icon for organizations

### Responsive Behavior

- Selector width: `200px` on desktop
- Dropdown width: `250px` for better readability
- Mobile: Full-width on small screens (handled by shadcn/ui)

---

## 🚀 Performance Considerations

### Optimization Strategies

1. **Lazy Loading**: Organizations only fetched when user is authenticated

2. **localStorage Caching**: Reduces API calls by persisting selection

3. **Minimal Re-renders**: Context only updates when selection actually changes

4. **Query Optimization**: Database indexes on `organizationId` for fast filtering

### Expected Load Times

- Organization selector open: < 100ms (already fetched)
- Context switch: < 200ms (just state update)
- Dashboard refresh after switch: < 500ms (filtered query)

---

## 📊 Analytics & Monitoring

### Key Metrics to Track

1. **Organization Switches**: How often users switch contexts
2. **Time in Personal vs Organization**: Usage patterns
3. **Organizations per User**: Average membership count
4. **Context Switch Errors**: Failed switches (rare)

### Logging Points

```typescript
// In OrganizationContext
console.log('[Org Context] Switched to:', organizationId);
console.log('[Org Context] Loaded organizations:', count);
console.log('[Org Context] Error:', error);
```

---

## 🔐 Security Considerations

### Access Control

1. **API Filtering**: Surveys API only returns surveys user has access to
2. **Organization Membership**: Context only shows organizations user belongs to
3. **No Leakage**: Can't access other org's surveys by manipulating query params

### Future Enhancements (Story 5.9)

- Permission-based filtering within organizations
- Role-based survey visibility
- Survey privacy settings (private vs organization)

---

## 🎯 Next Steps

Now that Story 5.3 is complete, proceed with:

1. **Story 5.4**: Invite Users to Organization
   - Email invitation system
   - Role selection for invitees
   - Accept/decline workflow

2. **Story 5.8**: Survey Visibility Settings
   - Add visibility selector to survey creation
   - Private vs organization surveys
   - UI for changing visibility

3. **Story 5.10**: Permission Middleware
   - Protect organization features with permissions
   - Role-based access control enforcement

---

## 📚 Related Documentation

- **PRD**: `docs/prd.md` - Epic 5, Story 5.3
- **Architecture**: `docs/architecture.md` - Organization Context
- **Story 5.2**: `docs/STORY_5.2_IMPLEMENTATION.md` - Create Organization
- **Migration Guide**: `docs/MIGRATION_EPIC_5.md`

---

## 📝 Code Examples

### Using Organization Context in Components

```typescript
import { useOrganization } from "@/contexts/OrganizationContext";

function MyComponent() {
  const {
    currentOrganization,
    isPersonalWorkspace,
    organizations,
    setCurrentOrganization,
    switchToPersonalWorkspace
  } = useOrganization();

  if (isPersonalWorkspace) {
    return <div>You're in personal workspace</div>;
  }

  return <div>Current org: {currentOrganization?.name}</div>;
}
```

### Fetching Data with Context

```typescript
async function fetchData() {
  const params = new URLSearchParams();

  if (!isPersonalWorkspace && currentOrganization) {
    params.set("organizationId", currentOrganization.id);
  } else {
    params.set("personal", "true");
  }

  const response = await fetch(`/api/data?${params.toString()}`);
  return response.json();
}
```

---

**Implementation Complete** ✅
Story 5.3 is fully implemented with organization context management, selector UI, API filtering, and localStorage persistence!
