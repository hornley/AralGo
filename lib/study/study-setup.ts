export type StudySetupDraft = {
  displayName: string;
  gradeBand: "elementary" | "junior_high" | "senior_high" | "college_general";
  languageMode: "english" | "filipino" | "mixed";
  subject: "mathematics" | "science" | "english" | "filipino";
  topic: string;
};

const storageKey = "aralgo.study-setup";

export const defaultStudySetup: StudySetupDraft = {
  displayName: "",
  gradeBand: "junior_high",
  languageMode: "mixed",
  subject: "science",
  topic: "",
};

export function loadStudySetup() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StudySetupDraft;
  } catch {
    return null;
  }
}

export function saveStudySetup(draft: StudySetupDraft) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(draft));
}
