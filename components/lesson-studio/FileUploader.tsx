'use client';

import { useState, useRef } from 'react';
import { AppIcon } from '@/components/AppIcon';
import { FileDraft } from '@/lib/types/supabase';
import styles from '../../app/lesson-studio/lesson-studio.module.css';

interface FileUploaderProps {
  files: FileDraft[];
  onAdd: (file: File) => void;
  onRemove: (id: string) => void;
  uploading: boolean;
}

export default function FileUploader({ files, onAdd, onRemove, uploading }: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach(onAdd);
  };

  const handlePick = () => inputRef.current?.click();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []);
    picked.forEach(onAdd);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      <h2>Add reference material (optional)</h2>
      <p className={styles.fileHint}>Upload worksheets, notes, or textbook pages to tailor the lesson to your materials.</p>
      <div
        className={`${styles.dropZone} ${dragOver ? styles.dragOver : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={handlePick}
      >
        <AppIcon name="upload_file" className={styles.dropZoneIcon} />
        <span className={styles.dropZoneText}>Drop files here or click to browse</span>
        <span className={styles.dropTypes}>Images, PDFs, or text files</span>
        <input ref={inputRef} type="file" hidden multiple accept="image/*,.pdf,.txt,.md,.csv" onChange={handleChange} />
      </div>
      {files.length > 0 && (
        <div className={styles.fileList}>
          {files.map((f) => (
            <div key={f.id} className={styles.fileItem}>
              <AppIcon name="description" size={20} style={{ color: 'var(--color-primary)', opacity: 0.6 }} />
              <span className={styles.fileName}>{f.name}</span>
              <span className={styles.fileSize}>{(f.size / 1024).toFixed(1)} KB</span>
              <button className={styles.fileRemove} onClick={() => onRemove(f.id)} disabled={uploading}>
                <AppIcon name="close" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
