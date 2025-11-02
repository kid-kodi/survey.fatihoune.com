# Frontend Architecture

## Component Architecture

### Component Organization

```
/app
  /(auth)
    /login
      page.tsx                  # Login page (SSR)
    /register
      page.tsx                  # Registration page (SSR)
  /(dashboard)
    /dashboard
      page.tsx                  # Dashboard page (CSR)
    /surveys
      /[id]
        /edit
          page.tsx              # Survey builder page (CSR)
        page.tsx                # Survey analytics page (CSR)
    /settings
      page.tsx                  # Account settings (CSR)
  /s
    /[uniqueId]
      page.tsx                  # Public survey view (SSR)
  page.tsx                      # Landing page (SSR)
  layout.tsx                    # Root layout

/components
  /ui                           # shadcn/ui components (auto-generated)
    button.tsx
    card.tsx
    input.tsx
    ...
  /survey
    survey-builder.tsx          # Main builder component
    question-palette.tsx        # Question type selector
    question-editor.tsx         # Question editor
    question-list.tsx           # Drag-drop list
  /dashboard
    survey-card.tsx             # Survey card component
    empty-state.tsx             # Empty state
  /analytics
    chart-renderer.tsx          # Chart component
    response-table.tsx          # Data table
  /public
    public-survey.tsx           # Public survey container
    question-renderer.tsx       # Question renderer by type
  /shared
    navbar.tsx                  # Navigation bar
    protected-route.tsx         # Auth wrapper
```

### Component Template

```typescript
// Example: components/survey/survey-builder.tsx

'use client';

import { useState } from 'react';
import { useSurvey } from '@/hooks/use-survey';
import { QuestionPalette } from './question-palette';
import { QuestionList } from './question-list';
import { Button } from '@/components/ui/button';
import type { Survey, Question } from '@/types/survey';

interface SurveyBuilderProps {
  surveyId: string;
}

export function SurveyBuilder({ surveyId }: SurveyBuilderProps) {
  const { survey, questions, isLoading, updateSurvey, addQuestion } = useSurvey(surveyId);
  const [isSaving, setIsSaving] = useState(false);

  if (isLoading) {
    return <div>Loading survey...</div>;
  }

  if (!survey) {
    return <div>Survey not found</div>;
  }

  const handlePublish = async () => {
    setIsSaving(true);
    await updateSurvey({ status: 'published' });
    setIsSaving(false);
  };

  return (
    <div className="container mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">{survey.title}</h1>
        <p className="text-muted-foreground">{survey.description}</p>
      </header>

      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-3">
          <QuestionPalette onAddQuestion={addQuestion} />
        </aside>

        <main className="col-span-9">
          <QuestionList
            questions={questions}
            surveyId={surveyId}
          />

          <div className="mt-6 flex gap-4">
            <Button variant="outline">Save as Draft</Button>
            <Button onClick={handlePublish} disabled={isSaving}>
              {isSaving ? 'Publishing...' : 'Publish Survey'}
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
```

---

## State Management Architecture

### State Structure

```typescript
// lib/stores/survey-store.ts

import { create } from 'zustand';
import type { Survey, Question } from '@/types/survey';

interface SurveyState {
  currentSurvey: Survey | null;
  questions: Question[];
  unsavedChanges: boolean;

  // Actions
  setSurvey: (survey: Survey) => void;
  setQuestions: (questions: Question[]) => void;
  addQuestion: (question: Question) => void;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  reorderQuestions: (questionIds: string[]) => void;
  markAsSaved: () => void;
}

export const useSurveyStore = create<SurveyState>((set) => ({
  currentSurvey: null,
  questions: [],
  unsavedChanges: false,

  setSurvey: (survey) => set({ currentSurvey: survey }),
  setQuestions: (questions) => set({ questions }),
  addQuestion: (question) => set((state) => ({
    questions: [...state.questions, question],
    unsavedChanges: true,
  })),
  updateQuestion: (id, updates) => set((state) => ({
    questions: state.questions.map((q) =>
      q.id === id ? { ...q, ...updates } : q
    ),
    unsavedChanges: true,
  })),
  reorderQuestions: (questionIds) => set((state) => ({
    questions: questionIds.map((id) =>
      state.questions.find((q) => q.id === id)!
    ),
    unsavedChanges: true,
  })),
  markAsSaved: () => set({ unsavedChanges: false }),
}));
```

