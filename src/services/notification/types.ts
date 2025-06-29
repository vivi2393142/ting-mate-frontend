import { z } from 'zod';

// ============================================================================
// Notification Types
// ============================================================================

/** Base notification data structure */
export interface BaseNotificationData {
  id: string;
  type: NotificationType;
  timestamp: string;
}

/** All possible notification types */
export enum NotificationType {
  TASK_REMINDER = 'TASK_REMINDER', // Personal todo deadline reminder
  TASK_OVERDUE = 'TASK_OVERDUE', // Task overdue reminder
  SHARED_TASK_COMPLETED = 'SHARED_TASK_COMPLETED', // Someone completed a shared task
  LINKING_ACCOUNT = 'LINKING_ACCOUNT', // New linking account notification
}

// ============================================================================
// Zod Schemas for Notification Validation
// ============================================================================

const BaseNotificationDataSchema = z.object({
  id: z.string().min(1),
  type: z.nativeEnum(NotificationType),
  timestamp: z.string().datetime(),
});

const TaskRelatedNotificationDataSchema = BaseNotificationDataSchema.extend({
  taskId: z.string().min(1),
  taskTitle: z.string().min(1),
  scheduledTime: z.string().datetime(),
});

export const TaskReminderNotificationDataSchema = TaskRelatedNotificationDataSchema.extend({
  type: z.literal(NotificationType.TASK_REMINDER),
});

export const TaskOverdueNotificationDataSchema = TaskRelatedNotificationDataSchema.extend({
  type: z.literal(NotificationType.TASK_OVERDUE),
});

export const SharedTaskCompletedNotificationDataSchema = BaseNotificationDataSchema.extend({
  type: z.literal(NotificationType.SHARED_TASK_COMPLETED),
  taskId: z.string().min(1),
  taskTitle: z.string().min(1),
  completedBy: z.string().min(1),
  completedByUserId: z.string().min(1),
});

export const LinkingAccountNotificationDataSchema = BaseNotificationDataSchema.extend({
  type: z.literal(NotificationType.LINKING_ACCOUNT),
  accountId: z.string().min(1),
  accountName: z.string().min(1),
  linkedBy: z.string().min(1),
  linkedByUserId: z.string().min(1),
});

export const NotificationDataSchema = z.discriminatedUnion('type', [
  TaskReminderNotificationDataSchema,
  TaskOverdueNotificationDataSchema,
  SharedTaskCompletedNotificationDataSchema,
  LinkingAccountNotificationDataSchema,
]);

export const LocalNotificationDataSchema = z.discriminatedUnion('type', [
  TaskReminderNotificationDataSchema,
  TaskOverdueNotificationDataSchema,
]);

export const PushNotificationDataSchema = z.discriminatedUnion('type', [
  SharedTaskCompletedNotificationDataSchema,
  LinkingAccountNotificationDataSchema,
]);

// ============================================================================
// Validators
// ============================================================================

export const isNotificationData = (value: unknown): value is LocalNotificationData =>
  LocalNotificationDataSchema.safeParse(value).success;

export const isTaskReminderNotificationData = (
  value: unknown,
): value is TaskOverdueNotificationData =>
  TaskReminderNotificationDataSchema.safeParse(value).success;

export const isOverdueNotificationData = (value: unknown): value is TaskOverdueNotificationData =>
  TaskOverdueNotificationDataSchema.safeParse(value).success;

// ============================================================================
// Local Notification Types
// ============================================================================

/** Local notification for task reminders */
export interface BaseTaskRelatedNotificationData<T extends NotificationType>
  extends BaseNotificationData {
  type: T;
  taskId: string;
  taskTitle: string;
  scheduledTime: string;
}

/** Local notification data for task reminders (actual data structure in notification) */
export type TaskReminderNotificationData =
  BaseTaskRelatedNotificationData<NotificationType.TASK_REMINDER>;

/** Local notification data for task overdue (actual data structure in notification) */
export type TaskOverdueNotificationData =
  BaseTaskRelatedNotificationData<NotificationType.TASK_OVERDUE>;

// ============================================================================
// Push Notification Types
// ============================================================================

/** Push notification data for shared task completion */
export interface SharedTaskCompletedNotificationData extends BaseNotificationData {
  type: NotificationType.SHARED_TASK_COMPLETED;
  taskId: string;
  taskTitle: string;
  completedBy: string;
  completedByUserId: string;
}

/** Push notification data for linking account */
export interface LinkingAccountNotificationData extends BaseNotificationData {
  type: NotificationType.LINKING_ACCOUNT;
  accountId: string;
  accountName: string;
  linkedBy: string;
  linkedByUserId: string;
}

// ============================================================================
// Union Types
// ============================================================================

/** All local notification data types */
export type LocalNotificationData = TaskReminderNotificationData | TaskOverdueNotificationData;

/** All push notification data types */
export type PushNotificationData =
  | SharedTaskCompletedNotificationData
  | LinkingAccountNotificationData;

/** All notification data types */
export type NotificationData = LocalNotificationData | PushNotificationData;

// ============================================================================
// Notification Settings
// ============================================================================

/** User notification preferences */
export interface NotificationSettings {
  taskReminders: boolean;
  sharedTaskUpdates: boolean;
  todoListShares: boolean;
}
