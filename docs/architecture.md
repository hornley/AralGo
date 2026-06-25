# Architecture Document: AralGo AI Study Companion

## 1. Purpose

This document translates the product requirements in `PRD.md` into an implementation-oriented system architecture for AralGo.

The architecture is designed for:

- mobile-first delivery,
- low-bandwidth conditions,
- bilingual AI tutoring,
- progressive personalization,
- and a Supabase-backed application stack.

The environment-specific values are intentionally left as placeholders until the Supabase and AI provider environment variables are available.

## 2. Target Stack

### 2.1 Application Layer

- `Next.js` App Router for the web application.
- `TypeScript` across frontend and backend application code.
- `React Server Components` for lightweight initial loads where appropriate.
- `Server Actions` and `Route Handlers` for trusted backend operations.

### 2.2 Backend Platform

- `Supabase Postgres` for primary relational data storage.
- `Supabase Auth` for guest-to-account upgrade paths and authenticated user sessions.
- `Supabase Storage` for optional future assets such as worksheet images or generated attachments.
- `Supabase Row Level Security (RLS)` for per-learner data isolation.

### 2.3 AI Layer

- AI generation API for tutoring, lesson generation, practice generation, and answer explanations.
- Prompt orchestration owned by server-side application code.
- Structured response handling to normalize AI output into predictable UI and database shapes.

### 2.4 Client Runtime

- Browser local storage or IndexedDB for lightweight cached study history.
- Service-worker-assisted caching later if offline review becomes a committed feature.

## 3. High-Level Architecture

```text
Mobile Browser
    |
    v
Next.js App
    |- Server Components
    |- Client Components
    |- Server Actions
    |- Route Handlers
    |
    +--> Supabase Auth
    +--> Supabase Postgres
    +--> Supabase Storage
    |
    +--> AI Provider API
```

Core rule:

- the browser never receives privileged backend secrets,
- learner-facing reads and writes use Supabase with RLS-aware access patterns,
- AI calls happen in trusted server code,
- and cached/local-first behavior is used to reduce bandwidth pressure.

## 4. Logical Subsystems

### 4.1 Presentation Layer

Responsibilities:

- onboarding,
- learner profile setup,
- subject and topic selection,
- chat tutoring UI,
- lesson view,
- practice session UI,
- recent history and resume flows,
- network state and retry UX.

Design constraints:

- text-first rendering,
- minimal heavy media,
- compact payloads,
- resilient loading and error states for unstable mobile connectivity.

### 4.2 Application Orchestration Layer

Responsibilities:

- validate incoming requests,
- load learner context,
- decide whether an operation is guest-safe or auth-required,
- build AI prompt context,
- persist tutoring outputs and study artifacts,
- update performance signals,
- return UI-ready structured data.

This layer should live in server-side modules and must not be embedded directly inside UI components.

### 4.3 Data Layer

Responsibilities:

- learner profiles,
- sessions and message history,
- generated lessons,
- practice sets and responses,
- topic performance aggregation,
- cached-item metadata,
- analytics event buffering if needed.

Supabase Postgres is the source of truth for durable cross-device data.

### 4.4 AI Generation Layer

Responsibilities:

- tutoring responses,
- simplified and advanced re-explanations,
- bilingual restatements,
- lesson generation,
- practice generation,
- answer explanations,
- follow-up recommendations.

The AI layer should be isolated behind application services so prompt changes do not force UI or schema rewrites.

## 5. Recommended Request Flows

### 5.1 Tutoring Chat Flow

1. Learner submits a question from the client.
2. Next.js Server Action or Route Handler validates input and loads learner context.
3. Server reads relevant profile, session, and recent performance data from Supabase.
4. Server builds a tutoring request for the AI provider.
5. AI response is normalized into structured sections such as explanation, examples, recap, and next actions.
6. Server stores the interaction in Supabase.
7. Client renders the response and stores a lightweight local cache entry for quick revisit.

### 5.2 Practice Generation Flow

