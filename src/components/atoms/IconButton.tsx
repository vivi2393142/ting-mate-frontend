import type { PressableProps, ViewStyle } from 'react-native';
import { Pressable, StyleSheet } from 'react-native';

import type { IconName } from '@/components/atoms/IconSymbol';
import useAppTheme from '@/hooks/useAppTheme';
import { StaticTheme } from '@/theme';

import IconSymbol from '@/components/atoms/IconSymbol';

interface IconButtonProps extends Omit<PressableProps, 'children'> {
  name: IconName;
  size?: number;
  color?: string;
  style?: ViewStyle;
}

const IconButton = ({ name, size = 16, color, style, ...props }: IconButtonProps) => {
  const theme = useAppTheme();

  return (
    <Pressable style={[styles.button, style]} {...props}>
      <IconSymbol name={name} size={size} color={color || theme.colors.primary} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: StaticTheme.spacing.xs,
  },
});

export default IconButton;
