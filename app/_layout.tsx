import { useFonts } from 'expo-font';
import { type ReactNode, useMemo } from 'react';
import 'react-native-reanimated';

import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { configureFonts, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import useColorScheme from '@/hooks/useColorScheme';
import '@/i18n';
import useUserStore from '@/store/useUserStore';
import {
  customDarkTheme,
  iconSize as customIconSize,
  customLightTheme,
  navigationDarkTheme,
  navigationLightTheme,
} from '@/theme';
import customFonts from '@/theme/fonts.json';
import { UserTextSize } from '@/types/user';

const CombinedThemeProvider = ({ children }: { children: ReactNode }) => {
  const userState = useUserStore((state) => state.user);
  const colorScheme = useColorScheme();

  const paperTheme = useMemo(() => {
    const userTextSize = userState?.settings.textSize === UserTextSize.LARGE ? 'large' : 'standard';

    return {
      ...(colorScheme === 'dark' ? customDarkTheme : customLightTheme),
      iconSize: customIconSize[userTextSize],
      fonts: configureFonts({
        config: customFonts[userTextSize],
      }),
    };
  }, [userState?.settings.textSize, colorScheme]);
  const navigationTheme = colorScheme === 'dark' ? navigationDarkTheme : navigationLightTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <ThemeProvider value={navigationTheme}>{children}</ThemeProvider>
    </PaperProvider>
  );
};

const RootLayout = () => {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../src/assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Async font loading only occurs in development.
  if (!loaded) return null;
  return (
    <SafeAreaProvider>
      <CombinedThemeProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </CombinedThemeProvider>
    </SafeAreaProvider>
  );
};

export default RootLayout;
