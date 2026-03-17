# Metric Tracker

A personal metrics dashboard built with Next.js, TypeScript, Tailwind CSS v4, and Supabase.

---

## Project Structure

```
metric-tracker/
├── app/                              # Next.js App Router pages
│   ├── layout.tsx                    # Root layout: <html>, <body>, Geist font, globals.css
│   ├── globals.css                   # Tailwind v4 entry point + CSS custom properties
│   │
│   ├── (dashboard)/                  # Route group — protected pages that share the Nav sidebar
│   │   ├── layout.tsx                # Dashboard shell: <Nav> sidebar + <main> content area
│   │   ├── page.tsx                  # Dashboard  →  URL: /
│   │   └── metrics/
│   │       └── [id]/
│   │           └── page.tsx          # Metric detail  →  URL: /metrics/:id
│   │
│   ├── login/
│   │   └── page.tsx                  # Magic-link login  →  URL: /login
│   └── auth/
│       └── callback/
│           └── page.tsx              # Supabase code-exchange redirect  →  URL: /auth/callback
│
├── components/
│   ├── layout/
│   │   └── Nav.tsx                   # Sidebar navigation (active-link highlight)
│   ├── metrics/
│   │   ├── MetricCard.tsx            # Dashboard card: latest value + link to detail
│   │   ├── MetricChart.tsx           # Recharts line chart with 7d / 30d / 90d filter
│   │   ├── MetricForm.tsx            # Create / edit metric  (modal form)
│   │   ├── EntryForm.tsx             # Log a new data-point  (inline form)
│   │   └── EntryList.tsx             # Scrollable entry-history table
│   └── ui/                           # Thin, reusable primitives
│       ├── Button.tsx                # primary / ghost variants
│       ├── Input.tsx                 # Labeled input with dark-theme styling
│       └── Modal.tsx                 # Portal-based centered overlay
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Browser Supabase client  (Client Components)
│   │   ├── server.ts                 # Server Supabase client  (Server Components / Actions)
│   │   └── middleware.ts             # Session-refresh helper  (imported by root middleware)
│   └── utils.ts                      # Shared helpers: formatDate, formatValue, randomHexColor
│
├── types/
│   └── index.ts                      # Shared TS types: Metric, MetricEntry
│
├── middleware.ts                     # Next.js edge middleware: session refresh + route guards
├── .env.local.example                # Required env vars — copy to .env.local
├── next.config.ts                    # Next.js config
├── tsconfig.json                     # TypeScript config  (@/* alias → ./)
└── package.json
```

### Why a `(dashboard)` route group?

Pages inside `(dashboard)/` share a layout that renders the `<Nav>` sidebar.
The parentheses are invisible in the URL — `(dashboard)/page.tsx` maps to `/`.
This keeps the login and auth-callback pages (which render their own full-screen
UI) out of the sidebar layout without duplicating anything.

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy the example env file and fill in your Supabase project credentials
(found in **Supabase Dashboard → Settings → API**):

```bash
cp .env.local.example .env.local
```

### 3. Set up Supabase tables

Create the `metrics` and `metric_entries` tables and their RLS policies in your
Supabase project.  The exact SQL is in the database-design docs from the planning
phase — a migration file will be added in a future iteration.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Note:** the middleware guards all routes behind auth.  While the Supabase
> client is not yet wired up, the app will redirect every request to `/login`.
> The login form is also a placeholder at this stage.  Both will be connected in
> the next iteration.

---

## Tech Stack

| Layer      | Choice                  | Why                                                                 |
| ---------- | ----------------------- | ------------------------------------------------------------------- |
| Framework  | Next.js 16 (App Router) | Server Components, Server Actions, edge middleware                   |
| Language   | TypeScript              | Type safety across the full stack                                   |
| Styling    | Tailwind CSS v4         | Utility-first, zero runtime                                         |
| Database   | Supabase (PostgreSQL)   | Managed Postgres + Auth + RLS                                       |
| Charts     | Recharts                | React-native API, sensible defaults, moderate bundle size            |

---

## Route Map

| URL              | Page           | Notes                                        |
| ---------------- | -------------- | -------------------------------------------- |
| `/`              | Dashboard      | Card grid; requires auth                     |
| `/metrics/:id`   | Metric Detail  | Chart + entry form + history table           |
| `/login`         | Login          | Magic-link email form                        |
| `/auth/callback` | *(internal)*   | Supabase redirect handler — not a user page  |
