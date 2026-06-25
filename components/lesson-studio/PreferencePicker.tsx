'use client';

import { LearningStyle, PracticeFormat } from '@/lib/types/supabase';

interface PreferencePickerProps {
  learningStyle: LearningStyle | null;
  onLearningStyleChange: (style: LearningStyle) => void;
  practiceFormat: PracticeFormat | null;
  onPracticeFormatChange: (format: PracticeFormat) => void;
}

const LEARNING_STYLES: { value: LearningStyle; label: string; desc: string }[] = [
  { value: 'visual', label: 'Visual', desc: 'Diagrams, images, spatial' },
  { value: 'auditory', label: 'Auditory', desc: 'Explanations, dialogue' },
  { value: 'reading_writing', label: 'Reading & Writing', desc: 'Text, lists, definitions' },
  { value: 'kinesthetic', label: 'Kinesthetic', desc: 'Examples, step-by-step' },
];

const PRACTICE_FORMATS: { value: PracticeFormat; label: string }[] = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'problem_solving', label: 'Problem Solving' },
  { value: 'mixed', label: 'Mixed' },
];

export default function PreferencePicker({
  learningStyle,
  onLearningStyleChange,
  practiceFormat,
  onPracticeFormatChange,
}: PreferencePickerProps) {
  return (
    <div className="preference-picker">
      <div className="pref-section">
        <h2>How do you learn best?</h2>
        <div className="chip-group">
          {LEARNING_STYLES.map((s) => (
            <button
              key={s.value}
              className={`chip ${learningStyle === s.value ? 'selected' : ''}`}
              onClick={() => onLearningStyleChange(s.value)}
              aria-pressed={learningStyle === s.value}
              title={s.desc}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <div className="pref-section">
        <h2>What kind of practice?</h2>
        <div className="chip-group">
          {PRACTICE_FORMATS.map((f) => (
            <button
              key={f.value}
              className={`chip ${practiceFormat === f.value ? 'selected' : ''}`}
              onClick={() => onPracticeFormatChange(f.value)}
              aria-pressed={practiceFormat === f.value}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
