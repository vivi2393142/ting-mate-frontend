import { memo, type ComponentProps, type ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';

import useAppTheme from '@/hooks/useAppTheme';
import { StaticTheme } from '@/theme';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

import ThemedButton from '@/components/atoms/ThemedButton';
import ThemedText from '@/components/atoms/ThemedText';

interface NoteMessageProps extends ViewProps {
  message: string;
  children?: ReactNode;
  buttonProps?: ComponentProps<typeof ThemedButton>;
}

const NoteMessage = ({ message, children, buttonProps, style, ...rest }: NoteMessageProps) => {
  const theme = useAppTheme();
  const styles = getStyles(theme);

  return (
    <View style={[styles.note, style]} {...rest}>
      <ThemedText color="onSurfaceVariant" style={styles.noteText}>
        {message}
      </ThemedText>
      {children}
      {buttonProps && <ThemedButton {...buttonProps} />}
    </View>
  );
};

export default memo(NoteMessage);

const getStyles = createStyles<StyleRecord<'note', 'noteText'>>({
  note: {
    backgroundColor: ({ colors }) => colors.surfaceVariant,
    paddingVertical: StaticTheme.spacing.md * 1.25,
    paddingHorizontal: StaticTheme.spacing.md,
    borderRadius: StaticTheme.borderRadius.s,
    gap: StaticTheme.spacing.sm * 1.25,
  },
  noteText: {
    fontStyle: 'italic',
  },
});
