import type { StudySetupDraft } from '@/lib/study/study-setup';

type Subject = StudySetupDraft['subject'] | string | null | undefined;
type GradeBand = StudySetupDraft['gradeBand'] | string | null | undefined;

export function formatSubject(subject: Subject) {
  switch (subject) {
    case 'mathematics':
      return 'Mathematics';
    case 'science':
      return 'Science';
    case 'english':
      return 'English';
    case 'filipino':
      return 'Filipino';
    default:
      return 'General';
  }
}

export function formatGradeBand(gradeBand: GradeBand) {
  switch (gradeBand) {
    case 'elementary':
      return 'Elementary';
    case 'junior_high':
      return 'Junior High';
    case 'senior_high':
      return 'Senior High';
    case 'college_general':
      return 'College / General';
    default:
      return 'Learner';
  }
}
