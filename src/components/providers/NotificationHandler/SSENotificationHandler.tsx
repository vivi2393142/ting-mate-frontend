import * as Notifications from 'expo-notifications';
import { usePathname } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useGetNotifications, useGetNotificationSSE } from '@/api/notification';
import ROUTES from '@/constants/routes';
import { setStaleDataServiceToStore, useNotificationStore } from '@/store/notificationStore';
import useAuthStore from '@/store/useAuthStore';
import { NotificationCategory, type Notification } from '@/types/notification';
import { useQueryClient } from '@tanstack/react-query';

const MAX_NOTIFICATION_COUNT = 50;
const TASK_REFRESH_SCREENS = [ROUTES.HOME, ROUTES.EDIT_TASK];

const updateLoading = useNotificationStore.getState().setLoading;
const updateNotifications = useNotificationStore.getState().setNotifications;
const updateTotal = useNotificationStore.getState().setTotal;

// Global notification sync handler that manages API calls and SSE connections
const SSENotificationHandler = () => {
  const { t } = useTranslation('common');

  const { limit } = useNotificationStore();
  const token = useAuthStore((s) => s.token);

  const queryClient = useQueryClient();

  // Track previous notification IDs to detect new notifications
  const prevNotificationIdsRef = useRef<Set<string>>(null);

  // Track current path to determine if user is on a task refresh screen
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  useEffect(() => {
    pathRef.current = pathname;
  }, [pathname]);

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
  const processRefreshLogic = useCallback(
    (notification: Notification) => {
      switch (notification.category) {
        case NotificationCategory.TASK:
          // If the user is on a task refresh screen, show a temporary button to refresh the data
          if ((TASK_REFRESH_SCREENS as string[]).includes(pathRef.current)) {
            setStaleDataServiceToStore({
              message: t('Tasks have been updated, please refresh to see changes'),
              screens: TASK_REFRESH_SCREENS,
              onRefresh: () => {
                queryClient.invalidateQueries({ queryKey: ['tasks'] });
                queryClient.invalidateQueries({ queryKey: ['task'] });
              },
            });
          } else {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['task'] });
          }
          break;
        case NotificationCategory.LINKING_ACCOUNT:
          setStaleDataServiceToStore({
            message: t('Linking account has been updated, please refresh to see changes'),
            screens: [ROUTES.HOME, ROUTES.CONNECT, ROUTES.SETTINGS],
            onRefresh: () => {
              queryClient.invalidateQueries(); // Refresh all queries
            },
          });
          break;
        case NotificationCategory.SAFEZONE:
          // Should call refresh immediately
          queryClient.invalidateQueries({ queryKey: ['linkedLocation'] });
          break;
        case NotificationCategory.SYSTEM:
          break;
      }
    },
    [queryClient, t],
  );

  // Reset previous notification IDs when token changes
  useEffect(() => {
    prevNotificationIdsRef.current = null;
  }, [token]);

  // Sync the store with API results
  useEffect(() => {
    updateLoading(isLoading);
  }, [isLoading]);

  // Sync the store with API results and process refresh logic for new notifications
  useEffect(() => {
    if (notificationsResponse) {
      const notifications = notificationsResponse.notifications;
      updateNotifications(notifications);
      updateTotal(notificationsResponse.total);

      const currentIds = new Set(notifications.map((n) => n.id));
      if (prevNotificationIdsRef.current === null) {
        // No need to process refresh logic for initial load
        prevNotificationIdsRef.current = currentIds;
      } else {
        // Find new notifications by comparing with previous IDs
        const prevIds = prevNotificationIdsRef.current;
        const newNotifications = notifications.filter((n) => !prevIds.has(n.id));

        // Process refresh logic for new notifications
        newNotifications.forEach((notification) => {
          processRefreshLogic(notification);
        });

        // Update previous IDs for next comparison
        prevNotificationIdsRef.current = currentIds;
      }
    }
  }, [notificationsResponse, processRefreshLogic]);

  useEffect(() => {
    if (notificationsResponse) {
      const notifications = notificationsResponse.notifications;
      updateNotifications(notifications);
      updateTotal(notificationsResponse.total);
    }
  }, [notificationsResponse]);

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
  }, []);

  useGetNotificationSSE({ onMessage: handleMessage });

  return null;
};

export default SSENotificationHandler;
