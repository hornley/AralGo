'use client';

import { useEffect, useState, useRef } from 'react';
import { useNetworkStatus, type NetworkQuality } from '@/lib/hooks/use-network-status';

const DEBOUNCE_MS = 3000;

const SLOW_TEXT = {
  en: 'Slow connection detected',
  fil: 'Mabagal ang koneksyon',
};

export default function NetworkBanner() {
  const { quality, isOnline } = useNetworkStatus();
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shouldShow = !isOnline || quality === 'slow' || quality === 'offline';

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(
      () => setVisible(shouldShow),
      shouldShow ? DEBOUNCE_MS : 0,
    );

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [shouldShow]);

  if (!visible) return null;

  const isOffline = quality === 'offline' || !isOnline;
  const message = isOffline ? 'Walang koneksyon / No connection' : `${SLOW_TEXT.fil} / ${SLOW_TEXT.en}`;

  return (
    <div
      style={{
        padding: '8px 16px',
        textAlign: 'center',
        fontSize: '0.85rem',
        fontWeight: 600,
        backgroundColor: isOffline ? '#fce8e8' : '#fff3cd',
        color: isOffline ? '#8a1f1f' : '#856404',
        borderBottom: `1px solid ${isOffline ? '#f3b7b7' : '#ffc107'}`,
      }}
    >
      {message}
    </div>
  );
}
