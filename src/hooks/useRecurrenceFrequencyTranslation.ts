import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { RecurrenceFrequency } from '@/types/task';

interface useRecurrenceFrequencyTranslationResponse
  extends Omit<ReturnType<typeof useTranslation>, 't'> {
  tRecurrenceFrequency: (recurrenceFrequency: RecurrenceFrequency) => string;
}

const useRecurrenceFrequencyTranslation = (): useRecurrenceFrequencyTranslationResponse => {
  const { t, ...methods } = useTranslation('common');

  const tRecurrenceFrequency = useCallback(
    (recurrenceFrequency: RecurrenceFrequency) => {
      const mapping: Record<RecurrenceFrequency, string> = {
        [RecurrenceFrequency.ONCE]: t('recurrenceFrequency.Once'),
        [RecurrenceFrequency.DAILY]: t('recurrenceFrequency.Daily'),
        [RecurrenceFrequency.WEEKLY]: t('recurrenceFrequency.Weekly'),
        [RecurrenceFrequency.MONTHLY]: t('recurrenceFrequency.Monthly'),
      };
      return mapping[recurrenceFrequency];
    },
    [t],
  );

  return {
    ...methods,
    tRecurrenceFrequency,
  };
};

export default useRecurrenceFrequencyTranslation;
