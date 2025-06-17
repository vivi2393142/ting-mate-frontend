import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  type Theme as NavigationThemeType,
} from '@react-navigation/native';
import type { MD3Theme } from 'react-native-paper';
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

import figmaTheme from './figmaTheme.json';

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
  ...figmaTheme.schemes.light,
};

const darkColors = {
  ...MD3DarkTheme.colors,
  ...figmaTheme.schemes.dark,
};

const fonts = {
  ...MD3LightTheme.fonts,
};

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
  colors: typeof figmaTheme.schemes.light,
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
  colors: getNavigationThemeColors(figmaTheme.schemes.light),
};

export const navigationDarkTheme: NavigationThemeType = {
  ...NavigationDarkTheme,
  colors: getNavigationThemeColors(figmaTheme.schemes.dark),
};
