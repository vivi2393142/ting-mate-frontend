import { useMemo } from 'react';

import useAppTheme from '@/hooks/useAppTheme';
import useDayOfWeekTranslation from '@/hooks/useDayOfWeekTranslation';
import { useUserTextSize } from '@/store/useUserStore';
import { DayOfWeek } from '@/types/task';
import { UserTextSize } from '@/types/user';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

import ThemedButton from '@/components/atoms/ThemedButton';
import ThemedView from '@/components/atoms/ThemedView';

const dayOfWeekRow: DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6];

interface DaysOfWeekSelectorProps {
  selected: DayOfWeek[];
  onChange: (days: DayOfWeek[]) => void;
}

const DaysOfWeekSelector = ({ selected, onChange }: DaysOfWeekSelectorProps) => {
  const userTextSize = useUserTextSize();
  const theme = useAppTheme();
  const styleParams = useMemo(() => ({ userTextSize }), [userTextSize]);
  const styles = getStyles(theme, styleParams);

  const { tDayOfWeek } = useDayOfWeekTranslation();

  const toggleDay = (day: DayOfWeek) => () => {
    if (selected.includes(day)) {
      onChange(selected.filter((d) => d !== day));
    } else {
      onChange([...selected, day]);
    }
  };

  return (
    <ThemedView style={styles.dayOfSelectorRow}>
      {dayOfWeekRow.map((day) => (
        <ThemedButton
          key={day}
          mode={selected.includes(day) ? 'contained' : 'outlined'}
          color={selected.includes(day) ? 'primary' : 'onSurface'}
          onPress={toggleDay(day)}
          style={styles.dayOfSelectorButton}
          labelStyle={styles.dayOfSelectorButtonLabel}
          contentStyle={styles.dayOfSelectorButtonContent}
        >
          {tDayOfWeek(day, true)}
        </ThemedButton>
      ))}
    </ThemedView>
  );
};

const dayOfMonthRows: number[][] = [];
for (let i = 1; i <= 31; i += 7) {
  dayOfMonthRows.push(Array.from({ length: 7 }, (_, j) => i + j).filter((d) => d <= 31));
}

interface DaysOfMonthSelectorProps {
  selected: number[];
  onChange: (days: number[]) => void;
}

const DaysOfMonthSelector = ({ selected, onChange }: DaysOfMonthSelectorProps) => {
  const userTextSize = useUserTextSize();
  const theme = useAppTheme();
  const styleParams = useMemo(() => ({ userTextSize }), [userTextSize]);
  const styles = getStyles(theme, styleParams);

  const toggleDay = (day: number) => () => {
    if (selected.includes(day)) {
      onChange(selected.filter((d) => d !== day));
    } else {
      onChange([...selected, day]);
    }
  };

  return (
    <ThemedView>
      {dayOfMonthRows.map((row, idx) => (
        <ThemedView key={idx} style={styles.dayOfSelectorRow}>
          {row.map((day) => (
            <ThemedButton
              key={day}
              mode={selected.includes(day) ? 'contained' : 'outlined'}
              color={selected.includes(day) ? 'primary' : 'onSurface'}
              onPress={toggleDay(day)}
              style={styles.dayOfSelectorButton}
              labelStyle={styles.dayOfSelectorButtonLabel}
              contentStyle={styles.dayOfSelectorButtonContent}
            >
              {day}
            </ThemedButton>
          ))}
        </ThemedView>
      ))}
    </ThemedView>
  );
};

export { DaysOfMonthSelector, DaysOfWeekSelector };

interface StyleParams {
  userTextSize: UserTextSize;
}

const getStyles = createStyles<
  StyleRecord<
    'dayOfSelectorRow' | 'dayOfSelectorButton' | 'dayOfSelectorButtonContent',
    'dayOfSelectorButtonLabel'
  >,
  StyleParams
>({
  dayOfSelectorRow: {
    flexDirection: 'row',
  },
  dayOfSelectorButton: {
    width: `${100 / 7}%`,
    height: (_, { userTextSize }) => (userTextSize === UserTextSize.LARGE ? 48 : 32),
    minWidth: `${100 / 7}%`,
    borderRadius: 0,
    borderWidth: 1 / 2,
    borderColor: ({ colors }) => colors.onSurface,
  },
  dayOfSelectorButtonLabel: {
    marginVertical: 0,
    marginHorizontal: 0,
    fontWeight: '400',
  },
  dayOfSelectorButtonContent: {
    height: '100%',
  },
});
