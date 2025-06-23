import { useCallback } from 'react';

import useDayOfWeekTranslation from '@/hooks/useDayOfWeekTranslation';
import useRecurrenceFrequencyTranslation from '@/hooks/useRecurrenceFrequencyTranslation';
import { RecurrenceFrequency, type RecurrenceRule } from '@/types/task';

const useRecurrenceText = () => {
  const { tRecurrenceFrequency } = useRecurrenceFrequencyTranslation();
  const { tDayOfWeek } = useDayOfWeekTranslation();

  const tRecurrenceText = useCallback(
    (recurrence: RecurrenceRule) => {
      switch (recurrence.frequency) {
        case RecurrenceFrequency.DAILY:
        case RecurrenceFrequency.ONCE:
          return tRecurrenceFrequency(recurrence.frequency);
        case RecurrenceFrequency.WEEKLY:
          if (!recurrence.daysOfWeek || recurrence.daysOfWeek.length === 0) {
            return tRecurrenceFrequency(RecurrenceFrequency.WEEKLY);
          }
          return `${tRecurrenceFrequency(RecurrenceFrequency.WEEKLY)} ${recurrence.daysOfWeek
            .map((d) => tDayOfWeek(d, true))
            .join(', ')}`;
        case RecurrenceFrequency.MONTHLY:
          if (!recurrence.dayOfMonth) {
            return tRecurrenceFrequency(RecurrenceFrequency.MONTHLY);
          }
          return `${tRecurrenceFrequency(RecurrenceFrequency.MONTHLY)} ${recurrence.dayOfMonth}`;
        default:
          return '';
      }
    },
    [tRecurrenceFrequency, tDayOfWeek],
  );

  return { tRecurrenceText };
};

export default useRecurrenceText;
