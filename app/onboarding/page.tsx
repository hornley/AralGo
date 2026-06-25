'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LeafProgress } from '@/components/LeafProgress';
import { StationeryCard } from '@/components/StationeryCard';
import styles from './onboarding.module.css';

export default function OnboardingPage() {
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  
  const [language, setLanguage] = useState<string | null>(null);
  const [gradeLevel, setGradeLevel] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [goal, setGoal] = useState<string | null>(null);

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      router.push('/home');
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
              <h1 className={styles.title}>What&apos;s your grade level?</h1>
              <p className={styles.subtitle}>This helps us tailor your study plan.</p>
            </header>
            <div className={styles.content}>
              <div className={styles.grid}>
                <StationeryCard
                  title="Elementary (Grades 1–6)"
                  icon="child_care"
                  colorTheme="tertiary"
                  selected={gradeLevel === 'Elementary'}
                  onClick={() => setGradeLevel('Elementary')}
                />
                <StationeryCard
                  title="Junior High (Grades 7–10)"
                  icon="school"
                  colorTheme="primary"
                  selected={gradeLevel === 'Junior High'}
                  onClick={() => setGradeLevel('Junior High')}
                />
                <StationeryCard
                  title="Senior High (Grades 11–12)"
                  icon="local_library"
                  colorTheme="secondary"
                  selected={gradeLevel === 'Senior High'}
                  onClick={() => setGradeLevel('Senior High')}
                />
                <StationeryCard
                  title="College / General"
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
                  You can always change this later in your settings!
                </p>
              </div>
              <button 
                className={styles.nextButton} 
                onClick={handleNext}
                disabled={!gradeLevel}
              >
                Next
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
              <h1 className={styles.title}>Pick at least one subject</h1>
              <p className={styles.subtitle}>You can choose multiple subjects.</p>
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
                  Maaaring magdagdag pa mamaya / Can add more later
                </p>
              </div>
              <button 
                className={styles.nextButton} 
                onClick={handleNext}
                disabled={subjects.length === 0}
              >
                Next
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
              <h1 className={styles.title}>What are your study goals?</h1>
              <p className={styles.subtitle}>Feel free to skip or choose one.</p>
            </header>
            <div className={styles.content}>
              <div className={styles.grid}>
                <StationeryCard
                  title="Habol sa klase"
                  icon="directions_run"
                  colorTheme="primary"
                  selected={goal === 'Habol'}
                  onClick={() => setGoal('Habol')}
                />
                <StationeryCard
                  title="Nagre-review para sa exam"
                  icon="fact_check"
                  colorTheme="tertiary"
                  selected={goal === 'Review'}
                  onClick={() => setGoal('Review')}
                />
                <StationeryCard
                  title="Gusto ko lang matuto"
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
                    Finish
                    <span className={`material-symbols-outlined ${styles.nextButtonIcon}`}>check</span>
                  </button>
                ) : (
                  <button className={styles.skipButton} onClick={handleNext}>
                    Skip for now
                  </button>
                )}
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
