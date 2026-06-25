'use client';

import { useState, useEffect, useCallback } from 'react';
import { StudySubject, LearningStyle, PracticeFormat, LessonStudioDraft, FileDraft, LessonContent, GradeBand, LanguageMode } from '@/lib/types/supabase';
import { loadDraft, saveDraft, clearDraft, defaultDraft } from '@/lib/study/lesson-studio';
import SubjectPicker from './SubjectPicker';
import TopicSelector from './TopicSelector';
import PreferencePicker from './PreferencePicker';
import FileUploader from './FileUploader';
import GenerationProgress from './GenerationProgress';
import LessonResultView from './LessonResultView';
import PracticeResultView from './PracticeResultView';

const STEPS = ['Subject', 'Topics', 'Preferences', 'Files', 'Generate'];

interface LessonStudioWizardProps {
  subjects: { name: StudySubject; display_name: string; icon: string }[];
  initialSubject?: StudySubject;
  gradeBand: GradeBand;
  languageMode: LanguageMode;
}

export default function LessonStudioWizard({ subjects, initialSubject, gradeBand, languageMode }: LessonStudioWizardProps) {
  const [draft, setDraft] = useState<LessonStudioDraft>(defaultDraft);
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [genStage, setGenStage] = useState<'topics' | 'lesson' | 'practice' | null>(null);
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);
  const [practiceQuestions, setPracticeQuestions] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = loadDraft();
    if (saved) setDraft(saved);
    else if (initialSubject) setDraft((d) => ({ ...d, subject: initialSubject }));
  }, [initialSubject]);

  useEffect(() => {
    saveDraft(draft);
  }, [draft]);

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

  const handleSubjectSelect = (subject: StudySubject) => {
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
    } catch (e) {
      setError('Generation failed. Please try again.');
    } finally {
      setGenStage(null);
    }
  };

  const handleReset = () => {
    clearDraft();
    setDraft(defaultDraft());
    setSuggestedTopics([]);
    setLessonContent(null);
    setPracticeQuestions(null);
    setError(null);
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
        <div className="results-view">
          <LessonResultView content={lessonContent} />
          {practiceQuestions && (
            <PracticeResultView questions={practiceQuestions} onStartPractice={() => {}} />
          )}
          <button className="create-another-btn" onClick={handleReset}>Create Another</button>
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
          <div className="generate-step">
            <h2>Ready to create your lesson?</h2>
            {error && <p className="error-message">{error}</p>}
            <button className="generate-btn" onClick={handleGenerate} disabled={!canProceed(4)}>
              Generate Lesson & Practice
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="lesson-studio-wizard">
      {!lessonContent && !genStage && (
        <div className="step-indicator">
          {STEPS.map((s, i) => (
            <button
              key={s}
              className={`step-dot ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`}
              onClick={() => i < step && setDraft((d) => ({ ...d, step: i }))}
              disabled={i > step}
            >
              {s}
            </button>
          ))}
        </div>
      )}
      <div className="step-content">{renderStep()}</div>
      {!lessonContent && !genStage && step < 4 && (
        <div className="step-nav">
          {step > 0 && (
            <button className="nav-back" onClick={() => setDraft((d) => ({ ...d, step: step - 1 }))}>
              Back
            </button>
          )}
          <button
            className="nav-next"
            onClick={() => setDraft((d) => ({ ...d, step: step + 1 }))}
            disabled={!canProceed(step)}
          >
            {step === 3 ? 'Generate' : 'Next'}
          </button>
        </div>
      )}
    </div>
  );
}
