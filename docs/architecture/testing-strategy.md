# Testing Strategy

## Testing Pyramid

```
        E2E Tests
        /        \
   Integration Tests
   /                \
Frontend Unit    Backend Unit
```

**MVP Testing Philosophy:** Manual testing + TypeScript type safety for speed. Automated testing added progressively as product validates.

---

## Test Organization

### Frontend Tests (Phase 2)

```
/tests
  /components
    /survey
      survey-builder.test.tsx
      question-editor.test.tsx
    /dashboard
      survey-card.test.tsx
  /hooks
    use-survey.test.ts
  /lib
    validation.test.ts
```

### Backend Tests (Phase 2)

```
/tests
  /api
    /surveys
      create-survey.test.ts
      update-survey.test.ts
      delete-survey.test.ts
    /auth
      register.test.ts
      login.test.ts
  /repositories
    survey-repository.test.ts
```

### E2E Tests (Phase 3)

```
/e2e
  /flows
    survey-creation.spec.ts
    response-submission.spec.ts
    analytics-viewing.spec.ts
  /fixtures
    test-surveys.json
```

---

## Test Examples

### Frontend Component Test

```typescript
// tests/components/survey/question-editor.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { QuestionEditor } from '@/components/survey/question-editor';
import { Question } from '@/types/survey';

describe('QuestionEditor', () => {
  const mockQuestion: Question = {
    id: '1',
    surveyId: 'survey-1',
    type: 'multiple_choice',
    text: 'What is your favorite color?',
    options: { choices: ['Red', 'Blue', 'Green'] },
    required: false,
    order: 0,
    logic: null,
    createdAt: new Date(),
  };

  it('renders question text', () => {
    render(<QuestionEditor question={mockQuestion} onUpdate={jest.fn()} />);
    expect(screen.getByDisplayValue('What is your favorite color?')).toBeInTheDocument();
  });

  it('calls onUpdate when question text changes', () => {
    const onUpdate = jest.fn();
    render(<QuestionEditor question={mockQuestion} onUpdate={onUpdate} />);

    const input = screen.getByDisplayValue('What is your favorite color?');
    fireEvent.change(input, { target: { value: 'What is your favorite color now?' } });

    expect(onUpdate).toHaveBeenCalledWith({
      ...mockQuestion,
      text: 'What is your favorite color now?',
    });
  });

  it('toggles required checkbox', () => {
    const onUpdate = jest.fn();
    render(<QuestionEditor question={mockQuestion} onUpdate={onUpdate} />);

    const checkbox = screen.getByRole('checkbox', { name: /required/i });
    fireEvent.click(checkbox);

    expect(onUpdate).toHaveBeenCalledWith({
      ...mockQuestion,
      required: true,
    });
  });
});
```

### Backend API Test

```typescript
// tests/api/surveys/create-survey.test.ts

import { POST } from '@/app/api/surveys/route';
import { prisma } from '@/lib/prisma';
import { createMockRequest, createMockUser } from '@/tests/helpers';

jest.mock('@/lib/auth', () => ({
  getCurrentUser: jest.fn(),
}));

describe('POST /api/surveys', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a new survey with valid data', async () => {
    const mockUser = createMockUser();
    (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

    const request = createMockRequest({
      method: 'POST',
      body: {
        title: 'Customer Satisfaction Survey',
        description: 'Please rate your experience',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.title).toBe('Customer Satisfaction Survey');
    expect(data.userId).toBe(mockUser.id);
    expect(data.status).toBe('draft');
  });

  it('returns 401 for unauthenticated requests', async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue(null);

    const request = createMockRequest({
      method: 'POST',
      body: { title: 'Test Survey' },
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('returns 400 for invalid data', async () => {
    const mockUser = createMockUser();
    (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

    const request = createMockRequest({
      method: 'POST',
      body: { title: '' }, // Empty title should fail validation
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
```

### E2E Test

```typescript
// e2e/flows/survey-creation.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Survey Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('user can create a survey end-to-end', async ({ page }) => {
    // Navigate to create survey
    await page.click('text=Create New Survey');

    // Fill in survey details
    await page.fill('input[name="title"]', 'Employee Feedback Survey');
    await page.fill('textarea[name="description"]', 'Share your thoughts');
    await page.click('button:has-text("Create Survey")');

    // Wait for redirect to survey builder
    await page.waitForURL(/\/surveys\/.*\/edit/);

    // Add a multiple choice question
    await page.click('text=Add Question');
    await page.click('text=Multiple Choice');
    await page.fill('input[placeholder="Question text"]', 'How satisfied are you?');
    await page.fill('input[placeholder="Option 1"]', 'Very Satisfied');
    await page.fill('input[placeholder="Option 2"]', 'Satisfied');
    await page.click('text=+ Add Option');
    await page.fill('input[placeholder="Option 3"]', 'Dissatisfied');

    // Publish survey
    await page.click('button:has-text("Publish Survey")');
    await expect(page.locator('text=Survey published successfully')).toBeVisible();

    // Verify survey appears in dashboard
    await page.goto('/dashboard');
    await expect(page.locator('text=Employee Feedback Survey')).toBeVisible();
  });
});
```

---
