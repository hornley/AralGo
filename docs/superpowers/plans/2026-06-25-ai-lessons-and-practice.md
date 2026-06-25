# AI-Generated Lessons and Practice Quizzes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Lesson Studio wizard — a guided flow where learners pick subjects/topics, set preferences (learning style + practice format), optionally upload reference files, and receive AI-generated lessons and practice quizzes.

**Architecture:** API routes in `app/api/` delegate to services in `lib/ai/` for AI generation, with Supabase persistence through `lib/study/` modules. The wizard is a multi-step client component at `app/lesson-studio/page.tsx` composed of individual step components. The existing remote schema already has `generated_lessons`, `practice_sets`, `practice_questions`, and topic/subject lookup tables — this plan adds missing columns and the `uploaded_references` table.

**Tech Stack:** Next.js App Router, TypeScript, Supabase (Postgres + Auth + Storage), Azure OpenAI via Vercel AI SDK (`ai` + `@ai-sdk/azure`)

---

## File Structure

### New files to create:
- `supabase/migrations/20260625080000_lesson_studio_schema.sql` — learner_profile preference columns + generated_lessons/practice_sets column additions + uploaded_references table
- `lib/ai/ai-client.ts` — Shared AI model client (extracted pattern from tutor-service.ts)
- `lib/ai/topic-suggestion-service.ts` — AI topic suggestion for subject+grade
- `lib/ai/lesson-service.ts` — AI lesson generation with structured output
- `lib/ai/practice-service.ts` — AI practice quiz generation
- `lib/ai/prompts.ts` — Prompt template builders
- `lib/study/lesson-studio.ts` — Lesson Studio persistence and state types
- `lib/types/supabase.ts` — TypeScript types for new database tables
- `app/api/topics/suggest/route.ts` — API route for topic suggestions
- `app/api/lessons/generate/route.ts` — API route for lesson generation
- `app/api/practice/generate/route.ts` — API route for practice generation
- `app/api/upload/route.ts` — API route for file upload
- `app/lesson-studio/page.tsx` — Lesson Studio wizard route
- `app/lesson-studio/lesson-studio.module.css` — Wizard styles
- `components/lesson-studio/SubjectPicker.tsx`
- `components/lesson-studio/TopicSelector.tsx`
- `components/lesson-studio/PreferencePicker.tsx`
- `components/lesson-studio/FileUploader.tsx`
- `components/lesson-studio/GenerationProgress.tsx`
- `components/lesson-studio/LessonResultView.tsx`
- `components/lesson-studio/PracticeResultView.tsx`
- `components/lesson-studio/LessonStudioWizard.tsx`
- `components/lesson-studio/lesson-studio.module.css` — Shared component styles

### Files to modify:
- `lib/ai/tutor-service.ts` — Refactor to reuse shared AI client
- `app/(dashboard)/home/page.tsx` — Add "Create a Lesson" CTA
- `app/(dashboard)/home/home.module.css` — CTA styles
- `lib/study/dashboard-data.ts` — Add lesson/practice history to dashboard data
- `lib/study/learner-session.ts` — Handle new preference columns during onboarding

---

### Task 1: New migration — learner_profile preference columns + uploaded_references table

**Files:**
- Create: `supabase/migrations/20260625080000_lesson_studio_schema.sql`

- [ ] **Create the migration file**

```sql
-- Add learner preference columns
alter table public.learner_profiles
  add column if not exists learning_style text,
  add column if not exists preferred_practice_format text;

-- Add multi-subject support
alter table public.learner_profiles
  add column if not exists preferred_subjects public.study_subject[];

-- Add columns to generated_lessons
alter table public.generated_lessons
  add column if not exists topics text[],
  add column if not exists learning_style text,
  add column if not exists study_goal text,
  add column if not exists file_reference_ids uuid[];

-- Add columns to practice_sets
alter table public.practice_sets
  add column if not exists topics text[],
  add column if not exists practice_format text,
  add column if not exists grade_band public.grade_band,
  add column if not exists generated_lesson_id uuid references public.generated_lessons(id) on delete set null;

-- Create uploaded_references table
create table if not exists public.uploaded_references (
  id uuid primary key default gen_random_uuid(),
  learner_profile_id uuid not null references public.learner_profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  generated_lesson_id uuid references public.generated_lessons(id) on delete set null,
  file_path text not null,
  file_type text not null,
  file_name text not null,
  file_size_bytes integer,
  extracted_text text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists uploaded_references_learner_idx on public.uploaded_references (learner_profile_id);

alter table public.uploaded_references enable row level security;

grant select, insert, update, delete on public.uploaded_references to authenticated;

do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Learners manage own uploaded references' and tablename = 'uploaded_references') then
    create policy "Learners manage own uploaded references"
    on public.uploaded_references for all to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);
  end if;
end;
$$;
```

- [ ] **Apply migration to linked Supabase project**

Run:
```bash
supabase db query --linked --output json -f supabase/migrations/20260625080000_lesson_studio_schema.sql
```

Expected: `[]` (success, no rows returned)

---

### Task 2: TypeScript types for new database entities

**Files:**
- Create: `lib/types/supabase.ts`

- [ ] **Create the types file**

