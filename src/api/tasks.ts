import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { z } from 'zod';

import { axiosClientWithAuth } from '@/api/axiosClient';
import type { DayOfWeek, RecurrenceRule, RecurrenceUnit, ReminderTime, Task } from '@/types/task';

// API response types that match the backend structure
const APIReminderTimeSchema = z.object({
  hour: z.number().min(0).max(23),
  minute: z.number().min(0).max(59),
});

const APIRecurrenceRuleSchema = z.object({
  interval: z.number().positive(),
  unit: z.enum(['DAY', 'WEEK', 'MONTH']),
  days_of_week: z.array(z.number().min(0).max(6)).optional(),
  days_of_month: z.array(z.number().min(1).max(31)).optional(),
});

const APITaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  icon: z.string(), // emoji
  reminder_time: APIReminderTimeSchema,
  recurrence: APIRecurrenceRuleSchema.nullable().optional(),
  completed: z.boolean(),
  created_at: z.string(), // ISO timestamp
  created_by: z.string(), // user id
  updated_at: z.string(), // ISO timestamp
  updated_by: z.string(), // user id
  completed_at: z.string().nullable().optional(), // ISO timestamp
  completed_by: z.string().nullable().optional(), // user id
});

// Basic response schema that only validates the structure, not individual tasks
const APITaskListResponseSchema = z.object({
  tasks: z.array(z.unknown()), // Accept any array structure
});

// Type definitions for API responses
type APIReminderTime = z.infer<typeof APIReminderTimeSchema>;
type APIRecurrenceRule = z.infer<typeof APIRecurrenceRuleSchema>;
type APITask = z.infer<typeof APITaskSchema>;

// Transform API reminder time to frontend ReminderTime
const transformReminderTime = (apiReminderTime: APIReminderTime): ReminderTime => ({
  hour: apiReminderTime.hour,
  minute: apiReminderTime.minute,
});

// Transform API recurrence rule to frontend RecurrenceRule
const transformRecurrenceRule = (apiRecurrence: APIRecurrenceRule): RecurrenceRule => ({
  interval: apiRecurrence.interval,
  unit: apiRecurrence.unit as RecurrenceUnit,
  daysOfWeek: apiRecurrence.days_of_week as DayOfWeek[] | undefined,
  daysOfMonth: apiRecurrence.days_of_month,
});

// Transform API task to frontend Task
const transformTaskFromAPI = (apiTask: APITask): Task => ({
  id: apiTask.id,
  title: apiTask.title,
  icon: apiTask.icon,
  reminderTime: transformReminderTime(apiTask.reminder_time),
  recurrence: apiTask.recurrence ? transformRecurrenceRule(apiTask.recurrence) : undefined,
  completed: apiTask.completed,
  createdAt: apiTask.created_at,
  updatedAt: apiTask.updated_at,
  completedAt: apiTask.completed_at || undefined,
  completedBy: apiTask.completed_by || undefined,
});

// Safely validate and transform a single task
const safeTransformTask = (rawTask: unknown): Task | null => {
  try {
    const validatedTask = APITaskSchema.parse(rawTask);
    return transformTaskFromAPI(validatedTask);
  } catch (error) {
    if (__DEV__) console.warn('Failed to validate task:', error);
    return null;
  }
};

export const useGetTasks = (options?: Omit<UseQueryOptions<Task[]>, 'queryKey' | 'queryFn'>) =>
  useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async (): Promise<Task[]> => {
      const res = await axiosClientWithAuth.get('/tasks');
      const validatedData = APITaskListResponseSchema.parse(res.data);

      // Filter out invalid tasks and only keep valid ones
      const validTasks = validatedData.tasks.reduce<Task[]>((acc, curr) => {
        const transformedTask = safeTransformTask(curr);
        if (transformedTask) acc.push(transformedTask);
        return acc;
      }, []);
      return validTasks;
    },
    ...options,
  });
