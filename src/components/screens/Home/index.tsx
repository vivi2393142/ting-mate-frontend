import { default as dayjs } from 'dayjs';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, List, Text } from 'react-native-paper';

import useAppTheme from '@/hooks/useAppTheme';
import { useMockTasks } from '@/store/useMockAPI';
import { useUserDisplayMode, useUserTextSize } from '@/store/useUserStore';
import { StaticTheme } from '@/theme';
import type { ReminderTime, Task } from '@/types/task';
import { UserDisplayMode, UserTextSize } from '@/types/user';
import colorWithAlpha from '@/utils/colorWithAlpha';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

import IconSymbol from '@/components/atoms/IconSymbol';
import ScreenContainer from '@/components/atoms/ScreenContainer';
import ThemedCheckbox from '@/components/atoms/ThemedCheckbox';
import ThemedView from '@/components/atoms/ThemedView';

// Custom hook to get current time with controlled updates
const useCurrentTime = (updateIntervalMs: number = 60000) => {
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, updateIntervalMs);

    return () => clearInterval(interval);
  }, [updateIntervalMs]);

  return currentTime;
};

// Helper function to determine if a task is missed based on current time
const isTaskMissed = (reminderTime: ReminderTime, currentTime: Date): boolean => {
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();

  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  const reminderTimeInMinutes = reminderTime.hour * 60 + reminderTime.minute;

  return currentTimeInMinutes > reminderTimeInMinutes;
};

const HomeScreen = () => {
  const { t } = useTranslation('home');
  const router = useRouter();
  const userTextSize = useUserTextSize();
  const userDisplayMode = useUserDisplayMode();

  // TODO: remove useMockTasks after the API is implemented
  const { getTasks, completeTaskReminder } = useMockTasks();

  const theme = useAppTheme();
  const styleParams = useMemo(() => ({ userTextSize }), [userTextSize]);
  const styles = getStyles(theme, styleParams);

  // Get current time with 1-minute update interval to avoid excessive recalculations
  const currentTime = useCurrentTime(60000);

  const tasks = getTasks();
  const sortedTasks = useMemo(() => {
    const result: Task[] = [];
    tasks?.forEach(({ id: taskId, title, icon, reminders }) => {
      reminders?.forEach(({ id: reminderId, reminderTime, completed }) => {
        result.push({
          reminderId,
          taskId,
          title,
          icon,
          reminderTime,
          completed,
        });
      });
    });

    // TODO: check if sort by BE
    result.sort((a, b) => {
      // DONE tasks go first
      if (a.completed && !b.completed) return -1;
      if (b.completed && !a.completed) return 1;

      // For non-DONE tasks, sort by time (earlier first)
      const timeA = a.reminderTime.hour * 60 + a.reminderTime.minute;
      const timeB = b.reminderTime.hour * 60 + b.reminderTime.minute;
      return timeA - timeB;
    });

    return result;
  }, [tasks]);

  const handleCompleteTask = (taskId: string, reminderId: string) => {
    completeTaskReminder(taskId, reminderId, true);
  };

  const handleListItemPress = (taskId: string, reminderId: string) => () => {
    if (userDisplayMode === UserDisplayMode.FULL) {
      const task = tasks.find((t) => t.id === taskId);
      const reminder = task?.reminders.find((r) => r.id === reminderId);
      if (task && reminder) {
        router.push({
          pathname: '/edit-task',
          params: {
            id: task.id,
            title: task.title,
            icon: task.icon,
            hour: reminder.reminderTime.hour.toString(),
            minute: reminder.reminderTime.minute.toString(),
          },
        });
      }
    } else {
      handleCompleteTask(taskId, reminderId);
    }
  };

  const handleCheckboxPress = (taskId: string, reminderId: string) => () => {
    if (userDisplayMode === UserDisplayMode.SIMPLE) return;
    handleCompleteTask(taskId, reminderId);
  };

  const handleAddTask = useCallback(() => {
    router.push('/add-task');
  }, [router]);

  return (
    // TODO: stacked done tasks
    // TODO: should be able to click button when 'FULL' (list item is also clickable which cause error now)
    <ScreenContainer style={styles.container}>
      <Text variant="headlineSmall" style={styles.headline}>
        {t('Todays Tasks')}
      </Text>
      <List.Section style={styles.listSection}>
        {sortedTasks.map(({ taskId, reminderId, title, icon, reminderTime, completed }) => {
          const isMissed = !completed && isTaskMissed(reminderTime, currentTime);
          return (
            <List.Item
              key={`${taskId}-${reminderId}`}
              title={title}
              left={() => <Text style={styles.listIcon}>{icon}</Text>}
              right={() => (
                <ThemedView style={styles.rightContainer}>
                  <Text
                    style={[styles.timeText, isMissed && styles.timeTextMissed]}
                    variant="titleSmall"
                  >
                    {dayjs().hour(reminderTime.hour).minute(reminderTime.minute).format('HH:mm')}
                  </Text>
                  <ThemedCheckbox
                    status={completed ? 'checked' : 'unchecked'}
                    onPress={handleCheckboxPress(taskId, reminderId)}
                  />
                </ThemedView>
              )}
              style={[
                styles.listItem,
                completed && styles.listItemDone,
                isMissed && styles.listItemMissed,
              ]}
              titleStyle={[styles.listItemTitle, isMissed && styles.listItemTitleMissed]}
              titleNumberOfLines={2}
              titleEllipsizeMode="tail"
              onPress={handleListItemPress(taskId, reminderId)}
              disabled={userDisplayMode === UserDisplayMode.SIMPLE && completed}
            />
          );
        })}
      </List.Section>
      {userDisplayMode === UserDisplayMode.FULL && (
        <Button
          mode="contained"
          onPress={handleAddTask}
          icon={({ color }) => <IconSymbol name="plus" color={color} size={16} />}
          style={styles.addButton}
          labelStyle={styles.addButtonLabel}
        >
          {t('Add Task')}
        </Button>
      )}
    </ScreenContainer>
  );
};

