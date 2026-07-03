# FlightraX

FlightraX is a web based flight operations and training management system for WCC. It supports flight scheduling, digital permission routing, public flight tracking monitors, and role based approvals for students and flight instructors.

## Stack

| Area | Package |
| --- | --- |
| Framework | Next.js 16.2.9, App Router |
| UI runtime | React 19.2.4, React DOM 19.2.4 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4, shadcn/ui, Radix UI primitives |
| Backend | Supabase, `@supabase/ssr` 0.12.0, `@supabase/supabase-js` 2.108.2 |
| Mutations | `next-safe-action` 8.5.5 |
| Server state | TanStack Query 5.101.1 |
| Tables | TanStack Table 8.21.3 |
| Forms and validation | React Hook Form 7.80.0, Zod 4.4.3 |
| UI state | Zustand 5.0.14 |
| URL state | `nuqs` 2.8.9 |
| Notifications | Sonner 2.0.7 |
| Charts | Recharts 3.8.0 |

## Prerequisites

1. Node.js 20.9 or newer. Node.js 22+ is recommended for current tooling longevity.
2. npm.
3. A Supabase project.
4. Supabase CLI through `npx`. The project does not require a global CLI install.

There is no `engines` field in `package.json`, so Node version enforcement is not currently automatic.

## Install

```bash
npm install
```

## Environment

Create `.env.local` from `.env.example` with these variables exactly:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-supabase-publishable-key"
NEXT_PUBLIC_APP_VERSION="0.1.0"
NEXT_PUBLIC_APP_CREDITS="WCC Flight Operations"
NEXT_PUBLIC_APP_CONTACT="flightops@example.edu"
SUPABASE_PROJECT_ID="your-project-ref"
SUPABASE_SERVICE_ROLE_KEY="your-server-only-service-role-key"
```

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are required by the Supabase client config. A legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` fallback exists in code, but new setup should use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

`NEXT_PUBLIC_APP_VERSION`, `NEXT_PUBLIC_APP_CREDITS`, and `NEXT_PUBLIC_APP_CONTACT` are browser safe metadata values used for branded console messaging and the dashboard sidebar info card. Do not place secrets in these values because every `NEXT_PUBLIC_` variable is exposed to browser code.

`SUPABASE_SERVICE_ROLE_KEY` is for server only admin helpers. Never expose it through `NEXT_PUBLIC_`, client components, browser code, logs, or screenshots.

## Versioning Guidance

FlightraX follows semantic versioning for the public `NEXT_PUBLIC_APP_VERSION` value:

1. PATCH: `1.4.2` to `1.4.3`

   Increment this when you fix bugs.

   Use it when you merge a quick fix into staging or a release branch because a button component was broken, a mobile layout was misaligned, copy was incorrect, or an internal implementation issue was fixed. No new features were added.

2. MINOR: `1.4.2` to `1.5.0`

   Increment this when you add functionality in a backwards-compatible manner.

   Use it when you build a brand new module or dashboard feature, such as automated inventory sync statuses or a courier validation screen. Existing features still work the same way, but new capabilities are now available.

   When you bump the MINOR version, reset PATCH to `0`.

3. MAJOR: `1.4.2` to `2.0.0`

   Increment this when you make breaking changes that are not backwards-compatible.

   For web applications, this usually means a major architectural overhaul, such as rewriting the database schema from scratch, upgrading to a major Next.js version that breaks old APIs, or completely changing the application's core workflow.

   When you bump the MAJOR version, reset both MINOR and PATCH to `0`.

Keep the README, `.env.example`, deployment environment, and any release notes aligned when the version changes.

## Database And Supabase

Migrations live in `supabase/migrations/`. No committed `supabase/config.toml` exists, and day-to-day development uses the hosted Supabase project through the provided `.env.local` values.

Do not run database reset commands against the shared hosted project. In particular, do not run `supabase db reset` as part of normal development. That command is only for a disposable local Supabase instance and can destroy local data.

For normal development, use the Supabase credentials provided by the project owner:

```bash
npm install
npm run dev
```

Only project owners or maintainers should apply migrations to the hosted database. Review each migration in `supabase/migrations/` before applying it, and be careful with production data, permissions, RLS policies, and destructive SQL.

Generated database types belong in `shared/types/supabase.ts` and should be committed when schema changes are committed. If you only need to refresh types from the hosted project, use:

