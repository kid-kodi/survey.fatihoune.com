# Database Schema

```prisma
// Prisma schema file - prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  passwordHash  String?   // Null for OAuth-only users
  emailVerified Boolean   @default(false)
  googleId      String?   @unique
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  surveys       Survey[]

  @@index([email])
  @@index([googleId])
}

model Survey {
  id          String        @id @default(cuid())
  userId      String
  uniqueId    String        @unique @default(cuid()) // 8-char short ID for public URLs
  title       String
  description String?       @db.Text
  status      SurveyStatus  @default(draft)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  publishedAt DateTime?

  // Relations
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  questions   Question[]
  responses   Response[]

  @@index([userId])
  @@index([uniqueId])
  @@index([status])
}

enum SurveyStatus {
  draft
  published
  archived
}

model Question {
  id        String       @id @default(cuid())
  surveyId  String
  type      QuestionType
  text      String       @db.Text
  options   Json         // QuestionOptions type - flexible JSON for different question types
  required  Boolean      @default(false)
  order     Int          // 0-indexed order within survey
  logic     Json?        // ConditionalLogic type - nullable for questions without logic
  createdAt DateTime     @default(now())

  // Relations
  survey    Survey       @relation(fields: [surveyId], references: [id], onDelete: Cascade)

  @@index([surveyId])
  @@index([surveyId, order])
}

enum QuestionType {
  multiple_choice
  text_input
  rating_scale
  checkbox
  dropdown
  yes_no
}

model Response {
  id          String   @id @default(cuid())
  surveyId    String
  answers     Json     // Array of Answer objects - {questionId, answer}
  submittedAt DateTime @default(now())
  ipAddress   String?  // Optional for duplicate detection
  userAgent   String?  // Optional for analytics

  // Relations
  survey      Survey   @relation(fields: [surveyId], references: [id], onDelete: Cascade)

  @@index([surveyId])
  @@index([surveyId, submittedAt])
}
```

**Key Design Decisions:**

1. **CUID vs UUID**: Using CUID (Collision-resistant Unique Identifier) for better database performance and lexicographically sortable IDs
2. **JSON Fields**: `options`, `logic`, and `answers` use JSON for flexibility without requiring schema migrations for new question types
3. **Cascade Deletes**: Survey deletion cascades to questions and responses to maintain referential integrity
4. **Indexes**: Strategic indexes on frequently queried fields (userId, surveyId, uniqueId, status, order) for query performance
5. **Text Fields**: `description`, `text`, and other long-form content use `@db.Text` for PostgreSQL TEXT type (unlimited length)

---
