import type { UIMessage } from 'ai';

export type ValidationReason = 'empty' | 'too_long' | 'language_mismatch' | 'off_topic';

export interface TutorValidationResult {
  valid: boolean;
  reason?: ValidationReason;
}

export const MAX_TUTORING_LENGTH = 4000;

const FILIPINO_MARKERS = [
  'ay', 'ang', 'ang mga', 'ng', 'mga', 'siya', 'kami', 'namin',
  'inyo', 'ko', 'mo', 'niya', 'atin', 'sila', 'tayo', 'nila',
  'kanila', 'kanya', 'dito', 'doon', 'saan', 'ano', 'bakit',
  'paano', 'sino', 'kailan', 'magkano', 'ilan', 'sana', 'para',
  'kasi', 'kung', 'kapag', 'upang', 'bilang', 'gawin', 'gawa',
  'sabi', 'alam', 'gusto', 'kailangan', 'maaari', 'pwede',
];

const ENGLISH_MARKERS = [
  'the', 'is', 'are', 'was', 'were', 'have', 'has', 'been',
  'will', 'would', 'could', 'should', 'this', 'that', 'these',
  'those', 'there', 'their', 'they', 'what', 'which', 'who',
  'whom', 'when', 'where', 'why', 'how', 'because', 'therefore',
  'however', 'although', 'meanwhile', 'furthermore', 'nevertheless',
  'additionally', 'consequently', 'accordingly',
];

const SUBJECT_KEYWORDS: Record<string, string[]> = {
  mathematics: ['math', 'number', 'equation', 'solve', 'calculate', 'graph', 'formula',
    'theorem', 'proof', 'angle', 'fraction', 'decimal', 'percentage', 'algebra',
    'geometry', 'trigonometry', 'calculus', 'statistics', 'probability',
    'matematika', 'bilang', 'ekwasyon', 'sukat', 'pigura', 'dayagram'],
  science: ['science', 'experiment', 'hypothesis', 'observation', 'theory', 'law',
    'cell', 'energy', 'force', 'motion', 'element', 'compound', 'reaction',
    'organism', 'ecosystem', 'evolution', 'gravity', 'magnet', 'electricity',
    'science', 'eksperimento', 'selula', 'enerhiya', 'puwersa', 'galaw'],
  english: ['english', 'read', 'write', 'grammar', 'vocabulary', 'essay', 'paragraph',
    'sentence', 'noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition',
    'conjunction', 'theme', 'plot', 'character', 'setting', 'summary',
    'ingles', 'basa', 'sulat', 'gramatika', 'talata', 'sanaysay'],
  filipino: ['filipino', 'tagalog', 'basa', 'sulat', 'salita', 'pangungusap',
    'talata', 'sanaysay', 'tula', 'kwento', 'nobela', 'tauhan', 'tagpuan',
    'banghay', 'simula', 'gitna', 'wakas', 'pang-uri', 'pang-abay',
    'panghalip', 'pandiwa', 'pangngalan', 'paksa', 'susing salita'],
};

function checkLanguageMatch(text: string, languageMode: string): boolean {
  if (languageMode === 'mixed') return true;

  const lower = text.toLowerCase();
  const wordCount = lower.split(/\s+/).length;
  if (wordCount < 3) return true;

  if (languageMode === 'filipino') {
    const matchCount = FILIPINO_MARKERS.filter(w => lower.includes(w)).length;
    return matchCount >= 2;
  }

  const matchCount = ENGLISH_MARKERS.filter(w => lower.includes(w)).length;
  return matchCount >= 2;
}

function checkTopicRelevance(text: string, topic: string | null | undefined, subject: string): boolean {
  const lower = text.toLowerCase();

  const subjectWords = SUBJECT_KEYWORDS[subject] ?? [];
  const hasSubjectSignal = subjectWords.some(w => lower.includes(w));

  if (!topic) return hasSubjectSignal;

  const topicWords = topic.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const hasTopicSignal = topicWords.length === 0 || topicWords.some(w => lower.includes(w));

  return hasTopicSignal || hasSubjectSignal;
}

export function validateTutorResponse(text: string, languageMode: string, subject: string, topic?: string | null): TutorValidationResult {
  if (!text.trim()) return { valid: false, reason: 'empty' };

  if (text.length > MAX_TUTORING_LENGTH) return { valid: false, reason: 'too_long' };

  if (!checkLanguageMatch(text, languageMode)) return { valid: false, reason: 'language_mismatch' };

  if (!checkTopicRelevance(text, topic, subject)) return { valid: false, reason: 'off_topic' };

  return { valid: true };
}

export const FALLBACK_MESSAGES: Record<ValidationReason, string> = {
  empty: 'Pasensya na, hindi ako naka-sagot nang maayos. Paki-subukan muli?',
  too_long: 'Ang sagot ko ay masyadong mahaba. Pasensya na. Subukan muli?',
  language_mismatch: 'Pasensya na, mali ang wika na ginamit ko. Subukan muli?',
  off_topic: 'Pasensya na, lumihis ako sa paksa. Subukan muli?',
};

export function extractTextFromUIMessage(msg: UIMessage): string {
  if (msg.parts && msg.parts.length > 0) {
    return msg.parts
      .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map(p => p.text)
      .join('');
  }
  return '';
}
