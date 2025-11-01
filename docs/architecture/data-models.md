# Data Models

## User

**Purpose:** Represents registered users who create and manage surveys. Supports both email/password and OAuth authentication methods.

**Key Attributes:**
- `id`: string (UUID) - Unique identifier
- `email`: string (unique) - User's email address for login and communication
- `name`: string | null - User's display name
- `passwordHash`: string | null - Hashed password (null for OAuth-only users)
- `emailVerified`: boolean - Whether email has been verified
- `googleId`: string | null - Google OAuth ID for OAuth users
- `createdAt`: DateTime - Account creation timestamp
- `updatedAt`: DateTime - Last profile update timestamp

### TypeScript Interface

```typescript
interface User {
  id: string;
  email: string;
  name: string | null;
  passwordHash: string | null;
  emailVerified: boolean;
  googleId: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  surveys: Survey[];
}
```

### Relationships

- **One-to-Many with Survey**: User owns multiple surveys (Survey.userId → User.id)

---

## Survey

**Purpose:** Represents a survey created by a user. Contains metadata and status, with questions stored as related entities.

**Key Attributes:**
- `id`: string (UUID) - Unique identifier
- `userId`: string - Foreign key to owning user
- `uniqueId`: string (unique, 8 chars) - Short, URL-safe ID for public links (/s/[uniqueId])
- `title`: string - Survey title displayed to creators and respondents
- `description`: string | null - Optional survey description/instructions
- `status`: enum - Survey lifecycle state: 'draft' | 'published' | 'archived'
- `createdAt`: DateTime - Survey creation timestamp
- `updatedAt`: DateTime - Last modification timestamp
- `publishedAt`: DateTime | null - When survey was first published

### TypeScript Interface

```typescript
type SurveyStatus = 'draft' | 'published' | 'archived';

interface Survey {
  id: string;
  userId: string;
  uniqueId: string;
  title: string;
  description: string | null;
  status: SurveyStatus;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;

  // Relations
  user: User;
  questions: Question[];
  responses: Response[];
}
```

### Relationships

- **Many-to-One with User**: Survey belongs to one user (Survey.userId → User.id)
- **One-to-Many with Question**: Survey has multiple questions (Question.surveyId → Survey.id)
- **One-to-Many with Response**: Survey receives multiple responses (Response.surveyId → Survey.id)

---

## Question

**Purpose:** Represents a single question within a survey. Supports multiple question types with flexible options and conditional logic.

**Key Attributes:**
- `id`: string (UUID) - Unique identifier
- `surveyId`: string - Foreign key to parent survey
- `type`: enum - Question type: 'multiple_choice' | 'text_input' | 'rating_scale' | 'checkbox' | 'dropdown' | 'yes_no'
- `text`: string - Question text displayed to respondents
- `options`: JSON - Question-specific options (e.g., choices for multiple choice, scale range for rating)
- `required`: boolean - Whether question must be answered
- `order`: number - Display order within survey (0-indexed)
- `logic`: JSON | null - Conditional logic rules for show/hide behavior
- `createdAt`: DateTime - Question creation timestamp

### TypeScript Interface

```typescript
type QuestionType = 'multiple_choice' | 'text_input' | 'rating_scale' | 'checkbox' | 'dropdown' | 'yes_no';

interface QuestionOptions {
  // For multiple_choice, checkbox, dropdown
  choices?: string[];

  // For rating_scale
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;

  // For text_input
  variant?: 'short' | 'long';
  placeholder?: string;
}

interface ConditionalLogic {
  triggerQuestionId: string;
  condition: 'equals' | 'not_equals' | 'contains';
  value: string | string[];
}

interface Question {
  id: string;
  surveyId: string;
  type: QuestionType;
  text: string;
  options: QuestionOptions;
  required: boolean;
  order: number;
  logic: ConditionalLogic | null;
  createdAt: Date;

  // Relations
  survey: Survey;
}
```

### Relationships

- **Many-to-One with Survey**: Question belongs to one survey (Question.surveyId → Survey.id)

---

## Response

**Purpose:** Stores a completed survey submission from a respondent. Contains all answers in JSON format for flexible querying and export.

**Key Attributes:**
- `id`: string (UUID) - Unique identifier
- `surveyId`: string - Foreign key to the survey being responded to
- `answers`: JSON - Complete response data mapping question IDs to answers
- `submittedAt`: DateTime - Response submission timestamp
- `ipAddress`: string | null - Respondent IP address (optional, for duplicate detection)
- `userAgent`: string | null - Respondent browser/device info (optional, for analytics)

### TypeScript Interface

```typescript
interface Answer {
  questionId: string;
  answer: string | string[] | number;
}

interface Response {
  id: string;
  surveyId: string;
  answers: Answer[];
  submittedAt: Date;
  ipAddress: string | null;
  userAgent: string | null;

  // Relations
  survey: Survey;
}
```

### Relationships

- **Many-to-One with Survey**: Response belongs to one survey (Response.surveyId → Survey.id)

---
