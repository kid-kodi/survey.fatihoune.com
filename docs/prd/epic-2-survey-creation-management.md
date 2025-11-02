# Epic 2: Survey Creation & Management

**Epic Goal**: Build the comprehensive survey creation and management system that empowers users to create professional surveys through an intuitive interface. This epic delivers a drag-and-drop survey builder with multiple question types, survey templates for quick starts, conditional logic for sophisticated surveys, and full survey lifecycle management (create, edit, save drafts, publish, archive, duplicate). By the end of this epic, users can create fully functional surveys and manage their survey library.

## Story 2.1: Survey List & Management Dashboard

As a logged-in user,
I want to view all my surveys in an organized list with their status,
so that I can easily manage and access my surveys.

### Acceptance Criteria

1. Dashboard page (/dashboard) displays a list of all user's surveys
2. Survey list shows survey cards/rows with: title, status (draft/published/archived), creation date, response count
3. Empty state message shown when user has no surveys: "Create your first survey to get started"
4. "Create New Survey" button prominently displayed
5. Each survey card has quick action menu: Edit, Duplicate, Archive, View Responses
6. Surveys ordered by most recently modified first
7. Survey status badges visually distinct (e.g., draft = gray, published = green, archived = muted)
8. Click on survey card navigates to survey builder (for drafts) or survey analytics (for published)
9. Prisma schema includes Survey model with fields: id, userId, title, description, status, createdAt, updatedAt
10. API endpoint created (GET /api/surveys) to fetch user's surveys
11. Surveys filtered to only show current user's surveys (authorization check)

## Story 2.2: Create New Survey & Basic Settings

As a logged-in user,
I want to create a new survey with a title and description,
so that I can start building my survey.

### Acceptance Criteria

1. "Create New Survey" button on dashboard opens modal or navigates to /surveys/new
2. New survey form has fields: Survey Title (required), Description (optional)
3. Form validation requires non-empty title
4. "Create Survey" button submits form via API (POST /api/surveys)
5. New survey created in database with status: "draft"
6. Survey creation associates survey with authenticated user (userId)
7. Successful creation redirects to survey builder page (/surveys/[id]/edit)
8. Survey builder page loads with empty survey (no questions yet)
9. Survey builder displays survey title and description at top
10. "Add Question" button visible to start adding questions

## Story 2.3: Question Types - Multiple Choice

As a survey creator,
I want to add multiple choice questions to my survey,
so that respondents can select from predefined options.

### Acceptance Criteria

1. Prisma schema includes Question model with fields: id, surveyId, type, text, options (JSON), required, order
2. "Add Question" button opens question type selector
3. Question type selector includes "Multiple Choice" option
4. Selecting "Multiple Choice" adds a new multiple choice question to survey
5. Multiple choice question editor has fields: Question text, Options (minimum 2)
6. Users can add option by clicking "+ Add Option"
7. Users can edit option text inline
8. Users can delete options (minimum 2 options enforced)
9. Users can reorder options via drag-and-drop
10. "Required" toggle available for each question
11. Question saved to database via API (POST /api/surveys/[id]/questions)
12. Multiple choice question renders correctly in survey preview
13. Changes auto-save or show "Save" button with unsaved indicator

## Story 2.4: Question Types - Text Input, Rating Scale, Checkbox, Dropdown, Yes/No

As a survey creator,
I want to add various question types to my survey,
so that I can collect different types of data from respondents.

### Acceptance Criteria

1. Question type selector includes: Text Input, Rating Scale, Checkbox, Dropdown, Yes/No
2. **Text Input**: Short text (single line) and Long text (textarea) variants available
3. **Text Input**: Placeholder text field available for guidance
4. **Rating Scale**: Configure scale range (e.g., 1-5, 1-10) with optional labels for min/max
5. **Checkbox**: Multiple options with ability to add/edit/delete options (same as multiple choice)
6. **Dropdown**: Single selection from dropdown list with option management
7. **Yes/No**: Simple binary question (renders as two buttons or radio buttons)
8. All question types support "Required" toggle
9. Question schema in database supports all types via "type" enum and flexible "options" JSON field
10. API endpoint (POST /api/surveys/[id]/questions) handles creation of all question types
11. Each question type renders correctly in survey builder preview
12. Each question type has appropriate UI for respondents (validated in Epic 3)

## Story 2.5: Reorder, Edit, and Delete Questions

As a survey creator,
I want to reorder, edit, and delete questions in my survey,
so that I can organize my survey effectively.

