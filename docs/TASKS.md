# AralGo Task Tracker

## Done

- [x] Draft `PRD.md` for AralGo AI Study Companion.
- [x] Draft `architecture.md` covering Next.js, Supabase, AI services, and low-bandwidth strategy.
- [x] Add project-local Supabase skill files under `.agents/`.
- [x] Add initial Supabase public environment values to `.env.local`.
- [x] Commit and push the current planning state to `main`.
- [x] Scaffold the Next.js application in this repository.
- [x] Create the initial `package.json` and install project dependencies.
- [x] Install `@supabase/supabase-js` and `@supabase/ssr` inside the app scaffold.
- [x] Create the initial Next.js App Router routes and mobile-first shell.
- [x] Add the initial Supabase SSR client, server, and proxy utilities.
- [x] Verify the scaffold with `npm run typecheck`, `npm run lint`, and `npm run build`.
- [x] Add hosted Supabase anonymous session setup using the `.env.local` project.
- [x] Create the first Supabase migration file for learner profiles, study sessions, and tutor messages.
- [x] Create `USER_FLOW.md` documenting all core user journeys.

## Current Focus

- [x] Create user flow document (`USER_FLOW.md`) covering all core journeys.
- [x] Build subject selection UI and flow.
- [x] Enable anonymous sign-ins.
- [x] PWA support (manifest, service worker, offline page).
- [x] Build tutoring chat UI (static prototype at `/tutor`, now with real AI streaming).
- [x] Decide AI provider/model for tutoring and practice generation (Azure OpenAI).

## Blocked / Waiting

- [x] Enable anonymous sign-ins in the hosted Supabase project.
- [x] Apply the initial migration to the hosted Supabase database.
- [~] Persist learner setup and session rows after the hosted tables are available.
  - Learner profiles and study sessions persist correctly.
  - Tutor messages do NOT persist (no chat persistence implemented).
- [ ] Add placeholder handling for server-only Supabase secrets once provided.

## Product Decisions To Confirm

- [x] Decide whether MVP starts with local-only guest persistence or Supabase-backed anonymous/auth sessions.
- [x] Decide which AI provider and model will power tutoring and practice generation (Azure OpenAI).
- [ ] Decide whether full tutoring transcripts should be stored long-term or compacted into summaries later.
- [ ] Decide whether deterministic grading should handle objective questions before AI-assisted evaluation.

## Application Setup

- [x] Create the Next.js App Router project structure.
- [x] Add TypeScript, linting, and base project scripts.
- [~] Create initial app routes for landing, study, chat, practice, and history.
  - `/` (landing), `/home` (study), `/tutor` (chat), `/practice`, `/practice/results`, `/profile`, `/onboarding`, `/offline` all exist.
  - `/history` route is missing (sidebar links to it but page is 404).
  - `/settings` and `/help` are also linked from the sidebar but do not exist yet.
- [x] Add a shared layout and mobile-first shell.

## Supabase Integration

- [x] Add `lib/supabase/client.ts`.
- [x] Add `lib/supabase/server.ts`.
- [x] Add `lib/supabase/proxy.ts`.
- [x] Add SSR auth session refresh flow.
- [x] Add hosted anonymous session setup on the study route.

## Database

- [x] Create the initial Supabase schema for:
- [x] `learner_profiles`
- [x] `study_sessions`
- [x] `tutor_messages`
- [x] `generated_lessons`
- [x] `practice_sets`
- [x] `practice_questions`
- [x] `practice_attempts`
- [x] `practice_responses`
- [x] `topic_performance`
- [x] `subjects` (seed data: 4 subjects)
- [x] `topics` (seed data: 48 topics across grade bands)
- [x] Add RLS policies for learner-owned data.
- [x] Add migration files for schema and policies.

## PWA

- [x] Web app manifest with brand colors and icons.
- [x] SVG app icon.
- [x] Service worker with offline fallback and data caching.
- [x] Offline fallback page.
- [x] Service worker registration in root layout.

## MVP Features

- [x] Build onboarding and learner profile setup (4-step wizard with Supabase persistence).
- [x] Build subject selection (in onboarding step 3, profile page, and practice page).
- [x] Build tutoring chat UI (real AI streaming via `useChat` + Azure OpenAI).
- [ ] Persist chat sessions and study history (tutor messages not saved to DB).
- [~] Build practice generation flow (UI complete, but generates hardcoded mock data — no AI backend).
- [~] Build practice answer feedback flow (results page UI complete, but mock data only — no grading).
- [x] Add language mode switching for Filipino, English, and mixed mode (onboarding step 1 + profile page).
- [~] Build the `/home` dashboard from learner data.
  - Course card, recent topics, and goal card now read from Supabase/session data plus offline local storage.
  - Continue action, real history page, and richer progress tracking are not implemented yet.

## AI Layer

- [~] Add server-only AI service modules for tutoring, lessons, and practice.
  - `lib/ai/tutor-service.ts` exists with Azure OpenAI integration.
  - `lib/ai/practice-service.ts` and `lib/ai/lesson-service.ts` do NOT exist.
- [ ] Define structured output contracts for tutoring responses.
- [ ] Define structured output contracts for practice generation.
- [ ] Add validation and fallback handling for malformed AI outputs.
- [~] Add prompt context wiring for subject, language mode, grade band, and performance signals.
  - Subject, language mode, grade band, and topic are already wired into the tutor system prompt.
  - Performance signals and richer learner context are not wired yet.

## Performance And Reliability

- [~] Add local caching for recent sessions and generated study items.
  - Learner setup, daily goal state, and recent topics now persist in browser local storage for offline-friendly dashboard rendering.
  - Generated lessons, tutor transcripts, and practice artifacts are not cached locally yet.
- [ ] Add degraded-network UI states and retry handling.
- [ ] Reduce payload sizes for core study flows.
- [ ] Test mobile-first usability on small screens.

## Testing

- [~] Add baseline end-to-end smoke coverage.
  - `e2e/smoke.mjs` exists and checks the main routes, PWA assets, and basic rendering.
  - It is not wired into `package.json` scripts and does not cover behavior deeply.
- [ ] Add tests for adaptation logic.
- [ ] Add tests for language-mode behavior.
- [ ] Add tests for practice rendering and grading flow.
- [ ] Add tests for study history persistence.
- [ ] Add tests for low-bandwidth fallback behavior.

## Deployment Prep

- [ ] Add the remaining environment variables once provided.
- [ ] Decide deployment target for the Next.js app.
- [ ] Verify production-safe handling of public vs server-only secrets.
