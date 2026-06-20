# FixFare — Setup Guide (Lovable-independent rebuild)

This is the original FixFare codebase with one change: the AI solution generator
now calls Google's Gemini API directly with your own key, instead of Lovable's
AI gateway. Everything else (React frontend, Supabase database schema, UI) is unchanged.

## What you need before starting

1. A Supabase account (free) — https://supabase.com
2. A Gemini API key (free) — https://aistudio.google.com/apikey
3. Node.js 18+ installed locally
4. The Supabase CLI (for deploying the edge function) — https://supabase.com/docs/guides/cli

## Step 1 — Create your Supabase project

1. Go to https://supabase.com/dashboard and click "New Project"
2. Pick a name, a database password (save it), and a region
3. Wait ~2 minutes for it to provision
4. Go to **Project Settings → API** and copy:
   - Project URL
   - `anon` `public` key

## Step 2 — Set up the database

1. In your Supabase dashboard, open the **SQL Editor**
2. Open `supabase/migrations/20260130150914_72a19327-d688-4133-8e31-31a9db150ebf.sql`
   from this project, copy its entire contents, paste into the SQL editor, and run it.
3. This creates the `users`, `problems`, `solutions`, and `upvotes` tables, sets up
   Row Level Security policies, triggers for upvote counts and timestamps, enables
   realtime on `problems`/`solutions`, and seeds a few demo problems/solutions.

## Step 3 — Configure the frontend

Edit the `.env` file in the project root and fill in the values from Step 1:

```
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-public-key"
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
```

## Step 4 — Deploy the AI edge function

The function lives at `supabase/functions/generate-solution/index.ts`. It now reads
a `GEMINI_API_KEY` secret instead of Lovable's key.

1. Log in and link your project with the Supabase CLI:
   ```
   supabase login
   supabase link --project-ref your-project-id
   ```
2. Set your Gemini key as a secret (this keeps it server-side, never exposed to the browser):
   ```
   supabase secrets set GEMINI_API_KEY=your-gemini-api-key
   ```
3. Deploy the function:
   ```
   supabase functions deploy generate-solution
   ```

If you'd rather not use the CLI, you can paste the function code into a new Edge
Function via the Supabase dashboard (**Edge Functions → Create a function**) and
add `GEMINI_API_KEY` under **Project Settings → Edge Functions → Secrets**.

## Step 5 — Install and run

```
npm install
npm run dev
```

The app will be running at http://localhost:8080

## Step 6 — Build for production

```
npm run build
```

This outputs a static site in `dist/`, deployable to Vercel, Netlify, Cloudflare
Pages, GitHub Pages, or any static host. Remember to set the `VITE_SUPABASE_*`
environment variables in your hosting provider's dashboard too, since `.env` files
aren't usually committed/deployed.

## Notes on what changed from the original

- `supabase/functions/generate-solution/index.ts` — rewritten to call
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
  directly with a `GEMINI_API_KEY` secret, instead of Lovable's AI gateway.
  The request/response shape the frontend expects (`solution`,
  `productRecommendation`, `productLink`) is unchanged, so no other files needed edits.
- `vite.config.ts` / `package.json` — removed `lovable-tagger`, a dev-only plugin
  Lovable's visual editor uses to map UI clicks to source code. It has no effect
  outside Lovable's own editor, so removing it doesn't change app behavior.
- `.env` — credentials blanked out to placeholders; fill in your own Supabase values.
- `supabase/config.toml` — project_id blanked to a placeholder; the Supabase CLI
  will set this correctly when you run `supabase link`.

## Want a different Gemini model?

Edit the `GEMINI_MODEL` constant near the top of
`supabase/functions/generate-solution/index.ts`. Current default is
`gemini-2.0-flash` (fast, cheap, generous free tier). Other options as of this
writing include `gemini-2.0-flash-lite` or `gemini-1.5-pro` if you want higher
quality at higher cost/latency — check https://ai.google.dev/gemini-api/docs/models
for the current list before picking, since model names/availability change over time.
