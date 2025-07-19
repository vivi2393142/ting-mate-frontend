import { create } from 'zustand';

import type { Notification } from '@/types/notification';

const NOTIFICATION_CTN_PER_PAGE = 10;
const MAX_NOTIFICATION_COUNT = 50;

interface NotificationState {
  // Notification state
  notifications: Notification[];
  isLoading: boolean;

  // API parameters
  limit: number;
  offset: number;
  total: number;

  // Actions
  setNotifications: (notifications: Notification[]) => void;

  setLoading: (loading: boolean) => void;
  setLimit: (limit: number) => void;
  setTotal: (total: number) => void;
  loadMore: () => void;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  // Notification state
  notifications: [],
  isLoading: false,

  // API parameters
  limit: 10,
  offset: 0,
  total: 0,

  // Notification actions
  setNotifications: (notifications) =>
    set({
      notifications,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  setLimit: (limit) => set({ limit }),

  setTotal: (total) => set({ total }),

  loadMore: () => {
    const { limit } = get();
    const newLimit = Math.min(limit + NOTIFICATION_CTN_PER_PAGE, MAX_NOTIFICATION_COUNT); // Max 50 notifications
    set({ limit: newLimit });
  },

  reset: () =>
    set({
      notifications: [],
      isLoading: false,
      limit: NOTIFICATION_CTN_PER_PAGE,
      offset: 0,
      total: 0,
    }),
}));
