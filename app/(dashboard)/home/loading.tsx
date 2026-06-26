import styles from './home.module.css';

export default function HomeLoading() {
  return (
    <div className={styles.container}>
      <div className={styles.topRow}>
        <div className={styles.card} style={{ minHeight: 180 }}>
          <div className={styles.skeletonBlock} style={{ width: 80, height: 14, marginBottom: 12 }} />
          <div className={styles.skeletonBlock} style={{ width: 180, height: 22, marginBottom: 8 }} />
          <div className={styles.skeletonBlock} style={{ width: 140, height: 14, marginBottom: 16 }} />
          <div className={styles.skeletonBlock} style={{ width: '100%', height: 8, borderRadius: 4 }} />
        </div>
        <div className={styles.card} style={{ minHeight: 180 }}>
          <div className={styles.skeletonBlock} style={{ width: 100, height: 14, marginBottom: 12 }} />
          <div className={styles.skeletonCircle} style={{ width: 80, height: 80, margin: '8px auto' }} />
          <div className={styles.skeletonBlock} style={{ width: 160, height: 12, margin: '12px auto 0' }} />
        </div>
        <div className={styles.card} style={{ minHeight: 180 }}>
          <div className={styles.skeletonBlock} style={{ width: 120, height: 14, marginBottom: 16 }} />
          <div className={styles.skeletonBlock} style={{ width: '100%', height: 48, marginBottom: 8 }} />
          <div className={styles.skeletonBlock} style={{ width: '100%', height: 48 }} />
        </div>
      </div>
      <div className={styles.bottomRow}>
        <div>
          <div className={styles.skeletonBlock} style={{ width: 140, height: 18, marginBottom: 16 }} />
          <div className={styles.actionsGrid}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={styles.skeletonBlock} style={{ height: 90, borderRadius: 16 }} />
            ))}
          </div>
        </div>
        <div className={styles.card} style={{ minHeight: 80 }}>
          <div className={styles.skeletonBlock} style={{ width: 140, height: 14, marginBottom: 8 }} />
          <div className={styles.skeletonBlock} style={{ width: '80%', height: 14 }} />
        </div>
      </div>
    </div>
  );
}
