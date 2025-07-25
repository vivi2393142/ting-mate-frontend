import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { z } from 'zod';

import { axiosClientWithAuth } from '@/api/axiosClient';
import API_PATH from '@/api/path';
import useUserStore from '@/store/useUserStore';
import { ContactMethod } from '@/types/connect';
import type { ReminderSettings, User, UserSettings } from '@/types/user';
import { Role, UserDisplayMode, UserTextSize } from '@/types/user';

/* =============================================================================
 * API Schema Definitions
 * ============================================================================= */

export const UserTextSizeSchema = z.nativeEnum(UserTextSize);
export const UserDisplayModeSchema = z.nativeEnum(UserDisplayMode);

const UserLinkSchema = z.object({
  email: z.string(),
  name: z.string(),
  role: z.nativeEnum(Role),
});

const ReminderSettingsSchema = z.object({
  task_reminder: z.boolean(),
  overdue_reminder: z.object({
    enabled: z.boolean(),
    delay_minutes: z.number(),
    repeat: z.boolean(),
  }),
  safe_zone_exit_reminder: z.boolean(),
  task_completion_notification: z.boolean(),
  task_change_notification: z.boolean(),
});

const ContactMethodSchema = z.nativeEnum(ContactMethod);

const EmergencyContactSchema = z.object({
  id: z.string(),
  email: z.string().optional().nullable(),
  name: z.string(),
  phone: z.string(),
  methods: z.array(ContactMethodSchema),
});

const UserSettingsSchema = z.object({
  name: z.string(),
  linked: z.array(UserLinkSchema),
  textSize: UserTextSizeSchema,
  displayMode: UserDisplayModeSchema,
  reminder: z.any(),
  emergency_contacts: z.array(EmergencyContactSchema).optional().nullable(),
  allow_share_location: z.boolean().optional().nullable(),
  // language: z.string().optional(),
});

export const UserSchema = z.object({
  email: z.string().nullable(),
  role: z.nativeEnum(Role),
  settings: UserSettingsSchema,
});

const RemoveLinkResponseSchema = z.object({
  message: z.string(),
});

/* =============================================================================
 * Type Inferences
 * ============================================================================= */

type APIUserSettings = z.infer<typeof UserSettingsSchema>;

type APIReminderSettings = z.infer<typeof ReminderSettingsSchema>;

type APIUser = z.infer<typeof UserSchema>;

export type UserSettingsUpdateRequest = Partial<UserSettings>;

type RemoveLinkResponse = z.infer<typeof RemoveLinkResponseSchema>;

/* =============================================================================
 * Data Transform Functions
 * ============================================================================= */

const transformReminderSettingsFromAPI = (apiReminderSettings: unknown): ReminderSettings => {
  const result = ReminderSettingsSchema.safeParse(apiReminderSettings);
  if (result.success) {
    return {
      taskReminder: result.data.task_reminder,
      overdueReminder: {
        enabled: result.data.overdue_reminder.enabled,
        delayMinutes: result.data.overdue_reminder.delay_minutes,
        repeat: result.data.overdue_reminder.repeat,
      },
      safeZoneExitReminder: result.data.safe_zone_exit_reminder,
      taskCompletionNotification: result.data.task_completion_notification,
      taskChangeNotification: result.data.task_change_notification,
    };
  } else {
    return {
      taskReminder: false,
      overdueReminder: {
        enabled: false,
        delayMinutes: 30,
        repeat: false,
      },
      safeZoneExitReminder: false,
      taskCompletionNotification: false,
      taskChangeNotification: false,
    };
  }
};

// Transform API user settings (snake_case, nullable) to FE UserSettings (camelCase, strict)
const transformUserSettingsFromAPI = (apiUserSettings: APIUserSettings): UserSettings => {
  const userSettings: UserSettings = {
    name: apiUserSettings.name,
    linked: apiUserSettings.linked,
    textSize: apiUserSettings.textSize,
    displayMode: apiUserSettings.displayMode,
    reminder: transformReminderSettingsFromAPI(apiUserSettings.reminder),
    emergencyContacts: apiUserSettings.emergency_contacts || [],
    allowShareLocation: apiUserSettings.allow_share_location || false,
    // language: apiUserSettings.language, // TODO: implement if needed
  };
  return userSettings;
};

