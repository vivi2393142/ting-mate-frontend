import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { RecurrenceUnit } from '@/types/task';

interface useRecurrenceUnitTranslationResponse
  extends Omit<ReturnType<typeof useTranslation>, 't'> {
  tRecurrenceUnit: (
    RecurrenceUnit: RecurrenceUnit,
    options?: { count?: number; lowerCase?: boolean },
  ) => string;
}

const useRecurrenceUnitTranslation = (): useRecurrenceUnitTranslationResponse => {
  const { t, ...methods } = useTranslation('common');

  const tRecurrenceUnit = useCallback(
    (recurrenceUnit: RecurrenceUnit, options?: { count?: number; lowerCase?: boolean }) => {
      const mapping: Record<RecurrenceUnit, string> = {
        [RecurrenceUnit.DAY]: t('recurrenceUnit.Day', { count: options?.count || 0 }),
        [RecurrenceUnit.WEEK]: t('recurrenceUnit.Week', { count: options?.count || 0 }),
        [RecurrenceUnit.MONTH]: t('recurrenceUnit.Month', { count: options?.count || 0 }),
      };

      const result = mapping[recurrenceUnit];
      return options?.lowerCase ? result.toLowerCase() : result;
    },
    [t],
  );

  return {
    ...methods,
    tRecurrenceUnit,
  };
};

export default useRecurrenceUnitTranslation;