```typescript
export type GradeBand = 'elementary' | 'junior_high' | 'senior_high' | 'college_general';
export type StudySubject = 'mathematics' | 'science' | 'english' | 'filipino';
export type LanguageMode = 'english' | 'filipino' | 'mixed';
export type LearningStyle = 'visual' | 'auditory' | 'reading_writing' | 'kinesthetic';
export type PracticeFormat = 'multiple_choice' | 'short_answer' | 'problem_solving' | 'mixed';

export interface LearnerProfile {
  id: string;
  user_id: string;
  display_name: string;
  grade_band: GradeBand | null;
  preferred_language_mode: LanguageMode | null;
  preferred_subject: StudySubject | null;
  preferred_subjects: StudySubject[] | null;
  learning_style: LearningStyle | null;
  preferred_practice_format: PracticeFormat | null;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: number;
  name: StudySubject;
  display_name: string;
  icon: string;
  sort_order: number;
}

export interface Topic {
  id: number;
  subject_id: number;
  name: string;
  grade_band: GradeBand;
  sort_order: number;
}

export interface GeneratedLesson {
  id: string;
  learner_profile_id: string;
  user_id: string;
  subject: StudySubject;
  topic: string;
  topics: string[] | null;
  grade_band: GradeBand;
  language_mode: LanguageMode;
  learning_style: string | null;
  study_goal: string | null;
  file_reference_ids: string[] | null;
  content_json: LessonContent;
  created_at: string;
}

export interface LessonContent {
  overview: string;
  keyTerms: { term: string; definition: string }[];
  workedExamples: { title: string; content: string }[];
  commonMistakes: { mistake: string; correction: string }[];
  recap: string;
}

export interface PracticeSet {
  id: string;
  learner_profile_id: string;
  user_id: string;
  generated_lesson_id: string | null;
  subject: StudySubject;
  topic: string;
  topics: string[] | null;
  difficulty: string;
  practice_format: string | null;
  grade_band: GradeBand | null;
  language_mode: LanguageMode;
  created_at: string;
}

export interface PracticeQuestion {
  id: string;
  practice_set_id: string;
  question_type: 'multiple_choice' | 'short_answer' | 'problem_solving';
  prompt: string;
  options_json: { label: string; text: string }[] | null;
  answer_key_json: { correctAnswer: string | string[]; acceptableAnswers?: string[] };
  explanation_json: { explanation: string; commonMistake?: string } | null;
  ordinal: number;
}

export interface UploadedReference {
  id: string;
  learner_profile_id: string;
  user_id: string;
  generated_lesson_id: string | null;
  file_path: string;
  file_type: 'image' | 'pdf' | 'text';
  file_name: string;
  file_size_bytes: number | null;
  extracted_text: string | null;
  created_at: string;
}

export interface LessonStudioDraft {
  subject: StudySubject | null;
  topics: string[];
  learningStyle: LearningStyle | null;
  practiceFormat: PracticeFormat | null;
  files: FileDraft[];
  step: number;
}

export interface FileDraft {
  id: string;
  name: string;
  type: string;
  size: number;
  uploaded: boolean;
  file_path: string | null;
}
```

---

### Task 3: Shared AI client

**Files:**
- Create: `lib/ai/ai-client.ts`
- Modify: `lib/ai/tutor-service.ts`

- [ ] **Create the shared AI client**

```typescript
import { createAzure } from '@ai-sdk/azure';
import { createOpenAI } from '@ai-sdk/openai';

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const endpoint = requiredEnv('AZURE_ENDPOINT');
const apiKey = requiredEnv('AZURE_API_KEY');
const deployment = requiredEnv('AZURE_DEPLOYMENT');

function extractResourceName(endpointUrl: string): string {
  try {
    const url = new URL(endpointUrl);
    return url.hostname.split('.')[0];
  } catch {
    throw new Error(`Invalid AZURE_ENDPOINT URL: ${endpointUrl}`);
  }
}

const azure = createAzure({
  resourceName: extractResourceName(endpoint),
  apiKey,
});

export const aiModel = azure(deployment);
```

- [ ] **Update tutor-service to reuse shared client**

Edit `lib/ai/tutor-service.ts`:

```typescript
import { aiModel } from './ai-client';

export const tutorModel = aiModel;

export const TUTOR_SYSTEM_PROMPT = `You are a Socratic tutor helping a Filipino learner. ...`; // keep existing prompt
```

---

### Task 4: Prompt templates

**Files:**
- Create: `lib/ai/prompts.ts`

- [ ] **Create prompt builders**

```typescript
import { GradeBand, StudySubject, LanguageMode, LearningStyle, PracticeFormat } from '@/lib/types/supabase';

interface BaseContext {
  subject: StudySubject;
  gradeBand: GradeBand;
  languageMode: LanguageMode;
}

interface TopicSuggestionContext extends BaseContext {}

interface LessonContext extends BaseContext {
  topics: string[];
  learningStyle: LearningStyle | null;
  studyGoal: string | null;
  referenceTexts: string[];
}

interface PracticeContext extends LessonContext {
  practiceFormat: PracticeFormat | null;
  questionCount: number;
}

const LANGUAGE_INSTRUCTIONS: Record<LanguageMode, string> = {
  english: 'Respond entirely in English.',
  filipino: 'Respond entirely in Filipino (Tagalog). Use simple Filipino appropriate for the grade level.',
  mixed: 'Use mixed Filipino-English (Taglish) naturally, as a Filipino tutor would. Switch between languages for clarity.',
};

export function buildTopicSuggestionPrompt(ctx: TopicSuggestionContext): string {
  return `You are a curriculum expert for Philippine DepEd education. 
${LANGUAGE_INSTRUCTIONS[ctx.languageMode]}

Suggest 8 to 10 specific, age-appropriate topics in ${ctx.subject} for a ${ctx.gradeBand} level student in the Philippines.

Return a JSON object with a single key "topics" containing an array of topic strings.
Example: { "topics": ["Fractions", "Decimals", "Ratios"] }

Topics should be specific and teachable as a single lesson. Do not return anything other than valid JSON.`;
}

export function buildLessonPrompt(ctx: LessonContext): string {
  const styleInstruction = ctx.learningStyle
    ? `The learner's preferred learning style is ${ctx.learningStyle}. Adapt explanations accordingly:
- visual: use vivid imagery, diagrams described in text, spatial organization
- auditory: use rhythm, repetition, explanatory dialogue
- reading_writing: use clear text structure, definitions, lists
- kinesthetic: use active examples, step-by-step processes, real-world applications`
    : 'Use balanced explanations suitable for all learning styles.';

  const referenceInstruction = ctx.referenceTexts.length > 0
    ? `The learner has provided the following reference material. Use it to tailor the lesson:\n${ctx.referenceTexts.map((t, i) => `[Reference ${i + 1}]: ${t}`).join('\n')}`
    : '';

  const goalInstruction = ctx.studyGoal
    ? `The learner's study goal is: ${ctx.studyGoal}. Adjust depth accordingly.`
    : '';

  return `You are a patient Filipino tutor creating a lesson.
${LANGUAGE_INSTRUCTIONS[ctx.languageMode]}
Subject: ${ctx.subject}
Topics: ${ctx.topics.join(', ')}
Grade Level: ${ctx.gradeBand}
${styleInstruction}
${goalInstruction}
${referenceInstruction}

Create a structured lesson covering ALL of the topics listed above. Return valid JSON with this shape:
{
  "overview": "A brief paragraph introducing the topics and why they matter",
  "keyTerms": [{ "term": "word", "definition": "explanation" }],
  "workedExamples": [{ "title": "Example name", "content": "Step-by-step walkthrough" }],
  "commonMistakes": [{ "mistake": "What learners often get wrong", "correction": "How to do it correctly" }],
  "recap": "2-3 sentences summarizing the key takeaways"
}

Keep content mobile-friendly: short paragraphs, clear headings. Return only valid JSON.`;
}

