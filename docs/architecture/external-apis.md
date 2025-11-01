# External APIs

## Google OAuth API

- **Purpose:** Provide "Sign in with Google" authentication for user convenience
- **Documentation:** https://developers.google.com/identity/protocols/oauth2
- **Base URL(s):** https://accounts.google.com/o/oauth2/v2/auth, https://oauth2.googleapis.com/token
- **Authentication:** OAuth 2.0 (Client ID and Client Secret configured in better-auth)
- **Rate Limits:** None specified for basic OAuth flow

**Key Endpoints Used:**
- `GET /o/oauth2/v2/auth` - Initiates OAuth consent flow
- `POST /token` - Exchanges authorization code for access token
- `GET /tokeninfo` - Validates access token (used by better-auth)

**Integration Notes:** better-auth handles the complete OAuth flow. Developer must create OAuth credentials in Google Cloud Console and configure in environment variables (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET).

---

## Resend/SendGrid Email API

- **Purpose:** Send transactional emails for account verification, password resets, and future email distribution feature
- **Documentation:** https://resend.com/docs (or https://docs.sendgrid.com)
- **Base URL(s):** https://api.resend.com (or https://api.sendgrid.com)
- **Authentication:** API Key (header: `Authorization: Bearer {API_KEY}`)
- **Rate Limits:** Resend free tier: 100 emails/day; SendGrid free tier: 100 emails/day

**Key Endpoints Used:**
- `POST /emails` - Send transactional email

**Integration Notes:** MVP uses email sparingly (account verification, password reset). Phase 2 will add survey distribution via email. Choose Resend for better DX or SendGrid for higher volume needs.

---
