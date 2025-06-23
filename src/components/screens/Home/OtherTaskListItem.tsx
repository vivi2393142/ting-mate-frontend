import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { List, Text } from 'react-native-paper';

import useAppTheme from '@/hooks/useAppTheme';
import { useUserTextSize } from '@/store/useUserStore';
import { StaticTheme } from '@/theme';
import type { Task } from '@/types/task';
import { UserTextSize } from '@/types/user';
import colorWithAlpha from '@/utils/colorWithAlpha';
import { createStyles, type StyleRecord } from '@/utils/createStyles';
import { formatReminderTime } from '@/utils/taskUtils';

interface OtherTaskListItemProps extends Task {
  recurrenceText?: string;
  nextOccurrence?: string;
  disabled?: boolean;
  onPress: () => void;
}

const OtherTaskListItem = ({
  title,
  icon,
  reminderTime,
  recurrenceText,
  nextOccurrence,
  onPress,
  disabled,
}: OtherTaskListItemProps) => {
  const { t } = useTranslation('home');
  const userTextSize = useUserTextSize();

  const theme = useAppTheme();
  const styleParams = useMemo(() => ({ userTextSize }), [userTextSize]);
  const styles = getStyles(theme, styleParams);

  return (
    <List.Item
      title={title}
      description={
        nextOccurrence
          ? `${recurrenceText} • ${t('Next Occurrence')}: ${nextOccurrence}`
          : recurrenceText
      }
      left={() => <Text style={styles.listIcon}>{icon}</Text>}
      right={() => <Text style={styles.otherTaskTime}>{formatReminderTime(reminderTime)}</Text>}
      style={styles.otherTaskItem}
      titleStyle={styles.listItemTitle}
      descriptionStyle={styles.recurrenceDesc}
      onPress={onPress}
      disabled={disabled}
    />
  );
};

export default OtherTaskListItem;

interface StyleParams {
  userTextSize: UserTextSize;
}

const getStyles = createStyles<
  StyleRecord<'otherTaskItem', 'listItemTitle' | 'listIcon' | 'otherTaskTime' | 'recurrenceDesc'>,
  StyleParams
>({
  listIcon: {
    margin: 'auto',
    paddingHorizontal: StaticTheme.spacing.xs * 1.5,
    padding: StaticTheme.spacing.xs * 1.5,
    borderRadius: StaticTheme.borderRadius.round,
    backgroundColor: ({ colors }) => colors.background,
  },
  listItemTitle: {
    fontSize: ({ fonts }) => fonts.bodyLarge.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyLarge.fontWeight,
    paddingRight: StaticTheme.spacing.xs,
  },
  recurrenceDesc: {
    fontSize: ({ fonts }) => fonts.bodySmall.fontSize,
    fontWeight: ({ fonts }) => fonts.bodySmall.fontWeight,
    color: ({ colors }) => colorWithAlpha(colors.onSurface, 0.6),
    marginTop: StaticTheme.spacing.xs * 0.5,
  },
  otherTaskItem: {
    padding: StaticTheme.spacing.md,
    borderWidth: 1,
    borderColor: ({ colors }) => colorWithAlpha(colors.primary, 0.3),
    borderRadius: StaticTheme.borderRadius.s,
  },
  otherTaskTime: {
    fontSize: ({ fonts }) => fonts.bodyMedium.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyMedium.fontWeight,
    color: ({ colors }) => colors.onSurfaceVariant,
    margin: 'auto',
  },
});
