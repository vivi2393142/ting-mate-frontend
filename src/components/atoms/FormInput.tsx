import { ReactNode } from 'react';
import { Button, Text, TextInput, type TextInputProps } from 'react-native-paper';

import useAppTheme from '@/hooks/useAppTheme';
import { useUserTextSize } from '@/store/useUserStore';
import { StaticTheme } from '@/theme';
import { UserTextSize } from '@/types/user';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

import IconSymbol, { type IconName } from '@/components/atoms/IconSymbol';
import ThemedView from '@/components/atoms/ThemedView';

type FormInputProps = Omit<TextInputProps, 'mode' | 'value'> & {
  label: string;
  divider?: boolean;
  icon?: IconName;
  rightIconName?: IconName;
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
  onPress,
  onChangeValue,
  render,
  ...rest
}: Omit<FormInputProps, 'label' | 'icon' | 'divider' | 'helperText'>) => {
  const theme = useAppTheme();
  const userTextSize = useUserTextSize();
  const styles = getStyles(theme, { userTextSize });

  if (render) return render();
  if (onPress) {
    return (
      <Button
        compact
        onPress={onPress}
        style={styles.pressableInputButton}
        contentStyle={styles.pressableInputButtonContent}
        labelStyle={styles.pressableInputButtonLabel}
        icon={
          rightIconName
            ? ({ color }) => <IconSymbol name={rightIconName} color={color} size={16} />
            : undefined
        }
      >
        {value}
      </Button>
    );
  }
  return (
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
      style={[styles.input, valueAlign === 'right' && styles.inputAlignRight, rest.style]}
      contentStyle={[styles.contentStyle, rest.contentStyle]}
    />
  );
};

const FormInput = ({ label, icon, divider = true, helperText, ...rest }: FormInputProps) => {
  const theme = useAppTheme();
  const userTextSize = useUserTextSize();
  const styles = getStyles(theme, { userTextSize });

  return (
    <ThemedView style={styles.row}>
      {icon && (
        <ThemedView style={styles.iconBox}>
          <IconSymbol name={icon} size={16} color={theme.colors.onSurface} />
        </ThemedView>
      )}
      <ThemedView style={[styles.inputContainer, !divider && styles.inputContainerNoDivider]}>
        <ThemedView
          style={[
            styles.labelContainer,
            rest.valueAlign == 'right' && styles.labelContainerAlignRight,
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

interface StyleParams {
  userTextSize: UserTextSize;
}

const getStyles = createStyles<
  StyleRecord<
    | 'row'
    | 'iconBox'
    | 'inputContainer'
    | 'inputContainerNoDivider'
    | 'labelContainer'
    | 'labelContainerAlignRight'
    | 'pressableInputButton'
    | 'pressableInputButtonContent',
    | 'label'
    | 'input'
    | 'inputAlignRight'
    | 'contentStyle'
    | 'helperText'
    | 'pressableInputButtonLabel'
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
  labelContainer: {
    minWidth: 90,
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
    height: 44,
  },
  inputAlignRight: {
    flex: 0,
    textAlign: 'right',
  },
  contentStyle: {
    paddingHorizontal: 0,
    paddingLeft: StaticTheme.spacing.xs,
  },
  pressableInputButton: {
    borderRadius: 0,
    flex: 1,
    height: 44,
  },
  pressableInputButtonLabel: {
    fontSize: ({ fonts }) => fonts.bodyLarge.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyLarge.fontWeight,
    color: ({ colors }) => colors.onSurface,
    marginRight: 'auto',
    marginLeft: StaticTheme.spacing.xs,
  },
  pressableInputButtonContent: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-end',
    height: '100%',
  },
});