1. Learner requests a practice set for a subject and topic.
2. Server loads learner level and performance data.
3. Server requests a structured practice payload from the AI provider.
4. Server validates and stores the generated set and questions.
5. Learner answers in the client.
6. Server evaluates or coordinates evaluation, stores responses, and updates topic performance.
7. Client receives explanations and next-step suggestions.

### 5.3 Session Resume Flow

1. Client loads recent local cache immediately.
2. Client requests fresh history from the server when network is available.
3. Supabase returns recent sessions allowed by RLS.
4. Client merges fresh server state with local cached state.

## 6. Supabase Architecture

### 6.1 Auth Model

Recommended initial model:

- allow lightweight guest usage for first-session study,
- support optional sign-in for cross-device persistence,
- support account linking or upgrade later if guest conversion is needed.

Implementation guidance:

- browser and server Supabase clients should be created using `@supabase/ssr`,
- use cookie-based SSR auth integration,
- use a proxy/middleware-style session refresh path,
- use `supabase.auth.getClaims()` in trusted server-side authorization checks instead of trusting `getSession()` alone.

### 6.2 Database Model

The PRD entities map cleanly to Supabase tables:

- `learner_profiles`
- `study_sessions`
- `tutor_messages`
- `generated_lessons`
- `practice_sets`
- `practice_questions`
- `practice_attempts`
- `practice_responses`
- `topic_performance`
- `cached_study_items`

Recommended additions:

- `subject_configs` for controlled subject metadata.
- `prompt_templates` if prompt configuration is stored in-app.
- `event_logs` for privacy-scoped product analytics or audit events.

### 6.3 Row Level Security

RLS should be enabled on every application table exposed through the default schema.

Policy model:

- a learner can read and update only their own profile,
- a learner can read and write only sessions and generated artifacts tied to their own identity,
- parent or teacher access should not be assumed in the initial schema,
- admin workflows, if needed later, should use server-side privileged code and non-public access paths.

Security rules:

- do not use user-editable metadata for authorization decisions,
- do not expose secret or service keys to the browser,
- avoid `SECURITY DEFINER` functions unless there is a specific reviewed need,
- treat every future public table as requiring explicit RLS review.

### 6.4 Storage

Initial release can avoid critical dependency on storage.

Use Supabase Storage later for:

- learner-uploaded worksheet images,
- optional downloadable study artifacts,
- future voice or audio support if introduced.

If image upload is added later, bucket policies must follow the same ownership model as table access.

## 7. Next.js Application Structure

Recommended top-level structure:

```text
app/
  (marketing)/
  (study)/
    chat/
    lessons/
    practice/
    history/
  auth/
  api/
components/
lib/
  ai/
  supabase/
  tutoring/
  practice/
  analytics/
  validation/
```

Recommended Supabase utilities:

- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `lib/supabase/proxy.ts`

Recommended service modules:

- `lib/ai/tutor-service.ts`
- `lib/ai/practice-service.ts`
- `lib/ai/lesson-service.ts`
- `lib/tutoring/adaptation-service.ts`
- `lib/validation/*.ts`

## 8. AI Integration Design

### 8.1 Server-Only AI Calls

All AI provider calls should run in trusted server code only.

Reasons:

- protects provider secrets,
- centralizes prompt policy,
- allows output validation before persistence,
- and makes analytics and safeguards easier to enforce.

### 8.2 Prompt Inputs

Each AI request should explicitly pass:

- subject,
- topic,
- language mode,
- learner grade band,
- requested action,
- recent performance summary,
- output format contract.

### 8.3 Output Contracts

Avoid free-form-only persistence.

Prefer structured payloads such as:

- tutoring response sections,
- practice question arrays with answer metadata,
- lesson blocks with titles and content,
- explanation blocks for incorrect answers.

This reduces fragile rendering logic and makes caching more predictable.

### 8.4 Safety Layer

Add server-side checks for:

