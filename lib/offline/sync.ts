import { getDb, type OutboxEntry } from './db';

export type SyncStatus = 'idle' | 'syncing' | 'error';
export type SyncListener = (status: SyncStatus, error?: string) => void;

let listeners: Set<SyncListener> = new Set();
let currentStatus: SyncStatus = 'idle';
let flusher: Promise<void> | null = null;

export function onSyncStatusChange(listener: SyncListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify(status: SyncStatus, error?: string) {
  currentStatus = status;
  listeners.forEach((fn) => fn(status, error));
}

async function flushOutbox() {
  notify('syncing');
  const db = await getDb();
  const tx = db.transaction('outbox', 'readonly');
  const entries = await tx.store.getAll();
  tx.abort();

  for (const entry of entries) {
    try {
      await processOutboxEntry(entry);
      await db.delete('outbox', entry.id!);
    } catch (err) {
      console.error('[sync] Failed to process outbox entry', entry.id, err);
      notify(
        'error',
        err instanceof Error ? err.message : 'Sync failed',
      );
      return;
    }
  }

  notify('idle');
}

async function processOutboxEntry(entry: OutboxEntry): Promise<void> {
  switch (entry.type) {
    case 'chat_message': {
      const payload = entry.payload as {
        sessionId: string;
        content: string;
      };
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', parts: [{ type: 'text', text: payload.content }] }],
          sessionId: payload.sessionId,
        }),
      });
      break;
    }

    case 'practice_result': {
      const payload = entry.payload as {
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
      };
      await fetch('/api/practice/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      break;
    }

    case 'profile_update': {
      const payload = entry.payload as {
        displayName?: string;
        gradeBand?: string;
        languageMode?: string;
        preferredSubject?: string;
      };
      await fetch('/api/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      break;
    }
  }
}

export function queueOutboxEntry(
  type: OutboxEntry['type'],
  payload: unknown,
): void {
  getDb().then((db) => {
    db.add('outbox', {
      type,
      payload,
      createdAt: new Date().toISOString(),
    });
  });
}

export function startSyncWatcher(): () => void {
  const handleOnline = () => {
    if (flusher) return;
    flusher = flushOutbox().finally(() => {
      flusher = null;
    });
  };

  const handleFocus = () => {
    if (navigator.onLine && !flusher) {
      flusher = flushOutbox().finally(() => {
        flusher = null;
      });
    }
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('focus', handleFocus);

  if (navigator.onLine) {
    flushOutbox().finally(() => {
      flusher = null;
    });
  }

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('focus', handleFocus);
  };
}
