# Survey.fatihoune.com

A modern survey creation and management platform built with Next.js 16, React 19, and TypeScript.

## Features

- 🚀 Modern stack: Next.js 16 + React 19 + TypeScript
- 🎨 Beautiful UI with Tailwind CSS 4.x and shadcn/ui components
- 🔒 Authentication with better-auth (email/password + Google OAuth)
- 📊 Real-time analytics and data export
- 📱 Fully responsive design
- 🗄️ PostgreSQL database with Prisma ORM

## Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL 15+

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/kid-kodi/survey.fatihoune.com.git
cd survey.fatihoune.com
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your database connection string and other environment variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/survey_db?schema=public"
BETTER_AUTH_SECRET="your-secret-key-min-32-chars"
BETTER_AUTH_URL="http://localhost:3000"
```

### 4. Set up the database

```bash
# Generate Prisma Client
pnpm prisma generate

# Run database migrations (when available)
pnpm prisma migrate dev

# (Optional) Seed the database
pnpm prisma db seed
```

### 5. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
survey.fatihoune.com/
├── app/                    # Next.js App Router pages and layouts
├── components/             # React components
│   └── ui/                # shadcn/ui components
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions and configurations
├── types/                  # TypeScript type definitions
├── prisma/                 # Database schema and migrations
├── public/                 # Static assets
└── docs/                   # Project documentation
```

## Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint

# Database
pnpm prisma studio    # Open Prisma Studio (database GUI)
pnpm prisma generate  # Generate Prisma Client
pnpm prisma migrate dev  # Run migrations in development

# Code Quality
pnpm format           # Format code with Prettier (when configured)
```

## Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript 5.x
- **Styling**: Tailwind CSS 4.x, shadcn/ui components
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: better-auth
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Drag & Drop**: @dnd-kit
- **Date Handling**: date-fns

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- [Project Brief](./docs/brief.md) - Problem statement, solution, and MVP scope
- [Product Requirements](./docs/prd/index.md) - Detailed requirements and user stories
- [Architecture](./docs/architecture/index.md) - Technical architecture and system design

## Development Workflow

1. Create a new branch from `dev` for your feature
2. Make your changes following the coding standards in `docs/architecture/coding-standards.md`
3. Run `pnpm lint` to check for errors
4. Commit your changes with a descriptive message
5. Push to your branch and create a pull request

## Contributing

This project follows the requirements and architecture defined in the documentation. Please review the relevant docs before contributing:

- Check `docs/prd/` for feature requirements
- Review `docs/architecture/` for technical guidelines
- Follow the coding standards and naming conventions

## License

Private project - All rights reserved.

## Support

For questions or issues, please contact the development team or create an issue on GitHub.

---

Built with ❤️ using Next.js and React
