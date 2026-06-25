'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useRef, useState, FormEvent } from 'react';
import Image from 'next/image';
import styles from './tutor.module.css';

export default function TutorPage() {
  const { messages, sendMessage, status, error } = useChat();
  const [input, setInput] = useState('');
  const chatAreaRef = useRef<HTMLDivElement>(null);
  
  const isLoading = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ role: 'user', parts: [{ type: 'text', text: input }] });
    setInput('');
  };

  return (
    <div className={styles.tutorContainer}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.avatarWrapper}>
            <Image src="/images/avatar.png" alt="Tutor Avatar" width={40} height={40} className={styles.avatarImage} />
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
            <span className="material-symbols-outlined">psychology</span>
            Socratic mode
          </div>
        </div>
      </header>

      <div className={styles.chatArea} ref={chatAreaRef}>
        <div className={styles.dateSeparator}>Today</div>

        {messages.map((m, index) => (
          <div key={m.id || `message-${index}`} className={m.role === 'user' ? styles.messageRowUser : styles.messageRowAI}>
            {m.role !== 'user' && (
              <div className={styles.avatarSmallWrapper}>
                <Image src="/images/avatar.png" alt="Tutor Avatar" width={32} height={32} className={styles.avatarImage} />
              </div>
            )}
            <div className={m.role === 'user' ? styles.bubbleUser : styles.bubbleAI}>
              {m.parts?.map((part: any, i: number) => (
                <span key={i}>{part.type === 'text' ? part.text : ''}</span>
              ))}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className={styles.messageRowAI}>
            <div className={styles.avatarSmallWrapper}>
              <Image src="/images/avatar.png" alt="Tutor Avatar" width={32} height={32} className={styles.avatarImage} />
            </div>
            <div className={styles.typingIndicator}>
               <span className={styles.dot}></span>
               <span className={styles.dot}></span>
               <span className={styles.dot}></span>
            </div>
          </div>
        )}

        {error && (
          <div className={styles.messageRowAI}>
            <div className={styles.avatarSmallWrapper}>
              <Image src="/images/avatar.png" alt="Tutor Avatar" width={32} height={32} className={styles.avatarImage} />
            </div>
            <div className={styles.bubbleError}>
              {error.message || 'The tutor could not reply. Please try again.'}
            </div>
          </div>
        )}
      </div>

      <div className={styles.bottomArea}>
        <form className={styles.inputWrapper} onSubmit={handleSubmit}>
          <button type="button" className={styles.attachBtn}>
            <span className="material-symbols-outlined">attach_file</span>
          </button>
          <input 
            type="text" 
            placeholder="Ask a question..." 
            className={styles.chatInput} 
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="button" className={styles.micBtn}>
            <span className="material-symbols-outlined">mic</span>
          </button>
          <button type="submit" className={styles.sendBtn} disabled={isLoading || !input.trim()}>
            <span className="material-symbols-outlined">arrow_upward</span>
          </button>
        </form>
      </div>
    </div>
  );
}
