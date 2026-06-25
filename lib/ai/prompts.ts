import { GradeBand, StudySubject, LanguageMode, LearningStyle } from '@/lib/types/supabase';

interface BaseContext {
  subject: StudySubject;
  gradeBand: GradeBand;
  languageMode: LanguageMode;
}

interface LessonContext extends BaseContext {
  topics: string[];
  learningStyle: LearningStyle | null;
  studyGoal: string | null;
  referenceTexts: string[];
}

interface PracticeContext extends LessonContext {
  practiceFormat: string | null;
  questionCount: number;
}

const LANGUAGE_INSTRUCTIONS: Record<LanguageMode, string> = {
  english: 'Respond entirely in English.',
  filipino: 'Respond entirely in Filipino (Tagalog). Use simple Filipino appropriate for the grade level.',
  mixed: 'Use mixed Filipino-English (Taglish) naturally, as a Filipino tutor would. Switch between languages for clarity.',
};

export function buildTopicSuggestionPrompt(ctx: BaseContext): string {
  return `You are a curriculum expert for Philippine DepEd education. 
${LANGUAGE_INSTRUCTIONS[ctx.languageMode]}

Suggest 8 to 10 specific, age-appropriate topics in ${ctx.subject} for a ${ctx.gradeBand} level student in the Philippines.

Return a JSON object with a single key "topics" containing an array of topic strings.
Example: { "topics": ["Fractions", "Decimals", "Ratios"] }

Topics should be specific and teachable as a single lesson. Do not return anything other than valid JSON.`;
}

export function buildLessonPrompt(ctx: LessonContext): string {
  const styleInstruction = ctx.learningStyle
    ? `The learner's preferred learning style is ${ctx.learningStyle}. Adapt explanations accordingly:
- visual: use vivid imagery, diagrams described in text, spatial organization
- auditory: use rhythm, repetition, explanatory dialogue
- reading_writing: use clear text structure, definitions, lists
- kinesthetic: use active examples, step-by-step processes, real-world applications`
    : 'Use balanced explanations suitable for all learning styles.';

  const referenceInstruction = ctx.referenceTexts.length > 0
    ? `The learner has provided the following reference material. Use it to tailor the lesson:\n${ctx.referenceTexts.map((t, i) => `[Reference ${i + 1}]: ${t}`).join('\n')}`
    : '';

  const goalInstruction = ctx.studyGoal
    ? `The learner's study goal is: ${ctx.studyGoal}. Adjust depth accordingly.`
    : '';

  return `You are a patient Filipino tutor creating a lesson.
${LANGUAGE_INSTRUCTIONS[ctx.languageMode]}
Subject: ${ctx.subject}
Topics: ${ctx.topics.join(', ')}
Grade Level: ${ctx.gradeBand}
${styleInstruction}
${goalInstruction}
${referenceInstruction}

Create a structured lesson covering ALL of the topics listed above. Return valid JSON with this shape:
{
  "overview": "A brief paragraph introducing the topics and why they matter",
  "keyTerms": [{ "term": "word", "definition": "explanation" }],
  "workedExamples": [{ "title": "Example name", "content": "Step-by-step walkthrough" }],
  "commonMistakes": [{ "mistake": "What learners often get wrong", "correction": "How to do it correctly" }],
  "recap": "2-3 sentences summarizing the key takeaways"
}

Keep content mobile-friendly: short paragraphs, clear headings. Return only valid JSON.`;
}

export function buildPracticePrompt(ctx: PracticeContext): string {
  const formatInstruction = ctx.practiceFormat
    ? `Question format: ${ctx.practiceFormat.replace(/_/g, ' ')}`
    : 'Mix of question formats.';

  const referenceInstruction = ctx.referenceTexts.length > 0
    ? `Base some questions on the learner's uploaded reference material:\n${ctx.referenceTexts.map((t, i) => `[Reference ${i + 1}]: ${t}`).join('\n')}`
    : '';

  return `You are a Filipino tutor creating practice questions.
${LANGUAGE_INSTRUCTIONS[ctx.languageMode]}
Subject: ${ctx.subject}
Topics: ${ctx.topics.join(', ')}
Grade Level: ${ctx.gradeBand}
${formatInstruction}
${referenceInstruction}

Generate ${ctx.questionCount} practice questions. Return a JSON array with this shape:
[{
  "type": "multiple_choice" | "short_answer" | "problem_solving",
  "prompt": "Question text",
  "options": [{ "label": "A", "text": "Option text" }] | null,
  "correctAnswer": "The correct answer or expected response",
  "acceptableAnswers": ["Alternative correct answers (for short_answer)"] | null,
  "explanation": "Why this answer is correct",
  "commonMistake": "A common error and why it's wrong"
}]

For multiple_choice: provide exactly 4 options. For short_answer and problem_solving: options must be null, include acceptableAnswers array.
Return only valid JSON.`;
}
