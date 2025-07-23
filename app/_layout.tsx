import { useFonts } from 'expo-font';
import 'react-native-reanimated';

import { useOnboardingStore } from '@/store/useOnboardingStore';
import { QueryClientProvider } from '@tanstack/react-query';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import queryClient from '@/api/queryClient';
import useColorScheme from '@/hooks/useColorScheme';
import useStackScreenOptionsHelper from '@/hooks/useStackScreenOptionsHelper';
import '@/i18n';

import StaleDataRefreshSnackbar from '@/components/atoms/StaleDataRefreshButton';
import CombinedThemeProvider from '@/components/providers/CombinedThemeProvider';
import LocationSyncHandler from '@/components/providers/LocationSyncHandler';
import NotificationHandler from '@/components/providers/NotificationHandler';
import UserSyncHandler from '@/components/providers/UserSyncHandler';
import ROUTES from '@/constants/routes';

const RootLayout = () => {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../src/assets/fonts/SpaceMono-Regular.ttf'),
  });

  const getStackScreenOptions = useStackScreenOptionsHelper();

  useEffect(() => {
    if (useOnboardingStore.getState().hasInit) return;

    (async () => {
      const result = await useOnboardingStore.getState().loadFromStorage();
      if (!result.hasSeenOnboarding) router.replace(ROUTES.ONBOARDING_SLIDES);
    })();
  }, []);

  // Async font loading only occurs in development.
  if (!loaded) return null;
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <UserSyncHandler />
        <NotificationHandler />
        <CombinedThemeProvider>
          <LocationSyncHandler />
          <Stack>
            <Stack.Screen
              name="(tabs)"
              options={{ headerShown: false, ...getStackScreenOptions({ title: ROUTES.HOME }) }}
            />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <StaleDataRefreshSnackbar />
        </CombinedThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
};

export default RootLayout;
