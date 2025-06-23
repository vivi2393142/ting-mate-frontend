import { ReactNode } from 'react';
import { Text, TextInput, type TextInputProps } from 'react-native-paper';

import useAppTheme from '@/hooks/useAppTheme';
import { useUserTextSize } from '@/store/useUserStore';
import { StaticTheme } from '@/theme';
import { UserTextSize } from '@/types/user';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

import IconSymbol, { type IconName } from '@/components/atoms/IconSymbol';
import ThemedView from '@/components/atoms/ThemedView';

type FormInputProps = Omit<TextInputProps, 'mode'> & {
  label: string;
  value: string;
  divider?: boolean;
  icon?: IconName;
  placeholder?: string;
  onChangeValue: (text: string) => void;
  render?: (value: string) => ReactNode;
} & (
    | {
        valueAlign?: 'left';
        helperText?: never;
      }
    | {
        valueAlign: 'right';
        helperText?: string;
      }
  );

const FormInput = ({
  label,
  value,
  valueAlign = 'left',
  icon,
  placeholder,
  divider = true,
  helperText,
  onChangeValue,
  render,
  ...rest
}: FormInputProps) => {
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
          style={[styles.labelContainer, valueAlign == 'right' && styles.labelContainerAlignRight]}
        >
          <Text style={styles.label}>{label}</Text>
          {valueAlign === 'right' && helperText && (
            <Text style={styles.helperText}>{helperText}</Text>
          )}
        </ThemedView>
        {render ? (
          render(value)
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
            {...rest}
            style={[styles.input, valueAlign === 'right' && styles.inputAlignRight, rest.style]}
            contentStyle={[styles.contentStyle, rest.contentStyle]}
          />
        )}
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
    borderBottomWidth: 1,
    borderBottomColor: ({ colors }) => colors.outlineVariant,
    gap: StaticTheme.spacing.md,
  },
  inputContainerNoDivider: {
    borderBottomWidth: 0,
  },
  labelContainer: {
    minWidth: 90,
    flexShrink: 0,
    alignContent: 'stretch',
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
    flex: 0,
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
  },
});
