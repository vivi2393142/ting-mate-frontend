import { default as dayjs } from 'dayjs';

import type { ReminderTime, TaskTemplate } from '@/types/task';
import { RecurrenceFrequency } from '@/types/task';

// Helper function to determine if a task should appear today based on its recurrence rule
export const shouldTaskAppearToday = ({ recurrence, createdAt }: TaskTemplate): boolean => {
  const today = dayjs();
  const dayOfWeek = today.day(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const dayOfMonth = today.date();

  switch (recurrence.frequency) {
    case RecurrenceFrequency.DAILY:
      return true;

    case RecurrenceFrequency.WEEKLY: {
      if (!recurrence.daysOfWeek || recurrence.daysOfWeek.length === 0) return false;
      return recurrence.daysOfWeek.includes(dayOfWeek);
    }

    case RecurrenceFrequency.MONTHLY:
      if (!recurrence.dayOfMonth) return false;
      return dayOfMonth === recurrence.dayOfMonth;

    case RecurrenceFrequency.ONCE: {
      // Check if it was created today
      // TODO: for expired tasks, BE should not return them
      const taskCreatedDate = dayjs(createdAt);
      return taskCreatedDate.isSame(today, 'day');
    }

    default:
      return false;
  }
};

// Helper function to get next occurrence date for a task
export const getNextOccurrenceDate = (task: TaskTemplate): dayjs.Dayjs | null => {
  const today = dayjs();
  const dayOfWeek = today.day();

  switch (task.recurrence.frequency) {
    case RecurrenceFrequency.DAILY:
      return today.add(1, 'day');

    case RecurrenceFrequency.WEEKLY: {
      if (!task.recurrence.daysOfWeek || task.recurrence.daysOfWeek.length === 0) {
        return null;
      }

      // Find the next occurrence day
      const adjustedDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
      const sortedDays = [...task.recurrence.daysOfWeek].sort((a, b) => a - b);

      // Find the next day this week
      const nextDayThisWeek = sortedDays.find((day) => day > adjustedDayOfWeek);
      if (nextDayThisWeek) {
        const daysToAdd = nextDayThisWeek - adjustedDayOfWeek;
        return today.add(daysToAdd, 'day');
      }

      // If no day this week, find the first day next week
      const firstDayNextWeek = sortedDays[0];
      const daysToAdd = 7 - adjustedDayOfWeek + firstDayNextWeek;
      return today.add(daysToAdd, 'day');
    }

    case RecurrenceFrequency.MONTHLY: {
      if (!task.recurrence.dayOfMonth) {
        return null;
      }

      const currentMonth = today.month();
      const currentYear = today.year();

      // Try next month
      let nextDate = dayjs()
        .year(currentYear)
        .month(currentMonth + 1)
        .date(task.recurrence.dayOfMonth);

      // If the day doesn't exist in next month (e.g., 31st in February),
      // get the last day of that month
      if (!nextDate.isValid()) {
        nextDate = dayjs()
          .year(currentYear)
          .month(currentMonth + 1)
          .endOf('month');
      }

      return nextDate;
    }

    case RecurrenceFrequency.ONCE:
      return null;

    default:
      return null;
  }
};

// Helper function to determine if a task is missed based on current time
export const isTaskMissed = (reminderTime: ReminderTime, currentTime: Date): boolean => {
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();

  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  const reminderTimeInMinutes = reminderTime.hour * 60 + reminderTime.minute;

  return currentTimeInMinutes > reminderTimeInMinutes;
};

export const formatReminderTime = (reminderTime: ReminderTime): string => {
  return dayjs().hour(reminderTime.hour).minute(reminderTime.minute).format('HH:mm');
};
