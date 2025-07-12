import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { axiosClientWithAuth } from '@/api/axiosClient';
import API_PATH from '@/api/path';

/* =============================================================================
 * API Schema Definitions
 * ============================================================================= */

const InvitationResponseSchema = z.object({
  invitation_code: z.string(),
  qr_code_url: z.string().nullable(),
  expires_at: z.string(),
});

const AcceptInvitationResponseSchema = z.object({
  message: z.string(),
  linked_user: z.object({
    email: z.string(),
    name: z.string(),
  }),
});

/* =============================================================================
 * Type Inferences
 * ============================================================================= */

type InvitationResponse = z.infer<typeof InvitationResponseSchema>;
type AcceptInvitationResponse = z.infer<typeof AcceptInvitationResponseSchema>;

/* =============================================================================
 * API Hooks
 * ============================================================================= */

export const useGenerateInvitation = (
  options?: Omit<UseMutationOptions<InvitationResponse, Error, void>, 'mutationFn'>,
) => {
  return useMutation({
    mutationFn: async (): Promise<InvitationResponse> => {
      const res = await axiosClientWithAuth.post(API_PATH.USER_INVITATIONS_GENERATE);
      return InvitationResponseSchema.parse(res.data);
    },
    ...options,
  });
};

export const useAcceptInvitation = (
  options?: Omit<UseMutationOptions<AcceptInvitationResponse, Error, string>, 'mutationFn'>,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invitationCode: string): Promise<AcceptInvitationResponse> => {
      const res = await axiosClientWithAuth.post(
        `${API_PATH.USER_INVITATIONS_ACCEPT}/${invitationCode}/accept`,
      );
      return AcceptInvitationResponseSchema.parse(res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    ...options,
  });
};
