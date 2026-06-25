'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { listSubjects, type SubjectRow } from '@/lib/content/subjects';
import { listTopicsBySubject, type TopicRow } from '@/lib/content/topics';
import styles from './lessons.module.css';

export default function LessonsPage() {
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    listSubjects(supabase).then((data) => {
      setSubjects(data);
      setLoading(false);
    });
  }, []);

  const handleSubjectSelect = async (subjectId: number) => {
    setSelectedSubject(subjectId);
    setSelectedTopic(null);
    setLessons([]);
    const supabase = createClient();
    const data = await listTopicsBySubject(supabase, subjectId);
    setTopics(data);
  };

  const handleTopicSelect = async (topicName: string) => {
    setSelectedTopic(topicName);
    const supabase = createClient();
    const { data } = await supabase
      .from("generated_lessons")
      .select("id, topic, subject, created_at")
      .eq("subject", subjects.find((s) => s.id === selectedSubject)?.name.toLowerCase())
      .eq("topic", topicName)
      .order("created_at", { ascending: false });
    setLessons(data ?? []);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Lessons</h1>
        <p className={styles.subtitle}>Pick a subject and topic to study</p>
      </div>

      {loading ? (
        <p>Loading subjects...</p>
      ) : (
        <>
          <div className={styles.subjectGrid}>
            {subjects.map((subject) => (
              <button
                key={subject.id}
                className={`${styles.subjectCard} ${selectedSubject === subject.id ? styles.selected : ''}`}
                onClick={() => handleSubjectSelect(subject.id)}
              >
                <span className={`material-symbols-outlined ${styles.subjectIcon}`}>
                  {subject.icon}
                </span>
                <span className={styles.subjectName}>{subject.display_name}</span>
              </button>
            ))}
          </div>

          {selectedSubject && (
            <>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Topics</h2>
              </div>

              <div className={styles.topicGrid}>
                {topics.length === 0 ? (
                  <p>No topics available.</p>
                ) : (
                  topics.map((topic) => (
                    <button
                      key={topic.id}
                      className={`${styles.topicChip} ${selectedTopic === topic.name ? styles.selected : ''}`}
                      onClick={() => handleTopicSelect(topic.name)}
                    >
                      {topic.name}
                    </button>
                  ))
                )}
              </div>

              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Generated Lessons</h2>
              </div>

              {lessons.length > 0 ? (
                <div className={styles.lessonList}>
                  {lessons.map((lesson) => (
                    <Link key={lesson.id} href={`/lessons/${lesson.id}`} className={styles.lessonCard}>
                      <div className={styles.lessonInfo}>
                        <span className={styles.lessonTopic}>{lesson.topic}</span>
                        <span className={styles.lessonMeta}>
                          {new Date(lesson.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <span className={`material-symbols-outlined ${styles.lessonArrow}`}>chevron_right</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={`material-symbols-outlined ${styles.emptyIcon}`}>auto_stories</div>
                  <h3 className={styles.emptyTitle}>
                    {selectedTopic ? 'No lessons yet' : 'Select a topic'}
                  </h3>
                  <p className={styles.emptyText}>
                    {selectedTopic
                      ? 'Generate your first lesson for this topic'
                      : 'Pick a topic above to see existing lessons'}
                  </p>
                </div>
              )}

              <button className={styles.generateBtn} disabled={!selectedTopic}>
                <span className="material-symbols-outlined">auto_awesome</span>
                Generate New Lesson
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
