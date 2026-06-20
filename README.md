# FixFare

FixFare is a community-driven, AI-powered platform where users post real-life daily problems and receive practical, product-linked solutions from both people and AI.

Think: Reddit problems + Instagram discovery + AI assistant + affiliate shopping, all in one feed.

## Features

- Post a daily problem under a category (Home, Fashion, Tech, Study, Budget, Organization, DIY)
- Get solutions from other users or generate one instantly with AI
- Upvote the most helpful solutions
  

## Tech stack

- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui (Radix UI primitives)
- Supabase — Postgres database, Row Level Security, realtime subscriptions, and edge functions
- Google Gemini API (`gemini-2.5-flash`) for AI-generated solutions

## Getting started

Full setup instructions — creating your Supabase project, running the database
schema, and wiring up your own Gemini API key — are in [SETUP.md](./SETUP.md).

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


