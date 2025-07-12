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
import { type ReminderSettings, Role, UserDisplayMode, UserTextSize } from '@/types/user';

/* =============================================================================
 * API Schema Definitions
 * ============================================================================= */

export const UserTextSizeSchema = z.nativeEnum(UserTextSize);
export const UserDisplayModeSchema = z.nativeEnum(UserDisplayMode);

const UserLinkSchema = z.object({
  email: z.string(),
  name: z.string(),
});

const ReminderSettingsSchema = z.object({
  taskTimeReminder: z.boolean(),
  overdueReminder: z.object({
    enabled: z.boolean(),
    delayMinutes: z.number(),
    repeat: z.boolean(),
  }),
  safeZoneReminder: z.boolean(),
});

const UserSettingsSchema = z.object({
  name: z.string(),
  linked: z.array(UserLinkSchema),
  textSize: UserTextSizeSchema,
  displayMode: UserDisplayModeSchema,
  reminder: ReminderSettingsSchema.nullable(),
  // language: z.string().optional(),
});

export const UserSchema = z.object({
  email: z.string().nullable(),
  role: z.nativeEnum(Role),
  settings: UserSettingsSchema,
});

/* =============================================================================
 * Type Inferences
 * ============================================================================= */

type UserResponse = z.infer<typeof UserSchema>;

export type UserSettingsUpdateRequest = Partial<z.infer<typeof UserSettingsSchema>>;

/* =============================================================================
 * Default Values
 * ============================================================================= */

const defaultReminderSettings: ReminderSettings = {
  taskTimeReminder: true,
  overdueReminder: { enabled: true, delayMinutes: 30, repeat: false },
  safeZoneReminder: false,
};

/* =============================================================================
 * API Hooks
 * ============================================================================= */

export const useCurrentUser = (
  options?: Omit<UseQueryOptions<UserResponse>, 'queryKey' | 'queryFn'>,
) =>
  useQuery<UserResponse>({
    queryKey: ['currentUser'],
    queryFn: async (): Promise<UserResponse> => {
      const res = await axiosClientWithAuth.get(API_PATH.USER_ME);
      return UserSchema.parse(res.data);
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
      await axiosClientWithAuth.put(API_PATH.USER_SETTINGS, settings);
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

/* =============================================================================
 * Utility Functions
 * ============================================================================= */

const updateUser = useUserStore.getState().setUser;
export const syncCurrentUserToStore = (user: UserResponse) => {
  updateUser({
    ...user,
    email: user.email ?? undefined,
    settings: { ...user.settings, reminder: user.settings.reminder || defaultReminderSettings },
  });
};
