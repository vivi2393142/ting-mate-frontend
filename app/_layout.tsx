import { useFonts } from 'expo-font';
import 'react-native-reanimated';

import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import queryClient from '@/api/queryClient';
import useColorScheme from '@/hooks/useColorScheme';
import '@/i18n';

import CombinedThemeProvider from '@/components/providers/CombinedThemeProvider';
import LocationSyncHandler from '@/components/providers/LocationSyncHandler';
import NotificationHandler from '@/components/providers/NotificationHandler';
import UserSyncHandler from '@/components/providers/UserSyncHandler';
import ROUTES from '@/constants/routes';
import useStackScreenOptionsHelper from '@/hooks/useStackScreenOptionsHelper';

const RootLayout = () => {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../src/assets/fonts/SpaceMono-Regular.ttf'),
  });

  const getStackScreenOptions = useStackScreenOptionsHelper();

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
        </CombinedThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
};

export default RootLayout;
