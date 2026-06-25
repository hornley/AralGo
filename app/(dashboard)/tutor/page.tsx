'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, FormEvent } from 'react';
import Image from 'next/image';
import styles from './tutor.module.css';

type TutorMode = 'socratic' | 'chat';

const tutorModes: Array<{
  value: TutorMode;
  label: string;
  icon: string;
}> = [
  { value: 'socratic', label: 'Socratic mode', icon: 'psychology' },
  { value: 'chat', label: 'Chat mode', icon: 'chat_bubble' },
];

const renderInlineText = (text: string) => {
  return text.split(/(\*\*[^*]+\*\*)/g).map((chunk, index) => {
    const isBold = chunk.startsWith('**') && chunk.endsWith('**');

    if (!isBold) {
      return chunk;
    }

    return <strong key={`${chunk}-${index}`}>{chunk.slice(2, -2)}</strong>;
  });
};

const renderMessageText = (text: string) => {
  const normalizedText = text.replace(/\s+-\s+/g, '\n- ').trim();
  const lines = normalizedText.split('\n').map((line) => line.trim()).filter(Boolean);
  const blocks: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length === 0) return;

    blocks.push(
      <ul key={`list-${blocks.length}`} className={styles.messageList}>
        {listItems.map((item, index) => (
          <li key={`${item}-${index}`}>{renderInlineText(item)}</li>
        ))}
      </ul>,
    );
    listItems = [];
  };

  lines.forEach((line) => {
    if (line.startsWith('- ')) {
      listItems.push(line.slice(2));
      return;
    }

    flushList();
    blocks.push(
      <p key={`paragraph-${blocks.length}`} className={styles.messageParagraph}>
        {renderInlineText(line)}
      </p>,
    );
  });

  flushList();

  return blocks;
};

export default function TutorPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      body: { sessionId },
    }),
  });
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<TutorMode>('socratic');
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const selectedMode = tutorModes.find((tutorMode) => tutorMode.value === mode) ?? tutorModes[0];
  const isLoading = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(
      { role: 'user', parts: [{ type: 'text', text: input }] },
      { body: { mode } },
    );
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
          <div className={styles.modeSelector}>
            <button
              type="button"
              className={styles.modePill}
              aria-haspopup="menu"
              aria-expanded={isModeMenuOpen}
              onClick={() => setIsModeMenuOpen((isOpen) => !isOpen)}
            >
              <span className="material-symbols-outlined">{selectedMode.icon}</span>
              {selectedMode.label}
              <span className={`${styles.modeArrow} material-symbols-outlined`}>
                keyboard_arrow_down
              </span>
            </button>
            {isModeMenuOpen && (
              <div className={styles.modeMenu} role="menu">
                {tutorModes.map((tutorMode) => (
                  <button
                    key={tutorMode.value}
                    type="button"
                    className={styles.modeMenuItem}
                    role="menuitemradio"
                    aria-checked={mode === tutorMode.value}
                    onClick={() => {
                      setMode(tutorMode.value);
                      setIsModeMenuOpen(false);
                    }}
                  >
                    <span className="material-symbols-outlined">{tutorMode.icon}</span>
                    {tutorMode.label}
                    {mode === tutorMode.value && (
                      <span className={`${styles.modeCheck} material-symbols-outlined`}>
                        check
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
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
                part.type === 'text' ? (
                  <div key={i} className={styles.messageText}>
                    {renderMessageText(part.text)}
                  </div>
                ) : null
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
