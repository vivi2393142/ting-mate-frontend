import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useRef } from 'react';

import { useGetNotifications, useGetNotificationSSE } from '@/api/notification';
import { useNotificationStore } from '@/store/notificationStore';
import { NotificationCategory, type Notification } from '@/types/notification';

const MAX_NOTIFICATION_COUNT = 50;

const updateLoading = useNotificationStore.getState().setLoading;
const updateNotifications = useNotificationStore.getState().setNotifications;
const updateTotal = useNotificationStore.getState().setTotal;

// TODO: Set notification handler for when app is in foreground, should merged with local notification settings
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Global notification sync handler that manages API calls and SSE connections
const NotificationSyncHandler = () => {
  const { limit } = useNotificationStore();

  // Track previous notification IDs to detect new notifications
  const prevNotificationIdsRef = useRef<Set<string>>(new Set());

  const { data: notificationsResponse, isLoading } = useGetNotifications(
    {
      limit,
      offset: 0,
    },
    {
      enabled: limit <= MAX_NOTIFICATION_COUNT, // Refetch when limit changes
    },
  );

  // Process refresh logic for new notifications
  const processRefreshLogic = useCallback((notification: Notification) => {
    switch (notification.category) {
      case NotificationCategory.TASK:
        // TODO: Invalidate tasks queries
        // queryClient.invalidateQueries({ queryKey: ['tasks'] });
        // if (notification.payload?.taskId) {
        //   queryClient.invalidateQueries({ queryKey: ['task', notification.payload.taskId] });
        // }
        break;

      case NotificationCategory.USER_SETTING:
        // TODO: Invalidate user settings queries
        // queryClient.invalidateQueries({ queryKey: ['userSettings'] });
        break;

      case NotificationCategory.SAFEZONE:
        // TODO: Invalidate safezone queries
        // queryClient.invalidateQueries({ queryKey: ['safezone'] });
        break;

      case NotificationCategory.SYSTEM:
        // TODO: System notifications might need special handling
        // For now, just invalidate general queries
        // queryClient.invalidateQueries({ queryKey: ['system'] });
        break;
    }
  }, []);

  // Sync the store with API results
  useEffect(() => {
    updateLoading(isLoading);
  }, [isLoading]);

  useEffect(() => {
    if (notificationsResponse) {
      const notifications = notificationsResponse.notifications;
      updateNotifications(notifications);
      updateTotal(notificationsResponse.total);

      // Track current notification IDs for next comparison
      const currentIds = new Set(notifications.map((n) => n.id));
      const prevIds = prevNotificationIdsRef.current;

      // Find new notifications by comparing with previous IDs
      const newNotifications = notifications.filter((n) => !prevIds.has(n.id));

      // Process refresh logic for new notifications
      newNotifications.forEach((notification) => {
        processRefreshLogic(notification);
      });

      // Update previous IDs for next comparison
      prevNotificationIdsRef.current = currentIds;
    }
  }, [notificationsResponse, processRefreshLogic]);

  const handleMessage = useCallback((notification: Notification) => {
    Notifications.scheduleNotificationAsync({
      content: {
        body: notification.message,
        categoryIdentifier: notification.category,
        sound: true,
        badge: 1,
        data: {
          notificationId: notification.id,
          category: notification.category,
          payload: notification.payload,
        },
      },
      trigger: null,
    });
    // TODO: Handle refresh target screen
  }, []);

  useGetNotificationSSE({ onMessage: handleMessage });

  return null;
};

export default NotificationSyncHandler;
