'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppIcon } from '@/components/AppIcon';
import styles from './practice.module.css';
import { createClient } from '@/lib/supabase/client';
import { loadStudySetup } from '@/lib/study/study-setup';
import { withRetry } from '@/lib/ai/with-retry';
import QuizView from '@/components/practice/QuizView';

interface Subject {
  id: number;
  name: string;
  display_name: string;
  icon: string;
  sort_order: number;
}

interface Topic {
  id: number;
  subject_id: number;
  name: string;
  grade_band: string;
  sort_order: number;
}

interface LearnerProfile {
  grade_band: string;
  preferred_subject: string;
  preferred_language_mode: string;
}

const FALLBACK_SUBJECTS = [
  { id: 1, name: 'mathematics', display_name: 'Mathematics', icon: 'calculate', sort_order: 1 },
  { id: 2, name: 'science', display_name: 'Science', icon: 'science', sort_order: 2 },
  { id: 3, name: 'english', display_name: 'English', icon: 'menu_book', sort_order: 3 },
  { id: 4, name: 'filipino', display_name: 'Filipino', icon: 'import_contacts', sort_order: 4 },
];

const FALLBACK_TOPICS: Record<string, Record<string, { id: number; name: string; sort_order: number }[]>> = {
  mathematics: {
    elementary: [
      { id: 1, name: 'Basic Arithmetic', sort_order: 1 },
      { id: 2, name: 'Shapes & Geometry', sort_order: 2 },
      { id: 3, name: 'Fractions & Decimals', sort_order: 3 },
      { id: 4, name: 'Measurement', sort_order: 4 },
    ],
    junior_high: [
      { id: 5, name: 'Algebra', sort_order: 5 },
      { id: 6, name: 'Geometry & Proofs', sort_order: 6 },
      { id: 7, name: 'Statistics & Probability', sort_order: 7 },
      { id: 8, name: 'Linear Equations', sort_order: 8 },
    ],
    senior_high: [
      { id: 9, name: 'Pre-Calculus', sort_order: 9 },
      { id: 10, name: 'Calculus', sort_order: 10 },
      { id: 11, name: 'Probability Distributions', sort_order: 11 },
      { id: 12, name: 'Business Math', sort_order: 12 },
    ],
    college_general: [
      { id: 25, name: 'Discrete Mathematics', sort_order: 1 },
      { id: 26, name: 'Linear Algebra', sort_order: 2 },
      { id: 27, name: 'Differential Equations', sort_order: 3 },
      { id: 28, name: 'Real Analysis', sort_order: 4 },
      { id: 29, name: 'Number Theory', sort_order: 5 },
    ],
  },
  science: {
    elementary: [
      { id: 13, name: 'Living Things', sort_order: 1 },
      { id: 14, name: 'Weather & Seasons', sort_order: 2 },
      { id: 15, name: 'Matter & Energy', sort_order: 3 },
      { id: 16, name: 'The Human Body', sort_order: 4 },
    ],
    junior_high: [
      { id: 17, name: 'Cells & Genetics', sort_order: 5 },
      { id: 18, name: 'Elements & Compounds', sort_order: 6 },
      { id: 19, name: 'Forces & Energy', sort_order: 7 },
      { id: 20, name: 'Earth Science', sort_order: 8 },
    ],
    senior_high: [
      { id: 21, name: 'General Biology', sort_order: 1 },
      { id: 22, name: 'General Chemistry', sort_order: 2 },
      { id: 23, name: 'General Physics', sort_order: 3 },
    ],
    college_general: [
      { id: 30, name: 'Organic Chemistry', sort_order: 1 },
      { id: 31, name: 'Biochemistry', sort_order: 2 },
      { id: 32, name: 'Quantum Mechanics', sort_order: 3 },
      { id: 33, name: 'Thermodynamics', sort_order: 4 },
      { id: 34, name: 'Ecology & Evolution', sort_order: 5 },
    ],
  },
  english: {
    elementary: [
      { id: 35, name: 'Alphabet & Phonics', sort_order: 1 },
      { id: 36, name: 'Reading Comprehension', sort_order: 2 },
      { id: 37, name: 'Vocabulary Building', sort_order: 3 },
      { id: 38, name: 'Basic Grammar', sort_order: 4 },
    ],
    junior_high: [
      { id: 39, name: 'Literature Analysis', sort_order: 1 },
      { id: 40, name: 'Essay Writing', sort_order: 2 },
      { id: 41, name: 'Grammar & Syntax', sort_order: 3 },
      { id: 42, name: 'Public Speaking', sort_order: 4 },
    ],
    senior_high: [
      { id: 43, name: 'World Literature', sort_order: 1 },
      { id: 44, name: 'Creative Writing', sort_order: 2 },
      { id: 45, name: 'Critical Analysis', sort_order: 3 },
    ],
    college_general: [
      { id: 46, name: 'Advanced Composition', sort_order: 1 },
      { id: 47, name: 'Linguistics', sort_order: 2 },
      { id: 48, name: 'Rhetoric & Argumentation', sort_order: 3 },
      { id: 49, name: 'Research Writing', sort_order: 4 },
    ],
  },
  filipino: {
    elementary: [
      { id: 50, name: 'Pagbasa at Pagsulat', sort_order: 1 },
      { id: 51, name: 'Wikang Filipino', sort_order: 2 },
      { id: 52, name: 'Panitikan', sort_order: 3 },
      { id: 53, name: 'Gramatika', sort_order: 4 },
    ],
    junior_high: [
      { id: 54, name: 'Maikling Kwento', sort_order: 1 },
      { id: 55, name: 'Sanaysay', sort_order: 2 },
      { id: 56, name: 'Tula at Tayutay', sort_order: 3 },
      { id: 57, name: 'Balita at Editoryal', sort_order: 4 },
    ],
    senior_high: [
      { id: 58, name: 'Pananaliksik', sort_order: 1 },
      { id: 59, name: 'Dula at Pelikula', sort_order: 2 },
      { id: 60, name: 'Retorika', sort_order: 3 },
    ],
    college_general: [
      { id: 61, name: 'Malikhaing Pagsulat', sort_order: 1 },
      { id: 62, name: 'Panitikang Rehiyonal', sort_order: 2 },
      { id: 63, name: 'Diskurso at Retorika', sort_order: 3 },
      { id: 64, name: 'Semantika at Pragmatika', sort_order: 4 },
    ],
  },
};

function PracticeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [selectedTopicIds, setSelectedTopicIds] = useState<number[]>([]);
  const [gradeBand, setGradeBand] = useState<string | null>(null);
  const [languageMode, setLanguageMode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [contextTopics, setContextTopics] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [mode, setMode] = useState<'config' | 'quiz'>('config');
  const [quizQuestions, setQuizQuestions] = useState<any[] | null>(null);
  const [autoSubject, setAutoSubject] = useState<string | null>(null);
  const [autoTopic, setAutoTopic] = useState<string | null>(null);

  const subjectParam = searchParams.get('subject');
  const autoParam = searchParams.get('auto');
  const topicParams = useRef(searchParams.getAll('topic'));
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (subjectParam) {
      setContextTopics(topicParams.current);
    }

    if (autoParam === '1') {
      try {
        const stored = sessionStorage.getItem('practice.autoData');
        if (stored) {
          const data = JSON.parse(stored);
          setQuizQuestions(data.questions);
          setAutoSubject(data.subject);
          setAutoTopic(data.topic);
          setMode('quiz');
          setLoading(false);
          sessionStorage.removeItem('practice.autoData');
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const localSetup = loadStudySetup();
        const [subjectsResult, profileResult] = await Promise.all([
          supabase.from('subjects').select('*').order('sort_order'),
          supabase.from('learner_profiles').select('*').maybeSingle(),
        ]);

        if (subjectsResult.error) throw subjectsResult.error;
        const rawSubjects = subjectsResult.data ?? [];
        const subjectsData = rawSubjects.length > 0 ? rawSubjects : FALLBACK_SUBJECTS;
        setSubjects(subjectsData);

        console.log('[practice] subjectsData:', subjectsData.length, 'items');
        console.log('[practice] rawSubjects from DB:', rawSubjects.length);

        const paramSubject = subjectParam
          ? subjectsData.find((s) => s.name === subjectParam)
          : null;

        console.log('[practice] paramSubject:', paramSubject?.name);
        console.log('[practice] profile:', profileResult.error ? 'error' : profileResult.data ? 'exists' : 'none');
        console.log('[practice] profile.preferred_subject:', (profileResult.data as LearnerProfile)?.preferred_subject);
        console.log('[practice] localSetup:', localSetup?.subject);

        if (paramSubject) {
          console.log('[practice] branch: paramSubject ->', paramSubject.name, paramSubject.id);
          setSelectedSubjectId(paramSubject.id);
          setNeedsOnboarding(false);

          if (!profileResult.error && profileResult.data) {
            const profile = profileResult.data as LearnerProfile;
            setGradeBand(profile.grade_band);
            setLanguageMode(profile.preferred_language_mode);
          } else if (localSetup) {
            setGradeBand(localSetup.gradeBand);
            setLanguageMode(localSetup.languageMode);
          }
          return;
        }

        if (!profileResult.error && profileResult.data) {
          const profile = profileResult.data as LearnerProfile;
          setGradeBand(profile.grade_band);
          setLanguageMode(profile.preferred_language_mode);

          const preferred = subjectsData.find(
            (s) => s.name === profile.preferred_subject
          );
          console.log('[practice] branch: profile exists, preferred_subject:', profile.preferred_subject, 'matched:', !!preferred);
          if (preferred) {
            setSelectedSubjectId(preferred.id);
            setNeedsOnboarding(false);
            return;
          }
          console.log('[practice] profile path: preferred_subject not matched, falling through');
        }

        if (localSetup) {
          setGradeBand(localSetup.gradeBand);
          setLanguageMode(localSetup.languageMode);
          const preferred = subjectsData.find(
            (subject) => subject.name === localSetup.subject,
          );
          console.log('[practice] branch: localStorage, subject:', localSetup.subject, 'matched:', !!preferred);
          if (preferred) {
            setSelectedSubjectId(preferred.id);
          }
          setNeedsOnboarding(false);
          return;
        }

        console.log('[practice] all lookups failed, subjectsData:', subjectsData.length,
          'selectedSubjectId:', selectedSubjectId);
        if (subjectsData.length > 0 && selectedSubjectId === null) {
          console.log('[practice] safety net: defaulting to first subject:', subjectsData[0].name);
          setSelectedSubjectId(subjectsData[0].id);
          setLanguageMode('english');
          setNeedsOnboarding(false);
          return;
        }

        setNeedsOnboarding(true);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [supabase, subjectParam]);

  useEffect(() => {
    if (selectedSubjectId === null || gradeBand === null) {
      console.log('[practice] loadTopics skip: selectedSubjectId', selectedSubjectId, 'gradeBand', gradeBand);
      return;
    }

    const gb: string = gradeBand;
    console.log('[practice] loadTopics fire: subject_id', selectedSubjectId, 'grade_band', gb);

    async function loadTopics() {
      try {
        console.log('[practice] loadTopics querying DB...');
        const { data, error } = await supabase
          .from('topics')
          .select('*')
          .eq('subject_id', selectedSubjectId)
          .eq('grade_band', gb)
          .order('sort_order');

        if (error) {
          console.log('[practice] loadTopics DB error:', error);
          throw error;
        }
        console.log('[practice] loadTopics DB result:', data?.length, 'rows');
        let topicsData = data ?? [];

        if (topicsData.length === 0) {
          console.log('[practice] loadTopics: DB returned 0 rows, trying fallback');
          const subjectName = FALLBACK_SUBJECTS.find(
            (s) => s.id === selectedSubjectId
          )?.name;
          const fallback = subjectName
            ? FALLBACK_TOPICS[subjectName]?.[gb]
            : null;
          console.log('[practice] loadTopics fallback: subjectName', subjectName, 'found', !!fallback);
          if (fallback) {
            topicsData = fallback.map((t) => ({
              ...t,
              subject_id: selectedSubjectId,
              grade_band: gb,
            }));
          }
        }

        console.log('[practice] loadTopics final:', topicsData.length, 'topics');

        setTopics(topicsData);

        const firstContextTopicName = topicParams.current[0];
        if (firstContextTopicName) {
          const matching = topicsData.find((t) => t.name === firstContextTopicName);
          if (matching) {
            setSelectedTopicIds([matching.id]);
            return;
          }
        }

        if (topicsData.length > 0) {
          setSelectedTopicIds([topicsData[0].id]);
        } else {
          setSelectedTopicIds([]);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load topics');
      }
    }

    loadTopics();
  }, [gradeBand, selectedSubjectId, supabase]);

  const handleSubjectSelect = useCallback((id: number) => {
    setSelectedSubjectId(id);
    setContextTopics([]);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!selectedSubjectId || !gradeBand) return;
    setGenerating(true);
    setGenerationError(null);

    const subject = subjects.find(s => s.id === selectedSubjectId);
    const selectedNames = selectedTopicIds
      .map(id => topics.find(t => t.id === id)?.name)
      .filter((n): n is string => !!n);
    const topicNames = contextTopics.length > 0 ? contextTopics : selectedNames;

    if (!subject || topicNames.length === 0) {
      setGenerationError('Please select a subject and at least one topic.');
      setGenerating(false);
      return;
    }

    const result = await withRetry(async () => {
      const res = await fetch('/api/practice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: subject.name,
            topics: topicNames,
            gradeBand,
            languageMode: languageMode || 'mixed',
          }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to generate practice');
      }
      return res.json();
    });

    if (!result.ok) {
      setGenerationError(result.error);
      setGenerating(false);
      return;
    }

    sessionStorage.setItem('practice.result', JSON.stringify(result.data));
    setQuizQuestions(result.data.questions);
    setMode('quiz');
  }, [selectedSubjectId, selectedTopicIds, gradeBand, languageMode, subjects, topics, contextTopics, router]);

  const handleQuizSubmit = useCallback(async (results: {
    questions: { prompt: string; type: string; userAnswer: string; correctAnswer: string; isCorrect: boolean; feedback?: string }[];
    score: number;
    total: number;
  }) => {
    const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);
    const selectedNames = selectedTopicIds
      .map(id => topics.find(t => t.id === id)?.name)
      .filter((n): n is string => !!n);
    const topicName = contextTopics.length > 0
      ? contextTopics[0]
      : selectedNames[0] || '';
    const resolvedSubject = selectedSubject?.name || autoSubject || '';
    const resolvedTopic = topicName || autoTopic || 'your next topic';

    sessionStorage.setItem('practice.quizResults', JSON.stringify(results.questions));

    await fetch('/api/practice/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: resolvedSubject,
        topic: resolvedTopic,
        gradeBand,
        questions: results.questions,
        score: results.score,
        total: results.total,
      }),
    });

    const params = new URLSearchParams();
    if (resolvedSubject) params.set('subject', resolvedSubject);
    params.set('topic', resolvedTopic);
    params.set('score', String(Math.round((results.score / results.total) * 100)));
    params.set('total', String(results.total));
    params.set('correct', String(results.score));
    params.set('time', '0');
    router.push(`/practice/results?${params.toString()}`);
  }, [selectedSubjectId, selectedTopicIds, gradeBand, subjects, topics, contextTopics, autoSubject, autoTopic, router]);

  if (loading) {
    return (
      <div className={styles.practiceContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>Practice Time</h1>
          <p className={styles.subtitle}>Loading your practice session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.practiceContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>Practice Time</h1>
          <p className={styles.subtitle}>Something went wrong: {error}</p>
        </div>
      </div>
    );
  }

  if (needsOnboarding) {
    return (
      <div className={styles.practiceContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>Practice Time</h1>
          <p className={styles.subtitle}>Set up your learner profile before generating practice.</p>
        </div>
        <Link href="/onboarding" className={styles.generateBtn}>
          Finish onboarding
        </Link>
      </div>
    );
  }

  if (mode === 'quiz' && quizQuestions) {
    const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);
    const selectedNames = selectedTopicIds
      .map(id => topics.find(t => t.id === id)?.name)
      .filter((n): n is string => !!n);
    const topicName = contextTopics.length > 0
      ? contextTopics[0]
      : selectedNames[0] || '';
    const resolvedSubject = selectedSubject?.display_name || selectedSubject?.name || autoSubject || '';
    const resolvedTopic = topicName || autoTopic || '';
    return (
      <div className={styles.practiceContainer}>
        <QuizView
          questions={quizQuestions}
          subject={resolvedSubject}
          topic={resolvedTopic}
          onSubmit={handleQuizSubmit}
          onBack={() => { setMode('config'); setQuizQuestions(null); setGenerationError(null); }}
        />
      </div>
    );
  }

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  return (
    <div className={styles.practiceContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Practice Time</h1>
        <p className={styles.subtitle}>Let&apos;s craft the perfect study session just for you.</p>
      </div>

      <div className={styles.configCard}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <AppIcon name="menu_book" />
            Subject
          </div>
          <div className={styles.pillGroup}>
            {subjects.map((subject) => (
              <button
                key={subject.id}
                className={`${styles.pill} ${selectedSubjectId === subject.id ? styles.active : ''}`}
                onClick={() => handleSubjectSelect(subject.id)}
              >
                <AppIcon name={subject.icon} />
                {' '}{subject.display_name}
              </button>
            ))}
          </div>
        </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <AppIcon name="topic" />
              Topics
            </div>
            {contextTopics.length > 0 && (
              <div className={styles.contextTopics}>
                {contextTopics.map((t) => (
                  <span key={t} className={styles.contextTopicChip}>
                    <AppIcon name="check" />
                    {t}
                  </span>
                ))}
              </div>
            )}
            {topics.length === 0 ? (
              <p className={styles.emptyText}>
                {selectedSubject ? 'No topics available' : 'Select a subject first'}
              </p>
            ) : (
              <div className={styles.pillGroup}>
                {topics.map((topic) => (
                  <button
                    key={topic.id}
                    className={`${styles.pill} ${selectedTopicIds.includes(topic.id) ? styles.active : ''}`}
                    onClick={() => {
                      setSelectedTopicIds((prev) =>
                        prev.includes(topic.id)
                          ? prev.filter((id) => id !== topic.id)
                          : [...prev, topic.id]
                      );
                    }}
                  >
                    {topic.name}
                  </button>
                ))}
              </div>
            )}
          </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <AppIcon name="show_chart" />
            Difficulty
          </div>
          <div className={styles.pillGroup}>
            <button className={styles.pill}>Easy</button>
            <button className={`${styles.pill} ${styles.active}`}>Medium</button>
            <button className={styles.pill}>Hard</button>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <AppIcon name="list_alt" />
            Format
          </div>
          <div className={styles.radioGroup}>
            <label className={`${styles.radioOption} ${styles.radioSelected}`}>
              Multiple Choice
              <div className={styles.radioCircle}>
                <AppIcon name="check" />
              </div>
            </label>
            <label className={styles.radioOption}>
              True / False
              <div className={styles.radioCircleEmpty}></div>
            </label>
          </div>
        </div>

        <div className={styles.tipBox}>
          <AppIcon name="lightbulb" />
          Tip: Mixing topics builds stronger recall
        </div>
      </div>

      {generationError && (
        <div className={styles.errorBox}>
          <span>{generationError}</span>
          <button onClick={handleGenerate} className={styles.retryBtn} disabled={generating}>
            Subukan muli / Try again
          </button>
        </div>
      )}
      <button onClick={handleGenerate} className={styles.generateBtn} disabled={generating}>
        {generating ? 'Generating...' : 'Generate Practice'}
      </button>
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense>
      <PracticeContent />
    </Suspense>
  );
}
