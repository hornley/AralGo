export type GradeBand = 'elementary' | 'junior_high' | 'senior_high' | 'college_general';
export type StudySubject = 'mathematics' | 'science' | 'english' | 'filipino';
export type LanguageMode = 'english' | 'filipino' | 'mixed';
export type LearningStyle = 'visual' | 'auditory' | 'reading_writing' | 'kinesthetic';
export type PracticeFormat = 'multiple_choice' | 'short_answer' | 'problem_solving' | 'mixed';

export interface LearnerProfile {
  id: string;
  user_id: string;
  display_name: string;
  grade_band: GradeBand | null;
  preferred_language_mode: LanguageMode | null;
  preferred_subject: StudySubject | null;
  preferred_subjects: StudySubject[] | null;
  learning_style: LearningStyle | null;
  preferred_practice_format: PracticeFormat | null;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: number;
  name: StudySubject;
  display_name: string;
  icon: string;
  sort_order: number;
}

export interface Topic {
  id: number;
  subject_id: number;
  name: string;
  grade_band: GradeBand;
  sort_order: number;
}

export interface GeneratedLesson {
  id: string;
  learner_profile_id: string;
  user_id: string;
  subject: StudySubject;
  topic: string;
  topics: string[] | null;
  grade_band: GradeBand;
  language_mode: LanguageMode;
  learning_style: string | null;
  study_goal: string | null;
  file_reference_ids: string[] | null;
  content_json: LessonContent;
  created_at: string;
}

export interface LessonContent {
  overview: string;
  keyTerms: { term: string; definition: string }[];
  workedExamples: { title: string; content: string }[];
  commonMistakes: { mistake: string; correction: string }[];
  recap: string;
}

export interface PracticeSet {
  id: string;
  learner_profile_id: string;
  user_id: string;
  generated_lesson_id: string | null;
  subject: StudySubject;
  topic: string;
  topics: string[] | null;
  difficulty: string;
  practice_format: string | null;
  grade_band: GradeBand | null;
  language_mode: LanguageMode;
  created_at: string;
}

export interface PracticeQuestion {
  id: string;
  practice_set_id: string;
  question_type: 'multiple_choice' | 'short_answer' | 'problem_solving';
  prompt: string;
  options_json: { label: string; text: string }[] | null;
  answer_key_json: { correctAnswer: string | string[]; acceptableAnswers?: string[] };
  explanation_json: { explanation: string; commonMistake?: string } | null;
  ordinal: number;
}

export interface UploadedReference {
  id: string;
  learner_profile_id: string;
  user_id: string;
  generated_lesson_id: string | null;
  file_path: string;
  file_type: 'image' | 'pdf' | 'text';
  file_name: string;
  file_size_bytes: number | null;
  extracted_text: string | null;
  created_at: string;
}

export interface LessonStudioDraft {
  subject: StudySubject | null;
  topics: string[];
  learningStyle: LearningStyle | null;
  practiceFormat: PracticeFormat | null;
  files: FileDraft[];
  step: number;
}

export interface FileDraft {
  id: string;
  name: string;
  type: string;
  size: number;
  uploaded: boolean;
  file_path: string | null;
}
