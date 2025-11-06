# Story 6.4: Subscription Limits Enforcement - Surveys

**Status**: 🔄 In Progress
**Epic**: Epic 6 - Subscription & Billing Management
**Story Number**: 6.4
**Date Created**: 2025-11-05
**Estimated Effort**: 3-4 hours

---

## 📋 Story Overview

**User Story**:
As a user, I want the system to enforce survey creation limits based on my subscription plan, so that I cannot exceed my plan's allowed survey count.

**Business Value**:
Enforcing limits is critical for monetization. It prevents Free users from creating unlimited surveys and provides a clear upgrade path to paid plans. This drives subscription conversions and ensures fair resource usage across tiers.

**Dependencies**:
- ✅ Story 6.1: Database Schema (REQUIRED)

---

## ✅ Acceptance Criteria

**Limit Checking:**
1. Middleware function created: checkSurveyLimit(userId)
2. Function queries UsageTracking for current survey count
3. Function compares count against PlanLimit for user's current plan
4. Survey creation API (POST /api/surveys) includes limit check
5. Limit check executes before creating survey

**User Feedback:**
6. If limit reached, API returns 403 error with message (i18n: `Subscription.survey_limit_reached`)
7. Error message includes upgrade CTA: "Upgrade to Pro/Premium to create more surveys"
8. Dashboard displays usage indicator: "X of Y surveys used" (i18n: `Subscription.surveys_used`)
9. Usage indicator updates in real-time after survey creation/deletion
10. Premium users see "Unlimited surveys" message

**Usage Tracking:**
11. Survey deletion decrements usage count in UsageTracking
12. Usage count synced across all user sessions

**Internationalization:**
13. All limit messages and CTAs fully translated (en.json, fr.json)

---

## 🏗️ Technical Implementation

### Limit Checking Middleware

```typescript
// lib/utils/subscription-limits.ts

import { prisma } from '@/lib/prisma';

export async function checkSurveyLimit(userId: string): Promise<{
  allowed: boolean;
  current: number;
  limit: number | 'unlimited';
  message?: string;
}> {
  // Get user's current plan
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscriptions: {
        where: { status: 'active' },
        include: { plan: { include: { limits: true } } },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!user || !user.subscriptions[0]) {
    return {
      allowed: false,
      current: 0,
      limit: 0,
      message: 'No active subscription found',
    };
  }

  const subscription = user.subscriptions[0];
  const surveyLimit = subscription.plan.limits.find(
    (l) => l.limitType === 'surveys'
  );

  if (!surveyLimit) {
    return { allowed: true, current: 0, limit: 'unlimited' };
  }

  // Check for unlimited
  if (surveyLimit.limitValue === 'unlimited') {
    return { allowed: true, current: 0, limit: 'unlimited' };
  }

  const limit = parseInt(surveyLimit.limitValue);

  // Get current usage
  const usage = await prisma.usageTracking.findFirst({
    where: {
      userId,
      resourceType: 'survey',
      organizationId: null, // Personal surveys
    },
  });

  const current = usage?.currentCount || 0;

  if (current >= limit) {
    return {
      allowed: false,
      current,
      limit,
      message: `You've reached your survey limit (${limit} surveys). Upgrade to create more.`,
    };
  }

  return { allowed: true, current, limit };
}

export async function incrementSurveyUsage(
  userId: string,
  organizationId?: string
) {
  await prisma.usageTracking.upsert({
    where: {
      userId_organizationId_resourceType: {
        userId,
        organizationId: organizationId || null,
        resourceType: 'survey',
      },
    },
    create: {
      userId,
      organizationId: organizationId || null,
      resourceType: 'survey',
      currentCount: 1,
    },
    update: {
      currentCount: { increment: 1 },
    },
  });
}

