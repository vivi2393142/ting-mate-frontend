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

interface AuthState {
  anonymousId: string | null;
  initAnonymousId: () => Promise<void>;
  updateAnonymousId: (id: string) => Promise<void>;
  clearAnonymousId: () => Promise<void>;

  token: string | null;
  initToken: () => Promise<void>;
  updateToken: (token: string) => Promise<void>;
  clearToken: () => Promise<void>;

  isInit: boolean;
  initStore: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
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

  isInit: false,
  initStore: async () => {
    const id = await getOrCreateAnonymousId();
    set({ anonymousId: id });

    const token = await getOrCreateToken();
    set({ token });

    set({ isInit: true });
  },
}));

export default useAuthStore;
