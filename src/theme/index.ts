import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  type Theme as NavigationThemeType,
} from '@react-navigation/native';
import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';

import customColors from './colors.json';

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

export const iconSize = {
  standard: {
    small: 24,
    medium: 28,
    large: 32,
  },
  large: {
    small: 28,
    medium: 32,
    large: 36,
  },
};

export type CustomTheme = MD3Theme & {
  spacing: typeof spacing;
  iconSize: (typeof iconSize)['standard'];
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

/* Merged Theme */
export const customLightTheme: CustomTheme = {
  ...MD3LightTheme,
  colors: lightColors,
  spacing,
  iconSize: iconSize.standard,
};

export const customDarkTheme: CustomTheme = {
  ...MD3DarkTheme,
  colors: darkColors,
  spacing,
  iconSize: iconSize.large,
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
