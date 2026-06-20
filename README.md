# FixFare

FixFare is a community-driven, AI-powered platform where users post real-life daily problems and receive practical, product-linked solutions from both people and AI.

Think: Reddit problems + Instagram discovery + AI assistant + affiliate shopping, all in one feed.

## Features

- Post a daily problem under a category (Home, Fashion, Tech, Study, Budget, Organization, DIY)
- Get solutions from other users or generate one instantly with AI
- Upvote the most helpful solutions
- New problems appear live for everyone via realtime updates
- No sign-up friction — just pick a username, no passwords

## Tech stack

- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui (Radix UI primitives)
- Supabase — Postgres database, Row Level Security, realtime subscriptions, and edge functions
- Google Gemini API (`gemini-2.5-flash`) for AI-generated solutions

## Getting started

Full setup instructions — creating your Supabase project, running the database
schema, and wiring up your own Gemini API key — are in [SETUP.md](./SETUP.md).
Read that first if this is your first time running the project.

Quick version, once Supabase and Gemini are set up:

```bash
npm install
cp .env.example .env   # then fill in your Supabase project values
npm run dev
```

The app runs at `http://localhost:8080`.

## Project structure

```
src/
  components/        FixFare-specific UI (problem cards, post dialog, solution form, etc.)
  components/ui/     shadcn/ui component library (generic, reusable building blocks)
  hooks/             Custom React hooks (user session, mobile detection)
  integrations/      Supabase client and generated types
  lib/               Local user-identity store, utility helpers
  pages/             Top-level routed pages
  types/             Shared TypeScript types for the data model
supabase/
  functions/         Edge function that calls Gemini to generate AI solutions
  migrations/        SQL schema: users, problems, solutions, upvotes tables
```

You'll only ever need to touch the files under `src/components/`, `src/pages/`,
`src/hooks/`, `src/lib/`, and `supabase/`. Everything in `src/components/ui/` is
generic shadcn/ui boilerplate you don't need to edit.

## How the AI solution generator works

When a user clicks "Generate AI Solution," the frontend calls a Supabase edge
function (`generate-solution`), which sends the problem to Gemini and returns a
suggested solution plus an optional product recommendation. The Gemini API key
is stored as a Supabase secret and never exposed to the browser.

Two non-obvious things this function needs to work correctly:

- **JWT verification must be disabled** for this function in Supabase
  (Dashboard → Edge Functions → generate-solution → Settings, or via
  `verify_jwt = false` in `supabase/config.toml`) — otherwise the browser's
  CORS preflight request gets rejected before your code even runs.
- **The Gemini model name matters.** Google retires Gemini model versions on a
  schedule. This project currently uses `gemini-2.5-flash`. If you start
  getting unexplained errors from the AI button, check
  https://ai.google.dev/gemini-api/docs/models for current model availability
  before assuming it's a code bug.

See [SETUP.md](./SETUP.md) for full deployment steps.

## License

No license specified yet. Add one (MIT is a common default for personal projects) if you plan to share this publicly.
