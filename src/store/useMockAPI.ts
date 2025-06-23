import { create } from 'zustand';

import type { RecurrenceRule, ReminderTime, TaskTemplate } from '@/types/task';
import { RecurrenceFrequency } from '@/types/task';
import type { User } from '@/types/user';
import { Role, UserDisplayMode, UserTextSize } from '@/types/user';

// TODO: remove the whole file after the API is implemented
interface NewTask {
  title: string;
  icon: string;
  recurrence: RecurrenceRule;
  reminders: ReminderTime[];
}

interface MockAPIState {
  // Mock data storage
  currentUser: User | null;
  authToken: string | null;
  tasks: TaskTemplate[];
  linkedUsers: User[];

  // Auth API methods
  login: () => { token: string; user: User };
  logout: () => void;

  // User API methods
  getUser: () => User;
  updateUser: (settings: Partial<User>) => void;
  linkAccount: (email: string) => void;
  getLinkedAccounts: () => User[];

  // Task API methods
  getTasks: () => TaskTemplate[];
  createTask: (task: NewTask) => TaskTemplate;
  updateTask: (taskId: string, updates: Partial<NewTask>) => TaskTemplate;
  completeTaskReminder: (taskId: string, reminderId: string, completed: boolean) => void;
  deleteTask: (taskId: string) => void;

  // Utility methods
  clearMockData: () => void;
  initializeMockData: () => void;
}

