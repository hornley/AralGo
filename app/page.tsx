import Image from 'next/image';
import Link from 'next/link';
import { AppIcon } from '@/components/AppIcon';
import { LandingNav } from './landing-nav';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <main className={styles.main}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <Link href="/" className={styles.brand}>
            <span className={styles.brandMark} aria-hidden="true">
              <AppIcon name="school" />
            </span>
            <span className={styles.brandText}>AralGo Scholar</span>
          </Link>
          <LandingNav />
        </div>
      </header>
      
      {/* Hero Section */}
      <section className={styles.container}>
        <div className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Meet your friendly study buddy, <span className={styles.heroTitleHighlight}>AralGo</span>
            </h1>
            <p className={styles.heroSubtitle}>
              AralGo helps Filipino learners understand lessons, practice with confidence,
              and ask questions anytime in English, Filipino, or Taglish. It is made for quick study
              moments on mobile, even when the internet is not perfect.
            </p>
            <div className={styles.heroActions}>
              <Link href="/onboarding" className={styles.buttonPrimary}>
                Get Started
              </Link>
              <Link href="#about" className={styles.buttonOutline}>
                Learn More
              </Link>
            </div>
          </div>
          <div className={styles.heroImageWrapper}>
            <Image 
              src="/images/hero.png" 
              alt="Student using AralGo" 
              width={600} 
              height={600} 
              className={styles.heroImage}
              priority
            />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className={styles.servicesSection}>
        <div className={styles.container}>
          <div className={styles.servicesHeader}>
            <div className={styles.servicesTag}>
              <AppIcon name="auto_awesome" className={styles.servicesTagIcon} />
              Services
            </div>
            <h2 className={styles.servicesTitle}>Little Helpers for Big Learning</h2>
          </div>
          
          <div className={styles.servicesGrid}>
            <div className={styles.serviceCard}>
              <div className={styles.serviceIconWrapper} data-color="tertiary">
                <AppIcon name="translate" className={styles.serviceIcon} />
              </div>
              <h3 className={styles.serviceTitle}>Ask in Your Language</h3>
              <p className={styles.serviceDesc}>
                Stuck on a lesson? Ask in English, Filipino, or Taglish. AralGo explains things in a way that feels natural and easy to follow.
              </p>
              <span className={styles.servicePill}>Clear explanations</span>
            </div>
            
            <div className={styles.serviceCard}>
              <div className={styles.serviceIconWrapper} data-color="primary">
                <AppIcon name="quiz" className={styles.serviceIcon} />
              </div>
              <h3 className={styles.serviceTitle}>Lessons Made for You</h3>
              <p className={styles.serviceDesc}>
                Choose a topic and get a simple lesson, examples, reminders, and practice questions that match what you are learning.
              </p>
              <span className={styles.servicePill}>Study at your pace</span>
            </div>
            
            <div className={styles.serviceCard}>
              <div className={styles.serviceIconWrapper} data-color="secondary">
                <AppIcon name="signal_cellular_alt" className={styles.serviceIcon} />
              </div>
              <h3 className={styles.serviceTitle}>Study Anywhere</h3>
              <p className={styles.serviceDesc}>
                Open AralGo on your phone for quick review, homework help, or exam prep. It stays light and friendly for slow connections.
              </p>
              <span className={styles.servicePill}>Mobile-friendly</span>
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section id="about" className={styles.infoSection}>
        <div className={styles.container}>
          <div className={styles.infoContent}>
            <div className={styles.infoImageWrapper}>
              <Image 
                src="/images/teacher.png" 
                alt="Teacher thumbs up" 
                width={500} 
                height={500} 
                className={styles.infoImage}
              />
            </div>
            <div className={styles.infoTextContainer}>
              <h2 className={styles.infoTitle}>
                Learning feels better when help feels <span className={styles.infoTitleHighlight}>close</span>
              </h2>
              <p className={styles.infoDesc}>
                AralGo Scholar is like a patient study companion beside you. It can explain hard topics,
                give gentle hints, make quick quizzes, and remember what you studied so you can come back
                whenever you are ready.
              </p>
              <div className={styles.aboutPoints} aria-label="AralGo Scholar strengths">
                <span>Gentle hints</span>
                <span>Saved study sessions</span>
                <span>Works well on mobile</span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
