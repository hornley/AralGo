-- Content schema: reference tables, generated lesson/practice storage, and topic performance tracking.

create table public.subjects (
  id smallint primary key,
  name public.study_subject not null unique,
  display_name text not null,
  icon text not null,
  sort_order smallint not null default 0
);

create table public.topics (
  id smallint primary key,
  subject_id smallint not null references public.subjects(id) on delete cascade,
  name text not null,
  grade_band public.grade_band not null,
  sort_order smallint not null default 0
);

create index topics_subject_grade_idx on public.topics (subject_id, grade_band);

create table public.generated_lessons (
  id uuid primary key default gen_random_uuid(),
  learner_profile_id uuid not null references public.learner_profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  subject public.study_subject not null,
  topic text not null,
  grade_band public.grade_band not null,
  language_mode public.language_mode not null,
  content_json jsonb not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index generated_lessons_learner_idx on public.generated_lessons (learner_profile_id);

create table public.practice_sets (
  id uuid primary key default gen_random_uuid(),
  learner_profile_id uuid not null references public.learner_profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  subject public.study_subject not null,
  topic text not null,
  difficulty text not null default 'medium',
  language_mode public.language_mode not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index practice_sets_learner_idx on public.practice_sets (learner_profile_id);

create table public.practice_questions (
  id uuid primary key default gen_random_uuid(),
  practice_set_id uuid not null references public.practice_sets(id) on delete cascade,
  question_type text not null check (question_type in ('multiple_choice', 'true_false', 'short_answer')),
  prompt text not null,
  options_json jsonb,
  answer_key_json jsonb not null,
  explanation_json jsonb,
  ordinal smallint not null default 0
);

create index practice_questions_set_idx on public.practice_questions (practice_set_id, ordinal);

create table public.practice_attempts (
  id uuid primary key default gen_random_uuid(),
  learner_profile_id uuid not null references public.learner_profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  practice_set_id uuid not null references public.practice_sets(id) on delete cascade,
  score real not null default 0,
  completed_at timestamptz not null default timezone('utc', now())
);

create index practice_attempts_learner_idx on public.practice_attempts (learner_profile_id);

create table public.practice_responses (
  id uuid primary key default gen_random_uuid(),
  practice_attempt_id uuid not null references public.practice_attempts(id) on delete cascade,
  practice_question_id uuid not null references public.practice_questions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  learner_answer_json jsonb not null,
  is_correct boolean not null,
  feedback_json jsonb
);

create index practice_responses_attempt_idx on public.practice_responses (practice_attempt_id);

create table public.topic_performance (
  id uuid primary key default gen_random_uuid(),
  learner_profile_id uuid not null references public.learner_profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  subject public.study_subject not null,
  topic text not null,
  rolling_accuracy real not null default 0,
  rolling_difficulty real not null default 0,
  last_practiced_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (learner_profile_id, subject, topic)
);

create trigger topic_performance_set_updated_at
before update on public.topic_performance
for each row
execute function public.set_updated_at();

-- RLS

alter table public.subjects enable row level security;
alter table public.topics enable row level security;
alter table public.generated_lessons enable row level security;
alter table public.practice_sets enable row level security;
alter table public.practice_questions enable row level security;
alter table public.practice_attempts enable row level security;
alter table public.practice_responses enable row level security;
alter table public.topic_performance enable row level security;

grant select on public.subjects to authenticated;
grant select on public.topics to authenticated;
grant select, insert, update, delete on public.generated_lessons to authenticated;
grant select, insert, update, delete on public.practice_sets to authenticated;
grant select, insert, update, delete on public.practice_questions to authenticated;
grant select, insert, update, delete on public.practice_attempts to authenticated;
grant select, insert, update, delete on public.practice_responses to authenticated;
grant select, insert, update, delete on public.topic_performance to authenticated;

create policy "Anyone can read subjects"
on public.subjects for select
to authenticated
using (true);

create policy "Anyone can read topics"
on public.topics for select
to authenticated
using (true);

create policy "Learners manage own generated lessons"
on public.generated_lessons for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Learners manage own practice sets"
on public.practice_sets for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Learners manage own practice questions"
on public.practice_questions for all
to authenticated
using (exists (
  select 1 from public.practice_sets
  where practice_sets.id = practice_questions.practice_set_id
  and practice_sets.user_id = auth.uid()
))
with check (exists (
  select 1 from public.practice_sets
  where practice_sets.id = practice_questions.practice_set_id
  and practice_sets.user_id = auth.uid()
));

create policy "Learners manage own practice attempts"
on public.practice_attempts for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Learners manage own practice responses"
on public.practice_responses for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Learners manage own topic performance"
on public.topic_performance for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Seed data

insert into public.subjects (id, name, display_name, icon, sort_order) values
  (1, 'mathematics', 'Mathematics', 'calculate', 1),
  (2, 'science', 'Science', 'science', 2),
  (3, 'english', 'English', 'menu_book', 3),
  (4, 'filipino', 'Filipino', 'import_contacts', 4);

insert into public.topics (id, subject_id, name, grade_band, sort_order) values
  -- Mathematics
  (1, 1, 'Basic Arithmetic', 'elementary', 1),
  (2, 1, 'Fractions & Decimals', 'elementary', 2),
  (3, 1, 'Shapes & Geometry', 'elementary', 3),
  (4, 1, 'Measurement', 'elementary', 4),
  (5, 1, 'Algebra', 'junior_high', 1),
  (6, 1, 'Geometry & Proofs', 'junior_high', 2),
  (7, 1, 'Statistics & Probability', 'junior_high', 3),
  (8, 1, 'Linear Equations', 'junior_high', 4),
  (9, 1, 'Pre-Calculus', 'senior_high', 1),
  (10, 1, 'Calculus', 'senior_high', 2),
  (11, 1, 'Probability Distributions', 'senior_high', 3),
  (12, 1, 'Business Math', 'senior_high', 4),
  -- Science
  (13, 2, 'Living Things', 'elementary', 1),
  (14, 2, 'Weather & Seasons', 'elementary', 2),
  (15, 2, 'Matter & Energy', 'elementary', 3),
  (16, 2, 'The Human Body', 'elementary', 4),
  (17, 2, 'Cells & Genetics', 'junior_high', 1),
  (18, 2, 'Elements & Compounds', 'junior_high', 2),
  (19, 2, 'Forces & Energy', 'junior_high', 3),
  (20, 2, 'Earth Science', 'junior_high', 4),
  (21, 2, 'General Biology', 'senior_high', 1),
  (22, 2, 'General Chemistry', 'senior_high', 2),
  (23, 2, 'General Physics', 'senior_high', 3),
  (24, 2, 'Environmental Science', 'senior_high', 4),
  -- English
  (25, 3, 'Phonics & Reading', 'elementary', 1),
  (26, 3, 'Vocabulary', 'elementary', 2),
  (27, 3, 'Grammar Basics', 'elementary', 3),
  (28, 3, 'Writing Sentences', 'elementary', 4),
  (29, 3, 'Parts of Speech & Tenses', 'junior_high', 1),
  (30, 3, 'Reading Comprehension', 'junior_high', 2),
  (31, 3, 'Essay Writing', 'junior_high', 3),
  (32, 3, 'Literary Devices', 'junior_high', 4),
  (33, 3, 'Academic Writing', 'senior_high', 1),
  (34, 3, 'Research Skills', 'senior_high', 2),
  (35, 3, 'Literature Analysis', 'senior_high', 3),
  (36, 3, 'Argumentation', 'senior_high', 4),
  -- Filipino
  (37, 4, 'Alpabeto at Pagbasa', 'elementary', 1),
  (38, 4, 'Talasalitaan', 'elementary', 2),
  (39, 4, 'Gramatika', 'elementary', 3),
  (40, 4, 'Pagsulat', 'elementary', 4),
  (41, 4, 'Mga Bahagi ng Pananalita', 'junior_high', 1),
  (42, 4, 'Pagbasa at Pagsusuri', 'junior_high', 2),
  (43, 4, 'Pagsulat ng Sanaysay', 'junior_high', 3),
  (44, 4, 'Panitikan', 'junior_high', 4),
  (45, 4, 'Masining na Pagsulat', 'senior_high', 1),
  (46, 4, 'Pananaliksik', 'senior_high', 2),
  (47, 4, 'Panitikan ng Pilipinas', 'senior_high', 3),
  (48, 4, 'Malikhaing Pagsulat', 'senior_high', 4);
