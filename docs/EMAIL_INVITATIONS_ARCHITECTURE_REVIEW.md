# Email Invitations - Architecture Review & Integration Plan

**Date**: 2025-11-04
**Author**: Sarah (PO)
**Status**: Ready for Implementation

---

## 📋 Executive Summary

This document reviews the architecture alignment for implementing email invitation functionality across organization member invitations and survey participant invitations. All proposed changes align with the existing architecture patterns and require minimal modifications to the current system.

**Stories Created:**
1. **Story 1.4**: Email Service Integration (Foundation)
2. **Story 5.4.1**: Organization Member Email Invitations (Enhancement)
3. **Story 3.8**: Survey Participant Email Invitations (New Feature)

**Architecture Verdict**: ✅ **APPROVED** - All stories align with existing architecture

---

## 🏗️ Architecture Alignment Review

### 1. Email Service Integration (Story 1.4)

**Alignment with architecture.md:**

✅ **Line 43**: Architecture explicitly mentions "Email Service: Resend or SendGrid for transactional emails"

✅ **Lines 103-107**: Email service is already in the architecture diagram as an external service

✅ **Lines 1156-1167**: External API section details Resend/SendGrid integration

✅ **Lines 2472-2474**: Environment variables already defined (`RESEND_API_KEY`, `FROM_EMAIL`)

**Architectural Patterns Used:**
- Service layer pattern (`lib/services/email-service.ts`) - matches existing pattern
- Singleton pattern for email client - standard practice
- React Email templates - modern, type-safe approach
- Environment-based configuration - follows existing pattern

**No Architecture Changes Required** - This story implements what was already planned.

---

### 2. Organization Member Email Invitations (Story 5.4.1)

**Alignment with existing code:**

✅ **Existing Story 5.4**: Already implemented invitation infrastructure (database, API, UI)

✅ **TODO Comment**: Lines 229-244 in `app/api/organizations/[id]/invitations/route.ts` explicitly mark where email sending should be added

✅ **Database Model**: `OrganizationInvitation` model already exists with all required fields

✅ **UI Components**: `InviteMemberModal.tsx` already functional

✅ **Token Generation**: `lib/utils/invitation.ts` already implemented

**Architectural Patterns Used:**
- Email template component pattern - new but consistent with React Email
- Localization strategy - follows existing i18n pattern
- Error handling - non-blocking email failures (graceful degradation)

**No Database Changes Required** - Uses existing `OrganizationInvitation` model.

**No API Changes Required** - Only adds email sending to existing endpoint.

---

### 3. Survey Participant Email Invitations (Story 3.8)

**Alignment with architecture.md:**

✅ **Epic 3**: "Survey Distribution & Response Collection" - this story extends Epic 3

✅ **Service Layer**: Follows established service layer pattern

✅ **API Routes**: Matches RESTful API conventions used throughout the app

✅ **Database Patterns**: Uses Prisma ORM with same conventions as existing models

**New Architecture Components:**

⚠️ **New Database Model Required**: `SurveyInvitation`
- Follows existing naming conventions (PascalCase)
- Uses same field types and patterns as `OrganizationInvitation`
- Properly indexed for query performance

⚠️ **Schema Modification Required**: `Response` model extension
- Adds optional `invitationToken` field (nullable - backward compatible)
- Indexed for efficient lookups
- Non-breaking change (existing responses continue to work)

