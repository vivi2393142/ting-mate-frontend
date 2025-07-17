import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { z } from 'zod';

import { axiosClientWithAuth } from '@/api/axiosClient';
import API_PATH from '@/api/path';
import type {
  SharedNote,
  SharedNoteCreate,
  SharedNoteListResponse,
  SharedNoteUpdate,
} from '@/types/connect';

/* =============================================================================
 * API Schema Definitions
 * ============================================================================= */
const APIUserInfoSchema = z.object({
  id: z.string(),
  email: z.string().email().nullable().optional(),
  name: z.string().nullable().optional(),
});

const APISharedNoteSchema = z.object({
  id: z.string(),
  carereceiver_id: z.string(),
  title: z.string(),
  content: z.string().nullable().optional(),
  created_by: APIUserInfoSchema,
  updated_by: APIUserInfoSchema,
  created_at: z.string(),
  updated_at: z.string(),
});

const APISharedNoteListResponseSchema = z.array(APISharedNoteSchema);

/* =============================================================================
 * Data Transform Functions
 * ============================================================================= */
const transformUserInfoFromAPI = (apiUser: z.infer<typeof APIUserInfoSchema>) => ({
  id: apiUser.id,
  email: apiUser.email ?? undefined,
  name: apiUser.name ?? '',
});

const transformSharedNoteFromAPI = (apiNote: z.infer<typeof APISharedNoteSchema>): SharedNote => ({
  id: apiNote.id,
  carereceiverId: apiNote.carereceiver_id,
  title: apiNote.title,
  content: apiNote.content,
  createdBy: transformUserInfoFromAPI(apiNote.created_by),
  updatedBy: transformUserInfoFromAPI(apiNote.updated_by),
  createdAt: apiNote.created_at,
  updatedAt: apiNote.updated_at,
});

const transformSharedNoteListFromAPI = (
  apiRes: z.infer<typeof APISharedNoteListResponseSchema>,
): SharedNoteListResponse => ({
  notes: apiRes.map(transformSharedNoteFromAPI),
});

/* =============================================================================
 * API Hooks
 * ============================================================================= */
export const useGetSharedNotes = (
  options?: Omit<UseQueryOptions<SharedNoteListResponse>, 'queryKey' | 'queryFn'>,
) =>
  useQuery<SharedNoteListResponse>({
    queryKey: ['sharedNotes'],
    queryFn: async () => {
      const res = await axiosClientWithAuth.get(API_PATH.SHARED_NOTES);
      const parsed = APISharedNoteListResponseSchema.parse(res.data);
      return transformSharedNoteListFromAPI(parsed);
    },
    ...options,
  });

export const useGetSharedNote = (
  noteId: string,
  options?: Omit<UseQueryOptions<SharedNote>, 'queryKey' | 'queryFn'>,
) =>
  useQuery<SharedNote>({
    queryKey: ['sharedNote', noteId],
    queryFn: async () => {
      const res = await axiosClientWithAuth.get(`${API_PATH.SHARED_NOTES}/${noteId}`);
      const parsed = APISharedNoteSchema.parse(res.data);
      return transformSharedNoteFromAPI(parsed);
    },
    enabled: !!noteId,
    ...options,
  });

export const useCreateSharedNote = (
  options?: UseMutationOptions<void, Error, SharedNoteCreate>,
) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, SharedNoteCreate>({
    mutationFn: async (data: SharedNoteCreate): Promise<void> => {
      await axiosClientWithAuth.post(API_PATH.SHARED_NOTES, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sharedNotes'] });
    },
    ...options,
  });
};

export const useUpdateSharedNote = (
  options?: UseMutationOptions<void, Error, { noteId: string; data: SharedNoteUpdate }>,
) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { noteId: string; data: SharedNoteUpdate }>({
    mutationFn: async ({
      noteId,
      data,
    }: {
      noteId: string;
      data: SharedNoteUpdate;
    }): Promise<void> => {
      await axiosClientWithAuth.put(`${API_PATH.SHARED_NOTES}/${noteId}`, data);
    },
    onSuccess: (_, { noteId }) => {
      queryClient.invalidateQueries({ queryKey: ['sharedNotes'] });
      queryClient.invalidateQueries({ queryKey: ['sharedNote', noteId] });
    },
    ...options,
  });
};

export const useDeleteSharedNote = (options?: UseMutationOptions<void, Error, string>) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (noteId: string): Promise<void> => {
      await axiosClientWithAuth.delete(`${API_PATH.SHARED_NOTES}/${noteId}`);
    },
    onSuccess: (_, noteId) => {
      queryClient.invalidateQueries({ queryKey: ['sharedNotes'] });
      queryClient.invalidateQueries({ queryKey: ['sharedNote', noteId] });
    },
    ...options,
  });
};
