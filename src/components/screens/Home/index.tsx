import { useRouter } from 'expo-router';
import { Fragment, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Divider, List, Text } from 'react-native-paper';

import useAppTheme from '@/hooks/useAppTheme';
import useCurrentTime from '@/hooks/useCurrentTime';
import useRecurrenceText from '@/hooks/useRecurrenceText';
import { useMockTasks } from '@/store/useMockAPI';
import { useUserDisplayMode, useUserTextSize } from '@/store/useUserStore';
import { StaticTheme } from '@/theme';
import type { Task } from '@/types/task';
import { UserDisplayMode, UserTextSize } from '@/types/user';
import { createStyles, type StyleRecord } from '@/utils/createStyles';
import { getNextOccurrenceDate, isTaskMissed, shouldTaskAppearToday } from '@/utils/taskUtils';

import IconSymbol from '@/components/atoms/IconSymbol';
import ScreenContainer from '@/components/atoms/ScreenContainer';
import ExpandableSectionHeader from '@/components/screens/Home/ExpandableSectionHeader';
import OtherTaskListItem from '@/components/screens/Home/OtherTaskListItem';
import TaskListItem from '@/components/screens/Home/TaskListItem';

const HomeScreen = () => {
  const { t } = useTranslation('home');
  const { tRecurrenceText } = useRecurrenceText();
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

  const [isStackExpanded, setIsStackExpanded] = useState(false);
  const [isOtherTasksExpanded, setIsOtherTasksExpanded] = useState(false);

  const tasks = getTasks();

  // Separate tasks that should appear today vs other tasks
  const { todayTasks, otherTasks } = useMemo(() => {
    const today: Task[] = [];
    const other: Array<{
      task: Task;
      recurrenceText: string;
      nextOccurrence: string | null;
    }> = [];

    tasks?.forEach((taskTemplate) => {
      const shouldAppearToday = shouldTaskAppearToday(taskTemplate);

      taskTemplate.reminders?.forEach(({ id: reminderId, reminderTime, completed }) => {
        const taskItem = {
          reminderId,
          taskId: taskTemplate.id,
          title: taskTemplate.title,
          icon: taskTemplate.icon,
          reminderTime,
          completed,
        };

        if (shouldAppearToday) {
          today.push(taskItem);
        } else {
          const recurrenceText = tRecurrenceText(taskTemplate.recurrence);
          const nextOccurrence = getNextOccurrenceDate(taskTemplate);
          other.push({
            task: taskItem,
            recurrenceText,
            nextOccurrence: nextOccurrence ? nextOccurrence.format('MM/DD') : null,
          });
        }
      });
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

  const handleUpdateTaskStatus = (taskId: string, reminderId: string, newStatus: boolean) => {
    completeTaskReminder(taskId, reminderId, newStatus);
  };

  const handleListItemPress = (taskId: string, reminderId: string) => () => {
    const task = tasks.find((t) => t.id === taskId);
    const reminder = task?.reminders.find((r) => r.id === reminderId);

    if (!task || !reminder) return;
    if (userDisplayMode === UserDisplayMode.FULL) {
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
    } else {
      handleUpdateTaskStatus(taskId, reminderId, !reminder.completed);
    }
  };

  const handleStackPress = useCallback(() => {
    setIsStackExpanded((prev) => !prev);
  }, []);

  const handleCheckboxPress = (taskId: string, reminderId: string, newStatus: boolean) => () => {
    if (isStackExpanded) {
      handleUpdateTaskStatus(taskId, reminderId, newStatus);
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
      {/* Today's tasks */}
      <List.Section style={styles.listSection}>
        {sortedTasks.map((task, idx) => {
          const isMissed = !task.completed && isTaskMissed(task.reminderTime, currentTime);
          const isLastCompleted = task.completed && !sortedTasks?.[idx + 1].completed;
          const taskTemplate = tasks.find((t) => t.id === task.taskId);
          const recurrenceText = taskTemplate ? tRecurrenceText(taskTemplate.recurrence) : '';
          const shouldShowRecurrence =
            taskTemplate &&
            taskTemplate.recurrence.frequency !== 'DAILY' &&
            taskTemplate.recurrence.frequency !== 'ONCE';
          return (
            <Fragment key={`${task.taskId}-${task.reminderId}`}>
              <TaskListItem
                {...task}
                isMissed={isMissed}
                isLastCompleted={isLastCompleted}
                isStackExpanded={isStackExpanded}
                recurrenceText={recurrenceText}
                shouldShowRecurrence={shouldShowRecurrence}
                onPress={handleListItemPress(task.taskId, task.reminderId)}
                onCheck={handleCheckboxPress(task.taskId, task.reminderId, !task.completed)}
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
                  key={`${task.taskId}-${task.reminderId}`}
                  {...task}
                  recurrenceText={recurrenceText}
                  nextOccurrence={nextOccurrence ?? undefined}
                  onPress={handleListItemPress(task.taskId, task.reminderId)}
                  disabled={userDisplayMode === UserDisplayMode.SIMPLE}
                />
              ))}
          </List.Section>
        </Fragment>
      )}
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
  StyleRecord<'root' | 'listSection' | 'addButton' | 'divider', 'headline' | 'addButtonLabel'>,
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