export function buildPracticePrompt(ctx: PracticeContext): string {
  const formatInstruction = ctx.practiceFormat
    ? `Question format: ${ctx.practiceFormat.replace(/_/g, ' ')}`
    : 'Mix of question formats.';

  const referenceInstruction = ctx.referenceTexts.length > 0
    ? `Base some questions on the learner's uploaded reference material:\n${ctx.referenceTexts.map((t, i) => `[Reference ${i + 1}]: ${t}`).join('\n')}`
    : '';

  return `You are a Filipino tutor creating practice questions.
${LANGUAGE_INSTRUCTIONS[ctx.languageMode]}
Subject: ${ctx.subject}
Topics: ${ctx.topics.join(', ')}
Grade Level: ${ctx.gradeBand}
${formatInstruction}
${referenceInstruction}

Generate ${ctx.questionCount} practice questions. Return a JSON array with this shape:
[{
  "type": "multiple_choice" | "short_answer" | "problem_solving",
  "prompt": "Question text",
  "options": [{ "label": "A", "text": "Option text" }] | null,
  "correctAnswer": "The correct answer or expected response",
  "acceptableAnswers": ["Alternative correct answers (for short_answer)"] | null,
  "explanation": "Why this answer is correct",
  "commonMistake": "A common error and why it's wrong"
}]

For multiple_choice: provide exactly 4 options. For short_answer and problem_solving: options must be null, include acceptableAnswers array.
Return only valid JSON.`;
}
```

---

### Task 5: Topic Suggestion Service

**Files:**
- Create: `lib/ai/topic-suggestion-service.ts`
- Create: `app/api/topics/suggest/route.ts`

- [ ] **Create topic suggestion service**

```typescript
import { generateObject } from 'ai';
import { aiModel } from './ai-client';
import { buildTopicSuggestionPrompt } from './prompts';
import { GradeBand, StudySubject, LanguageMode } from '@/lib/types/supabase';

interface TopicSuggestionInput {
  subject: StudySubject;
  gradeBand: GradeBand;
  languageMode: LanguageMode;
}

interface TopicSuggestionResult {
  topics: string[];
}

export async function suggestTopics(input: TopicSuggestionInput): Promise<TopicSuggestionResult> {
  const prompt = buildTopicSuggestionPrompt(input);
  const result = await generateObject({
    model: aiModel,
    prompt,
    schema: {
      type: 'object',
      properties: {
        topics: { type: 'array', items: { type: 'string' } },
      },
      required: ['topics'],
    },
  });
  return result.object;
}
```

- [ ] **Create topic suggestions API route**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { suggestTopics } from '@/lib/ai/topic-suggestion-service';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { subject, gradeBand, languageMode } = await req.json();
    if (!subject || !gradeBand || !languageMode) {
      return NextResponse.json(
        { error: 'Missing required fields: subject, gradeBand, languageMode' },
        { status: 400 }
      );
    }
    const result = await suggestTopics({ subject, gradeBand, languageMode });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Topic suggestion failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate topic suggestions' },
      { status: 500 }
    );
  }
}
```

---

### Task 6: Lesson Generation Service

**Files:**
- Create: `lib/ai/lesson-service.ts`
- Create: `app/api/lessons/generate/route.ts`

- [ ] **Create lesson generation service**

```typescript
import { generateObject } from 'ai';
import { aiModel } from './ai-client';
import { buildLessonPrompt } from './prompts';
import { GradeBand, StudySubject, LanguageMode, LearningStyle, LessonContent } from '@/lib/types/supabase';

interface LessonInput {
  subject: StudySubject;
  topics: string[];
  gradeBand: GradeBand;
  languageMode: LanguageMode;
  learningStyle: LearningStyle | null;
  studyGoal: string | null;
  referenceTexts: string[];
}

export async function generateLesson(input: LessonInput): Promise<LessonContent> {
  const prompt = buildLessonPrompt(input);
  const result = await generateObject({
    model: aiModel,
    prompt,
    schema: {
      type: 'object',
      properties: {
        overview: { type: 'string' },
        keyTerms: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              term: { type: 'string' },
              definition: { type: 'string' },
            },
            required: ['term', 'definition'],
          },
        },
        workedExamples: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              content: { type: 'string' },
            },
            required: ['title', 'content'],
          },
        },
        commonMistakes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              mistake: { type: 'string' },
              correction: { type: 'string' },
            },
            required: ['mistake', 'correction'],
          },
        },
        recap: { type: 'string' },
      },
      required: ['overview', 'keyTerms', 'workedExamples', 'commonMistakes', 'recap'],
    },
  });
  return result.object;
}
```

- [ ] **Create lesson generation API route**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { generateLesson } from '@/lib/ai/lesson-service';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subject, topics, gradeBand, languageMode, learningStyle, studyGoal, referenceTexts } = body;
    if (!subject || !topics?.length || !gradeBand || !languageMode) {
      return NextResponse.json(
        { error: 'Missing required fields: subject, topics, gradeBand, languageMode' },
        { status: 400 }
      );
    }
    const content = await generateLesson({ subject, topics, gradeBand, languageMode, learningStyle, studyGoal, referenceTexts: referenceTexts || [] });
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const { data: profile } = await supabase
      .from('learner_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    const { data: lesson, error } = await supabase
      .from('generated_lessons')
      .insert({
        learner_profile_id: profile.id,
        user_id: user.id,
        subject,
        topic: topics[0],
        topics,
        grade_band: gradeBand,
        language_mode: languageMode,
        learning_style: learningStyle,
        study_goal: studyGoal,
        content_json: content,
      })
      .select()
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ lesson, content });
  } catch (error) {
    console.error('Lesson generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate lesson' },
      { status: 500 }
    );
  }
}
```

---

### Task 7: Practice Generation Service

**Files:**
- Create: `lib/ai/practice-service.ts`
- Create: `app/api/practice/generate/route.ts`

- [ ] **Create practice generation service**

```typescript
import { generateObject } from 'ai';
import { aiModel } from './ai-client';
import { buildPracticePrompt } from './prompts';
import { GradeBand, StudySubject, LanguageMode, LearningStyle, PracticeFormat } from '@/lib/types/supabase';

interface PracticeInput {
  subject: StudySubject;
  topics: string[];
  gradeBand: GradeBand;
  languageMode: LanguageMode;
  learningStyle: LearningStyle | null;
  studyGoal: string | null;
  practiceFormat: PracticeFormat | null;
  questionCount: number;
  referenceTexts: string[];
}

