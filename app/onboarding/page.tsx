'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LeafProgress } from '@/components/LeafProgress';
import { StationeryCard } from '@/components/StationeryCard';
import { createClient } from '@/lib/supabase/client';
import { persistLearnerSession } from '@/lib/study/learner-session';
import { saveStudySetup, type StudySetupDraft } from '@/lib/study/study-setup';
import { t } from '@/lib/i18n';
import styles from './onboarding.module.css';

export default function OnboardingPage() {
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  
  const [language, setLanguage] = useState<string | null>(null);
  const [gradeLevel, setGradeLevel] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [goal, setGoal] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      startTransition(async () => {
        setStatusMessage('Saving your setup and creating a learner session...');
        const supabase = createClient();

        const draft = buildStudyDraft({
          language,
          gradeLevel,
          subjects,
        });
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

        const persistResult = await persistLearnerSession(supabase, draft);

        if (!persistResult.ok) {
          setStatusMessage(persistResult.message);
          return;
        }

        setStatusMessage('Setup saved. Taking you to your dashboard...');
        router.push('/home');
      });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const toggleSubject = (subject: string) => {
    setSubjects(prev => 
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
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
                  <span className="material-symbols-outlined">arrow_back</span>
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
                Next
                <span className={`material-symbols-outlined ${styles.nextButtonIcon}`}>arrow_forward</span>
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
                  <span className="material-symbols-outlined">arrow_back</span>
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
                <span className={`material-symbols-outlined ${styles.stickyNoteIcon}`}>lightbulb</span>
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
                <span className={`material-symbols-outlined ${styles.nextButtonIcon}`}>arrow_forward</span>
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
                  <span className="material-symbols-outlined">arrow_back</span>
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
                <span className={`material-symbols-outlined ${styles.stickyNoteIcon}`}>lightbulb</span>
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
                <span className={`material-symbols-outlined ${styles.nextButtonIcon}`}>arrow_forward</span>
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
                  <span className="material-symbols-outlined">arrow_back</span>
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
                  <button className={styles.nextButton} onClick={handleNext} disabled={isPending}>
                    {t(language, 'common.finish')}
                    <span className={`material-symbols-outlined ${styles.nextButtonIcon}`}>check</span>
                  </button>
                ) : (
                  <button className={styles.skipButton} onClick={handleNext} disabled={isPending}>
                    {t(language, 'common.skip')}
                  </button>
                )}
                {statusMessage ? <p className={styles.statusMessage}>{statusMessage}</p> : null}
              </div>
            </footer>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <main className={styles.main}>
      {/* Decorative Ambient Shapes */}
      <span className={`material-symbols-outlined ${styles.ambientShape} ${styles.shape1}`}>edit</span>
      <span className={`material-symbols-outlined ${styles.ambientShape} ${styles.shape2}`}>attach_file</span>
      <span className={`material-symbols-outlined ${styles.ambientShape} ${styles.shape3}`}>sticky_note_2</span>

      {renderStep()}
    </main>
  );
}

function buildStudyDraft({
  language,
  gradeLevel,
  subjects,
}: {
  language: string | null;
  gradeLevel: string | null;
  subjects: string[];
}): StudySetupDraft {
  return {
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
  };
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
