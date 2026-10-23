# CLAUDE.md — MetriX

## Project Overview

MetriX is a personal life-metrics dashboard. Users define weighted **metric categories** (e.g. Fitness, Finance), each containing **submetrics** (e.g. Steps, Sleep) with configurable targets, tracking periods, and aggregation types. Entries are logged against submetrics and rolled up into a hierarchical scoring system that produces an overall "life score."

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

- No tests yet
- Dashboard "Latest Reflection" is a placeholder — AI-generated daily summary planned post-V1
- Dashboard "Filters" control is visual only
- No generated Supabase types (`supabase gen types` not wired up — using manual types)
- Submetric RLS policy only has USING (no WITH CHECK for insert/update/delete)