**Architectural Patterns Used:**
- Repository pattern for data access (standard)
- Bulk operations with error handling (resilient design)
- Token-based tracking (same pattern as org invitations)
- Graceful degradation (invalid tokens don't break survey access)

**Architecture Impact**: ⚠️ **MINOR** - New model and field addition only

---

## 🗄️ Database Schema Changes Summary

### New Models

```prisma
model SurveyInvitation {
  id          String                @id @default(cuid())
  surveyId    String
  email       String
  token       String                @unique
  status      SurveyInvitationStatus @default(pending)
  sentAt      DateTime?
  completedAt DateTime?
  createdAt   DateTime              @default(now())
  updatedAt   DateTime              @updatedAt
  survey      Survey                @relation(fields: [surveyId], references: [id], onDelete: Cascade)

  @@unique([surveyId, email])
  @@index([surveyId])
  @@index([email])
  @@index([token])
  @@index([status])
  @@index([surveyId, status])
}

enum SurveyInvitationStatus {
  pending
  sent
  failed
  completed
}
```

### Model Extensions

```prisma
model Survey {
  // ... existing fields ...
  invitations SurveyInvitation[]  // NEW RELATION
}

model Response {
  // ... existing fields ...
  invitationToken String?  // NEW FIELD (nullable, backward compatible)

  // ... existing relations ...

  @@index([invitationToken])  // NEW INDEX
}
```

**Migration Impact**:
- ✅ Non-breaking (all changes are additive)
- ✅ Backward compatible (existing responses continue to work)
- ✅ Safe for production deployment

---

## 📊 API Surface Changes

### New Endpoints (Story 3.8)

```
POST   /api/surveys/[id]/invitations    # Send bulk invitations
GET    /api/surveys/[id]/invitations    # List invitations + stats
```

### Modified Endpoints (Story 3.8)

```
POST   /api/surveys/[id]/responses      # Now accepts ?invitation=[token] query param
```

### Enhanced Endpoints (Story 5.4.1)

```
POST   /api/organizations/[id]/invitations  # Now sends emails (was just TODO)
```

**API Impact**: ✅ **MINIMAL** - Only additions and non-breaking enhancements

---

## 🎨 UI Component Changes

### New Components (Story 3.8)

```
components/surveys/InviteParticipantsModal.tsx
components/surveys/InvitationsListTab.tsx
```

### Email Templates (All Stories)

```
lib/email-templates/BaseEmail.tsx                    # Story 1.4
lib/email-templates/OrganizationInvitationEmail.tsx  # Story 5.4.1
lib/email-templates/SurveyInvitationEmail.tsx        # Story 3.8
lib/email-templates/TestEmail.tsx                    # Story 1.4 (dev only)
lib/email-templates/types.ts                         # Story 1.4
```

**UI Impact**: ✅ **ISOLATED** - New components don't affect existing functionality

---

## 🔧 Service Layer Changes

### New Services

```
lib/services/email-service.ts  # Story 1.4 - Email sending service
```

**Service Impact**: ✅ **CLEAN** - Follows established service layer pattern

---

## 🌍 Internationalization (i18n) Requirements

### New Translation Keys

**Organization Invitations (Story 5.4.1):**
```json
{
  "Organization": {
    "invitation_email_subject": "You've been invited to join {orgName}",
    "invitation_email_greeting": "Hello,",
    "invitation_email_message": "{inviter} has invited you to join {org} as a {role}.",
    "invitation_email_accept": "Accept Invitation",
    "invitation_email_decline": "Decline this invitation",
    "invitation_email_expires": "This invitation expires in {days} days."
  }
}
```

**Survey Invitations (Story 3.8):**
```json
{
  "Survey": {
    "invite_participants": "Invite Participants",
    "invitations_tab": "Invitations",
    "invitations_sent_success": "{count} invitations sent successfully",
    "valid_emails_count": "{count} valid emails",
    "survey_invitation_subject": "{creator} invited you to complete a survey",
    "survey_invitation_cta": "Take Survey"
  }
}
```

**i18n Impact**: ✅ **STANDARD** - Follows existing i18n patterns

---

## 🔐 Security Considerations

### Token Security
✅ **Cryptographic Security**: Uses `crypto.randomBytes(32)` for token generation (same as org invitations)

✅ **Token Uniqueness**: Database constraints ensure uniqueness

✅ **No Token Guessing**: 32-byte tokens are computationally infeasible to guess

### Privacy & Data Protection
✅ **Email Privacy**: Email addresses not exposed in public URLs

✅ **Optional Tracking**: Invitation tokens are optional - surveys remain publicly accessible

✅ **GDPR Compliance**: Minimal PII stored (email only), supports data deletion

### Authorization
✅ **Survey Ownership**: Only survey creator can send invitations

✅ **Organization Permissions**: Only users with `manage_users` can invite to organizations

✅ **Response Validation**: Invalid tokens don't prevent survey submission (graceful degradation)

**Security Impact**: ✅ **ROBUST** - Follows security best practices

---

## 📈 Performance Considerations

### Email Sending Performance

**Resend Free Tier Limits:**
- 3,000 emails/month
- 100 emails/day

**Current Design:**
- Story 3.8 limits bulk sends to 50 emails per request
- Sequential email sending (acceptable for MVP)

**Future Optimization Needed if:**
- >50 invitations per request required → Queue system (Bull/BullMQ)
- >100 emails/day → Upgrade Resend plan or implement queuing
- Email delivery time critical → Background job processing

**Performance Impact**: ✅ **ACCEPTABLE FOR MVP** - May need queue system post-MVP

### Database Performance

**Indexes Added:**
- `SurveyInvitation`: Indexed on `surveyId`, `email`, `token`, `status`
- `Response`: Indexed on `invitationToken`

**Query Patterns:**
- Invitation lookups by token: O(1) with index
- Invitation list by survey: O(log n) with index
- Response tracking: O(1) with token index

**Database Impact**: ✅ **OPTIMIZED** - Proper indexing for query performance

---

## 🧪 Testing Strategy

### Unit Tests Required
- [ ] Email service token generation
- [ ] Email template rendering
- [ ] Email validation (valid/invalid parsing)

### Integration Tests Required
- [ ] API endpoint authorization
- [ ] Bulk invitation creation
- [ ] Email sending (mocked in tests)
- [ ] Response tracking with invitation token

### E2E Tests Required
- [ ] Organization invitation flow (send → receive → accept)
- [ ] Survey invitation flow (send → receive → complete survey)
- [ ] Invitation status updates
- [ ] Response rate calculations

**Testing Impact**: ✅ **STANDARD** - Follows existing testing patterns

---

## 🚀 Deployment Strategy

### Phase 1: Story 1.4 (Email Service Integration)
**Risk**: LOW
**Deployment**: Standalone service layer, no user-facing changes
**Rollback**: Simple - remove service files if needed

### Phase 2: Story 5.4.1 (Organization Invitations)
**Risk**: LOW
**Deployment**: Enhances existing feature, backward compatible
**Rollback**: Revert API route changes, invitations still created (just no email)

### Phase 3: Story 3.8 (Survey Invitations)
**Risk**: MEDIUM (database migration required)
**Deployment**: Requires migration → API → UI deployment
**Rollback**: Database rollback possible (migration reversal script)

### Recommended Deployment Order:
1. Deploy Story 1.4 (email service)
2. Test email sending in production with test emails
3. Deploy Story 5.4.1 (org invitations) - quick win
4. Validate organization invitations working
5. Deploy Story 3.8 (survey invitations) - largest change

**Deployment Impact**: ✅ **MANAGEABLE** - Phased approach reduces risk

---

## ❌ Architecture Gaps Identified

### 1. Email Rate Limiting (Future Consideration)
**Gap**: No rate limiting on email sending per user/survey
**Risk**: Potential for abuse (spam)
**Recommendation**: Add rate limiting middleware in future story
**Priority**: LOW (mitigated by Resend daily limits)

### 2. Email Bounce Handling (Future Enhancement)
**Gap**: No webhook handling for bounced emails
**Risk**: Failed deliveries not tracked beyond initial send
**Recommendation**: Implement Resend webhooks for bounce/spam tracking
**Priority**: MEDIUM (post-MVP)

### 3. Email Template Versioning (Future Enhancement)
**Gap**: No versioning for email templates
**Risk**: Changes to templates affect all emails
**Recommendation**: Template versioning system
**Priority**: LOW (not needed for MVP)

### 4. Invitation Reminders (Future Feature)
**Gap**: No automatic reminders for pending invitations
**Risk**: Lower response rates
**Recommendation**: Cron job to send reminders after X days
**Priority**: MEDIUM (nice-to-have for MVP)

### 5. Bulk CSV Import (Future Feature)
**Gap**: Manual email entry only (no CSV import)
**Risk**: UX friction for large invitation lists
**Recommendation**: CSV upload feature
**Priority**: MEDIUM (user request dependent)

**Gaps Impact**: ✅ **ACCEPTABLE** - All gaps are future enhancements, not blockers

---

## ✅ Architecture Approval Checklist

- [x] Aligns with existing architecture document
- [x] Follows established design patterns
- [x] Database changes are non-breaking
- [x] API changes follow RESTful conventions
- [x] Security considerations addressed
- [x] Performance impacts assessed
- [x] i18n requirements defined
- [x] Testing strategy outlined
- [x] Deployment strategy defined
- [x] Rollback plan exists
- [x] Future enhancements identified

---

## 🎯 Final Recommendation

**Recommendation**: ✅ **PROCEED WITH IMPLEMENTATION**

All three stories are architecturally sound and ready for development. They align with the existing architecture, follow established patterns, and introduce minimal risk.

**Implementation Sequence:**
1. **Story 1.4** (4-6 hours) - Foundation
2. **Story 5.4.1** (2-3 hours) - Quick Win
3. **Story 3.8** (6-8 hours) - Major Feature

**Total Estimated Effort**: 12-17 hours (1.5 - 2 sprint capacity)

**Next Steps:**
1. ✅ Stories created and documented
2. ⏳ Assign to development sprint
3. ⏳ Begin implementation with Story 1.4
4. ⏳ Review and test each story incrementally

---

## 📚 References

- **Architecture Document**: `docs/architecture.md`
- **PRD**: `docs/prd.md`
- **Existing Invitation Code**: `app/api/organizations/[id]/invitations/route.ts`
- **Prisma Schema**: `prisma/schema.prisma`

---

**Approval**: Sarah (PO) - 2025-11-04

Ready for implementation! 🚀
