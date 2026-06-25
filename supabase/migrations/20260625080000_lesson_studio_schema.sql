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
