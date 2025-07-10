import { useRouter } from 'expo-router';
import { Fragment, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { View } from 'react-native';
import { ActivityIndicator, Divider, List, Text } from 'react-native-paper';

import { useGetTasks } from '@/api/tasks';
import useAppTheme from '@/hooks/useAppTheme';
import useCurrentTime from '@/hooks/useCurrentTime';
import useRecurrenceText from '@/hooks/useRecurrenceText';
import { NotificationService } from '@/services/notification';
import { useUserDisplayMode, useUserTextSize } from '@/store/useUserStore';
import { StaticTheme } from '@/theme';
import type { Task } from '@/types/task';
import { UserDisplayMode, UserTextSize } from '@/types/user';
import { createStyles, type StyleRecord } from '@/utils/createStyles';
import { getNextNotificationTime, isTaskMissed, shouldTaskAppearToday } from '@/utils/taskUtils';

import ScreenContainer from '@/components/atoms/ScreenContainer';
import ThemedButton from '@/components/atoms/ThemedButton';
import ExpandableSectionHeader from '@/components/screens/Home/ExpandableSectionHeader';
import OtherTaskListItem from '@/components/screens/Home/OtherTaskListItem';
import TaskListItem from '@/components/screens/Home/TaskListItem';

const HomeScreen = () => {
  const { t } = useTranslation('home');
  const { tRecurrenceText } = useRecurrenceText();
  const router = useRouter();
  const userTextSize = useUserTextSize();
  const userDisplayMode = useUserDisplayMode();

  const theme = useAppTheme();
  const styleParams = useMemo(() => ({ userTextSize }), [userTextSize]);
  const styles = getStyles(theme, styleParams);

  // Get current time with 1-minute update interval to avoid excessive recalculations
  const currentTime = useCurrentTime(60000);

  const [isStackExpanded, setIsStackExpanded] = useState(false);
  const [isOtherTasksExpanded, setIsOtherTasksExpanded] = useState(false);

  const { data: tasks = [], isLoading } = useGetTasks();

  // Separate tasks that should appear today vs other tasks
  const { todayTasks, otherTasks } = useMemo(() => {
    const today: Task[] = [];
    const other: Array<{
      task: Task;
      recurrenceText: string;
      nextOccurrence: string | null;
    }> = [];

    tasks?.forEach((task) => {
      const shouldAppearToday = shouldTaskAppearToday(task);
      if (shouldAppearToday) {
        today.push(task);
      } else {
        const recurrenceText = task?.recurrence ? tRecurrenceText(task.recurrence) : '';
        const nextOccurrence = getNextNotificationTime(task);
        other.push({
          task,
          recurrenceText,
          nextOccurrence: nextOccurrence ? nextOccurrence.format('MM/DD') : null,
        });
      }
    });

    return { todayTasks: today, otherTasks: other };
  }, [tasks, tRecurrenceText]);

  const sortedTasks = useMemo(() => {
    const result = [...todayTasks];
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
  }, [todayTasks]);

  const handleUpdateTaskStatus = useCallback(
    async (taskId: string, newStatus: boolean) => {
      // TODO: Implement task completion API
      // For now, we'll just update notifications
      // completeTask(taskId, newStatus);

      // TODO: notification - update too many notifications cause performance issue, change it to update only the changed task
      // Reinitialize all notifications after task status change
      if (newStatus) {
        // const updatedTasks = getTasks();
        await NotificationService.reinitializeAllLocalNotifications(tasks);
      }
    },
    [tasks],
  );

  const handleListItemPress = (taskId: string) => () => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (userDisplayMode === UserDisplayMode.FULL) {
      router.push({
        pathname: '/edit-task',
        params: {
          id: task.id,
          title: task.title,
          icon: task.icon,
          hour: task.reminderTime.hour.toString(),
          minute: task.reminderTime.minute.toString(),
        },
      });
    } else {
      handleUpdateTaskStatus(taskId, !task.completed);
    }
  };

  const handleStackPress = useCallback(() => {
    setIsStackExpanded((prev) => !prev);
  }, []);

  const handleCheckboxPress = (taskId: string, newStatus: boolean) => () => {
    if (isStackExpanded) {
      handleUpdateTaskStatus(taskId, newStatus);
    } else {
      handleStackPress();
    }
  };

  const handleAddTask = useCallback(() => {
    router.push('/add-task');
  }, [router]);

  const handleOtherTasksToggle = useCallback(() => {
    setIsOtherTasksExpanded((prev) => !prev);
  }, []);

  return (
    // TODO: add voice assistant button
    // TODO: add animation for collapsed tasks
    <ScreenContainer style={styles.root} scrollable>
      <Text variant="headlineSmall" style={styles.headline}>
        {t('Todays Tasks')}
      </Text>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={'small'} />
          <Text style={[styles.hintText, { marginTop: StaticTheme.spacing.sm }]}>
            {t('Loading tasks...')}
          </Text>
        </View>
      )}
      {!isLoading && sortedTasks.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.hintText}>{t("You haven't added any tasks yet.")}</Text>
          <Text style={styles.hintText}>{t('Add a task to get started!')}</Text>
        </View>
      )}
      {!isLoading && sortedTasks.length > 0 && (
        /* Today's tasks */
        <List.Section style={styles.listSection}>
          {sortedTasks.map((task, idx) => {
            const isMissed = !task.completed && isTaskMissed(task.reminderTime, currentTime);
            const isLastCompleted = task.completed && !sortedTasks?.[idx + 1]?.completed;
            const taskTemplate = tasks.find((t) => t.id === task.id);
            const recurrenceText = taskTemplate?.recurrence
              ? tRecurrenceText(taskTemplate.recurrence)
              : '';
            const shouldShowRecurrence = taskTemplate && !!taskTemplate?.recurrence;
            return (
              <Fragment key={task.id}>
                <TaskListItem
                  {...task}
                  isMissed={isMissed}
                  isLastCompleted={isLastCompleted}
                  isStackExpanded={isStackExpanded}
                  recurrenceText={recurrenceText}
                  shouldShowRecurrence={shouldShowRecurrence}
                  onPress={handleListItemPress(task.id)}
                  onCheck={handleCheckboxPress(task.id, !task.completed)}
                  onStackPress={handleStackPress}
                />
                {isLastCompleted && isStackExpanded && (
                  <ExpandableSectionHeader
                    title={t('Collapse Completed')}
                    chevronType="up"
                    isExpanded={isStackExpanded}
                    onPress={handleStackPress}
                  />
                )}
              </Fragment>
            );
          })}
        </List.Section>
      )}
      {/* Other tasks section */}
      {otherTasks.length > 0 && (
        <Fragment>
          <Divider style={styles.divider} />
          <List.Section style={styles.listSection}>
            <ExpandableSectionHeader
              title={t('Other Tasks')}
              isExpanded={isOtherTasksExpanded}
              count={otherTasks.length}
              chevronType={isOtherTasksExpanded ? 'down' : 'right'}
              onPress={handleOtherTasksToggle}
            />
            {isOtherTasksExpanded &&
              otherTasks.map(({ task, recurrenceText, nextOccurrence }) => (
                <OtherTaskListItem
                  key={task.id}
                  {...task}
                  recurrenceText={recurrenceText}
                  nextOccurrence={nextOccurrence ?? undefined}
                  onPress={handleListItemPress(task.id)}
                  disabled={userDisplayMode === UserDisplayMode.SIMPLE}
                />
              ))}
          </List.Section>
        </Fragment>
      )}
      {userDisplayMode === UserDisplayMode.FULL && (
        <ThemedButton onPress={handleAddTask} icon={'plus'} style={styles.addTaskButton}>
          {t('Add Task')}
        </ThemedButton>
      )}
      {/* Spacer to avoid overlapping with the voice command button */}
      <View style={styles.bottomSpacer} />
    </ScreenContainer>
  );
};

