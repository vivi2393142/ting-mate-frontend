import { useMemo, type ReactNode } from 'react';
import type { ColorValue } from 'react-native';
import { Text, type TextProps } from 'react-native-paper';

import useAppTheme from '@/hooks/useAppTheme';
import { Theme } from '@/theme';
import { createStyles, StyleRecord } from '@/utils/createStyles';

type TextVariant =
  | 'headlineSmall'
  | 'headlineMedium'
  | 'headlineLarge'
  | 'titleLarge'
  | 'titleMedium'
  | 'titleSmall'
  | 'bodyLarge'
  | 'bodyMedium'
  | 'bodySmall';

interface ThemedTextProps extends Omit<TextProps<never>, 'variant' | 'color'> {
  variant?: TextVariant;
  color?: keyof Theme['colors'];
  children: ReactNode;
}

const ThemedText = ({
  style,
  variant = 'bodyLarge',
  color: colorKey = 'onSurface',
  children,
  ...props
}: ThemedTextProps) => {
  const theme = useAppTheme();
  const styles = getStyles(theme);

  const mergedStyle = useMemo(
    () => [
      { color: theme.colors[colorKey] as ColorValue },
      styles[variant],
      ...(Array.isArray(style) ? style : [style]),
    ],
    [theme.colors, colorKey, styles, variant, style],
  );

  return (
    <Text style={mergedStyle} {...props}>
      {children}
    </Text>
  );
};

const getStyles = createStyles<StyleRecord<never, TextVariant>>({
  headlineSmall: {
    fontSize: ({ fonts }) => fonts.headlineSmall.fontSize,
    fontWeight: ({ fonts }) => fonts.headlineSmall.fontWeight,
    lineHeight: ({ fonts }) => fonts.headlineSmall.lineHeight,
  },
  headlineMedium: {
    fontSize: ({ fonts }) => fonts.headlineMedium.fontSize,
    fontWeight: ({ fonts }) => fonts.headlineMedium.fontWeight,
    lineHeight: ({ fonts }) => fonts.headlineMedium.lineHeight,
  },
  headlineLarge: {
    fontSize: ({ fonts }) => fonts.headlineLarge.fontSize,
    fontWeight: ({ fonts }) => fonts.headlineLarge.fontWeight,
    lineHeight: ({ fonts }) => fonts.headlineLarge.lineHeight,
  },
  titleLarge: {
    fontSize: ({ fonts }) => fonts.titleLarge.fontSize,
    fontWeight: ({ fonts }) => fonts.titleLarge.fontWeight,
    lineHeight: ({ fonts }) => fonts.titleLarge.lineHeight,
  },
  titleMedium: {
    fontSize: ({ fonts }) => fonts.titleMedium.fontSize,
    fontWeight: ({ fonts }) => fonts.titleMedium.fontWeight,
    lineHeight: ({ fonts }) => fonts.titleMedium.lineHeight,
  },
  titleSmall: {
    fontSize: ({ fonts }) => fonts.titleSmall.fontSize,
    fontWeight: ({ fonts }) => fonts.titleSmall.fontWeight,
    lineHeight: ({ fonts }) => fonts.titleSmall.lineHeight,
  },
  bodyLarge: {
    fontSize: ({ fonts }) => fonts.bodyLarge.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyLarge.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodyLarge.lineHeight,
  },
  bodyMedium: {
    fontSize: ({ fonts }) => fonts.bodyMedium.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyMedium.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodyMedium.lineHeight,
  },
  bodySmall: {
    fontSize: ({ fonts }) => fonts.bodySmall.fontSize,
    fontWeight: ({ fonts }) => fonts.bodySmall.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodySmall.lineHeight,
  },
});

export default ThemedText;