- invalid or empty generations,
- age-inappropriate content,
- clearly off-topic responses,
- format mismatches,
- excessive verbosity for mobile contexts.

Fallback behavior:

- return a safe retry message,
- preserve user input,
- log the failure mode,
- and avoid storing malformed outputs as canonical study artifacts.

## 9. Low-Bandwidth Strategy

### 9.1 Performance Principles

- render useful text early,
- defer non-critical client JavaScript,
- keep request and response bodies compact,
- cache recent study artifacts locally,
- minimize duplicate refetching of session context.

### 9.2 Caching Strategy

Client-side cache:

- recent tutoring sessions,
- recent generated lessons,
- recent practice sets,
- learner preferences.

Server-side cache opportunities:

- static subject metadata,
- reusable prompt templates,
- non-sensitive curriculum hints.

Do not cache personalized authenticated responses in a way that can leak between users.

### 9.3 Degraded Network UX

The client should support:

- optimistic loading states,
- visible retry actions,
- partial history rendering from cache,
- explicit offline or unstable-connection indicators,
- prevention of accidental duplicate submissions.

## 10. Security and Privacy

### 10.1 Data Classification

Sensitive or controlled data includes:

- learner profile information,
- tutoring history,
- performance history,
- auth identifiers,
- uploaded study assets if later supported.

### 10.2 Security Baselines

- keep privileged keys server-only,
- use publishable keys only in public clients,
- enforce RLS on application tables,
- validate access in server code for privileged flows,
- minimize personal data collection,
- log security-relevant failures without logging sensitive raw secrets.

### 10.3 Privacy Baselines

- support guest mode without unnecessary personal fields,
- avoid storing raw personal data that is not needed for tutoring,
- define retention rules later for historical messages and analytics,
- allow future deletion/export workflows if authenticated accounts become core.

## 11. Environment Variables

These names are placeholders for implementation planning and can be adjusted once you provide the actual values.

### 11.1 Required Application Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
AI_API_KEY=
AI_MODEL=
```

### 11.2 Optional Variables

```env
NEXT_PUBLIC_APP_ENV=
NEXT_PUBLIC_ANALYTICS_ENABLED=
SENTRY_DSN=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Rules:

- `NEXT_PUBLIC_*` values may be exposed to the browser,
- secret Supabase and AI keys must remain server-only,
- no service-role-like secret should ever be embedded in client code.

## 12. Delivery Phases Aligned to Architecture

### Phase 1

- Next.js shell
- Supabase SSR auth wiring
- learner profile
- tutoring chat
- session persistence
- basic history

### Phase 2

- lesson generation
- practice generation
- answer explanations
- local caching improvements

### Phase 3

- topic performance aggregation
- adaptive difficulty services
- stronger analytics and quality feedback loops

### Phase 4

- offline-friendly review
- asset uploads if needed
- additional subjects and richer parent or teacher features

## 13. Initial Build Decisions

These are the recommended starting decisions unless product direction changes:

- Build web-first with Next.js before considering native mobile apps.
- Use Supabase Auth plus Postgres from day one instead of splitting auth and database providers.
- Keep AI calls centralized in server-side services.
- Support guest study immediately, then add optional account persistence.
- Treat low-bandwidth resilience as a product requirement, not a later optimization pass.

## 14. Open Architecture Questions

- Should guest sessions persist only locally at first, or should the backend create anonymous persisted identities immediately?
- Will tutoring transcripts be stored in full, or should older messages be compacted into summaries for cost and performance control?
- Will practice answer evaluation always be AI-assisted, or should objective question types use deterministic grading first?
- Do we want real-time synced progress across devices in the first authenticated release, or is eventual consistency acceptable?
- Will image input be part of the first major release after MVP, since that affects Storage and moderation scope early?

## 15. Recommended Next Step

After you provide the environment variables, the next implementation documents should be:

- `schema.md` or SQL migrations for the Supabase tables,
- auth flow notes for guest and registered learners,
- and a concrete `implementation-plan.md` mapped to the phases above.