// Transform API user to FE User
export const transformUserFromAPI = (apiUser: APIUser): User => {
  const user: User = {
    email: apiUser.email || undefined,
    role: apiUser.role,
    settings: transformUserSettingsFromAPI(apiUser.settings),
  };
  return user;
};

// Merged linked accounts with emergency contacts
const userWithMergedContacts = (user: User): User => {
  const newContacts = user.settings.linked.map((link) => {
    const targetContact = user.settings.emergencyContacts.find((c) => c.id === link.email);
    return {
      id: link.email,
      name: link.name,
      phone: targetContact?.phone || '',
      methods: targetContact?.methods || [],
    };
  });
  return {
    ...user,
    settings: {
      ...user.settings,
      emergencyContacts: newContacts,
    },
  };
};

// Transform FE UserSettings (camelCase) to API user settings (snake_case)
const transformReminderSettingsToAPI = (
  reminderSettings: ReminderSettings | undefined,
): APIReminderSettings =>
  reminderSettings
    ? {
        task_reminder: reminderSettings.taskReminder,
        overdue_reminder: {
          enabled: reminderSettings.overdueReminder.enabled,
          delay_minutes: reminderSettings.overdueReminder.delayMinutes,
          repeat: reminderSettings.overdueReminder.repeat,
        },
        safe_zone_exit_reminder: reminderSettings.safeZoneExitReminder,
        task_completion_notification: reminderSettings.taskCompletionNotification,
        task_change_notification: reminderSettings.taskChangeNotification,
      }
    : {
        task_reminder: false,
        overdue_reminder: {
          enabled: false,
          delay_minutes: 30,
          repeat: false,
        },
        safe_zone_exit_reminder: false,
        task_completion_notification: false,
        task_change_notification: false,
      };

const transformUserSettingsToAPI = (
  userSettings: UserSettingsUpdateRequest,
): Partial<APIUserSettings> => {
  return {
    name: userSettings.name,
    linked: userSettings.linked,
    textSize: userSettings.textSize,
    displayMode: userSettings.displayMode,
    reminder: transformReminderSettingsToAPI(userSettings.reminder),
    emergency_contacts: userSettings.emergencyContacts,
    allow_share_location: userSettings.allowShareLocation,
    // language: userSettings.language, // TODO: implement if needed
  };
};

/* =============================================================================
 * API Hooks
 * ============================================================================= */

export const useCurrentUser = (options?: Omit<UseQueryOptions<User>, 'queryKey' | 'queryFn'>) =>
  useQuery<User>({
    queryKey: ['currentUser'],
    queryFn: async (): Promise<User> => {
      const res = await axiosClientWithAuth.get(API_PATH.USER_ME);
      const parsed = UserSchema.parse(res.data);
      const transformed = transformUserFromAPI(parsed);
      return userWithMergedContacts(transformed);
    },
    ...options,
  });

export const useUpdateUserSettings = (
  options?: Omit<
    UseMutationOptions<{ success: boolean }, Error, UserSettingsUpdateRequest>,
    'mutationFn' | 'onSuccess'
  >,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: UserSettingsUpdateRequest) => {
      const apiSettings = transformUserSettingsToAPI(settings);
      await axiosClientWithAuth.put(API_PATH.USER_SETTINGS, apiSettings);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    ...options,
  });
};

export const useTransitionUserRole = (
  options?: Omit<
    UseMutationOptions<{ message: string }, Error, { target_role: Role }>,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { target_role: Role }) => {
      const res = await axiosClientWithAuth.post(API_PATH.USER_ROLE_TRANSITION, payload);
      return res.data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useRemoveUserLink = (
  options?: Omit<UseMutationOptions<RemoveLinkResponse, Error, string>, 'mutationFn'>,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userEmail: string): Promise<RemoveLinkResponse> => {
      const res = await axiosClientWithAuth.delete(`${API_PATH.USER_LINKS}/${userEmail}`);
      return RemoveLinkResponseSchema.parse(res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    ...options,
  });
};

/* =============================================================================
 * Utility Functions
 * ============================================================================= */

export const syncCurrentUserToStore = (user: User) => {
  const updateUser = useUserStore.getState().setUser;
  updateUser(user);
};
