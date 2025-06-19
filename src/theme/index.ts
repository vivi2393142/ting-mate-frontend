import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  type Theme as NavigationThemeType,
} from '@react-navigation/native';
import type { MD3Theme } from 'react-native-paper';
import { configureFonts, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

import customColors from './colors.json';
import customFonts from './fonts.json';

// Base spacing unit (in pixels)
const BASE_SPACING = 4;

export const spacing = {
  xs: BASE_SPACING, // 4
  sm: BASE_SPACING * 2, // 8
  md: BASE_SPACING * 4, // 16
  lg: BASE_SPACING * 6, // 24
  xl: BASE_SPACING * 8, // 32
  xxl: BASE_SPACING * 12, // 48
} as const;

type CustomTheme = MD3Theme & {
  spacing: typeof spacing;
};

/* Custom Theme */
const lightColors = {
  ...MD3LightTheme.colors,
  ...customColors.schemes.light,
};

const darkColors = {
  ...MD3DarkTheme.colors,
  ...customColors.schemes.dark,
};

// For the elderly-friendly design, font should be larger than 16
const fonts = configureFonts({
  config: customFonts,
});

/* Merged Theme */
export const customLightTheme: CustomTheme = {
  ...MD3LightTheme,
  colors: lightColors,
  fonts,
  spacing,
};

export const customDarkTheme: CustomTheme = {
  ...MD3DarkTheme,
  colors: darkColors,
  fonts,
  spacing,
};

const getNavigationThemeColors = (
  colors: typeof customColors.schemes.light,
): NavigationThemeType['colors'] => ({
  primary: colors.primary,
  background: colors.background,
  card: colors.background,
  text: colors.onSurface,
  border: colors.outlineVariant,
  notification: colors.error,
});

export const navigationLightTheme: NavigationThemeType = {
  ...NavigationDefaultTheme,
  colors: getNavigationThemeColors(customColors.schemes.light),
};

export const navigationDarkTheme: NavigationThemeType = {
  ...NavigationDarkTheme,
  colors: getNavigationThemeColors(customColors.schemes.dark),
};
