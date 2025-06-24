import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { DayOfWeek } from '@/types/task';

interface useDayOfWeekTranslationResponse extends Omit<ReturnType<typeof useTranslation>, 't'> {
  tDayOfWeek: (dayOfWeek: DayOfWeek, isShort?: boolean) => string;
}

const useDayOfWeekTranslation = (): useDayOfWeekTranslationResponse => {
  const { t, ...methods } = useTranslation('common');

  const tDayOfWeek = useCallback(
    (dayOfWeek: DayOfWeek, isShort?: boolean) => {
      const mapping: Record<DayOfWeek, string> = {
        [0]: t('dayOfWeek.Monday'),
        [1]: t('dayOfWeek.Tuesday'),
        [2]: t('dayOfWeek.Wednesday'),
        [3]: t('dayOfWeek.Thursday'),
        [4]: t('dayOfWeek.Friday'),
        [5]: t('dayOfWeek.Saturday'),
        [6]: t('dayOfWeek.Sunday'),
      };
      const shortMapping: Record<DayOfWeek, string> = {
        [0]: t('dayOfWeek.Mon'),
        [1]: t('dayOfWeek.Tue'),
        [2]: t('dayOfWeek.Wed'),
        [3]: t('dayOfWeek.Thu'),
        [4]: t('dayOfWeek.Fri'),
        [5]: t('dayOfWeek.Sat'),
        [6]: t('dayOfWeek.Sun'),
      };
      return isShort ? shortMapping[dayOfWeek] : mapping[dayOfWeek];
    },
    [t],
  );

  return {
    ...methods,
    tDayOfWeek,
  };
};

export default useDayOfWeekTranslation;
