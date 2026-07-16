# FlightraX — AI Agent Rules

You are working on **FlightraX**, a Next.js 16 (App Router) + Supabase project. These rules are mandatory. Follow them in every task, every file, every response.

---

## Stack — Know This Before You Write Anything

- **Framework**: Next.js 16, App Router only. No Pages Router.
- **Language**: TypeScript 5. Strict mode. No `any`.
- **Backend**: Supabase (serverless) for database, auth, storage, and realtime.
- **Styling**: Tailwind CSS v4.
- **UI Components**: shadcn/ui (Radix UI primitives). Auto-generated into `shared/components/ui/`.
- **Server Actions**: `next-safe-action` — all mutations go through this.
- **Server State**: TanStack Query v5 — all data fetching goes through this.
- **Tables**: TanStack Table v8.
- **Forms**: React Hook Form + Zod v4.
- **Global State**: Zustand v5 — UI state only, never server state.
- **URL State**: `nuqs`.
- **Notifications**: Sonner.
- **Charts**: Recharts.
- **Date Utilities**: `date-fns` + `@internationalized/date`.

---

## Directory Structure — Never Deviate From This

```
flightrax/
├── app/                          ← Next.js routing ONLY. No logic here.
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── flights/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── scheduling/page.tsx
│   │   ├── monitoring/page.tsx
│   │   ├── aircraft/page.tsx
│   │   └── crew/page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   └── page.tsx
│
├── modules/                      ← ALL business logic lives here
│   ├── flights/
│   │   ├── components/
│   │   ├── actions/
│   │   ├── hooks/
│   │   ├── queries/
│   │   ├── services/
│   │   ├── schemas/
│   │   ├── types/
│   │   └── utils/
│   ├── scheduling/               ← same structure
│   ├── monitoring/               ← same structure
│   ├── aircraft/                 ← same structure
│   ├── crew/                     ← same structure
│   └── auth/                     ← same structure
│
├── shared/                       ← cross-cutting concerns only
│   ├── components/
│   │   ├── ui/                   ← shadcn/ui only, never touch manually
│   │   └── layout/               ← sidebar, header, nav
│   ├── hooks/
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   └── utils.ts
│   ├── store/
│   ├── types/
│   └── validations/
│
├── proxy.ts                       ← Next 16 proxy for Supabase session refresh
└── AGENTS.md
```

---

## Rule 1 — `app/` Is Routing Only

- Pages in `app/` must **only** import and render the module's root component.
- Never write state, hooks, data fetching, or business logic inside `app/`.
- The only exception: React Query prefetching setup at the page level is acceptable.

```tsx
// ✅ CORRECT — app/(dashboard)/flights/page.tsx
import { FlightsPage } from "@/modules/flights/components/FlightsPage";
export default function Page() {
  return <FlightsPage />;
}

// ❌ WRONG — never do this in app/
export default function Page() {
  const [data, setData] = useState([]);
  useEffect(() => { fetch(...) }, []);
  return <div>...</div>;
}
```

---

## Rule 2 — All Business Logic Lives in `modules/`

- Every feature domain has its own folder under `modules/`.
- The structure of each module is always: `components/`, `actions/`, `hooks/`, `queries/`, `services/`, `schemas/`, `types/`, `utils/`.
- If a file only serves one module, it must live inside that module. Do not move it to `shared/`.
- When creating a new feature, always scaffold all subdirectories even if they start empty.
- Avoid compatibility barrels and re-export shim files inside a module. Import the canonical file directly unless there is a real public module boundary.

---

## Rule 3 — Modules Must Not Import From Each Other

- `modules/flights` must never import from `modules/crew`, `modules/scheduling`, etc.
- If two modules need to share something, extract it to `shared/` first.
- Violations of this rule break the modular architecture. Do not do it even for "quick" solutions.

---

## Rule 4 — `shared/` Is For Cross-Cutting Concerns Only

- Only put something in `shared/` if it is genuinely used by **two or more** modules.
- `shared/components/ui/` is **exclusively** for shadcn/ui generated components. Never add custom components here.
- `shared/components/layout/` is for structural shell components (Sidebar, Header, Nav).
- Dashboard content surfaces should use solid square primary-themed surfaces on mobile and rounded glass surfaces on desktop; prefer the reusable `GlassSurface` component in `shared/components/layout/`.
- Every clickable control must communicate clickability with `cursor-pointer`; disabled interactive controls must use `disabled:cursor-default` or an equivalent disabled cursor style.
- `shared/lib/supabase/` is the **only** place Supabase clients are instantiated. Do not create Supabase clients anywhere else.

---

