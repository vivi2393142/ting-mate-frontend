import * as Notifications from 'expo-notifications';
import { Fragment, useEffect } from 'react';

import LocalNotificationHandler from '@/components/providers/NotificationHandler/LocalNotificationHandler';
import PushNotificationHandler from '@/components/providers/NotificationHandler/PushNotificationHandler';
import SSENotificationHandler from '@/components/providers/NotificationHandler/SSENotificationHandler';

// Controls how notifications are displayed when app is open
// Effective for: Local notifications, SSE notifications (won't used push notifications in foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request notification permissions
// Required for: Local notifications, SSE notifications, Push notifications
const requestPermissions = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
};

// Main notification handler - manages common notification setup
const NotificationHandler = () => {
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        const hasPermission = await requestPermissions();
        if (!hasPermission && __DEV__) console.log('Notification permissions not granted');
      } catch (error) {
        if (__DEV__) console.log('Failed to request notification permissions:', error);
      }
    };

    initializeNotifications();
  }, []);

  return (
    <Fragment>
      {/* SSE notifications - server-initiated, used when app is open, realtime */}
      <SSENotificationHandler />
      {/* Push notifications - server-initiated, used when app is closed, realtime */}
      <PushNotificationHandler />
      {/* Local notifications - local scheduled, used when app is open or closed, task reminders only */}
      <LocalNotificationHandler />
    </Fragment>
  );
};

export default NotificationHandler;
