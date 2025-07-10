import { axiosClientWithAuth } from '@/api/axiosClient';
import type { DayOfWeek, RecurrenceRule, RecurrenceUnit, ReminderTime, Task } from '@/types/task';
import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { z } from 'zod';

/* =============================================================================
 * API Schema Definitions
 * ============================================================================= */

// Reminder time schema
const APIReminderTimeSchema = z.object({
  hour: z.number().min(0).max(23),
  minute: z.number().min(0).max(59),
});

// Recurrence rule schema
const APIRecurrenceRuleSchema = z.object({
  interval: z.number().positive(),
  unit: z.enum(['DAY', 'WEEK', 'MONTH']),
  days_of_week: z.array(z.number().min(0).max(6)).nullable().optional(),
  days_of_month: z.array(z.number().min(1).max(31)).nullable().optional(),
});

// Task schema
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

// Task list response schema
const APITaskListResponseSchema = z.object({
  tasks: z.array(z.unknown()), // Accept any array structure
});

// Task response schema for single task operations
const APITaskResponseSchema = z.object({
  task: APITaskSchema,
});

/* =============================================================================
 * Type Definitions
 * ============================================================================= */

type APIReminderTime = z.infer<typeof APIReminderTimeSchema>;
type APIRecurrenceRule = z.infer<typeof APIRecurrenceRuleSchema>;
type APITask = z.infer<typeof APITaskSchema>;

/* =============================================================================
 * Data Transform Functions
 * ============================================================================= */

// Normalize hour to 0-23 range
const normalizeHour = (hour: number): number => {
  return hour === 24 ? 0 : hour;
};

// Transform API reminder time to frontend ReminderTime
const transformReminderTime = (apiReminderTime: APIReminderTime): ReminderTime => {
  return {
    hour: normalizeHour(apiReminderTime.hour),
    minute: apiReminderTime.minute,
  };
};

// Transform API recurrence rule to frontend RecurrenceRule
const transformRecurrenceRule = (apiRecurrence: APIRecurrenceRule): RecurrenceRule => ({
  interval: apiRecurrence.interval,
  unit: apiRecurrence.unit as RecurrenceUnit,
  daysOfWeek: (apiRecurrence.days_of_week as DayOfWeek[]) || undefined,
  daysOfMonth: apiRecurrence.days_of_month || undefined,
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

// Transform frontend TaskFormData to API format
const transformTaskFormDataToAPI = (formData: {
  title: string;
  icon: string;
  reminderTime: ReminderTime;
  recurrence?: RecurrenceRule;
}) => {
  const apiData = {
    title: formData.title,
    icon: formData.icon,
    reminder_time: {
      hour: normalizeHour(formData.reminderTime.hour),
      minute: formData.reminderTime.minute,
    },
    recurrence: formData.recurrence
      ? {
          interval: formData.recurrence.interval,
          unit: formData.recurrence.unit,
          days_of_week: formData.recurrence.daysOfWeek,
          days_of_month: formData.recurrence.daysOfMonth,
        }
      : null,
  };

  return apiData;
};

/* =============================================================================
 * Utility Functions
 * ============================================================================= */

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

/* =============================================================================
 * API Hooks
 * ============================================================================= */

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

export const useGetTask = (
  taskId: string,
  options?: Omit<UseQueryOptions<Task>, 'queryKey' | 'queryFn'>,
) =>
  useQuery<Task>({
    queryKey: ['task', taskId],
    queryFn: async (): Promise<Task> => {
      const res = await axiosClientWithAuth.get(`/tasks/${taskId}`);
      const validatedData = APITaskResponseSchema.parse(res.data);
      return transformTaskFromAPI(validatedData.task);
    },
    enabled: !!taskId,
    ...options,
  });

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: {
      title: string;
      icon: string;
      reminderTime: ReminderTime;
      recurrence?: RecurrenceRule;
    }): Promise<void> => {
      const requestData = transformTaskFormDataToAPI(formData);
      await axiosClientWithAuth.post('/tasks', requestData);
    },
    onSuccess: () => {
      // Invalidate and refetch tasks list
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      updates,
    }: {
      taskId: string;
      updates: {
        title: string;
        icon: string;
        reminderTime: ReminderTime;
        recurrence?: RecurrenceRule;
      };
    }): Promise<Task> => {
      console.log({
        taskId,
        updates,
      });
      const requestData = transformTaskFormDataToAPI(updates);

      const res = await axiosClientWithAuth.put(`/tasks/${taskId}`, requestData);
      const validatedData = APITaskResponseSchema.parse(res.data);
      return transformTaskFromAPI(validatedData.task);
    },
    onSuccess: (_, { taskId }) => {
      // Invalidate and refetch tasks list
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string): Promise<void> => {
      await axiosClientWithAuth.delete(`/tasks/${taskId}`);
    },
    onSuccess: () => {
      // Invalidate and refetch tasks list
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      completed,
    }: {
      taskId: string;
      completed: boolean;
    }): Promise<Task> => {
      const res = await axiosClientWithAuth.put(`/tasks/${taskId}/status`, {
        completed,
      });
      const validatedData = APITaskResponseSchema.parse(res.data);
      return transformTaskFromAPI(validatedData.task);
    },
    onSuccess: (_, { taskId }) => {
      // Invalidate and refetch tasks list
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    },
  });
};
