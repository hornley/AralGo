'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
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
  const supabase = createClient();

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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setFeedback({ type: 'error', message: 'You must be logged in to save.' });
      setSaving(false);
      return;
    }

    const dbLanguage = displayToDbLanguage[language];
    const dbGrade = displayToDbGrade[gradeLevel];
    const dbSubject = subjects.length > 0 ? displayToDbSubject[subjects[0]] : null;

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
          <span className="material-symbols-outlined">save</span>
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
            <span className="material-symbols-outlined">translate</span>
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
              <span className={`material-symbols-outlined ${styles.optionIcon}`}>{opt.icon}</span>
              <span className={styles.optionLabel}>{opt.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Grade Level */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIcon}>
            <span className="material-symbols-outlined">school</span>
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
              <span className={`material-symbols-outlined ${styles.optionIcon}`}>{opt.icon}</span>
              <span className={styles.optionLabel}>{opt.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Subjects */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIcon}>
            <span className="material-symbols-outlined">auto_stories</span>
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
              <span className={`material-symbols-outlined ${styles.optionIcon}`}>{opt.icon}</span>
              <span className={styles.optionLabel}>{opt.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Study Goals */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIcon}>
            <span className="material-symbols-outlined">flag</span>
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
              <span className={`material-symbols-outlined ${styles.optionIcon}`}>{opt.icon}</span>
              <span className={styles.optionLabel}>{opt.label}</span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
