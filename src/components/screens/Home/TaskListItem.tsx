import dayjs from 'dayjs';
import { useMemo } from 'react';

import { List, Text } from 'react-native-paper';

import useAppTheme from '@/hooks/useAppTheme';
import { useUserTextSize } from '@/store/useUserStore';
import { StaticTheme } from '@/theme';
import type { Task } from '@/types/task';
import { UserTextSize } from '@/types/user';
import colorWithAlpha from '@/utils/colorWithAlpha';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

import ThemedCheckbox from '@/components/atoms/ThemedCheckbox';
import ThemedView from '@/components/atoms/ThemedView';

interface TaskListItemProps extends Task {
  isMissed: boolean;
  isLastCompleted: boolean;
  isStackExpanded: boolean;
  recurrenceText?: string;
  shouldShowRecurrence?: boolean;
  onPress: () => void;
  onCheck: () => void;
  onStackPress: () => void;
}

const TaskListItem = ({
  title,
  icon,
  reminderTime,
  completed,
  isMissed,
  isLastCompleted,
  isStackExpanded,
  recurrenceText,
  shouldShowRecurrence,
  onPress,
  onCheck,
  onStackPress,
}: TaskListItemProps) => {
  const userTextSize = useUserTextSize();

  const theme = useAppTheme();
  const styleParams = useMemo(() => ({ userTextSize }), [userTextSize]);
  const styles = getStyles(theme, styleParams);

  return (
    <List.Item
      title={title}
      description={shouldShowRecurrence ? recurrenceText : undefined}
      left={() => <Text style={styles.listIcon}>{icon}</Text>}
      right={() => (
        <ThemedView style={styles.timeAndCheckContainer}>
          <Text style={[styles.timeText, isMissed && styles.timeTextMissed]} variant="titleSmall">
            {dayjs().hour(reminderTime.hour).minute(reminderTime.minute).format('HH:mm')}
          </Text>
          <ThemedCheckbox status={completed ? 'checked' : 'unchecked'} onPress={onCheck} />
        </ThemedView>
      )}
      style={[
        styles.listItem,
        completed && styles.listItemDone,
        completed && !isStackExpanded && styles.listItemStacked,
        isLastCompleted && !isStackExpanded && styles.listItemStackedLast,
        isMissed && styles.listItemMissed,
      ]}
      containerStyle={completed && styles.listItemContainerDone}
      titleStyle={[styles.listItemTitle, isMissed && styles.listItemTitleMissed]}
      descriptionStyle={styles.recurrenceDesc}
      titleNumberOfLines={2}
      titleEllipsizeMode="tail"
      onPress={completed && !isStackExpanded ? onStackPress : onPress}
    />
  );
};

export default TaskListItem;

interface StyleParams {
  userTextSize: UserTextSize;
}

const getStyles = createStyles<
  StyleRecord<
    | 'listItem'
    | 'listItemDone'
    | 'listItemMissed'
    | 'listItemStacked'
    | 'listItemStackedLast'
    | 'listItemContainerDone'
    | 'timeAndCheckContainer',
    | 'listItemTitle'
    | 'listItemTitleMissed'
    | 'timeText'
    | 'timeTextMissed'
    | 'listIcon'
    | 'recurrenceDesc'
  >,
  StyleParams
>({
  listItem: {
    borderWidth: 1,
    paddingVertical: (_, { userTextSize }) =>
      userTextSize === UserTextSize.LARGE ? StaticTheme.spacing.sm * 1.5 : StaticTheme.spacing.xs,
    paddingLeft: StaticTheme.spacing.sm * 1.5,
    paddingRight: StaticTheme.spacing.sm * 1.5,
    borderRadius: StaticTheme.borderRadius.s,
    borderColor: ({ colors }) => colors.onSurface,
    backgroundColor: ({ colors }) => colors.background,
  },
  listItemDone: {
    borderColor: ({ colors }) => colorWithAlpha(colors.primary, 0.3),
  },
  listItemMissed: {
    backgroundColor: ({ colors }) => colorWithAlpha(colors.errorContainer, 0.3),
    borderColor: ({ colors }) => colors.error,
    borderWidth: 2,
  },
  listItemStacked: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  listItemStackedLast: {
    position: 'relative',
    transform: [{ translateY: 4 }],
  },
  listItemContainerDone: {
    opacity: 0.3,
  },
  listItemTitle: {
    fontSize: ({ fonts }) => fonts.bodyLarge.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyLarge.fontWeight,
    paddingRight: StaticTheme.spacing.xs,
  },
  listItemTitleMissed: {
    fontWeight: 'bold',
    color: ({ colors }) => colors.error,
  },
  listIcon: {
    margin: 'auto',
    paddingHorizontal: StaticTheme.spacing.xs * 1.5,
    padding: StaticTheme.spacing.xs * 1.5,
    borderRadius: StaticTheme.borderRadius.round,
    backgroundColor: ({ colors }) => colors.background,
  },
  timeAndCheckContainer: {
    flexDirection: 'row',
    gap: (_, { userTextSize }) =>
      userTextSize === UserTextSize.LARGE ? StaticTheme.spacing.lg : StaticTheme.spacing.sm,
    backgroundColor: 'transparent',
  },
  timeText: {
    margin: 'auto',
  },
  timeTextMissed: {
    color: ({ colors }) => colors.error,
    fontWeight: 'bold',
  },
  recurrenceDesc: {
    fontSize: ({ fonts }) => fonts.bodySmall.fontSize,
    fontWeight: ({ fonts }) => fonts.bodySmall.fontWeight,
    color: ({ colors }) => colorWithAlpha(colors.onSurface, 0.6),
    marginTop: StaticTheme.spacing.xs * 0.5,
  },
});
