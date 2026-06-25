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
    };
  }

  const [profileResult, latestSessionResult, lessonsResult, subjectsResult] = await Promise.all([
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
  ]);

  if (profileResult.error || latestSessionResult.error) {
    console.error("Failed to load dashboard data", {
      profileError: profileResult.error?.message,
      latestSessionError: latestSessionResult.error?.message,
    });

    return {
      user,
      error: "We could not load your latest study data yet.",
      profile: null,
      latestSession: null,
      recentLessons: [],
      subjects: [],
    };
  }

  return {
    user,
    error: null,
    profile: profileResult.data ?? null,
    latestSession: latestSessionResult.data ?? null,
    recentLessons: lessonsResult.data ?? [],
    subjects: subjectsResult.data ?? [],
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
