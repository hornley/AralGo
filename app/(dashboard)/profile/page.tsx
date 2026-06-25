'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { AppIcon } from '@/components/AppIcon';
import { createClient } from '@/lib/supabase/client';
import {
  goalMinutesFromGoal,
  loadStudySetup,
  mergeRecentTopics,
  saveStudySetup,
  type StudySetupDraft,
} from '@/lib/study/study-setup';
import styles from './profile.module.css';

const displayToDbLanguage: Record<string, string> = {
  English: 'english',
  Filipino: 'filipino',
  Mixed: 'mixed',
};

const dbToDisplayLanguage: Record<string, string> = {
  english: 'English',
  filipino: 'Filipino',
  mixed: 'Mixed',
};

const displayToDbGrade: Record<string, string> = {
  Elementary: 'elementary',
  'Junior High': 'junior_high',
  'Senior High': 'senior_high',
  College: 'college_general',
};

const dbToDisplayGrade: Record<string, string> = {
  elementary: 'Elementary',
  junior_high: 'Junior High',
  senior_high: 'Senior High',
  college_general: 'College',
};

const displayToDbSubject: Record<string, string> = {
  Mathematics: 'mathematics',
  Science: 'science',
  English: 'english',
  Filipino: 'filipino',
};

const dbToDisplaySubject: Record<string, string> = {
  mathematics: 'Mathematics',
  science: 'Science',
  english: 'English',
  filipino: 'Filipino',
};

