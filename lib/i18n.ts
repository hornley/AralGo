import type { StudySetupDraft } from "@/lib/study/study-setup";

export type LanguageMode = StudySetupDraft["languageMode"];

type Locale = "en" | "fil" | "taglish";

const dict: Record<string, Record<Locale, string>> = {
  "common.next": {
    en: "Next",
    fil: "Susunod",
    taglish: "Next",
  },
  "common.finish": {
    en: "Finish",
    fil: "Tapos",
    taglish: "Finish",
  },
  "common.skip": {
    en: "Skip for now",
    fil: "Laktawan muna",
    taglish: "Skip muna",
  },
  "onboarding.language.title": {
    en: "Choose preferred mode",
    fil: "Piliin ang gustong wika",
    taglish: "Choose your preferred mode",
  },
  "onboarding.language.subtitle": {
    en: "Select the language you are most comfortable with.",
    fil: "Piliin ang wikang pinakakomportable ka.",
    taglish: "Piliin kung saan ka most comfortable.",
  },
  "onboarding.language.filipino": {
    en: "Filipino",
    fil: "Filipino",
    taglish: "Filipino",
  },
  "onboarding.language.english": {
    en: "English",
    fil: "Ingles",
    taglish: "English",
  },
  "onboarding.language.mixed": {
    en: "Taglish",
    fil: "Halo (Filipino-Ingles)",
    taglish: "Taglish",
  },
  "grade.title": {
    en: "What's your grade level?",
    fil: "Ano ang iyong antas?",
    taglish: "What's your grade level?",
  },
  "grade.subtitle": {
    en: "This helps us tailor your study plan.",
    fil: "Nakatutulong ito para maiangkop ang iyong pag-aaral.",
    taglish: "Para ma-customize namin ang study plan mo.",
  },
  "grade.elementary": {
    en: "Elementary (Grades 1-6)",
    fil: "Elementarya (Baitang 1-6)",
    taglish: "Elementary (Grades 1-6)",
  },
  "grade.junior": {
    en: "Junior High (Grades 7-10)",
    fil: "Junior High (Baitang 7-10)",
    taglish: "Junior High (Grades 7-10)",
  },
  "grade.senior": {
    en: "Senior High (Grades 11-12)",
    fil: "Senior High (Baitang 11-12)",
    taglish: "Senior High (Grades 11-12)",
  },
  "grade.college": {
    en: "College / General",
    fil: "Kolehiyo / Pangkalahatan",
    taglish: "College / General",
  },
  "grade.sticky": {
    en: "You can always change this later in your settings!",
    fil: "Maaari mo itong baguhin mamaya sa settings!",
    taglish: "Pwede mo itong baguhin later sa settings!",
  },
  "subject.title": {
    en: "Choose your focus subjects",
    fil: "Piliin ang mga pokus mong asignatura",
    taglish: "Choose your focus subjects",
  },
  "subject.subtitle": {
    en: "These help AralGo personalize recommendations and shortcuts for you.",
    fil: "Ginagamit ito ng AralGo para iangkop ang mga rekomendasyon at shortcut para sa iyo.",
    taglish: "Gagamitin ito ng AralGo para mas bagay ang recommendations at shortcuts sa iyo.",
  },
  "subject.mathematics": {
    en: "Mathematics",
    fil: "Matematika",
    taglish: "Math",
  },
  "subject.science": {
    en: "Science",
    fil: "Agham",
    taglish: "Science",
  },
  "subject.english": {
    en: "English",
    fil: "Ingles",
    taglish: "English",
  },
  "subject.filipino": {
    en: "Filipino",
    fil: "Filipino",
    taglish: "Filipino",
  },
  "subject.sticky": {
    en: "You can update these focus subjects later.",
    fil: "Maaari mo pang baguhin ang mga pokus na asignatura mamaya.",
    taglish: "Pwede mo pang i-update ang focus subjects later.",
  },
  "goal.title": {
    en: "What are your study goals?",
    fil: "Ano ang iyong mga layunin sa pag-aaral?",
    taglish: "What are your study goals?",
  },
  "goal.subtitle": {
    en: "Feel free to skip or choose one.",
    fil: "Maaari kang lumaktaw o pumili ng isa.",
    taglish: "Pwede kang mag-skip or pumili ng isa.",
  },
  "goal.catchup": {
    en: "Catching up in class",
    fil: "Humahabol sa klase",
    taglish: "Catching up sa class",
  },
  "goal.review": {
    en: "Reviewing for exams",
    fil: "Nagre-review para sa pagsusulit",
    taglish: "Reviewing for exams",
  },
  "goal.learn": {
    en: "Just want to learn",
    fil: "Gusto ko lang matuto",
    taglish: "Gusto ko lang matuto",
  },
  "summary.ready.title": {
    en: "You're all set!",
    fil: "Handa ka na!",
    taglish: "All set ka na!",
  },
  "summary.ready.subtitle": {
    en: "Your study profile is ready. Here's a quick look at what you chose.",
    fil: "Handa na ang iyong study profile. Narito ang mabilis na buod ng pinili mo.",
    taglish: "Ready na ang study profile mo. Quick look ito sa mga pinili mo.",
  },
  "summary.language": {
    en: "Language Mode",
    fil: "Wika",
    taglish: "Language Mode",
  },
  "summary.grade": {
    en: "Grade Level",
    fil: "Antas",
    taglish: "Grade Level",
  },
  "summary.subjects": {
    en: "Subjects",
    fil: "Mga asignatura",
    taglish: "Subjects",
  },
  "summary.goal": {
    en: "Study Goal",
    fil: "Layunin",
    taglish: "Study Goal",
  },
  "summary.none": {
    en: "None selected yet",
    fil: "Wala pang napili",
    taglish: "Wala pang selected",
  },
  "summary.defaultGoal": {
    en: "Learn something new",
    fil: "Matuto ng bago",
    taglish: "Learn something new",
  },
  "summary.createLesson": {
    en: "Create your first lesson",
    fil: "Gumawa ng unang lesson",
    taglish: "Create your first lesson",
  },
  "summary.dashboard": {
    en: "Head to Dashboard",
    fil: "Pumunta sa Dashboard",
    taglish: "Go to Dashboard",
  },
  "dashboard.home": {
    en: "Home",
    fil: "Home",
    taglish: "Home",
  },
  "dashboard.tutor": {
    en: "Tutor",
    fil: "Tutor",
    taglish: "Tutor",
  },
  "dashboard.practice": {
    en: "Practice",
    fil: "Practice",
    taglish: "Practice",
  },
  "dashboard.lessonStudio": {
    en: "Lesson Studio",
    fil: "Lesson Studio",
    taglish: "Lesson Studio",
  },
  "dashboard.history": {
    en: "History",
    fil: "Kasaysayan",
    taglish: "History",
  },
  "dashboard.profile": {
    en: "Profile",
    fil: "Profile",
    taglish: "Profile",
  },
  "dashboard.settings": {
    en: "Settings",
    fil: "Settings",
    taglish: "Settings",
  },
  "dashboard.help": {
    en: "Help",
    fil: "Tulong",
    taglish: "Help",
  },
  "dashboard.greeting.morning": {
    en: "Good morning",
    fil: "Magandang umaga",
    taglish: "Good morning",
  },
  "dashboard.greeting.afternoon": {
    en: "Good afternoon",
    fil: "Magandang hapon",
    taglish: "Good afternoon",
  },
  "dashboard.greeting.evening": {
    en: "Good evening",
    fil: "Magandang gabi",
    taglish: "Good evening",
  },
  "dashboard.learner": {
    en: "Learner",
    fil: "Mag-aaral",
    taglish: "Learner",
  },
  "dashboard.guest": {
    en: "Guest learner",
    fil: "Guest na mag-aaral",
    taglish: "Guest learner",
  },
  "home.recentTopics": {
    en: "Recent Topics",
    fil: "Mga Kamakailang Paksa",
    taglish: "Recent Topics",
  },
  "home.viewAll": {
    en: "View All",
    fil: "Tingnan Lahat",
    taglish: "View All",
  },
  "home.quickActions": {
    en: "Quick Actions",
    fil: "Mabilis na Aksyon",
    taglish: "Quick Actions",
  },
  "home.nextBestStep": {
    en: "Next Best Step",
    fil: "Susunod na Pinakamainam na Hakbang",
    taglish: "Next Best Step",
  },
  "home.noTopics": {
    en: "No saved topics yet",
    fil: "Wala pang naka-save na paksa",
    taglish: "Wala pang saved topics",
  },
  "home.noTopicsHint": {
    en: "Finish onboarding or start a session to build your history.",
    fil: "Tapusin ang onboarding o magsimula ng session para mabuo ang history mo.",
    taglish: "Tapusin ang onboarding or start a session para mabuo ang history mo.",
  },
  "home.continueSession": {
    en: "Continue session",
    fil: "Ipagpatuloy ang session",
    taglish: "Continue session",
  },
  "home.finishOnboarding": {
    en: "Finish onboarding",
    fil: "Tapusin ang onboarding",
    taglish: "Finish onboarding",
  },
  "home.createProfile": {
    en: "Create your learner profile first.",
    fil: "Gumawa muna ng learner profile.",
    taglish: "Create muna ng learner profile.",
  },
  "home.practiceNow": {
    en: "Practice now",
    fil: "Mag-practice ngayon",
    taglish: "Practice now",
  },
  "home.reviewHistory": {
    en: "Review history",
    fil: "Balikan ang history",
    taglish: "Review history",
  },
  "home.noPractice": {
    en: "No saved practice attempts yet.",
    fil: "Wala pang naka-save na practice attempts.",
    taglish: "Wala pang saved practice attempts.",
  },
  "home.updateProfile": {
    en: "Update profile",
    fil: "I-update ang profile",
    taglish: "Update profile",
  },
  "home.setPreferences": {
    en: "Set preferences",
    fil: "Itakda ang preferences",
    taglish: "Set preferences",
  },
  "home.adjustPreferences": {
    en: "Adjust language, grade, and subject.",
    fil: "Baguhin ang wika, antas, at asignatura.",
    taglish: "Adjust language, grade, and subject.",
  },
  "home.pickPreferences": {
    en: "Pick your language mode and grade band.",
    fil: "Piliin ang wika at antas mo.",
    taglish: "Pick your language mode and grade band.",
  },
  "home.studyBlocks": {
    en: "study blocks",
    fil: "study blocks",
    taglish: "study blocks",
  },
};

function toLocale(language: string | null | undefined): Locale {
  if (language === "Filipino" || language === "filipino") {
    return "fil";
  }

  if (language === "Mixed" || language === "Taglish" || language === "mixed") {
    return "taglish";
  }

  return "en";
}

export function normalizeLanguageMode(language: string | null | undefined): LanguageMode {
  if (language === "Filipino" || language === "filipino") {
    return "filipino";
  }

  if (language === "English" || language === "english") {
    return "english";
  }

  return "mixed";
}

export function languageModeLabel(language: string | null | undefined): string {
  return t(language, `onboarding.language.${normalizeLanguageMode(language) === "mixed" ? "mixed" : normalizeLanguageMode(language)}`);
}

export function t(language: string | null | undefined, key: string): string {
  return dict[key]?.[toLocale(language)] ?? dict[key]?.en ?? key;
}