export async function decrementSurveyUsage(
  userId: string,
  organizationId?: string
) {
  await prisma.usageTracking.updateMany({
    where: {
      userId,
      organizationId: organizationId || null,
      resourceType: 'survey',
    },
    data: {
      currentCount: { decrement: 1 },
    },
  });
}
```

### Updated Survey Creation API

```typescript
// app/api/surveys/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkSurveyLimit, incrementSurveyUsage } from '@/lib/utils/subscription-limits';

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check survey limit BEFORE creating
  const limitCheck = await checkSurveyLimit(session.user.id);

  if (!limitCheck.allowed) {
    return NextResponse.json(
      {
        error: 'survey_limit_reached',
        message: limitCheck.message,
        current: limitCheck.current,
        limit: limitCheck.limit,
      },
      { status: 403 }
    );
  }

  const body = await request.json();

  // Create survey
  const survey = await prisma.survey.create({
    data: {
      ...body,
      userId: session.user.id,
    },
  });

  // Increment usage count
  await incrementSurveyUsage(session.user.id, body.organizationId);

  return NextResponse.json(survey, { status: 201 });
}
```

### Updated Survey Deletion API

```typescript
// app/api/surveys/[id]/route.ts (DELETE method)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const survey = await prisma.survey.findUnique({
    where: { id },
  });

  if (!survey || survey.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.survey.delete({ where: { id } });

  // Decrement usage count
  await decrementSurveyUsage(session.user.id, survey.organizationId);

  return NextResponse.json({ success: true });
}
```

### Dashboard Usage Widget Component

```typescript
// components/subscription/SurveyUsageWidget.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

interface UsageData {
  current: number;
  limit: number | 'unlimited';
  percentage: number;
}

