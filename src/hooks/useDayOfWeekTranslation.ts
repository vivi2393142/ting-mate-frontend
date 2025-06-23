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
        [DayOfWeek.MONDAY]: t('dayOfWeek.Monday'),
        [DayOfWeek.TUESDAY]: t('dayOfWeek.Tuesday'),
        [DayOfWeek.WEDNESDAY]: t('dayOfWeek.Wednesday'),
        [DayOfWeek.THURSDAY]: t('dayOfWeek.Thursday'),
        [DayOfWeek.FRIDAY]: t('dayOfWeek.Friday'),
        [DayOfWeek.SATURDAY]: t('dayOfWeek.Saturday'),
        [DayOfWeek.SUNDAY]: t('dayOfWeek.Sunday'),
      };
      const shortMapping: Record<DayOfWeek, string> = {
        [DayOfWeek.MONDAY]: t('dayOfWeek.Mon'),
        [DayOfWeek.TUESDAY]: t('dayOfWeek.Tue'),
        [DayOfWeek.WEDNESDAY]: t('dayOfWeek.Wed'),
        [DayOfWeek.THURSDAY]: t('dayOfWeek.Thu'),
        [DayOfWeek.FRIDAY]: t('dayOfWeek.Fri'),
        [DayOfWeek.SATURDAY]: t('dayOfWeek.Sat'),
        [DayOfWeek.SUNDAY]: t('dayOfWeek.Sun'),
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
