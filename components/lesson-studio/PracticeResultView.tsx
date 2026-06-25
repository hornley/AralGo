'use client';

interface PracticeQuestionView {
  type: string;
  prompt: string;
  options: { label: string; text: string }[] | null;
  correctAnswer: string;
  acceptableAnswers: string[] | null;
  explanation: string;
  commonMistake: string | null;
}

interface PracticeResultViewProps {
  questions: PracticeQuestionView[];
  onStartPractice: () => void;
}

export default function PracticeResultView({ questions, onStartPractice }: PracticeResultViewProps) {
  return (
    <div className="practice-result">
      <h3>Practice Quiz</h3>
      <p className="question-count">{questions.length} question{questions.length !== 1 ? 's' : ''}</p>
      <div className="question-preview-list">
        {questions.map((q, i) => (
          <div key={i} className="question-preview">
            <span className="q-number">{i + 1}.</span>
            <span className="q-type">{q.type.replace(/_/g, ' ')}</span>
            <p className="q-prompt">{q.prompt}</p>
          </div>
        ))}
      </div>
      <button className="start-practice-btn" onClick={onStartPractice}>
        Start Practice
      </button>
    </div>
  );
}
