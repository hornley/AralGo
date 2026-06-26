'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AppIcon } from '@/components/AppIcon';
import { StudySubject, LearningStyle, PracticeFormat, LessonStudioDraft, FileDraft, LessonContent, GradeBand, LanguageMode, SavedLesson } from '@/lib/types/supabase';
import { loadDraft, saveDraft, clearDraft, defaultDraft, saveLesson, loadSavedLessons, deleteSavedLesson } from '@/lib/study/lesson-studio';
import SubjectPicker from './SubjectPicker';
import TopicSelector from './TopicSelector';
import PreferencePicker from './PreferencePicker';
import FileUploader from './FileUploader';
import GenerationProgress from './GenerationProgress';
import LessonResultView from './LessonResultView';
import PracticeResultView from './PracticeResultView';
import styles from '../../app/lesson-studio/lesson-studio.module.css';

const STEPS = ['Subject', 'Topics', 'Preferences', 'Files', 'Generate'];
const STEP_ICONS: Record<string, string> = {
  Subject: 'book_2',
  Topics: 'lightbulb',
  Preferences: 'tune',
  Files: 'attachment',
  Generate: 'auto_stories',
};

interface LessonStudioWizardProps {
  subjects: { name: StudySubject; display_name: string; icon: string }[];
  initialSubject?: StudySubject;
  preferredSubjects: StudySubject[];
  gradeBand: GradeBand;
  languageMode: LanguageMode;
}

