import { AppIcon } from "./AppIcon";
import styles from './LeafProgress.module.css';

interface LeafProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function LeafProgress({ currentStep, totalSteps }: LeafProgressProps) {
  const percentage = Math.min(Math.max((currentStep / totalSteps) * 100, 0), 100);

  return (
    <div className={styles.container}>
      <AppIcon name="energy_savings_leaf" className={styles.icon} />
      <div className={styles.track}>
        <div className={styles.progress} style={{ width: `${percentage}%` }}></div>
      </div>
      <span className={styles.text}>{currentStep} of {totalSteps}</span>
    </div>
  );
}
