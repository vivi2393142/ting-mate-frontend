import { create } from 'zustand';

import { Route } from '@/constants/routes';
import type { Notification } from '@/types/notification';

const NOTIFICATION_CTN_PER_PAGE = 10;
const MAX_NOTIFICATION_COUNT = 50;

/**
 * Represents the latest screen that needs to show a refresh button
 * Shows a temporary button for user to force refresh
 */
interface StaleDataService {
  message: string; // Short message to show on the button, e.g. "Tasks updated"
  screens: Route[]; // Screen name where to show the button
  onRefresh: () => void; // Function to call when user clicks refresh
}

interface NotificationState {
  // Notification list state
  notifications: Notification[];
  isLoading: boolean;

  // Pagination state
  limit: number;
  offset: number;
  total: number;

  // Stale data tracking - only stores the latest stale service
  staleDataService: StaleDataService | null;

  // Actions
  setNotifications: (notifications: Notification[]) => void;
  setLoading: (loading: boolean) => void;
  setLimit: (limit: number) => void;
  setTotal: (total: number) => void;
  loadMore: () => void;
  reset: () => void;

  // Stale data management
  setStaleDataService: (staleService: StaleDataService | null) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  // Notification state
  notifications: [],
  isLoading: false,

  // API parameters
  limit: 10,
  offset: 0,
  total: 0,

  // Stale data tracking
  staleDataService: null,

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
      staleDataService: null,
    }),

  // Stale data management actions
  setStaleDataService: (staleDataService: StaleDataService | null) => set({ staleDataService }),
}));

/* =============================================================================
 * Utility Functions
 * ============================================================================= */

export const setStaleDataServiceToStore = (staleService: StaleDataService | null) => {
  const setStaleDataService = useNotificationStore.getState().setStaleDataService;
  setStaleDataService(staleService);
};
