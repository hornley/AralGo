import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export type DashboardData = {
  user: User | null;
  error: string | null;
  profile: {
    id: string;
    display_name: string | null;
    grade_band: "elementary" | "junior_high" | "senior_high";
    preferred_language_mode: "english" | "filipino" | "mixed";
    preferred_subject: "mathematics" | "science" | "english" | "filipino" | null;
  } | null;
  latestSession: {
    id: string;
    subject: "mathematics" | "science" | "english" | "filipino";
    language_mode: "english" | "filipino" | "mixed";
    topic: string | null;
    status: "setup" | "active" | "completed" | "archived";
    last_active_at: string;
  } | null;
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
    };
  }

  const [profileResult, latestSessionResult] = await Promise.all([
    supabase
      .from("learner_profiles")
      .select("id, display_name, grade_band, preferred_language_mode, preferred_subject")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("study_sessions")
      .select("id, subject, language_mode, topic, status, last_active_at")
      .eq("user_id", user.id)
      .order("last_active_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
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
    };
  }

  return {
    user,
    error: null,
    profile: profileResult.data ?? null,
    latestSession: latestSessionResult.data ?? null,
  };
}

export function formatSubject(subject: DashboardData["latestSession"] extends { subject: infer T } ? T : string) {
  switch (subject) {
    case "mathematics":
      return "Mathematics";
    case "science":
      return "Science";
    case "english":
      return "English";
    case "filipino":
      return "Filipino";
    default:
      return "General";
  }
}

export function formatGradeBand(gradeBand: DashboardData["profile"] extends { grade_band: infer T } ? T : string) {
  switch (gradeBand) {
    case "elementary":
      return "Elementary";
    case "junior_high":
      return "Junior High";
    case "senior_high":
      return "Senior High";
    default:
      return "Learner";
  }
}