## Rule 5 — Supabase Client Usage

You must always import Supabase clients from `shared/lib/supabase/`. Never instantiate them inline.

| Context                                    | Import From                       |
| ------------------------------------------ | --------------------------------- |
| Server Components, Actions, Route Handlers | `@/shared/lib/supabase/server.ts` |
| Client Components                          | `@/shared/lib/supabase/client.ts` |

```ts
// ✅ CORRECT
import { createClient } from "@/shared/lib/supabase/server";

// ❌ WRONG — never do this
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(url, key);
```

---

## Rule 6 — Server Actions via `next-safe-action`

- All mutations must use `next-safe-action` server actions.
- Actions live in `modules/<domain>/actions/`.
- Every action must have Zod input validation using the module's schema.
- Never call Supabase directly from a client component.

```ts
// ✅ CORRECT — modules/flights/actions/createFlight.ts
import { actionClient } from "@/shared/lib/safeAction";
import { createFlightSchema } from "@/modules/flights/schemas/flightSchema";

export const createFlightAction = actionClient
  .schema(createFlightSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();
    // ...
  });
```

---

## Rule 7 — Data Fetching via TanStack Query

- All server-state fetching must use TanStack Query for client-visible cache ownership. Server-only helpers may fetch the data, but interactive client surfaces must read through `useQuery`, hydrated query data, or query options rather than plain React context or Zustand.
- Query definitions live in `modules/<domain>/queries/`, including query keys, query options, and browser-safe fetchers that call route/action boundaries instead of Supabase directly.
- Keep one canonical query file per resource or closely related resource group. Do not split connected query options into alias/re-export files like `*-query.ts` when one file is clearer.
- Standard read flow: `component -> hook -> query options -> client service/API route -> server service -> Supabase`.
- Hooks that read server state through TanStack Query must use the file suffix `.query.ts`; hooks that wrap `next-safe-action` mutations must use `.action.ts`.
- Use query key factories (constants) to keep keys consistent and avoid collisions.
- Never use Zustand to store data that came from the server.
- Optimize every query before adding it: select only the columns needed by the caller, avoid `select("*")` unless the full row is truly required, and do not fetch nested relations or signed URLs unless the current surface displays them.
- Shared server queries that can run more than once in a single render/request, especially auth/profile helpers like `getCurrentProfile`, must be wrapped with React `cache()` or use an existing cached helper. Do not create duplicate Supabase auth/profile calls in a page when the dashboard shell already provides the profile.
- Split query helpers by data shape when needed. Use lightweight viewer/authorization queries for route guards and permission checks; use detailed queries only for pages that actually display the extra fields.
- After mutations that change cached server data, invalidate the affected TanStack Query keys on the client and revalidate the affected route or layout with `revalidatePath` when server-rendered data also depends on the change.

---

## Rule 8 — Forms

- All forms use React Hook Form with `@hookform/resolvers` and Zod.
- The Zod schema for a form lives in `modules/<domain>/schemas/`.
- The form component lives in `modules/<domain>/components/`.

---

## Rule 9 — State Management Rules

| Type of State                                | Tool to Use                |
| -------------------------------------------- | -------------------------- |
| Server/async data                            | TanStack Query             |
| Global UI state (sidebar, theme, etc.)       | Zustand in `shared/store/` |
| Local component state                        | `useState`                 |
| URL-driven state (filters, tabs, pagination) | `nuqs`                     |

Never use Zustand for server state. Never use TanStack Query for pure UI state.

---

## Rule 10 — TypeScript

- Strict TypeScript everywhere. `any` is forbidden. Use `unknown` and narrow explicitly.
- Module-level types live in `modules/<domain>/types/`.
- Supabase table-derived row aliases and query projection types for a module must also live in `modules/<domain>/types/`, not inline inside actions, hooks, queries, or services.
- Global/shared types live in `shared/types/`.
- Supabase database types are generated and live at `shared/types/supabase.ts`. Always use generated types for DB operations, never write raw type shapes manually.

---

## Rule 11 — Import Aliases

Always use `@/` path aliases. Never use relative imports that go up more than one directory level.

```ts
// ✅ CORRECT
import { cn } from "@/shared/lib/utils";
import { FlightCard } from "@/modules/flights/components/FlightCard";

// ❌ WRONG
import { cn } from "../../../shared/lib/utils";
```

---

## Rule 12 — Naming Conventions

