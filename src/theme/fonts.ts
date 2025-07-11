import { UserTextSize } from '@/types/user';
import { MD3Type, MD3TypescaleKey } from 'react-native-paper/lib/typescript/types';

const fonts: Record<UserTextSize, Record<MD3TypescaleKey, Partial<MD3Type>>> = {
  [UserTextSize.STANDARD]: {
    displaySmall: {
      fontSize: 36,
      lineHeight: 44,
    },
    displayMedium: {
      fontSize: 45,
      lineHeight: 52,
    },
    displayLarge: {
      fontSize: 57,
      lineHeight: 64,
    },
    headlineSmall: {
      fontSize: 20,
      lineHeight: 28,
      fontWeight: '600',
    },
    headlineMedium: {
      fontSize: 24,
      lineHeight: 32,
    },
    headlineLarge: {
      fontSize: 28,
      lineHeight: 38,
    },
    titleSmall: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '700',
    },
    titleMedium: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '700',
    },
    titleLarge: {
      fontSize: 20,
      lineHeight: 26,
      fontWeight: '700',
    },
    labelSmall: {
      fontSize: 11,
      lineHeight: 16,
    },
    labelMedium: {
      fontSize: 12,
      lineHeight: 16,
    },
    labelLarge: {
      fontSize: 14,
      lineHeight: 20,
    },
    bodySmall: {
      fontSize: 12,
      lineHeight: 16,
    },
    bodyMedium: {
      fontSize: 14,
      lineHeight: 20,
    },
    bodyLarge: {
      fontSize: 16,
      lineHeight: 24,
    },
  },
  [UserTextSize.LARGE]: {
    displaySmall: {
      fontSize: 44,
      lineHeight: 56,
    },
    displayMedium: {
      fontSize: 54,
      lineHeight: 68,
    },
    displayLarge: {
      fontSize: 68,
      lineHeight: 80,
    },
    headlineSmall: {
      fontSize: 30,
      lineHeight: 40,
      fontWeight: '600',
    },
    headlineMedium: {
      fontSize: 36,
      lineHeight: 48,
    },
    headlineLarge: {
      fontSize: 40,
      lineHeight: 52,
    },
    titleSmall: {
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '700',
    },
    titleMedium: {
      fontSize: 20,
      lineHeight: 28,
      fontWeight: '700',
    },
    titleLarge: {
      fontSize: 26,
      lineHeight: 36,
      fontWeight: '700',
    },
    labelSmall: {
      fontSize: 16,
      lineHeight: 24,
    },
    labelMedium: {
      fontSize: 17,
      lineHeight: 24,
    },
    labelLarge: {
      fontSize: 20,
      lineHeight: 28,
    },
    bodySmall: {
      fontSize: 16,
      lineHeight: 24,
    },
    bodyMedium: {
      fontSize: 18,
      lineHeight: 24,
    },
    bodyLarge: {
      fontSize: 20,
      lineHeight: 28,
    },
  },
};

export default fonts;
