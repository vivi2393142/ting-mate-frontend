import { default as dayjs } from 'dayjs';

import {
  DEFAULT_RECURRENCE_INTERVAL,
  DEFAULT_REMINDER_MINUTE,
  DEFAULT_TASK_ICON,
  DEFAULT_TASK_TITLE,
  MAX_NOTIFICATIONS_PER_TASK,
  NOTIFICATION_SCHEDULE_MONTHS_AHEAD,
} from '@/constants';
import type { ReminderTime, Task, TaskFormData } from '@/types/task';
import { RecurrenceUnit } from '@/types/task';
import { TaskFormDataSchema } from '@/utils/validators';

// TODO: add tests for this file

/** Calculate the next occurrence date for a task */
export const getNextNotificationDate = (task: Task): dayjs.Dayjs | null => {
  const { recurrence, createdAt } = task;
  const today = dayjs();

  if (!recurrence || recurrence.interval === 0) {
    // For non-recurring tasks, return today if it's the task date
    const taskDate = dayjs(createdAt);
    if (taskDate.isSame(today, 'day')) return today;
    // If task date is in the future, return it; otherwise return null
    return taskDate.isAfter(today) ? taskDate : null;
  }

  switch (recurrence.unit) {
    case RecurrenceUnit.DAY: {
      const daysSinceStart = today.diff(dayjs(createdAt), 'day');
      // If today is the occurrence day, return today
      if (daysSinceStart % recurrence.interval === 0) return today;
      const daysToAdd = recurrence.interval - (daysSinceStart % recurrence.interval);
      return today.add(daysToAdd, 'day');
    }

    case RecurrenceUnit.WEEK: {
      if (!recurrence.daysOfWeek?.length) return null;

      const weeksSinceStart = today.diff(dayjs(createdAt), 'week');
      const isThisWeek = weeksSinceStart % recurrence.interval === 0;
      const todayDay = today.day();
      const sortedDays = [...recurrence.daysOfWeek].sort((a, b) => a - b);

      // Check if today is a valid occurrence day
      if (isThisWeek && recurrence.daysOfWeek.includes(todayDay)) return today;

      // Find the first occurrence in current week or next cycle
      if (isThisWeek) {
        const nextDay = sortedDays.find((d) => d > todayDay);
        if (nextDay !== undefined) {
          return today.add(nextDay - todayDay, 'day');
        } else {
          // Move to next cycle
          const weeksToAdd = recurrence.interval;
          const firstDay = sortedDays[0];
          const daysToAdd = 7 * weeksToAdd + ((firstDay - todayDay + 7) % 7);
          return today.add(daysToAdd, 'day');
        }
      } else {
        // Get first specified day in next cycle
        const weeksToAdd =
          recurrence.interval - (weeksSinceStart % recurrence.interval) || recurrence.interval;
        const firstDay = sortedDays[0];
        const daysToAdd = 7 * weeksToAdd + ((firstDay - todayDay + 7) % 7);
        return today.add(daysToAdd, 'day');
      }
    }

    case RecurrenceUnit.MONTH: {
      if (!recurrence.daysOfMonth?.length) return null;

      const monthsSinceStart = today.diff(dayjs(createdAt), 'month');
      const isThisMonth = monthsSinceStart % recurrence.interval === 0;
      const todayDate = today.date();
      const sortedDays = [...recurrence.daysOfMonth].sort((a, b) => a - b);

      // Check if today is a valid occurrence day
      if (isThisMonth && recurrence.daysOfMonth.includes(todayDate)) return today;

      // Find the first occurrence in current month or next cycle
      if (isThisMonth) {
        const nextDay = sortedDays.find((d) => d > todayDate);
        if (nextDay !== undefined) {
          const occurrence = today.date(nextDay);
          return occurrence.isValid() ? occurrence : today.endOf('month');
        } else {
          // Move to next cycle
          const monthsToAdd = recurrence.interval;
          const firstDay = sortedDays[0];
          const occurrence = today.add(monthsToAdd, 'month').date(firstDay);
          return occurrence.isValid() ? occurrence : today.add(monthsToAdd, 'month').endOf('month');
        }
      } else {
        // Get first specified day in next cycle
        const monthsToAdd =
          recurrence.interval - (monthsSinceStart % recurrence.interval) || recurrence.interval;
        const firstDay = sortedDays[0];
        const occurrence = today.add(monthsToAdd, 'month').date(firstDay);
        return occurrence.isValid() ? occurrence : today.add(monthsToAdd, 'month').endOf('month');
      }
    }

    default:
      return null;
  }
};

