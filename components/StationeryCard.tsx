import styles from './StationeryCard.module.css';

interface StationeryCardProps {
  title: string;
  icon: string;
  colorTheme: 'primary' | 'secondary' | 'tertiary' | 'surface-dim';
  selected?: boolean;
  onClick: () => void;
}

export function StationeryCard({ title, icon, colorTheme, selected, onClick }: StationeryCardProps) {
  return (
    <button 
      className={`${styles.card} ${selected ? styles.cardSelected : ''}`}
      onClick={onClick}
      type="button"
    >
      {selected && (
        <span className={`material-symbols-outlined fill ${styles.sparkle}`}>stars</span>
      )}
      <div className={styles.iconWrapper} data-color={colorTheme}>
        <span className={`material-symbols-outlined ${styles.icon}`}>{icon}</span>
      </div>
      <h3 className={`${styles.title} ${selected ? styles.titleSelected : ''}`}>
        {title}
      </h3>
    </button>
  );
}
