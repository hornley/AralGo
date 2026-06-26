import { getDb, type OutboxEntry } from './db';
import { queueOutboxEntry } from './sync';

export function queueChatMessage(sessionId: string, content: string): void {
  queueOutboxEntry('chat_message', { sessionId, content });
}

export function queuePracticeResult(payload: {
  subject: string;
  topic: string;
  gradeBand: string;
  questions: Array<{
    prompt: string;
    type: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    feedback?: string;
  }>;
  score: number;
  total: number;
}): void {
  queueOutboxEntry('practice_result', payload);
}

export function queueProfileUpdate(payload: {
  displayName?: string;
  gradeBand?: string;
  languageMode?: string;
  preferredSubject?: string;
}): void {
  queueOutboxEntry('profile_update', payload);
}

export async function getOutboxCount(): Promise<number> {
  const db = await getDb();
  const count = await db.count('outbox');
  return count;
}

export async function getOutboxEntries(
  limit = 50,
): Promise<OutboxEntry[]> {
  const db = await getDb();
  const tx = db.transaction('outbox', 'readonly');
  const index = tx.store.index('createdAt');
  const cursor = await index.iterate(null, 'prev');
  const entries: OutboxEntry[] = [];
  for await (const entry of cursor) {
    entries.push(entry.value);
    if (entries.length >= limit) break;
  }
  return entries;
}

export async function clearOutbox(): Promise<void> {
  const db = await getDb();
  await db.clear('outbox');
}
