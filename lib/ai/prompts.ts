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

Keep content mobile-friendly: short paragraphs, clear headings. Return only valid JSON.

FORMATTING — For any mathematical expressions, formulas, or numbers with operators:
- Use LaTeX notation wrapped in $...$ for inline math (e.g., $E = mc^2$, $x + 5 = 12$)
- Use LaTeX notation wrapped in $$...$$ for display/block math (e.g., $$\\frac{a}{b} = \\frac{c}{d}$$)
- Always wrap ALL math expressions in $...$ even simple ones like $3 + 5 = 8$
- Write fractions as $\\frac{numerator}{denominator}$
- Write exponents with ^ like $x^2$ or $a^{b + c}$
- Write subscripts with _ like $x_1$ or $a_{ij}$
- Write square roots as $\\sqrt{x}$ or $\\sqrt[3]{x}$`;
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

For multiple_choice: provide exactly 4 options. correctAnswer MUST be the label letter (e.g. "B"), NOT the answer text.
For short_answer and problem_solving: options must be null, include acceptableAnswers array.

CRITICAL — Mathematical correctness is mandatory:
1. Solve every computational problem step-by-step in your internal reasoning (do NOT skip steps).
2. Verify each answer by substituting it back into the original equation or checking against the problem.
3. If verification fails, re-solve from scratch until it produces a consistent result.
4. Only then output the final correctAnswer.

Example verification: "Simplify: 3(x+4)-2(2x-1)"
   Step 1: 3(x+4) = 3x + 12
   Step 2: -2(2x-1) = -4x + 2
   Step 3: (3x+12) + (-4x+2) = -x + 14
   Check (x=0): LHS = 3(4) - 2(-1) = 12 + 2 = 14, RHS = -0 + 14 = 14 ✓

Return only valid JSON.

FORMATTING — For any mathematical expressions, formulas, or numbers with operators:
- Use LaTeX notation wrapped in $...$ for inline math (e.g., $E = mc^2$, $x + 5 = 12$)
- Use LaTeX notation wrapped in $$...$$ for display/block math
- Always wrap ALL math expressions in $...$ even simple ones like $3 + 5 = 8$
- Write fractions as $\\frac{numerator}{denominator}$
- Write exponents with ^ like $x^2$ or $a^{b + c}$
- Write subscripts with _ like $x_1$ or $a_{ij}$
- Write square roots as $\\sqrt{x}$ or $\\sqrt[3]{x}$
- For multiple choice options, wrap option text in $...$ if it contains math`;

}

export function buildVerificationPrompt(questions: {
  index: number;
  type: string;
  prompt: string;
  options: { label: string; text: string }[] | null;
  correctAnswer: string;
  acceptableAnswers: string[] | null;
}[], ctx: { subject: string; gradeBand: string }): string {
  const questionsJson = JSON.stringify(questions.map((q) => ({
    index: q.index,
    type: q.type,
    prompt: q.prompt,
    options: q.options,
    correctAnswer: q.correctAnswer,
    acceptableAnswers: q.acceptableAnswers,
  })), null, 2);

  return `You are a quality checker for educational quiz questions.
Subject: ${ctx.subject}
Grade Level: ${ctx.gradeBand}

Review each question below and verify the answer key is correct. For each question:

1. Solve the question yourself from scratch. Is the provided correctAnswer actually correct?
2. For multiple_choice: are any OTHER options ALSO correct? If so, the question is ambiguous — pick the single best answer.
3. For multiple_choice: does correctAnswer match one of the option labels (A, B, C, D)?
4. For short_answer / problem_solving: is the correctAnswer reasonable? Are the acceptableAnswers reasonable alternatives?

If the answer key has issues, fix it. If it's correct, return it unchanged.

Questions to verify:
${questionsJson}

Return a JSON object with a single key "verified" containing an array of corrected answer keys:
{
  "verified": [
    {
      "index": 0,
      "correctAnswer": "Fixed or unchanged correct answer",
      "acceptableAnswers": ["Alternative answers"] or null,
      "explanation": "Brief note on what was fixed (or 'Correct as is')"
    }
  ]
}`;
}
