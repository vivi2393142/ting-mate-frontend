import { useFonts } from 'expo-font';
import { type ReactNode, useEffect, useMemo } from 'react';
import 'react-native-reanimated';

import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { configureFonts, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import useColorScheme from '@/hooks/useColorScheme';
import '@/i18n';
import useMockAPI from '@/store/useMockAPI';
import { useUserTextSize } from '@/store/useUserStore';
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

const RootLayout = () => {
  const colorScheme = useColorScheme();
  const { initializeMockData } = useMockAPI();
  const [loaded] = useFonts({
    SpaceMono: require('../src/assets/fonts/SpaceMono-Regular.ttf'),
  });

  const { t } = useTranslation('common');

  // Initialize mock data when the app starts
  useEffect(() => {
    initializeMockData();
  }, [initializeMockData]);

  // Async font loading only occurs in development.
  if (!loaded) return null;
  return (
    <SafeAreaProvider>
      <CombinedThemeProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false, title: t('Home') }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </CombinedThemeProvider>
    </SafeAreaProvider>
  );
};

export default RootLayout;
