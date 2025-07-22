import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const ONBOARDING_KEY = 'onboarding_shown';
const VISITED_TASK_KEY = 'visited_task';
const VISITED_CONNECT_KEY = 'visited_connect';
const VISITED_SETTING_KEY = 'visited_setting';

interface OnboardingState {
  hasSeenOnboarding: boolean;
  hasVisitedTask: boolean;
  hasVisitedConnect: boolean;
  hasVisitedSetting: boolean;

  setHasSeenOnboarding: (value: boolean) => Promise<void>;
  setHasVisitedTask: (value: boolean) => Promise<void>;
  setHasVisitedConnect: (value: boolean) => Promise<void>;
  setHasVisitedSetting: (value: boolean) => Promise<void>;

  loadFromStorage: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  hasSeenOnboarding: true,
  hasVisitedTask: true,
  hasVisitedConnect: true,
  hasVisitedSetting: true,

  setHasSeenOnboarding: async (value: boolean) => {
    await AsyncStorage.setItem(ONBOARDING_KEY, value ? 'true' : 'false');
    set({ hasSeenOnboarding: value });
  },
  setHasVisitedTask: async (value: boolean) => {
    await AsyncStorage.setItem(VISITED_TASK_KEY, value ? 'true' : 'false');
    set({ hasVisitedTask: value });
  },
  setHasVisitedConnect: async (value: boolean) => {
    await AsyncStorage.setItem(VISITED_CONNECT_KEY, value ? 'true' : 'false');
    set({ hasVisitedConnect: value });
  },
  setHasVisitedSetting: async (value: boolean) => {
    await AsyncStorage.setItem(VISITED_SETTING_KEY, value ? 'true' : 'false');
    set({ hasVisitedSetting: value });
  },

  loadFromStorage: async () => {
    const [onboarding, task, connect, setting] = await Promise.all([
      AsyncStorage.getItem(ONBOARDING_KEY),
      AsyncStorage.getItem(VISITED_TASK_KEY),
      AsyncStorage.getItem(VISITED_CONNECT_KEY),
      AsyncStorage.getItem(VISITED_SETTING_KEY),
    ]);
    console.log({ onboarding, task, connect, setting });
    set({
      hasSeenOnboarding: onboarding === 'true',
      hasVisitedTask: task === 'true',
      hasVisitedConnect: connect === 'true',
      hasVisitedSetting: setting === 'true',
    });
  },
}));
