import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { Role } from '@/types/user';

interface useRoleTranslationResponse extends Omit<ReturnType<typeof useTranslation>, 't'> {
  tRole: (RecurrenceUnit: Role) => string;
}

const useRoleTranslation = (): useRoleTranslationResponse => {
  const { t, ...methods } = useTranslation('common');

  const tRole = useCallback(
    (role: Role) => {
      const mapping: Record<Role, string> = {
        [Role.CARERECEIVER]: t('role.Core User'),
        [Role.CAREGIVER]: t('role.Companion'),
      };

      const result = mapping[role];
      return result;
    },
    [t],
  );

  return {
    ...methods,
    tRole,
  };
};

export default useRoleTranslation;
