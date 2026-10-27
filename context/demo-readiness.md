# Demo Readiness

What stands between today's skeleton and a product you can show to ANZ
corporates. Each item below is a candidate spec for `context/feature-spec/`.
Specs are **not written yet**: draft them one at a time using the template in
`ai-workflow-rules.md`.

Verified against the repo on 2026-10-27.

## Current state

| Area | State |
| ---- | ----- |
| Auth, route guard | Works. Known security gaps in `architecture.md`. |
| Suppliers | List, detail, add sheet, CSV import exist. No edit, delete or dedupe. |
| Campaigns, scores, reports, org settings | Stub pages (≈16–22 lines). |
| Dashboard | Three counts. No charts, no band distribution. |
| Supplier-facing questionnaire (`/assess`) | Does not exist. |
| Scoring, questionnaire definition | Do not exist. Schema is ready. |
| Email, file storage, PDF | Not installed. |
| Tests | None. |
| Seed data, demo tenant | None. |
| Migrations | None (`db:push` only). |

## Candidate specs (in order)

Ordering principle: security first, then the end-to-end loop, then the output a
prospect sees, then polish.

| ID | Spec | Why it matters for sales | Depends on |
| -- | ---- | ------------------------ | ---------- |
| D1 | **Security baseline**: `requireUser()` helper, fix `createOrgAndUser`, proxy fail-closed, harden `/api/healthz` and `/api/suppliers`, roles enforced, rate limiting for public routes | Corporates will run security reviews; this also blocks every later spec | none |
| D2 | **Config, migrations, deploy**: real `.env.example`, adopt `prisma migrate`, choose host and region, CI (build and type check), error monitoring | Needed for any live demo URL and for data-residency answers | D1 |
| D3 | **Questionnaire v1 and scoring engine**: definition in code (`lib/questionnaire/v1`), pure scoring in `lib/scoring`, unit tests, recommendations text. Review weights with a subject-matter expert (open question) | The product's core; credibility depends on explainable scoring | D2 |
| D4 | **Campaigns**: create, select suppliers, dispatch, close, per-supplier status table, reminders | Shows the buyer workflow | D1, D3 |
| D5 | **Email dispatch** (Resend or chosen provider): magic-link emails, reminders, branded template, delivery to a test address in demos | Makes the loop real | D4 |
| D6 | **Supplier questionnaire** at `/assess/[token]`: mobile-first, save and resume, expiry, results page, document upload (storage) | The supplier experience is the main sales proof | D3, D4, D5 |
| D7 | **Scores and dashboard**: scores list and filters, supplier scorecard, band distribution and dimension radar charts, benchmark view | What the buyer sees every day | D3, D6 |
| D8 | **Reports**: supplier PDF, campaign CSV, and a disclosure-support summary. Wording rules in `ai-workflow-rules.md` | Outputs prospects ask for; the compliance-claim risk lives here | D7 |
| D9 | **Demo tenant and seed script**: synthetic organisation per vertical (retail/FMCG, construction, logistics, agri), 30–80 synthetic suppliers, finished campaigns, varied scores. Reset command | Makes a 15-minute demo repeatable without real PII | D7 |
| D10 | **Branding and UI polish**: brand palette and logo, empty/loading states, remove stub copy, rename leftovers, accessibility pass, `globals.css` token cleanup | First impressions in demos | D7 |
| D11 | **Team and roles**: invites, `BUYER_VIEWER` restrictions, `PLATFORM_ADMIN` tenant view | Needed once more than one buyer user is in a trial | D1 |
| D12 | **Audit log and privacy basics**: audit trail of key actions, supplier-data deletion, retention notes, privacy policy and terms pages | Frequent corporate procurement asks | D4 |
| D13 | **Test baseline**: Vitest for scoring and tenant helpers, Playwright for the demo path | Protects the demo from regressions | D6 |
| D14 | **Plans and billing** (only after pricing validated) | Not needed to demo; avoid building before discovery | D1 |

Enterprise asks to expect but not build yet: SSO, SLA, custom questionnaires,
API access, data-residency attestation.

## Sales kit (outside code)

- One-page positioning: problem, solution, "supports, does not certify".
- 15-minute demo script on the seeded tenant, with the regulatory context from
  `market-research.md` verified first.
- Security and privacy one-pager (hosting region, data stored, sub-processors).
- Discovery question list (`market-research.md` section 7).
- Pilot offer: free first campaign for a small supplier set, in exchange for
  feedback and a reference.

## Definition of "demo-ready"

1. D1–D9 done; D10 at least for the pages shown in the demo.
2. A full loop (register → import → campaign → email → supplier answers →
   scores → report) runs on a clean database without manual database edits.
3. The demo tenant can be reset in one command.
4. No stub text, console errors or real PII on any demo screen.
5. All figures quoted in the demo are traced to a primary source in
   `market-research.md`.
