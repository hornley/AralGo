-- Batched dashboard data RPC: returns all dashboard data in one round-trip.
create or replace function public.get_dashboard_data(p_user_id uuid)
returns json
language plpgsql
stable
as $$
declare
  start_of_today timestamptz;
  latest_subject public.study_subject;
  result json;
begin
  start_of_today := date_trunc('day', timezone('utc', now()));

  select ss.subject into latest_subject
  from public.study_sessions ss
  where ss.user_id = p_user_id
  order by ss.last_active_at desc
  limit 1;

  with
    profile_data as (
      select row_to_json(t.*) as val from (
        select id, display_name, grade_band, preferred_language_mode, preferred_subject
        from public.learner_profiles
        where user_id = p_user_id
        limit 1
      ) t
    ),
    latest_session as (
      select row_to_json(t.*) as val from (
        select id, subject, language_mode, topic, status, last_active_at, started_at
        from public.study_sessions
        where user_id = p_user_id
        order by last_active_at desc
        limit 1
      ) t
    ),
    recent_lessons as (
      select coalesce(json_agg(t.* order by t.created_at desc), '[]'::json) as val from (
        select id, subject, topic, topics, created_at
        from public.generated_lessons
        where user_id = p_user_id
        order by created_at desc
        limit 3
      ) t
    ),
    subjects_data as (
      select coalesce(json_agg(t.* order by t.sort_order), '[]'::json) as val from (
        select id, name, display_name, icon, sort_order
        from public.subjects
      ) t
    ),
    today_session_count as (
      select count(*)::int as val
      from public.study_sessions
      where user_id = p_user_id and last_active_at >= start_of_today
    ),
    today_completed_count as (
      select count(*)::int as val
      from public.study_sessions
      where user_id = p_user_id and status = 'completed' and last_active_at >= start_of_today
    ),
    today_practice_count as (
      select count(*)::int as val
      from public.practice_attempts
      where user_id = p_user_id and completed_at >= start_of_today
    ),
    total_practice_count as (
      select count(*)::int as val
      from public.practice_attempts
      where user_id = p_user_id
    ),
    topic_perf as (
      select row_to_json(t.*) as val from (
        select tp.subject, tp.topic, tp.rolling_accuracy, tp.last_practiced_at
        from public.topic_performance tp
        where tp.user_id = p_user_id
          and tp.subject = latest_subject
        order by tp.last_practiced_at desc nulls last
        limit 1
      ) t
    )
  select json_build_object(
    'profile', (select val from profile_data),
    'latestSession', (select val from latest_session),
    'recentLessons', (select val from recent_lessons),
    'subjects', (select val from subjects_data),
    'todayStudySessions', (select val from today_session_count),
    'todayCompletedSessions', (select val from today_completed_count),
    'todayPracticeAttempts', (select val from today_practice_count),
    'totalPracticeAttempts', (select val from total_practice_count),
    'topicPerformance', (select val from topic_perf)
  ) into result;

  return result;
end;
$$;
