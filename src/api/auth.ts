import useUserStore from '@/store/useUserStore';
import { useMutation, type UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { axiosClient } from '@/api/axiosClient';
import API_PATH from '@/api/path';
import { Role } from '@/types/user';

interface LoginRequest {
  email: string;
  password: string;
}

const LoginResponseSchema = z.object({
  access_token: z.string(),
  anonymous_id: z.string(),
});

type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const useLogin = (
  options?: Omit<UseMutationOptions<LoginResponse, Error, LoginRequest>, 'mutationFn'>,
) => {
  const queryClient = useQueryClient();

  const updateToken = useUserStore((s) => s.updateToken);
  const updateAnonymousId = useUserStore((s) => s.updateAnonymousId);

  return useMutation({
    mutationFn: async (params: LoginRequest) => {
      const res = await axiosClient.post(API_PATH.LOGIN, params);
      return LoginResponseSchema.parse(res.data);
    },
    onSuccess: async (data: typeof LoginResponseSchema._type) => {
      const { access_token, anonymous_id } = data;
      await updateToken(access_token);
      await updateAnonymousId(anonymous_id);

      // Refetch all active queries
      queryClient.invalidateQueries();
    },
    ...options,
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  const clearToken = useUserStore((s) => s.clearToken);
  const clearAnonymousId = useUserStore((s) => s.clearAnonymousId);
  const initAnonymousId = useUserStore((s) => s.initAnonymousId);
  const clearUser = useUserStore((s) => s.clearUser);

  return async () => {
    await clearToken();
    await clearAnonymousId();
    clearUser();

    await initAnonymousId(); // Init anonymous id again to avoid anonymous id conflict
    // TODO: Clear user data & tasks

    // Refetch all active queries
    queryClient.invalidateQueries();
  };
};

interface RegisterRequest {
  id: string;
  email: string;
  role: Role;
  password: string;
}

const RegisterResponseSchema = z.object({
  message: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    role: z.enum([Role.CARERECEIVER, Role.CAREGIVER]),
  }),
  access_token: z.string(),
  anonymous_id: z.string(),
});

type RegisterResponse = z.infer<typeof RegisterResponseSchema>;

export const useRegister = (
  options?: Omit<UseMutationOptions<RegisterResponse, Error, RegisterRequest>, 'mutationFn'>,
) => {
  const updateLoginUser = useUserStore((s) => s.updateLoginUser);
  const updateToken = useUserStore((s) => s.updateToken);
  const updateAnonymousId = useUserStore((s) => s.updateAnonymousId);

  return useMutation({
    mutationFn: async (params: RegisterRequest) => {
      const res = await axiosClient.post(API_PATH.REGISTER, params);
      return RegisterResponseSchema.parse(res.data);
    },
    onSuccess: async ({
      access_token,
      anonymous_id,
      user,
    }: typeof RegisterResponseSchema._type) => {
      await updateToken(access_token);
      await updateAnonymousId(anonymous_id);
      updateLoginUser({
        email: user.email,
        role: user.role,
      });
    },
    ...options,
  });
};
