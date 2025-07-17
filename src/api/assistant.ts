import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { Platform } from 'react-native';
import { z } from 'zod';

import { axiosClientWithAuth } from '@/api/axiosClient';
import API_PATH from '@/api/path';
import type {
  AssistantStatus,
  AssistantVoiceCommandInput,
  AssistantVoiceCommandOutput,
} from '@/types/assistant';

/* =============================================================================
 * API Schema Definitions (zod)
 * ============================================================================= */
const APIAssistantStatusSchema = z.enum(['CONFIRMED', 'INCOMPLETE', 'FAILED']);

const APIAssistantVoiceCommandResponseSchema = z.object({
  conversation_id: z.string(),
  status: APIAssistantStatusSchema,
  further_question: z.string().optional().nullable(),
  user_input: z.string().optional().nullable(),
});

const APIAssistantExecutePendingTaskResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  result: z.unknown().optional(),
});

/* =============================================================================
 * Types
 * ============================================================================= */

interface AssistantExecutePendingTaskRequest {
  conversationId: string;
}

type AssistantExecutePendingTaskResponse = z.infer<
  typeof APIAssistantExecutePendingTaskResponseSchema
>;

/* =============================================================================
 * Data Transform Functions
 * ============================================================================= */
const transformVoiceCommandResponse = (
  apiRes: z.infer<typeof APIAssistantVoiceCommandResponseSchema>,
): AssistantVoiceCommandOutput => ({
  conversationId: apiRes.conversation_id,
  status: apiRes.status as AssistantStatus,
  furtherQuestion: apiRes.further_question || undefined,
  userInput: apiRes.user_input || '',
});

/* =============================================================================
 * API Hooks
 * ============================================================================= */
export const useAssistantVoiceCommand = (
  options?: UseMutationOptions<AssistantVoiceCommandOutput, Error, AssistantVoiceCommandInput>,
) =>
  useMutation<AssistantVoiceCommandOutput, Error, AssistantVoiceCommandInput>({
    mutationFn: async ({ audioUri, conversationId, encoding }) => {
      const formData = new FormData();
      formData.append('audio_file', {
        uri: Platform.OS === 'android' ? audioUri : audioUri.replace('file://', ''),
        name: 'test.mp4',
        type: 'audio/mp4',
      } as unknown as Blob);

      if (conversationId) formData.append('conversation_id', conversationId);
      if (encoding) formData.append('encoding', encoding);

      const res = await axiosClientWithAuth.post(API_PATH.ASSISTANT_VOICE_COMMAND, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const parsed = APIAssistantVoiceCommandResponseSchema.parse(res.data.data);
      return transformVoiceCommandResponse(parsed);
    },
    ...options,
  });

export const useAssistantExecutePendingTask = (
  options?: UseMutationOptions<
    AssistantExecutePendingTaskResponse,
    Error,
    AssistantExecutePendingTaskRequest
  >,
) => {
  const queryClient = useQueryClient();
  return useMutation<
    AssistantExecutePendingTaskResponse,
    Error,
    AssistantExecutePendingTaskRequest
  >({
    mutationFn: async ({ conversationId }) => {
      const res = await axiosClientWithAuth.post(
        API_PATH.ASSISTANT_EXECUTE_PENDING_TASK,
        conversationId,
      );
      const parsed = APIAssistantExecutePendingTaskResponseSchema.parse(res.data);
      return parsed;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task'] });
    },
    ...options,
  });
};
