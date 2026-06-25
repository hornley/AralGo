'use client';

import { useState } from 'react';
import styles from '../../app/lesson-studio/lesson-studio.module.css';

interface TopicSelectorProps {
  suggestedTopics: string[];
  selectedTopics: string[];
  onToggle: (topic: string) => void;
  onAddCustom: (topic: string) => void;
  loading: boolean;
}

export default function TopicSelector({ suggestedTopics, selectedTopics, onToggle, onAddCustom, loading }: TopicSelectorProps) {
  const [custom, setCustom] = useState('');

  const handleAdd = () => {
    const trimmed = custom.trim();
    if (trimmed && !selectedTopics.includes(trimmed)) {
      onAddCustom(trimmed);
      setCustom('');
    }
  };

  return (
    <div>
      <h2>Pick topics to study</h2>
      <p className={styles.topicHelp}>
        Choose from suggested topics or type your own. You can pick multiple.
      </p>
      {loading ? (
        <div className={styles.skeletonGrid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={styles.skeletonChip} />
          ))}
        </div>
      ) : (
        <div className={styles.topicChips}>
          {suggestedTopics.map((topic) => (
            <button
              key={topic}
              className={`${styles.topicChip} ${selectedTopics.includes(topic) ? styles.selected : ''}`}
              onClick={() => onToggle(topic)}
              aria-pressed={selectedTopics.includes(topic)}
            >
              {topic}
            </button>
          ))}
        </div>
      )}
      <div className={styles.customTopicInput}>
        <input
          type="text"
          placeholder="Or type your own topic..."
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button onClick={handleAdd} disabled={!custom.trim()}>Add</button>
      </div>
      {selectedTopics.length > 0 && (
        <p className={styles.selectedCount}>{selectedTopics.length} topic{selectedTopics.length !== 1 ? 's' : ''} selected</p>
      )}
    </div>
  );
}
