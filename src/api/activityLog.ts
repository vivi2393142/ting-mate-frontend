import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { z } from 'zod';

import { axiosClientWithAuth } from '@/api/axiosClient';
import API_PATH from '@/api/path';
import {
  Action,
  ActivityLog,
  type ActivityLogDetail,
  type ActivityLogFilter,
  type ActivityLogListResponse,
} from '@/types/connect';

/* =============================================================================
 * API Schema Definitions
 * ============================================================================= */

// User info schema for activity logs
const APILogUserInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().optional(),
});

// Detail schemas for each action
const APIUpdateUserSettingsDetailSchema = z.object({
  updated_fields: z.record(z.unknown()),
  description: z.string(),
});

const APIAddUserLinkDetailSchema = z.object({
  linked_user_email: z.string(),
  linked_user_name: z.string(),
  description: z.string(),
});

const APIRemoveUserLinkDetailSchema = z.object({
  linked_user_email: z.string(),
  linked_user_name: z.string(),
  description: z.string(),
});

const APIRoleTransitionDetailSchema = z.object({
  old_role: z.string(),
  new_role: z.string(),
  description: z.string(),
});

const APICreateTaskDetailSchema = z.object({
  task_title: z.string(),
  reminder_time: z.string(),
  description: z.string(),
});

const APIUpdateTaskDetailSchema = z.object({
  task_title: z.string(),
  updated_fields: z.record(z.unknown()),
  description: z.string(),
});

const APIUpdateTaskStatusDetailSchema = z.object({
  task_title: z.string(),
  status: z.enum(['completed', 'uncompleted']),
  description: z.string(),
});

const APIDeleteTaskDetailSchema = z.object({
  task_title: z.string(),
  description: z.string(),
});

const APICreateSharedNoteDetailSchema = z.object({
  note_title: z.string(),
  description: z.string(),
});

const APIUpdateSharedNoteDetailSchema = z.object({
  note_title: z.string(),
  updated_fields: z.record(z.unknown()),
  description: z.string(),
});

const APIDeleteSharedNoteDetailSchema = z.object({
  note_title: z.string(),
  description: z.string(),
});

const APIUpsertSafeZoneDetailSchema = z.object({
  location_name: z.string(),
  radius: z.number(),
  description: z.string(),
});

const APIDeleteSafeZoneDetailSchema = z.object({
  location_name: z.string(),
  description: z.string(),
});

// Activity log response schema with safe detail validation
const APIActivityLogSchema = z.object({
  id: z.string(),
  user: APILogUserInfoSchema,
  target_user: APILogUserInfoSchema.nullable().optional(),
  action: z.nativeEnum(Action),
  detail: z.unknown().optional(), // Will be validated separately
  timestamp: z.string(), // ISO datetime string
});

