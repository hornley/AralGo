'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, FormEvent } from 'react';
import Image from 'next/image';
import { AppIcon } from '@/components/AppIcon';
import MathRenderer from '@/components/MathRenderer';
import { t } from '@/lib/i18n';
import { useLocalStudySetup } from '@/lib/study/use-local-study-setup';
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

const AKI_AVATAR_SRC = '/images/aki.png';

const renderInlineText = (text: string, placeholders: Map<string, string>) => {
  const restore = (s: string) => s.replace(/\x00MATH\d+\x00/g, (m) => placeholders.get(m) ?? m);
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((chunk, index) => {
    const isBold = chunk.startsWith('**') && chunk.endsWith('**');

    if (isBold) {
      return <strong key={`${chunk}-${index}`}>{chunk.slice(2, -2)}</strong>;
    }

    return <MathRenderer key={`${chunk}-${index}`} text={restore(chunk)} />;
  });
};

const renderMessageText = (text: string) => {
  const placeholders = new Map<string, string>();
  let counter = 0;
  const extract = (openDelim: string, closeDelim: string, body: string) => {
    const key = `\x00MATH${counter++}\x00`;
    placeholders.set(key, openDelim + body + closeDelim);
    return key;
  };

  const extracted = text
    .replace(/\\\([\s\S]+?\\\)/g, (m) => extract('\\(' , '\\)', m.slice(2, -2)))
    .replace(/\\\[[\s\S]+?\\\]/g, (m) => extract('\\[', '\\]', m.slice(2, -2)))
    .replace(/\$\$[\s\S]+?\$\$/g, (m) => extract('$$', '$$', m.slice(2, -2)))
    .replace(/\$[^$]+?\$/g, (m) => extract('$', '$', m.slice(1, -1)));

  const normalizedText = extracted.replace(/\s+-\s+/g, '\n- ').trim();
  const lines = normalizedText.split('\n').map((line) => line.trim()).filter(Boolean);
  const blocks: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length === 0) return;

    blocks.push(
      <ul key={`list-${blocks.length}`} className={styles.messageList}>
        {listItems.map((item, index) => (
          <li key={`${item}-${index}`}>{renderInlineText(item, placeholders)}</li>
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
        {renderInlineText(line, placeholders)}
      </p>,
    );
  });

  flushList();

  return blocks;
};

export default function TutorPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const localSetup = useLocalStudySetup();
  const languageMode = localSetup?.languageMode;
  const chatTitle = t(languageMode, 'dashboard.tutor');
  const inputPlaceholder = languageMode === 'filipino' ? 'Magtanong kay Aki...' : 'Ask Aki a question...';

  const { messages, setMessages, sendMessage, regenerate, status, error } = useChat({
    transport: new DefaultChatTransport({
      body: { sessionId },
    }),
  });

  const [historyCached, setHistoryCached] = useState(false);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<TutorMode>('socratic');
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const selectedMode = tutorModes.find((tutorMode) => tutorMode.value === mode) ?? tutorModes[0];
  const isLoading = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/chat/history?sessionId=${sessionId}`)
      .then(r => {
        setHistoryCached(r.headers.get('X-AralGo-Cached') === 'true');
        return r.json();
      })
      .then(data => {
        if (data.messages?.length) setMessages(data.messages);
      })
      .catch(err => console.error('Failed to load chat history:', err));
  }, [sessionId, setMessages]);

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
            <Image src={AKI_AVATAR_SRC} alt="Aki" width={160} height={160} className={styles.avatarImage} unoptimized />
          </div>
          <div>
            <h1 className={styles.title}>{chatTitle}</h1>
            <div className={styles.status}>
              <span className={styles.statusDot}></span>
              Online
              {historyCached && <span className={styles.cachedBadge}>Cached / Naka-cache</span>}
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
              <AppIcon name={selectedMode.icon} />
              {selectedMode.label}
              <AppIcon name="keyboard_arrow_down" className={styles.modeArrow} />
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
                    <AppIcon name={tutorMode.icon} />
                    {tutorMode.label}
                    {mode === tutorMode.value && (
                      <AppIcon name="check" className={styles.modeCheck} />
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
                <Image src={AKI_AVATAR_SRC} alt="Aki" width={128} height={128} className={styles.avatarImage} unoptimized />
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
              <Image src={AKI_AVATAR_SRC} alt="Aki" width={128} height={128} className={styles.avatarImage} unoptimized />
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
              <Image src={AKI_AVATAR_SRC} alt="Aki" width={128} height={128} className={styles.avatarImage} unoptimized />
            </div>
            <div>
              <div className={styles.bubbleError}>
                {error.message || 'The tutor could not reply. Please try again.'}
              </div>
              <button className={styles.retryBtn} onClick={() => regenerate()} type="button">
                Subukan muli / Try again
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={styles.bottomArea}>
        <form className={styles.inputWrapper} onSubmit={handleSubmit}>
          <button type="button" className={styles.attachBtn}>
            <AppIcon name="attach_file" />
          </button>
          <input
            type="text"
            placeholder={inputPlaceholder}
            className={styles.chatInput}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="button" className={styles.micBtn}>
            <AppIcon name="mic" />
          </button>
          <button type="submit" className={styles.sendBtn} disabled={isLoading || !input.trim()}>
            <AppIcon name="arrow_upward" />
          </button>
        </form>
      </div>
    </div>
  );
}
