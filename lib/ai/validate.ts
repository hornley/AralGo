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
  'po', 'opo', 'oo', 'hindi', 'wala', 'meron', 'mayroon',
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
    'matematika', 'bilang', 'ekwasyon', 'sukat', 'pigura', 'dayagram',
    'function', 'derivative', 'integral', 'variable', 'constant'],
  science: ['science', 'experiment', 'hypothesis', 'observation', 'theory', 'law',
    'cell', 'energy', 'force', 'motion', 'element', 'compound', 'reaction',
    'organism', 'ecosystem', 'evolution', 'gravity', 'magnet', 'electricity',
    'science', 'eksperimento', 'selula', 'enerhiya', 'puwersa', 'galaw',
    'atom', 'molecule', 'dna', 'protein', 'environment'],
  english: ['english', 'read', 'write', 'grammar', 'vocabulary', 'essay', 'paragraph',
    'sentence', 'noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition',
    'conjunction', 'theme', 'plot', 'character', 'setting', 'summary',
    'ingles', 'basa', 'sulat', 'gramatika', 'talata', 'sanaysay',
    'analyze', 'analysis', 'interpret', 'meaning', 'quote', 'passage',
    'author', 'style', 'tone', 'mood', 'imagery', 'metaphor', 'simile',
    'symbolism', 'contrast', 'compare', 'description', 'narrator',
    'perspective', 'context', 'evidence', 'argument', 'thesis',
    'literature', 'poem', 'novel', 'story', 'text', 'reading',
    'comprehension', 'infer', 'imply', 'suggest', 'convey'],
  filipino: ['filipino', 'tagalog', 'basa', 'sulat', 'salita', 'pangungusap',
    'talata', 'sanaysay', 'tula', 'kwento', 'nobela', 'tauhan', 'tagpuan',
    'banghay', 'simula', 'gitna', 'wakas', 'pang-uri', 'pang-abay',
    'panghalip', 'pandiwa', 'pangngalan', 'paksa', 'susing salita'],
};

function checkLanguageMatch(text: string, languageMode: string): boolean {
  if (languageMode === 'mixed') return true;

  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);
  const wordCount = words.length;
  if (wordCount < 5) return true;

  const filCount = FILIPINO_MARKERS.filter(w => lower.includes(w)).length;
  const engCount = ENGLISH_MARKERS.filter(w => lower.includes(w)).length;

  if (languageMode === 'filipino') {
    return filCount >= engCount;
  }

  return engCount >= filCount;
}

function checkTopicRelevance(text: string, topic: string | null | undefined, subject: string, userMessage?: string): boolean {
  const lower = text.toLowerCase();

  const subjectWords = SUBJECT_KEYWORDS[subject] ?? [];
  const hasSubjectSignal = subjectWords.some(w => lower.includes(w));

  if (hasSubjectSignal) return true;

  if (topic) {
    const topicWords = topic.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const hasTopicSignal = topicWords.some(w => lower.includes(w));
    if (hasTopicSignal) return true;
  }

  if (userMessage) {
    const userWords = userMessage.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const commonWords = userWords.filter(w => lower.includes(w));
    if (commonWords.length >= 1) return true;
  }

  if (!topic && !userMessage) return hasSubjectSignal;

  return true;
}

export function validateTutorResponse(text: string, languageMode: string, subject: string, topic?: string | null, userMessage?: string): TutorValidationResult {
  if (!text.trim()) return { valid: false, reason: 'empty' };

  if (text.length > MAX_TUTORING_LENGTH) return { valid: false, reason: 'too_long' };

  if (!checkLanguageMatch(text, languageMode)) return { valid: false, reason: 'language_mismatch' };

  if (!checkTopicRelevance(text, topic, subject, userMessage)) return { valid: false, reason: 'off_topic' };

  return { valid: true };
}

const FALLBACK_BY_LANGUAGE: Record<string, Record<ValidationReason, string>> = {
  english: {
    empty: 'Sorry, I wasn\'t able to respond properly. Please try again?',
    too_long: 'My response was too long. Sorry. Please try again?',
    language_mismatch: 'Sorry, I used the wrong language. Please try again?',
    off_topic: 'Sorry, I got off track. Please try again?',
  },
  filipino: {
    empty: 'Pasensya na, hindi ako naka-sagot nang maayos. Paki-subukan muli?',
    too_long: 'Ang sagot ko ay masyadong mahaba. Pasensya na. Subukan muli?',
    language_mismatch: 'Pasensya na, mali ang wika na ginamit ko. Subukan muli?',
    off_topic: 'Pasensya na, lumihis ako sa paksa. Subukan muli?',
  },
  mixed: {
    empty: 'Pasensya na, hindi ako naka-sagot nang maayos. Paki-subukan muli?',
    too_long: 'Ang sagot ko ay masyadong mahaba. Pasensya na. Subukan muli?',
    language_mismatch: 'Pasensya na, mali ang wika na ginamit ko. Subukan muli?',
    off_topic: 'Pasensya na, lumihis ako sa paksa. Subukan muli?',
  },
};

export function getFallbackMessage(reason: ValidationReason, languageMode: string): string {
  const messages = FALLBACK_BY_LANGUAGE[languageMode] ?? FALLBACK_BY_LANGUAGE.english;
  return messages[reason];
}

export function extractTextFromUIMessage(msg: UIMessage): string {
  if (msg.parts && msg.parts.length > 0) {
    return msg.parts
      .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map(p => p.text)
      .join('');
  }
  return '';
}