export default function ProfilePage() {
  const supabase = useMemo(() => createClient(), []);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState('English');
  const [gradeLevel, setGradeLevel] = useState('Junior High');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [goal, setGoal] = useState('Review');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      const localSetup = loadStudySetup();

      if (localSetup) {
        setName(localSetup.displayName);
        setLanguage(dbToDisplayLanguage[localSetup.languageMode]);
        setGradeLevel(dbToDisplayGrade[localSetup.gradeBand]);
        setSubjects([dbToDisplaySubject[localSetup.subject]]);
        if (localSetup.goal) setGoal(localSetup.goal);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setEmail(user.email ?? '');
      setName(user.user_metadata?.display_name ?? user.email ?? '');

      const { data: profile } = await supabase
        .from('learner_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile) {
        if (profile.display_name) setName(profile.display_name);
        if (profile.preferred_language_mode) setLanguage(dbToDisplayLanguage[profile.preferred_language_mode] ?? 'English');
        if (profile.grade_band) setGradeLevel(dbToDisplayGrade[profile.grade_band] ?? 'Junior High');
        if (profile.preferred_subject) setSubjects([dbToDisplaySubject[profile.preferred_subject]]);
        saveStudySetup({
          displayName: profile.display_name ?? '',
          languageMode: mapLanguageMode(profile.preferred_language_mode),
          gradeBand: mapGradeBand(profile.grade_band),
          subject: mapSubject(profile.preferred_subject),
          topic: localSetup?.topic ?? '',
          goal: localSetup?.goal ?? 'Review',
          dailyGoalMinutes: localSetup?.dailyGoalMinutes ?? goalMinutesFromGoal(localSetup?.goal ?? 'Review'),
          recentTopics: localSetup?.recentTopics ?? [],
        });
      }
      setLoading(false);
    }
    loadProfile();
  }, [supabase]);

  const toggleSubject = (subject: string) => {
    setSubjects(prev =>
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);

    const localSetup = loadStudySetup();
    const dbLanguage = displayToDbLanguage[language];
    const dbGrade = displayToDbGrade[gradeLevel];
    const dbSubject = subjects.length > 0 ? displayToDbSubject[subjects[0]] : null;
    const savedGoal = mapGoal(goal);
    const localDraft: StudySetupDraft = {
      displayName: name,
      languageMode: mapLanguageMode(dbLanguage),
      gradeBand: mapGradeBand(dbGrade),
      subject: mapSubject(dbSubject),
      topic: localSetup?.topic ?? '',
      goal: savedGoal,
      dailyGoalMinutes: goalMinutesFromGoal(savedGoal),
      recentTopics: mergeRecentTopics(localSetup?.recentTopics ?? [], null),
    };

    saveStudySetup(localDraft);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setFeedback({ type: 'success', message: 'Profile saved on this device.' });
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from('learner_profiles')
      .upsert(
        {
          user_id: user.id,
          display_name: name,
          preferred_language_mode: dbLanguage,
          grade_band: dbGrade,
          preferred_subject: dbSubject,
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) {
      setFeedback({ type: 'error', message: error.message });
    } else {
      setFeedback({ type: 'success', message: 'Profile saved successfully!' });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Profile Settings</h1>
        <button className={styles.saveButton} onClick={handleSave} disabled={saving}>
          <AppIcon name="save" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </header>

      {feedback && (
        <div
          style={{
            padding: '12px 20px',
            borderRadius: 12,
            fontWeight: 600,
            fontSize: '0.95rem',
            backgroundColor: feedback.type === 'success' ? '#EAF0E5' : '#FDEDED',
            color: feedback.type === 'success' ? '#2D6B1E' : '#B00020',
          }}
        >
          {feedback.message}
        </div>
      )}

      {/* Personal Info Section */}
      <section className={styles.section}>
        <div className={styles.profileHero}>
          <div className={styles.avatarWrapper}>
            <Image src="/images/avatar.png" alt="Profile avatar" width={100} height={100} className={styles.avatarImage} />
            <div className={styles.avatarEditBtn}>Edit</div>
          </div>
          <div className={styles.profileInfo}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.nameInput}
            />
            <p className={styles.emailText}>{email}</p>
          </div>
        </div>
      </section>

      {/* Language Preference */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIcon}>
            <AppIcon name="translate" />
          </div>
          <h2 className={styles.sectionTitle}>Language Mode</h2>
        </div>
        <div className={styles.grid}>
          {[
            { id: 'Filipino', icon: 'chat_bubble', label: 'Filipino' },
            { id: 'English', icon: 'chat', label: 'English' },
            { id: 'Mixed', icon: 'forum', label: 'Mixed (Fil-Eng)' }
          ].map(opt => (
            <div
              key={opt.id}
              className={styles.optionCard}
              data-selected={language === opt.id}
              onClick={() => setLanguage(opt.id)}
            >
              <AppIcon name={opt.icon} className={styles.optionIcon} />
              <span className={styles.optionLabel}>{opt.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Grade Level */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIcon}>
            <AppIcon name="school" />
          </div>
          <h2 className={styles.sectionTitle}>Grade Level</h2>
        </div>
        <div className={styles.grid}>
          {[
            { id: 'Elementary', icon: 'child_care', label: 'Elementary (G1-6)' },
            { id: 'Junior High', icon: 'school', label: 'Junior High (G7-10)' },
            { id: 'Senior High', icon: 'local_library', label: 'Senior High (G11-12)' },
            { id: 'College', icon: 'menu_book', label: 'College / General' }
          ].map(opt => (
            <div
              key={opt.id}
              className={styles.optionCard}
              data-selected={gradeLevel === opt.id}
              onClick={() => setGradeLevel(opt.id)}
            >
              <AppIcon name={opt.icon} className={styles.optionIcon} />
              <span className={styles.optionLabel}>{opt.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Subjects */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIcon}>
            <AppIcon name="auto_stories" />
          </div>
          <h2 className={styles.sectionTitle}>Subjects</h2>
        </div>
        <div className={styles.grid}>
          {[
            { id: 'Mathematics', icon: 'calculate', label: 'Mathematics' },
            { id: 'Science', icon: 'science', label: 'Science' },
            { id: 'English', icon: 'menu_book', label: 'English' },
            { id: 'Filipino', icon: 'import_contacts', label: 'Filipino' }
          ].map(opt => (
            <div
              key={opt.id}
              className={styles.optionCard}
              data-selected={subjects.includes(opt.id)}
              onClick={() => toggleSubject(opt.id)}
            >
              <AppIcon name={opt.icon} className={styles.optionIcon} />
              <span className={styles.optionLabel}>{opt.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Study Goals */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIcon}>
            <AppIcon name="flag" />
          </div>
          <h2 className={styles.sectionTitle}>Study Goals</h2>
        </div>
        <div className={styles.grid}>
          {[
            { id: 'Habol', icon: 'directions_run', label: 'Habol sa klase' },
            { id: 'Review', icon: 'fact_check', label: 'Nagre-review para sa exam' },
            { id: 'Learn', icon: 'lightbulb', label: 'Gusto ko lang matuto' }
          ].map(opt => (
            <div
              key={opt.id}
              className={styles.optionCard}
              data-selected={goal === opt.id}
              onClick={() => setGoal(opt.id)}
            >
              <AppIcon name={opt.icon} className={styles.optionIcon} />
              <span className={styles.optionLabel}>{opt.label}</span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

function mapLanguageMode(value: string | undefined): StudySetupDraft['languageMode'] {
  if (value === 'english' || value === 'filipino' || value === 'mixed') {
    return value;
  }
  return 'mixed';
}

function mapGradeBand(value: string | undefined): StudySetupDraft['gradeBand'] {
  if (
    value === 'elementary' ||
    value === 'junior_high' ||
    value === 'senior_high' ||
    value === 'college_general'
  ) {
    return value;
  }
  return 'junior_high';
}

function mapSubject(value: string | null): StudySetupDraft['subject'] {
  if (value === 'mathematics' || value === 'science' || value === 'english' || value === 'filipino') {
    return value;
  }
  return 'science';
}

function mapGoal(value: string | null): StudySetupDraft['goal'] {
  if (value === 'Habol' || value === 'Review' || value === 'Learn') {
    return value;
  }
  return null;
}
