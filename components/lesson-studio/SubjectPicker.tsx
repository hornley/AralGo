'use client';

import { StudySubject } from '@/lib/types/supabase';

interface SubjectPickerProps {
  availableSubjects: { name: StudySubject; display_name: string; icon: string }[];
  selected: StudySubject | null;
  onSelect: (subject: StudySubject) => void;
}

export default function SubjectPicker({ availableSubjects, selected, onSelect }: SubjectPickerProps) {
  return (
    <div className="subject-picker">
      <h2>Choose a subject</h2>
      <div className="subject-grid">
        {availableSubjects.map((s) => (
          <button
            key={s.name}
            className={`subject-card ${selected === s.name ? 'selected' : ''}`}
            onClick={() => onSelect(s.name)}
            aria-pressed={selected === s.name}
          >
            <span className="subject-icon">{s.icon}</span>
            <span className="subject-name">{s.display_name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
