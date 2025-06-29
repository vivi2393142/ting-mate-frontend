import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

// ============================================================================
// Push Notification Content
// ============================================================================

/** Push notification content for shared task completion */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sharedTaskCompletedContent = {
  title: 'Task Completed',
  body: (taskName: string, completedBy: string) => `${completedBy} completed: "${taskName}"`,
};

/** Push notification content for shared todo list */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const todoListSharedContent = {
  title: 'Todo List Shared',
  body: (listName: string, sharedBy: string) => `${sharedBy} shared "${listName}" with you`,
};

// ============================================================================
// Push Notification Service
// ============================================================================

/** Push notification service */
export const PushNotificationService = {
  /** Request push notification permissions */
  async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  },

  /** Register for push notifications and return Expo push token */
  async registerPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) return null;

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return null;

    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
  },

  /** Set up notification listeners for push notifications */
  setupNotificationListeners({
    onReceive,
    onRespond,
  }: {
    onReceive?: (notification: Notifications.Notification) => void;
    onRespond?: (response: Notifications.NotificationResponse) => void;
  }) {
    // Handle notifications received while app is running
    const notificationListener = Notifications.addNotificationReceivedListener(
      onReceive || (() => {}),
    );

    // Handle notification responses (user taps notification)
    const responseListener = Notifications.addNotificationResponseReceivedListener(
      onRespond || (() => {}),
    );

    return {
      notificationListener,
      responseListener,
    };
  },

  /** Remove notification listeners */
  removeNotificationListeners(listeners: {
    notificationListener: Notifications.EventSubscription;
    responseListener: Notifications.EventSubscription;
  }) {
    listeners.notificationListener.remove();
    listeners.responseListener.remove();
  },
};
