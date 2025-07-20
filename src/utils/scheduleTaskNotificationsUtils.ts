import { Dayjs } from 'dayjs';
import * as Notifications from 'expo-notifications';

import {
  MAX_NOTIFICATIONS_PER_TASK,
  NOTIFICATION_SCHEDULE_MONTHS_AHEAD,
  OVERDUE_MINUTES,
} from '@/constants';
import { LocalNotificationCategory } from '@/types/notification';
import type { Task } from '@/types/task';
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

/** Schedule both reminder and overdue reminder */
const scheduleTaskReminderAndOverdueReminder = async (
  task: Task,
  reminderTime: Dayjs,
  now: Date,
) => {
  const overdueTime = reminderTime.add(OVERDUE_MINUTES, 'minute');
  const results = await Promise.allSettled([
    scheduleTaskReminder(task, LocalNotificationCategory.TASK_REMINDER, reminderTime, now),
    scheduleTaskReminder(task, LocalNotificationCategory.TASK_OVERDUE, overdueTime, now),
  ]);
  if (__DEV__) {
    results.forEach((r, idx) => {
      console.log(`Schedule reminder ${r.status === 'fulfilled' ? 'success' : 'failed'}:`, {
        title: task.title,
        type: idx === 0 ? 'reminder' : 'overdue',
        time: idx === 0 ? reminderTime.format('MM-DD HH:mm') : overdueTime.format('MM-DD HH:mm'),
      });
    });
  }
};

/** Schedule recent task reminders and overdue reminders */
export const scheduleTaskReminders = async (task: Task) => {
  // Get all future notification times for this task
  const reminderTimes = getFutureNotificationTimes(
    task,
    NOTIFICATION_SCHEDULE_MONTHS_AHEAD,
    MAX_NOTIFICATIONS_PER_TASK,
  );

  // Schedule both reminder and overdue notifications for each reminder time
  const now = new Date();
  await Promise.allSettled(
    reminderTimes.map((reminderTime) =>
      scheduleTaskReminderAndOverdueReminder(task, reminderTime, now),
    ),
  );
};
