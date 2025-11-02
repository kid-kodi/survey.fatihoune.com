# Epic 3: Survey Distribution & Response Collection

**Epic Goal**: Enable seamless survey distribution and robust response collection. This epic delivers public survey access, shareable links, embed codes, respondent-facing survey interface, response validation and submission, and real-time response capture. By the end of this epic, survey creators can share their surveys via multiple channels, and respondents can complete surveys with a smooth, mobile-optimized experience, with all responses stored securely in the database.

## Story 3.1: Public Survey View & Access

As a survey respondent,
I want to access a survey via a shared link,
so that I can complete the survey without needing an account.

### Acceptance Criteria

1. Public survey route created at /s/[uniqueId]
2. Route accessible without authentication (public page)
3. Survey data fetched from database using uniqueId
4. 404 error page shown if uniqueId is invalid or survey doesn't exist
5. Only published surveys accessible via public URL (drafts return 404 or "Survey not available")
6. Archived surveys show "This survey is no longer accepting responses" message
7. Survey metadata (title, description) displayed at top of page
8. Clean, respondent-focused layout without creator UI elements
9. Survey questions rendered in order
10. Mobile-responsive layout optimized for mobile respondents

## Story 3.2: Generate Shareable Link & Embed Code

As a survey creator,
I want to generate a shareable link and embed code for my survey,
so that I can distribute my survey across multiple channels.

### Acceptance Criteria

1. Published surveys have "Share" button in survey management interface
2. Clicking "Share" opens modal with sharing options
3. Modal displays full shareable URL: https://survey.fatihoune.com/s/[uniqueId]
4. "Copy Link" button copies URL to clipboard with confirmation message
5. Modal includes "Embed Code" tab or section
6. Embed code generated as HTML iframe: `<iframe src="https://survey.fatihoune.com/s/[uniqueId]" width="100%" height="600px"></iframe>`
7. "Copy Embed Code" button copies code to clipboard
8. Embed code works when pasted into external websites
9. Embedded surveys fully functional within iframe
10. Share modal includes QR code for mobile sharing (optional enhancement)

## Story 3.3: Render Survey Questions for Respondents

As a survey respondent,
I want to see survey questions in an intuitive format,
so that I can understand and answer them easily.

### Acceptance Criteria

1. All question types render correctly in public survey view
2. **Multiple Choice**: Radio buttons for single selection
3. **Text Input**: Single-line input or textarea based on variant
4. **Rating Scale**: Visual rating scale (stars, numbers, or slider) with labels
5. **Checkbox**: Checkboxes for multiple selection
6. **Dropdown**: Dropdown select menu
7. **Yes/No**: Two clear buttons or radio buttons
8. Required questions marked with asterisk (*)
9. Question numbers displayed (Q1, Q2, etc.)
10. Questions displayed in correct order based on "order" field
11. Placeholder text shown for text input questions
12. Option labels clearly readable and accessible
13. Touch-friendly targets for mobile users (minimum 44x44px)

## Story 3.4: Conditional Logic - Hide/Show Questions

As a survey respondent,
I want to see only relevant questions based on my previous answers,
so that I have a personalized survey experience.

### Acceptance Criteria

1. Questions with conditional logic initially hidden if conditions not met
2. Logic evaluation happens in real-time as respondent answers questions
3. When trigger question answered, dependent questions evaluated
4. Questions shown/hidden smoothly with CSS transition
5. Logic supports "equals" condition: show if answer matches specific value
6. Logic supports "not equals" condition: show if answer doesn't match value
7. Logic supports "contains" condition for checkbox: show if specific option selected
8. Multiple conditions on same question handled correctly
9. Hidden questions not submitted with response data
10. Logic works correctly across all question types
11. Client-side validation ensures logic evaluation without page reload

## Story 3.5: Response Validation & Submission

As a survey respondent,
I want to submit my completed survey with validation,
so that I know my responses were recorded.

### Acceptance Criteria

1. Public survey page has "Submit" button at bottom of survey
2. Clicking "Submit" validates all required questions answered
3. Validation errors displayed inline for unanswered required questions
4. Error summary shown at top of form: "Please answer all required questions"
5. Page scrolls to first validation error for user convenience
6. Valid submission sends response data to API (POST /api/surveys/[id]/responses)
7. Prisma schema includes Response model: id, surveyId, submittedAt, answers (JSON)
8. Response data includes question IDs mapped to answer values
9. Successful submission shows confirmation message: "Thank you! Your response has been recorded."
10. Submission button disabled during API request (prevents double submission)
11. Submission under 500ms as per NFR2
12. Error handling for failed submissions with retry option

## Story 3.6: Response Storage & Association

As a system,
I want to store survey responses securely and associate them with surveys,
so that survey creators can access response data.

### Acceptance Criteria

1. Response model in Prisma schema includes foreign key to Survey (surveyId)
2. Responses stored with complete answer data in JSON format
3. Response timestamp (submittedAt) automatically recorded
4. Each response gets unique ID for retrieval
5. Responses queryable by surveyId for analytics
6. Database indexes created for efficient response querying
7. API endpoint includes authorization check (only survey owner can access responses)
8. Response storage handles all question types correctly
9. Answers stored in structured format: `{ questionId: "q1", answer: "value" }`
10. Database constraints prevent orphaned responses (cascade delete if survey deleted)

## Story 3.7: Thank You Page & Confirmation

As a survey respondent,
I want to see a confirmation after submitting my survey,
so that I know my response was successfully recorded.

### Acceptance Criteria

1. Successful submission redirects to thank you page or shows in-page confirmation
2. Thank you message displays survey title: "Thank you for completing [Survey Title]!"
3. Confirmation message: "Your response has been recorded."
4. Optional: Allow survey creator to customize thank you message (saved in Survey model)
5. Thank you page has clean design matching survey branding
6. No back button or ability to resubmit response (prevent duplicates)
7. Optional: "Complete another survey" link returns to /s/[uniqueId] (allows multiple responses)
8. Optional: Display response confirmation number for user's records
9. Thank you page works in embedded mode (iframe)

---
