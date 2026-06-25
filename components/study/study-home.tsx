"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  type LanguageMode,
  type LearnerProfile,
  type Subject,
  languageLabels,
  loadLearnerProfile,
  saveLearnerProfile,
  subjectLabels,
} from "@/lib/study/learner-profile";
import { SubjectCard } from "./subject-card";

const subjectList: Subject[] = ["mathematics", "science", "english", "filipino"];

const languageCycle: LanguageMode[] = ["filipino", "english", "mixed"];

export function StudyHome() {
  const supabase = useMemo(() => createClient(), []);
  const [profile, setProfile] = useState<LearnerProfile>(
    () => loadLearnerProfile() ?? null!,
  );

  useEffect(() => {
    const userIdPromise = supabase.auth
      .getSession()
      .then((r) => r.data.session?.user?.id ?? null);
    userIdPromise.catch(() => {});
  }, [supabase]);

  function cycleLanguage() {
    const current = profile.languageMode;
    const idx = languageCycle.indexOf(current);
    const next = languageCycle[(idx + 1) % languageCycle.length];

    const updated = { ...profile, languageMode: next };
    setProfile(updated);
    saveLearnerProfile(updated);
  }

  function handleSubjectSelect(subject: Subject) {
    console.log("[StudyHome] subject selected", subject);
  }

  return (
    <div className="stack">
      <div className="study-topbar">
        <span className="study-topbar-title">AralGo</span>
        <div className="study-topbar-right">
          <button
            className="language-toggle"
            onClick={cycleLanguage}
            type="button"
            title="Switch language mode"
          >
            {languageLabels[profile.languageMode]}
          </button>
        </div>
      </div>

      <section className="hero-card">
        <h1 className="section-title">Mag-aral ngayon</h1>
        <p className="muted">
          Pick a subject below or type a question to start studying.
        </p>
        <div className="actions">
          <button
            className="button primary"
            onClick={() => {
              if (profile.subjects.length > 0) {
                handleSubjectSelect(profile.subjects[0]);
              }
            }}
            type="button"
          >
            Study Now
          </button>
          <button className="button secondary" type="button">
            Magsanay / Practice
          </button>
        </div>
      </section>

      <section className="stack compact">
        <h2 className="section-title">Subjects</h2>
        <div className="subject-grid">
          {subjectList.map((subject) => (
            <SubjectCard
              key={subject}
              subject={subject}
              selected={profile.subjects.includes(subject)}
              onSelect={handleSubjectSelect}
            />
          ))}
        </div>
      </section>

      <section className="card inset stack compact">
        <h2 className="section-title">Recent items</h2>
        <p className="muted">
          No recent study items yet. Pick a subject to begin.
        </p>
        <p className="muted">
          Try asking about fractions, photosynthesis, grammar, or
          mga bahagi ng pananalita.
        </p>
      </section>
    </div>
  );
}
