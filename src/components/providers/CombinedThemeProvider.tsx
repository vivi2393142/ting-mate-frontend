import { type ReactNode, useMemo } from 'react';

import { ThemeProvider } from '@react-navigation/native';
import { configureFonts, PaperProvider } from 'react-native-paper';

import useColorScheme from '@/hooks/useColorScheme';
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

export default CombinedThemeProvider;
