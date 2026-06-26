'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AppIcon } from '@/components/AppIcon';
import { LeafProgress } from '@/components/LeafProgress';
import { StationeryCard } from '@/components/StationeryCard';
import { createClient } from '@/lib/supabase/client';
import { t } from '@/lib/i18n';
import type { StudySubject } from '@/lib/types/supabase';
import { persistLearnerSession } from '@/lib/study/learner-session';
import {
  createRecentStudyTopic,
  goalMinutesFromGoal,
  saveStudySetup,
  type StudySetupDraft,
} from '@/lib/study/study-setup';
import styles from './onboarding.module.css';

export default function OnboardingPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const [language, setLanguage] = useState<string | null>(null);
  const [gradeLevel, setGradeLevel] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [goal, setGoal] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleCreateLesson = () => {
    startTransition(async () => {
      setStatusMessage('Saving your setup and creating a learner session...');
      const supabase = createClient();

      const draft = buildStudyDraft({
        language,
        gradeLevel,
        subjects,
        goal,
      });
      const preferredSubjects = mapSubjects(subjects);
      saveStudySetup(draft);

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        setStatusMessage(sessionError.message);
        return;
      }

      if (!session?.user) {
        const { data, error } = await supabase.auth.signInAnonymously();

        if (error) {
          setStatusMessage(
            'Anonymous sign-in failed. Enable Anonymous Sign-Ins in Supabase Auth to finish onboarding.',
          );
          return;
        }

        if (!data.user) {
          setStatusMessage('Anonymous sign-in did not return a user session.');
          return;
        }
      }

      setStatusMessage('Saving your learner profile...');

      const persistResult = await persistLearnerSession(supabase, draft, preferredSubjects);

      if (!persistResult.ok) {
        setStatusMessage(persistResult.message);
        return;
      }

      const subjectSlug = mapSubject(subjects[0]);
      setStatusMessage('Setup saved. Taking you to your first lesson...');
      router.push(`/lesson-studio?subject=${subjectSlug}`);
    });
  };

  const handleGoToDashboard = () => {
    startTransition(async () => {
      setStatusMessage('Saving your setup...');
      const supabase = createClient();

      const draft = buildStudyDraft({
        language,
        gradeLevel,
        subjects,
        goal,
      });
      const preferredSubjects = mapSubjects(subjects);
      saveStudySetup(draft);

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        setStatusMessage(sessionError.message);
        return;
      }

      if (!session?.user) {
        const { data, error } = await supabase.auth.signInAnonymously();

        if (error) {
          setStatusMessage(
            'Anonymous sign-in failed. Enable Anonymous Sign-Ins in Supabase Auth to finish onboarding.',
          );
          return;
        }

        if (!data.user) {
          setStatusMessage('Anonymous sign-in did not return a user session.');
          return;
        }
      }

      setStatusMessage('Saving your learner profile...');

      const persistResult = await persistLearnerSession(supabase, draft, preferredSubjects);

      if (!persistResult.ok) {
        setStatusMessage(persistResult.message);
        return;
      }

      setStatusMessage('Setup saved. Taking you to your dashboard...');
      router.push('/home');
    });
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const toggleSubject = (subject: string) => {
    setSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject],
    );
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <header className={styles.header}>
              <div className={styles.headerTop}>
                <button className={styles.backButton} onClick={handleBack}>
                  <AppIcon name="arrow_back" />
                </button>
                <LeafProgress currentStep={1} totalSteps={totalSteps} />
                <div className={styles.spacer}></div>
              </div>
              <h1 className={styles.title}>Choose preferred mode</h1>
              <p className={styles.subtitle}>Select the language you are most comfortable with.</p>
            </header>
            <div className={styles.content}>
              <div className={styles.grid}>
                <StationeryCard
                  title="Filipino"
                  icon="chat_bubble"
                  colorTheme="primary"
                  selected={language === 'Filipino'}
                  onClick={() => setLanguage('Filipino')}
                />
                <StationeryCard
                  title="English"
                  icon="chat"
                  colorTheme="secondary"
                  selected={language === 'English'}
                  onClick={() => setLanguage('English')}
                />
                <StationeryCard
                  title="Mixed (Filipino-English)"
                  icon="forum"
                  colorTheme="tertiary"
                  selected={language === 'Mixed'}
                  onClick={() => setLanguage('Mixed')}
                />
              </div>
            </div>
            <footer className={styles.footer}>
              <button
                className={styles.nextButton}
                onClick={handleNext}
                disabled={!language}
              >
                {t(language, 'common.next')}
                <AppIcon name="arrow_forward" className={styles.nextButtonIcon} />
              </button>
            </footer>
          </>
        );
      case 2:
        return (
          <>
            <header className={styles.header}>
              <div className={styles.headerTop}>
                <button className={styles.backButton} onClick={handleBack}>
                  <AppIcon name="arrow_back" />
                </button>
                <LeafProgress currentStep={2} totalSteps={totalSteps} />
                <div className={styles.spacer}></div>
              </div>
              <h1 className={styles.title}>{t(language, 'grade.title')}</h1>
              <p className={styles.subtitle}>{t(language, 'grade.subtitle')}</p>
            </header>
            <div className={styles.content}>
              <div className={styles.grid}>
                <StationeryCard
                  title={t(language, 'grade.elementary')}
                  icon="child_care"
                  colorTheme="tertiary"
                  selected={gradeLevel === 'Elementary'}
                  onClick={() => setGradeLevel('Elementary')}
                />
                <StationeryCard
                  title={t(language, 'grade.junior')}
                  icon="school"
                  colorTheme="primary"
                  selected={gradeLevel === 'Junior High'}
                  onClick={() => setGradeLevel('Junior High')}
                />
                <StationeryCard
                  title={t(language, 'grade.senior')}
                  icon="local_library"
                  colorTheme="secondary"
                  selected={gradeLevel === 'Senior High'}
                  onClick={() => setGradeLevel('Senior High')}
                />
                <StationeryCard
                  title={t(language, 'grade.college')}
                  icon="menu_book"
                  colorTheme="surface-dim"
                  selected={gradeLevel === 'College'}
                  onClick={() => setGradeLevel('College')}
                />
              </div>
            </div>
            <footer className={styles.footer}>
              <div className={styles.stickyNote}>
                <AppIcon name="lightbulb" className={styles.stickyNoteIcon} />
                <p className={styles.stickyNoteText}>
                  {t(language, 'grade.sticky')}
                </p>
              </div>
              <button
                className={styles.nextButton}
                onClick={handleNext}
                disabled={!gradeLevel}
              >
                {t(language, 'common.next')}
                <AppIcon name="arrow_forward" className={styles.nextButtonIcon} />
              </button>
            </footer>
          </>
        );
      case 3:
        return (
          <>
            <header className={styles.header}>
              <div className={styles.headerTop}>
                <button className={styles.backButton} onClick={handleBack}>
                  <AppIcon name="arrow_back" />
                </button>
                <LeafProgress currentStep={3} totalSteps={totalSteps} />
                <div className={styles.spacer}></div>
              </div>
              <h1 className={styles.title}>{t(language, 'subject.title')}</h1>
              <p className={styles.subtitle}>{t(language, 'subject.subtitle')}</p>
            </header>
            <div className={styles.content}>
              <div className={styles.grid}>
                <StationeryCard
                  title="Mathematics"
                  icon="calculate"
                  colorTheme="primary"
                  selected={subjects.includes('Mathematics')}
                  onClick={() => toggleSubject('Mathematics')}
                />
                <StationeryCard
                  title="Science"
                  icon="science"
                  colorTheme="tertiary"
                  selected={subjects.includes('Science')}
                  onClick={() => toggleSubject('Science')}
                />
                <StationeryCard
                  title="English"
                  icon="menu_book"
                  colorTheme="secondary"
                  selected={subjects.includes('English')}
                  onClick={() => toggleSubject('English')}
                />
                <StationeryCard
                  title="Filipino"
                  icon="import_contacts"
                  colorTheme="surface-dim"
                  selected={subjects.includes('Filipino')}
                  onClick={() => toggleSubject('Filipino')}
                />
              </div>
            </div>
            <footer className={styles.footer}>
              <div className={styles.stickyNote}>
                <AppIcon name="lightbulb" className={styles.stickyNoteIcon} />
                <p className={styles.stickyNoteText}>
                  {t(language, 'subject.sticky')}
                </p>
              </div>
              <button
                className={styles.nextButton}
                onClick={handleNext}
                disabled={subjects.length === 0}
              >
                {t(language, 'common.next')}
                <AppIcon name="arrow_forward" className={styles.nextButtonIcon} />
              </button>
            </footer>
          </>
        );
      case 4:
        return (
          <>
            <header className={styles.header}>
              <div className={styles.headerTop}>
                <button className={styles.backButton} onClick={handleBack}>
                  <AppIcon name="arrow_back" />
                </button>
                <LeafProgress currentStep={4} totalSteps={totalSteps} />
                <div className={styles.spacer}></div>
              </div>
              <h1 className={styles.title}>{t(language, 'goal.title')}</h1>
              <p className={styles.subtitle}>{t(language, 'goal.subtitle')}</p>
            </header>
            <div className={styles.content}>
              <div className={styles.grid}>
                <StationeryCard
                  title={t(language, 'goal.catchup')}
                  icon="directions_run"
                  colorTheme="primary"
                  selected={goal === 'Habol'}
                  onClick={() => setGoal('Habol')}
                />
                <StationeryCard
                  title={t(language, 'goal.review')}
                  icon="fact_check"
                  colorTheme="tertiary"
                  selected={goal === 'Review'}
                  onClick={() => setGoal('Review')}
                />
                <StationeryCard
                  title={t(language, 'goal.learn')}
                  icon="lightbulb"
                  colorTheme="secondary"
                  selected={goal === 'Learn'}
                  onClick={() => setGoal('Learn')}
                />
              </div>
            </div>
            <footer className={styles.footer}>
              <div className={styles.buttonGroup}>
                {goal ? (
                  <button className={styles.nextButton} onClick={handleNext}>
                    {t(language, 'common.next')}
                    <AppIcon name="arrow_forward" className={styles.nextButtonIcon} />
                  </button>
                ) : (
                  <button className={styles.skipButton} onClick={handleNext}>
                    {t(language, 'common.skip')}
                  </button>
                )}
              </div>
            </footer>
          </>
        );
      case 5:
        return (
          <>
            <header className={styles.header}>
              <div className={styles.headerTop}>
                <button className={styles.backButton} onClick={() => setStep(4)}>
                  <AppIcon name="arrow_back" />
                </button>
                <div className={styles.spacer}></div>
              </div>
            </header>
            <div className={styles.content}>
              <div className={styles.celebration}>
                <div className={styles.starWrapper}>
                  <div className={styles.starGlow} />
                  <AppIcon name="stars" className={styles.celebrationIcon} />
                </div>
                <h2 className={styles.celebrationTitle}>You&apos;re all set!</h2>
                <p className={styles.celebrationSub}>
                  Your study profile is ready. Here&apos;s a quick look at what you chose.
                </p>
                <div className={styles.notebookLine} />
              </div>
              <div className={styles.summaryCards}>
                <div className={styles.summaryCard}>
                  <AppIcon name="chat" />
                  <div>
                    <p className={styles.summaryLabel}>Language Mode</p>
                    <p className={styles.summaryValue}>{language || 'Mixed (Filipino-English)'}</p>
                  </div>
                </div>
                <div className={styles.summaryCard}>
                  <AppIcon name="school" />
                  <div>
                    <p className={styles.summaryLabel}>Grade Level</p>
                    <p className={styles.summaryValue}>{gradeLevel || 'Junior High School'}</p>
                  </div>
                </div>
                <div className={styles.summaryCard}>
                  <AppIcon name="menu_book" />
                  <div>
                    <p className={styles.summaryLabel}>Subjects</p>
                    <p className={styles.summaryValue}>{subjects.join(', ') || 'None selected yet'}</p>
                  </div>
                </div>
                <div className={styles.summaryCard}>
                  <AppIcon name="flag" />
                  <div>
                    <p className={styles.summaryLabel}>Study Goal</p>
                    <p className={styles.summaryValue}>{goal || 'Learn something new'}</p>
                  </div>
                </div>
              </div>
              {statusMessage ? <p className={styles.statusMessage}>{statusMessage}</p> : null}
            </div>
            <footer className={styles.footer}>
              <div className={styles.buttonGroup}>
                <button className={styles.primaryButton} onClick={handleCreateLesson} disabled={isPending}>
                  <AppIcon name="auto_stories" />
                  Create your first lesson
                </button>
                <button className={styles.secondaryButton} onClick={handleGoToDashboard} disabled={isPending}>
                  Head to Dashboard
                </button>
              </div>
            </footer>

            <AppIcon name="auto_stories" className={`${styles.ambientShape} ${styles.shape1}`} />
            <AppIcon name="stars" className={`${styles.ambientShape} ${styles.shape2}`} />
            <AppIcon name="school" className={`${styles.ambientShape} ${styles.shape3}`} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <main className={styles.main}>
      <AppIcon name="edit" className={`${styles.ambientShape} ${styles.shape1}`} />
      <AppIcon name="attach_file" className={`${styles.ambientShape} ${styles.shape2}`} />
      <AppIcon name="sticky_note_2" className={`${styles.ambientShape} ${styles.shape3}`} />

      {renderStep()}
    </main>
  );
}

