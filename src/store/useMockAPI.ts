import { create } from 'zustand';

import { RecurrenceUnit, type Task, type TaskFormData } from '@/types/task';
import type { User } from '@/types/user';
import { Role, UserDisplayMode, UserTextSize } from '@/types/user';

export enum VoiceCommandStatus {
  CONFIRMED = 'CONFIRMED',
  INCOMPLETE = 'INCOMPLETE',
  UNKNOWN = 'UNKNOWN',
}

interface VoiceCommandRequest {
  conversationId?: string;
  sound: File | Blob | string; // multipart/form-data
  userId: string; // Can be replaced by token
}

interface VoiceCommandResponse {
  conversationId: string;
  status: VoiceCommandStatus;
  message: string;
  transcript?: string;
}

interface MockAPIState {
  // Mock data storage
  currentUser: User | null;
  authToken: string | null;
  tasks: Task[];
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
  getTasks: () => Task[];
  getTask: (id: string) => Task | null;
  createTask: (task: TaskFormData) => Task;
  updateTask: (id: string, newTask: Partial<TaskFormData>) => Task | null;
  completeTask: (id: string, completed: boolean) => void;
  deleteTask: (id: string) => void;

  // Voice command mock API
  mockVoiceCommand: (params: VoiceCommandRequest) => Promise<VoiceCommandResponse>;

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
      email,
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

  getTask: (taskId: string) => {
    const { tasks } = get();
    return tasks.find((task) => task.id === taskId) || null;
  },

  createTask: (task: TaskFormData) => {
    const newTask: Task = {
      id: 'task-' + Date.now(),
      ...task,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set({
      tasks: [...get().tasks, newTask],
    });

    return newTask;
  },

  updateTask: (id: string, newTask: Partial<TaskFormData>) => {
    const { tasks } = get();
    const targetTaskIdx = tasks.findIndex((task) => task.id === id);
    if (targetTaskIdx === -1) return null;

    const targetTask = tasks[targetTaskIdx];
    const updatedTask: Task = {
      ...targetTask,
      ...(newTask.title && { title: newTask.title }),
      ...(newTask.icon && { icon: newTask.icon }),
      ...(newTask.recurrence && { recurrence: newTask.recurrence }),
      ...(newTask.reminderTime && { reminderTime: newTask.reminderTime }),
      updatedAt: new Date().toISOString(),
    };

    const updatedTasks = [...tasks];
    updatedTasks[targetTaskIdx] = updatedTask;
    set({ tasks: updatedTasks });

    return updatedTask;
  },

  completeTask: (id: string, completed: boolean) => {
    const { tasks } = get();
    const taskIndex = tasks.findIndex((task) => task.id === id);

    if (taskIndex === -1) return;
    const task = tasks[taskIndex];
    const updatedTasks = [...tasks];

    updatedTasks[taskIndex] = {
      ...task,
      completed,
      completedAt: completed ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    };

    set({ tasks: updatedTasks });
  },

  deleteTask: (id: string) => {
    const { tasks } = get();
    const updatedTasks = tasks.filter((task) => task.id !== id);
    set({ tasks: updatedTasks });
  },

  // Voice command mock API
  mockVoiceCommand: (() => {
    // Keep track of conversation state in memory
    let selectedIdx: number | null = null;
    let step = 0;
    let lastConvId: string | null = null;
    return async ({ conversationId }) => {
      // If new conversation, pick a random scenario
      let convId = conversationId;
      if (!convId) {
        selectedIdx = Math.floor(Math.random() * mockConversations.length);
        step = 0;
        convId = 'conv-' + Date.now();
        lastConvId = convId;
      } else if (convId !== lastConvId) {
        // If conversationId changed, reset
        selectedIdx = Math.floor(Math.random() * mockConversations.length);
        step = 0;
        lastConvId = convId;
      }
      const scenario = mockConversations[selectedIdx ?? 0];
      const current = scenario[step];
      let status = VoiceCommandStatus.INCOMPLETE;
      const message = current.system;
      const transcript = current.user;
      // If last step, return completed
      if (step === scenario.length - 1) {
        status = VoiceCommandStatus.CONFIRMED;
      }
      // Prepare response
      const response = { conversationId: convId, status, message, transcript };
      // Move to next step for next call
      if (step < scenario.length - 1) step++;
      return new Promise((resolve) => setTimeout(() => resolve(response), 800));
    };
  })(),

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
  const { getTask, getTasks, createTask, updateTask, completeTask, deleteTask } = useMockAPI();
  return { getTask, getTasks, createTask, updateTask, completeTask, deleteTask };
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

const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Take medication',
    icon: '💊',
    recurrence: {
      interval: 1,
      unit: RecurrenceUnit.DAY,
    },
    reminderTime: { hour: 8, minute: 0 },
    completed: true,
    completedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Measure blood pressure & blood sugar',
    icon: '🩺',
    recurrence: {
      interval: 1,
      unit: RecurrenceUnit.DAY,
    },
    reminderTime: { hour: 9, minute: 0 },
    completed: true,
    completedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'Walk',
    icon: '🚶',
    recurrence: {
      interval: 1,
      unit: RecurrenceUnit.WEEK,
      daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
    },
    reminderTime: { hour: 16, minute: 30 },
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    title: 'See doctor',
    icon: '👨‍⚕️',
    recurrence: {
      interval: 1,
      unit: RecurrenceUnit.MONTH,
      daysOfMonth: [15],
    },
    reminderTime: { hour: 10, minute: 0 },
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-5',
    title: 'Drink water',
    icon: '💧',
    recurrence: {
      interval: 1,
      unit: RecurrenceUnit.DAY,
    },
    reminderTime: { hour: 10, minute: 0 },
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-6',
    title: 'Exercise',
    icon: '🏃‍♂️',
    recurrence: {
      interval: 1,
      unit: RecurrenceUnit.DAY,
    },
    reminderTime: { hour: 19, minute: 26 },
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-7',
    title: 'Call Ruby',
    icon: '📞',
    recurrence: undefined,
    reminderTime: { hour: 18, minute: 30 },
    completed: false,
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

const mockConversations = [
  [
    {
      user: 'I have finished drinking water.',
      system: 'You have completed the 10:00 water task. Do you want to confirm completion?',
    },
    { user: 'Yes', system: 'Task completed.' },
  ],
  [
    {
      user: 'I want to change the call Ruby task to once a week.',
      system: 'Which days of the week do you want to schedule this task?',
    },
    {
      user: 'Every Wednesday and Saturday',
      system: 'Do you want to update the call Ruby task to every Wednesday and Saturday?',
    },
    { user: 'Yes', system: 'Task updated.' },
  ],
  [
    {
      user: 'I want to delete the daily exercise task.',
      system: 'Do you want to confirm deleting the daily 19:00 exercise task?',
    },
    { user: 'Yes', system: 'Task deleted.' },
  ],
];