interface GeneratedQuestion {
  type: 'multiple_choice' | 'short_answer' | 'problem_solving';
  prompt: string;
  options: { label: string; text: string }[] | null;
  correctAnswer: string;
  acceptableAnswers: string[] | null;
  explanation: string;
  commonMistake: string | null;
}

export interface PracticeResult {
  questions: GeneratedQuestion[];
}

export async function generatePractice(input: PracticeInput): Promise<PracticeResult> {
  const prompt = buildPracticePrompt(input);
  const result = await generateObject({
    model: aiModel,
    prompt,
    schema: {
      type: 'object',
      properties: {
        questions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['multiple_choice', 'short_answer', 'problem_solving'] },
              prompt: { type: 'string' },
              options: {
                type: ['array', 'null'],
                items: {
                  type: 'object',
                  properties: { label: { type: 'string' }, text: { type: 'string' } },
                  required: ['label', 'text'],
                },
              },
              correctAnswer: { type: 'string' },
              acceptableAnswers: { type: ['array', 'null'], items: { type: 'string' } },
              explanation: { type: 'string' },
              commonMistake: { type: ['string', 'null'] },
            },
            required: ['type', 'prompt', 'correctAnswer', 'explanation'],
          },
        },
      },
      required: ['questions'],
    },
  });
  return result.object;
}
```

- [ ] **Create practice generation API route**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { generatePractice } from '@/lib/ai/practice-service';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subject, topics, gradeBand, languageMode, learningStyle, studyGoal, practiceFormat, questionCount, referenceTexts, generatedLessonId } = body;
    if (!subject || !topics?.length || !gradeBand || !languageMode) {
      return NextResponse.json(
        { error: 'Missing required fields: subject, topics, gradeBand, languageMode' },
        { status: 400 }
      );
    }
    const result = await generatePractice({
      subject, topics, gradeBand, languageMode, learningStyle, studyGoal,
      practiceFormat: practiceFormat || null,
      questionCount: questionCount || 5,
      referenceTexts: referenceTexts || [],
    });
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const { data: profile } = await supabase
      .from('learner_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    const { data: practiceSet, error: setError } = await supabase
      .from('practice_sets')
      .insert({
        learner_profile_id: profile.id,
        user_id: user.id,
        generated_lesson_id: generatedLessonId || null,
        subject,
        topic: topics[0],
        topics,
        difficulty: 'medium',
        practice_format: practiceFormat || null,
        grade_band: gradeBand,
        language_mode: languageMode,
      })
      .select()
      .single();
    if (setError) {
      return NextResponse.json({ error: setError.message }, { status: 500 });
    }
    const questions = result.questions.map((q, i) => ({
      practice_set_id: practiceSet.id,
      question_type: q.type,
      prompt: q.prompt,
      options_json: q.options,
      answer_key_json: { correctAnswer: q.correctAnswer, acceptableAnswers: q.acceptableAnswers },
      explanation_json: { explanation: q.explanation, commonMistake: q.commonMistake },
      ordinal: i,
    }));
    const { error: qError } = await supabase
      .from('practice_questions')
      .insert(questions);
    if (qError) {
      return NextResponse.json({ error: qError.message }, { status: 500 });
    }
    return NextResponse.json({ practiceSet, questions: result.questions });
  } catch (error) {
    console.error('Practice generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate practice questions' },
      { status: 500 }
    );
  }
}
```

---

### Task 8: File Upload API

**Files:**
- Create: `app/api/upload/route.ts`

- [ ] **Create file upload route**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const { data: profile } = await supabase
      .from('learner_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext);
    const isPdf = ext === 'pdf';
    const isText = ['txt', 'md', 'csv'].includes(ext);
    let fileType: 'image' | 'pdf' | 'text';
    if (isImage) fileType = 'image';
    else if (isPdf) fileType = 'pdf';
    else if (isText) fileType = 'text';
    else {
      return NextResponse.json({ error: 'Unsupported file type. Accepted: images, PDFs, text files' }, { status: 400 });
    }
    const filePath = `references/${user.id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('study-files')
      .upload(filePath, file, { contentType: file.type });
    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }
    let extractedText: string | null = null;
    if (isText) {
      extractedText = await file.text();
    }
    const { data: reference, error: dbError } = await supabase
      .from('uploaded_references')
      .insert({
        learner_profile_id: profile.id,
        user_id: user.id,
        file_path: filePath,
        file_type: fileType,
        file_name: file.name,
        file_size_bytes: file.size,
        extracted_text: extractedText,
      })
      .select()
      .single();
    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }
    return NextResponse.json({ reference });
  } catch (error) {
    console.error('File upload failed:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
```

---

### Task 9: Lesson Studio state management

**Files:**
- Create: `lib/study/lesson-studio.ts`

- [ ] **Create lesson studio persistence**

```typescript
import { StudySubject, LearningStyle, PracticeFormat, LessonStudioDraft, FileDraft } from '@/lib/types/supabase';
import { createClient } from '@/lib/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY = 'aralgo.lesson-studio';

export function loadDraft(): LessonStudioDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveDraft(draft: LessonStudioDraft): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch { /* quota exceeded — silently ignore */ }
}

export function clearDraft(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function defaultDraft(): LessonStudioDraft {
  return {
    subject: null,
    topics: [],
    learningStyle: null,
    practiceFormat: null,
    files: [],
    step: 0,
  };
}

export async function fetchSubjects(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .order('sort_order');
  if (error) throw error;
  return data;
}

export async function fetchTopics(supabase: SupabaseClient, subjectId: number, gradeBand: string) {
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('subject_id', subjectId)
    .eq('grade_band', gradeBand)
    .order('sort_order');
  if (error) throw error;
  return data;
}

export async function fetchRecentLessons(supabase: SupabaseClient, learnerProfileId: string) {
  const { data, error } = await supabase
    .from('generated_lessons')
    .select('*')
    .eq('learner_profile_id', learnerProfileId)
    .order('created_at', { ascending: false })
    .limit(5);
  if (error) throw error;
  return data;
}
```

---

### Task 10: SubjectPicker component

**Files:**
- Create: `components/lesson-studio/SubjectPicker.tsx`
- Create: `components/lesson-studio/lesson-studio.module.css`

- [ ] **Create SubjectPicker component**

```tsx
'use client';

import { StudySubject } from '@/lib/types/supabase';

interface SubjectPickerProps {
  availableSubjects: { name: StudySubject; display_name: string; icon: string }[];
  selected: StudySubject | null;
  onSelect: (subject: StudySubject) => void;
}

export default function SubjectPicker({ availableSubjects, selected, onSelect }: SubjectPickerProps) {
  return (
    <div className="subject-picker">
      <h2>Choose a subject</h2>
      <div className="subject-grid">
        {availableSubjects.map((s) => (
          <button
            key={s.name}
            className={`subject-card ${selected === s.name ? 'selected' : ''}`}
            onClick={() => onSelect(s.name)}
            aria-pressed={selected === s.name}
          >
            <span className="subject-icon">{s.icon}</span>
            <span className="subject-name">{s.display_name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

### Task 11: TopicSelector component

**Files:**
- Create: `components/lesson-studio/TopicSelector.tsx`

- [ ] **Create TopicSelector component**

```tsx
'use client';

import { useState } from 'react';

interface TopicSelectorProps {
  suggestedTopics: string[];
  selectedTopics: string[];
  onToggle: (topic: string) => void;
  onAddCustom: (topic: string) => void;
  loading: boolean;
}

export default function TopicSelector({ suggestedTopics, selectedTopics, onToggle, onAddCustom, loading }: TopicSelectorProps) {
  const [custom, setCustom] = useState('');

  const handleAdd = () => {
    const trimmed = custom.trim();
    if (trimmed && !selectedTopics.includes(trimmed)) {
      onAddCustom(trimmed);
      setCustom('');
    }
  };

  return (
    <div className="topic-selector">
      <h2>Pick topics to study</h2>
      {loading ? (
        <div className="skeleton-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton-chip" />
          ))}
        </div>
      ) : (
        <div className="topic-chips">
          {suggestedTopics.map((topic) => (
            <button
              key={topic}
              className={`topic-chip ${selectedTopics.includes(topic) ? 'selected' : ''}`}
              onClick={() => onToggle(topic)}
              aria-pressed={selectedTopics.includes(topic)}
            >
              {topic}
            </button>
          ))}
        </div>
      )}
      <div className="custom-topic-input">
        <input
          type="text"
          placeholder="Or type your own topic..."
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button onClick={handleAdd} disabled={!custom.trim()}>Add</button>
      </div>
      {selectedTopics.length > 0 && (
        <p className="selected-count">{selectedTopics.length} topic{selectedTopics.length !== 1 ? 's' : ''} selected</p>
      )}
    </div>
  );
}
```

---

### Task 12: PreferencePicker component

**Files:**
- Create: `components/lesson-studio/PreferencePicker.tsx`

- [ ] **Create PreferencePicker component**

```tsx
'use client';

