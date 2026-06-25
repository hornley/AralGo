'use client';

import { useState } from 'react';

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
    <div className="topic-selector">
      <h2>Pick topics to study</h2>
      {loading ? (
        <div className="skeleton-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton-chip" />
          ))}
        </div>
      ) : (
        <div className="topic-chips">
          {suggestedTopics.map((topic) => (
            <button
              key={topic}
              className={`topic-chip ${selectedTopics.includes(topic) ? 'selected' : ''}`}
              onClick={() => onToggle(topic)}
              aria-pressed={selectedTopics.includes(topic)}
            >
              {topic}
            </button>
          ))}
        </div>
      )}
      <div className="custom-topic-input">
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
        <p className="selected-count">{selectedTopics.length} topic{selectedTopics.length !== 1 ? 's' : ''} selected</p>
      )}
    </div>
  );
}
