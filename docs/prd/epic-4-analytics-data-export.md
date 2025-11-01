# Epic 4: Analytics & Data Export

**Epic Goal**: Empower survey creators with actionable insights through response viewing, analytics visualizations, and data export capabilities. This epic delivers a comprehensive analytics dashboard with response counts, completion rates, individual response viewing, aggregated data with charts (bar, pie), and CSV export functionality. By the end of this epic, users can analyze survey results in real-time and export data for external analysis, completing the core survey workflow.

## Story 4.1: View Response Count & Completion Rate

As a survey creator,
I want to see the total number of responses and completion rate for my survey,
so that I can gauge survey performance at a glance.

### Acceptance Criteria

1. Survey detail page (/surveys/[id]) displays key metrics at top
2. Metrics include: Total Responses, Completion Rate
3. Total Responses counts all submitted responses in database
4. Completion Rate calculated as: (completed responses / survey views) × 100% (note: view tracking out of scope for MVP; show "N/A" or omit)
5. Alternative: Completion Rate based on average answered questions if view tracking unavailable
6. Metrics displayed prominently with large numbers and labels
7. Metrics update in real-time as new responses submitted
8. Metrics API endpoint created (GET /api/surveys/[id]/metrics)
9. API includes authorization check (only survey owner can view)
10. Dashboard survey cards also show response count for quick reference

## Story 4.2: View Individual Responses

As a survey creator,
I want to view individual survey responses with timestamps,
so that I can see detailed respondent data.

### Acceptance Criteria

1. Survey detail page has "Responses" tab
2. Responses tab displays list of all survey responses
3. Each response shown as a card or table row with submission timestamp
4. Clicking on response expands or navigates to detailed response view
5. Detailed response view shows all questions and corresponding answers
6. Answers formatted appropriately for question type (e.g., multiple choice shows selected option)
7. Conditional questions that were hidden show as "Not answered" or omitted
8. Response list paginated if more than 50 responses (pagination controls)
9. Responses ordered by most recent first (submittedAt DESC)
10. API endpoint created (GET /api/surveys/[id]/responses) with authorization
11. Empty state shown if no responses yet: "No responses yet. Share your survey to start collecting data."

## Story 4.3: Analytics Dashboard with Charts

As a survey creator,
I want to see aggregated analytics with visual charts for each question,
so that I can quickly understand response patterns.

### Acceptance Criteria

1. Survey detail page has "Analytics" tab
2. Analytics tab displays visualizations for each question
3. **Multiple Choice, Dropdown, Yes/No**: Bar chart showing count for each option
4. **Checkbox**: Bar chart showing count for each selected option (multiple selections supported)
5. **Rating Scale**: Bar chart or histogram showing distribution across rating values
6. **Text Input**: List of text responses (charts not applicable; show word cloud in Phase 2)
7. Each chart includes question text as title
8. Charts display actual counts and percentages
9. Charts library integrated (Recharts or Chart.js)
10. Charts responsive and mobile-friendly
11. API endpoint created (GET /api/surveys/[id]/analytics) returning aggregated data
12. Analytics calculate on server-side for performance
13. Empty state shown if no responses: "Analytics will appear once responses are collected."

## Story 4.4: Pie Charts for Categorical Data

As a survey creator,
I want to see pie charts for categorical questions,
so that I can visualize response proportions.

### Acceptance Criteria

1. Analytics tab includes toggle or additional view for pie charts
2. Pie charts available for: Multiple Choice, Dropdown, Yes/No, Checkbox questions
3. Pie chart shows percentage distribution of responses
4. Each slice labeled with option name and percentage
5. Hover states show exact counts
6. Pie charts use accessible color palette
7. Legend displayed below or beside pie chart
8. User can switch between bar chart and pie chart views (toggle button)
9. Chart preference saved to local state (no persistence needed in MVP)
10. Pie charts render correctly with Recharts or Chart.js

## Story 4.5: Export Responses to CSV

As a survey creator,
I want to export all survey responses to CSV format,
so that I can analyze data in Excel or statistical software.

### Acceptance Criteria

1. Analytics or Responses tab includes "Export to CSV" button
2. Clicking "Export to CSV" triggers download of CSV file
3. CSV filename format: `[survey-title]-responses-[date].csv`
4. CSV first row contains headers: Question IDs or Question text
5. Each subsequent row represents one response
6. Response timestamp included as first column
7. Answers formatted appropriately: multiple choice shows selected option, checkbox shows comma-separated selections
8. Text answers escaped properly to handle commas and quotes
9. Conditional questions that were not answered show empty cells
10. CSV generation uses Papa Parse or similar library
11. API endpoint created (GET /api/surveys/[id]/export) returning CSV data
12. Export includes all responses (no pagination limit)
13. Authorization check ensures only survey owner can export
14. Large exports (1000+ responses) handled efficiently without timeout

## Story 4.6: Response Data Table with Filtering

As a survey creator,
I want to view response data in a table format with basic filtering,
so that I can quickly scan and search through responses.

### Acceptance Criteria

1. Responses tab includes table view option (in addition to card view)
2. Table columns represent questions (abbreviated if long)
3. Table rows represent individual responses
4. Response timestamp shown in first column
5. Table horizontally scrollable if many questions
6. Table supports sorting by timestamp (newest/oldest first)
7. Search box filters responses by text content (searches across all answers)
8. Filter updates table in real-time as user types
9. Table shows paginated results (50 responses per page)
10. Table is responsive: collapses to card view on mobile devices
11. Empty state shown if no responses match filter

## Story 4.7: Dashboard Analytics Summary

As a survey creator,
I want to see summary analytics on my dashboard,
so that I can monitor multiple surveys at once.

### Acceptance Criteria

1. Dashboard survey cards display summary metrics: response count, last response date
2. Optional: Show mini chart or trend indicator on survey card
3. Dashboard includes overview stats at top: Total Surveys, Total Responses, Surveys Published
4. Overview stats aggregate data across all user's surveys
5. Clicking on survey card navigates to full analytics view
6. Dashboard metrics update in real-time as responses submitted
7. Empty state shown for metrics if no surveys exist
8. API endpoint created (GET /api/dashboard/stats) for aggregated stats
9. Dashboard loads quickly even with many surveys (optimize queries)

---
