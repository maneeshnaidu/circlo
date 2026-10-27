# Code Standards

## General

- Keep components, handlers and actions small and single-purpose.
- Fix root causes, do not layer workarounds.
- Respect the invariants in `architecture.md`. If a change needs a client component to reach the database, the design is wrong, not the rule.
- Match the surrounding code: naming, comment density and idiom.

## TypeScript / Next.js

- `strict` is on. No `any`; derive types from zod schemas (`z.infer`) and Prisma types.
- Import with the `@/` alias (maps to the repo root, e.g. `@/lib/prisma`).
- Components are server components by default. Add `'use client'` only for hooks, state or browser APIs, and keep it as low in the tree as possible.
- Pages that read data call `createClient()` from `@/lib/supabase/server`, then load the `User` by `supabaseId`. Do not repeat that inline in new code: add and use one `requireUser()` helper that returns `{ user, organisationId, role }` or redirects/401s.
- Mutations: prefer server actions for form submissions from our own UI, route handlers (`app/api/**/route.ts`) for CSV, file, webhook and any endpoint that is not form-driven. Both do authentication and tenant scoping themselves.
- Server actions are public endpoints. Treat every argument as untrusted, validate with zod, and never accept identity (`supabaseId`, `organisationId`, `role`) as an argument.
- After a mutation, call `revalidatePath` for the affected pages.
- Route handlers return `NextResponse.json` with correct status codes (401, 403, 404, 400 with flattened zod errors, 409 for conflicts). Catch malformed JSON. Never return raw exception text.
- File and folder naming follows the existing tree: route folders lowercase, components `PascalCase.tsx`, utilities `camelCase.ts` or `kebab-case.ts` in `lib/` and `hooks/`.

## Data (Prisma)

- Every query on a tenant-owned model includes `organisationId` (directly or through a relation such as `campaign: { organisationId }`). Missing this is a security bug.
- Use `select` for pages that only need a few fields, and `Promise.all` for independent counts.
- Schema changes: edit `prisma/schema.prisma`, run `pnpm db:generate`. Use `db:push` only on a local throwaway database. Once the migration workflow is adopted, use `prisma migrate dev` and commit the migration; never `db:push` against shared or production data.
- Scoring code is pure (answers in, scores out), lives in `lib/scoring/`, and has unit tests. Any change to weights, bands or questions creates a new questionnaire version (Invariant 4).
- New tenant-owned models need `organisationId` (or a relation path to it) and an index on it.

## Styling and UI

- Tailwind utility classes using tokens from `ui-context.md`. Do not add new hard-coded hex or palette classes where a token exists.
- Prefer existing shadcn primitives and `components/shared` before creating bespoke markup.
- Use the `cn()` helper from `@/lib/utils` for conditional classes.
- Forms use react-hook-form with a zod schema; show field errors inline and success or transient errors with a toast.

## Testing

- There is no test runner yet. Adding one (Vitest for unit tests, Playwright for the demo path) is a Phase 4 spec. Until then, `pnpm build` must pass and every spec lists manual verification steps.
- Once present: scoring, tenant scoping helpers, token expiry and plan limits require tests.
- Verification must run against a real PostgreSQL database, not a mock.

## Secrets and Configuration

- Local: `.env` (git-ignored), never `.env` committed. Hosted: environment variables.
- `.env.example` lists variable names with empty or placeholder values only.
- Required today: `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Never log supplier names, emails or contact names at info level or above.

## File Organisation

- `app/(auth)/`, `app/(app)/<feature>/`, `app/api/<resource>/`, `app/auth/callback/`.
- Feature-specific components live next to their route (`app/(app)/suppliers/AddSupplierSheet.tsx`). Cross-feature domain components go in `components/shared/`. shadcn primitives go in `components/ui/`.
- Server-only helpers in `lib/` (import `server-only` in modules that must never reach the client).
