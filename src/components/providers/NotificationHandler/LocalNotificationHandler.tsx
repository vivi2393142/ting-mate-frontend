import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

import { useGetTasks } from '@/api/tasks';
import type { Task } from '@/types/task';
import { scheduleTaskReminders } from '@/utils/scheduleTaskNotificationsUtils';

const clearAllLocalNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

const scheduleLocalNotificationsForTasks = async (tasks: Task[]) => {
  await Promise.allSettled(tasks.map((task) => scheduleTaskReminders(task)));
};

const LocalNotificationHandler = () => {
  const { data: tasks = [] } = useGetTasks();

  // Clear and reset all local notifications when tasks change
  useEffect(() => {
    const updateLocalNotifications = async () => {
      try {
        await clearAllLocalNotifications();

        const settings = await Notifications.getPermissionsAsync();
        if (settings.granted) await scheduleLocalNotificationsForTasks(tasks);
      } catch (error) {
        if (__DEV__) console.log('Failed to update local notifications:', error);
      }
    };

    updateLocalNotifications();
  }, [tasks]);

  return null;
};

export default LocalNotificationHandler;
