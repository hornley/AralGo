'use client';

import { useEffect, useState } from 'react';
import { loadStudySetup, studySetupStorageKey, type StudySetupDraft } from '@/lib/study/study-setup';

export function useLocalStudySetup() {
  const [setup, setSetup] = useState<StudySetupDraft | null>(null);

  useEffect(() => {
    const refreshSetup = () => setSetup(loadStudySetup());

    refreshSetup();
    window.addEventListener('storage', refreshSetup);
    window.addEventListener('aralgo.study-setup-updated', refreshSetup);

    return () => {
      window.removeEventListener('storage', refreshSetup);
      window.removeEventListener('aralgo.study-setup-updated', refreshSetup);
    };
  }, []);

  return setup;
}

export function isStudySetupStorageEvent(event: StorageEvent) {
  return event.key === studySetupStorageKey;
}
