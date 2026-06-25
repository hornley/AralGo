create type public.language_mode as enum ('english', 'filipino', 'mixed');

create type public.grade_band as enum ('elementary', 'junior_high', 'senior_high');

create type public.study_subject as enum ('mathematics', 'science', 'english', 'filipino');

create type public.session_status as enum ('setup', 'active', 'completed', 'archived');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.learner_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  display_name text,
  grade_band public.grade_band not null,
  preferred_language_mode public.language_mode not null,
  preferred_subject public.study_subject,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger learner_profiles_set_updated_at
before update on public.learner_profiles
for each row
execute function public.set_updated_at();

create table public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  learner_profile_id uuid not null references public.learner_profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  subject public.study_subject not null,
  language_mode public.language_mode not null,
  topic text,
  status public.session_status not null default 'setup',
  started_at timestamptz not null default timezone('utc', now()),
  last_active_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index study_sessions_user_id_idx on public.study_sessions (user_id);
create index study_sessions_learner_profile_idx on public.study_sessions (learner_profile_id);

create trigger study_sessions_set_updated_at
before update on public.study_sessions
for each row
execute function public.set_updated_at();

create table public.tutor_messages (
  id uuid primary key default gen_random_uuid(),
  study_session_id uuid not null references public.study_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('learner', 'assistant', 'system')),
  language_mode public.language_mode not null,
  content text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index tutor_messages_session_idx on public.tutor_messages (study_session_id, created_at);
create index tutor_messages_user_id_idx on public.tutor_messages (user_id);

alter table public.learner_profiles enable row level security;
alter table public.study_sessions enable row level security;
alter table public.tutor_messages enable row level security;

grant select, insert, update, delete on public.learner_profiles to authenticated;
grant select, insert, update, delete on public.study_sessions to authenticated;
grant select, insert, update, delete on public.tutor_messages to authenticated;

create policy "Learners manage own profile"
on public.learner_profiles
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Learners manage own study sessions"
on public.study_sessions
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Learners manage own tutor messages"
on public.tutor_messages
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
