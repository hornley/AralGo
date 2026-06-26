'use client';

import { useState, useCallback } from 'react';
import { AppIcon } from '@/components/AppIcon';
import MathRenderer from '@/components/MathRenderer';
import styles from './quiz.module.css';

interface Question {
  type: string;
  prompt: string;
  options: { label: string; text: string }[] | null;
  correctAnswer: string;
  acceptableAnswers: string[] | null;
  explanation: string;
  commonMistake: string | null;
}

interface QuizViewProps {
  questions: Question[];
  subject: string;
  topic: string;
  onSubmit: (results: {
    questions: { prompt: string; type: string; userAnswer: string; correctAnswer: string; isCorrect: boolean; feedback?: string }[];
    score: number;
    total: number;
  }) => void;
  onBack: () => void;
}

export default function QuizView({ questions, subject, topic, onSubmit, onBack }: QuizViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const current = questions[currentIndex];
  const isMultipleChoice = current?.type === 'multiple_choice';
  const isLast = currentIndex === questions.length - 1;
  const progress = `${currentIndex + 1} of ${questions.length}`;

  const setAnswer = useCallback((value: string) => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: value }));
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, questions.length]);

  const handleBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);

    const results = await Promise.all(
      questions.map(async (q, i) => {
        const userAnswer = answers[i]?.trim() || '';

        if (q.type === 'multiple_choice') {
          let correctLabel = q.correctAnswer;
          if (q.options) {
            const matchByText = q.options.find(
              (opt) => opt.text.toLowerCase() === q.correctAnswer.toLowerCase()
            );
            if (matchByText) {
              correctLabel = matchByText.label;
            }
          }
          const isCorrect = userAnswer.toLowerCase() === correctLabel.toLowerCase();
          return {
            prompt: q.prompt,
            type: q.type,
            userAnswer,
            correctAnswer: correctLabel,
            isCorrect,
            options: q.options,
          };
        }

        try {
          const res = await fetch('/api/practice/grade', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: q.prompt,
              userAnswer,
              correctAnswer: q.correctAnswer,
              acceptableAnswers: q.acceptableAnswers,
            }),
          });
          const data = await res.json();
          return {
            prompt: q.prompt,
            type: q.type,
            userAnswer,
            correctAnswer: q.correctAnswer,
            isCorrect: data.isCorrect ?? false,
            feedback: data.feedback,
          };
        } catch {
          return {
            prompt: q.prompt,
            type: q.type,
            userAnswer,
            correctAnswer: q.correctAnswer,
            isCorrect: false,
            feedback: 'Grading failed.',
          };
        }
      }),
    );

    const total = results.length;
    const score = results.filter((r) => r.isCorrect).length;

    onSubmit({ questions: results, score, total });
  }, [questions, answers, onSubmit]);

  const hasAnswer = answers[currentIndex] !== undefined && answers[currentIndex].trim() !== '';

  return (
    <div className={styles.quizContainer}>
      <div className={styles.quizHeader}>
        <button className={styles.quizBackBtn} onClick={onBack}>
          <AppIcon name="arrow_back" />
        </button>
        <div className={styles.quizMeta}>
          <span className={styles.quizSubject}>{subject}</span>
          <span className={styles.quizTopic}>{topic}</span>
        </div>
        <span className={styles.quizProgress}>{progress}</span>
      </div>

      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className={styles.questionCard}>
        <div className={styles.questionNumber}>Question {currentIndex + 1}</div>
        <p className={styles.questionPrompt}>{current && <MathRenderer text={current.prompt} />}</p>

        {isMultipleChoice && current?.options ? (
          <div className={styles.optionsList}>
            {current.options.map((opt) => (
              <button
                key={opt.label}
                className={`${styles.optionBtn} ${answers[currentIndex] === opt.label ? styles.optionSelected : ''}`}
                onClick={() => setAnswer(opt.label)}
              >
                <span className={styles.optionLabel}>{opt.label}</span>
                <span className={styles.optionText}><MathRenderer text={opt.text} /></span>
                {answers[currentIndex] === opt.label && (
                  <AppIcon name="check_circle" className={styles.optionCheck} />
                )}
              </button>
            ))}
          </div>
        ) : current?.type === 'short_answer' ? (
          <input
            className={styles.textInput}
            type="text"
            placeholder="Type your answer..."
            value={answers[currentIndex] || ''}
            onChange={(e) => setAnswer(e.target.value)}
            autoFocus
          />
        ) : (
          <textarea
            className={styles.textArea}
            placeholder="Explain your answer..."
            value={answers[currentIndex] || ''}
            onChange={(e) => setAnswer(e.target.value)}
            rows={4}
            autoFocus
          />
        )}
      </div>

      <div className={styles.quizNav}>
        <button
          className={styles.navBtn}
          onClick={handleBack}
          disabled={currentIndex === 0}
        >
          <AppIcon name="arrow_back" />
          Back
        </button>

        {isLast ? (
          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Grading...' : 'Submit Answers'}
            {!submitting && <AppIcon name="check" />}
          </button>
        ) : (
          <button
            className={styles.navBtn}
            onClick={handleNext}
            disabled={!hasAnswer}
          >
            Next
            <AppIcon name="arrow_forward" />
          </button>
        )}
      </div>
    </div>
  );
}
