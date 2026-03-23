# CLAUDE.md — MetriX

## Project Overview

MetriX is a personal life-metrics dashboard. Users define weighted **metric categories** (e.g. Fitness, Finance), each containing **submetrics** (e.g. Steps, Sleep) with configurable targets, tracking periods, and aggregation types. Entries are logged against submetrics and rolled up into a hierarchical scoring system that produces an overall "life score."

## Tech Stack

| Layer      | Choice                             |
| ---------- | ---------------------------------- |
| Framework  | Next.js 16 (App Router, RSC)       |
| Language   | TypeScript (strict)                |
| Styling    | Tailwind CSS v4 + shadcn (radix-nova style) |
| Database   | Supabase (Postgres + Auth + RLS)   |
| Charts     | Recharts 3                         |
| Auth       | Supabase magic-link email          |
| Theme      | next-themes (dark/light toggle)    |
| Icons      | lucide-react                       |

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
```

## Architecture

### Data Model (3-tier hierarchy)

```
metrics (category)  →  submetrics (tracked item)  →  submetric_entries (data point)
```

- **metrics**: user-owned categories with weight + color. RLS by `user_id`.
- **submetrics**: belong to a metric. Have `unit_type` (number|boolean|time|currency|percentage), `target_value`, `tracking_period` (daily|weekly|monthly), `aggregation_type` (sum|latest), weight.
- **submetric_entries**: individual logged values with `recorded_at` timestamp and optional note. RLS by `user_id`.
- **user_profiles**: one row per user storing fitness context (DOB, sex, height, weight, activity level, goal), finance context (income, expenses, debt, employment), and preferences (unit system, currency). RLS by `user_id`.
- **target_recommendations**: persisted personalized recommendations with accept/dismiss workflow. FK to `submetrics`, status lifecycle: `pending` → `accepted`/`dismissed`/`expired`. RLS by `user_id`.

DB schema: `supabase/migrations/001_initial_schema.sql`, `supabase/migrations/002_user_profiles_and_recommendations.sql`

### Scoring Pipeline (`lib/scoring.ts`)

All pure functions, no I/O:
1. `aggregateEntries()` — sum or latest within current tracking period
2. `normalizeValue()` — raw value → 0.0–1.0 score (capped)
3. `computeSubmetricScore()` → `computeMetricScore()` (weighted avg) → `computeOverallScore()` (weighted avg)

### Insights & Streaks (`lib/insights.ts`)

Pure functions operating on 30-day entry window:
- `computeSubmetricStreak()` — consecutive periods target was met
- `generateDashboardInsights()` — top 5 insights (strength, decline, streak, attention, perfect)
- `generateProgressionRecommendations()` — suggest raising/lowering targets based on recent performance

### Personalized Recommendations (`lib/recommendations/`)

Pure computation layer generating evidence-based target recommendations from user profile data. No external APIs — all formulas are peer-reviewed and computed locally.

- **`constants.ts`** — All magic numbers: activity multipliers, calorie adjustments, protein ranges, sleep brackets, budget ratios, submetric name alias map
- **`fitness.ts`** — `computeBMR()` (Mifflin-St Jeor), `computeTDEE()`, `computeCalorieTarget()`, `computeProteinTarget()`, `computeStepTarget()`, `computeExerciseMinutesPerDay()`, `computeSleepTarget()` (NSF), `computeWaterTarget()`, `generateFitnessRecommendations(profile)`
- **`finance.ts`** — `computeSavingsRate()` (50/30/20 rule), `computeEmergencyFundTarget()`, `computeInvestmentTarget()`, `generateFinanceRecommendations(profile)`
- **`engine.ts`** — `generateAllRecommendations(profile, metrics)` orchestrates formula generation + keyword-based submetric matching
- **`types.ts`** — Internal types (`FormulaResult`, `FitnessProfileInput`, `FinanceProfileInput`)

Recommendations are scoped to Fitness and Finance categories. Matching uses a keyword alias map in `constants.ts` to connect user-created submetric names to formulas.

### Server vs Client Split

**Server Components** (data fetching + score computation):
- `app/(dashboard)/page.tsx` — Dashboard
- `app/(dashboard)/metrics/page.tsx` — Metrics management
- `app/(dashboard)/metrics/[id]/page.tsx` — Metric detail
- `app/(dashboard)/onboarding/page.tsx` — New user onboarding
- `app/(dashboard)/profile/page.tsx` — User profile for personalized recommendations

**Client Components** (`"use client"`):
- `components/metrics/DashboardClient.tsx` — Dashboard interactivity
- `components/metrics/MetricsPageClient.tsx` — Accordion CRUD for metrics/submetrics
- `components/metrics/MetricChart.tsx` — Recharts line chart (7d/30d/90d)
- `components/metrics/EntryForm.tsx` — Log entries
- `components/metrics/MetricForm.tsx` — Create/edit metric modal
- `components/metrics/PersonalizedRecommendationsPanel.tsx` — Profile-based recommendation cards with accept/dismiss
- `components/onboarding/OnboardingClient.tsx` — Two-step flow: template selection + optional profile setup
- `components/profile/ProfileFormClient.tsx` — Multi-section profile form with progressive disclosure
- `components/providers/ThemeProvider.tsx` — next-themes wrapper
- `app/(dashboard)/settings/page.tsx` — Theme toggle + logout

### Server Actions (`lib/actions.ts`)

All mutations go through `'use server'` actions:
- `createMetric`, `updateMetric`, `deleteMetric`
- `createSubmetric`, `updateSubmetric`, `deleteSubmetric`
- `createSubmetricEntry`, `deleteSubmetricEntry`
- `createMetricsFromTemplates` (onboarding bulk create)
- `getUserProfile`, `upsertUserProfile` (profile CRUD; upsert expires pending recs + triggers regeneration)
- `generateAndStoreRecommendations` (runs engine, persists results, skips previously dismissed)
- `getPersonalizedRecommendations` (fetches pending recs with submetric/metric context)
- `acceptRecommendation`, `dismissRecommendation`, `acceptAllRecommendations` (recommendation workflow)

Each action authenticates via cookie, mutates via Supabase, then calls `revalidatePath()`.

### Routing

| URL              | Component              | Auth   |
| ---------------- | ---------------------- | ------ |
| `/`              | Dashboard              | Required |
| `/metrics`       | Metrics management     | Required |
| `/metrics/:id`   | Metric detail          | Required |
| `/profile`       | User profile + recs    | Required |
| `/onboarding`    | New user setup         | Required |
| `/simulate`      | Placeholder            | Required |
| `/settings`      | Theme + account        | Required |
| `/login`         | Magic-link login       | Public |
| `/auth/callback` | Supabase code exchange | Public |

Route group `(dashboard)` shares a layout with `<Nav>` top bar. Auth guard is in `middleware.ts`.

### Supabase Clients

- **Server**: `lib/supabase/server.ts` — uses `cookies()`, for RSC/actions/route handlers
- **Browser**: `lib/supabase/client.ts` — `createBrowserClient`, for client components
- **Middleware**: `lib/supabase/middleware.ts` — session refresh helper

### Path Aliases

`@/*` maps to project root (tsconfig paths).

### Theme

Amber/gold palette. CSS custom properties in `app/globals.css` with light and dark variants. Custom classes: `card-gradient`, `text-glow`, `accent`, `pine`.

### UI Components

Custom primitives in `components/ui/` (Button, Input, Modal) — not full shadcn component library. shadcn configured with `radix-nova` style in `components.json`.

## Conventions

- Mutations always use Server Actions, never direct Supabase calls from client components
- Score computation happens server-side in page components, passed as props to client components
- All scoring/insights/recommendation functions are pure (no I/O) for testability
- Entries are fetched in 30-day windows for charts, filtered to current period for scores
- `revalidatePath()` after every mutation to bust Next.js cache
- Types mirror DB schema — defined in `types/index.ts`
- Personalized recommendations coexist with progression-based recommendations on the dashboard, visually distinguished
- Profile save expires all pending recommendations and triggers fresh generation
- Dismissed recommendations are tracked by `formula_id + submetric_id` and won't re-suggest until profile changes

## Placeholders / Incomplete

- `/simulate` page is a placeholder stub
- No tests yet
- No generated Supabase types (`supabase gen types` not wired up — using manual types)
- Submetric RLS policy only has USING (no WITH CHECK for insert/update/delete)
