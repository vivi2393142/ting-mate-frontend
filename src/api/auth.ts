import useUserStore from '@/store/useUserStore';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

import { axiosClient } from '@/api/axiosClient';
import API_PATH from '@/api/path';
import { Role } from '@/types/user';

export const LoginResponseSchema = z.object({
  access_token: z.string(),
  anonymous_id: z.string(),
});

export const login = async (params: { email: string; password: string }) => {
  const res = await axiosClient.post(API_PATH.LOGIN, params);
  return LoginResponseSchema.parse(res.data);
};

export const useLogin = () => {
  const updateToken = useUserStore((s) => s.updateToken);
  const updateAnonymousId = useUserStore((s) => s.updateAnonymousId);

  return useMutation({
    mutationFn: login,
    onSuccess: async (data: typeof LoginResponseSchema._type) => {
      const { access_token, anonymous_id } = data;
      await updateToken(access_token);
      await updateAnonymousId(anonymous_id);
    },
  });
};

export const useLogout = () => {
  const clearToken = useUserStore((s) => s.clearToken);
  const clearAnonymousId = useUserStore((s) => s.clearAnonymousId);
  const initAnonymousId = useUserStore((s) => s.initAnonymousId);
  const clearUser = useUserStore((s) => s.clearUser);

  return async () => {
    await clearToken();
    await clearAnonymousId();
    await initAnonymousId(); // Init anonymous id again to avoid anonymous id conflict
    clearUser();
    // TODO: Clear user data & tasks
  };
};

export interface RegisterRequest {
  id: string;
  email: string;
  role: Role;
  password: string;
}

export const RegisterResponseSchema = z.object({
  message: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    role: z.enum([Role.CARERECEIVER, Role.CAREGIVER]),
  }),
  access_token: z.string(),
  anonymous_id: z.string(),
});

export const register = async (params: RegisterRequest) => {
  const res = await axiosClient.post(API_PATH.REGISTER, params);
  return RegisterResponseSchema.parse(res.data);
};

export const useRegister = () => {
  const updateLoginUser = useUserStore((s) => s.updateLoginUser);
  const updateToken = useUserStore((s) => s.updateToken);
  const updateAnonymousId = useUserStore((s) => s.updateAnonymousId);

  return useMutation({
    mutationFn: register,
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
  });
};
