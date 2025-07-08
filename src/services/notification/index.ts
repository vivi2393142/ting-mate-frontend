import * as Notifications from 'expo-notifications';

import { LocalNotificationService } from '@/services/notification/localNotifications';
import { PushNotificationService } from '@/services/notification/pushNotifications';
import { isNotificationData } from '@/services/notification/types';

// ============================================================================
// Main Notification Service
// ============================================================================

/** Main notification service that combines local and push notifications */
export const NotificationService = {
  // ============================================================================
  // Initialization
  // ============================================================================

  /** Initialize all notification services */
  async initialize(): Promise<{
    localNotificationsEnabled: boolean;
    pushToken: string | null;
  }> {
    // Initialize local notifications
    const localNotificationsEnabled = await LocalNotificationService.initialize();

    // TODO: Register for push notifications
    // const pushToken = await PushNotificationService.registerPushNotifications();

    return {
      localNotificationsEnabled,
      pushToken: '',
    };
  },

  // ============================================================================
  // Local Notifications
  // ============================================================================

  scheduleAllTaskNotifications: LocalNotificationService.scheduleAllTaskNotifications,
  cancelAllLocalNotifications: LocalNotificationService.cancelAllNotifications,
  reinitializeAllLocalNotifications: LocalNotificationService.reinitializeAllNotifications,
  getAllScheduledLocalNotifications: LocalNotificationService.getAllScheduledNotifications,
  logCurrentLocalNotifications: LocalNotificationService.logCurrentNotifications,

  // ============================================================================
  // Push Notifications
  // ============================================================================

  setupPushNotificationListeners: PushNotificationService.setupNotificationListeners,
  removePushNotificationListeners: PushNotificationService.removeNotificationListeners,
};

// ============================================================================
// Re-exports
// ============================================================================

export { LocalNotificationService } from '@/services/notification/localNotifications';
export { PushNotificationService } from '@/services/notification/pushNotifications';
export * from '@/services/notification/types';

// ============================================================================
// Notification Handler Setup
// ============================================================================

// Set notification handler for foreground notifications and pre-display checks
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const data = notification.request.content.data;

    const getNotificationSettings = (enable: boolean) => ({
      shouldPlaySound: enable,
      shouldSetBadge: enable,
      shouldShowBanner: enable,
      shouldShowList: enable,
    });

    if (isNotificationData(data)) {
      const taskStatus = await checkTaskCompletionStatus(data.taskId);
      return taskStatus.completed ? getNotificationSettings(false) : getNotificationSettings(true);
    } else {
      return getNotificationSettings(false);
    }
  },
});

// Helper function to check task completion status
// TODO: Implemented helper function to check latest task completion status
async function checkTaskCompletionStatus(id: string) {
  // TODO: Implement based on storage solution
  // Example with AsyncStorage:
  // const tasksJson = await AsyncStorage.getItem('tasks');
  // const tasks = JSON.parse(tasksJson || '[]');
  // const task = tasks.find(t => t.id === id);
  // return { completed: task?.completed || false };

  // For now, return default (show notification)
  if (__DEV__) console.log('Checking task status for:', { id });
  return { completed: false };
}