### State Management Patterns

- **Server State**: Managed by tanstack/react-query for data fetching, caching, and synchronization
- **Client State**: Local component state via `useState` for ephemeral UI state (modals, form inputs)
- **Shared State**: Zustand store for cross-component state (survey builder state, unsaved changes)
- **Form State**: React Hook Form for form validation and submission
- **URL State**: Next.js router for navigation state and query parameters

---

## Routing Architecture

### Route Organization

```
App Router Structure:
/                           → Landing page (public, SSR)
/(auth)/login               → Login page (public, SSR)
/(auth)/register            → Registration page (public, SSR)
/(dashboard)/dashboard      → Survey list dashboard (protected, CSR)
/(dashboard)/surveys/[id]/edit → Survey builder (protected, CSR)
/(dashboard)/surveys/[id]   → Survey analytics (protected, CSR)
/(dashboard)/settings       → Account settings (protected, CSR)
/s/[uniqueId]               → Public survey view (public, SSR)
/api/auth/[...route]        → Auth API routes
/api/surveys/*              → Survey API routes
/api/user/*                 → User API routes
```

### Protected Route Pattern

```typescript
// middleware.ts - Next.js middleware for route protection

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const session = await getSession(request);
  const { pathname } = request.nextUrl;

  // Protected routes require authentication
  const protectedRoutes = ['/dashboard', '/surveys', '/settings'];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !session) {
    // Redirect to login with return URL
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Auth routes redirect to dashboard if already logged in
  const authRoutes = ['/login', '/register'];
  const isAuthRoute = authRoutes.includes(pathname);

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

---

## Frontend Services Layer

### API Client Setup

```typescript
// lib/api/client.ts

import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 10000,
  withCredentials: true, // Include cookies for session auth
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token (if using tokens instead of cookies)
apiClient.interceptors.request.use(
  (config) => {
    // Add any request modifications here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login on authentication error
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Service Example

```typescript
// lib/api/survey-service.ts

import apiClient from './client';
import type { Survey, Question, CreateSurveyInput } from '@/types/survey';

export const surveyService = {
  // Get all surveys for current user
  async getSurveys(): Promise<Survey[]> {
    const response = await apiClient.get('/surveys');
    return response.data.surveys;
  },

  // Get single survey by ID
  async getSurvey(surveyId: string): Promise<Survey> {
    const response = await apiClient.get(`/surveys/${surveyId}`);
    return response.data;
  },

  // Create new survey
  async createSurvey(input: CreateSurveyInput): Promise<Survey> {
    const response = await apiClient.post('/surveys', input);
    return response.data;
  },

  // Update survey
  async updateSurvey(
    surveyId: string,
    updates: Partial<Survey>
  ): Promise<Survey> {
    const response = await apiClient.patch(`/surveys/${surveyId}`, updates);
    return response.data;
  },

  // Delete survey
  async deleteSurvey(surveyId: string): Promise<void> {
    await apiClient.delete(`/surveys/${surveyId}`);
  },

  // Add question to survey
  async addQuestion(surveyId: string, question: Omit<Question, 'id'>): Promise<Question> {
    const response = await apiClient.post(
      `/surveys/${surveyId}/questions`,
      question
    );
    return response.data;
  },

  // Update question
  async updateQuestion(
    surveyId: string,
    questionId: string,
    updates: Partial<Question>
  ): Promise<Question> {
    const response = await apiClient.patch(
      `/surveys/${surveyId}/questions/${questionId}`,
      updates
    );
    return response.data;
  },

  // Delete question
  async deleteQuestion(surveyId: string, questionId: string): Promise<void> {
    await apiClient.delete(`/surveys/${surveyId}/questions/${questionId}`);
  },

  // Reorder questions
  async reorderQuestions(
    surveyId: string,
    questionIds: string[]
  ): Promise<void> {
    await apiClient.patch(`/surveys/${surveyId}/questions/reorder`, {
      questionIds,
    });
  },
};
```

---
