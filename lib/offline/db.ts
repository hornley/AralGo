import { openDB, type IDBPDatabase } from 'idb';
import type { LearnerProfile, GeneratedLesson, PracticeSet } from '@/lib/types/supabase';

const DB_NAME = 'aralgo-offline';
const DB_VERSION = 1;

export type StoredChatSession = {
  id: string;
  subject: string;
  topic: string | null;
  languageMode: string;
  gradeBand: string;
  messageCount: number;
  lastActiveAt: string;
  createdAt: string;
};

export type StoredChatMessage = {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
};

export type StoredPracticeResult = {
  id: string;
  subject: string;
  topic: string;
  score: number;
  total: number;
  questions: Array<{
    prompt: string;
    type: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    feedback?: string;
  }>;
  completedAt: string;
};

export type OutboxEntry = {
  id?: number;
  type: 'chat_message' | 'practice_result' | 'profile_update';
  payload: unknown;
  createdAt: string;
};

export type OfflineStore = {
  profiles: LearnerProfile;
  lessons: GeneratedLesson;
  'practice-sets': PracticeSet;
  'practice-results': StoredPracticeResult;
  'chat-sessions': StoredChatSession;
  'chat-messages': StoredChatMessage;
  outbox: OutboxEntry;
};

let dbPromise: Promise<IDBPDatabase<OfflineStore>> | null = null;

export function getDb(): Promise<IDBPDatabase<OfflineStore>> {
  if (!dbPromise) {
    dbPromise = openDB<OfflineStore>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('profiles')) {
          db.createObjectStore('profiles', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('lessons')) {
          const lessonStore = db.createObjectStore('lessons', { keyPath: 'id' });
          lessonStore.createIndex('createdAt', 'created_at');
          lessonStore.createIndex('subject', 'subject');
        }

        if (!db.objectStoreNames.contains('practice-sets')) {
          const psStore = db.createObjectStore('practice-sets', { keyPath: 'id' });
          psStore.createIndex('createdAt', 'created_at');
          psStore.createIndex('subject', 'subject');
        }

        if (!db.objectStoreNames.contains('practice-results')) {
          const prStore = db.createObjectStore('practice-results', { keyPath: 'id' });
          prStore.createIndex('completedAt', 'completedAt');
        }

        if (!db.objectStoreNames.contains('chat-sessions')) {
          const csStore = db.createObjectStore('chat-sessions', { keyPath: 'id' });
          csStore.createIndex('lastActiveAt', 'lastActiveAt');
        }

        if (!db.objectStoreNames.contains('chat-messages')) {
          const cmStore = db.createObjectStore('chat-messages', { keyPath: 'id' });
          cmStore.createIndex('sessionId', 'sessionId');
          cmStore.createIndex('createdAt', 'createdAt');
        }

        if (!db.objectStoreNames.contains('outbox')) {
          const outboxStore = db.createObjectStore('outbox', {
            keyPath: 'id',
            autoIncrement: true,
          });
          outboxStore.createIndex('type', 'type');
          outboxStore.createIndex('createdAt', 'createdAt');
        }
      },
    });
  }
  return dbPromise;
}

export async function clearAllStores(): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(Object.keys(db.objectStoreNames), 'readwrite');
  for (const name of db.objectStoreNames) {
    tx.objectStore(name).clear();
  }
  await tx.done;
}

export async function getStoreSize(): Promise<Record<string, number>> {
  const db = await getDb();
  const sizes: Record<string, number> = {};
  for (const name of db.objectStoreNames) {
    const count = await db.count(name);
    sizes[name] = count;
  }
  return sizes;
}
