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
  interval: number; // number of units between recurrences
  unit: RecurrenceUnit;
  daysOfWeek?: DayOfWeek[]; // WEEK: days of week to repeat on
  daysOfMonth?: number[]; // MONTH: day of month to repeat on
}

export interface ReminderTime {
  hour: number; // 0 ~ 23
  minute: number; // 0 ~ 59
}

// Task template - defines basic task information and reminder times
export interface TaskTemplate {
  id: string;
  title: string;
  icon: string; // emoji
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  reminders: TaskReminder[];
  recurrence?: RecurrenceRule;
}

// Task reminder - each reminder time corresponds to a reminder with completion status
export interface TaskReminder {
  id: string;
  reminderTime: ReminderTime; // corresponding reminder time
  completed: boolean;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  completedAt?: string; // ISO timestamp - completion time
  completedBy?: string; // user email - completion user email
}

// Type for updating task template
export interface UpdateTaskTemplateRequest {
  templateId: string;
  updates: Partial<TaskTemplate>;
}

// Type for completing task reminder
export interface UpdateTaskReminderStatusRequest {
  templateId: string;
  reminderId: string;
  completed: boolean;
}

// Type for getting task reminders
export interface GetTaskRemindersRequest {
  templateId?: string;
  date?: string; // ISO date string (YYYY-MM-DD)
  completed?: boolean;
}

// Task type for display
export enum TaskType {
  DONE = 'DONE',
  NOT_DONE = 'NOT_DONE',
  MISSED = 'MISSED',
}

export interface Task
  extends Pick<TaskTemplate, 'title' | 'icon'>,
    Pick<TaskReminder, 'reminderTime' | 'completed'> {
  reminderId: string;
  taskId: string;
}
