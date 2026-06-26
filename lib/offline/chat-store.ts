import { getDb, type StoredChatSession, type StoredChatMessage } from './db';
import type { UIMessage } from 'ai';

export async function saveChatSession(session: StoredChatSession): Promise<void> {
  const db = await getDb();
  await db.put('chat-sessions', session);
}

export async function getChatSession(sessionId: string): Promise<StoredChatSession | undefined> {
  const db = await getDb();
  return db.get('chat-sessions', sessionId);
}

export async function getRecentChatSessions(limit = 5): Promise<StoredChatSession[]> {
  const db = await getDb();
  const index = db.transaction('chat-sessions').store.index('lastActiveAt');
  const cursor = await index.iterate(null, 'prev');
  const sessions: StoredChatSession[] = [];
  for await (const entry of cursor) {
    sessions.push(entry.value);
    if (sessions.length >= limit) break;
  }
  return sessions;
}

export async function saveChatMessage(message: StoredChatMessage): Promise<void> {
  const db = await getDb();
  await db.put('chat-messages', message);
}

export async function saveChatMessages(messages: StoredChatMessage[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction('chat-messages', 'readwrite');
  for (const msg of messages) {
    await tx.store.put(msg);
  }
  await tx.done;
}

export async function getChatMessages(sessionId: string): Promise<StoredChatMessage[]> {
  const db = await getDb();
  const index = db.transaction('chat-messages').store.index('sessionId');
  const messages = await index.getAll(sessionId);
  return messages.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

export async function deleteChatSession(sessionId: string): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(['chat-sessions', 'chat-messages'], 'readwrite');
  await tx.objectStore('chat-sessions').delete(sessionId);

  const index = tx.objectStore('chat-messages').index('sessionId');
  let cursor = await index.openCursor(sessionId);
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
}

export function toStoredChatMessage(
  msg: UIMessage,
  sessionId: string,
): StoredChatMessage {
  const text = msg.parts
    ?.filter((p) => p.type === 'text')
    .map((p) => (p as { text: string }).text)
    .join('\n') ?? '';

  return {
    id: msg.id,
    sessionId,
    role: msg.role as 'user' | 'assistant',
    content: text,
    createdAt: new Date().toISOString(),
  };
}

export function toUIMessages(stored: StoredChatMessage[]): UIMessage[] {
  return stored.map((m) => ({
    id: m.id,
    role: m.role,
    parts: [{ type: 'text' as const, text: m.content }],
  }));
}
