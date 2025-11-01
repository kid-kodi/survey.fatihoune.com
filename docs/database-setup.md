# Database Setup Guide

This guide provides step-by-step instructions for setting up a PostgreSQL database for the Survey Platform. Choose one of the following options based on your preference.

## Option 1: Local PostgreSQL (Recommended for Development)

### Prerequisites
- PostgreSQL 15+ installed on your machine

### Windows Installation
1. Download PostgreSQL from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user
4. PostgreSQL should be running on `localhost:5432` by default

### macOS Installation (Homebrew)
```bash
brew install postgresql@15
brew services start postgresql@15
```

### Linux Installation (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE survey_db;
CREATE USER survey_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE survey_db TO survey_user;
\q
```

### Update .env
```env
DATABASE_URL="postgresql://survey_user:your_secure_password@localhost:5432/survey_db?schema=public"
```

## Option 2: Railway (Cloud Hosting)

Railway offers free PostgreSQL databases with 500MB storage and 5GB bandwidth.

### Steps
1. Go to [railway.app](https://railway.app) and sign up/login
2. Click **New Project** → **Provision PostgreSQL**
3. Click on the PostgreSQL service
4. Go to **Connect** tab
5. Copy the **Postgres Connection URL**
6. Update your `.env` file:

```env
DATABASE_URL="postgresql://postgres:PASSWORD@containers-us-west-XXX.railway.app:5432/railway"
```

### Pros
- Free tier available
- Automatic backups
- Easy setup
- Good for development and small production apps

### Cons
- Limited free tier resources
- Requires internet connection

## Option 3: Supabase (Cloud Hosting)

Supabase provides free PostgreSQL databases with 500MB storage.

### Steps
1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click **New Project**
3. Fill in project details:
   - Name: `survey-platform`
   - Database Password: Set a strong password
   - Region: Choose closest to you
4. Wait for project setup (1-2 minutes)
5. Go to **Settings** → **Database**
6. Find **Connection String** section
7. Copy the **Connection string** (URI format)
8. Replace `[YOUR-PASSWORD]` with your database password
9. Update your `.env` file:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
```

### Pros
- Free tier available (500MB database)
- Built-in authentication (can integrate with better-auth)
- Real-time subscriptions
- Auto-generated API

### Cons
- Limited free tier resources
- Requires internet connection

## Option 4: Other Cloud Providers

### Neon
- [neon.tech](https://neon.tech)
- Serverless PostgreSQL
- Generous free tier (3GB storage)
- Instant branching for dev/staging

### Render
- [render.com](https://render.com)
- Free PostgreSQL (90 days, then expires)
- Good for testing

### Vercel Postgres (Powered by Neon)
- Integrated with Vercel deployments
- Generous free tier
- Easy setup if using Vercel for hosting

## After Database Setup

Once you've set up your database and updated the `.env` file, run the following commands:

### 1. Run Migrations
```bash
pnpm prisma migrate dev
```

This creates the database tables based on your Prisma schema.

### 2. Generate Prisma Client
```bash
pnpm prisma generate
```

This generates the TypeScript types and query builder.

### 3. Seed the Database (Optional)
```bash
pnpm prisma db seed
```

This populates your database with test data for development.

### 4. Test Database Connection
```bash
# Start the dev server
pnpm dev

# Visit http://localhost:3000/api/health
```

You should see a JSON response indicating database connection status.

## Prisma Studio (Database GUI)

Prisma Studio is a visual database browser that comes with Prisma.

```bash
pnpm prisma studio
```

This opens a web interface at `http://localhost:5555` where you can:
- View all tables and data
- Add, edit, or delete records
- Explore relationships
- Test queries

## Troubleshooting

### Connection Refused Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Make sure PostgreSQL is running:
- Windows: Check Services → PostgreSQL should be running
- macOS: `brew services list` → postgresql@15 should show "started"
- Linux: `sudo systemctl status postgresql`

### Authentication Failed
```
Error: password authentication failed for user "postgres"
```
**Solution**: Check your password in the `DATABASE_URL`. Make sure there are no special characters that need URL encoding.

### Database Does Not Exist
```
Error: database "survey_db" does not exist
```
**Solution**: Create the database using the SQL commands in "Create Database" section above.

### SSL/TLS Errors (Cloud Providers)
If you see SSL errors with cloud databases, update your connection string:

```env
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

## Environment Variables Checklist

Make sure your `.env` file contains:

```env
# Database
DATABASE_URL="postgresql://..."

# Authentication
BETTER_AUTH_SECRET="..." # Generate with: openssl rand -base64 32
BETTER_AUTH_URL="http://localhost:3000"

# Environment
NODE_ENV="development"
```

## Production Considerations

For production deployments:

1. **Use Connection Pooling**: Add `?pgbouncer=true` or use a connection pooler
2. **Enable SSL**: Use `sslmode=require` in connection string
3. **Set Connection Limits**: Configure `connection_limit` in Prisma schema
4. **Backup Strategy**: Set up automated backups (most cloud providers offer this)
5. **Monitor Performance**: Use logging and monitoring tools
6. **Separate Databases**: Use different databases for development, staging, and production

---

Need help? Check the [Prisma documentation](https://www.prisma.io/docs) or create an issue on GitHub.
