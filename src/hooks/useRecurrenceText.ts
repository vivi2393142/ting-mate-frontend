import { useCallback } from 'react';

import useDayOfWeekTranslation from '@/hooks/useDayOfWeekTranslation';
import useRecurrenceUnitTranslation from '@/hooks/useRecurrenceUnitTranslation';
import { type RecurrenceRule, RecurrenceUnit } from '@/types/task';
import { useTranslation } from 'react-i18next';

const useRecurrenceText = () => {
  const { tRecurrenceUnit } = useRecurrenceUnitTranslation();
  const { tDayOfWeek } = useDayOfWeekTranslation();
  const { t } = useTranslation('common');

  const tRecurrenceText = useCallback(
    ({ interval, unit, ...other }: RecurrenceRule) => {
      if (!interval) return '';

      // Special cases
      if (interval === 1 && unit === RecurrenceUnit.DAY) {
        return t('Daily');
      }

      // Day case
      if (unit === RecurrenceUnit.DAY) {
        return t('recurrenceText_day', {
          interval,
          unit: tRecurrenceUnit(unit, { count: interval, lowerCase: true }),
        });
      }

      // Week and Month case
      const daysText =
        unit === RecurrenceUnit.WEEK
          ? other?.daysOfWeek?.map((d) => tDayOfWeek(d, true)).join(', ')
          : other?.daysOfMonth?.join(', ');

      // return text;
      return t('recurrenceText_week_month', {
        interval,
        unit: tRecurrenceUnit(unit, { count: interval, lowerCase: true }),
        days: daysText || '',
      });
    },
    [tRecurrenceUnit, tDayOfWeek, t],
  );

  return { tRecurrenceText };
};

export default useRecurrenceText;
