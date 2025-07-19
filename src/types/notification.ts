export enum NotificationLevel {
  GENERAL = 'GENERAL',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

export enum NotificationCategory {
  TASK = 'TASK',
  USER_SETTING = 'USER_SETTING',
  SAFEZONE = 'SAFEZONE',
  SYSTEM = 'SYSTEM',
}

export interface Notification {
  id: string;
  userId: string;
  category: NotificationCategory;
  message: string;
  payload?: Record<string, unknown>;
  level: NotificationLevel;
  isRead: boolean;
  createdAt: string; // ISO string
}

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  limit: number;
  offset: number;
}
