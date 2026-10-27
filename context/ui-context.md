# UI Context

## Theme

A light, clean B2B SaaS theme for procurement and sustainability professionals
on desktop. Suppliers reach the questionnaire from an email link, often on
mobile, so the public `/assess` flow must work well at phone widths.

Current state: the tokens in `app/globals.css` are **stock shadcn neutral**
(primary is near-black). There is no brand colour yet. Adopting a sustainability
brand palette, and a logo, is a design task for the demo-readiness work
(`demo-readiness.md`), not an assumption to code against.

A `.dark` token set exists but nothing toggles it. Dark mode is out of scope.

## Tokens

Tailwind 4, CSS-first: there is **no `tailwind.config.ts`**. `app/globals.css`
defines `@theme { --color-*: hsl(var(--*)) }` mappings and the `:root` / `.dark`
variable values. Use the token classes (`bg-background`, `bg-primary`,
`text-muted-foreground`, `border-border`, `bg-sidebar`, `text-destructive`,
chart colours `chart-1..5`). Do not add hard-coded hex values.

Note: `globals.css` currently defines `:root` variables twice (HSL triplets and
full `hsl()` values, with different `--primary` and `--radius`). Reconcile this
when the brand palette is introduced.

Score bands are colour-coded consistently everywhere a band appears. The single
source is `components/shared/CircloScoreBadge.tsx`; reuse it, do not redefine
colours per screen.

| Band | Colour family |
| ---- | ------------- |
| Leading (≥ 80) | emerald |
| Advancing (≥ 60) | blue |
| Progressing (≥ 40) | amber |
| Developing (< 40) | red |

## Typography

| Role | Font | Where |
| ---- | ---- | ----- |
| UI text | Manrope (`next/font/google`) | applied on `<html>` in `app/layout.tsx` |

## Border Radius

Driven by `--radius`; Tailwind `rounded-sm`, `rounded-md`, `rounded-lg` map to
`radius - 4px`, `radius - 2px` and `radius`.

## Component Library

- **shadcn/ui** (`components.json`) with `radix-ui`. Primitives are in
  `components/ui/`. Add new ones with the shadcn CLI; do not hand-fork them.
- **Shared domain components** in `components/shared/`: `PageHeader`,
  `EmptyState`, `ConfirmDialog`, `CircloScoreBadge`, `SupplierStatusBadge`,
  `AppSidebar`. Reuse before creating new ones.
- **Forms**: react-hook-form + zod, `components/ui/form.tsx`.
- **Feedback**: a toast library is not installed yet. Add one (shadcn `sonner`)
  when first needed.
- **Charts**: not installed yet. Add `recharts` (via shadcn chart) with the
  dashboard and score work.

## Layout Patterns

- **Auth pages** (`app/(auth)`): centred card on a plain background.
- **App shell** (`app/(app)/layout.tsx`): shadcn `Sidebar` (`AppSidebar`) with
  Dashboard, Suppliers, Campaigns, Scores, Reports, Settings, and a content
  area holding a `PageHeader` plus page content.
- **Loading and errors**: `loading.tsx` skeletons, `app/(app)/error.tsx`,
  `app/global-error.tsx`, `app/not-found.tsx` exist. Use them rather than
  ad hoc spinners.
- **Public questionnaire** (`/assess/[token]`, planned): mobile-first, one
  section at a time, visible progress and save state.
- **Tables**: list pages with search and filter, pagination, row click to detail.
- **Status**: campaign and supplier statuses render as badges with consistent
  colours (`SupplierStatusBadge`).
- **Sales-demo bar**: because this app will be shown to prospects, every list
  page needs a real empty state, a loading state and no placeholder "stub" text.

## Icons

lucide-react only: 16px (`size-4`) inline in text, tables and buttons, 20px
(`size-5`) in nav items and headers.
