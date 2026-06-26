'use client';

import { AppIcon } from '@/components/AppIcon';
import { StudySubject } from '@/lib/types/supabase';
import styles from '../../app/(dashboard)/lesson-studio/lesson-studio.module.css';

interface SubjectPickerProps {
  availableSubjects: { name: StudySubject; display_name: string; icon: string }[];
  preferredSubjects: StudySubject[];
  selected: StudySubject | null;
  onSelect: (subject: StudySubject) => void;
}

export default function SubjectPicker({ availableSubjects, preferredSubjects, selected, onSelect }: SubjectPickerProps) {
  const orderedSubjects = [...availableSubjects].sort((left, right) => {
    const leftPreferred = preferredSubjects.includes(left.name);
    const rightPreferred = preferredSubjects.includes(right.name);

    if (leftPreferred === rightPreferred) {
      return 0;
    }

    return leftPreferred ? -1 : 1;
  });

  return (
    <div>
      <h2>Create a lesson</h2>
      <p className={styles.subtitle}>
        {preferredSubjects.length > 0
          ? 'Start with one of your focus subjects from onboarding, or switch to another subject for this lesson.'
          : 'Pick the subject you want to create a lesson for.'}
      </p>
      <div className={styles.subjectGrid}>
        {orderedSubjects.map((s) => (
          <button
            key={s.name}
            className={`${styles.subjectCard} ${selected === s.name ? styles.selected : ''}`}
            onClick={() => onSelect(s.name)}
            aria-pressed={selected === s.name}
            data-subject={s.name}
          >
            {selected === s.name && (
              <span className={styles.subjectCheck}>
                <AppIcon name="check_circle" size={18} strokeWidth={2.25} />
              </span>
            )}
            <AppIcon name={s.icon} className={styles.subjectIcon} size={36} strokeWidth={2} />
            <span className={styles.subjectName}>{s.display_name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
