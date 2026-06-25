# Repository Guidelines

## Project Structure & Module Organization

This repository is currently planning-first. The main artifacts are:

- `PRD.md`: product requirements for AralGo.
- `architecture.md`: implementation architecture for Next.js, Supabase, and AI services.
- `TASKS.md`: working checklist and progress tracker.
- `.agents/`: project-local skill files used by the agent workflow.
- `.env.local`: local environment values for development.

When the app scaffold is added, keep runtime code under `app/`, shared UI in `components/`, and backend helpers in `lib/` as described in `architecture.md`.

## Build, Test, and Development Commands

There is no application scaffold yet, so there are no active build or test commands in the repository today.

Once the Next.js app is created, use:

- `npm install`: install project dependencies.
- `npm run dev`: run the local development server.
- `npm run build`: create a production build.
- `npm run lint`: run linting checks.
- `npm test`: run the test suite, once configured.

Only add commands that are backed by committed project configuration.

## Coding Style & Naming Conventions

- Use TypeScript for application code.
- Prefer ASCII text unless a file already requires Unicode.
- Use clear, descriptive file names such as `tutor-service.ts` or `practice-set-card.tsx`.
- Use kebab-case for files, PascalCase for React components, and camelCase for variables and functions.
- Keep product logic out of UI components; place reusable logic in `lib/`.

## Testing Guidelines

Add tests alongside the eventual app scaffold. Prefer:

- unit tests for adaptation, grading, and prompt-shaping logic,
- integration tests for Supabase-backed flows,
- UI tests for core tutoring and practice journeys.

Name tests after the behavior they verify, for example `tutoring-session.test.ts`.

## Commit & Pull Request Guidelines

Recent commits use short, imperative subjects, for example:

- `Add planning docs and project-local Supabase skills`

Follow the same pattern:

- start with a verb,
- describe the change directly,
- keep the subject concise.

Pull requests should include scope, affected files, setup or env changes, and screenshots for UI work once the app exists.

## Security & Configuration Tips

- Do not commit server-only secrets.
- Keep Supabase privileged keys out of client code.
- Treat `.env.local` as local development configuration and review changes carefully before committing.
