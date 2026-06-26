'use client';

import { useState, useEffect } from 'react';

export type NetworkQuality = 'fast' | 'slow' | 'offline' | 'unknown';

export interface NetworkStatus {
  quality: NetworkQuality;
  isOnline: boolean;
}

function getEffectiveQuality(
  effectiveType: string | undefined,
  online: boolean,
): NetworkQuality {
  if (!online) return 'offline';
  if (effectiveType === 'slow-2g' || effectiveType === '2g' || effectiveType === '3g') return 'slow';
  if (effectiveType === '4g') return 'fast';
  return 'unknown';
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(() => {
    if (typeof navigator === 'undefined') return { quality: 'unknown', isOnline: true };
    const conn = (navigator as any).connection;
    return {
      quality: getEffectiveQuality(conn?.effectiveType, navigator.onLine),
      isOnline: navigator.onLine,
    };
  });

  useEffect(() => {
    const update = () => {
      const conn = (navigator as any).connection;
      setStatus({
        quality: getEffectiveQuality(conn?.effectiveType, navigator.onLine),
        isOnline: navigator.onLine,
      });
    };

    window.addEventListener('online', update);
    window.addEventListener('offline', update);

    const conn = (navigator as any).connection;
    if (conn) {
      conn.addEventListener('change', update);
    }

    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
      if (conn) {
        conn.removeEventListener('change', update);
      }
    };
  }, []);

  return status;
}
