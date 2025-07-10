import { UserDisplayMode, UserTextSize, type User } from '@/types/user';
import * as SecureStore from 'expo-secure-store';
import uuid from 'react-native-uuid';
import { create } from 'zustand';

const ANONYMOUS_ID_KEY = 'anonymous_user_id';
const TOKEN_KEY = 'token';

// AnonymousId helpers
const getOrCreateAnonymousId = async () => {
  let id = await SecureStore.getItemAsync(ANONYMOUS_ID_KEY);
  if (!id) {
    id = uuid.v4();
    await SecureStore.setItemAsync(ANONYMOUS_ID_KEY, id);
  }
  return id;
};
const updateAnonymousId = async (id: string) => {
  await SecureStore.setItemAsync(ANONYMOUS_ID_KEY, id);
};
const clearAnonymousId = async () => {
  await SecureStore.deleteItemAsync(ANONYMOUS_ID_KEY);
};

// Token helpers
const getOrCreateToken = async () => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  return token ?? null;
};
const updateToken = async (token: string) => {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
};
const clearToken = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
};

interface UserState {
  user: User | null;
  anonymousId: string | null;
  setUser: (user: User) => void;
  updateLoginUser: (partialUser: Pick<User, 'email' | 'role'>) => void;
  updateUserSettings: (settings: Partial<User['settings']>) => void;
  clearUser: () => void;
  initAnonymousId: () => Promise<void>;
  updateAnonymousId: (id: string) => Promise<void>;
  clearAnonymousId: () => Promise<void>;
  token: string | null;
  initToken: () => Promise<void>;
  updateToken: (token: string) => Promise<void>;
  clearToken: () => Promise<void>;
}

const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user: User) => set({ user }),
  updateLoginUser: (partialUser: Pick<User, 'email' | 'role'>) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...partialUser } : null,
    })),
  updateUserSettings: (settings: Partial<User['settings']>) =>
    set((state) => ({
      user: state.user
        ? { ...state.user, settings: { ...state.user.settings, ...settings } }
        : null,
    })),
  clearUser: () => set({ user: null }),
  anonymousId: null,
  initAnonymousId: async () => {
    const id = await getOrCreateAnonymousId();
    set({ anonymousId: id });
  },
  updateAnonymousId: async (id: string) => {
    await updateAnonymousId(id);
    set({ anonymousId: id });
  },
  clearAnonymousId: async () => {
    await clearAnonymousId();
    set({ anonymousId: null });
  },
  token: null,
  initToken: async () => {
    const token = await getOrCreateToken();
    set({ token });
  },
  updateToken: async (token: string) => {
    await updateToken(token);
    set({ token });
  },
  clearToken: async () => {
    await clearToken();
    set({ token: null });
  },
}));

export default useUserStore;

export const useUserTextSize = () =>
  useUserStore((state) => state.user?.settings.textSize ?? UserTextSize.STANDARD);

export const useUserDisplayMode = () =>
  useUserStore((state) => state.user?.settings.displayMode ?? UserDisplayMode.FULL);
