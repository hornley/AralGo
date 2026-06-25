import Image from 'next/image';
import styles from './tutor.module.css';

export default function TutorPage() {
  return (
    <div className={styles.tutorContainer}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.avatarWrapper}>
            <Image src="/avatar.png" alt="Tutor Avatar" width={40} height={40} className={styles.avatarImage} />
          </div>
          <div>
            <h1 className={styles.title}>AralGo Tutor</h1>
            <div className={styles.status}>
              <span className={styles.statusDot}></span>
              Online
            </div>
          </div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.modePill}>
            <span className="material-symbols-outlined">calculate</span>
            Mathematics mode
          </div>
        </div>
      </header>

      <div className={styles.chatArea}>
        <div className={styles.dateSeparator}>Today</div>

        <div className={styles.messageRowAI}>
          <div className={styles.avatarSmallWrapper}>
            <Image src="/avatar.png" alt="Tutor Avatar" width={32} height={32} className={styles.avatarImage} />
          </div>
          <div className={styles.bubbleAI}>
            Hi Juan! I&apos;m ready to help you with Math today. What should we look at first? ✨
          </div>
          <div className={styles.timeLabel}>10:41 AM</div>
        </div>

        <div className={styles.messageRowUser}>
          <div className={styles.bubbleUser}>
            Can you explain the Pythagorean theorem simpler?
          </div>
          <div className={styles.timeLabel}>10:42 AM</div>
        </div>

        <div className={styles.messageRowAI}>
          <div className={styles.avatarSmallWrapper}>
            <Image src="/avatar.png" alt="Tutor Avatar" width={32} height={32} className={styles.avatarImage} />
          </div>
          <div className={styles.bubbleAI}>
            Sure thing! Think of it like a triangle&apos;s secret code. If you have a triangle with one perfectly square corner (a right angle), the math rule says: if you take the two shorter sides, square their lengths, and add them together, it exactly equals the longest side squared!
            <div className={styles.formulaBox}>
              a² + b² = c²
            </div>
          </div>
          <div className={styles.timeLabel}>10:43 AM</div>
        </div>
        
        <div className={styles.messageRowAI}>
          <div className={styles.avatarSmallWrapper}>
            <Image src="/avatar.png" alt="Tutor Avatar" width={32} height={32} className={styles.avatarImage} />
          </div>
          <div className={styles.typingIndicator}>
             <span className={styles.dot}></span>
             <span className={styles.dot}></span>
             <span className={styles.dot}></span>
          </div>
        </div>
      </div>

      <div className={styles.bottomArea}>
        <div className={styles.quickActions}>
          <button className={styles.quickActionBtn}>Explain Simpler</button>
          <button className={styles.quickActionBtn}>Give Example</button>
          <button className={styles.quickActionBtn}>Step by Step</button>
          <button className={styles.quickActionBtn}>Practice Questions</button>
        </div>
        
        <div className={styles.inputWrapper}>
          <button className={styles.attachBtn}>
            <span className="material-symbols-outlined">attach_file</span>
          </button>
          <input type="text" placeholder="Ask a question..." className={styles.chatInput} />
          <button className={styles.micBtn}>
            <span className="material-symbols-outlined">mic</span>
          </button>
          <button className={styles.sendBtn}>
            <span className="material-symbols-outlined">arrow_upward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
