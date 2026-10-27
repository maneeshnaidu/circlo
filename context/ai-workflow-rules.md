# AI Workflow Rules

## Approach

Build this project incrementally using a spec-driven workflow. Context files
define what to build, how to build it, and the current state of progress.
Always implement against these specs. Do not infer or invent behaviour from
scratch.

New work starts as a numbered spec in `context/feature-spec/`
(`NN-kebab-name.md`) with the sections Background, Design decisions, Files,
Out of scope, Open questions, and Verification. `demo-readiness.md` lists the
candidate specs in order.

## Scoping Rules

- Work on one feature unit at a time.
- Prefer small, verifiable increments over large speculative changes.
- Do not combine unrelated system boundaries in a single implementation step.

## When to Split Work

Split an implementation step if it combines:

- A Prisma schema change and unrelated feature work.
- Multiple unrelated route groups or API resources.
- Security changes and new features.
- Behaviour not clearly defined in the context files.

If a change cannot be verified end to end quickly, the scope is too broad.

## Handling Missing Requirements

- Do not invent product behaviour not defined in the context files.
- If a requirement is ambiguous, resolve it in the relevant context file before
  implementing.
- If a requirement is missing, add it as an open question in
  `progress-tracker.md` before continuing.

## Facts That Must Be Verified

- Regulatory dates, thresholds and competitor claims in `market-research.md`
  are tagged with their source quality. Do not put a figure in product copy,
  a report or a sales document unless it is traced to a primary source.
- Never write product copy that says Circlo is "compliant with" or "certifies"
  AASB S2, NZ CS or any standard.

## Protected Files

Do not modify the following unless explicitly instructed:

- `components/ui/*`: shadcn-generated primitives. Regenerate with the shadcn
  CLI rather than patching.
- `pnpm-lock.yaml`: change only via `pnpm add` / `pnpm install`.
- Applied Prisma migrations (once adopted): add a new migration instead.
- Anything in `node_modules` or generated Prisma client output.

## Keeping Docs in Sync

Update the relevant context file whenever implementation changes system
architecture or boundaries, the storage model, code standards, feature scope,
or the Known Security Gaps list.

## Before Moving to the Next Unit

1. The current unit works end to end within its defined scope.
2. No invariant in `architecture.md` was violated.
3. `progress-tracker.md` reflects the completed work.
4. Checks pass:
   - `pnpm build` (runs `prisma generate` and `next build`) with no errors.
   - Type check clean (`pnpm exec tsc --noEmit`).
   - The spec's manual verification steps, run against a real Postgres.
   - Unit tests, once a runner exists.
5. Move the spec file from `context/feature-spec/` into
   `context/feature-spec/complete/`. A spec remaining directly under
   `context/feature-spec/` signals it is drafted but not implemented.

## Data Handling

Customer PII (real supplier names, emails, contacts) must not be pasted into
prompts, committed to the repo, or used in seeds and demos. Use synthetic data.
