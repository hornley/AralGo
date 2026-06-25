"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  type GradeBand,
  type LanguageMode,
  type LearnerProfile,
  type StudyGoal,
  type Subject,
  defaultLearnerProfile,
  gradeLabels,
  goalLabels,
  goalLabelsFilipino,
  languageLabels,
  saveLearnerProfile,
  subjectLabels,
} from "@/lib/study/learner-profile";
import { SubjectCard } from "./subject-card";

type Step = "welcome" | "language" | "grade" | "subjects" | "goals" | "creating";

const stepLabels = ["Welcome", "Language", "Grade", "Subjects", "Goals"];

const gradeOptions: GradeBand[] = ["elementary", "junior_high", "senior_high"];

const languageOptions: LanguageMode[] = ["filipino", "english", "mixed"];

const subjectList: Subject[] = ["mathematics", "science", "english", "filipino"];

type OnboardingWizardProps = {
  onComplete: () => void;
};

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const supabase = useMemo(() => createClient(), []);
  const [step, setStep] = useState<Step>("welcome");
  const [profile, setProfile] = useState<LearnerProfile>({
    ...defaultLearnerProfile,
  });
  const [error, setError] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);

  function goTo(next: Step) {
    setAnimating(true);
    setError(null);
    setTimeout(() => {
      setStep(next);
      setAnimating(false);
    }, 150);
  }

  function setLanguageMode(mode: LanguageMode) {
    setProfile((p) => ({ ...p, languageMode: mode }));
    goTo("grade");
  }

  function setGradeBand(band: GradeBand) {
    setProfile((p) => ({ ...p, gradeBand: band }));
    goTo("subjects");
  }

  function toggleSubject(subject: Subject) {
    setProfile((p) => {
      const exists = p.subjects.includes(subject);
      return {
        ...p,
        subjects: exists
          ? p.subjects.filter((s) => s !== subject)
          : [...p.subjects, subject],
      };
    });
  }

  const sessionStarted = useRef(false);

  function setGoal(goal: StudyGoal | null) {
    setProfile((p) => ({ ...p, studyGoal: goal }));
    sessionStarted.current = false;
    goTo("creating");
  }

  const createSession = useCallback(async () => {
    setError(null);

    const completed = { ...profile, onboardingCompleted: true, createdAt: Date.now() };

    try {
      const {
        data: { session: existingSession },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        setError(sessionError.message);
        return;
      }

      if (!existingSession?.user) {
        const { error: signInError } = await supabase.auth.signInAnonymously();
        if (signInError) {
          setError(signInError.message);
          return;
        }
      }

      saveLearnerProfile(completed);
      onComplete();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
    }
  }, [profile, supabase, onComplete]);

  useEffect(() => {
    if (step === "creating" && !sessionStarted.current) {
      sessionStarted.current = true;
      void createSession();
    }
  }, [step, createSession]);

  const stepIndex = stepLabels.indexOf(step as typeof stepLabels[number]);

  return (
    <section className="card stack onboarding-card">
      {step !== "welcome" && step !== "creating" && (
        <div className="onboarding-progress">
          {stepLabels.map((label, i) => (
            <div
              key={label}
              className={`onboarding-dot ${i <= stepIndex ? "active" : ""}`}
            />
          ))}
        </div>
      )}

      <div className={`onboarding-content ${animating ? "fade-out" : "fade-in"}`}>
        {step === "welcome" && (
          <div className="onboarding-step stack compact">
            <p className="eyebrow">AralGo</p>
            <h1 className="section-title">Your AI study companion</h1>
            <p className="muted">
              Get bilingual tutoring, practice exercises, and study support
              tailored to your level. All in Filipino, English, or mixed.
            </p>
            <div className="actions">
              <button
                className="button primary"
                onClick={() => goTo("language")}
                type="button"
              >
                Simulan / Get Started
              </button>
            </div>
          </div>
        )}

        {step === "language" && (
          <div className="onboarding-step stack compact">
            <p className="eyebrow">Step 1 of 4</p>
            <h2 className="section-title">Preferred language mode</h2>
            <p className="muted">
              Choose how you want explanations and practice to be delivered.
            </p>
            <div className="onboarding-options">
              {languageOptions.map((mode) => (
                <button
                  key={mode}
                  className={`onboarding-option ${profile.languageMode === mode ? "selected" : ""}`}
                  onClick={() => setLanguageMode(mode)}
                  type="button"
                >
                  <span className="onboarding-option-label">
                    {languageLabels[mode]}
                  </span>
                  <span className="onboarding-option-desc">
                    {mode === "filipino"
                      ? "Mga paliwanag at pagsasanay sa Filipino"
                      : mode === "english"
                        ? "Explanations and practice in English"
                        : "Blended Filipino-English for natural learning"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "grade" && (
          <div className="onboarding-step stack compact">
            <p className="eyebrow">Step 2 of 4</p>
            <h2 className="section-title">Your grade level</h2>
            <p className="muted">
              This helps us match explanations and difficulty to your level.
            </p>
            <div className="onboarding-options">
              {gradeOptions.map((band) => (
                <button
                  key={band}
                  className={`onboarding-option ${profile.gradeBand === band ? "selected" : ""}`}
                  onClick={() => setGradeBand(band)}
                  type="button"
                >
                  <span className="onboarding-option-label">
                    {gradeLabels[band]}
                  </span>
                  <span className="onboarding-option-desc">
                    {band === "elementary"
                      ? "Grades 1\u20136"
                      : band === "junior_high"
                        ? "Grades 7\u201310"
                        : "Grades 11\u201312"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "subjects" && (
          <div className="onboarding-step stack compact">
            <p className="eyebrow">Step 3 of 4</p>
            <h2 className="section-title">Pick your subjects</h2>
            <p className="muted">
              Select at least one subject you&apos;re currently studying.
            </p>
            <div className="subject-grid">
              {subjectList.map((subject) => (
                <SubjectCard
                  key={subject}
                  subject={subject}
                  selected={profile.subjects.includes(subject)}
                  onSelect={toggleSubject}
                />
              ))}
            </div>
            <div className="actions">
              <button
                className="button primary"
                disabled={profile.subjects.length === 0}
                onClick={() => goTo("goals")}
                type="button"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === "goals" && (
          <div className="onboarding-step stack compact">
            <p className="eyebrow">Step 4 of 4</p>
            <h2 className="section-title">Study goals (optional)</h2>
            <p className="muted">
              This helps us suggest relevant study paths. You can skip this.
            </p>
            <div className="onboarding-options">
              {(
                Object.keys(goalLabels) as StudyGoal[]
              ).map((goal) => (
                <button
                  key={goal}
                  className={`onboarding-option ${profile.studyGoal === goal ? "selected" : ""}`}
                  onClick={() => setGoal(goal)}
                  type="button"
                >
                  <span className="onboarding-option-label">
                    {goalLabelsFilipino[goal]}
                  </span>
                  <span className="onboarding-option-desc">
                    {goalLabels[goal]}
                  </span>
                </button>
              ))}
            </div>
            <div className="actions">
              <button
                className="button secondary"
                onClick={() => setGoal(null)}
                type="button"
              >
                Skip
              </button>
            </div>
          </div>
        )}

        {step === "creating" && (
          <div className="onboarding-step stack compact">
            <p className="eyebrow">Setting up</p>
            <h2 className="section-title">
              {error ? "Something went wrong" : "Preparing your study space..."}
            </h2>
            {error ? (
              <div className="stack compact">
                <p className="muted">{error}</p>
                <div className="actions">
                  <button
                    className="button primary"
                    onClick={() => createSession()}
                    type="button"
                  >
                    Try again
                  </button>
                  <button
                    className="button secondary"
                    onClick={() => goTo("welcome")}
                    type="button"
                  >
                    Back to start
                  </button>
                </div>
              </div>
            ) : (
              <p className="muted">Creating your anonymous session...</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
