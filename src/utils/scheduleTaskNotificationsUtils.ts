import { Dayjs } from 'dayjs';
import * as Notifications from 'expo-notifications';

import { MAX_NOTIFICATIONS_PER_TASK, NOTIFICATION_SCHEDULE_MONTHS_AHEAD } from '@/constants';
import { LocalNotificationCategory } from '@/types/notification';
import type { Task } from '@/types/task';
import type { MergedReminderSettings } from '@/types/user';
import { getFutureNotificationTimes } from '@/utils/taskUtils';

// TODO: i18n
const content = {
  [LocalNotificationCategory.TASK_REMINDER]: {
    title: 'Time for your task',
    body: (taskName: string) => `Let's do '${taskName}' now!`,
  },
  [LocalNotificationCategory.TASK_OVERDUE]: {
    title: 'Task Overdue',
    body: (taskName: string) => `'${taskName}' is still waiting!`,
  },
};

/** Schedule a task reminder */
const scheduleTaskReminder = (
  task: Task,
  category: LocalNotificationCategory,
  datetime: Dayjs,
  now: Date,
) =>
  Notifications.scheduleNotificationAsync({
    content: {
      title: content[category].title,
      body: content[category].body(task.title),
      sound: true,
      badge: 1,
      data: {
        id: `${category}_${task.id}_${datetime.unix()}`,
        type: category,
        scheduledTime: datetime.toISOString(),
        taskId: task.id,
        taskTitle: task.title,
        timestamp: now.toISOString(),
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: datetime.toDate(),
    },
  });

// TODO: Repeat overdue reminder if it's true in user settings
/** Schedule both reminder and overdue reminder */
const scheduleTaskReminderAndOverdueReminder = async (
  task: Task,
  reminderTime: Dayjs,
  now: Date,
  reminderSettings: MergedReminderSettings,
) => {
  const overdueTime = reminderTime.add(reminderSettings.delayMinutes, 'minute');
  const types: LocalNotificationCategory[] = [];
  const promises = [];

  if (reminderSettings.enableReminder) {
    types.push(LocalNotificationCategory.TASK_REMINDER);
    promises.push(
      scheduleTaskReminder(task, LocalNotificationCategory.TASK_REMINDER, reminderTime, now),
    );
  }
  if (reminderSettings.enableOverdueReminder) {
    types.push(LocalNotificationCategory.TASK_OVERDUE);
    promises.push(
      scheduleTaskReminder(task, LocalNotificationCategory.TASK_OVERDUE, overdueTime, now),
    );
  }

  if (promises.length > 0) {
    const results = await Promise.allSettled(promises);
    if (__DEV__) {
      results.forEach((r, idx) => {
        const time =
          types[idx] === LocalNotificationCategory.TASK_REMINDER ? reminderTime : overdueTime;
        console.log(`Schedule reminder ${r.status === 'fulfilled' ? 'success' : 'failed'}:`, {
          title: task.title,
          type: types[idx],
          time: time.format('MM-DD HH:mm'),
        });
      });
    }
  }
};

/** Schedule recent task reminders and overdue reminders */
export const scheduleTaskReminders = async (
  task: Task,
  reminderSettings: MergedReminderSettings,
) => {
  // Get all future notification times for this task
  const reminderTimes = getFutureNotificationTimes(
    task,
    NOTIFICATION_SCHEDULE_MONTHS_AHEAD,
    MAX_NOTIFICATIONS_PER_TASK,
  );

  // Schedule both reminder and overdue notifications for each reminder time
  const now = new Date();
  await Promise.allSettled(
    reminderTimes.map((time) =>
      scheduleTaskReminderAndOverdueReminder(task, time, now, reminderSettings),
    ),
  );
};