| Item                | Convention                 | Example                  |
| ------------------- | -------------------------- | ------------------------ |
| Files               | kebab-case                 | `flight-card.tsx`        |
| React Components    | PascalCase                 | `FlightCard`             |
| Hooks               | kebab-case, `use-` prefix, `.query` or `.action` suffix for server data hooks | `use-flights.query.ts` |
| Server Actions      | camelCase, `Action` suffix | `createFlightAction`     |
| Zod Schemas         | camelCase, `Schema` suffix | `createFlightSchema`     |
| Types / Interfaces  | PascalCase                 | `Flight`, `FlightStatus` |
| Zustand Stores      | camelCase, `Store` suffix  | `useSidebarStore`        |
| Query Key constants | SCREAMING_SNAKE_CASE       | `FLIGHT_KEYS`            |

---

## Rule 13 — All Tables Must Use Server-Side Pagination

Every table that displays a list of rows from the database **must** paginate on the server, never on the client. This prevents fetching thousands of rows on every page load.

**The standard pattern across all layers:**

```
server service → Supabase .range() + count
API route/action → accepts ?page=&pageSize=
client service → passes page/pageSize to fetch
query options → key includes { page, pageSize }; placeholderData: (prev) => prev
hook → exposes totalCount, totalPages
nuqs → useQueryState("page", parseAsInteger) for URL-driven state
TanStack Table → manualPagination: true + pageCount
mutations → invalidate parent query key (e.g. ["students"]) to refetch all pages
```

**Reference implementation** — `modules/students/services/students.server.ts`, `modules/students/queries/students.ts`, and `modules/students/components/students-table.tsx`.

Key rules:
- Server service returns `PaginatedResponse<T>` from `shared/types/pagination.ts`.
- Query key factory must have a parent key (e.g. `all: ["resource"]`) for invalidation and a parameterized key (e.g. `list: (page, pageSize) => ["resource", "list", { page, pageSize }]`).
- Use `placeholderData: (previousData) => previousData` to keep the previous page visible while the next loads.
- Use `nuqs` `useQueryState("page", parseAsInteger.withDefault(1))` for pagination state — never `useState`.
- Table component uses `manualPagination: true` and `pageCount` from the query response. Do NOT use `getPaginationRowModel`.
- Mutations that change listed data must invalidate the parent query key, not a specific page key.

```ts
// ✅ CORRECT — server returns PaginatedResponse
export async function getResourcePage(page: number, pageSize: number) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { count } = await supabase.from("table").select("*", { count: "exact", head: true }).eq(...);
  const { data } = await supabase.from("table").select("...").range(from, to);
  return { data, totalCount: count ?? 0, page, pageSize, totalPages: Math.ceil((count ?? 0) / pageSize) };
}

// ✅ CORRECT — query options with page in key and placeholderData
queryOptions({
  queryKey: RESOURCE_KEYS.list(page, pageSize),
  queryFn: () => fetchResourcePage(page, pageSize),
  placeholderData: (prev) => prev,
});

// ✅ CORRECT — table uses manual pagination
useReactTable({
  data: data?.data ?? [],
  pageCount: data?.totalPages ?? -1,
  manualPagination: true,
  state: { pagination: { pageIndex: page - 1, pageSize } },
  onPaginationChange: (updater) => { /* updates nuqs page state */ },
});
```

---

## Rule 14 — Verification Scope

- Do **not** run Playwright, browser automation, E2E tests, or broad test suites unless the user explicitly asks for them.
- This is a small project on a tight deadline. Default verification is `npm run lint`, `npm run typecheck`, and `npm run build` only when relevant.
- If a change cannot be confidently verified without browser/test execution, say so briefly instead of running those tools.

---

## Absolute Prohibitions

These are hard rules. There are no exceptions.

- ❌ Never write business logic inside `app/` pages.
- ❌ Never import from one module into another.
- ❌ Never put single-module files in `shared/`.
- ❌ Never instantiate a Supabase client outside `shared/lib/supabase/`.
- ❌ Never use `any` types.
- ❌ Never add custom components to `shared/components/ui/` — that folder is shadcn-managed only.
- ❌ Never manage server/async data with Zustand.
- ❌ Never use relative imports that traverse up more than one level (`../../`).
- ❌ Never call Supabase directly from a client component — always go through an action or server-side query.
- ❌ Never use client-side pagination (`getPaginationRowModel`) in tables — all pagination must be server-side with `manualPagination: true`.

---

## When Adding a New Module

Every new feature module must have all of these subdirectories created before any code is written:

```
modules/<newfeature>/
├── components/
├── actions/
├── hooks/
├── queries/
├── services/
├── schemas/
├── types/
└── utils/
```

And a corresponding page file:

```
app/(dashboard)/<newfeature>/page.tsx
```

The page file must only render the module's root component. No exceptions.
