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
- [ ] Build tutoring chat UI.
- [ ] Decide AI provider/model for tutoring and practice generation.

## Blocked / Waiting

- [x] Enable anonymous sign-ins in the hosted Supabase project.
- [x] Apply the initial migration to the hosted Supabase database.
- [ ] Persist learner setup and session rows after the hosted tables are available.
- [ ] Add placeholder handling for server-only Supabase secrets once provided.

## Product Decisions To Confirm

- [x] Decide whether MVP starts with local-only guest persistence or Supabase-backed anonymous/auth sessions.
- [ ] Decide which AI provider and model will power tutoring and practice generation.
- [ ] Decide whether full tutoring transcripts should be stored long-term or compacted into summaries later.
- [ ] Decide whether deterministic grading should handle objective questions before AI-assisted evaluation.

## Application Setup

- [x] Create the Next.js App Router project structure.
- [x] Add TypeScript, linting, and base project scripts.
- [ ] Create initial app routes for landing, study, chat, practice, and history.
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

- [x] Build onboarding and learner profile setup.
- [ ] Build subject selection.
- [ ] Build tutoring chat UI.
- [ ] Persist chat sessions and study history.
- [ ] Build practice generation flow.
- [ ] Build practice answer feedback flow.
- [ ] Add language mode switching for Filipino, English, and mixed mode.

## AI Layer

- [ ] Add server-only AI service modules for tutoring, lessons, and practice.
- [ ] Define structured output contracts for tutoring responses.
- [ ] Define structured output contracts for practice generation.
- [ ] Add validation and fallback handling for malformed AI outputs.
- [ ] Add prompt context wiring for subject, language mode, grade band, and performance signals.

## Performance And Reliability

- [ ] Add local caching for recent sessions and generated study items.
- [ ] Add degraded-network UI states and retry handling.
- [ ] Reduce payload sizes for core study flows.
- [ ] Test mobile-first usability on small screens.

## Testing

- [ ] Add tests for adaptation logic.
- [ ] Add tests for language-mode behavior.
- [ ] Add tests for practice rendering and grading flow.
- [ ] Add tests for study history persistence.
- [ ] Add tests for low-bandwidth fallback behavior.

## Deployment Prep

- [ ] Add the remaining environment variables once provided.
- [ ] Decide deployment target for the Next.js app.
- [ ] Verify production-safe handling of public vs server-only secrets.
