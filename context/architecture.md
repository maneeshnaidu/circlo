# Architecture Context

Sections describe what exists today. Items marked *(planned)* do not exist yet.
The numbered **Invariants** at the end are the enforceable rules. Each fact
lives in one place; implementation detail belongs in specs and
`progress-tracker.md`.

## Stack

| Layer | Technology | Role |
| ----- | ---------- | ---- |
| Framework | Next.js 15.6 canary, App Router, Turbopack dev, React 19, TypeScript strict | UI, server components, route handlers, server actions |
| Database | PostgreSQL via Prisma 7 (`prisma-client-js`) with `@prisma/adapter-pg` | All application data |
| Auth | Supabase Auth (`@supabase/ssr`), email and password | Sessions in cookies |
| Validation | zod 3, react-hook-form with `@hookform/resolvers` | Input and forms |
| UI | Tailwind 4 (CSS-first), shadcn/ui on `radix-ui`, lucide-react | See `ui-context.md` |
| CSV | papaparse | Supplier import |
| Package manager | pnpm | Lockfile `pnpm-lock.yaml` |
| Email | *(planned)* Resend | Magic links, reminders |
| File storage | *(planned)* Supabase Storage | Supplier evidence documents |
| PDF | *(planned)* | Supplier and disclosure-support reports |
| Billing | *(planned, later)* | Not committed |
| Hosting | Not decided | `/api/healthz` exists for health checks |

Single deployable. There is no separate API service.

## Layout

- `app/(auth)/`: login, register (+ server action `createOrgAndUser`), forgot and reset password.
- `app/(app)/`: authenticated shell (`layout.tsx` with `AppSidebar`): dashboard, suppliers, campaigns, scores, reports, settings/organisation.
- `app/api/`: `suppliers` (POST), `healthz`. `app/auth/callback/route.ts` handles the Supabase code exchange.
- `proxy.ts`: Next 15.6 request proxy (replaces `middleware.ts`). Refreshes the Supabase session and redirects unauthenticated users away from protected prefixes, and signed-in users away from `/login` and `/register`. Matcher excludes `/assess`.
- `lib/prisma.ts`: singleton Prisma client, requires `DATABASE_URL`.
- `lib/supabase/server.ts` and `client.ts`: Supabase clients.
- `components/ui/`: shadcn primitives. `components/shared/`: domain components (`CircloScoreBadge`, `SupplierStatusBadge`, `PageHeader`, `EmptyState`, `ConfirmDialog`, `AppSidebar`).
- `prisma/schema.prisma`, `prisma.config.ts`.

## Storage Model

Defined in `prisma/schema.prisma`:

- `Organisation` (tenant root; `planTier`, `abn`, `nzbn`, `sector`) → `User`, `Supplier`, `Campaign`.
- `User`: `supabaseId` (unique) links to Supabase Auth; `role` is `BUYER_ADMIN`, `BUYER_VIEWER` or `PLATFORM_ADMIN`.
- `Campaign` (`DRAFT`/`ACTIVE`/`CLOSED`, `questionnaireVersion`) → `CampaignSupplier` (unique `magicToken`, `tokenExpiresAt`, status, reminders) → `Response` (`answersJson`, `questionnaireVersion`) → `Score` (overall, band, five dimension scores, `recommendations`).
- `Document` hangs off `CampaignSupplier` (metadata and `storageKey`; binaries *(planned)* in object storage).
- No soft delete, no audit log, no row-level security yet.
- No migrations directory: the schema is applied with `db:push`. A migration workflow is needed before production (see tracker).
- The questionnaire definition *(planned)* is code, not data; `Campaign.questionnaireVersion` records the version used.

## Auth and Access Model

- Buyers sign in with Supabase email and password. `proxy.ts` is a UX guard, not a security boundary (Invariant 2).
- Server code gets the caller with `supabase.auth.getUser()`, then loads `User` by `supabaseId` to obtain `organisationId` and `role`. `app/api/suppliers/route.ts` and the dashboard page show the current pattern; it is repeated inline, so a shared `requireUser()` helper is *(planned)*.
- Registration creates an `Organisation` and a `BUYER_ADMIN` `User` in one Prisma write.
- Suppliers never authenticate. They hold a per-`CampaignSupplier` magic token with an expiry. Token routes are public, rate-limited *(planned)*, and excluded from the proxy matcher.
- Role enforcement for `BUYER_VIEWER` and `PLATFORM_ADMIN` is *(planned)*; today only authentication is checked.

## Known Security Gaps (fix in Phase 4, do not copy these patterns)

1. `createOrgAndUser` (`app/(auth)/register/actions.ts`) is a public server action that accepts `supabaseId` and `email` from the caller. It must derive both from the authenticated session and refuse if a `User` already exists.
2. `proxy.ts` returns the request unchanged when Supabase env vars are missing, so every protected route is open. It should fail closed.
3. `/api/healthz` is unauthenticated and returns env presence and raw database error text. Restrict or strip it before production.
4. `POST /api/suppliers` does not check role, caps or duplicates, and does not catch malformed JSON.
5. No rate limiting anywhere.

## Deployment

- Not decided. Constraints: Next 15.6 canary, Node, a reachable Postgres, Supabase project for Auth, env `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `build` runs `prisma generate` then `next build`.
- `.env.example` is stale starter boilerplate (Stripe, `AUTH_SECRET`) and must be replaced with the real variables.
- Secrets are environment variables only (Invariant 5).

## Invariants

1. Server components, route handlers and server actions are the only code that touches Prisma or secrets. Client components never import `lib/prisma` or read non-`NEXT_PUBLIC_` env.
2. The server is the security boundary. Authentication, role, tenant and plan checks run in server code on every request. `proxy.ts` and hidden UI are convenience only.
3. Tenant isolation: every buyer-facing query and mutation is scoped by the caller's `organisationId`, loaded server-side from the session user. Never accept `organisationId` or `userId` from a request body, params or a client-supplied identifier.
4. Scoring is deterministic and versioned. A response is scored against the questionnaire version its campaign was created with. Changing weights, questions or bands requires a new version, not an edit to v1.
5. Secrets are never committed: database URL, Supabase service-role key, API keys. `NEXT_PUBLIC_*` values are public by definition and must never hold secrets.
6. Magic tokens are single-purpose, scoped to one `CampaignSupplier`, expire, and never expose another supplier's or the buyer organisation's data beyond what the questionnaire needs.
7. PostgreSQL is the only database. Schema changes go through Prisma and, once adopted, committed migrations; never edit a deployed database by hand.
8. Plan limits and role capabilities are defined in one module *(planned: `lib/plans.ts`)*; no other code hardcodes tier capabilities.
9. Customer PII (supplier contacts) is personal information under the NZ Privacy Act 2020 and the Australian Privacy Act. Do not log it, and do not put real supplier data in seeds, demos or fixtures.
