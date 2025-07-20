// ============================================================================
// Task & Recurrence Constants
// ============================================================================

/** Maximum interval options for task recurrence (e.g., "every 1-30 days") */
export const MAX_RECURRENCE_INTERVAL = 30;

/** Default interval for new recurring tasks */
export const DEFAULT_RECURRENCE_INTERVAL = 1;

/** Maximum number of days that can be selected for weekly recurrence */
export const MAX_DAYS_OF_WEEK = 7;

/** Maximum number of days that can be selected for monthly recurrence */
export const MAX_DAYS_OF_MONTH = 31;

// ============================================================================
// Notification Constants
// ============================================================================

/** How many months ahead to schedule notifications for recurring tasks */
export const NOTIFICATION_SCHEDULE_MONTHS_AHEAD = 1;

/** Maximum number of notifications to schedule per task */
export const MAX_NOTIFICATIONS_PER_TASK = 2;

/** Minutes after which a task is considered overdue */
export const OVERDUE_MINUTES = 30;

// ============================================================================
// UI & Display Constants
// ============================================================================

/** Maximum length for task titles */
export const MAX_TASK_TITLE_LENGTH = 100;

/** Maximum length for task descriptions */
export const MAX_TASK_DESCRIPTION_LENGTH = 500;

/** Default task icon */
export const DEFAULT_TASK_ICON = '✅';

/** Default task title when empty */
export const DEFAULT_TASK_TITLE = '(no title)';

// ============================================================================
// Time & Date Constants
// ============================================================================

/** Default reminder time minute for new tasks */
export const DEFAULT_REMINDER_MINUTE = 0;

/** Time format for display */
export const TIME_FORMAT = 'HH:mm';

/** Date format for display */
export const DATE_FORMAT = 'YYYY-MM-DD';

/** DateTime format for display */
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm';

/** Use these for all last update, log, note, and location timestamps */
export const LAST_UPDATE_DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
export const LOG_DATE_FORMAT = 'MMM D, YYYY';
export const LOG_TIME_FORMAT = 'h:mm A';

// ============================================================================
// Validation Constants
// ============================================================================
/** Minimum recurrence interval */
export const MIN_RECURRENCE_INTERVAL = 1;

// ============================================================================
// Location & Sync Constants
// ============================================================================

/** Interval for background location sync (in milliseconds) */
export const LOCATION_SYNC_REFRESH_INTERVAL = 10 * 60 * 1000;
