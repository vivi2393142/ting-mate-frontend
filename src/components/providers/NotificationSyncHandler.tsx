import { useCallback, useEffect, useRef } from 'react';

import { useGetNotifications } from '@/api/notification';
import { useNotificationStore } from '@/store/notificationStore';
import { NotificationCategory, type Notification } from '@/types/notification';

const MAX_NOTIFICATION_COUNT = 50;

const updateLoading = useNotificationStore.getState().setLoading;
const updateNotifications = useNotificationStore.getState().setNotifications;
const updateTotal = useNotificationStore.getState().setTotal;

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

  // TODO: Implement SSE connection for real-time notifications
  useEffect(() => {
    // SSE connection logic would go here
    // const eventSource = new EventSource('/api/notifications/sse');
    // eventSource.onmessage = (event) => {
    //   const notification = JSON.parse(event.data);
    //   // Add notification to store
    //   addNotification(notification);
    //   // Process refresh logic
    //   processRefreshLogic(notification);
    // };
    // return () => eventSource.close();
  }, [processRefreshLogic]);

  // This component doesn't render any UI
  return null;
};

export default NotificationSyncHandler;
