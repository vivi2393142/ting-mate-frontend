import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const ONBOARDING_KEY = 'onboarding_shown';

export interface UseOnboardingState {
  hasSeenOnboarding: boolean | undefined;
  setHasSeenOnboarding: (value: boolean) => Promise<void>;
}

export const useOnboardingState = (): UseOnboardingState => {
  const [hasSeenOnboarding, setHasSeenOnboardingState] = useState<boolean>(true);

  useEffect(() => {
    const loadState = async () => {
      try {
        const value = await AsyncStorage.getItem(ONBOARDING_KEY);
        // Weather it's NULL or 'false' will force user to see onboarding
        setHasSeenOnboardingState(value === 'true');
      } catch {
        setHasSeenOnboardingState(true);
      }
    };
    loadState();
  }, []);

  const setHasSeenOnboarding = useCallback(async (value: boolean) => {
    await AsyncStorage.setItem(ONBOARDING_KEY, value ? 'true' : 'false');
    setHasSeenOnboardingState(value);
  }, []);

  return { hasSeenOnboarding, setHasSeenOnboarding };
};
