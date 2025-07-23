import type { ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';
import { IconButton, type IconButtonProps } from 'react-native-paper';

import type { IconName } from '@/components/atoms/IconSymbol';

import IconSymbol from '@/components/atoms/IconSymbol';
import useAppTheme from '@/hooks/useAppTheme';

const sizeMap = {
  button: {
    tiny: 8,
    small: 12,
    medium: 16,
    large: 20,
    xlarge: 24,
  },
  icon: {
    tiny: 16,
    small: 20,
    medium: 24,
    large: 28,
    xlarge: 32,
  },
};

const outlinedSizeMap = {
  button: {
    tiny: 8,
    small: 12,
    medium: 16,
    large: 20,
    xlarge: 24,
  },
  icon: {
    tiny: 8,
    small: 12,
    medium: 16,
    large: 20,
    xlarge: 24,
  },
};

interface ThemedIconButtonProps extends Omit<IconButtonProps, 'icon' | 'size'> {
  name: IconName;
  size?: 'tiny' | 'small' | 'medium' | 'large' | 'xlarge';
  color?: string;
  style?: ViewStyle;
}

const ThemedIconButton = ({
  name,
  size = 'small',
  color,
  style,
  ...props
}: ThemedIconButtonProps) => {
  const theme = useAppTheme();

  const sizes = props.mode === 'outlined' ? outlinedSizeMap : sizeMap;

  return (
    <IconButton
      icon={() => (
        <IconSymbol
          name={name}
          size={sizes.icon[size]}
          color={props.disabled ? theme.colors.outlineVariant : color || theme.colors.primary}
        />
      )}
      size={sizes.button[size]}
      style={[
        styles.button,
        props.mode === 'outlined' ? { borderColor: color } : style,
        props.disabled && { borderColor: theme.colors.outlineVariant },
      ]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  button: {
    margin: 0,
  },
});

export default ThemedIconButton;
