import { z } from 'zod';

import { axiosClient } from '@/api/axiosClient';
import API_PATH from '@/api/path';
import useAuthStore from '@/store/useAuthStore';
import useUserStore from '@/store/useUserStore';
import { Role } from '@/types/user';
import { useMutation, type UseMutationOptions, useQueryClient } from '@tanstack/react-query';

/* =============================================================================
 * Type Definitions
 * ============================================================================= */

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  id: string;
  email: string;
  role: Role;
  password: string;
}

/* =============================================================================
 * API Schema Definitions
 * ============================================================================= */

const LoginResponseSchema = z.object({
  access_token: z.string(),
  anonymous_id: z.string(),
});

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

/* =============================================================================
 * Type Inferences
 * ============================================================================= */

type LoginResponse = z.infer<typeof LoginResponseSchema>;
type RegisterResponse = z.infer<typeof RegisterResponseSchema>;

/* =============================================================================
 * API Hooks
 * ============================================================================= */

export const useLogin = (
  options?: Omit<UseMutationOptions<LoginResponse, Error, LoginRequest>, 'mutationFn'>,
) => {
  const queryClient = useQueryClient();

  const updateToken = useAuthStore((s) => s.updateToken);
  const updateAnonymousId = useAuthStore((s) => s.updateAnonymousId);

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

  const clearToken = useAuthStore((s) => s.clearToken);
  const clearAnonymousId = useAuthStore((s) => s.clearAnonymousId);
  const initAnonymousId = useAuthStore((s) => s.initAnonymousId);
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

export const useRegister = (
  options?: Omit<UseMutationOptions<RegisterResponse, Error, RegisterRequest>, 'mutationFn'>,
) => {
  const updateLoginUser = useUserStore((s) => s.updateLoginUser);
  const updateToken = useAuthStore((s) => s.updateToken);
  const updateAnonymousId = useAuthStore((s) => s.updateAnonymousId);

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
