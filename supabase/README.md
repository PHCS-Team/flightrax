# Supabase

- Put SQL migrations in `supabase/migrations/`.
- Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in your local env. `NEXT_PUBLIC_SUPABASE_ANON_KEY` is also accepted for older projects.
- Generate local database types with `npm run supabase:types:local`.
- Generate hosted project types with `SUPABASE_PROJECT_ID=<project-ref> npm run supabase:types`.
- Generated database types should be committed at `shared/types/supabase.ts`.
