import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import type { EventSourceEvent } from 'react-native-sse';
import { z } from 'zod';

import { axiosClientWithAuth } from '@/api/axiosClient';
import API_PATH from '@/api/path';
import useSSE from '@/hooks/useSSE';
import useAuthStore from '@/store/useAuthStore';
import {
  NotificationCategory,
  NotificationLevel,
  type Notification,
  type NotificationListResponse,
} from '@/types/notification';

/* =============================================================================
 * API Schema Definitions
 * ============================================================================= */
const APINotificationSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  category: z.nativeEnum(NotificationCategory),
  message: z.string(),
  payload: z.record(z.string(), z.unknown()).optional(),
  level: z.nativeEnum(NotificationLevel),
  is_read: z.boolean(),
  created_at: z.string(),
});

const APINotificationListResponseSchema = z.object({
  notifications: z.array(APINotificationSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

/* =============================================================================
 * Data Transform Functions
 * ============================================================================= */
const transformNotificationFromAPI = (
  apiNotification: z.infer<typeof APINotificationSchema>,
): Notification => ({
  id: apiNotification.id,
  userId: apiNotification.user_id,
  category: apiNotification.category,
  message: apiNotification.message,
  payload: apiNotification.payload,
  level: apiNotification.level,
  isRead: apiNotification.is_read,
  createdAt: apiNotification.created_at,
});

const transformNotificationListFromAPI = (
  apiRes: z.infer<typeof APINotificationListResponseSchema>,
): NotificationListResponse => ({
  notifications: apiRes.notifications.map(transformNotificationFromAPI),
  total: apiRes.total,
  limit: apiRes.limit,
  offset: apiRes.offset,
});

/* =============================================================================
 * API Hooks
 * ============================================================================= */
export const useGetNotifications = (
  params: {
    limit?: number;
    offset?: number;
  },
  options?: Omit<
    UseQueryOptions<NotificationListResponse, Error, NotificationListResponse, readonly unknown[]>,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery<NotificationListResponse, Error, NotificationListResponse, readonly unknown[]>({
    queryKey: ['notifications', params],
    queryFn: async () => {
      const res = await axiosClientWithAuth.get(API_PATH.NOTIFICATIONS, {
        params: {
          limit: params.limit ?? 10,
          offset: params.offset ?? 0,
        },
      });
      const parsed = APINotificationListResponseSchema.parse(res.data);
      return transformNotificationListFromAPI(parsed);
    },
    ...options,
  });

export const useMarkNotificationRead = (options?: UseMutationOptions<void, Error, string[]>) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string[]>({
    mutationFn: async (notificationIds: string[]): Promise<void> => {
      await axiosClientWithAuth.put(API_PATH.NOTIFICATION_MARK_READ, notificationIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    ...options,
  });
};

export const useGetNotificationSSE = ({
  onMessage,
}: {
  onMessage: (data: Notification, e: EventSourceEvent<'message'>) => void;
}) => {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token);
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
  const enabled = !!token;

  const handleMessage = useCallback(
    (e: EventSourceEvent<'message'>) => {
      const parsed = APINotificationSchema.parse(JSON.parse(e.data ?? '{}'));
      const transformed = transformNotificationFromAPI(parsed);
      if (transformed) {
        onMessage(transformed, e);
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      }
    },
    [onMessage, queryClient],
  );

  return useSSE({
    path: API_PATH.NOTIFICATION_SSE,
    onMessage: handleMessage,
    headers,
    enabled,
  });
};