export default HomeScreen;

interface StyleParams {
  userTextSize: UserTextSize;
}

const getStyles = createStyles<
  StyleRecord<
    | 'container'
    | 'listSection'
    | 'listItem'
    | 'listItemDone'
    | 'listItemMissed'
    | 'rightContainer'
    | 'addButton',
    | 'headline'
    | 'listItemTitle'
    | 'listItemTitleMissed'
    | 'timeText'
    | 'timeTextMissed'
    | 'addButtonLabel'
    | 'listIcon'
  >,
  StyleParams
>({
  container: {
    gap: StaticTheme.spacing.xs,
  },
  headline: {
    paddingVertical: StaticTheme.spacing.xs,
  },
  listSection: {
    gap: StaticTheme.spacing.md,
    marginVertical: StaticTheme.spacing.md,
  },
  listItem: {
    borderWidth: 1,
    paddingVertical: (_, { userTextSize }) =>
      userTextSize === UserTextSize.LARGE ? StaticTheme.spacing.sm * 1.5 : StaticTheme.spacing.xs,
    paddingLeft: StaticTheme.spacing.sm * 1.5,
    paddingRight: StaticTheme.spacing.sm * 1.5,
    borderRadius: StaticTheme.borderRadius.s,
    borderColor: ({ colors }) => colors.onSurface,
  },
  listItemDone: {
    opacity: 0.3,
    borderColor: ({ colors }) => colors.primary,
  },
  listItemMissed: {
    backgroundColor: ({ colors }) => colorWithAlpha(colors.errorContainer, 0.3),
    borderColor: ({ colors }) => colors.error,
    borderWidth: 2,
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
  rightContainer: {
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
  addButton: {
    borderRadius: StaticTheme.borderRadius.s,
  },
  addButtonLabel: {
    fontSize: ({ fonts }) => fonts.titleMedium.fontSize,
    fontWeight: ({ fonts }) => fonts.titleMedium.fontWeight,
    marginVertical: (_, { userTextSize }) =>
      userTextSize === UserTextSize.LARGE ? StaticTheme.spacing.xs * 5 : StaticTheme.spacing.md,
  },
});
