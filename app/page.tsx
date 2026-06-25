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
              Master Your Studies with <span className={styles.heroTitleHighlight}>AralGo</span>
            </h1>
            <p className={styles.heroSubtitle}>
              AralGo is a modern AI study companion focused on Filipino learners and features: 
              Bilingual Learning, Adaptive Practice, and Low-Bandwidth Delivery.
            </p>
            <div className={styles.heroActions}>
              <Link href="/onboarding" className={styles.buttonPrimary}>
                Get Started
              </Link>
              <Link href="/api/health" className={styles.buttonOutline}>
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
            <h2 className={styles.servicesTitle}>Our Provided Services</h2>
          </div>
          
          <div className={styles.servicesGrid}>
            <div className={styles.serviceCard}>
              <div className={styles.serviceIconWrapper} data-color="tertiary">
                <AppIcon name="translate" className={styles.serviceIcon} />
              </div>
              <h3 className={styles.serviceTitle}>Bilingual Tutoring</h3>
              <p className={styles.serviceDesc}>
                Learn seamlessly in Filipino and English. Our AI tutor adapts to your preferred language mode to ensure complete understanding.
              </p>
              <Link href="/onboarding" className={styles.serviceLink}>
                Learn More <AppIcon name="arrow_forward_ios" className={styles.serviceLinkIcon} />
              </Link>
            </div>
            
            <div className={styles.serviceCard}>
              <div className={styles.serviceIconWrapper} data-color="primary">
                <AppIcon name="quiz" className={styles.serviceIcon} />
              </div>
              <h3 className={styles.serviceTitle}>Adaptive Practice</h3>
              <p className={styles.serviceDesc}>
                Generate practice questions tailored precisely to your current grade level and subject performance to boost your retention.
              </p>
              <Link href="/onboarding" className={styles.serviceLink}>
                Learn More <AppIcon name="arrow_forward_ios" className={styles.serviceLinkIcon} />
              </Link>
            </div>
            
            <div className={styles.serviceCard}>
              <div className={styles.serviceIconWrapper} data-color="secondary">
                <AppIcon name="signal_cellular_alt" className={styles.serviceIcon} />
              </div>
              <h3 className={styles.serviceTitle}>Mobile First</h3>
              <p className={styles.serviceDesc}>
                Designed specifically for mobile constraints. Enjoy an optimized, low-bandwidth experience wherever you study.
              </p>
              <Link href="/onboarding" className={styles.serviceLink}>
                Learn More <AppIcon name="arrow_forward_ios" className={styles.serviceLinkIcon} />
              </Link>
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
                Experience Better <span className={styles.infoTitleHighlight}>Learning</span> And <span className={styles.infoTitleHighlight}>Teaching</span> With AralGo
              </h2>
              <p className={styles.infoDesc}>
                Learners of all ages need more immersion and a greater level of exposure to apply what they learn. AralGo provides the targeted support needed to excel in your academics.
              </p>
              <Link href="/onboarding" className={styles.buttonTertiary}>
                Join AralGo
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
