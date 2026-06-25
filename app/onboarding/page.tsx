'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LeafProgress } from '@/components/LeafProgress';
import { StationeryCard } from '@/components/StationeryCard';
import styles from './onboarding.module.css';

type GradeLevel = 'Elementary' | 'High School' | 'College' | 'Graduate' | null;

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState<GradeLevel>('High School');

  const handleNext = () => {
    if (selectedLevel) {
      // In a real app, save this to Supabase or local state here.
      router.push('/study'); // navigate to study center or next onboarding step
    }
  };

  return (
    <main className={styles.main}>
      {/* Decorative Ambient Shapes */}
      <span className={`material-symbols-outlined ${styles.ambientShape} ${styles.shape1}`}>edit</span>
      <span className={`material-symbols-outlined ${styles.ambientShape} ${styles.shape2}`}>attach_file</span>
      <span className={`material-symbols-outlined ${styles.ambientShape} ${styles.shape3}`}>sticky_note_2</span>

      {/* Header & Progress */}
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <button className={styles.backButton} onClick={() => router.back()}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          
          <LeafProgress currentStep={1} totalSteps={3} />
          
          <div className={styles.spacer}></div>
        </div>
        
        <h1 className={styles.title}>What&apos;s your grade level?</h1>
        <p className={styles.subtitle}>This helps us tailor your study plan.</p>
      </header>

      {/* Main Content Area: Bento Grid of Options */}
      <div className={styles.content}>
        <div className={styles.grid}>
          <StationeryCard
            title="Elementary"
            icon="child_care"
            colorTheme="tertiary"
            selected={selectedLevel === 'Elementary'}
            onClick={() => setSelectedLevel('Elementary')}
          />
          <StationeryCard
            title="High School"
            icon="school"
            colorTheme="primary"
            selected={selectedLevel === 'High School'}
            onClick={() => setSelectedLevel('High School')}
          />
          <StationeryCard
            title="College"
            icon="menu_book"
            colorTheme="surface-dim"
            selected={selectedLevel === 'College'}
            onClick={() => setSelectedLevel('College')}
          />
          <StationeryCard
            title="Graduate"
            icon="history_edu"
            colorTheme="secondary"
            selected={selectedLevel === 'Graduate'}
            onClick={() => setSelectedLevel('Graduate')}
          />
        </div>
      </div>

      {/* Bottom Actions */}
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
          disabled={!selectedLevel}
        >
          Next
          <span className={`material-symbols-outlined ${styles.nextButtonIcon}`}>arrow_forward</span>
        </button>
      </footer>
    </main>
  );
}
