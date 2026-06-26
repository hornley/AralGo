type Locale = "en" | "fil";

const dict: Record<string, Record<Locale, string>> = {
  "grade.title": {
    en: "What's your grade level?",
    fil: "Ano ang iyong antas?",
  },
  "grade.subtitle": {
    en: "This helps us tailor your study plan.",
    fil: "Nakatutulong ito para maiangkop ang iyong pag-aaral.",
  },
  "grade.elementary": {
    en: "Elementary (Grades 1–6)",
    fil: "Elementarya (Baitang 1–6)",
  },
  "grade.junior": {
    en: "Junior High (Grades 7–10)",
    fil: "Junior High (Baitang 7–10)",
  },
  "grade.senior": {
    en: "Senior High (Grades 11–12)",
    fil: "Senior High (Baitang 11–12)",
  },
  "grade.college": {
    en: "College / General",
    fil: "Kolehiyo / Pangkalahatan",
  },
  "grade.sticky": {
    en: "You can always change this later in your settings!",
    fil: "Maaari mo itong baguhin sa iyong settings!",
  },
  "subject.title": {
    en: "Choose your focus subjects",
    fil: "Piliin ang iyong mga pokus na subject",
  },
  "subject.subtitle": {
    en: "These help AralGo personalize recommendations and shortcuts for you.",
    fil: "Ginagamit ito ng AralGo para iangkop ang mga rekomendasyon at shortcut para sa iyo.",
  },
  "subject.sticky": {
    en: "You can update these focus subjects later.",
    fil: "Maaari mo pang baguhin ang mga pokus na subject na ito mamaya.",
  },
  "goal.title": {
    en: "What are your study goals?",
    fil: "Ano ang iyong mga layunin?",
  },
  "goal.subtitle": {
    en: "Feel free to skip or choose one.",
    fil: "Puwede mong laktawan o pumili ng isa.",
  },
  "goal.catchup": {
    en: "Catching up in class",
    fil: "Habol sa klase",
  },
  "goal.review": {
    en: "Reviewing for exams",
    fil: "Nagre-review para sa exam",
  },
  "goal.learn": {
    en: "Just want to learn",
    fil: "Gusto ko lang matuto",
  },
  "common.next": {
    en: "Next",
    fil: "Susunod",
  },
  "common.finish": {
    en: "Finish",
    fil: "Tapos",
  },
  "common.skip": {
    en: "Skip for now",
    fil: "Laktawan muna",
  },
};

function toLocale(language: string | null): Locale {
  return language === "Filipino" ? "fil" : "en";
}

export function t(language: string | null, key: string): string {
  return dict[key]?.[toLocale(language)] ?? key;
}
