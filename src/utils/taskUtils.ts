import { default as dayjs } from 'dayjs';

import type { ReminderTime, TaskTemplate } from '@/types/task';

import { RecurrenceUnit } from '@/types/task';

// Helper function to determine if a task should appear today based on its recurrence rule
export const shouldTaskAppearToday = ({ recurrence, createdAt }: TaskTemplate): boolean => {
  const today = dayjs();
  const dayOfWeek = today.day(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const dayOfMonth = today.date();

  if (!recurrence) return false;

  // If interval is 0, only show on the created day
  if (recurrence.interval === 0) {
    return today.isSame(dayjs(createdAt), 'day');
  }

  let daysSinceStart: number;
  let weeksSinceStart: number;
  let monthsSinceStart: number;
  switch (recurrence.unit) {
    case RecurrenceUnit.DAY:
      // Appear every interval days, using createdAt as the start point
      daysSinceStart = today.diff(dayjs(createdAt), 'day');
      return daysSinceStart % recurrence.interval === 0;

    case RecurrenceUnit.WEEK:
      if (!recurrence.daysOfWeek || recurrence.daysOfWeek.length === 0) return false;
      // Appear every interval weeks, and today must be one of the specified days of week
      weeksSinceStart = today.diff(dayjs(createdAt), 'week');
      return (
        weeksSinceStart % recurrence.interval === 0 && recurrence.daysOfWeek.includes(dayOfWeek)
      );

    case RecurrenceUnit.MONTH:
      if (!recurrence.daysOfMonth || recurrence.daysOfMonth.length === 0) return false;
      // Appear every interval months, and today must be one of the specified days of month
      monthsSinceStart = today.diff(dayjs(createdAt), 'month');
      return (
        monthsSinceStart % recurrence.interval === 0 && recurrence.daysOfMonth.includes(dayOfMonth)
      );

    default:
      return false;
  }
};

export const getNextOccurrenceDate = (task: TaskTemplate): dayjs.Dayjs | null => {
  const { recurrence, createdAt } = task;
  const today = dayjs();

  if (!recurrence || recurrence.interval === 0) return null;

  switch (recurrence.unit) {
    case RecurrenceUnit.DAY: {
      // Calculate days until next occurrence
      const daysSinceStart = today.diff(dayjs(createdAt), 'day');
      const daysToAdd = recurrence.interval - (daysSinceStart % recurrence.interval);
      return today.add(daysToAdd, 'day');
    }

    case RecurrenceUnit.WEEK: {
      if (!recurrence.daysOfWeek || recurrence.daysOfWeek.length === 0) return null;
      // Find the nearest specified day of week in the next cycle
      const weeksSinceStart = today.diff(dayjs(createdAt), 'week');
      const isThisWeek = weeksSinceStart % recurrence.interval === 0;
      const todayDay = today.day();
      const sortedDays = [...recurrence.daysOfWeek].sort((a, b) => a - b);

      // Check remaining days in current week
      if (isThisWeek) {
        const nextDay = sortedDays.find((d) => d > todayDay);
        if (nextDay !== undefined) {
          return today.add(nextDay - todayDay, 'day');
        }
      }
      // Get first specified day in next cycle
      const weeksToAdd =
        recurrence.interval - (weeksSinceStart % recurrence.interval) || recurrence.interval;
      const firstDay = sortedDays[0];
      const daysToAdd = 7 * weeksToAdd + ((firstDay - todayDay + 7) % 7);
      return today.add(daysToAdd, 'day');
    }

    case RecurrenceUnit.MONTH: {
      if (!recurrence.daysOfMonth || recurrence.daysOfMonth.length === 0) return null;
      // Find the nearest specified day of month in the next cycle
      const monthsSinceStart = today.diff(dayjs(createdAt), 'month');
      const isThisMonth = monthsSinceStart % recurrence.interval === 0;
      const todayDate = today.date();
      const sortedDays = [...recurrence.daysOfMonth].sort((a, b) => a - b);

      // Check remaining days in current month
      if (isThisMonth) {
        const nextDay = sortedDays.find((d) => d > todayDate);
        if (nextDay !== undefined) {
          let nextDate = today.date(nextDay);
          if (!nextDate.isValid()) {
            nextDate = today.endOf('month');
          }
          return nextDate;
        }
      }
      // Get first specified day in next cycle
      const monthsToAdd =
        recurrence.interval - (monthsSinceStart % recurrence.interval) || recurrence.interval;
      const firstDay = sortedDays[0];
      let nextDate = today.add(monthsToAdd, 'month').date(firstDay);
      if (!nextDate.isValid()) {
        nextDate = today.add(monthsToAdd, 'month').endOf('month');
      }
      return nextDate;
    }

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