export function SurveyUsageWidget() {
  const t = useTranslations('Subscription');
  const router = useRouter();
  const [usage, setUsage] = useState<UsageData | null>(null);

  useEffect(() => {
    fetch('/api/usage/surveys')
      .then((res) => res.json())
      .then(setUsage);
  }, []);

  if (!usage) return <div>Loading...</div>;

  const isUnlimited = usage.limit === 'unlimited';
  const isNearLimit = usage.percentage >= 80;
  const isAtLimit = usage.percentage >= 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('survey_usage')}</CardTitle>
      </CardHeader>
      <CardContent>
        {isUnlimited ? (
          <p className="text-lg font-semibold text-green-600">
            {t('unlimited_surveys')}
          </p>
        ) : (
          <>
            <div className="mb-2">
              <p className="text-2xl font-bold">
                {usage.current} / {usage.limit}
              </p>
              <p className="text-sm text-gray-600">
                {t('surveys_used')}
              </p>
            </div>
            <Progress
              value={usage.percentage}
              className={
                isAtLimit
                  ? 'bg-red-200'
                  : isNearLimit
                  ? 'bg-yellow-200'
                  : 'bg-green-200'
              }
            />
            {isAtLimit && (
              <div className="mt-4">
                <p className="text-sm text-red-600 mb-2">
                  {t('survey_limit_reached')}
                </p>
                <Button onClick={() => router.push('/pricing')} size="sm">
                  {t('upgrade')}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
```

### API Endpoint for Usage Data

```typescript
// app/api/usage/surveys/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { checkSurveyLimit } from '@/lib/utils/subscription-limits';

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const limitCheck = await checkSurveyLimit(session.user.id);

  const percentage =
    limitCheck.limit === 'unlimited'
      ? 0
      : (limitCheck.current / (limitCheck.limit as number)) * 100;

  return NextResponse.json({
    current: limitCheck.current,
    limit: limitCheck.limit,
    percentage,
  });
}
```

### Internationalization Keys

```json
// messages/en.json
{
  "Subscription": {
    "survey_limit_reached": "You've reached your survey limit",
    "surveys_used": "{current} of {limit} surveys used",
    "unlimited_surveys": "Unlimited surveys",
    "survey_usage": "Survey Usage",
    "upgrade": "Upgrade Plan"
  }
}

// messages/fr.json
{
  "Subscription": {
    "survey_limit_reached": "Vous avez atteint votre limite de sondages",
    "surveys_used": "{current} sondages utilisés sur {limit}",
    "unlimited_surveys": "Sondages illimités",
    "survey_usage": "Utilisation des sondages",
    "upgrade": "Mettre à niveau"
  }
}
```

---

## 🧪 Testing

### Manual Testing Checklist

**Free Plan (5 surveys):**
- [ ] User can create 5 surveys
- [ ] 6th survey creation blocked with error
- [ ] Error message displayed correctly
- [ ] Usage widget shows "5 of 5"
- [ ] Deleting survey allows creating new one

**Pro Plan (50 surveys):**
- [ ] User can create up to 50 surveys
- [ ] 51st survey creation blocked
- [ ] Usage widget accurate

**Premium Plan (unlimited):**
- [ ] User can create unlimited surveys
- [ ] Usage widget shows "Unlimited"
- [ ] No limits enforced

**Edge Cases:**
- [ ] Concurrent creation requests handled correctly
- [ ] Usage count never goes negative
- [ ] Archived surveys still count toward limit (or don't, depending on requirements)

---

## 📝 Implementation Tasks

- [x] Create subscription-limits utility functions
- [x] Add limit check to survey creation API
- [x] Update survey deletion to decrement usage
- [x] Create usage API endpoint
- [x] Build SurveyUsageWidget component
- [ ] Add widget to dashboard
- [x] Add i18n keys
- [ ] Test all subscription tiers
- [ ] Test edge cases

---

## 🎯 Definition of Done

- [ ] Limit checking middleware implemented
- [ ] Survey creation enforces limits
- [ ] Survey deletion decrements usage
- [ ] Usage widget displays correctly
- [ ] Upgrade CTA shown when limit reached
- [ ] All translations added
- [ ] Tested across all plan tiers
- [ ] No bugs in concurrent scenarios

---

## 🤖 Dev Agent Record

**Agent Model Used**: Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References
None - Implementation completed without major issues.

### Completion Notes
- Successfully implemented all subscription limit enforcement features
- Created utility functions for checking survey limits and tracking usage
- Integrated limit checking into survey creation API (returns 403 when limit reached)
- Added survey deletion handler with usage decrement
- Created usage API endpoint to fetch current usage statistics
- Built SurveyUsageWidget component with Progress indicator
- Added all required i18n translations (English and French)
- TypeScript compilation successful
- Linting passed for new files
- Widget integration to dashboard deferred (requires dashboard page modification)
- Manual testing deferred (requires database seeding with subscription data)

### File List
**Created:**
- `lib/utils/subscription-limits.ts` - Limit checking and usage tracking utilities
- `app/api/usage/surveys/route.ts` - Usage statistics API endpoint
- `components/subscription/SurveyUsageWidget.tsx` - Usage display widget
- `components/ui/progress.tsx` - Progress bar component (shadcn/ui)

**Modified:**
- `app/api/surveys/route.ts` - Added limit check before survey creation and usage increment
- `app/api/surveys/[id]/route.ts` - Added DELETE handler with usage decrement
- `messages/en.json` - Added Subscription i18n keys
- `messages/fr.json` - Added Subscription i18n keys (French translations)

### Change Log
1. Created subscription-limits utility with checkSurveyLimit, incrementSurveyUsage, decrementSurveyUsage functions
2. Modified survey creation API to enforce limits (403 response when limit reached)
3. Added DELETE endpoint to survey API with automatic usage decrement
4. Created usage API endpoint at /api/usage/surveys
5. Built SurveyUsageWidget component with visual progress indicator
6. Added shadcn/ui Progress component
7. Added all i18n keys for English and French
8. Fixed TypeScript type issues with Prisma nullable fields in unique constraints

---

## 🔗 Related Stories

- **Depends On**: Story 6.1 (Database Schema)
- **Similar**: Story 6.5 (Organization Limits), Story 6.6 (Member Limits)
- **Related**: Story 6.11 (Status Indicators)
- **Epic**: Epic 6 - Subscription & Billing Management
