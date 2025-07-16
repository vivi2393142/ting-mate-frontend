import { UserDisplayMode, UserTextSize, type User } from '@/types/user';
import { create } from 'zustand';

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  updateLoginUser: (partialUser: Pick<User, 'email' | 'role'>) => void;
  updateUserSettings: (settings: Partial<User['settings']>) => void;
  clearUser: () => void;
}

const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user: User) => set({ user }),
  updateLoginUser: (partialUser: Pick<User, 'email' | 'role'>) =>
    set((state) => ({
      user: state.user ? { ...state.user, email: partialUser.email, role: partialUser.role } : null,
    })),
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
  useUserStore((s) => s.user?.settings.textSize ?? UserTextSize.STANDARD);

export const useUserDisplayMode = () =>
  useUserStore((s) => s.user?.settings.displayMode ?? UserDisplayMode.FULL);
