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

type ProfileShape = {
  id: string;
  display_name: string | null;
  grade_band: GradeBand;
  preferred_language_mode: "english" | "filipino" | "mixed";
  preferred_subject: "mathematics" | "science" | "english" | "filipino" | null;
};

type LessonShape = {
  id: string;
  subject: "mathematics" | "science" | "english" | "filipino";
  topic: string;
  topics: string[] | null;
  created_at: string;
};

type SubjectShape = {
  id: number;
  name: "mathematics" | "science" | "english" | "filipino";
  display_name: string;
  icon: string;
  sort_order: number;
};

type TopicPerformanceShape = {
  subject: "mathematics" | "science" | "english" | "filipino";
  topic: string;
  rolling_accuracy: number;
  last_practiced_at: string | null;
} | null;

type RpcResult = {
  profile: ProfileShape | null;
  latestSession: Session | null;
  recentLessons: LessonShape[];
  subjects: SubjectShape[];
  todayStudySessions: number;
  todayCompletedSessions: number;
  todayPracticeAttempts: number;
  totalPracticeAttempts: number;
  topicPerformance: TopicPerformanceShape;
};

export type DashboardData = {
  user: User | null;
  error: string | null;
  profile: ProfileShape | null;
  latestSession: Session | null;
  recentLessons: LessonShape[];
  subjects: SubjectShape[];
  topicPerformance: TopicPerformanceShape;
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
    return emptyResult();
  }

  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "get_dashboard_data",
    { p_user_id: user.id },
  );

  if (rpcError || !rpcData) {
    console.error("Failed to load dashboard data via RPC", rpcError?.message);

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

  const data = rpcData as unknown as RpcResult;

  return {
    user,
    error: null,
    profile: data.profile ?? null,
    latestSession: data.latestSession ?? null,
    recentLessons: data.recentLessons ?? [],
    subjects: data.subjects ?? [],
    topicPerformance: data.topicPerformance ?? null,
    stats: {
      todayStudySessions: data.todayStudySessions ?? 0,
      todayCompletedSessions: data.todayCompletedSessions ?? 0,
      todayPracticeAttempts: data.todayPracticeAttempts ?? 0,
      totalPracticeAttempts: data.totalPracticeAttempts ?? 0,
    },
  };
}

function emptyResult(): DashboardData {
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
