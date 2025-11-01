commit # CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

- **Framework**: Next.js 16.0.1 (App Router)
- **React**: 19.2.0
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS 4.x with CSS variables
- **UI Components**: shadcn/ui (New York style) with Radix UI primitives
- **Icons**: Lucide React
- **Package Manager**: pnpm (based on pnpm-lock.yaml presence)

## Development Commands

```bash
# Start development server (http://localhost:3000)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

## Project Structure

- `app/` - Next.js App Router pages and layouts
- `components/ui/` - shadcn/ui components (auto-generated, edit with caution)
- `lib/` - Utility functions (includes `cn()` for className merging)
- `public/` - Static assets

## Path Aliases

TypeScript is configured with `@/*` aliasing to project root:
- `@/components` → components directory
- `@/lib` → lib directory
- `@/hooks` → hooks directory

## shadcn/ui Integration

This project uses shadcn/ui with the following configuration:
- **Style**: New York
- **Base Color**: Neutral
- **CSS Variables**: Enabled
- **Icon Library**: Lucide
- **RSC**: Enabled

Components are installed in `components/ui/` and can be added using:
```bash
npx shadcn@latest add [component-name]
```

## Styling Conventions

- Uses Tailwind CSS with CSS variables for theming
- Dark mode support is built-in via `dark:` variant
- Utility function `cn()` in `lib/utils.ts` merges Tailwind classes properly

## Form Building

Always use the following stack for building forms:
- **react-hook-form** - Form state management and validation
- **Zod** - Schema validation
- **FormField component** - Compose accessible forms using Radix UI components

Standard pattern:
```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
```
