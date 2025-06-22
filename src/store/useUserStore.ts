import { create } from 'zustand';

import { UserDisplayMode, UserTextSize, type User } from '@/types/user';

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  updateUserSettings: (settings: Partial<User['settings']>) => void;
  clearUser: () => void;
}

const useUserStore = create<UserState>((set) => ({
  // TODO: get init user from API
  user: {
    email: 'test@example.com',
    name: 'Test Doe',
    settings: {
      textSize: UserTextSize.STANDARD,
      displayMode: UserDisplayMode.FULL,
    },
  },
  setUser: (user: User) => set({ user }),
  updateUserSettings: (settings: Partial<User['settings']>) =>
    set((state) => ({
      user: state.user
        ? { ...state.user, settings: { ...state.user.settings, ...settings } }
        : null,
    })),
  clearUser: () => set({ user: null }),
}));

export default useUserStore;

export const useUserTextSize = () =>
  useUserStore((state) => state.user?.settings.textSize ?? UserTextSize.STANDARD);

export const useUserDisplayMode = () =>
  useUserStore((state) => state.user?.settings.displayMode ?? UserDisplayMode.FULL);
