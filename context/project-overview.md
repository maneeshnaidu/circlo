# Circlo

## Overview

Circlo is a multi-tenant SaaS platform that helps large Australian and New
Zealand businesses measure the circular-economy maturity of their supply chain.
A buyer organisation imports its suppliers, runs assessment campaigns, and each
supplier completes a structured questionnaire through a magic link (no account
needed). Circlo scores every response, benchmarks suppliers, and produces
reports a buyer can use as supply-chain evidence for packaging, procurement and
value-chain disclosure work.

**Circlo scores circularity. It does not calculate Scope 3 emissions and it
does not certify compliance with AASB S2 or NZ CS.** Sales and in-app copy must
say "supports" or "feeds into", never "compliant with". See
`market-research.md` for the regulatory context and positioning.

**The committed scope is the buyer–supplier assessment loop and the reports
built on it.** Everything past that (custom questionnaires, SSO, SLA) is later.

Stack summary: Next.js 15 (App Router, full stack), Prisma 7 on PostgreSQL,
Supabase Auth. See `architecture.md`.

## Target Customer

- **Primary buyer**: large ANZ corporates, in scope for or adjacent to
  mandatory climate disclosure (AASB S2 Groups 1–2, NZ climate reporting
  entities) or packaging obligations. Owners are sustainability, procurement and
  supply-chain leads.
- **Verticals, in priority order for demos**: retail and FMCG / packaging;
  construction and infrastructure; logistics and supply chain; agriculture and
  food.
- **Suppliers**: SMEs that receive a link by email, often on mobile. They never
  pay and never sign in.
- Market evidence, dates and competitors live in `market-research.md`.

## Delivery Phases

State as of 2026-10-27 (verified against the repo, not inherited from another project).

| Phase | Deliverable | Contents |
| ----- | ----------- | -------- |
| 0 | Foundation | Next 15 app, Supabase Auth, `proxy.ts` route guard, Prisma schema, shadcn UI, dashboard skeleton, `/api/healthz`. **Built.** |
| 1 | Assessment loop | Supplier add and CSV import (**built**); campaigns, dispatch email, magic-link questionnaire, scoring engine (**not built**, pages are stubs). |
| 2 | Insight and reporting | Dashboard counts (**built**); scores, benchmarks, supplier PDF, campaign CSV, disclosure-support report (**not built**). |
| 3 | Commercial readiness | Demo data, plan tiers and limits, billing, platform admin, team invites. **Not built.** |
| 4 | Hardening for launch | Security fixes in `progress-tracker.md`, tests, deployment pipeline, monitoring. |
| Later | Enterprise | Custom questionnaires, SSO, SLA, questionnaire versions beyond v1. |

`demo-readiness.md` orders the gaps into candidate specs.

## Goals

1. Give buyers an evidence-based view of supplier circularity with no
   spreadsheet chasing.
2. Make supplier participation friction-free: one link, no login, progress is
   saved, documents can be attached.
3. Produce a consistent, explainable score (weighted sections, fixed bands,
   recommendations) comparable across suppliers and campaigns.
4. Give buyers an auditable, exportable evidence trail that supports their
   value-chain disclosure and packaging reporting.
5. Be demo-ready for sales conversations with ANZ corporates.

## Core User Flows

```
Public
├── /login /register /forgot-password /reset-password
└── /assess/[token]          Supplier questionnaire (magic link, no login)  [not built]
    ├── /results
    └── /expired
Buyer app (sidebar shell, app/(app))
├── Dashboard                 counts built, charts not built
├── Suppliers                 list, detail, add sheet, CSV import (built)
├── Campaigns                 stub
├── Scores                    stub
├── Reports                   stub
└── Settings/Organisation     stub
```

### 1. Buyer onboarding
1. A user registers an organisation (name, sector). The first user becomes
   `BUYER_ADMIN` on the `DEMO` plan.
2. Teammate invites are not built.

### 2. Supplier management
1. A buyer adds suppliers one at a time (`POST /api/suppliers`) or imports a CSV.
2. Plan-based supplier caps are not built.

### 3. Campaign *(to build)*
1. A buyer creates a campaign (`DRAFT`), picks suppliers, and dispatches it.
2. Dispatch moves the campaign to `ACTIVE` and emails each supplier a magic
   link. Each `CampaignSupplier` carries a `magicToken` and `tokenExpiresAt`.
3. Per-supplier status moves `PENDING → SENT → OPENED → IN_PROGRESS →
   COMPLETED`; reminders are tracked (`reminderCount`, `lastReminderAt`).
4. The buyer closes the campaign (`CLOSED`).

### 4. Supplier questionnaire *(to build)*
1. The supplier opens `/assess/[token]`. Invalid or expired tokens go to
   `/assess/expired`.
2. They answer the sections, save progress, and upload documents.
3. On submit they see a results page.

### 5. Scoring *(to build)*
Carried over from the sibling Recircl design and **unvalidated for Circlo**:
see Open Questions in `progress-tracker.md`. The schema already stores five
dimension scores, so these weights fit it:

- Materials & Packaging 0.25, Waste & By-products 0.20, Energy & Water 0.20,
  Product Design for Circularity 0.20, Governance & Reporting 0.15.
- Overall 0–100. Bands: **Leading** ≥ 80, **Advancing** ≥ 60,
  **Progressing** ≥ 40, **Developing** < 40 (`ScoreBand`).
- Every section below 60% generates recommendations (`Score.recommendations`).
- A GHG-readiness indicator, if kept, is reported separately with weight 0 and
  needs a schema field (none exists today).

### 6. Insight and reports *(to build)*
Dashboard distribution, score list with filters, benchmarks, supplier PDF,
campaign CSV, and a disclosure-support report. Wording constraint above applies
to the report title and body.

## Plans *(proposed, not built, not validated)*

The $99 / $299 tiers from the sibling project target SMEs and are likely too
low for the large-corporate customer. Treat any price as a placeholder until
customer discovery. `PlanTier` exists in the schema (`DEMO`, `STARTER`, `GROWTH`,
`ENTERPRISE`), but no limit is enforced anywhere.

## Scope

### In Scope (current commitment)
- The assessment loop end to end, with the security and hardening items.
- ANZ businesses (ABN or NZBN), English UI only.
- A demo-ready tenant with realistic seeded data for the four target verticals.

### Later (direction, not commitment)
- Custom questionnaires per customer, SSO, SLA tooling.
- Billing integration, once pricing is validated.

### Out of Scope
- Supplier accounts or logins. Suppliers use magic links only.
- Emissions calculation, Scope 3 inventories, or compliance certification.
- Markets outside ANZ, localisation, multi-currency billing.
- Dark mode toggle (tokens exist; see `ui-context.md`).

## Success Criteria

1. A new organisation can register, import suppliers, dispatch a campaign and
   receive completed questionnaires without manual intervention.
2. A supplier can complete the questionnaire from the email link on a phone,
   leave and resume, and see their result.
3. Scoring is deterministic: the same answers always give the same score, band
   and recommendations, covered by tests.
4. Tenant isolation holds: no buyer-facing query returns another organisation's
   data (see `architecture.md` Invariant 3).
5. A sales demo can run end to end on seeded data in under 15 minutes.
