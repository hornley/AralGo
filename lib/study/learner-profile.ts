export type GradeBand = "elementary" | "junior_high" | "senior_high";

export type LanguageMode = "english" | "filipino" | "mixed";

export type Subject = "mathematics" | "science" | "english" | "filipino";

export type StudyGoal = "catch_up" | "exam_review" | "self_study";

export type LearnerProfile = {
  displayName: string;
  gradeBand: GradeBand;
  languageMode: LanguageMode;
  subjects: Subject[];
  studyGoal?: StudyGoal | null;
  onboardingCompleted: boolean;
  createdAt: number;
};

const storageKey = "aralgo.learner-profile";

export const defaultLearnerProfile: LearnerProfile = {
  displayName: "",
  gradeBand: "junior_high",
  languageMode: "mixed",
  subjects: [],
  studyGoal: null,
  onboardingCompleted: false,
  createdAt: Date.now(),
};

export function loadLearnerProfile(): LearnerProfile | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as LearnerProfile;
    return parsed;
  } catch {
    return null;
  }
}

export function saveLearnerProfile(profile: LearnerProfile): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(profile));
}

export function isOnboardingComplete(): boolean {
  const profile = loadLearnerProfile();
  return profile !== null && profile.onboardingCompleted;
}

export const gradeLabels: Record<GradeBand, string> = {
  elementary: "Elementary",
  junior_high: "Junior High",
  senior_high: "Senior High",
};

export const languageLabels: Record<LanguageMode, string> = {
  english: "English",
  filipino: "Filipino",
  mixed: "Mixed",
};

export const subjectLabels: Record<Subject, string> = {
  mathematics: "Mathematics",
  science: "Science",
  english: "English",
  filipino: "Filipino",
};

export const goalLabels: Record<StudyGoal, string> = {
  catch_up: "Catching up in class",
  exam_review: "Reviewing for exams",
  self_study: "Just want to learn",
};

export const goalLabelsFilipino: Record<StudyGoal, string> = {
  catch_up: "Habol sa klase",
  exam_review: "Nagre-review para sa exam",
  self_study: "Gusto ko lang matuto",
};