// Activity log list response schema
const APIActivityLogListResponseSchema = z.object({
  logs: z.array(APIActivityLogSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

/* =============================================================================
 * Type Definitions
 * ============================================================================= */

type APILogUserInfo = z.infer<typeof APILogUserInfoSchema>;
type APIActivityLog = z.infer<typeof APIActivityLogSchema>;
type APIActivityLogListResponse = z.infer<typeof APIActivityLogListResponseSchema>;

interface FullActivityLogFilter extends ActivityLogFilter {
  actions: Action[];
}

/* =============================================================================
 * Data Transform Functions
 * ============================================================================= */

// Transform API user info to frontend LogUserInfo
const transformLogUserInfo = (apiUserInfo: APILogUserInfo) => ({
  id: apiUserInfo.id,
  name: apiUserInfo.name,
  email: apiUserInfo.email,
});

// Safely validate and transform detail
const safeTransformDetail = (action: Action, detail: unknown): ActivityLogDetail | string => {
  try {
    if (action === Action.CREATE_TASK) return APICreateTaskDetailSchema.parse(detail);
    if (action === Action.UPDATE_TASK) return APIUpdateTaskDetailSchema.parse(detail);
    if (action === Action.UPDATE_TASK_STATUS) return APIUpdateTaskStatusDetailSchema.parse(detail);
    if (action === Action.DELETE_TASK) return APIDeleteTaskDetailSchema.parse(detail);
    if (action === Action.CREATE_SHARED_NOTE) return APICreateSharedNoteDetailSchema.parse(detail);
    if (action === Action.UPDATE_SHARED_NOTE) return APIUpdateSharedNoteDetailSchema.parse(detail);
    if (action === Action.DELETE_SHARED_NOTE) return APIDeleteSharedNoteDetailSchema.parse(detail);
    if (action === Action.UPSERT_SAFE_ZONE) return APIUpsertSafeZoneDetailSchema.parse(detail);
    if (action === Action.DELETE_SAFE_ZONE) return APIDeleteSafeZoneDetailSchema.parse(detail);
    if (action === Action.UPDATE_USER_SETTINGS)
      return APIUpdateUserSettingsDetailSchema.parse(detail);
    if (action === Action.ADD_USER_LINK) return APIAddUserLinkDetailSchema.parse(detail);
    if (action === Action.REMOVE_USER_LINK) return APIRemoveUserLinkDetailSchema.parse(detail);
    if (action === Action.TRANSITION_USER_ROLE) return APIRoleTransitionDetailSchema.parse(detail);
    return typeof detail === 'string' ? detail : JSON.stringify(detail);
  } catch (error) {
    if (__DEV__) {
      console.warn(`Failed to validate detail for action ${action}:`, error);
      console.warn('Raw detail:', detail);
    }
    // Fallback to string representation
    return typeof detail === 'string' ? detail : JSON.stringify(detail);
  }
};

// Transform API activity log to frontend ActivityLog
const transformActivityLogFromAPI = (apiLog: APIActivityLog): ActivityLog => ({
  id: apiLog.id,
  user: transformLogUserInfo(apiLog.user),
  target_user: apiLog.target_user ? transformLogUserInfo(apiLog.target_user) : undefined,
  action: apiLog.action,
  detail: apiLog.detail ? safeTransformDetail(apiLog.action, apiLog.detail) : undefined,
  timestamp: apiLog.timestamp,
});

// Transform API activity log list response to frontend ActivityLogListResponse
const transformActivityLogListFromAPI = (
  apiResponse: APIActivityLogListResponse,
): ActivityLogListResponse => ({
  logs: apiResponse.logs.map(transformActivityLogFromAPI),
  total: apiResponse.total,
  limit: apiResponse.limit,
  offset: apiResponse.offset,
  hasMore: apiResponse.offset + apiResponse.limit < apiResponse.total,
});

/* =============================================================================
 * Utility Functions and Constants
 * ============================================================================= */

// Safely validate and transform activity log list response
const safeTransformActivityLogList = (rawData: unknown): ActivityLogListResponse | null => {
  try {
    const validatedData = APIActivityLogListResponseSchema.parse(rawData);
    return transformActivityLogListFromAPI(validatedData);
  } catch (error) {
    if (__DEV__) console.warn('Failed to validate activity log list:', error);
    return null;
  }
};

const logActionsFilter: FullActivityLogFilter['actions'] = [
  Action.CREATE_TASK,
  Action.UPDATE_TASK,
  Action.UPDATE_TASK_STATUS,
  Action.DELETE_TASK,
  Action.CREATE_SHARED_NOTE,
  Action.UPDATE_SHARED_NOTE,
  Action.DELETE_SHARED_NOTE,
  Action.ADD_USER_LINK,
  Action.REMOVE_USER_LINK,
];

/* =============================================================================
 * API Functions
 * ============================================================================= */

const getActivityLogs = async (
  filter: ActivityLogFilter = {},
): Promise<ActivityLogListResponse> => {
  const params = new URLSearchParams();

  logActionsFilter.forEach((action) => params.append('actions', action));

  if (filter.limit) params.append('limit', filter.limit.toString());
  if (filter.offset) params.append('offset', filter.offset.toString());

  const response = await axiosClientWithAuth.get(`${API_PATH.ACTIVITY_LOGS}?${params.toString()}`);
  const transformedData = safeTransformActivityLogList(response.data);

  if (!transformedData) {
    throw new Error('Failed to validate activity log response');
  }

  return transformedData;
};

/* =============================================================================
 * API Hooks
 * ============================================================================= */

export const useGetActivityLogs = (
  filter: ActivityLogFilter = {},
  options?: Omit<
    UseQueryOptions<ActivityLogListResponse, Error, ActivityLogListResponse, readonly unknown[]>,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery<ActivityLogListResponse, Error>({
    queryKey: ['activityLogs', filter],
    queryFn: async (): Promise<ActivityLogListResponse> => {
      return getActivityLogs(filter);
    },
    ...options,
  });
