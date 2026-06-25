export type StudySetupDraft = {
  displayName: string;
  gradeBand: "elementary" | "junior_high" | "senior_high" | "college_general";
  languageMode: "english" | "filipino" | "mixed";
  subject: "mathematics" | "science" | "english" | "filipino";
  topic: string;
  goal: "Habol" | "Review" | "Learn" | null;
  dailyGoalMinutes: number;
  recentTopics: RecentStudyTopic[];
};

export type RecentStudyTopic = {
  subject: StudySetupDraft["subject"];
  topic: string;
  languageMode: StudySetupDraft["languageMode"];
  gradeBand: StudySetupDraft["gradeBand"];
  status: "setup" | "active" | "completed" | "archived";
  savedAt: string;
};

export const studySetupStorageKey = "aralgo.study-setup";

export const defaultStudySetup: StudySetupDraft = {
  displayName: "",
  gradeBand: "junior_high",
  languageMode: "mixed",
  subject: "science",
  topic: "",
  goal: null,
  dailyGoalMinutes: 20,
  recentTopics: [],
};

export function loadStudySetup() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(studySetupStorageKey);
  if (!raw) {
    return null;
  }

  try {
    return normalizeStudySetup(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveStudySetup(draft: StudySetupDraft) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(studySetupStorageKey, JSON.stringify(draft));
  window.dispatchEvent(new Event("aralgo.study-setup-updated"));
}

export function normalizeStudySetup(value: unknown): StudySetupDraft | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const draft = value as Partial<Record<keyof StudySetupDraft, unknown>>;
  const gradeBand = isGradeBand(draft.gradeBand) ? draft.gradeBand : defaultStudySetup.gradeBand;
  const languageMode = isLanguageMode(draft.languageMode)
    ? draft.languageMode
    : defaultStudySetup.languageMode;
  const subject = isSubject(draft.subject) ? draft.subject : defaultStudySetup.subject;
  const goal = isGoal(draft.goal) ? draft.goal : defaultStudySetup.goal;
  const dailyGoalMinutes = normalizeDailyGoalMinutes(draft.dailyGoalMinutes, goal);
  const recentTopics = Array.isArray(draft.recentTopics)
    ? draft.recentTopics
        .map((topic) => normalizeRecentStudyTopic(topic))
        .filter((topic): topic is RecentStudyTopic => topic !== null)
    : [];

  return {
    displayName: typeof draft.displayName === "string" ? draft.displayName : "",
    gradeBand,
    languageMode,
    subject,
    topic: typeof draft.topic === "string" ? draft.topic : "",
    goal,
    dailyGoalMinutes,
    recentTopics,
  };
}

export function createRecentStudyTopic(
  draft: Pick<
    StudySetupDraft,
    "subject" | "topic" | "languageMode" | "gradeBand"
  >,
  options?: {
    savedAt?: string;
    status?: RecentStudyTopic["status"];
  },
): RecentStudyTopic {
  return {
    subject: draft.subject,
    topic: draft.topic.trim(),
    languageMode: draft.languageMode,
    gradeBand: draft.gradeBand,
    status: options?.status ?? "setup",
    savedAt: options?.savedAt ?? new Date().toISOString(),
  };
}

export function mergeRecentTopics(
  topics: RecentStudyTopic[],
  nextTopic: RecentStudyTopic | null,
) {
  const normalized = topics
    .map((topic) => normalizeRecentStudyTopic(topic))
    .filter((topic): topic is RecentStudyTopic => topic !== null);

  if (!nextTopic) {
    return normalized.slice(0, 5);
  }

  const deduped = normalized.filter(
    (topic) =>
      !(
        topic.subject === nextTopic.subject &&
        topic.topic.toLowerCase() === nextTopic.topic.toLowerCase() &&
        topic.gradeBand === nextTopic.gradeBand
      ),
  );

  return [nextTopic, ...deduped].slice(0, 5);
}

export function goalMinutesFromGoal(goal: StudySetupDraft["goal"]) {
  switch (goal) {
    case "Habol":
      return 45;
    case "Review":
      return 30;
    case "Learn":
      return 20;
    default:
      return defaultStudySetup.dailyGoalMinutes;
  }
}

function isGradeBand(value: unknown): value is StudySetupDraft["gradeBand"] {
  return (
    value === "elementary" ||
    value === "junior_high" ||
    value === "senior_high" ||
    value === "college_general"
  );
}

function isLanguageMode(value: unknown): value is StudySetupDraft["languageMode"] {
  return value === "english" || value === "filipino" || value === "mixed";
}

function isSubject(value: unknown): value is StudySetupDraft["subject"] {
  return value === "mathematics" || value === "science" || value === "english" || value === "filipino";
}

function isGoal(value: unknown): value is StudySetupDraft["goal"] {
  return value === "Habol" || value === "Review" || value === "Learn" || value === null;
}

function normalizeDailyGoalMinutes(value: unknown, goal: StudySetupDraft["goal"]) {
  if (typeof value === "number" && Number.isFinite(value) && value > 0 && value <= 180) {
    return Math.round(value);
  }

  return goalMinutesFromGoal(goal);
}

function normalizeRecentStudyTopic(value: unknown): RecentStudyTopic | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const topic = value as Partial<Record<keyof RecentStudyTopic, unknown>>;

  if (
    !isSubject(topic.subject) ||
    !isLanguageMode(topic.languageMode) ||
    !isGradeBand(topic.gradeBand) ||
    !isRecentTopicStatus(topic.status)
  ) {
    return null;
  }

  return {
    subject: topic.subject,
    topic: typeof topic.topic === "string" ? topic.topic : "",
    languageMode: topic.languageMode,
    gradeBand: topic.gradeBand,
    status: topic.status,
    savedAt: typeof topic.savedAt === "string" ? topic.savedAt : new Date().toISOString(),
  };
}

function isRecentTopicStatus(value: unknown): value is RecentStudyTopic["status"] {
  return value === "setup" || value === "active" || value === "completed" || value === "archived";
}
