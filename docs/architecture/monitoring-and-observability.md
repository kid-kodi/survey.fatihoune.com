# Monitoring and Observability

## Monitoring Stack

- **Frontend Monitoring:** PostHog for user analytics, feature tracking, and session replays
- **Backend Monitoring:** Pino structured logging to stdout/file; Sentry for error tracking (Phase 2)
- **Error Tracking:** Sentry for both frontend and backend error aggregation (Phase 2)
- **Performance Monitoring:** Next.js built-in analytics, Lighthouse CI for performance budgets

---

## Key Metrics

**Frontend Metrics:**
- **Core Web Vitals:**
  - Largest Contentful Paint (LCP) < 2.5s
  - First Input Delay (FID) < 100ms
  - Cumulative Layout Shift (CLS) < 0.1
- **JavaScript errors:** Track and alert on error rate > 1% of sessions
- **API response times:** Monitor P50, P95, P99 latencies for API calls
- **User interactions:** Track survey creation rate, publish rate, response submission rate

**Backend Metrics:**
- **Request rate:** Requests per second across all endpoints
- **Error rate:** 4xx and 5xx errors as percentage of total requests (target < 1%)
- **Response time:** P50 < 200ms, P95 < 500ms, P99 < 1000ms
- **Database query performance:** Track slow queries (> 100ms) and N+1 query issues
- **Response submission rate:** Track spikes in response submissions (potential bot traffic)
- **Authentication success/failure rate:** Monitor auth endpoint failures

---
