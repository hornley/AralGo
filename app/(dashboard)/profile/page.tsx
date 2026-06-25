'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './profile.module.css';

export default function ProfilePage() {
  const [name, setName] = useState('Juan Dela Cruz');
  const [language, setLanguage] = useState('English');
  const [gradeLevel, setGradeLevel] = useState('Junior High');
  const [subjects, setSubjects] = useState<string[]>(['Mathematics', 'Science']);
  const [goal, setGoal] = useState('Review');

  const toggleSubject = (subject: string) => {
    setSubjects(prev => 
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    );
  };

  const handleSave = () => {
    // In a real app, this would save to Supabase
    alert('Profile saved successfully!');
  };

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Profile Settings</h1>
        <button className={styles.saveButton} onClick={handleSave}>
          <span className="material-symbols-outlined">save</span>
          Save Changes
        </button>
      </header>

      {/* Personal Info Section */}
      <section className={styles.section}>
        <div className={styles.profileHero}>
          <div className={styles.avatarWrapper}>
            <Image src="/avatar.png" alt="Profile avatar" width={100} height={100} className={styles.avatarImage} />
            <div className={styles.avatarEditBtn}>Edit</div>
          </div>
          <div className={styles.profileInfo}>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.nameInput}
            />
            <p className={styles.emailText}>juan.scholar@example.com</p>
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
