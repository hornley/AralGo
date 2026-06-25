import styles from './practice.module.css';
import Link from 'next/link';

export default function PracticePage() {
  return (
    <div className={styles.practiceContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Practice Time</h1>
        <p className={styles.subtitle}>Let's craft the perfect study session just for you.</p>
      </div>

      <div className={styles.configCard}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className="material-symbols-outlined">menu_book</span>
            Subject
          </div>
          <div className={styles.pillGroup}>
            <button className={`${styles.pill} ${styles.active}`}>
              <span className="material-symbols-outlined">calculate</span> Math
            </button>
            <button className={styles.pill}>
              <span className="material-symbols-outlined">science</span> Science
            </button>
            <button className={styles.pill}>
              <span className="material-symbols-outlined">history_edu</span> History
            </button>
            <button className={styles.pill}>
              <span className="material-symbols-outlined">language</span> English
            </button>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className="material-symbols-outlined">topic</span>
            Topic
          </div>
          <div className={styles.dropdownWrapper}>
            <select className={styles.dropdown} defaultValue="Calculus">
              <option value="Algebra">Algebra</option>
              <option value="Geometry">Geometry</option>
              <option value="Calculus">Calculus</option>
              <option value="Statistics">Statistics</option>
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

      <Link href="/practice/results" className={styles.generateBtn}>
        Generate Practice ✨
      </Link>
    </div>
  );
}
