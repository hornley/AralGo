'use client';

import { StudySubject } from '@/lib/types/supabase';
import styles from '../../app/lesson-studio/lesson-studio.module.css';

interface SubjectPickerProps {
  availableSubjects: { name: StudySubject; display_name: string; icon: string }[];
  selected: StudySubject | null;
  onSelect: (subject: StudySubject) => void;
}

export default function SubjectPicker({ availableSubjects, selected, onSelect }: SubjectPickerProps) {
  return (
    <div>
      <h2>Choose a subject</h2>
      <p className={styles.subtitle}>Pick the subject you want to create a lesson for.</p>
      <div className={styles.subjectGrid}>
        {availableSubjects.map((s) => (
          <button
            key={s.name}
            className={`${styles.subjectCard} ${selected === s.name ? styles.selected : ''}`}
            onClick={() => onSelect(s.name)}
            aria-pressed={selected === s.name}
            data-subject={s.name}
          >
            <span className={styles.subjectIcon}>{s.icon}</span>
            <span className={styles.subjectName}>{s.display_name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
