export interface RetryResult<T> {
  ok: true;
  data: T;
}

export interface RetryError {
  ok: false;
  error: string;
}

export type RetryResponse<T> = RetryResult<T> | RetryError;

export interface RetryOptions {
  maxRetries?: number;
  retryDelayMs?: number;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 1,
  retryDelayMs: 1000,
};

function isRetryableError(error: unknown): boolean {
  if (error instanceof TypeError) return true;
  if (error instanceof DOMException) return true;
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes('timeout') ||
      msg.includes('network') ||
      msg.includes('fetch') ||
      msg.includes('abort') ||
      msg.includes('econnrefused') ||
      msg.includes('networkerror')
    );
  }
  return false;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions,
): Promise<RetryResponse<T>> {
  const { maxRetries, retryDelayMs } = { ...DEFAULT_OPTIONS, ...options };

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const data = await fn();
      return { ok: true, data };
    } catch (err) {
      const isLastAttempt = attempt === maxRetries;

      if (isLastAttempt || !isRetryableError(err)) {
        return {
          ok: false,
          error: err instanceof Error ? err.message : 'An unexpected error occurred',
        };
      }

      await new Promise((r) => setTimeout(r, retryDelayMs));
    }
  }

  return { ok: false, error: 'An unexpected error occurred' };
}
