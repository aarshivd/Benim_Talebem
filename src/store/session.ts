import { create } from 'zustand';
import { db } from '@/db/client';
import { getSetting, setSetting } from '@/db/repositories/settings';
import { hasPin } from '@/lib/pin';

interface SessionState {
  isSetupDone: boolean;
  isUnlocked: boolean;
  teacherName: string | null;
  lastBackgroundAt: number | null;
  isInitialized: boolean;
  
  init: () => Promise<void>;
  unlock: () => void;
  lock: () => void;
  recordBackground: () => void;
  checkAutoLock: () => Promise<void>;
  completeSetup: (name: string) => Promise<void>;
}

export const useSession = create<SessionState>((set, get) => ({
  isSetupDone: false,
  isUnlocked: false,
  teacherName: null,
  lastBackgroundAt: null,
  isInitialized: false,

  init: async () => {
    try {
      // onboarded bayrağını DB'den oku
      const onboarded = await getSetting(db, 'onboarded' as any, false);
      const name = await getSetting(db, 'teacher_name' as any, '');
      const pinExists = await hasPin();

      set({
        isSetupDone: onboarded && pinExists,
        teacherName: name || null,
        isUnlocked: false, // İlk açılışta kilitli
        isInitialized: true,
      });
    } catch (e) {
      console.error('Session init error:', e);
      set({ isInitialized: true });
    }
  },

  unlock: () => set({ isUnlocked: true, lastBackgroundAt: null }),
  
  lock: () => set({ isUnlocked: false }),

  recordBackground: () => set({ lastBackgroundAt: Date.now() }),

  checkAutoLock: async () => {
    const state = get();
    if (!state.isUnlocked || !state.lastBackgroundAt || !state.isSetupDone) return;

    const autoLockSeconds = await getSetting(db, 'auto_lock_seconds', 60);
    if (autoLockSeconds === 0) return; // Devre dışı

    const elapsedSeconds = (Date.now() - state.lastBackgroundAt) / 1000;
    if (elapsedSeconds >= autoLockSeconds) {
      set({ isUnlocked: false, lastBackgroundAt: null });
    } else {
      set({ lastBackgroundAt: null });
    }
  },

  completeSetup: async (name: string) => {
    await setSetting(db, 'teacher_name' as any, name);
    await setSetting(db, 'onboarded' as any, true);
    set({
      teacherName: name,
      isSetupDone: true,
      isUnlocked: true, // Kurulum bitince direkt kilitsiz
    });
  }
}));
