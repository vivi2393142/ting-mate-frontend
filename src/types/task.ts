// Recurrence rule - defines how to repeat a task
export enum RecurrenceUnit {
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
}

export const dayOfWeek = {
  MONDAY: 0,
  TUESDAY: 1,
  WEDNESDAY: 2,
  THURSDAY: 3,
  FRIDAY: 4,
  SATURDAY: 5,
  SUNDAY: 6,
} as const;
export type DayOfWeek = (typeof dayOfWeek)[keyof typeof dayOfWeek];

export interface RecurrenceRule {
  interval: number; // number of units between recurrences, should be greater than 0
  unit: RecurrenceUnit;
  daysOfWeek?: DayOfWeek[]; // WEEK: days of week to repeat on
  daysOfMonth?: number[]; // MONTH: day of month to repeat on
}

export interface ReminderTime {
  hour: number; // 0 ~ 23
  minute: number; // 0 ~ 59
}

// Task - defines basic task information and reminder times
export interface Task {
  id: string;
  title: string;
  icon: string; // emoji
  reminderTime: ReminderTime;
  recurrence?: RecurrenceRule; // undefined if task is not recurring
  completed: boolean;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  completedAt?: string; // ISO timestamp - completion time
  completedBy?: string; // user email - completion user email
}

// Type for updating task
export interface UpdateTaskRequest {
  id: string;
  updates: Partial<Task>;
}

// Type for completing task
export interface UpdateTaskStatusRequest {
  id: string;
  completed: boolean;
}

// Task type for display
export enum TaskType {
  DONE = 'DONE',
  NOT_DONE = 'NOT_DONE',
  MISSED = 'MISSED',
}

// Form type for TaskForm screen
export type TaskFormData = Pick<Task, 'title' | 'icon' | 'recurrence' | 'reminderTime'>;
