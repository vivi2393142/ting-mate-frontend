import * as Notifications from 'expo-notifications';
import { useEffect, useMemo } from 'react';

import { useGetTasks } from '@/api/tasks';
import { OVERDUE_MINUTES } from '@/constants';
import useUserStore from '@/store/useUserStore';
import type { Task } from '@/types/task';
import type { MergedReminderSettings } from '@/types/user';
import { scheduleTaskReminders } from '@/utils/scheduleTaskNotificationsUtils';

const clearAllLocalNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

const scheduleLocalNotificationsForTasks = async (
  tasks: Task[],
  reminderSettings: MergedReminderSettings,
) => {
  await Promise.allSettled(tasks.map((task) => scheduleTaskReminders(task, reminderSettings)));
};

const LocalNotificationHandler = () => {
  const user = useUserStore((s) => s.user);
  const { data: tasks = [] } = useGetTasks();

  const reminderSettings = user?.settings?.reminder;
  const enableReminder = !!reminderSettings?.taskReminder;
  const enableOverdueReminder = !!reminderSettings?.overdueReminder?.enabled;
  const delayMinutes = enableOverdueReminder
    ? reminderSettings?.overdueReminder?.delayMinutes || OVERDUE_MINUTES
    : OVERDUE_MINUTES;

  const mergedReminderSettings = useMemo(
    () => ({
      enableReminder,
      enableOverdueReminder,
      delayMinutes,
    }),
    [enableOverdueReminder, enableReminder, delayMinutes],
  );

  // Clear and reset all local notifications when tasks change
  useEffect(() => {
    const updateLocalNotifications = async () => {
      try {
        await clearAllLocalNotifications();

        const settings = await Notifications.getPermissionsAsync();
        if (settings.granted) {
          await scheduleLocalNotificationsForTasks(tasks, mergedReminderSettings);
        }
      } catch (error) {
        if (__DEV__) console.log('Failed to update local notifications:', error);
      }
    };

    updateLocalNotifications();
  }, [mergedReminderSettings, tasks]);

  return null;
};

export default LocalNotificationHandler;