```bash
npm run supabase:types
```

## Type Generation

Use the scripts already defined in `package.json`:

```bash
npm run supabase:types
npm run supabase:types:local
npm run supabase:migration:new
```

Script definitions:

| Script | Command |
| --- | --- |
| `supabase:types` | `npx supabase gen types typescript --project-id "$SUPABASE_PROJECT_ID" --schema public > shared/types/supabase.ts` |
| `supabase:types:local` | `npx supabase gen types typescript --local --schema public > shared/types/supabase.ts` |
| `supabase:migration:new` | `npx supabase migration new` |

## Npm Scripts

| Script | Command |
| --- | --- |
| `dev` | `next dev` |
| `build` | `next build` |
| `start` | `next start` |
| `lint` | `eslint` |
| `typecheck` | `next typegen && tsc --noEmit` |
| `supabase:types` | `npx supabase gen types typescript --project-id "$SUPABASE_PROJECT_ID" --schema public > shared/types/supabase.ts` |
| `supabase:types:local` | `npx supabase gen types typescript --local --schema public > shared/types/supabase.ts` |
| `supabase:migration:new` | `npx supabase migration new` |

Start the app with:

```bash
npm run dev
```

Then open `http://localhost:3000`.

## Project Structure

```text
app/                         Next.js routing only
  (auth)/                    Login and register routes
    pending-approval/
  (dashboard)/               Dashboard route group
    account/
    aircrafts/
    dashboard/
    flight-documents/
    instructors/
    notams/
    schedule/
    student-review/
    students/
modules/                     Feature modules and business logic
  aircrafts/
  auth/
  dashboard/
  flight-documents/
  instructors/
  notams/
  schedule/
  students/
shared/                      Cross cutting code only
  components/ui/             shadcn/ui generated components only
  components/layout/         Shell, layout, and custom shared layout components
  hooks/
  lib/supabase/              Only place Supabase clients are created
  store/                     UI state only
  types/
  validations/
supabase/
  migrations/                SQL migrations
proxy.ts                     Next.js proxy for Supabase session refresh
```

## Project Rules

1. `app/` is for routing only. Pages should import and render a module root component. Do not put state, hooks, fetching, or business logic in route files.
2. Business logic lives in `modules/<domain>/`.
3. Modules must not import from each other. Move shared code into `shared/` only when at least two modules use it.
4. Supabase clients must be created only in `shared/lib/supabase/`.
5. Client components must not call Supabase directly. Use server side queries or `next-safe-action` actions.
6. All mutations go through `next-safe-action` with Zod validation.
7. Server state uses TanStack Query for client-visible cache ownership. Server helpers can fetch data, but interactive client surfaces should read through `useQuery`, hydrated query data, or shared query options. Zustand is only for UI state.
8. Forms use React Hook Form with Zod schemas.
9. Use `@/` path aliases. Do not use deep relative imports that traverse up multiple folders.
10. TypeScript is strict. Do not use `any`.
11. Do not add custom components to `shared/components/ui/`. That folder is managed by shadcn/ui.
12. Custom reusable layout components belong in `shared/components/layout/`. Domain specific components belong in their module.
13. Queries must be optimized before they are added. Select only needed columns, avoid duplicated auth/profile fetches, use cached server helpers for shared request data, keep query keys/options in `modules/<domain>/queries/`, invalidate affected TanStack Query keys after mutations, and revalidate affected routes when server-rendered data also changes.

## Naming Conventions

| Item | Convention | Example |
| --- | --- | --- |
| Files | kebab case | `flight-card.tsx` |
| React components | PascalCase | `FlightCard` |
| Hooks | camelCase with `use` prefix | `useFlightFilters` |
| Server actions | camelCase with `Action` suffix | `createFlightAction` |
| Zod schemas | camelCase with `Schema` suffix | `createFlightSchema` |
| Types and interfaces | PascalCase | `FlightStatus` |
| Zustand stores | camelCase with `Store` suffix | `useSidebarStore` |
| Query keys | SCREAMING_SNAKE_CASE | `FLIGHT_KEYS` |

## Verification

Use these checks before handing off changes:

```bash
npm run lint
npm run typecheck
npm run build
```

Browser automation and E2E tests are not the default verification path for this project. Run them only when specifically requested or when a task clearly needs them.

## Hidden Superadmin Login

From the homepage, tap or click the FlightraX logo five times to open `/login/superadmin`.
