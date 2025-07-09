import { create } from 'zustand';

import {
  clearAnonymousId as clearAnonymousIdInStore,
  getOrCreateAnonymousId,
  updateAnonymousId as updateAnonymousIdInStore,
} from '@/hooks/useAnonymousId';
import { UserDisplayMode, UserTextSize, type User } from '@/types/user';

interface UserState {
  user: User | null;
  anonymousId: string | null;
  setUser: (user: User) => void;
  updateUserSettings: (settings: Partial<User['settings']>) => void;
  clearUser: () => void;
  initAnonymousId: () => Promise<void>;
  updateAnonymousId: (id: string) => Promise<void>;
  clearAnonymousId: () => Promise<void>;
}

// TODO: get init user from API
const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user: User) => set({ user }),
  updateUserSettings: (settings: Partial<User['settings']>) =>
    set((state) => ({
      user: state.user
        ? { ...state.user, settings: { ...state.user.settings, ...settings } }
        : null,
    })),
  clearUser: () => set({ user: null }),
  anonymousId: null,
  setAnonymousId: (id: string | null) => set({ anonymousId: id }),
  initAnonymousId: async () => {
    const id = await getOrCreateAnonymousId();
    set({ anonymousId: id });
  },
  updateAnonymousId: async (id: string) => {
    await updateAnonymousIdInStore(id);
    set({ anonymousId: id });
  },
  clearAnonymousId: async () => {
    await clearAnonymousIdInStore();
    set({ anonymousId: null });
  },
}));

export default useUserStore;

export const useUserTextSize = () =>
  useUserStore((state) => state.user?.settings.textSize ?? UserTextSize.STANDARD);

export const useUserDisplayMode = () =>
  useUserStore((state) => state.user?.settings.displayMode ?? UserDisplayMode.FULL);
