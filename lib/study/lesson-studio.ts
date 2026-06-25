import { StudySubject, LearningStyle, PracticeFormat, LessonStudioDraft, FileDraft } from '@/lib/types/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY = 'aralgo.lesson-studio';

export function loadDraft(): LessonStudioDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveDraft(draft: LessonStudioDraft): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // quota exceeded — silently ignore
  }
}

export function clearDraft(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function defaultDraft(): LessonStudioDraft {
  return {
    subject: null,
    topics: [],
    learningStyle: null,
    practiceFormat: null,
    files: [],
    step: 0,
  };
}

export async function fetchSubjects(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .order('sort_order');
  if (error) throw error;
  return data;
}

export async function fetchTopics(supabase: SupabaseClient, subjectId: number, gradeBand: string) {
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('subject_id', subjectId)
    .eq('grade_band', gradeBand)
    .order('sort_order');
  if (error) throw error;
  return data;
}

export async function fetchRecentLessons(supabase: SupabaseClient, learnerProfileId: string) {
  const { data, error } = await supabase
    .from('generated_lessons')
    .select('*')
    .eq('learner_profile_id', learnerProfileId)
    .order('created_at', { ascending: false })
    .limit(5);
  if (error) throw error;
  return data;
}