const useMockAPI = create<MockAPIState>((set, get) => ({
  // Initial state
  currentUser: mockUser,
  authToken: 'mock-jwt-token-' + Date.now(),
  tasks: mockTasks,
  linkedUsers: mockLinkedUsers,

  // Auth API methods
  login: () => {
    const user = mockUser;
    const token = 'mock-jwt-token-' + Date.now();

    set({
      currentUser: user,
      authToken: token,
      tasks: mockTasks,
      linkedUsers: mockLinkedUsers,
    });

    return { token, user };
  },

  logout: () => {
    set({
      currentUser: null,
      authToken: null,
    });
  },

  // User API methods
  getUser: () => {
    const { currentUser } = get();
    return currentUser || mockUser;
  },

  updateUser: ({ email, settings, ...rest }: Partial<User>) => {
    const { currentUser } = get();
    if (!currentUser || email != currentUser.email) return;
    set({
      currentUser: {
        ...currentUser,
        ...rest,
        settings: {
          ...currentUser.settings,
          ...settings,
        },
      },
    });
  },

  linkAccount: (email: string) => {
    const newLinkedUser: User = {
      email: email,
      name: 'New Linked User',
      role: Role.CAREGIVER,
      settings: {
        textSize: UserTextSize.STANDARD,
        displayMode: UserDisplayMode.FULL,
        reminder: {
          taskTimeReminder: true,
          overdueReminder: {
            enabled: true,
            delayMinutes: 15,
            repeat: true,
          },
          safeZoneReminder: true,
        },
      },
      linked: [],
    };

    set({
      linkedUsers: [...get().linkedUsers, newLinkedUser],
    });
  },

  getLinkedAccounts: () => {
    const { linkedUsers } = get();
    return linkedUsers;
  },

  // Task API methods
  getTasks: () => {
    const { tasks } = get();
    return tasks;
  },

  createTask: (task: NewTask) => {
    const newTask: TaskTemplate = {
      id: 'task-' + Date.now(),
      title: task.title,
      icon: task.icon,
      recurrence: task.recurrence,
      reminders: task.reminders.map((reminderTime) => ({
        id: 'reminder-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        reminderTime,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set({
      tasks: [...get().tasks, newTask],
    });

    return newTask;
  },

  updateTask: (taskId: string, updates: Partial<NewTask>) => {
    const { tasks } = get();
    const taskIndex = tasks.findIndex((task) => task.id === taskId);

    const updatedTask: TaskTemplate = {
      ...tasks[taskIndex],
      ...(updates.title && { title: updates.title }),
      ...(updates.icon && { icon: updates.icon }),
      ...(updates.recurrence && { recurrence: updates.recurrence }),
      ...(updates.reminders && {
        reminders: updates.reminders.map((reminderTime) => ({
          id: 'reminder-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
          reminderTime,
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
      }),
      updatedAt: new Date().toISOString(),
    };

    const updatedTasks = [...tasks];
    updatedTasks[taskIndex] = updatedTask;

    set({ tasks: updatedTasks });

    return updatedTask;
  },

  completeTaskReminder: (taskId: string, reminderId: string, completed: boolean) => {
    const { tasks } = get();
    const taskIndex = tasks.findIndex((task) => task.id === taskId);

    if (taskIndex === -1) {
      return;
    }

    const task = tasks[taskIndex];
    const reminderIndex = task.reminders.findIndex((reminder) => reminder.id === reminderId);

    if (reminderIndex === -1) {
      return;
    }

    const updatedTasks = [...tasks];
    const updatedReminders = [...updatedTasks[taskIndex].reminders];

    updatedReminders[reminderIndex] = {
      ...updatedReminders[reminderIndex],
      completed,
      completedAt: completed ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    };

    updatedTasks[taskIndex] = {
      ...updatedTasks[taskIndex],
      reminders: updatedReminders,
      updatedAt: new Date().toISOString(),
    };

    set({ tasks: updatedTasks });
  },

  deleteTask: (taskId: string) => {
    const { tasks } = get();
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    set({ tasks: updatedTasks });
  },

  // Utility methods
  clearMockData: () => {
    set({
      currentUser: null,
      authToken: null,
      tasks: [],
      linkedUsers: [],
    });
  },

  initializeMockData: () => {
    const user = mockUser;
    set({
      currentUser: user,
      authToken: 'mock-jwt-token-' + Date.now(),
      tasks: mockTasks,
      linkedUsers: mockLinkedUsers,
    });
  },
}));

export default useMockAPI;

// Convenience hooks for specific API calls
export const useMockAuth = () => {
  const { login, logout, currentUser, authToken } = useMockAPI();
  return { login, logout, currentUser, authToken };
};

export const useMockUser = () => {
  const { getUser, updateUser } = useMockAPI();
  return { getUser, updateUser };
};

export const useMockLinkedAccounts = () => {
  const { linkAccount, getLinkedAccounts } = useMockAPI();
  return { linkAccount, getLinkedAccounts };
};

export const useMockTasks = () => {
  const { getTasks, createTask, updateTask, completeTaskReminder, deleteTask } = useMockAPI();
  return { getTasks, createTask, updateTask, completeTaskReminder, deleteTask };
};

// Mock data generators
const mockUser = {
  email: 'test@example.com',
  name: 'Test User',
  role: Role.CARERECEIVER,
  settings: {
    textSize: UserTextSize.STANDARD,
    displayMode: UserDisplayMode.FULL,
    reminder: {
      taskTimeReminder: true,
      overdueReminder: {
        enabled: true,
        delayMinutes: 15,
        repeat: true,
      },
      safeZoneReminder: true,
    },
  },
  linked: [],
};

const mockTasks: TaskTemplate[] = [
  {
    id: 'task-1',
    title: 'Take medication',
    icon: '💊',
    recurrence: {
      frequency: RecurrenceFrequency.DAILY,
    },
    reminders: [
      {
        id: 'reminder-1-1',
        reminderTime: { hour: 8, minute: 0 },
        completed: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'reminder-1-2',
        reminderTime: { hour: 20, minute: 0 },
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Measure blood pressure & blood sugar',
    icon: '🩺',
    recurrence: {
      frequency: RecurrenceFrequency.DAILY,
    },
    reminders: [
      {
        id: 'reminder-2-1',
        reminderTime: { hour: 9, minute: 0 },
        completed: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      },
      {
        id: 'reminder-2-2',
        reminderTime: { hour: 21, minute: 0 },
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'Walk',
    icon: '🚶',
    recurrence: {
      frequency: RecurrenceFrequency.WEEKLY,
      daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
    },
    reminders: [
      {
        id: 'reminder-3-1',
        reminderTime: { hour: 16, minute: 30 },
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    title: 'See doctor',
    icon: '👨‍⚕️',
    recurrence: {
      frequency: RecurrenceFrequency.MONTHLY,
      dayOfMonth: 15,
    },
    reminders: [
      {
        id: 'reminder-4-1',
        reminderTime: { hour: 10, minute: 0 },
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockLinkedUsers: User[] = [
  {
    email: 'caregiver@example.com',
    name: 'Caregiver',
    role: Role.CAREGIVER,
    settings: {
      textSize: UserTextSize.STANDARD,
      displayMode: UserDisplayMode.FULL,
      reminder: {
        taskTimeReminder: true,
        overdueReminder: {
          enabled: true,
          delayMinutes: 15,
          repeat: true,
        },
        safeZoneReminder: true,
      },
    },
    linked: ['user-1'],
  },
  {
    email: 'family@example.com',
    name: 'Family',
    role: Role.CAREGIVER,
    settings: {
      textSize: UserTextSize.STANDARD,
      displayMode: UserDisplayMode.FULL,
      reminder: {
        taskTimeReminder: true,
        overdueReminder: {
          enabled: true,
          delayMinutes: 15,
          repeat: true,
        },
        safeZoneReminder: true,
      },
    },
    linked: ['user-1'],
  },
];
