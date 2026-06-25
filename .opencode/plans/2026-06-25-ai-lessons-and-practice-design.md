# AI-Generated Lessons and Practice Quizzes — Design Spec

## 1. Overview

After onboarding, learners need to move from "who they are" (grade, subjects, language) to "what they want to study" (specific topics, reference materials, preferences). This feature introduces a **Lesson Studio** — a guided multi-step wizard that collects topics, learning preferences, and reference files, then generates structured AI lessons and practice quizzes.

## 2. User Journey

### 2.1 Lesson Studio Flow (7 steps)

1. **Entry** — From dashboard, user clicks "Create Lesson" or taps a subject card. Also auto-shown once after onboarding completes.
2. **Step 1 — Pick a subject** — Cards for each onboarded subject. Single-select.
3. **Step 2 — Pick topics** — AI generates ~6–10 topic suggestions based on subject + grade level. User taps to select 1+ and can type custom topics. Includes search/filter.
4. **Step 3 — Preferences** — Two compact choices:
   - Learning style: Visual / Auditory / Reading-writing / Kinesthetic
   - Practice format: Multiple choice / Short answer / Problem solving / Mixed
   - Defaults pre-selected based on profile.
5. **Step 4 — Upload files** (optional) — Upload images, PDFs, or text files via drop zone + picker. Server extracts text and passes as AI reference context.
6. **Generate** — "Generate Lesson" button triggers server-side AI.
7. **Results** — Generated lesson (scrollable) + practice quiz (collapsible). User can regenerate with adjusted preferences, or save to history.

### 2.2 Entry points

- **Post-onboarding redirect** — Automatically shown as the next step after onboarding.
- **Dashboard** — "Create a Lesson" CTA card. Subject cards deep-link to `/lesson-studio?subject=<slug>`.
- **Sidebar nav** — Link to `/lesson-studio` for returning users.

## 3. Data Model Changes

### 3.1 Learner profile additions (`learner_profiles`)

- `preferred_subjects`: change from single `study_subject` enum to `study_subject[]` array (new column + migration).
- `learning_style`: nullable `text` — `'visual' | 'auditory' | 'reading_writing' | 'kinesthetic'`.
- `preferred_practice_format`: nullable `text` — `'multiple_choice' | 'short_answer' | 'problem_solving' | 'mixed'`.

### 3.2 New table: `generated_lessons`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid PK` | |
| `learner_profile_id` | `uuid FK -> learner_profiles` | |
| `subject` | `study_subject` | Primary subject |
| `topic` | `text` | Primary/named topic |
| `topics` | `text[]` | All selected topics |
| `grade_band` | `grade_band` | Snapshot of learner's level at generation time |
| `language_mode` | `language_mode` | Snapshot of language preference |
| `learning_style` | `text` | Snapshot of learning style used |
| `study_goal` | `text` | Snapshot of study goal (habol/review/learn) |
| `content_json` | `jsonb` | Structured lesson blocks (overview, terms, examples, mistakes, recap) |
| `file_reference_ids` | `uuid[]` | Links to uploaded_references |
| `created_at` | `timestamptz` | |

### 3.3 New table: `practice_sets`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid PK` | |
| `learner_profile_id` | `uuid FK -> learner_profiles` | |
| `generated_lesson_id` | `uuid FK -> generated_lessons` (nullable) | Link back to the lesson that prompted this set |
| `subject` | `study_subject` | |
| `topic` | `text` | |
| `topics` | `text[]` | |
| `difficulty` | `text` | `'easy' | 'medium' | 'hard'` |
| `practice_format` | `text` | Snapshot of format used |
| `language_mode` | `language_mode` | |
| `grade_band` | `grade_band` | |
| `created_at` | `timestamptz` | |

### 3.4 New table: `practice_questions`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid PK` | |
| `practice_set_id` | `uuid FK -> practice_sets` | |
| `type` | `text` | `'multiple_choice' | 'short_answer' | 'problem_solving'` |
| `prompt` | `text` | Question text |
| `options_json` | `jsonb` (nullable) | For MC: array of option objects |
| `answer_key_json` | `jsonb` | Correct answer(s) |
| `explanation_json` | `jsonb` | Explanatory feedback |
| `order` | `int` | Display order |

### 3.5 New table: `uploaded_references`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid PK` | |
| `learner_profile_id` | `uuid FK -> learner_profiles` | |
| `generated_lesson_id` | `uuid FK -> generated_lessons` (nullable) | Null until lesson is generated |
| `file_path` | `text` | Supabase Storage path |
| `file_type` | `text` | `'image' | 'pdf' | 'text'` |
| `file_name` | `text` | Original filename |
| `file_size_bytes` | `int` | |
| `extracted_text` | `text` (nullable) | Server-extracted text content |
| `created_at` | `timestamptz` | |

### 3.6 RLS