/** Calculate multiple future occurrence dates for a task */
export const getFutureNotificationDates = (
  task: Task,
  monthsAhead: number = NOTIFICATION_SCHEDULE_MONTHS_AHEAD,
  maxCount: number = MAX_NOTIFICATIONS_PER_TASK,
): dayjs.Dayjs[] => {
  const today = dayjs();
  const endDate = today.add(monthsAhead, 'month');
  const occurrences: dayjs.Dayjs[] = [];

  // Get the first occurrence
  let currentDate = getNextNotificationDate(task);
  if (!currentDate) return [];

  // Generate subsequent occurrences within the time range
  while (currentDate && currentDate.isBefore(endDate) && occurrences.length < maxCount) {
    // Check if this occurrence time would be in the future
    const { hour, minute } = task.reminderTime;
    const occurrenceTime = currentDate.hour(hour).minute(minute).second(0).millisecond(0);

    // Only include if the occurrence time is in the future
    if (occurrenceTime.isAfter(today)) occurrences.push(currentDate);

    // Calculate next occurrence based on recurrence pattern
    const { recurrence } = task;
    if (!recurrence || recurrence.interval === 0) break;

    switch (recurrence.unit) {
      case RecurrenceUnit.DAY:
        currentDate = currentDate.add(recurrence.interval, 'day');
        break;
      case RecurrenceUnit.WEEK:
        currentDate = currentDate.add(recurrence.interval, 'week');
        break;
      case RecurrenceUnit.MONTH:
        currentDate = currentDate.add(recurrence.interval, 'month');
        break;
      default:
        break;
    }
  }

  return occurrences;
};

/** Get all notification times within a specified time range */
export const getFutureNotificationTimes = (
  task: Task,
  monthsAhead: number,
  maxCount: number,
): dayjs.Dayjs[] => {
  // Get all occurrence dates within the specified range
  const occurrenceDates = getFutureNotificationDates(task, monthsAhead, maxCount);

  // Convert to notification times
  const { hour, minute } = task.reminderTime;
  return occurrenceDates.map((d) => d.hour(hour).minute(minute).second(0).millisecond(0));
};

/** Get the next notification time for a task */
export const getNextNotificationTime = (task: Task): dayjs.Dayjs | null => {
  const nextDate = getNextNotificationDate(task);
  if (!nextDate) return null;

  const { hour, minute } = task.reminderTime;
  return nextDate.hour(hour).minute(minute).second(0).millisecond(0);
};

/** Check if a task should appear today */
export const shouldTaskAppearToday = (task: Task): boolean => {
  const nextTime = getNextNotificationTime(task);
  if (!nextTime) return false;

  // Check if the next notification time is today
  return nextTime.isSame(dayjs(), 'day');
};

/** Determine if a task is missed based on current time */
export const isTaskMissed = (reminderTime: ReminderTime, currentTime: Date): boolean => {
  const currentTimeInMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const reminderTimeInMinutes = reminderTime.hour * 60 + reminderTime.minute;
  return currentTimeInMinutes > reminderTimeInMinutes;
};

/** Format reminder time to HH:mm string */
export const formatReminderTime = (reminderTime: ReminderTime): string => {
  return dayjs().hour(reminderTime.hour).minute(reminderTime.minute).format('HH:mm');
};

/** Auto fill invalid task form data with defaults */
export const autoFillInvalidTaskFormData = (input: Partial<TaskFormData>): TaskFormData => {
  const now = new Date();
  const nextHour = now.getMinutes() === 0 ? now.getHours() : now.getHours() + 1;

  // Default values
  const defaults: TaskFormData = {
    title: DEFAULT_TASK_TITLE,
    icon: DEFAULT_TASK_ICON,
    recurrence: { interval: DEFAULT_RECURRENCE_INTERVAL, unit: RecurrenceUnit.DAY },
    reminderTime: { hour: nextHour, minute: DEFAULT_REMINDER_MINUTE },
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
    if (!result.success) return defaults;
  }

  return result.data;
};
