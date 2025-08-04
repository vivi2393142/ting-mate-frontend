import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const ONBOARDING_KEY = 'onboarding_shown';
const HAS_SET_ONBOARDING_ROLE_KEY = 'has_set_onboarding_role';
const VISITED_TASK_KEY = 'visited_task';
const VISITED_CONNECT_KEY = 'visited_connect';
const VISITED_SETTING_KEY = 'visited_settings';

interface OnboardingState {
  hasSeenOnboarding: boolean;
  hasSetOnboardingRole: boolean;
  hasVisitedTask: boolean;
  hasVisitedConnect: boolean;
  hasVisitedSettings: boolean;
}

interface OnboardingStateStore extends OnboardingState {
  hasInit: boolean;

  setHasSeenOnboarding: (value: boolean) => Promise<void>;
  setHasSetOnboardingRole: (value: boolean) => Promise<void>;
  setHasVisitedTask: (value: boolean) => Promise<void>;
  setHasVisitedConnect: (value: boolean) => Promise<void>;
  setHasVisitedSettings: (value: boolean) => Promise<void>;

  loadFromStorage: () => Promise<OnboardingState>;
}

export const useOnboardingStore = create<OnboardingStateStore>((set) => ({
  hasInit: false,

  hasSeenOnboarding: true,
  hasSetOnboardingRole: true,
  hasVisitedTask: true,
  hasVisitedConnect: true,
  hasVisitedSettings: true,

  setHasSeenOnboarding: async (value: boolean) => {
    await AsyncStorage.setItem(ONBOARDING_KEY, value ? 'true' : 'false');
    set({ hasSeenOnboarding: value });
  },
  setHasSetOnboardingRole: async (value: boolean) => {
    await AsyncStorage.setItem(HAS_SET_ONBOARDING_ROLE_KEY, value ? 'true' : 'false');
    set({ hasSetOnboardingRole: value });
  },
  setHasVisitedTask: async (value: boolean) => {
    await AsyncStorage.setItem(VISITED_TASK_KEY, value ? 'true' : 'false');
    set({ hasVisitedTask: value });
  },
  setHasVisitedConnect: async (value: boolean) => {
    await AsyncStorage.setItem(VISITED_CONNECT_KEY, value ? 'true' : 'false');
    set({ hasVisitedConnect: value });
  },
  setHasVisitedSettings: async (value: boolean) => {
    await AsyncStorage.setItem(VISITED_SETTING_KEY, value ? 'true' : 'false');
    set({ hasVisitedSettings: value });
  },

  loadFromStorage: async () => {
    set({ hasInit: true });
    const [onboarding, screens, task, connect, setting] = await Promise.allSettled([
      AsyncStorage.getItem(ONBOARDING_KEY),
      AsyncStorage.getItem(HAS_SET_ONBOARDING_ROLE_KEY),
      AsyncStorage.getItem(VISITED_TASK_KEY),
      AsyncStorage.getItem(VISITED_CONNECT_KEY),
      AsyncStorage.getItem(VISITED_SETTING_KEY),
    ]);
    const result = {
      hasSeenOnboarding: getInitStateSafely(onboarding),
      hasSetOnboardingRole: getInitStateSafely(screens),
      hasVisitedTask: getInitStateSafely(task),
      hasVisitedConnect: getInitStateSafely(connect),
      hasVisitedSettings: getInitStateSafely(setting),
    };
    set(result);
    return result;
  },
}));

// If cannot get state, default to false (not show onboarding)
const getInitStateSafely = (settled: PromiseSettledResult<string | null>) => {
  if (settled.status === 'fulfilled' && settled.value === 'true') {
    return true;
  } else {
    return false;
  }
};
