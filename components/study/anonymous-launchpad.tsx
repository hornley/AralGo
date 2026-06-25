"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  defaultStudySetup,
  loadStudySetup,
  saveStudySetup,
  type StudySetupDraft,
} from "@/lib/study/study-setup";

type AuthStatus = "idle" | "ready" | "working" | "failed";

const gradeOptions = [
  { value: "elementary", label: "Elementary" },
  { value: "junior_high", label: "Junior High" },
  { value: "senior_high", label: "Senior High" },
] as const;

const languageOptions = [
  { value: "english", label: "English" },
  { value: "filipino", label: "Filipino" },
  { value: "mixed", label: "Mixed" },
] as const;

const subjectOptions = [
  { value: "mathematics", label: "Mathematics" },
  { value: "science", label: "Science" },
  { value: "english", label: "English" },
  { value: "filipino", label: "Filipino" },
] as const;

export function AnonymousLaunchpad() {
  const supabase = useMemo(() => createClient(), []);
  const [draft, setDraft] = useState<StudySetupDraft>(() => loadStudySetup() ?? defaultStudySetup);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("idle");
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>(
    "Create an anonymous learner session tied to your hosted Supabase project.",
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let ignore = false;

    async function hydrateSession() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (ignore) {
        return;
      }

      if (error) {
        setAuthStatus("failed");
        setMessage(error.message);
        return;
      }

      if (session?.user) {
        setAuthStatus("ready");
        setSessionUserId(session.user.id);
        setMessage(
          session.user.is_anonymous
            ? "Anonymous Supabase session is active for this device."
            : "Supabase session is active for this device.",
        );
      }
    }

    void hydrateSession();

    return () => {
      ignore = true;
    };
  }, [supabase]);

  function updateDraft<Key extends keyof StudySetupDraft>(
    key: Key,
    value: StudySetupDraft[Key],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function createGuestSession() {
    startTransition(async () => {
      setAuthStatus("working");
      setMessage("Creating an anonymous learner session...");
      saveStudySetup(draft);

      const {
        data: { session: existingSession },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        setAuthStatus("failed");
        setMessage(sessionError.message);
        return;
      }

      if (existingSession?.user) {
        setAuthStatus("ready");
        setSessionUserId(existingSession.user.id);
        setMessage("Using the existing Supabase session for this learner setup.");
        return;
      }

      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) {
        setAuthStatus("failed");
        setMessage(
          "Anonymous sign-in failed. Enable Anonymous Sign-Ins in Supabase Auth to use this flow.",
        );
        return;
      }

      setAuthStatus("ready");
      setSessionUserId(data.user?.id ?? null);
      setMessage("Anonymous Supabase session created and learner setup saved locally.");
    });
  }

  return (
    <section className="card stack">
      <div className="stack compact">
        <p className="eyebrow">Hosted Session Setup</p>
        <h1 className="section-title">Create a learner session on this device</h1>
        <p className="muted">
          This flow uses the hosted Supabase project from <span className="mono">.env.local</span>.
          It does not depend on a local Supabase stack.
        </p>
      </div>

      <div className="status-row">
        <span className={`status-chip ${authStatus}`}>{authStatus}</span>
        <span className="muted">{message}</span>
      </div>

      <div className="grid setup-grid">
        <label className="field">
          <span>Display name</span>
          <input
            value={draft.displayName}
            onChange={(event) => updateDraft("displayName", event.target.value)}
            placeholder="Optional nickname"
          />
        </label>

        <label className="field">
          <span>Grade band</span>
          <select
            value={draft.gradeBand}
            onChange={(event) => updateDraft("gradeBand", event.target.value as StudySetupDraft["gradeBand"])}
          >
            {gradeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Language mode</span>
          <select
            value={draft.languageMode}
            onChange={(event) =>
              updateDraft("languageMode", event.target.value as StudySetupDraft["languageMode"])
            }
          >
            {languageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Primary subject</span>
          <select
            value={draft.subject}
            onChange={(event) => updateDraft("subject", event.target.value as StudySetupDraft["subject"])}
          >
            {subjectOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field field-wide">
          <span>Starting topic</span>
          <input
            value={draft.topic}
            onChange={(event) => updateDraft("topic", event.target.value)}
            placeholder="Fractions, photosynthesis, grammar, etc."
          />
        </label>
      </div>

      <div className="actions">
        <button className="button primary" onClick={createGuestSession} disabled={isPending}>
          {isPending ? "Creating session..." : "Start anonymous session"}
        </button>
      </div>

      <div className="grid">
        <article className="card inset">
          <h2 className="section-title">Current learner setup</h2>
          <p className="muted">
            {draft.displayName || "Guest learner"} · {draft.gradeBand.replace("_", " ")} ·{" "}
            {draft.languageMode}
          </p>
          <p className="muted">
            Subject: {draft.subject} {draft.topic ? `· Topic: ${draft.topic}` : ""}
          </p>
        </article>

        <article className="card inset">
          <h2 className="section-title">Session identity</h2>
          <p className="muted">
            {sessionUserId
              ? "Supabase user id is ready for learner-owned rows and future RLS-backed persistence."
              : "No Supabase session yet. Create one above to connect this learner setup to the hosted project."}
          </p>
          {sessionUserId ? <p className="mono">{sessionUserId}</p> : null}
        </article>
      </div>
    </section>
  );
}
