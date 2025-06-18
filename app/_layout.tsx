import { useFonts } from 'expo-font';
import 'react-native-reanimated';

import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import useColorScheme from '@/hooks/useColorScheme';
import '@/i18n';
import {
  customDarkTheme,
  customLightTheme,
  navigationDarkTheme,
  navigationLightTheme,
} from '@/theme';

const RootLayout = () => {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../src/assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  const paperTheme = colorScheme === 'dark' ? customDarkTheme : customLightTheme;
  const navigationTheme = colorScheme === 'dark' ? navigationDarkTheme : navigationLightTheme;

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <ThemeProvider value={navigationTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </ThemeProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default RootLayout;
