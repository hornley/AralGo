import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
export { formatGradeBand, formatSubject } from "@/lib/study/format";
import type { StudySetupDraft } from "@/lib/study/study-setup";

type GradeBand = StudySetupDraft["gradeBand"];

export type Session = {
  id: string;
  subject: "mathematics" | "science" | "english" | "filipino";
  language_mode: "english" | "filipino" | "mixed";
  topic: string | null;
  status: "setup" | "active" | "completed" | "archived";
  last_active_at: string;
  started_at: string;
};

export type DashboardData = {
  user: User | null;
  error: string | null;
  profile: {
    id: string;
    display_name: string | null;
    grade_band: GradeBand;
    preferred_language_mode: "english" | "filipino" | "mixed";
    preferred_subject: "mathematics" | "science" | "english" | "filipino" | null;
  } | null;
  latestSession: Session | null;
  recentLessons: Array<{
    id: string;
    subject: "mathematics" | "science" | "english" | "filipino";
    topic: string;
    topics: string[] | null;
    created_at: string;
  }>;
  subjects: Array<{
    id: number;
    name: "mathematics" | "science" | "english" | "filipino";
    display_name: string;
    icon: string;
  }>;
  topicPerformance: {
    subject: "mathematics" | "science" | "english" | "filipino";
    topic: string;
    rolling_accuracy: number;
    last_practiced_at: string | null;
  } | null;
  stats: {
    todayStudySessions: number;
    todayCompletedSessions: number;
    todayPracticeAttempts: number;
    totalPracticeAttempts: number;
  };
};

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      error: null,
      profile: null,
      latestSession: null,
      recentLessons: [],
      subjects: [],
      topicPerformance: null,
      stats: {
        todayStudySessions: 0,
        todayCompletedSessions: 0,
        todayPracticeAttempts: 0,
        totalPracticeAttempts: 0,
      },
    };
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startOfDayIso = startOfDay.toISOString();

  const [
    profileResult,
    latestSessionResult,
    lessonsResult,
    subjectsResult,
    todayStudySessionsResult,
    todayCompletedSessionsResult,
    todayPracticeAttemptsResult,
    totalPracticeAttemptsResult,
  ] = await Promise.all([
    supabase
      .from("learner_profiles")
      .select("id, display_name, grade_band, preferred_language_mode, preferred_subject")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("study_sessions")
      .select("id, subject, language_mode, topic, status, last_active_at, started_at")
      .eq("user_id", user.id)
      .order("last_active_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("generated_lessons")
      .select("id, subject, topic, topics, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("subjects")
      .select("*")
      .order("sort_order"),
    supabase
      .from("study_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("last_active_at", startOfDayIso),
    supabase
      .from("study_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "completed")
      .gte("last_active_at", startOfDayIso),
    supabase
      .from("practice_attempts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("completed_at", startOfDayIso),
    supabase
      .from("practice_attempts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  if (
    profileResult.error ||
    latestSessionResult.error ||
    lessonsResult.error ||
    subjectsResult.error ||
    todayStudySessionsResult.error ||
    todayCompletedSessionsResult.error ||
    todayPracticeAttemptsResult.error ||
    totalPracticeAttemptsResult.error
  ) {
    console.error("Failed to load dashboard data", {
      profileError: profileResult.error?.message,
      latestSessionError: latestSessionResult.error?.message,
      lessonsError: lessonsResult.error?.message,
      subjectsError: subjectsResult.error?.message,
      todayStudySessionsError: todayStudySessionsResult.error?.message,
      todayCompletedSessionsError: todayCompletedSessionsResult.error?.message,
      todayPracticeAttemptsError: todayPracticeAttemptsResult.error?.message,
      totalPracticeAttemptsError: totalPracticeAttemptsResult.error?.message,
    });

    return {
      user,
      error: "We could not load your latest study data yet.",
      profile: null,
      latestSession: null,
      recentLessons: [],
      subjects: [],
      topicPerformance: null,
      stats: {
        todayStudySessions: 0,
        todayCompletedSessions: 0,
        todayPracticeAttempts: 0,
        totalPracticeAttempts: 0,
      },
    };
  }

  const latestSession = latestSessionResult.data ?? null;
  let topicPerformance: DashboardData["topicPerformance"] = null;

  if (latestSession) {
    const { data: topicPerformanceData, error: topicPerformanceError } = await supabase
      .from("topic_performance")
      .select("subject, topic, rolling_accuracy, last_practiced_at")
      .eq("user_id", user.id)
      .eq("subject", latestSession.subject)
      .order("last_practiced_at", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle();

    if (topicPerformanceError) {
      console.error("Failed to load topic performance", {
        topicPerformanceError: topicPerformanceError.message,
      });
    } else {
      topicPerformance = topicPerformanceData ?? null;
    }
  }

  return {
    user,
    error: null,
    profile: profileResult.data ?? null,
    latestSession,
    recentLessons: lessonsResult.data ?? [],
    subjects: subjectsResult.data ?? [],
    topicPerformance,
    stats: {
      todayStudySessions: todayStudySessionsResult.count ?? 0,
      todayCompletedSessions: todayCompletedSessionsResult.count ?? 0,
      todayPracticeAttempts: todayPracticeAttemptsResult.count ?? 0,
      totalPracticeAttempts: totalPracticeAttemptsResult.count ?? 0,
    },
  };
}

export async function getSessionHistory(): Promise<Session[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("study_sessions")
    .select("id, subject, language_mode, topic, status, last_active_at, started_at")
    .eq("user_id", user.id)
    .order("last_active_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch session history:", error);
    return [];
  }

  return data ?? [];
}
