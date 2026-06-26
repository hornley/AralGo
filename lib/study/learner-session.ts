import type { SupabaseClient } from "@supabase/supabase-js";
import type { StudySetupDraft } from "@/lib/study/study-setup";
import type { StudySubject } from "@/lib/types/supabase";

type PersistResult =
  | { ok: true; learnerProfileId: string; studySessionId: string }
  | { ok: false; message: string };

export async function persistLearnerSession(
  supabase: SupabaseClient,
  draft: StudySetupDraft,
  preferredSubjects?: StudySubject[],
): Promise<PersistResult> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      ok: false,
      message: userError?.message ?? "No active Supabase user is available for this session.",
    };
  }

  const profilePayload = {
    user_id: user.id,
    display_name: draft.displayName || null,
    grade_band: draft.gradeBand,
    preferred_language_mode: draft.languageMode,
    preferred_subject: draft.subject,
    preferred_subjects:
      preferredSubjects && preferredSubjects.length > 0
        ? preferredSubjects
        : [draft.subject],
  };

  const { data: profile, error: profileError } = await supabase
    .from("learner_profiles")
    .upsert(profilePayload, {
      onConflict: "user_id",
    })
    .select("id")
    .single();

  if (profileError || !profile) {
    return {
      ok: false,
      message: mapPersistenceError(profileError?.message, "learner profile"),
    };
  }

  const { data: studySession, error: sessionError } = await supabase
    .from("study_sessions")
    .insert({
      learner_profile_id: profile.id,
      user_id: user.id,
      subject: draft.subject,
      language_mode: draft.languageMode,
      topic: draft.topic || null,
      status: "setup",
    })
    .select("id")
    .single();

  if (sessionError || !studySession) {
    return {
      ok: false,
      message: mapPersistenceError(sessionError?.message, "study session"),
    };
  }

  return {
    ok: true,
    learnerProfileId: profile.id,
    studySessionId: studySession.id,
  };
}

function mapPersistenceError(errorMessage: string | undefined, entity: string) {
  if (!errorMessage) {
    return `Could not save the ${entity}.`;
  }

  if (
    errorMessage.includes("relation") ||
    errorMessage.includes("does not exist") ||
    errorMessage.includes("schema cache")
  ) {
    return `Could not save the ${entity}. Apply the hosted Supabase migration first so the required tables exist.`;
  }

  return `Could not save the ${entity}: ${errorMessage}`;
}