export default HomeScreen;

interface StyleParams {
  userTextSize: UserTextSize;
}

const getStyles = createStyles<
  StyleRecord<
    | 'root'
    | 'listSection'
    | 'divider'
    | 'addTaskButton'
    | 'bottomSpacer'
    | 'loadingContainer'
    | 'emptyContainer',
    'headline' | 'hintText'
  >,
  StyleParams
>({
  root: {
    gap: StaticTheme.spacing.xs,
  },
  headline: {
    paddingVertical: StaticTheme.spacing.xs,
    marginBottom: StaticTheme.spacing.sm,
  },
  listSection: {
    gap: StaticTheme.spacing.md,
  },
  divider: {
    marginVertical: StaticTheme.spacing.xs,
  },
  addTaskButton: {
    marginTop: StaticTheme.spacing.xs,
  },
  bottomSpacer: {
    backgroundColor: 'transparent',
    height: (_, { userTextSize }) => (userTextSize === UserTextSize.LARGE ? 48 : 36),
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: StaticTheme.spacing.md,
    paddingVertical: StaticTheme.spacing.lg,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: StaticTheme.spacing.lg,
    gap: StaticTheme.spacing.xs,
  },
  hintText: {
    color: ({ colors }) => colors.onSurfaceVariant,
    fontSize: ({ fonts }) => fonts.bodyLarge.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyLarge.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodyLarge.lineHeight,
  },
});
