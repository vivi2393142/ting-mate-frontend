import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { Action, type ActivityLog } from '@/types/connect';

export type LogDisplayMode = 'summary' | 'detail';

// Type guard to check if detail is an object
const isDetailObject = (detail: unknown): detail is Record<string, unknown> =>
  detail !== null && typeof detail === 'object' && !Array.isArray(detail);

// Helper to safely extract string values from detail object
const getDetailValue = (detail: unknown, key: string): string => {
  if (!isDetailObject(detail)) return '---';
  const value = detail[key];
  return typeof value === 'string' ? value : '---';
};

// Helper to extract multiple values from detail object
const getDetailValues = (detail: unknown, keys: string[]): Record<string, string> => {
  const result: Record<string, string> = {};
  keys.forEach((key) => {
    result[key] = getDetailValue(detail, key);
  });
  return result;
};

export const useLogTranslation = () => {
  const { t } = useTranslation('activityLog');

  const getSimpleLogText = useCallback(
    (action: Action): string => {
      return t(`actions.${action}`, { defaultValue: t('actions.DEFAULT') });
    },
    [t],
  );

  const formatLogText = useCallback(
    (log: ActivityLog, format: 'summary' | 'details' | 'description'): string => {
      if (format === 'description') return getDetailValue(log.detail, 'description');

      const baseParams = { userName: log.user.name };
      switch (log.action) {
        case Action.CREATE_TASK:
        case Action.UPDATE_TASK:
        case Action.DELETE_TASK: {
          const taskTitle = getDetailValue(log.detail, 'task_title');
          return t(`${format}.${log.action}`, { ...baseParams, taskTitle });
        }

        case Action.UPDATE_TASK_STATUS: {
          const { task_title: taskTitle, status } = getDetailValues(log.detail, [
            'task_title',
            'status',
          ]);
          return t(`${format}.${log.action}`, { ...baseParams, taskTitle, status });
        }

        case Action.CREATE_SHARED_NOTE:
        case Action.UPDATE_SHARED_NOTE:
        case Action.DELETE_SHARED_NOTE: {
          const noteTitle = getDetailValue(log.detail, 'note_title');
          return t(`${format}.${log.action}`, { ...baseParams, noteTitle });
        }

        case Action.ADD_USER_LINK:
        case Action.REMOVE_USER_LINK: {
          const linkedUserName =
            getDetailValue(log.detail, 'linked_user_name') ||
            getDetailValue(log.detail, 'linked_user_email');
          return t(`${format}.${log.action}`, { ...baseParams, linkedUserName });
        }

        case Action.UPDATE_USER_SETTINGS: {
          return t(`${format}.${log.action}`, baseParams);
        }

        case Action.TRANSITION_USER_ROLE: {
          const { old_role: oldRole, new_role: newRole } = getDetailValues(log.detail, [
            'old_role',
            'new_role',
          ]);
          return t(`${format}.${log.action}`, { ...baseParams, oldRole, newRole });
        }

        case Action.UPSERT_SAFE_ZONE:
        case Action.DELETE_SAFE_ZONE: {
          const locationName = getDetailValue(log.detail, 'location_name');
          return t(`${format}.${log.action}`, { ...baseParams, locationName });
        }

        default:
          return getSimpleLogText(log.action);
      }
    },
    [t, getSimpleLogText],
  );

  return formatLogText;
};
