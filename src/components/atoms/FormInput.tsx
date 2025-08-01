import type { ReactNode } from 'react';
import type { GestureResponderEvent, ViewStyle } from 'react-native';
import { View } from 'react-native';
import { TextInput, TouchableRipple, type TextInputProps } from 'react-native-paper';

import useAppTheme from '@/hooks/useAppTheme';
import { useUserTextSize } from '@/store/useUserStore';
import { StaticTheme } from '@/theme';
import { UserTextSize } from '@/types/user';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

import IconSymbol, { type IconName } from '@/components/atoms/IconSymbol';
import ThemedText from '@/components/atoms/ThemedText';
import ThemedView from '@/components/atoms/ThemedView';

interface MultiLineButtonProps {
  onPress: (e: GestureResponderEvent) => void;
  icon?: IconName;
  disabled?: boolean;
  multiline?: boolean; // true: text wrap, false: ellipsis
  color?: string;
  dense?: boolean;
  valueAlign?: 'left' | 'right';
  placeholder?: string;
  children: ReactNode;
}

const MultiLineButton = ({
  onPress,
  icon,
  children,
  disabled = false,
  multiline = true,
  color,
  dense = true,
  valueAlign = 'left',
  placeholder,
}: MultiLineButtonProps) => {
  const theme = useAppTheme();
  const styles = getMultiLineButtonStyles(theme);

  const textProps = multiline ? {} : { numberOfLines: 1 as const, ellipsizeMode: 'tail' as const };
  return (
    <TouchableRipple
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, disabled && styles.disabledButton, !dense && styles.buttonNoDense]}
      rippleColor={theme.colors.primary + '22'}
      accessibilityRole="button"
    >
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <ThemedText
            style={[
              styles.text,
              valueAlign === 'right' && styles.textAlignRight,
              { color: children ? color : theme.colors.outline },
            ]}
            {...textProps}
          >
            {children || placeholder}
          </ThemedText>
        </View>
        {icon && (
          <IconSymbol
            name={icon}
            size={StaticTheme.iconSize.s}
            color={color || theme.colors.onSurface}
          />
        )}
      </View>
    </TouchableRipple>
  );
};

type FormInputProps = Omit<TextInputProps, 'mode' | 'value' | 'style' | 'onPress'> & {
  label: string;
  divider?: boolean;
  dense?: boolean;
  icon?: IconName;
  rightIconName?: IconName;
  style?: ViewStyle;
  multiline?: boolean;
  valueColor?: string;
  onPress?: (e: GestureResponderEvent) => void;
} & (
    | {
        value: string;
        placeholder?: string;
        onChangeValue?: (value: string) => void;
        render?: never;
      }
    | {
        render: () => ReactNode;
        value?: never;
        placeholder?: never;
        onChangeValue?: never;
      }
  ) &
  (
    | {
        valueAlign?: 'left';
        helperText?: never;
      }
    | {
        valueAlign: 'right';
        helperText?: string;
      }
  );

const Input = ({
  value,
  valueAlign = 'left',
  placeholder,
  rightIconName,
  multiline,
  valueColor,
  onPress,
  onChangeValue,
  render,
  ...rest
}: Omit<FormInputProps, 'label' | 'icon' | 'divider' | 'helperText' | 'style'>) => {
  const theme = useAppTheme();
  const userTextSize = useUserTextSize();
  const styles = getStyles(theme, { userTextSize });

  if (render) return render();
  return onPress ? (
    <MultiLineButton
      onPress={onPress}
      icon={rightIconName}
      multiline={multiline}
      color={valueColor}
      dense={rest.dense}
      valueAlign={valueAlign}
      placeholder={placeholder}
    >
      {value}
    </MultiLineButton>
  ) : (
    <TextInput
      dense
      value={value}
      placeholder={placeholder}
      onChangeText={onChangeValue}
      mode="outlined"
      outlineColor="transparent"
      activeOutlineColor="transparent"
      textColor={valueColor || theme.colors.onSurfaceVariant}
      selectionColor={theme.colors.primary}
      placeholderTextColor={theme.colors.outline}
      {...rest}
      style={[styles.input, valueAlign === 'right' && styles.inputAlignRight]}
      contentStyle={[styles.contentStyle, rest.contentStyle]}
    />
  );
};

