'use client';

import { useState, useRef } from 'react';
import { FileDraft } from '@/lib/types/supabase';

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
    <div className="file-uploader">
      <h2>Add reference material (optional)</h2>
      <p className="file-hint">Upload worksheets, notes, or textbook pages to tailor the lesson</p>
      <div
        className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={handlePick}
      >
        <span className="drop-icon">+</span>
        <span>Drop files here or click to browse</span>
        <span className="drop-types">Images, PDFs, or text files</span>
        <input ref={inputRef} type="file" hidden multiple accept="image/*,.pdf,.txt,.md,.csv" onChange={handleChange} />
      </div>
      {files.length > 0 && (
        <div className="file-list">
          {files.map((f) => (
            <div key={f.id} className="file-item">
              <span className="file-name">{f.name}</span>
              <span className="file-size">{(f.size / 1024).toFixed(1)} KB</span>
              <button className="file-remove" onClick={() => onRemove(f.id)} disabled={uploading}>
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