function buildStudyDraft({
  language,
  gradeLevel,
  subjects,
  goal,
}: {
  language: string | null;
  gradeLevel: string | null;
  subjects: string[];
  goal: string | null;
}): StudySetupDraft {
  const draft: StudySetupDraft = {
    displayName: "",
    languageMode:
      language === "Filipino" ? "filipino" : language === "English" ? "english" : "mixed",
    gradeBand:
      gradeLevel === "Elementary"
        ? "elementary"
        : gradeLevel === "Senior High"
          ? "senior_high"
          : gradeLevel === "College"
            ? "college_general"
            : "junior_high",
    subject: mapSubject(subjects[0]),
    topic: "",
    goal: mapGoal(goal),
    dailyGoalMinutes: goalMinutesFromGoal(mapGoal(goal)),
    recentTopics: [],
  };

  draft.recentTopics = [
    createRecentStudyTopic(draft, {
      status: "setup",
    }),
  ];

  return draft;
}

function mapGoal(goal: string | null): StudySetupDraft["goal"] {
  if (goal === "Habol" || goal === "Review" || goal === "Learn") {
    return goal;
  }

  return null;
}

function mapSubject(subject?: string): StudySetupDraft["subject"] {
  switch (subject) {
    case "Mathematics":
      return "mathematics";
    case "English":
      return "english";
    case "Filipino":
      return "filipino";
    default:
      return "science";
  }
}

function mapSubjects(subjects: string[]): StudySubject[] {
  const normalized = subjects.map((subject) => mapSubject(subject));
  return [...new Set(normalized)];
}
