import { axiosClientWithAuth } from '@/api/axiosClient';
import useUserStore from '@/store/useUserStore';
import { type ReminderSettings, Role, UserDisplayMode, UserTextSize } from '@/types/user';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { z } from 'zod';

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

const UserSchema = z.object({
  email: z.string().nullable(),
  role: z.nativeEnum(Role),
  settings: UserSettingsSchema,
});

type UserResponse = z.infer<typeof UserSchema>;

export const useCurrentUser = (
  options?: Omit<UseQueryOptions<UserResponse>, 'queryKey' | 'queryFn'>,
) =>
  useQuery<UserResponse>({
    queryKey: ['currentUser'],
    queryFn: async (): Promise<UserResponse> => {
      const res = await axiosClientWithAuth.get('/user/me');
      return UserSchema.parse(res.data);
    },
    ...options,
  });

const defaultReminderSettings: ReminderSettings = {
  taskTimeReminder: true,
  overdueReminder: { enabled: true, delayMinutes: 30, repeat: false },
  safeZoneReminder: false,
};

const updateUser = useUserStore.getState().setUser;
export const syncCurrentUserToStore = (user: UserResponse) => {
  updateUser({
    ...user,
    email: user.email ?? undefined,
    settings: { ...user.settings, reminder: user.settings.reminder || defaultReminderSettings },
  });
};
