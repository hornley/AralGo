do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Learners manage own profile' and tablename = 'learner_profiles') then
    create policy "Learners manage own profile"
    on public.learner_profiles for all to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Learners manage own study sessions' and tablename = 'study_sessions') then
    create policy "Learners manage own study sessions"
    on public.study_sessions for all to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Learners manage own tutor messages' and tablename = 'tutor_messages') then
    create policy "Learners manage own tutor messages"
    on public.tutor_messages for all to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
  end if;
end;
$$;
