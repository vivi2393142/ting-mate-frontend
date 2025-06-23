import { useMemo } from 'react';

import { Button, type ButtonProps } from 'react-native-paper';

import useAppTheme from '@/hooks/useAppTheme';
import { useUserTextSize } from '@/store/useUserStore';
import { StaticTheme } from '@/theme';
import { UserTextSize } from '@/types/user';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

import IconSymbol, { type IconName } from '@/components/atoms/IconSymbol';

interface ThemedButtonProps
  extends Omit<ButtonProps, 'icon' | 'color' | 'buttonColor' | 'textColor'> {
  icon?: IconName;
  color?: 'primary' | 'secondary' | 'error';
}

const ThemedButton = ({
  mode = 'contained',
  color = 'primary',
  icon,
  style,
  labelStyle,
  children,
  ...rest
}: ThemedButtonProps) => {
  const userTextSize = useUserTextSize();

  const theme = useAppTheme();

  const mergedColor = theme.colors[color];
  const styleParams = useMemo(
    () => ({ userTextSize, color: mergedColor }),
    [userTextSize, mergedColor],
  );
  const styles = getStyles(theme, styleParams);

  return (
    <Button
      mode={mode}
      buttonColor={mode === 'outlined' ? theme.colors.background : mergedColor}
      textColor={mode === 'outlined' ? mergedColor : theme.colors.onPrimary}
      icon={icon ? ({ color }) => <IconSymbol name={icon} color={color} size={16} /> : undefined}
      style={[styles.button, mode === 'outlined' && styles.buttonOutlined, style]}
      labelStyle={[styles.buttonLabel, labelStyle]}
      {...rest}
    >
      {children}
    </Button>
  );
};

export default ThemedButton;

interface StyleParams {
  userTextSize: UserTextSize;
  color: string;
}

const getStyles = createStyles<
  StyleRecord<'button' | 'buttonOutlined', 'buttonLabel'>,
  StyleParams
>({
  button: {
    borderRadius: StaticTheme.borderRadius.s,
  },
  buttonOutlined: {
    borderColor: (_, { color }) => color,
  },
  buttonLabel: {
    fontSize: ({ fonts }) => fonts.titleMedium.fontSize,
    fontWeight: ({ fonts }) => fonts.titleMedium.fontWeight,
    marginVertical: (_, { userTextSize }) =>
      userTextSize === UserTextSize.LARGE ? StaticTheme.spacing.xs * 5 : StaticTheme.spacing.md,
  },
});