### Acceptance Criteria

1. Survey builder displays questions in order according to "order" field
2. Drag-and-drop handles visible on each question card
3. Users can drag questions to reorder them within the survey
4. Reordering updates "order" field in database via API (PATCH /api/surveys/[id]/questions/reorder)
5. Each question card has "Edit" icon/button
6. Clicking "Edit" makes question editable inline or opens edit modal
7. Editing question text or options updates database via API (PATCH /api/surveys/[id]/questions/[qid])
8. Each question card has "Delete" icon/button
9. Clicking "Delete" shows confirmation dialog: "Are you sure you want to delete this question?"
10. Confirming deletion removes question from survey via API (DELETE /api/surveys/[id]/questions/[qid])
11. Deletion removes question from database and updates remaining questions' order
12. Changes reflected immediately in survey builder UI

## Story 2.6: Survey Templates

As a survey creator,
I want to select from pre-built survey templates,
so that I can quickly create surveys without starting from scratch.

### Acceptance Criteria

1. "Create New Survey" flow includes option: "Start from template" vs "Start from scratch"
2. Template gallery displays 3-5 templates: Customer Feedback, Employee Satisfaction, Event Planning (and optionally: Product Survey, NPS Survey)
3. Each template card shows: template name, description, preview of questions (count)
4. Clicking template creates new survey with pre-populated questions
5. Template questions include appropriate question types and options
6. **Customer Feedback Template**: Questions about satisfaction, likelihood to recommend, suggestions for improvement
7. **Employee Satisfaction Template**: Questions about work environment, management, work-life balance
8. **Event Planning Template**: Questions about event preferences, attendance, dietary restrictions
9. User can customize template survey (edit, add, delete questions) after selection
10. Template data stored as JSON configurations that can be loaded into new surveys
11. Template-based surveys marked with source template in database (optional metadata)

## Story 2.7: Conditional Logic (Show/Hide Questions)

As a survey creator,
I want to add conditional logic to questions,
so that respondents only see relevant questions based on their answers.

### Acceptance Criteria

1. Each question has "Add Logic" button in survey builder
2. Clicking "Add Logic" opens conditional logic editor
3. Logic editor allows setting: "Show this question if [Question X] [Condition] [Value]"
4. Conditions supported: equals, not equals, contains (for checkbox)
5. User can select trigger question from dropdown of previous questions
6. User can select condition type and specify value(s)
7. Logic rules saved to database in Question model (add "logic" JSON field)
8. Multiple logic rules can be added to a single question (AND/OR logic in Phase 2, MVP: simple IF logic)
9. Survey builder shows logic indicator icon on questions with logic
10. Logic correctly applied during survey response (validated in Epic 3)
11. Circular logic prevented (question cannot depend on itself or later questions)

## Story 2.8: Save Draft & Publish Survey

As a survey creator,
I want to save my survey as a draft and publish it when ready,
so that I can work on surveys over time and control when they're available.

### Acceptance Criteria

1. Survey builder has "Save as Draft" button (or auto-save functionality)
2. Draft surveys save all changes to database
3. Draft surveys remain editable after saving
4. Survey builder has "Publish" button
5. Clicking "Publish" validates survey: must have title and at least one question
6. Validation errors shown if survey incomplete
7. Publishing updates survey status to "published" in database
8. Published surveys generate unique survey URL: /s/[uniqueId]
9. uniqueId is a short, random, URL-safe string (e.g., 8 characters)
10. Published surveys become accessible to respondents via public URL
11. Published surveys can still be edited (changes apply immediately)
12. Dashboard reflects survey status change (draft → published)

## Story 2.9: Archive and Duplicate Surveys

As a survey creator,
I want to archive completed surveys and duplicate existing surveys,
so that I can manage my survey library efficiently.

### Acceptance Criteria

1. Survey action menu includes "Archive" option
2. Clicking "Archive" shows confirmation dialog
3. Archiving updates survey status to "archived" in database
4. Archived surveys no longer appear in main survey list
5. Archived surveys viewable via "Archived" filter/tab on dashboard
6. Archived surveys remain accessible for viewing responses
7. Archived surveys can be unarchived (status change back to published/draft)
8. Survey action menu includes "Duplicate" option
9. Clicking "Duplicate" creates a copy of the survey with all questions
10. Duplicated survey created with status "draft" and title "[Original Title] - Copy"
11. Duplicated survey gets new ID and timestamps
12. Duplicated survey immediately editable in survey builder

---
