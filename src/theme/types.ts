import type { Theme as NavigationTheme } from '@react-navigation/native';
import type { MD3Theme } from 'react-native-paper';

export type AppTheme = {
  paperTheme: MD3Theme;
  navigationTheme: NavigationTheme;
  colors: MD3Theme['colors'];
  fonts: MD3Theme['fonts'];
  dark: boolean;
};

export type Spacing = keyof typeof import('./constants').SPACING;
export type BorderRadius = keyof typeof import('./constants').BORDER_RADIUS;
export type Elevation = keyof typeof import('./constants').ELEVATION;
export type ZIndex = keyof typeof import('./constants').Z_INDEX;

export type AnimationDuration = keyof typeof import('./constants').ANIMATION.duration;
export type AnimationEasing = keyof typeof import('./constants').ANIMATION.easing;
