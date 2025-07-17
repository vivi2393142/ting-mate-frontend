// ===================== Location Related Types =====================
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

export interface UpsertSafeZoneDetail {
  location_name: string;
  radius: number;
  description: string;
}
export interface DeleteSafeZoneDetail {
  location_name: string;
  description: string;
}

// ===================== Contact Related Types =====================
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

export interface LogUserInfo {
  id: string;
  name: string;
  email?: string;
}

// ===================== Log Related Types =====================
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

export interface ActivityLog {
  id: string;
  user: LogUserInfo;
  target_user?: LogUserInfo;
  action: Action;
  detail?: ActivityLogDetail | string;
  timestamp: string;
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

// ---- Activity Log Detail Types ----
export interface UpdateUserSettingsDetail {
  updated_fields: Record<string, unknown>;
  description: string;
}
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
export interface RoleTransitionDetail {
  old_role: string;
  new_role: string;
  description: string;
}
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

export interface ActivityLogResponse {
  id: string;
  user: LogUserInfo;
  target_user?: LogUserInfo;
  action: Action;
  detail?: ActivityLogDetail | string;
  timestamp: string;
}

// ===================== Note Related Types =====================
export interface SharedNote {
  id: string;
  carereceiverId: string;
  title: string;
  content?: string | null;
  createdBy: LogUserInfo;
  updatedBy: LogUserInfo;
  createdAt: string;
  updatedAt: string;
}

export interface SharedNoteCreate {
  title: string;
  content: string;
}

export interface SharedNoteUpdate {
  title?: string;
  content?: string;
}

export interface SharedNoteListResponse {
  notes: SharedNote[];
}
