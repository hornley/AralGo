"use client";

import type { Subject } from "@/lib/study/learner-profile";
import { subjectLabels } from "@/lib/study/learner-profile";

const subjectEmojis: Record<Subject, string> = {
  mathematics: "\u{1F4CA}",
  science: "\u{1F52C}",
  english: "\u{1F4D6}",
  filipino: "\u{1F1F5}\u{1F1ED}",
};

type SubjectCardProps = {
  subject: Subject;
  selected: boolean;
  onSelect: (subject: Subject) => void;
};

export function SubjectCard({ subject, selected, onSelect }: SubjectCardProps) {
  return (
    <button
      className={`subject-card ${selected ? "selected" : ""}`}
      onClick={() => onSelect(subject)}
      type="button"
    >
      <span className="subject-card-emoji">{subjectEmojis[subject]}</span>
      <span className="subject-card-label">{subjectLabels[subject]}</span>
    </button>
  );
}