export default function LessonStudioWizard({ subjects, initialSubject, preferredSubjects, gradeBand, languageMode }: LessonStudioWizardProps) {
  const router = useRouter();
  const defaultSubject = initialSubject ?? preferredSubjects[0] ?? null;
  const buildDefaultDraft = useCallback((): LessonStudioDraft => ({
    ...defaultDraft(),
    subject: defaultSubject,
    step: defaultSubject ? 1 : 0,
  }), [defaultSubject]);
  const [draft, setDraft] = useState<LessonStudioDraft>(() => {
    if (initialSubject) {
      return {
        ...defaultDraft(),
        subject: initialSubject,
        step: 1,
      };
    }

    const saved = loadDraft();
    if (saved) {
      return {
        ...saved,
        step: saved.step >= 4 ? (saved.subject ? 1 : 0) : saved.step,
      };
    }

    return buildDefaultDraft();
  });
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [genStage, setGenStage] = useState<'topics' | 'lesson' | 'practice' | null>(null);
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);
  const [practiceQuestions, setPracticeQuestions] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedLessons, setSavedLessons] = useState<SavedLesson[]>(() => loadSavedLessons());
  const [showSavedView, setShowSavedView] = useState(false);
  const [sourceIsSaved, setSourceIsSaved] = useState(false);
  const pendingSaveRef = useRef<SavedLesson | null>(null);
  const savedIdRef = useRef(new Set<string>());
  const prefetchedSubjectRef = useRef<StudySubject | null>(null);

  const suggestTopics = useCallback(async (subject: StudySubject) => {
    setTopicsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/topics/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, gradeBand, languageMode }),
      });
      if (!res.ok) throw new Error('Failed to suggest topics');
      const data = await res.json();
      setSuggestedTopics(data.topics || []);
    } catch (e) {
      setError('Could not load topic suggestions. Please type your topics manually.');
      setSuggestedTopics([]);
    } finally {
      setTopicsLoading(false);
    }
  }, [gradeBand, languageMode]);

  useEffect(() => {
    saveDraft(draft);
  }, [draft]);

  useEffect(() => {
    if (!draft.subject || prefetchedSubjectRef.current === draft.subject) {
      return;
    }

    prefetchedSubjectRef.current = draft.subject;
    suggestTopics(draft.subject);
  }, [draft.subject, suggestTopics]);

  const handleSubjectSelect = (subject: StudySubject) => {
    prefetchedSubjectRef.current = subject;
    setDraft((d) => ({ ...d, subject, topics: [] }));
    suggestTopics(subject);
  };

  const handleTopicToggle = (topic: string) => {
    setDraft((d) => ({
      ...d,
      topics: d.topics.includes(topic) ? d.topics.filter((t) => t !== topic) : [...d.topics, topic],
    }));
  };

  const handleAddCustomTopic = (topic: string) => {
    setDraft((d) => ({ ...d, topics: [...d.topics, topic] }));
  };

  const handleLearningStyleChange = (style: LearningStyle) => {
    setDraft((d) => ({ ...d, learningStyle: style }));
  };

  const handlePracticeFormatChange = (format: PracticeFormat) => {
    setDraft((d) => ({ ...d, practiceFormat: format }));
  };

  const handleFileAdd = (file: File) => {
    const fileDraft: FileDraft = {
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type,
      size: file.size,
      uploaded: false,
      file_path: null,
    };
    setDraft((d) => ({ ...d, files: [...d.files, fileDraft] }));
    uploadFile(file, fileDraft.id);
  };

  const uploadFile = async (file: File, draftId: string) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setDraft((d) => ({
        ...d,
        files: d.files.map((f) => f.id === draftId ? { ...f, uploaded: true, file_path: data.reference.file_path } : f),
      }));
    } catch {
      setDraft((d) => ({
        ...d,
        files: d.files.filter((f) => f.id !== draftId),
      }));
    } finally {
      setUploading(false);
    }
  };

  const handleFileRemove = (id: string) => {
    setDraft((d) => ({ ...d, files: d.files.filter((f) => f.id !== id) }));
  };

  const handleGenerate = async () => {
    setError(null);
    setGenStage('lesson');
    try {
      const lessonRes = await fetch('/api/lessons/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: draft.subject,
          topics: draft.topics,
          gradeBand,
          languageMode,
          learningStyle: draft.learningStyle,
          studyGoal: null,
          referenceTexts: [],
        }),
      });
      if (!lessonRes.ok) throw new Error('Lesson generation failed');
      const lessonData = await lessonRes.json();
      setLessonContent(lessonData.content);

      // Save lesson immediately (even before practice)
      const lessonOnly: SavedLesson = {
        id: crypto.randomUUID(),
        subject: draft.subject!,
        topics: draft.topics,
        gradeBand,
        languageMode,
        lessonContent: lessonData.content,
        practiceQuestions: [],
        createdAt: new Date().toISOString(),
      };
      pendingSaveRef.current = lessonOnly;
      savedIdRef.current.add(lessonOnly.id);
      saveLesson(lessonOnly);
      setSavedLessons(loadSavedLessons());

      setGenStage('practice');
      const practiceRes = await fetch('/api/practice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: draft.subject,
          topics: draft.topics,
          gradeBand,
          languageMode,
          learningStyle: draft.learningStyle,
          studyGoal: null,
          practiceFormat: draft.practiceFormat,
          questionCount: 5,
          referenceTexts: [],
          generatedLessonId: lessonData.lesson?.id,
        }),
      });
      if (!practiceRes.ok) throw new Error('Practice generation failed');
      const practiceData = await practiceRes.json();
      setPracticeQuestions(practiceData.questions);

      // Update saved lesson with practice questions
      if (pendingSaveRef.current) {
        const updated = {
          ...pendingSaveRef.current,
          practiceQuestions: practiceData.questions,
        };
        saveLesson(updated);
        setSavedLessons(loadSavedLessons());
        pendingSaveRef.current = null;
      }
      setSourceIsSaved(false);
    } catch (e) {
      setError('Generation failed. Please try again.');
    } finally {
      setGenStage(null);
    }
  };

  const handleReset = () => {
    clearDraft();
    prefetchedSubjectRef.current = null;
    setDraft(buildDefaultDraft());
    setSuggestedTopics([]);
    setLessonContent(null);
    setPracticeQuestions(null);
    setError(null);
    setShowSavedView(false);
    setSourceIsSaved(false);
    pendingSaveRef.current = null;
  };

  const handleViewSaved = (saved: SavedLesson) => {
    setShowSavedView(false);
    setSourceIsSaved(true);
    setLessonContent(saved.lessonContent);
    setPracticeQuestions(saved.practiceQuestions);
  };

  const handleBackToSavedList = () => {
    setLessonContent(null);
    setPracticeQuestions(null);
    setShowSavedView(true);
    setSourceIsSaved(false);
  };

  const canProceed = (step: number): boolean => {
    switch (step) {
      case 0: return draft.subject !== null;
      case 1: return draft.topics.length > 0;
      case 2: return true;
      case 3: return true;
      case 4: return draft.subject !== null && draft.topics.length > 0;
      default: return false;
    }
  };

  const step = genStage !== null ? 4 : (lessonContent ? 5 : draft.step);

  const renderStep = () => {
    if (lessonContent) {
      return (
        <div className={styles.resultsView}>
          {sourceIsSaved && (
            <button className={styles.navBack} onClick={handleBackToSavedList} style={{ alignSelf: 'flex-start', marginBottom: 8 }}>
              <AppIcon name="arrow_back" />
              Saved lessons
            </button>
          )}
          <LessonResultView content={lessonContent} />
          {practiceQuestions && (
            <PracticeResultView questions={practiceQuestions} onStartPractice={() => {}} />
          )}
          <div className={styles.actionButtons}>
            <button className={styles.createAnotherBtn} onClick={handleReset}>
              <AppIcon name="add" />
              Create Another
            </button>
            <button className={styles.createAnotherBtn} onClick={() => router.push('/home')}>
              <AppIcon name="home" />
              Back to Dashboard
            </button>
          </div>
        </div>
      );
    }
    if (genStage) {
      return <GenerationProgress stage={genStage} />;
    }
    switch (step) {
      case 0:
        return (
          <SubjectPicker
            availableSubjects={subjects}
            preferredSubjects={preferredSubjects}
            selected={draft.subject}
            onSelect={handleSubjectSelect}
          />
        );
      case 1:
        return (
          <TopicSelector
            suggestedTopics={suggestedTopics}
            selectedTopics={draft.topics}
            onToggle={handleTopicToggle}
            onAddCustom={handleAddCustomTopic}
            loading={topicsLoading}
          />
        );
      case 2:
        return (
          <PreferencePicker
            learningStyle={draft.learningStyle}
            onLearningStyleChange={handleLearningStyleChange}
            practiceFormat={draft.practiceFormat}
            onPracticeFormatChange={handlePracticeFormatChange}
          />
        );
      case 3:
        return (
          <FileUploader
            files={draft.files}
            onAdd={handleFileAdd}
            onRemove={handleFileRemove}
            uploading={uploading}
          />
        );
      case 4:
        return (
          <div className={styles.generateStep}>
            <h2>Ready to create your lesson?</h2>
            <p className={styles.generateDesc}>
              We&apos;ll generate a lesson and practice quiz for{' '}
              <strong>{draft.subject}</strong> on{' '}
              <strong>{draft.topics.join(', ')}</strong>.
            </p>
            {error && <p className={styles.errorMessage}>{error}</p>}
            <button className={styles.generateBtn} onClick={handleGenerate} disabled={!canProceed(4)}>
              <AppIcon name="auto_stories" />
              Generate Lesson & Practice
            </button>
            <div className={styles.generateSummary}>
              <div className={styles.generateSummaryItem}>
                <span className={styles.generateSummaryLabel}>Subject</span>
                <span className={styles.generateSummaryValue}>{draft.subject}</span>
              </div>
              <div className={styles.generateSummaryItem}>
                <span className={styles.generateSummaryLabel}>Topics</span>
                <span className={styles.generateSummaryValue}>{draft.topics.length}</span>
              </div>
              <div className={styles.generateSummaryItem}>
                <span className={styles.generateSummaryLabel}>Files</span>
                <span className={styles.generateSummaryValue}>{draft.files.length}</span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderSavedView = () => (
    <div>
      <h2>Your saved lessons</h2>
      <p className={styles.subtitle}>Click any lesson to view it again without regenerating.</p>
      {savedLessons.length === 0 ? (
        <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 14 }}>No saved lessons yet.</p>
      ) : (
        <div className={styles.savedLessonList}>
          {savedLessons.map((sl) => (
            <div
              key={sl.id}
              className={styles.savedLessonItem}
              onClick={() => handleViewSaved(sl)}
            >
              <AppIcon
                name={subjects.find((s) => s.name === sl.subject)?.icon || 'menu_book'}
                className={styles.savedLessonIcon}
                data-subject={sl.subject}
              />
              <div className={styles.savedLessonInfo}>
                <div className={styles.savedLessonSubject}>
                  {subjects.find((s) => s.name === sl.subject)?.display_name || sl.subject}
                </div>
                <div className={styles.savedLessonTopics}>{sl.topics.join(', ')}</div>
              </div>
              <div className={styles.savedLessonMeta}>
                {new Date(sl.createdAt).toLocaleDateString()}
                <button
                  className={styles.savedLessonDelete}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSavedLesson(sl.id);
                    setSavedLessons(loadSavedLessons());
                  }}
                >
                  <AppIcon name="delete" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <button className={styles.createAnotherBtn} onClick={() => setShowSavedView(false)} style={{ marginTop: 20 }}>
        <AppIcon name="add" />
        Create a new lesson
      </button>
    </div>
  );

  return (
    <div>
      {!genStage && !showSavedView && (
        <div className={styles.stepIndicator}>
          {STEPS.map((s, i) => (
            <button
              key={s}
              className={`${styles.stepTab} ${i === step ? styles.active : ''} ${i < step || lessonContent ? styles.completed : ''}`}
              onClick={() => !lessonContent && i < step && setDraft((d) => ({ ...d, step: i }))}
            disabled={!!lessonContent || i > step}
          >
            <AppIcon name={STEP_ICONS[s]} className={styles.icon} />
            {s}
          </button>
        ))}
        <button
          className={`${styles.stepTab} ${styles.savedTab} ${savedLessons.length === 0 ? styles.savedTabEmpty : ''}`}
          onClick={() => setShowSavedView(true)}
        >
          <AppIcon name="folder" />
          Saved{savedLessons.length > 0 ? ` (${savedLessons.length})` : ''}
        </button>
        </div>
      )}
      <div className={styles.stepContent}>
        {showSavedView ? renderSavedView() : renderStep()}
      </div>
      {!lessonContent && !genStage && !showSavedView && step < 4 && (
        <div className={styles.stepNav}>
          {step > 0 && (
            <button className={styles.navBack} onClick={() => setDraft((d) => ({ ...d, step: step - 1 }))}>
              <AppIcon name="arrow_back" />
              Back
            </button>
          )}
          <button
            className={styles.navNext}
            onClick={() => setDraft((d) => ({ ...d, step: step + 1 }))}
            disabled={!canProceed(step)}
          >
            {step === 3 ? 'Generate' : 'Next'}
            <AppIcon name="arrow_forward" />
          </button>
        </div>
      )}
    </div>
  );
}
