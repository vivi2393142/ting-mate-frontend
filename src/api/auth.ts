import useUserStore from '@/store/useUserStore';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

import { axiosClient } from '@/api/axiosClient';
import API_PATH from '@/api/path';

export const AuthResponseSchema = z.object({
  access_token: z.string(),
  anonymous_id: z.string(),
});

export const login = async (params: { email: string; password: string }) => {
  const res = await axiosClient.post(API_PATH.LOGIN, params);
  return AuthResponseSchema.parse(res.data);
};

export const useLogin = () => {
  const updateToken = useUserStore((s) => s.updateToken);
  const updateAnonymousId = useUserStore((s) => s.updateAnonymousId);

  return useMutation({
    mutationFn: login,
    onSuccess: async (data: typeof AuthResponseSchema._type) => {
      const { access_token, anonymous_id } = data;
      await updateToken(access_token);
      await updateAnonymousId(anonymous_id);
    },
  });
};

export const logout = async () => {
  await useUserStore.getState().clearToken();
};
