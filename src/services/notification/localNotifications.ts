import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import {
  MAX_NOTIFICATIONS_PER_TASK,
  NOTIFICATION_SCHEDULE_MONTHS_AHEAD,
  OVERDUE_MINUTES,
} from '@/constants';
import { NotificationType } from '@/services/notification/types';
import colors from '@/theme/colors.json';
import type { Task } from '@/types/task';
import { getFutureNotificationTimes } from '@/utils/taskUtils';

// ============================================================================
// Notification Content
// ============================================================================

// TODO: i18n for notification content
/** Notification content for task reminders */
const taskReminderContent = {
  title: '⏰ Time for your task',
  body: (taskName: string) => `Let's do '${taskName}' now!`,
};

/** Notification content for overdue tasks */
const overdueContent = {
  title: '⚠️ Task Overdue',
  body: (taskName: string) => `'${taskName}' is still waiting!`,
};

// ============================================================================
// Android Notification Channels
// ============================================================================

/** Android notification channels configuration */
const notificationChannels: (Notifications.NotificationChannelInput & { id: string })[] = [
  {
    id: 'task-reminders',
    name: 'Task Reminders',
    description: 'Personal task reminder notifications',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
    lightColor: colors.coreColors.primary,
  },
  {
    id: 'task-overdue',
    name: 'Task Overdue',
    description: 'Overdue task notifications',
    importance: Notifications.AndroidImportance.MAX,
    sound: 'default',
    vibrationPattern: [0, 500, 250, 500],
    lightColor: colors.coreColors.error,
  },
];

// ============================================================================
// Internal Helper Functions
// ============================================================================

/** Request notification permissions */
const requestPermissions = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
};

/** Set up Android notification channels */
const setupNotificationChannels = async (): Promise<void> => {
  if (Platform.OS !== 'android') return;
  for (const { id, ...rest } of notificationChannels) {
    await Notifications.setNotificationChannelAsync(id, rest);
  }
};

/** Cancel all local notifications */
const cancelAllLocalNotifications = async (): Promise<void> => {
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

  for (const notification of scheduledNotifications) {
    await Notifications.cancelScheduledNotificationAsync(notification.identifier);
  }
};

// ============================================================================
// Task Reminder Notifications
// ============================================================================

/** Schedule reminder notifications for a single task */
const scheduleTaskReminders = async (task: Task): Promise<string[]> => {
  const notificationIds: string[] = [];

  // Skip completed tasks - no notifications needed
  if (task.completed) return notificationIds;

  // Get all future notification times for this task
  const reminderTimes = getFutureNotificationTimes(
    task,
    NOTIFICATION_SCHEDULE_MONTHS_AHEAD,
    MAX_NOTIFICATIONS_PER_TASK,
  );

  // Schedule both reminder and overdue notifications for each reminder time
  const now = new Date();
  for (const reminderTime of reminderTimes) {
    const baseData = {
      taskId: task.id,
      taskTitle: task.title,
      timestamp: now.toISOString(),
    };

    try {
      // Schedule reminder notification
      const reminderNotificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: taskReminderContent.title,
          body: taskReminderContent.body(task.title),
          sound: true,
          badge: 1,
          data: {
            ...baseData,
            id: `task_reminder_${task.id}_${reminderTime.unix()}`,
            type: NotificationType.TASK_REMINDER,
            scheduledTime: reminderTime.toISOString(),
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: reminderTime.toDate(),
        },
      });
      notificationIds.push(reminderNotificationId);

      // Schedule overdue notification
      const overdueTime = reminderTime.add(OVERDUE_MINUTES, 'minute');
      const overdueNotificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: overdueContent.title,
          body: overdueContent.body(task.title),
          sound: true,
          badge: 1,
          data: {
            ...baseData,
            id: `task_overdue_${task.id}_${overdueTime.unix()}`,
            type: NotificationType.TASK_OVERDUE,
            scheduledTime: overdueTime.toISOString(),
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: overdueTime.toDate(),
        },
      });
      notificationIds.push(overdueNotificationId);
    } catch (error) {
      if (__DEV__) {
        console.log(`Failed to schedule notification for task ${task.id}:`, error);
        console.log('Reminder time:', reminderTime.format());
        console.log('Overdue time:', reminderTime.add(OVERDUE_MINUTES, 'minute').format());
      }
    }
  }

  return notificationIds;
};

// ============================================================================
// Public API
// ============================================================================

/** Local notification service */
export const LocalNotificationService = {
  /** Initialize local notifications - request permissions and setup channels */
  async initialize(): Promise<boolean> {
    const hasPermission = await requestPermissions();
    if (hasPermission) await setupNotificationChannels();
    return hasPermission;
  },

  /** Schedule all local notifications for all tasks */
  async scheduleAllTaskNotifications(tasks: Task[]): Promise<string[]> {
    const allNotificationIds: string[] = [];

    // Schedule task reminders for all tasks
    for (const task of tasks) {
      const taskNotificationIds = await scheduleTaskReminders(task);
      allNotificationIds.push(...taskNotificationIds);
    }

    return allNotificationIds;
  },

  /** Cancel all local notifications */
  cancelAllNotifications: cancelAllLocalNotifications,

  /** Reinitialize all local notifications - clear existing and schedule new ones */
  async reinitializeAllNotifications(tasks: Task[]): Promise<string[]> {
    // Cancel all existing local notifications
    await cancelAllLocalNotifications();

    // Schedule task reminders for all tasks
    const taskNotificationIds = await LocalNotificationService.scheduleAllTaskNotifications(tasks);
    return taskNotificationIds;
  },

  /** Get all scheduled local notifications */
  getAllScheduledNotifications: Notifications.getAllScheduledNotificationsAsync,

  /** Log current notifications for debugging */
  async logCurrentNotifications(): Promise<void> {
    if (__DEV__) {
      const notifications = await LocalNotificationService.getAllScheduledNotifications();
      console.log('Current local notifications:', notifications.length);
      notifications.forEach((notification, index) => {
        const data = notification.content.data;
        const scheduledTime = data?.scheduledTime;
        const taskId = data?.taskId;
        const taskTitle = data?.taskTitle;
        const type = data?.type;

        console.log(
          `${index + 1}. [${type}] ${taskTitle} (${taskId})`,
          `\n   Id: ${notification.identifier}`,
          `\n   Scheduled: ${scheduledTime}`,
          `\n   Title: ${notification.content.title}`,
          `\n   Body: ${notification.content.body}`,
        );
      });
    }
  },
};
