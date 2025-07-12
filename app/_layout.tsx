import { useFonts } from 'expo-font';
import { type ReactNode, useEffect, useMemo } from 'react';
import 'react-native-reanimated';

import { ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { configureFonts, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import queryClient from '@/api/queryClient';
import { useCurrentUser } from '@/api/user';
import useColorScheme from '@/hooks/useColorScheme';
import '@/i18n';
import { NotificationService } from '@/services/notification';
import useUserStore, { useUserTextSize } from '@/store/useUserStore';
import {
  customDarkTheme,
  iconSize as customIconSize,
  customLightTheme,
  navigationDarkTheme,
  navigationLightTheme,
} from '@/theme';
import customFonts from '@/theme/fonts';
import { UserTextSize } from '@/types/user';
import { useTranslation } from 'react-i18next';

const CombinedThemeProvider = ({ children }: { children: ReactNode }) => {
  const userTextSize = useUserTextSize();
  const colorScheme = useColorScheme();

  const paperTheme = useMemo(
    () => ({
      ...(colorScheme === 'dark' ? customDarkTheme : customLightTheme),
      iconSize: customIconSize[userTextSize === UserTextSize.LARGE ? 'large' : 'standard'],
      fonts: configureFonts({
        config: customFonts[userTextSize],
      }),
    }),
    [userTextSize, colorScheme],
  );
  const navigationTheme = colorScheme === 'dark' ? navigationDarkTheme : navigationLightTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <ThemeProvider value={navigationTheme}>{children}</ThemeProvider>
    </PaperProvider>
  );
};

// User data sync handler, data will be synced to store by queryClient
const UserSyncHandler = () => {
  const { token, anonymousId } = useUserStore.getState();
  useCurrentUser({ enabled: !!(token || anonymousId) });

  return null;
};

const RootLayout = () => {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../src/assets/fonts/SpaceMono-Regular.ttf'),
  });

  const { t } = useTranslation('common');

  // Initialize anonymousId and token on app start
  useEffect(() => {
    useUserStore.getState().initAnonymousId();
    useUserStore.getState().initToken();
  }, []);

  // Initialize mock data and notifications when the app starts
  useEffect(() => {
    (async () => {
      // Initialize notifications
      try {
        const { localNotificationsEnabled } = await NotificationService.initialize();
        if (localNotificationsEnabled) {
          // TODO: notification - update too many notifications cause performance issue, change it to update only the changed task
          // await NotificationService.reinitializeAllLocalNotifications(tasks);
        }

        // Setup notification listeners
        NotificationService.setupPushNotificationListeners({
          onReceive: () => {
            // TODO: Handle notification received
          },
          onRespond: () => {
            // TODO: Handle notification response
          },
        });
      } catch (error) {
        if (__DEV__) console.error('Failed to initialize notifications:', error);
      }
    })();
  }, []); // Only run once on mount

  // Async font loading only occurs in development.
  if (!loaded) return null;
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <UserSyncHandler />
        <CombinedThemeProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false, title: t('Home') }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </CombinedThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
};

export default RootLayout;