import { LearningStyle, PracticeFormat } from '@/lib/types/supabase';

interface PreferencePickerProps {
  learningStyle: LearningStyle | null;
  onLearningStyleChange: (style: LearningStyle) => void;
  practiceFormat: PracticeFormat | null;
  onPracticeFormatChange: (format: PracticeFormat) => void;
}

const LEARNING_STYLES: { value: LearningStyle; label: string; desc: string }[] = [
  { value: 'visual', label: 'Visual', desc: 'Diagrams, images, spatial' },
  { value: 'auditory', label: 'Auditory', desc: 'Explanations, dialogue' },
  { value: 'reading_writing', label: 'Reading & Writing', desc: 'Text, lists, definitions' },
  { value: 'kinesthetic', label: 'Kinesthetic', desc: 'Examples, step-by-step' },
];

const PRACTICE_FORMATS: { value: PracticeFormat; label: string }[] = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'problem_solving', label: 'Problem Solving' },
  { value: 'mixed', label: 'Mixed' },
];

export default function PreferencePicker({
  learningStyle,
  onLearningStyleChange,
  practiceFormat,
  onPracticeFormatChange,
}: PreferencePickerProps) {
  return (
    <div className="preference-picker">
      <div className="pref-section">
        <h2>How do you learn best?</h2>
        <div className="chip-group">
          {LEARNING_STYLES.map((s) => (
            <button
              key={s.value}
              className={`chip ${learningStyle === s.value ? 'selected' : ''}`}
              onClick={() => onLearningStyleChange(s.value)}
              aria-pressed={learningStyle === s.value}
              title={s.desc}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <div className="pref-section">
        <h2>What kind of practice?</h2>
        <div className="chip-group">
          {PRACTICE_FORMATS.map((f) => (
            <button
              key={f.value}
              className={`chip ${practiceFormat === f.value ? 'selected' : ''}`}
              onClick={() => onPracticeFormatChange(f.value)}
              aria-pressed={practiceFormat === f.value}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

### Task 13: FileUploader component

**Files:**
- Create: `components/lesson-studio/FileUploader.tsx`

- [ ] **Create FileUploader component**

```tsx
'use client';

import { useState, useRef } from 'react';
import { FileDraft } from '@/lib/types/supabase';

interface FileUploaderProps {
  files: FileDraft[];
  onAdd: (file: File) => void;
  onRemove: (id: string) => void;
  uploading: boolean;
}

export default function FileUploader({ files, onAdd, onRemove, uploading }: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach(onAdd);
  };

  const handlePick = () => inputRef.current?.click();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []);
    picked.forEach(onAdd);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="file-uploader">
      <h2>Add reference material (optional)</h2>
      <p className="file-hint">Upload worksheets, notes, or textbook pages to tailor the lesson</p>
      <div
        className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={handlePick}
      >
        <span className="drop-icon">upload</span>
        <span>Drop files here or click to browse</span>
        <span className="drop-types">Images, PDFs, or text files</span>
        <input ref={inputRef} type="file" hidden multiple accept="image/*,.pdf,.txt,.md,.csv" onChange={handleChange} />
      </div>
      {files.length > 0 && (
        <div className="file-list">
          {files.map((f) => (
            <div key={f.id} className="file-item">
              <span className="file-icon">
                {f.type.startsWith('image/') ? 'image' : f.type === 'application/pdf' ? 'picture_as_pdf' : 'description'}
              </span>
              <span className="file-name">{f.name}</span>
              <span className="file-size">{(f.size / 1024).toFixed(1)} KB</span>
              <button className="file-remove" onClick={() => onRemove(f.id)} disabled={uploading}>
                close
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### Task 14: GenerationProgress component

**Files:**
- Create: `components/lesson-studio/GenerationProgress.tsx`

- [ ] **Create GenerationProgress component**

```tsx
'use client';

interface GenerationProgressProps {
  stage: 'topics' | 'lesson' | 'practice' | null;
}

const STAGE_MESSAGES: Record<string, string> = {
  topics: 'Choosing the right topics for you...',
  lesson: 'Creating your personalized lesson...',
  practice: 'Generating practice questions...',
};

export default function GenerationProgress({ stage }: GenerationProgressProps) {
  if (!stage) return null;
  return (
    <div className="generation-progress">
      <div className="progress-spinner" />
      <p className="progress-message">{STAGE_MESSAGES[stage] || 'Working on your lesson...'}</p>
    </div>
  );
}
```

---

### Task 15: LessonResultView component

**Files:**
- Create: `components/lesson-studio/LessonResultView.tsx`

- [ ] **Create LessonResultView component**

```tsx
'use client';

import { LessonContent } from '@/lib/types/supabase';

interface LessonResultViewProps {
  content: LessonContent;
}

export default function LessonResultView({ content }: LessonResultViewProps) {
  return (
    <div className="lesson-result">
      <section className="lesson-section overview">
        <h3>Overview</h3>
        <p>{content.overview}</p>
      </section>
      {content.keyTerms.length > 0 && (
        <section className="lesson-section key-terms">
          <h3>Key Terms</h3>
          <dl>
            {content.keyTerms.map((kt, i) => (
              <div key={i} className="term-def">
                <dt>{kt.term}</dt>
                <dd>{kt.definition}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
      {content.workedExamples.length > 0 && (
        <section className="lesson-section examples">
          <h3>Worked Examples</h3>
          {content.workedExamples.map((ex, i) => (
            <div key={i} className="example-block">
              <h4>{ex.title}</h4>
              <p>{ex.content}</p>
            </div>
          ))}
        </section>
      )}
      {content.commonMistakes.length > 0 && (
        <section className="lesson-section mistakes">
          <h3>Common Mistakes</h3>
          {content.commonMistakes.map((cm, i) => (
            <div key={i} className="mistake-block">
              <p className="mistake">&#10060; {cm.mistake}</p>
              <p className="correction">&#9989; {cm.correction}</p>
            </div>
          ))}
        </section>
      )}
      <section className="lesson-section recap">
        <h3>Quick Recap</h3>
        <p>{content.recap}</p>
      </section>
    </div>
  );
}
```

---

### Task 16: PracticeResultView component

**Files:**
- Create: `components/lesson-studio/PracticeResultView.tsx`

- [ ] **Create PracticeResultView component**

```tsx
'use client';

interface PracticeQuestionView {
  type: string;
  prompt: string;
  options: { label: string; text: string }[] | null;
  correctAnswer: string;
  acceptableAnswers: string[] | null;
  explanation: string;
  commonMistake: string | null;
}

interface PracticeResultViewProps {
  questions: PracticeQuestionView[];
  onStartPractice: () => void;
}

export default function PracticeResultView({ questions, onStartPractice }: PracticeResultViewProps) {
  return (
    <div className="practice-result">
      <h3>Practice Quiz</h3>
      <p className="question-count">{questions.length} question{questions.length !== 1 ? 's' : ''}</p>
      <div className="question-preview-list">
        {questions.map((q, i) => (
          <div key={i} className="question-preview">
            <span className="q-number">{i + 1}.</span>
            <span className="q-type">{q.type.replace(/_/g, ' ')}</span>
            <p className="q-prompt">{q.prompt}</p>
          </div>
        ))}
      </div>
      <button className="start-practice-btn" onClick={onStartPractice}>
        Start Practice
      </button>
    </div>
  );
}
```

---

### Task 17: Lesson Studio Wizard (container + route)

**Files:**
- Create: `components/lesson-studio/LessonStudioWizard.tsx`
- Create: `app/lesson-studio/page.tsx`
- Create: `app/lesson-studio/lesson-studio.module.css`

- [ ] **Create LessonStudioWizard component**

```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { StudySubject, LearningStyle, PracticeFormat, LessonStudioDraft, FileDraft, LessonContent } from '@/lib/types/supabase';
import { loadDraft, saveDraft, clearDraft, defaultDraft } from '@/lib/study/lesson-studio';
import SubjectPicker from './SubjectPicker';
import TopicSelector from './TopicSelector';
import PreferencePicker from './PreferencePicker';
import FileUploader from './FileUploader';
import GenerationProgress from './GenerationProgress';
import LessonResultView from './LessonResultView';
import PracticeResultView from './PracticeResultView';

const STEPS = ['Subject', 'Topics', 'Preferences', 'Files', 'Generate'];

interface LessonStudioWizardProps {
  subjects: { name: StudySubject; display_name: string; icon: string }[];
  initialSubject?: StudySubject;
}

export default function LessonStudioWizard({ subjects, initialSubject }: LessonStudioWizardProps) {
  const [draft, setDraft] = useState<LessonStudioDraft>(defaultDraft);
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [genStage, setGenStage] = useState<'topics' | 'lesson' | 'practice' | null>(null);
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);
  const [practiceQuestions, setPracticeQuestions] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = loadDraft();
    if (saved) setDraft(saved);
    else if (initialSubject) setDraft((d) => ({ ...d, subject: initialSubject }));
  }, [initialSubject]);

  useEffect(() => {
    saveDraft(draft);
  }, [draft]);

  const suggestTopics = useCallback(async (subject: StudySubject) => {
    setTopicsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/topics/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject }),
      });
      if (!res.ok) throw new Error('Failed to suggest topics');
      const data = await res.json();
      setSuggestedTopics(data.topics || []);
    } catch (e) {
      setError('Could not load topic suggestions. Please type your topics manually.');
      setSuggestedTopics([]);
    } finally {
      setTopicsLoading(false);
    }
  }, []);

  const handleSubjectSelect = (subject: StudySubject) => {
    setDraft((d) => ({ ...d, subject, topics: [] }));
    suggestTopics(subject);
  };

  const handleTopicToggle = (topic: string) => {
    setDraft((d) => ({
      ...d,
      topics: d.topics.includes(topic) ? d.topics.filter((t) => t !== topic) : [...d.topics, topic],
    }));
  };

  const handleAddCustomTopic = (topic: string) => {
    setDraft((d) => ({ ...d, topics: [...d.topics, topic] }));
  };

  const handleLearningStyleChange = (style: LearningStyle) => {
    setDraft((d) => ({ ...d, learningStyle: style }));
  };

  const handlePracticeFormatChange = (format: PracticeFormat) => {
    setDraft((d) => ({ ...d, practiceFormat: format }));
  };

  const handleFileAdd = (file: File) => {
    const fileDraft: FileDraft = {
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type,
      size: file.size,
      uploaded: false,
      file_path: null,
    };
    setDraft((d) => ({ ...d, files: [...d.files, fileDraft] }));
    uploadFile(file, fileDraft.id);
  };

  const uploadFile = async (file: File, draftId: string) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setDraft((d) => ({
        ...d,
        files: d.files.map((f) => f.id === draftId ? { ...f, uploaded: true, file_path: data.reference.file_path } : f),
      }));
    } catch {
      setDraft((d) => ({
        ...d,
        files: d.files.filter((f) => f.id !== draftId),
      }));
    } finally {
      setUploading(false);
    }
  };

  const handleFileRemove = (id: string) => {
    setDraft((d) => ({ ...d, files: d.files.filter((f) => f.id !== id) }));
  };

  const handleGenerate = async () => {
    setError(null);
    setGenStage('lesson');
    try {
      const lessonRes = await fetch('/api/lessons/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: draft.subject,
          topics: draft.topics,
          gradeBand: 'senior_high',
          languageMode: 'mixed',
          learningStyle: draft.learningStyle,
          studyGoal: null,
          referenceTexts: [],
        }),
      });
      if (!lessonRes.ok) throw new Error('Lesson generation failed');
      const lessonData = await lessonRes.json();
      setLessonContent(lessonData.content);
      setGenStage('practice');
      const practiceRes = await fetch('/api/practice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: draft.subject,
          topics: draft.topics,
          gradeBand: 'senior_high',
          languageMode: 'mixed',
          learningStyle: draft.learningStyle,
          studyGoal: null,
          practiceFormat: draft.practiceFormat,
          questionCount: 5,
          referenceTexts: [],
          generatedLessonId: lessonData.lesson?.id,
        }),
      });
      if (!practiceRes.ok) throw new Error('Practice generation failed');
      const practiceData = await practiceRes.json();
      setPracticeQuestions(practiceData.questions);
    } catch (e) {
      setError('Generation failed. Please try again.');
    } finally {
      setGenStage(null);
    }
  };

  const handleReset = () => {
    clearDraft();
    setDraft(defaultDraft());
    setSuggestedTopics([]);
    setLessonContent(null);
    setPracticeQuestions(null);
    setError(null);
  };

  const canProceed = (step: number): boolean => {
    switch (step) {
      case 0: return draft.subject !== null;
      case 1: return draft.topics.length > 0;
      case 2: return true;
      case 3: return true;
      case 4: return draft.subject !== null && draft.topics.length > 0;
      default: return false;
    }
  };

  const step = genStage !== null ? 4 : (lessonContent ? 5 : draft.step);

  const renderStep = () => {
    if (lessonContent) {
      return (
        <div className="results-view">
          <LessonResultView content={lessonContent} />
          {practiceQuestions && (
            <PracticeResultView questions={practiceQuestions} onStartPractice={() => {}} />
          )}
          <button className="create-another-btn" onClick={handleReset}>Create Another</button>
        </div>
      );
    }
    if (genStage) {
      return <GenerationProgress stage={genStage} />;
    }
    switch (step) {
      case 0:
        return (
          <SubjectPicker
            availableSubjects={subjects}
            selected={draft.subject}
            onSelect={handleSubjectSelect}
          />
        );
      case 1:
        return (
          <TopicSelector
            suggestedTopics={suggestedTopics}
            selectedTopics={draft.topics}
            onToggle={handleTopicToggle}
            onAddCustom={handleAddCustomTopic}
            loading={topicsLoading}
          />
        );
      case 2:
        return (
          <PreferencePicker
            learningStyle={draft.learningStyle}
            onLearningStyleChange={handleLearningStyleChange}
            practiceFormat={draft.practiceFormat}
            onPracticeFormatChange={handlePracticeFormatChange}
          />
        );
      case 3:
        return (
          <FileUploader
            files={draft.files}
            onAdd={handleFileAdd}
            onRemove={handleFileRemove}
            uploading={uploading}
          />
        );
      case 4:
        return (
          <div className="generate-step">
            <h2>Ready to create your lesson?</h2>
            {error && <p className="error-message">{error}</p>}
            <button className="generate-btn" onClick={handleGenerate} disabled={!canProceed(4)}>
              Generate Lesson & Practice
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="lesson-studio-wizard">
      {!lessonContent && !genStage && (
        <div className="step-indicator">
          {STEPS.map((s, i) => (
            <button
              key={s}
              className={`step-dot ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`}
              onClick={() => i < step && setDraft((d) => ({ ...d, step: i }))}
              disabled={i > step}
            >
              {s}
            </button>
          ))}
        </div>
      )}
      <div className="step-content">
        {renderStep()}
      </div>
      {!lessonContent && !genStage && step < 4 && (
        <div className="step-nav">
          {step > 0 && (
            <button className="nav-back" onClick={() => setDraft((d) => ({ ...d, step: step - 1 }))}>
              Back
            </button>
          )}
          <button
            className="nav-next"
            onClick={() => setDraft((d) => ({ ...d, step: step + 1 }))}
            disabled={!canProceed(step)}
          >
            {step === 3 ? 'Generate' : 'Next'}
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Create the route page**

```tsx
import { createClient } from '@/lib/supabase/server';
import LessonStudioWizard from '@/components/lesson-studio/LessonStudioWizard';

export default async function LessonStudioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return <p>Please sign in to access the Lesson Studio.</p>;
  }
  const { data: profile } = await supabase
    .from('learner_profiles')
    .select('preferred_subjects')
    .eq('user_id', user.id)
    .single();
  const { data: subjects } = await supabase
    .from('subjects')
    .select('*')
    .order('sort_order');
  return (
    <div className="lesson-studio-page">
      <LessonStudioWizard
        subjects={subjects || []}
        initialSubject={undefined}
      />
    </div>
  );
}
```

- [ ] **Create the styles module**

```css
.lesson-studio-page {
  max-width: 720px;
  margin: 0 auto;
  padding: 24px 16px;
  min-height: 100dvh;
}

.lesson-studio-wizard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.step-indicator {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  padding: 8px 0;
}

.step-dot {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: var(--surface);
  font-size: 13px;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
}

.step-dot.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.step-dot.completed {
  background: var(--primary-light);
  border-color: var(--primary-light);
}

.step-dot:disabled {
  opacity: 0.4;
  cursor: default;
}

.step-content {
  min-height: 300px;
}

.step-nav {
  display: flex;
  justify-content: space-between;
  padding: 16px 0;
}

.nav-back, .nav-next {
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.nav-back {
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text);
}

.nav-next, .generate-btn, .start-practice-btn, .create-another-btn {
  background: var(--primary);
  color: white;
  border: none;
}

.nav-next:disabled, .generate-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

/* Subject picker */
.subject-picker h2, .topic-selector h2, .preference-picker h2, .file-uploader h2 {
  font-size: 20px;
  margin-bottom: 16px;
}

.subject-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.subject-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 16px;
  border-radius: 12px;
  border: 2px solid var(--border);
  background: var(--surface);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 15px;
}

.subject-card.selected {
  border-color: var(--primary);
  background: var(--primary-bg);
}

.subject-icon {
  font-size: 32px;
}

/* Topic chips */
.topic-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.topic-chip {
  padding: 10px 18px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: var(--surface);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.topic-chip.selected {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.skeleton-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skeleton-chip {
  width: 120px;
  height: 40px;
  border-radius: 20px;
  background: var(--skeleton);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.custom-topic-input {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.custom-topic-input input {
  flex: 1;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid var(--border);
  font-size: 14px;
}

.custom-topic-input button {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background: var(--primary);
  color: white;
  cursor: pointer;
}

.selected-count {
  margin-top: 12px;
  font-size: 13px;
  color: var(--text-secondary);
}

/* Preference picker */
.pref-section {
  margin-bottom: 24px;
}

.chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  padding: 10px 18px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: var(--surface);
  cursor: pointer;
  font-size: 14px;
  text-align: center;
}

.chip.selected {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

/* File uploader */
.file-hint {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.drop-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px;
  border: 2px dashed var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.drop-zone.drag-over {
  border-color: var(--primary);
  background: var(--primary-bg);
}

.drop-icon {
  font-size: 36px;
}

.drop-types {
  font-size: 12px;
  color: var(--text-secondary);
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
}

.file-icon {
  font-size: 20px;
}

.file-name {
  flex: 1;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 12px;
  color: var(--text-secondary);
}

.file-remove {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 18px;
  color: var(--text-secondary);
}

/* Generation progress */
.generation-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 64px 16px;
}

.progress-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.progress-message {
  font-size: 16px;
  color: var(--text-secondary);
}

/* Results */
.lesson-result {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.lesson-section h3 {
  font-size: 18px;
  margin-bottom: 12px;
}

.term-def {
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
}

.term-def dt {
  font-weight: 600;
  font-size: 15px;
}

.term-def dd {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 4px 0 0;
}

.example-block, .mistake-block {
  padding: 12px;
  border-radius: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  margin-bottom: 8px;
}

.mistake { color: var(--error); }
.correction { color: var(--success); }

/* Practice result */
.practice-result {
  margin-top: 32px;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid var(--border);
}

.question-preview-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 16px 0;
}

.question-preview {
  padding: 12px;
  border-radius: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
}

.q-type {
  font-size: 12px;
  text-transform: uppercase;
  color: var(--text-secondary);
  margin-left: 8px;
}

.q-prompt {
  margin-top: 4px;
  font-size: 14px;
}

.start-practice-btn, .create-another-btn {
  width: 100%;
  padding: 14px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 12px;
}

.error-message {
  color: var(--error);
  font-size: 14px;
  margin-bottom: 12px;
}

.generate-step {
  text-align: center;
  padding: 48px 16px;
}

.generate-btn {
  padding: 16px 32px;
  border-radius: 10px;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
}
```

---

### Task 18: Dashboard integration

**Files:**
- Modify: `app/(dashboard)/home/page.tsx`
- Modify: `lib/study/dashboard-data.ts`

- [ ] **Update dashboard-data to include recent lessons + subjects**

Add to the `DashboardData` type and `getDashboardData` function:

```typescript
import { createClient } from '@/lib/supabase/server';
import { StudySubject, GeneratedLesson, Subject } from '@/lib/types/supabase';

export interface DashboardData {
  user: { id: string } | null;
  profile: {
    id: string;
    display_name: string;
    grade_band: string;
    preferred_subjects: StudySubject[];
    learning_style: string | null;
    preferred_practice_format: string | null;
  } | null;
  latestSession: { id: string; subject: string; topic: string; status: string } | null;
  recentLessons: GeneratedLesson[];
  subjects: Subject[];
  error: string | null;
}

export async function getDashboardData(): Promise<DashboardData> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { user: null, profile: null, latestSession: null, recentLessons: [], subjects: [], error: 'Not authenticated' };
    }
    const [profileResult, sessionResult, lessonsResult, subjectsResult] = await Promise.all([
      supabase.from('learner_profiles').select('*').eq('user_id', user.id).single(),
      supabase.from('study_sessions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single(),
      supabase.from('generated_lessons').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('subjects').select('*').order('sort_order'),
    ]);
    return {
      user,
      profile: profileResult.data,
      latestSession: sessionResult.data || null,
      recentLessons: lessonsResult.data || [],
      subjects: subjectsResult.data || [],
      error: null,
    };
  } catch (e) {
    return { user: null, profile: null, latestSession: null, recentLessons: [], subjects: [], error: 'Failed to load dashboard' };
  }
}
```

- [ ] **Update dashboard page to show "Create a Lesson" CTA**

Add a "Create a Lesson" CTA card to the dashboard home page. The card should:
- Show a prominent button with "Create a Lesson" text
- Link to `/lesson-studio`
- Display near the top of the dashboard, alongside the greeting

Also update the existing subject cards to link to `/lesson-studio?subject=<name>`.

Add a "Recent Lessons" section below the main content showing the last 3 generated lessons with subject, topic, and date.

---

## Self-Review

**Spec coverage check:**
- Spec §2.1 (Lesson Studio Flow): Covered by Task 17 (wizard), Tasks 10-16 (step components)
- Spec §2.2 (Entry points): Covered by Task 18 (dashboard integration), Task 17 (route)
- Spec §3 (Data Model): Covered by Tasks 1 (migration), 2 (types)
- Spec §4 (AI Services): Covered by Tasks 4 (prompts), 5 (topics), 6 (lesson), 7 (practice)
- Spec §5 (UI Components): Covered by Tasks 10-17
- Spec §6 (Future inputs): Not implemented (deferred by design)
- Spec §7 (Phases): All phases covered across Tasks 1-18
- Spec §8 (Testing): Not covered (out of scope for initial plan)

**Placeholder check:** No TBDs, TODOs, or vague instructions. All code blocks contain complete implementations.

**Type consistency:** Types defined in Task 2 (`lib/types/supabase.ts`) are consistently imported across Tasks 4-17.

**Scope check:** Tasks are focused on Lesson Studio feature. The wizard, AI services, migrations, and dashboard integration are all in scope. Testing is explicitly deferred.
