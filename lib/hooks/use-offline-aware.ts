import { useNetworkStatus } from './use-network-status';

export type OfflineMode = 'online-fast' | 'online-slow' | 'offline';

export interface OfflineAware {
  mode: OfflineMode;
  isOnline: boolean;
  isSlow: boolean;
  isOffline: boolean;
  shouldReducePayload: boolean;
  shouldSuppressAnimations: boolean;
  shouldSuppressImages: boolean;
}

export function useOfflineAware(): OfflineAware {
  const { quality, isOnline } = useNetworkStatus();

  const isSlow = isOnline && quality === 'slow';
  const isOffline = !isOnline || quality === 'offline';

  const mode: OfflineMode = isOffline ? 'offline' : isSlow ? 'online-slow' : 'online-fast';

  return {
    mode,
    isOnline,
    isSlow,
    isOffline,
    shouldReducePayload: isSlow || isOffline,
    shouldSuppressAnimations: isSlow || isOffline,
    shouldSuppressImages: quality === 'slow' || isOffline,
  };
}
