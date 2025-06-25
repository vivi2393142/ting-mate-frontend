import { z } from 'zod';

import { RecurrenceUnit, type DayOfWeek } from '@/types/task';

export const isDayOfWeek = (value: unknown): value is DayOfWeek =>
  z.number().int().min(0).max(6).safeParse(value).success;

// Zod schema for TaskFormData
const ReminderTimeSchema = z.object({
  hour: z.number().int().min(0).max(23),
  minute: z.number().int().min(0).max(59),
});

const RecurrenceRuleSchema = z
  .object({
    interval: z.number().int().min(1), // must be > 0
    unit: z.nativeEnum(RecurrenceUnit),
    daysOfWeek: z.array(z.custom<DayOfWeek>(isDayOfWeek)).optional(),
    daysOfMonth: z.array(z.number().int().min(1).max(31)).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.unit === RecurrenceUnit.WEEK && !val?.daysOfWeek?.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Weekly recurrence must specify daysOfWeek',
        path: ['daysOfWeek'],
      });
    }
    if (val.unit === RecurrenceUnit.MONTH && !val?.daysOfMonth?.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Monthly recurrence must specify daysOfMonth',
        path: ['daysOfMonth'],
      });
    }
  });

export const TaskFormDataSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  icon: z.string().min(1, 'Icon is required'),
  recurrence: RecurrenceRuleSchema.optional(), // undefined means no recurrence
  reminderTimeList: z
    .array(
      z.object({
        id: z.string().optional(),
        reminderTime: ReminderTimeSchema,
      }),
    )
    .min(1, 'At least one reminder time is required'),
});
