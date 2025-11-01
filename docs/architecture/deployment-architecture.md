# Deployment Architecture

## Deployment Strategy

**Frontend Deployment:**
- **Platform (Dev):** Vercel (automatic deployment on git push to `dev` branch)
- **Platform (Prod):** Self-hosted (Docker container on VPS/dedicated server)
- **Build Command:** `pnpm build`
- **Output Directory:** `.next` (Next.js build output)
- **CDN/Edge:** Vercel Edge Network (dev), Cloudflare or self-managed nginx (prod)

**Backend Deployment:**
- **Platform (Dev):** Vercel Serverless Functions (API routes deployed with frontend)
- **Platform (Prod):** Self-hosted Node.js server running Next.js in standalone mode
- **Build Command:** `pnpm build`
- **Deployment Method:** Docker container with Node.js 18+ runtime

**Database:**
- **Dev:** Railway PostgreSQL or Supabase (managed service)
- **Prod:** Self-managed PostgreSQL on same VPS or separate database server

---

## CI/CD Pipeline

```yaml
# .github/workflows/ci.yaml

name: CI

on:
  push:
    branches: [dev, main]
  pull_request:
    branches: [dev, main]

jobs:
  lint-and-type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Run ESLint
        run: pnpm lint
      - name: Run TypeScript type check
        run: pnpm tsc --noEmit
      - name: Generate Prisma Client
        run: pnpm prisma generate

  # Phase 2: Add test job
  # test:
  #   runs-on: ubuntu-latest
  #   steps:
  #     - uses: actions/checkout@v3
  #     - uses: pnpm/action-setup@v2
  #       with:
  #         version: 8
  #     - uses: actions/setup-node@v3
  #       with:
  #         node-version: 18
  #         cache: 'pnpm'
  #     - name: Install dependencies
  #       run: pnpm install --frozen-lockfile
  #     - name: Run tests
  #       run: pnpm test:ci
```

```yaml
# .github/workflows/deploy-prod.yaml

name: Deploy Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build application
        run: pnpm build

      - name: Build Docker image
        run: docker build -t survey-app:${{ github.sha }} .

      - name: Push to registry (optional)
        run: |
          echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
          docker tag survey-app:${{ github.sha }} username/survey-app:latest
          docker push username/survey-app:latest

      - name: Deploy to production server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.PROD_SERVER_HOST }}
          username: ${{ secrets.PROD_SERVER_USER }}
          key: ${{ secrets.PROD_SERVER_SSH_KEY }}
          script: |
            cd /opt/survey-app
            docker pull username/survey-app:latest
            docker-compose down
            docker-compose up -d
            docker-compose exec app pnpm prisma migrate deploy
```

---

## Environments

| Environment | Frontend URL | Backend URL | Purpose |
|-------------|--------------|-------------|---------|
| Development | http://localhost:3000 | http://localhost:3000/api | Local development |
| Staging | https://dev-survey.fatihoune.com | https://dev-survey.fatihoune.com/api | Pre-production testing on Vercel |
| Production | https://survey.fatihoune.com | https://survey.fatihoune.com/api | Live environment (self-hosted) |

---
