# Progress Tracker

Update this file after every meaningful implementation change.

Keep it short. Each completed spec gets **one line** under Completed; the
detail lives in the spec file in `context/feature-spec/complete/`. When a
section grows past a screen, move old entries to `context/progress-archive.md`.

## Current Phase

Between Phase 0 and Phase 1 (see `project-overview.md`). The foundation is
built; the assessment loop is partial. The `context/` files were rewritten on
2026-10-27 after being copied from a sibling .NET project.

## Current Goal

Make Circlo demo-ready for ANZ large-corporate prospects. The ordered spec list
is in `demo-readiness.md`. Start with spec D1 (security baseline) because every
later spec builds on `requireUser()` and tenant scoping.

## Completed

- Foundation commits (pre-tracker): Next 15 app, Supabase Auth, `proxy.ts`,
  Prisma schema, shadcn UI, dashboard skeleton and counts, supplier add and CSV
  import, error/loading/not-found pages, `/api/healthz`.
- **00-context-reset** (2026-10-27): rewrote `context/` to match the real stack;
  added `market-research.md` and `demo-readiness.md`.

## In Progress

- None.

## Next Up

1. **D1 Security baseline** (see `architecture.md` Known Security Gaps).
2. **D2 Env, migrations and deploy decision.**
3. **D3 Questionnaire v1 and scoring engine.**

## Open Questions

- **Scoring design**: do the five weights and the four bands from Recircl stand,
  or should they be reviewed with a sustainability subject-matter expert and
  tailored per vertical? This affects the whole product's credibility.
- **Positioning**: confirm the "supports, does not certify" wording with whoever
  owns sales. Is a legal read needed before a disclosure-support report is shown?
- **Branding**: Circlo (repo, app title) vs Recircl (sibling project). Pick one,
  then choose a brand colour and logo.
- **Hosting**: Vercel (check licence terms for commercial use), Cloudflare,
  Azure, or Fliway/NZ Post infrastructure? Data residency (NZ/AU region) is
  likely to come up in corporate procurement.
- **Email, storage, PDF**: Resend, Supabase Storage and a PDF library are all
  assumed but none is installed. Confirm choices, and whether an NZ Post / Fliway
  security review applies to new sub-processors.
- **Pricing**: no validated figures. Enterprise-first pricing needs customer
  discovery (see `market-research.md`).
- **Supplier data and privacy**: supplier contacts are personal information.
  Privacy policy, data-retention and deletion rules are needed before real
  customers.
- **Migrations**: adopt `prisma migrate` now (recommended) rather than `db:push`.
- **Company relationship**: is Circlo a Fliway/SCS product, or a personal venture?
  This decides GitHub org, contracts, IP and who can sign customer agreements.

## Architecture Decisions

- **Keep the current stack** (2026-10-27): Next 15 full stack, Prisma on
  Postgres, Supabase Auth. No separate API service. Rationale: smallest moving
  parts for a demo-ready product; decided by the owner.
- **Positioning** (2026-10-27): circularity scoring that supports disclosure,
  not emissions accounting or compliance certification.

## Session Notes

- Run: `pnpm install`, create `.env` with `DATABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, then
  `pnpm db:push` (local only) and `pnpm dev`.
- Check `/api/healthz` after startup.
- The `context/` folder is currently untracked in git; commit it.
