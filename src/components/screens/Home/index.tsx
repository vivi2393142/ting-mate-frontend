import { useRouter } from 'expo-router';
import { Fragment, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Alert, View } from 'react-native';
import { Divider, List, Text } from 'react-native-paper';

import { useGetTasks, useUpdateTaskStatus } from '@/api/tasks';
import ROUTES from '@/constants/routes';
import useAppTheme from '@/hooks/useAppTheme';
import useCurrentTime from '@/hooks/useCurrentTime';
import useRecurrenceText from '@/hooks/useRecurrenceText';
import useUserStore, { useUserDisplayMode, useUserTextSize } from '@/store/useUserStore';
import { StaticTheme } from '@/theme';
import type { Task } from '@/types/task';
import { Role, UserDisplayMode, UserTextSize } from '@/types/user';
import { createStyles, type StyleRecord } from '@/utils/createStyles';
import { getNextNotificationTime, isTaskMissed, shouldTaskAppearToday } from '@/utils/taskUtils';

import IconSymbol from '@/components/atoms/IconSymbol';
import ScreenContainer from '@/components/atoms/ScreenContainer';
import Skeleton from '@/components/atoms/Skeleton';
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

  // Get user data from store
  const user = useUserStore((state) => state.user);
  const isCaregiver = user?.role === Role.CAREGIVER;
  const hasLinkedAccounts = user?.settings.linked && user.settings.linked.length > 0;
  const shouldShowCaregiverWarning = isCaregiver && !hasLinkedAccounts;

  // Get current time with 1-minute update interval to avoid excessive recalculations
  const currentTime = useCurrentTime(60000);

  const [isStackExpanded, setIsStackExpanded] = useState(false);
  const [isOtherTasksExpanded, setIsOtherTasksExpanded] = useState(false);

  const { data: tasks = [], isLoading } = useGetTasks();
  const updateTaskStatusMutation = useUpdateTaskStatus();

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
      updateTaskStatusMutation.mutate(
        {
          taskId,
          completed: newStatus,
        },
        {
          onSuccess: async () => {
            // TODO: notification - update too many notifications cause performance issue, change it to update only the changed task
            // Reinitialize all notifications after task status change
            // await NotificationService.reinitializeAllLocalNotifications(tasks);
          },
          onError: () => {
            Alert.alert(t('Failed to update task status'));
          },
        },
      );
    },
    [updateTaskStatusMutation, t],
  );

  const handleListItemPress = (taskId: string) => () => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (userDisplayMode === UserDisplayMode.FULL) {
      router.push({
        pathname: ROUTES.EDIT_TASK,
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
    router.push(ROUTES.ADD_TASK);
  }, [router]);

  const handleOtherTasksToggle = useCallback(() => {
    setIsOtherTasksExpanded((prev) => !prev);
  }, []);

  const handleLinkAccount = useCallback(() => {
    router.push(ROUTES.ACCOUNT_LINKING);
  }, [router]);

  // Show caregiver warning if user is caregiver without linked accounts
  if (shouldShowCaregiverWarning) {
    return (
      <ScreenContainer style={styles.root} scrollable>
        <Text variant="headlineSmall" style={styles.headline}>
          {t('Todays Tasks')}
        </Text>
        <View>
          <View style={styles.warningContainer}>
            <IconSymbol
              name="exclamationmark.triangle"
              size={StaticTheme.iconSize.s}
              color={theme.colors.error}
              style={styles.warmingIcon}
            />
            <Text style={styles.warningText}>
              {t(
                'You haven’t linked with a companion yet. Link now to see and help manage their tasks.',
              )}
            </Text>
          </View>
          <ThemedButton onPress={handleLinkAccount} icon="link">
            {t('Link Account')}
          </ThemedButton>
        </View>
      </ScreenContainer>
    );
  }

  return (
    // TODO: add voice assistant button
    // TODO: add animation for collapsed tasks
    <ScreenContainer style={styles.root} scrollable>
      <Text variant="headlineSmall" style={styles.headline}>
        {t('Todays Tasks')}
      </Text>
      {isLoading && (
        <View style={styles.loadingContainer}>
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} width={'100%'} height={58} />
          ))}
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
    | 'emptyContainer'
    | 'noLinkContainer'
    | 'warningContainer',
    'headline' | 'hintText' | 'warmingIcon' | 'warningText'
  >,
  StyleParams
>({
  root: {
    gap: StaticTheme.spacing.xs,
  },
  headline: {
    paddingVertical: StaticTheme.spacing.xs,
    fontSize: ({ fonts }) => fonts.titleLarge.fontSize,
    fontWeight: ({ fonts }) => fonts.titleLarge.fontWeight,
    lineHeight: ({ fonts }) => fonts.titleLarge.lineHeight,
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
    gap: StaticTheme.spacing.md,
    marginTop: StaticTheme.spacing.sm,
    marginBottom: StaticTheme.spacing.md,
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
  noLinkContainer: {
    paddingHorizontal: StaticTheme.spacing.lg,
  },
  warningContainer: {
    flexDirection: 'row',
    gap: StaticTheme.spacing.sm,
    marginBottom: StaticTheme.spacing.md,
  },
  warmingIcon: {
    marginTop: StaticTheme.spacing.xs * 0.5,
  },
  warningText: {
    flex: 1,
    fontSize: ({ fonts }) => fonts.bodyMedium.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyMedium.fontWeight,
    lineHeight: ({ fonts }) => fonts.bodyMedium.lineHeight,
    color: ({ colors }) => colors.outline,
  },
});
