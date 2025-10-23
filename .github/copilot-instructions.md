## Quick orientation for AI coding agents

This repository is a small Vite + React + TypeScript landing page that uses Tailwind CSS
and Supabase for a waitlist flow. Below are succinct, actionable notes that help an AI
be productive when making code changes.

### High-level architecture
- Frontend: Vite + React + TypeScript. Entry is `src/main.tsx` -> `src/App.tsx` which
  composes presentational sections from `src/components/` (e.g. `Header`, `Hero`,
  `WaitlistForm`). Keep changes component-local when possible.
- Styling: Tailwind configured project-wide (`tailwind.config.js`, `src/index.css`).
- Backend/Persistence: Supabase. Client wrapper at `src/lib/supabase.ts`. DB migrations
  live under `supabase/migrations/` (see `20251008002357_create_waitlist_entries_table.sql`).

### Important files to reference
- `package.json` — scripts you can run: `npm run dev`, `npm run build`, `npm run preview`,
  `npm run lint`, `npm run typecheck`.
- `vite.config.ts` — Vite config; note `optimizeDeps.exclude = ['lucide-react']` (icons handled
  as runtime imports).
- `src/lib/supabase.ts` — createClient uses Vite env vars `VITE_SUPABASE_URL` and
  `VITE_SUPABASE_ANON_KEY`. Throwing on missing vars is intentional; respect this guard.
- `src/components/WaitlistForm.tsx` — canonical example of frontend → Supabase flow.
  - Inserts into `waitlist_entries` table and checks for `insertError.code === '23505'`
    to detect duplicate emails.
  - Enforces `.edu` emails via client-side validation before submitting.
- `supabase/migrations/20251008002357_create_waitlist_entries_table.sql` — schema and
  RLS policies. Notes:
  - `email` is UNIQUE and NOT NULL. Duplicate insert attempts produce DB error code 23505.
  - RLS: public (anon) may INSERT; authenticated users may SELECT (admin reading).

### Environment and secrets
- Use Vite env vars with the `VITE_` prefix. Example local file (do not commit):

  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_ANON_KEY=public-anon-key

- `src/lib/supabase.ts` will throw if these are missing — tests and dev runs need them set.

### Build / dev / lint / typecheck
- Start dev server: `npm run dev` (Vite). Port is default (3000 or 5173 depending on your setup).
- Build for production: `npm run build`.
- Preview build: `npm run preview`.
- Lint: `npm run lint` (runs `eslint .`).
- Type check: `npm run typecheck` (uses `tsc --noEmit -p tsconfig.app.json`).

### Code patterns and conventions
- Components are functional React components written in TypeScript and exported as default
  (e.g. `export default function WaitlistForm(...)`). Keep this style when adding new
  components.
- Use small, focused components inside `src/components/`. Prefer props like
  `variant?: 'hero' | 'cta'` (see `WaitlistForm`) for style/behavior variants.
- Validation happens client-side (e.g. regex email check in `WaitlistForm`) before
  calling Supabase. Preserve this UX pattern when adding forms.
- Error handling for Supabase follows the pattern: check `error` / `insertError` returned
  from the client. The code specifically checks `error.code === '23505'` for duplicate
  email handling — keep this mapping if you modify DB schema or client logic.

### Integration and testing notes
- No automated tests are present in the repo. Manual checks:
  - Run `npm run dev` and exercise the waitlist form in the browser.
  - Inspect Network tab for requests to Supabase and check response bodies.
  - Check console for thrown errors from `src/lib/supabase.ts` when env vars are missing.
- When modifying DB or RLS policies, update the SQL migration under `supabase/migrations/`
  and coordinate with the Supabase project (this repo assumes migrations are applied externally).

### Small gotchas worth knowing
- The code expects emails to be `.edu` for the waitlist; changing that requires
  updating both client validation (`src/components/WaitlistForm.tsx`) and possibly
  any backend validation or marketing text.
- The migration enables RLS and creates policies. Be careful when changing permissions —
  the frontend relies on anon INSERT permission to allow public signups.
- Icons come from `lucide-react`, but tooling excludes it from optimized deps in
  `vite.config.ts`; keep that in mind if you change icon imports.

### When you open a PR / make edits
- Keep changes localized to components unless making global improvements (styles,
  config). Reference files above when editing integration points.
- Provide a short note about env var needs and any migration changes in the PR body.

If anything here is unclear or you'd like more examples (e.g., a quick pasteable env
setup or a sample test harness), tell me what you'd prefer and I will iterate.
