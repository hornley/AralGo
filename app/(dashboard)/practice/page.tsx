'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './practice.module.css';
import { createClient } from '@/lib/supabase/client';

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

export default function PracticePage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [gradeBand, setGradeBand] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      try {
        const [subjectsResult, profileResult] = await Promise.all([
          supabase.from('subjects').select('*').order('sort_order'),
          supabase.from('learner_profiles').select('*').single(),
        ]);

        if (subjectsResult.error) throw subjectsResult.error;
        const subjectsData = subjectsResult.data ?? [];
        setSubjects(subjectsData);

        if (!profileResult.error && profileResult.data) {
          const profile = profileResult.data as LearnerProfile;
          setGradeBand(profile.grade_band);

          const preferred = subjectsData.find(
            (s) => s.name === profile.preferred_subject
          );
          if (preferred) {
            setSelectedSubjectId(preferred.id);
          }
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    if (selectedSubjectId === null || gradeBand === null) return;

    async function loadTopics() {
      try {
        const { data, error } = await supabase
          .from('topics')
          .select('*')
          .eq('subject_id', selectedSubjectId)
          .eq('grade_band', gradeBand)
          .order('sort_order');

        if (error) throw error;
        const topicsData = data ?? [];
        setTopics(topicsData);
        if (topicsData.length > 0) {
          setSelectedTopicId(topicsData[0].id);
        } else {
          setSelectedTopicId(null);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load topics');
      }
    }

    loadTopics();
  }, [selectedSubjectId, gradeBand]);

  const handleSubjectSelect = useCallback((id: number) => {
    setSelectedSubjectId(id);
  }, []);

  const handleGenerate = useCallback(() => {
    router.push('/practice/results?score=85&total=20&correct=17&time=165');
  }, [router]);

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
            <span className="material-symbols-outlined">menu_book</span>
            Subject
          </div>
          <div className={styles.pillGroup}>
            {subjects.map((subject) => (
              <button
                key={subject.id}
                className={`${styles.pill} ${selectedSubjectId === subject.id ? styles.active : ''}`}
                onClick={() => handleSubjectSelect(subject.id)}
              >
                <span className="material-symbols-outlined">{subject.icon}</span>
                {' '}{subject.display_name}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className="material-symbols-outlined">topic</span>
            Topic
          </div>
          <div className={styles.dropdownWrapper}>
            <select
              className={styles.dropdown}
              value={selectedTopicId ?? ''}
              onChange={(e) => setSelectedTopicId(Number(e.target.value))}
            >
              {topics.length === 0 ? (
                <option value="" disabled>
                  {selectedSubject ? 'No topics available' : 'Select a subject first'}
                </option>
              ) : (
                topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))
              )}
            </select>
            <span className={`material-symbols-outlined ${styles.dropdownIcon}`}>expand_more</span>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className="material-symbols-outlined">show_chart</span>
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
            <span className="material-symbols-outlined">list_alt</span>
            Format
          </div>
          <div className={styles.radioGroup}>
            <label className={`${styles.radioOption} ${styles.radioSelected}`}>
              Multiple Choice
              <div className={styles.radioCircle}>
                <span className="material-symbols-outlined">check</span>
              </div>
            </label>
            <label className={styles.radioOption}>
              True / False
              <div className={styles.radioCircleEmpty}></div>
            </label>
          </div>
        </div>

        <div className={styles.tipBox}>
          <span className="material-symbols-outlined">lightbulb</span>
          Tip: Mixing topics builds stronger recall 🧠
        </div>
      </div>

      <button onClick={handleGenerate} className={styles.generateBtn}>
        Generate Practice ✨
      </button>
    </div>
  );
}