const FormInput = ({
  label,
  icon,
  divider = true,
  dense = true,
  helperText,
  style,
  ...rest
}: FormInputProps) => {
  const theme = useAppTheme();
  const userTextSize = useUserTextSize();
  const styles = getStyles(theme, { userTextSize });

  return (
    <ThemedView style={[styles.row, style]}>
      {icon && (
        <ThemedView style={styles.iconBox}>
          <IconSymbol name={icon} size={StaticTheme.iconSize.s} color={theme.colors.onSurface} />
        </ThemedView>
      )}
      <ThemedView
        style={[
          styles.inputContainer,
          !divider && styles.inputContainerNoDivider,
          !dense && styles.inputContainerNoDense,
        ]}
      >
        <ThemedView
          style={[
            styles.labelContainer,
            rest.valueAlign === 'right' && styles.labelContainerAlignRight,
          ]}
        >
          <ThemedText>{label}</ThemedText>
          {rest.valueAlign === 'right' && helperText && (
            <ThemedText variant="bodySmall" color="outline" style={styles.helperText}>
              {helperText}
            </ThemedText>
          )}
        </ThemedView>
        <Input dense={dense} {...rest} />
      </ThemedView>
    </ThemedView>
  );
};

export default FormInput;

const getMultiLineButtonStyles = createStyles<
  StyleRecord<
    'content' | 'button' | 'buttonNoDense' | 'disabledButton' | 'textContainer',
    'text' | 'textAlignRight'
  >
>({
  button: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    minHeight: 48,
    paddingHorizontal: StaticTheme.spacing.xs,
  },
  buttonNoDense: {
    minHeight: 28,
    paddingHorizontal: StaticTheme.spacing.xs * 1.5,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
  },
  disabledButton: {
    opacity: 0.5,
  },
  text: {
    alignItems: 'center',
    flexWrap: 'wrap',
    marginVertical: 'auto',
  },
  textAlignRight: {
    textAlign: 'right',
  },
  textContainer: {
    flex: 1,
    paddingRight: StaticTheme.spacing.sm,
  },
});

interface StyleParams {
  userTextSize: UserTextSize;
}

const getStyles = createStyles<
  StyleRecord<
    | 'row'
    | 'iconBox'
    | 'inputContainer'
    | 'inputContainerNoDivider'
    | 'inputContainerNoDense'
    | 'labelContainer'
    | 'labelContainerAlignRight',
    'input' | 'inputAlignRight' | 'contentStyle' | 'helperText'
  >,
  StyleParams
>({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    gap: StaticTheme.spacing.sm * 1.25,
    width: '100%',
  },
  iconBox: {
    width: 24,
    height: 24,
    borderRadius: StaticTheme.borderRadius.s,
    backgroundColor: ({ colors }) => colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1 / 3,
    borderBottomColor: ({ colors }) => colors.outlineVariant,
  },
  inputContainerNoDivider: {
    borderBottomWidth: 0,
  },
  inputContainerNoDense: {
    paddingVertical: StaticTheme.spacing.xs * 1.5,
  },
  labelContainer: {
    minWidth: 72,
    flexShrink: 0,
    alignContent: 'stretch',
    marginRight: StaticTheme.spacing.md,
  },
  labelContainerAlignRight: {
    flex: 1,
  },
  helperText: {
    flexGrow: 0,
  },
  input: {
    flex: 1,
    fontSize: ({ fonts }) => fonts.bodyLarge.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyLarge.fontWeight,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    textAlign: 'left',
    height: (_, { userTextSize }) => (userTextSize === UserTextSize.LARGE ? 60 : 48),
  },
  inputAlignRight: {
    flex: 0,
    textAlign: 'right',
  },
  contentStyle: {
    paddingHorizontal: 0,
    paddingLeft: StaticTheme.spacing.xs,
  },
});
