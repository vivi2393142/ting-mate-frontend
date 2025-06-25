import type { ReactNode } from 'react';
import type { GestureResponderEvent, ViewStyle } from 'react-native';
import { View } from 'react-native';
import { Text, TextInput, TouchableRipple, type TextInputProps } from 'react-native-paper';

import useAppTheme from '@/hooks/useAppTheme';
import { useUserTextSize } from '@/store/useUserStore';
import { StaticTheme } from '@/theme';
import { UserTextSize } from '@/types/user';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

import IconSymbol, { type IconName } from '@/components/atoms/IconSymbol';
import ThemedView from '@/components/atoms/ThemedView';

interface MultiLineButtonProps {
  onPress: (e: GestureResponderEvent) => void;
  icon?: IconName;
  disabled?: boolean;
  multiline?: boolean; // true: text wrap, false: ellipsis
  children: ReactNode;
}

const MultiLineButton = ({
  onPress,
  icon,
  children,
  disabled = false,
  multiline = true,
}: MultiLineButtonProps) => {
  const theme = useAppTheme();
  const styles = getMultiLineButtonStyles(theme);

  const textProps = multiline ? {} : { numberOfLines: 1 as const, ellipsizeMode: 'tail' as const };
  return (
    <TouchableRipple
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, disabled && styles.disabledButton]}
      rippleColor={theme.colors.primary + '22'}
      accessibilityRole="button"
    >
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.text} {...textProps}>
            {children}
          </Text>
        </View>
        {icon && <IconSymbol name={icon} size={16} color={theme.colors.onSurface} />}
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
    <MultiLineButton onPress={onPress} icon={rightIconName} multiline={multiline}>
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
          <IconSymbol name={icon} size={16} color={theme.colors.onSurface} />
        </ThemedView>
      )}
      <ThemedView
        style={[
          styles.inputContainer,
          !divider && styles.inputContainerNoDivider,
          !dense && styles.inputContainerDense,
        ]}
      >
        <ThemedView
          style={[
            styles.labelContainer,
            rest.valueAlign === 'right' && styles.labelContainerAlignRight,
          ]}
        >
          <Text style={styles.label}>{label}</Text>
          {rest.valueAlign === 'right' && helperText && (
            <Text style={styles.helperText}>{helperText}</Text>
          )}
        </ThemedView>
        <Input {...rest} />
      </ThemedView>
    </ThemedView>
  );
};

export default FormInput;

const getMultiLineButtonStyles = createStyles<
  StyleRecord<'content' | 'button' | 'disabledButton' | 'textContainer', 'text'>
>({
  button: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    minHeight: 48,
    paddingHorizontal: StaticTheme.spacing.xs,
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
    color: ({ colors }) => colors.onSurface,
    fontSize: ({ fonts }) => fonts.bodyLarge.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyLarge.fontWeight,
  },
  textContainer: {
    flex: 1,
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
    | 'inputContainerDense'
    | 'labelContainer'
    | 'labelContainerAlignRight',
    'label' | 'input' | 'inputAlignRight' | 'contentStyle' | 'helperText'
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
  inputContainerDense: {
    padding: StaticTheme.spacing.sm,
    paddingLeft: StaticTheme.spacing.md,
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
  label: {
    fontSize: ({ fonts }) => fonts.bodyLarge.fontSize,
    color: ({ colors }) => colors.onSurface,
  },
  helperText: {
    fontSize: ({ fonts }) => fonts.bodySmall.fontSize,
    color: ({ colors }) => colors.outline,
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
