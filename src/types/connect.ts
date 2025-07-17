export enum ContactMethod {
  PHONE = 'PHONE',
  WHATSAPP = 'WHATSAPP',
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  contactMethods: ContactMethod[];
}

export interface AddressData {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface SafeZone {
  location: AddressData;
  radius: number;
}

export enum Action {
  // User Settings
  UPDATE_USER_SETTINGS = 'UPDATE_USER_SETTINGS',

  // Task Management
  CREATE_TASK = 'CREATE_TASK',
  UPDATE_TASK = 'UPDATE_TASK',
  UPDATE_TASK_STATUS = 'UPDATE_TASK_STATUS',
  DELETE_TASK = 'DELETE_TASK',

  // Shared Notes
  CREATE_SHARED_NOTE = 'CREATE_SHARED_NOTE',
  UPDATE_SHARED_NOTE = 'UPDATE_SHARED_NOTE',
  DELETE_SHARED_NOTE = 'DELETE_SHARED_NOTE',

  // Safe Zones
  UPSERT_SAFE_ZONE = 'UPSERT_SAFE_ZONE',
  DELETE_SAFE_ZONE = 'DELETE_SAFE_ZONE',

  // User Links
  ADD_USER_LINK = 'ADD_USER_LINK',
  REMOVE_USER_LINK = 'REMOVE_USER_LINK',

  // Role Transition
  TRANSITION_USER_ROLE = 'TRANSITION_USER_ROLE',
}

export interface LogUserInfo {
  id: string;
  name: string;
  email?: string;
}

export interface ActivityLog {
  id: string;
  user: LogUserInfo;
  target_user?: LogUserInfo;
  action: Action;
  detail?: ActivityLogDetail | string; // Allow string fallback for invalid details
  timestamp: string; // ISO datetime string
}

export interface ActivityLogFilter {
  actions?: Action[];
  limit?: number;
  offset?: number;
}

export interface ActivityLogListResponse {
  logs: ActivityLog[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// =============================================================================
// Detail Types for Each Action
// =============================================================================

// User Settings
export interface UpdateUserSettingsDetail {
  updated_fields: Record<string, unknown>;
  description: string;
}

// User Links
export interface AddUserLinkDetail {
  linked_user_email: string;
  linked_user_name: string;
  description: string;
}

export interface RemoveUserLinkDetail {
  linked_user_email: string;
  linked_user_name: string;
  description: string;
}

// Role Transition
export interface RoleTransitionDetail {
  old_role: string;
  new_role: string;
  description: string;
}

// Task Management
export interface CreateTaskDetail {
  task_title: string;
  reminder_time: string;
  description: string;
}

export interface UpdateTaskDetail {
  task_title: string;
  updated_fields: Record<string, unknown>;
  description: string;
}

export interface UpdateTaskStatusDetail {
  task_title: string;
  status: 'completed' | 'uncompleted';
  description: string;
}

export interface DeleteTaskDetail {
  task_title: string;
  description: string;
}

// Shared Notes
export interface CreateSharedNoteDetail {
  note_title: string;
  description: string;
}

export interface UpdateSharedNoteDetail {
  note_title: string;
  updated_fields: Record<string, unknown>;
  description: string;
}

export interface DeleteSharedNoteDetail {
  note_title: string;
  description: string;
}

// Safe Zones
export interface UpsertSafeZoneDetail {
  location_name: string;
  radius: number;
  description: string;
}

export interface DeleteSafeZoneDetail {
  location_name: string;
  description: string;
}

// Union type for all possible detail structures
export type ActivityLogDetail =
  | UpdateUserSettingsDetail
  | AddUserLinkDetail
  | RemoveUserLinkDetail
  | RoleTransitionDetail
  | CreateTaskDetail
  | UpdateTaskDetail
  | UpdateTaskStatusDetail
  | DeleteTaskDetail
  | CreateSharedNoteDetail
  | UpdateSharedNoteDetail
  | DeleteSharedNoteDetail
  | UpsertSafeZoneDetail
  | DeleteSafeZoneDetail;

// Updated ActivityLogResponse with typed detail
export interface ActivityLogResponse {
  id: string;
  user: LogUserInfo;
  target_user?: LogUserInfo;
  action: Action;
  detail?: ActivityLogDetail | string; // Allow string fallback for invalid details
  timestamp: string; // ISO datetime string
}
