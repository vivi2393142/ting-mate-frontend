import { default as dayjs } from 'dayjs';

import type { ReminderTime, Task, TaskFormData } from '@/types/task';
import { RecurrenceUnit } from '@/types/task';
import { TaskFormDataSchema } from '@/utils/validators';

// TODO: add tests for this file

// Helper function to determine if a task should appear today based on its recurrence rule
export const shouldTaskAppearToday = ({ recurrence, createdAt }: Task): boolean => {
  const today = dayjs();
  const dayOfWeek = today.day(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const dayOfMonth = today.date();

  // If no recurrence, only show on the created day (once task)
  if (!recurrence) return today.isSame(dayjs(createdAt), 'day');

  switch (recurrence.unit) {
    case RecurrenceUnit.DAY: {
      // Appear every interval days, using createdAt as the start point
      const daysSinceStart = today.diff(dayjs(createdAt), 'day');
      return daysSinceStart % recurrence.interval === 0;
    }

    case RecurrenceUnit.WEEK: {
      if (!recurrence.daysOfWeek?.length) return false;
      // Appear every interval weeks, and today must be one of the specified days of week
      const weeksSinceStart = today.diff(dayjs(createdAt), 'week');
      return (
        weeksSinceStart % recurrence.interval === 0 && recurrence.daysOfWeek.includes(dayOfWeek)
      );
    }

    case RecurrenceUnit.MONTH: {
      if (!recurrence.daysOfMonth?.length) return false;
      // Appear every interval months, and today must be one of the specified days of month
      const monthsSinceStart = today.diff(dayjs(createdAt), 'month');
      return (
        monthsSinceStart % recurrence.interval === 0 && recurrence.daysOfMonth.includes(dayOfMonth)
      );
    }

    default:
      return false;
  }
};

export const getNextOccurrenceDate = (task: Task): dayjs.Dayjs | null => {
  const { recurrence, createdAt } = task;
  const today = dayjs();

  if (!recurrence || recurrence.interval === 0) return null;

  switch (recurrence.unit) {
    case RecurrenceUnit.DAY: {
      const daysSinceStart = today.diff(dayjs(createdAt), 'day');
      const daysToAdd = recurrence.interval - (daysSinceStart % recurrence.interval);
      return today.add(daysToAdd, 'day');
    }

    case RecurrenceUnit.WEEK: {
      if (!recurrence.daysOfWeek?.length) return null;

      const weeksSinceStart = today.diff(dayjs(createdAt), 'week');
      const isThisWeek = weeksSinceStart % recurrence.interval === 0;
      const todayDay = today.day();
      const sortedDays = [...recurrence.daysOfWeek].sort((a, b) => a - b);

      // Check remaining days in current week
      if (isThisWeek) {
        const nextDay = sortedDays.find((d) => d > todayDay);
        if (nextDay !== undefined) return today.add(nextDay - todayDay, 'day');
      }

      // Get first specified day in next cycle
      const weeksToAdd =
        recurrence.interval - (weeksSinceStart % recurrence.interval) || recurrence.interval;
      const firstDay = sortedDays[0];
      const daysToAdd = 7 * weeksToAdd + ((firstDay - todayDay + 7) % 7);
      return today.add(daysToAdd, 'day');
    }

    case RecurrenceUnit.MONTH: {
      if (!recurrence.daysOfMonth?.length) return null;

      const monthsSinceStart = today.diff(dayjs(createdAt), 'month');
      const isThisMonth = monthsSinceStart % recurrence.interval === 0;
      const todayDate = today.date();
      const sortedDays = [...recurrence.daysOfMonth].sort((a, b) => a - b);

      // Check remaining days in current month
      if (isThisMonth) {
        const nextDay = sortedDays.find((d) => d > todayDate);
        if (nextDay !== undefined) {
          const nextDate = today.date(nextDay);
          return nextDate.isValid() ? nextDate : today.endOf('month');
        }
      }

      // Get first specified day in next cycle
      const monthsToAdd =
        recurrence.interval - (monthsSinceStart % recurrence.interval) || recurrence.interval;
      const firstDay = sortedDays[0];
      const nextDate = today.add(monthsToAdd, 'month').date(firstDay);
      return nextDate.isValid() ? nextDate : today.add(monthsToAdd, 'month').endOf('month');
    }

    default:
      return null;
  }
};

/**
 * Calculate the next notification time by combining the next occurrence date with the reminder time
 * This function can be shared between task display logic and notification scheduling
 */
export const getNextNotificationTime = (task: Task): dayjs.Dayjs | null => {
  const nextOccurrence = getNextOccurrenceDate(task);
  if (!nextOccurrence) return null;

  const nextNotificationTime = nextOccurrence
    .hour(task.reminderTime.hour)
    .minute(task.reminderTime.minute)
    .second(0)
    .millisecond(0);

  // If the notification time has already passed, return null
  return nextNotificationTime.isBefore(dayjs()) ? null : nextNotificationTime;
};

// Helper function to determine if a task is missed based on current time
export const isTaskMissed = (reminderTime: ReminderTime, currentTime: Date): boolean => {
  const currentTimeInMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const reminderTimeInMinutes = reminderTime.hour * 60 + reminderTime.minute;
  return currentTimeInMinutes > reminderTimeInMinutes;
};

export const formatReminderTime = (reminderTime: ReminderTime): string => {
  return dayjs().hour(reminderTime.hour).minute(reminderTime.minute).format('HH:mm');
};

// Auto fill invalid task form data
export const autoFillInvalidTaskFormData = (input: Partial<TaskFormData>): TaskFormData => {
  const now = new Date();
  const nextHour = now.getMinutes() === 0 ? now.getHours() : now.getHours() + 1;

  // Default values
  const defaults: TaskFormData = {
    title: '(no title)',
    icon: '✅',
    recurrence: { interval: 1, unit: RecurrenceUnit.DAY },
    reminderTime: { hour: nextHour, minute: 0 },
  };

  // Combine input with defaults
  const filled: TaskFormData = {
    title: input.title?.length ? input.title : defaults.title,
    icon: input.icon?.length ? input.icon : defaults.icon,
    recurrence: input.recurrence,
    reminderTime: input.reminderTime || defaults.reminderTime,
  };

  // Validate and fix any issues
  let result = TaskFormDataSchema.safeParse(filled);

  if (!result.success) {
    // If recurrence is invalid, use default
    if (result.error.issues.some((issue) => issue.path[0] === 'recurrence')) {
      filled.recurrence = defaults.recurrence;
      result = TaskFormDataSchema.safeParse(filled);
    }

    // If still invalid, use all defaults
    if (!result.success) {
      return defaults;
    }
  }

  return result.data;
};
