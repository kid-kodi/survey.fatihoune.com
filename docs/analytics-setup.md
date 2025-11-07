# Analytics Setup Guide

## Google Analytics 4 (GA4) Setup

### 1. Create GA4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click "Admin" in the bottom left
3. Create a new GA4 property
4. Copy the Measurement ID (format: `G-XXXXXXXXXX`)
5. Add to `.env` file: `NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX`

### 2. Configure Conversion Goals

Navigate to **Admin > Events** and mark the following custom events as conversions:

#### Event 1: sign_up
- **Event Name**: `sign_up`
- **Description**: User completes registration
- **Mark as conversion**: ✅

#### Event 2: subscription_start
- **Event Name**: `subscription_start`
- **Description**: User starts a paid subscription
- **Parameters**: `plan` (string)
- **Mark as conversion**: ✅

#### Event 3: survey_created
- **Event Name**: `survey_created`
- **Description**: User creates their first survey
- **Mark as conversion**: ✅

### 3. Verify Event Tracking

1. Go to **Reports > Realtime**
2. Perform actions in your app (sign up, subscribe, create survey)
3. Verify events appear in the realtime report
4. After 24-48 hours, check **Reports > Engagement > Events**

## PostHog Setup

### 1. Create PostHog Project

1. Sign up at [PostHog](https://posthog.com/) or self-host
2. Create a new project
3. Copy the Project API Key (starts with `phc_`)
4. Copy the API Host (default: `https://app.posthog.com`)

### 2. Add to Environment Variables

Add to `.env` file:
```
NEXT_PUBLIC_POSTHOG_KEY=phc_your_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### 3. Configure Actions

PostHog will automatically track:
- Page views
- Custom events (sign_up, subscription_start, survey_created)
- User sessions
- Feature flags (if enabled)

## UTM Parameter Tracking

UTM parameters are automatically captured on page load and stored in sessionStorage. Parameters tracked:
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`

Example URL:
```
https://survey.fatihoune.com/?utm_source=google&utm_medium=cpc&utm_campaign=spring_sale
```

## Privacy Compliance

### Cookie Consent
- Cookie consent banner displays on first visit
- Users can accept or reject analytics cookies
- Preference stored in localStorage: `cookie-consent`

### Analytics Opt-Out
- Users can opt out via privacy settings
- Preference stored in localStorage: `analytics-opt-out`

### Do Not Track (DNT)
- Browser's DNT setting is respected
- Analytics scripts not loaded if DNT is enabled

## Testing Analytics

### Local Testing
1. Set environment variables in `.env.local`
2. Run dev server: `pnpm dev`
3. Open browser DevTools > Network tab
4. Perform actions and verify GA4/PostHog requests

### Production Testing
1. Deploy to production with analytics enabled
2. Use GA4 Realtime reports
3. Use PostHog Live Events view
4. Verify event parameters and user properties
