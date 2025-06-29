import dayjs from 'dayjs';

import type { Task } from '@/types/task';
import { RecurrenceUnit } from '@/types/task';
import {
  getFutureNotificationDates,
  getFutureNotificationTimes,
  getNextNotificationDate,
  getNextNotificationTime,
} from '@/utils/taskUtils';

describe('taskUtils', () => {
  const today = dayjs();
  const tomorrow = today.add(1, 'day');
  const yesterday = today.subtract(1, 'day');

  describe('getNextNotificationDate', () => {
    describe('non-recurring tasks', () => {
      it('should return today if task was created today', () => {
        const task: Task = {
          id: 'test-1',
          title: 'Test Task',
          icon: '✅',
          reminderTime: { hour: 10, minute: 0 },
          completed: false,
          createdAt: today.toISOString(),
          updatedAt: today.toISOString(),
        };

        const result = getNextNotificationDate(task);
        expect(result?.isSame(today, 'day')).toBe(true);
      });

      it('should return future date if task was created in the future', () => {
        const futureDate = today.add(5, 'days');
        const task: Task = {
          id: 'test-2',
          title: 'Test Task',
          icon: '✅',
          reminderTime: { hour: 10, minute: 0 },
          completed: false,
          createdAt: futureDate.toISOString(),
          updatedAt: today.toISOString(),
        };

        const result = getNextNotificationDate(task);
        expect(result?.isSame(futureDate, 'day')).toBe(true);
      });

      it('should return null if task was created in the past', () => {
        const pastDate = today.subtract(5, 'days');
        const task: Task = {
          id: 'test-3',
          title: 'Test Task',
          icon: '✅',
          reminderTime: { hour: 10, minute: 0 },
          completed: false,
          createdAt: pastDate.toISOString(),
          updatedAt: today.toISOString(),
        };

        const result = getNextNotificationDate(task);
        expect(result).toBeNull();
      });
    });

    describe('daily recurring tasks', () => {
      it('should return today if today is an occurrence day', () => {
        const task: Task = {
          id: 'test-4',
          title: 'Daily Task',
          icon: '✅',
          reminderTime: { hour: 10, minute: 0 },
          recurrence: { interval: 1, unit: RecurrenceUnit.DAY },
          completed: false,
          createdAt: today.subtract(7, 'days').toISOString(), // 7 days ago
          updatedAt: today.toISOString(),
        };

        const result = getNextNotificationDate(task);
        expect(result?.isSame(today, 'day')).toBe(true);
      });

      it('should return next occurrence date if today is not an occurrence day', () => {
        const task: Task = {
          id: 'test-5',
          title: 'Every 3 Days Task',
          icon: '✅',
          reminderTime: { hour: 10, minute: 0 },
          recurrence: { interval: 3, unit: RecurrenceUnit.DAY },
          completed: false,
          createdAt: today.subtract(1, 'day').toISOString(), // 1 day ago
          updatedAt: today.toISOString(),
        };

        const result = getNextNotificationDate(task);
        expect(result?.isSame(today.add(2, 'days'), 'day')).toBe(true); // Next occurrence in 2 days
      });
    });

    describe('weekly recurring tasks', () => {
      it('should return today if today is a valid occurrence day', () => {
        const todayDay = today.day(); // 0-6 (Sunday-Saturday)
        const task: Task = {
          id: 'test-6',
          title: 'Weekly Task',
          icon: '✅',
          reminderTime: { hour: 10, minute: 0 },
          recurrence: {
            interval: 1,
            unit: RecurrenceUnit.WEEK,
            daysOfWeek: [todayDay],
          },
          completed: false,
          createdAt: today.subtract(7, 'days').toISOString(), // 1 week ago
          updatedAt: today.toISOString(),
        };

        const result = getNextNotificationDate(task);
        expect(result?.isSame(today, 'day')).toBe(true);
      });

      it('should return next occurrence in current week if available', () => {
        const todayDay = today.day();
        const nextDay = ((todayDay + 1) % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6; // Next day of week
        const task: Task = {
          id: 'test-7',
          title: 'Weekly Task',
          icon: '✅',
          reminderTime: { hour: 10, minute: 0 },
          recurrence: {
            interval: 1,
            unit: RecurrenceUnit.WEEK,
            daysOfWeek: [nextDay],
          },
          completed: false,
          createdAt: today.subtract(7, 'days').toISOString(),
          updatedAt: today.toISOString(),
        };

        const result = getNextNotificationDate(task);
        expect(result?.isSame(today.add(1, 'day'), 'day')).toBe(true);
      });

      it('should return null if no days of week specified', () => {
        const task: Task = {
          id: 'test-8',
          title: 'Weekly Task',
          icon: '✅',
          reminderTime: { hour: 10, minute: 0 },
          recurrence: {
            interval: 1,
            unit: RecurrenceUnit.WEEK,
            daysOfWeek: [],
          },
          completed: false,
          createdAt: today.subtract(7, 'days').toISOString(),
          updatedAt: today.toISOString(),
        };

        const result = getNextNotificationDate(task);
        expect(result).toBeNull();
      });
    });

    describe('monthly recurring tasks', () => {
      it('should return today if today is a valid occurrence day', () => {
        const todayDate = today.date(); // 1-31
        const task: Task = {
          id: 'test-9',
          title: 'Monthly Task',
          icon: '✅',
          reminderTime: { hour: 10, minute: 0 },
          recurrence: {
            interval: 1,
            unit: RecurrenceUnit.MONTH,
            daysOfMonth: [todayDate],
          },
          completed: false,
          createdAt: today.subtract(30, 'days').toISOString(), // 1 month ago
          updatedAt: today.toISOString(),
        };

        const result = getNextNotificationDate(task);
        expect(result?.isSame(today, 'day')).toBe(true);
      });

      it('should return next occurrence in current month if available', () => {
        const todayDate = today.date();
        const nextDate = Math.min(todayDate + 1, 31); // Next day of month
        const task: Task = {
          id: 'test-10',
          title: 'Monthly Task',
          icon: '✅',
          reminderTime: { hour: 10, minute: 0 },
          recurrence: {
            interval: 1,
            unit: RecurrenceUnit.MONTH,
            daysOfMonth: [nextDate],
          },
          completed: false,
          createdAt: today.subtract(30, 'days').toISOString(),
          updatedAt: today.toISOString(),
        };

        const result = getNextNotificationDate(task);
        if (nextDate <= today.daysInMonth()) {
          expect(result?.isSame(today.date(nextDate), 'day')).toBe(true);
        } else {
          expect(result?.isSame(today.endOf('month'), 'day')).toBe(true);
        }
      });

      it('should return null if no days of month specified', () => {
        const task: Task = {
          id: 'test-11',
          title: 'Monthly Task',
          icon: '✅',
          reminderTime: { hour: 10, minute: 0 },
          recurrence: {
            interval: 1,
            unit: RecurrenceUnit.MONTH,
            daysOfMonth: [],
          },
          completed: false,
          createdAt: today.subtract(30, 'days').toISOString(),
          updatedAt: today.toISOString(),
        };

        const result = getNextNotificationDate(task);
        expect(result).toBeNull();
      });
    });
  });

  describe('getFutureNotificationDates', () => {
    it('should return empty array for non-recurring task with past creation date', () => {
      const task: Task = {
        id: 'test-12',
        title: 'Past Task',
        icon: '✅',
        reminderTime: { hour: 10, minute: 0 },
        completed: false,
        createdAt: yesterday.toISOString(),
        updatedAt: today.toISOString(),
      };

      const result = getFutureNotificationDates(task, 2, 10);
      expect(result).toEqual([]);
    });

    it('should return single date for non-recurring task with future creation date', () => {
      const futureDate = today.add(5, 'days');
      const task: Task = {
        id: 'test-13',
        title: 'Future Task',
        icon: '✅',
        reminderTime: { hour: 10, minute: 0 },
        completed: false,
        createdAt: futureDate.toISOString(),
        updatedAt: today.toISOString(),
      };

      const result = getFutureNotificationDates(task, 2, 10);
      expect(result).toEqual([futureDate]);
    });

    it('should return multiple dates for daily recurring task', () => {
      const task: Task = {
        id: 'test-14',
        title: 'Daily Task',
        icon: '✅',
        reminderTime: { hour: 10, minute: 0 },
        recurrence: { interval: 1, unit: RecurrenceUnit.DAY },
        completed: false,
        createdAt: today.subtract(7, 'days').toISOString(),
        updatedAt: today.toISOString(),
      };

      const result = getFutureNotificationDates(task, 1, 5);

      // Should return dates starting from today or tomorrow, every day
      expect(result.length).toBeGreaterThan(0);

      // Check if current time is past the reminder time (10:00)
      const currentHour = today.hour();
      const currentMinute = today.minute();
      const reminderTimeInMinutes = 10 * 60; // 10:00
      const currentTimeInMinutes = currentHour * 60 + currentMinute;

      if (currentTimeInMinutes >= reminderTimeInMinutes) {
        // If current time is past 10:00, first occurrence should be tomorrow
        expect(result[0].isSame(tomorrow, 'day')).toBe(true);
      } else {
        // If current time is before 10:00, first occurrence should be today
        expect(result[0].isSame(today, 'day')).toBe(true);
      }

      // Check that dates are in ascending order
      for (let i = 1; i < result.length; i++) {
        expect(result[i].isAfter(result[i - 1])).toBe(true);
      }
    });

    it('should respect maxCount parameter', () => {
      const task: Task = {
        id: 'test-15',
        title: 'Daily Task',
        icon: '✅',
        reminderTime: { hour: 10, minute: 0 },
        recurrence: { interval: 1, unit: RecurrenceUnit.DAY },
        completed: false,
        createdAt: today.subtract(7, 'days').toISOString(),
        updatedAt: today.toISOString(),
      };

      const result = getFutureNotificationDates(task, 2, 3);
      expect(result.length).toBeLessThanOrEqual(3);
    });

    it('should filter out past occurrence times', () => {
      const task: Task = {
        id: 'test-16',
        title: 'Daily Task',
        icon: '✅',
        reminderTime: { hour: 6, minute: 0 }, // Early morning time
        recurrence: { interval: 1, unit: RecurrenceUnit.DAY },
        completed: false,
        createdAt: today.subtract(7, 'days').toISOString(),
        updatedAt: today.toISOString(),
      };

      // If current time is after 6:00 AM, today's occurrence should be filtered out
      const result = getFutureNotificationDates(task, 1, 5);

      const currentHour = today.hour();
      const currentMinute = today.minute();
      const reminderTimeInMinutes = 6 * 60; // 6:00
      const currentTimeInMinutes = currentHour * 60 + currentMinute;

      if (currentTimeInMinutes >= reminderTimeInMinutes) {
        // Today's occurrence time has passed, should start from tomorrow
        expect(result[0].isSame(tomorrow, 'day')).toBe(true);
      } else {
        // Today's occurrence time is still in the future
        expect(result[0].isSame(today, 'day')).toBe(true);
      }
    });
  });

  describe('getFutureNotificationTimes', () => {
    it('should convert dates to notification times with correct hour and minute', () => {
      const task: Task = {
        id: 'test-17',
        title: 'Daily Task',
        icon: '✅',
        reminderTime: { hour: 14, minute: 30 },
        recurrence: { interval: 1, unit: RecurrenceUnit.DAY },
        completed: false,
        createdAt: today.subtract(7, 'days').toISOString(),
        updatedAt: today.toISOString(),
      };

      const dates = getFutureNotificationDates(task, 1, 3);
      const times = getFutureNotificationTimes(task, 1, 3);

      expect(times.length).toBe(dates.length);

      times.forEach((time) => {
        expect(time.hour()).toBe(14);
        expect(time.minute()).toBe(30);
        expect(time.second()).toBe(0);
        expect(time.millisecond()).toBe(0);
      });
    });

    it('should return empty array when no future dates available', () => {
      const task: Task = {
        id: 'test-18',
        title: 'Past Task',
        icon: '✅',
        reminderTime: { hour: 10, minute: 0 },
        completed: false,
        createdAt: yesterday.toISOString(),
        updatedAt: today.toISOString(),
      };

      const result = getFutureNotificationTimes(task, 1, 5);
      expect(result).toEqual([]);
    });
  });

  describe('getNextNotificationTime', () => {
    it('should return null for task with no next occurrence', () => {
      const task: Task = {
        id: 'test-19',
        title: 'Past Task',
        icon: '✅',
        reminderTime: { hour: 10, minute: 0 },
        completed: false,
        createdAt: yesterday.toISOString(),
        updatedAt: today.toISOString(),
      };

      const result = getNextNotificationTime(task);
      expect(result).toBeNull();
    });

    it('should return correct notification time for task with next occurrence', () => {
      const task: Task = {
        id: 'test-20',
        title: 'Daily Task',
        icon: '✅',
        reminderTime: { hour: 15, minute: 45 },
        recurrence: { interval: 1, unit: RecurrenceUnit.DAY },
        completed: false,
        createdAt: today.subtract(7, 'days').toISOString(),
        updatedAt: today.toISOString(),
      };

      const result = getNextNotificationTime(task);
      expect(result).not.toBeNull();
      expect(result!.hour()).toBe(15);
      expect(result!.minute()).toBe(45);
      expect(result!.second()).toBe(0);
      expect(result!.millisecond()).toBe(0);
    });

    it('should handle non-recurring task with future creation date', () => {
      const futureDate = today.add(3, 'days');
      const task: Task = {
        id: 'test-21',
        title: 'Future Task',
        icon: '✅',
        reminderTime: { hour: 9, minute: 0 },
        completed: false,
        createdAt: futureDate.toISOString(),
        updatedAt: today.toISOString(),
      };

      const result = getNextNotificationTime(task);
      expect(result).not.toBeNull();
      expect(result!.isSame(futureDate.hour(9).minute(0).second(0).millisecond(0))).toBe(true);
    });
  });
});