- All new tables have RLS enabled with policy: "Learners manage own [entity]" using `auth.uid() = user_id` pattern.
- `uploaded_references` file access restricted to owning learner.

## 4. AI Service Design

### 4.1 Topic Suggestion Service (`lib/ai/topic-suggestion-service.ts`)

- **Input:** `{ subject, grade_band, language_mode }`
- **AI prompt:** "Suggest 8–10 specific topics in {subject} appropriate for {grade_band} level in the Philippine DepEd curriculum."
- **Output:** `TopicSuggestion[]` — array of topic strings.
- **Fallback:** Curated static list per subject × grade band for offline/AI-unavailable scenarios.

### 4.2 Lesson Generation Service (`lib/ai/lesson-service.ts`)

- **Input:** `{ subject, topics[], grade_band, language_mode, learning_style, study_goal, reference_texts[] }`
- **Output:** Structured lesson object:
  ```
  {
    overview: string,
    keyTerms: { term: string, definition: string }[],
    workedExamples: { title: string, content: string }[],
    commonMistakes: { mistake: string, correction: string }[],
    recap: string
  }
  ```
- **Validation:** Shape-checked before persistence; malformed outputs trigger regeneration.

### 4.3 Practice Generation Service (`lib/ai/practice-service.ts`)

- **Input:** Same as lesson + `{ practice_format, question_count: 5 }`
- **Output:** Array of structured question objects matching `practice_questions` schema.
- **Validation:** Each question must have required fields for its type; missing fields trigger regeneration of that question.

### 4.4 File Processing

- **Images:** Passed to multimodal AI for text extraction/analysis during generation.
- **PDFs:** Text extracted server-side using PDF parsing library.
- **Text files:** Read directly as UTF-8.
- All extracted content combined as `reference_texts[]` in the generation prompt.

### 4.5 Prompt Architecture

- Prompts live in `lib/ai/prompts/` as template files.
- Each prompt builder concatenates: system role + learner context + reference context + output contract.
- Subject-specific prompt variations (Math emphasizes worked examples, Filipino emphasizes language mode).

## 5. UI / Component Structure

### 5.1 Route

- `/lesson-studio` — wizard page
- `/lesson-studio/results` — view generated lesson + practice (reachable via ID)

### 5.2 Components (`components/lesson-studio/`)

| Component | Purpose |
|---|---|
| `LessonStudioWizard.tsx` | Multi-step wizard container |
| `SubjectPicker.tsx` | Card grid of onboarded subjects |
| `TopicSelector.tsx` | AI-suggested topic chips + custom input |
| `PreferencePicker.tsx` | Learning style + practice format |
| `FileUploader.tsx` | Drop zone + file picker, thumbnails |
| `GenerationProgress.tsx` | Animated loading state |
| `LessonResultView.tsx` | Renders structured lesson sections |
| `PracticeResultView.tsx` | Renders practice quiz |

### 5.3 Key UX decisions

- Steps persist to localStorage so user can leave and return.
- AI topic chips shown with shimmer placeholder during loading.
- Mobile-first: single column, full-width steps.

### 5.4 Dashboard integration

- Home dashboard: "Create a Lesson" CTA card.
- Subject cards deep-link to `/lesson-studio?subject=<slug>`.
- Recent history shows last 3 generated lessons + practice sets.

## 6. Additional Input Recommendations (Future)

1. **Time commitment slider** — 10 min / 30 min / 1 hr+ — adjusts lesson depth.
2. **Self-assessed mastery per topic** — Beginner / Know basics / Advanced.
3. **Curriculum alignment (DepEd MELCs)** — Tags content with MELC codes.
4. **Exam type context** — Quiz / Long test / Periodical / Board exam.
5. **Past performance feedback** — Feeds `topic_performance` into prompts.

## 7. Implementation Phasing

### Phase A: Foundation (data + schema)
- Migrate `learner_profiles` to support array subjects + new preference columns.
- Create `generated_lessons`, `practice_sets`, `practice_questions`, `uploaded_references` tables + RLS.

### Phase B: AI services
- Create `lib/ai/topic-suggestion-service.ts`
- Create `lib/ai/lesson-service.ts`
- Create `lib/ai/practice-service.ts`
- Create `lib/ai/prompts/` with template builders.

### Phase C: Lesson Studio wizard
- Build all `components/lesson-studio/` components.
- Build `/lesson-studio` route with wizard flow.
- Integrate AI services end-to-end.

### Phase D: Dashboard integration
- Add "Create a Lesson" CTA to dashboard.
- Wire subject cards to deep-link into Lesson Studio.
- Add recent lessons/practice to history section.

## 8. Testing

- Unit tests for AI prompt builders (correct context assembly).
- Unit tests for output validation logic (shape checks, fallback triggering).
- Integration test for file upload → text extraction flow.
- Component tests for wizard step transitions and state persistence.
- RLS policy tests for new tables.
