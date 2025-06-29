import { Fragment, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ViewStyle } from 'react-native';

import { Picker } from '@react-native-picker/picker';
import { Switch, Text } from 'react-native-paper';

import { MAX_RECURRENCE_INTERVAL } from '@/constants';
import useAppTheme from '@/hooks/useAppTheme';
import useRecurrenceUnitTranslation from '@/hooks/useRecurrenceUnitTranslation';
import { useUserTextSize } from '@/store/useUserStore';
import { StaticTheme } from '@/theme';
import { DayOfWeek, type RecurrenceRule, RecurrenceUnit } from '@/types/task';
import { UserTextSize } from '@/types/user';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

import ThemedView from '@/components/atoms/ThemedView';
import {
  DaysOfMonthSelector,
  DaysOfWeekSelector,
} from '@/components/screens/TaskForm/DaysOfSelector';

const INTERVAL_OPTIONS = Array.from({ length: MAX_RECURRENCE_INTERVAL }, (_, i) => i + 1);

interface RecurrenceSelectorProps {
  recurrence?: RecurrenceRule;
  onChange: (recurrence?: RecurrenceRule) => void;
  onRecurringToggle: (recurrence?: RecurrenceRule) => void;
  style?: ViewStyle;
}

const RecurrenceSelector = ({
  recurrence,
  onChange,
  onRecurringToggle,
  style,
}: RecurrenceSelectorProps) => {
  const userTextSize = useUserTextSize();
  const theme = useAppTheme();
  const styleParams = useMemo(() => ({ userTextSize }), [userTextSize]);
  const styles = getStyles(theme, styleParams);

  const { t } = useTranslation('taskForm');
  const { tRecurrenceUnit } = useRecurrenceUnitTranslation();

  const isRecurring = !!recurrence;

  const handleIntervalChange = useCallback(
    (interval: number) => {
      if (!recurrence) return;
      onChange({
        ...recurrence,
        interval,
      });
    },
    [onChange, recurrence],
  );

  const handleUnitChange = useCallback(
    (unit: RecurrenceUnit) => {
      if (!recurrence) return;
      const newRecurrence: RecurrenceRule = {
        ...recurrence,
        unit,
        daysOfWeek: unit !== RecurrenceUnit.WEEK ? [] : recurrence.daysOfWeek,
        daysOfMonth: unit !== RecurrenceUnit.MONTH ? [] : recurrence.daysOfMonth,
      };
      onChange(newRecurrence);
    },
    [onChange, recurrence],
  );

  const handleDaysOfWeekChange = useCallback(
    (daysOfWeek: DayOfWeek[]) => {
      if (!recurrence) return;
      onChange({
        ...recurrence,
        daysOfWeek,
      });
    },
    [onChange, recurrence],
  );

  const handleDaysOfMonthChange = useCallback(
    (daysOfMonth: number[]) => {
      if (!recurrence) return;
      onChange({
        ...recurrence,
        daysOfMonth,
      });
    },
    [onChange, recurrence],
  );

  const handleRecurringToggle = useCallback(() => {
    onRecurringToggle(recurrence);
  }, [onRecurringToggle, recurrence]);

  return (
    <ThemedView style={[styles.root, style]}>
      {/* Enable Repeat Toggle */}
      <ThemedView style={[styles.section, styles.sectionRow]}>
        <Text style={[styles.baseText, styles.sectionTitleText, styles.sectionTitleTextRepeating]}>
          {t('Repeat Task')}
        </Text>
        <Text style={styles.baseText}>{isRecurring ? t('Repeating') : t('Once')}</Text>
        <Switch
          value={isRecurring}
          onValueChange={handleRecurringToggle}
          trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
          thumbColor={theme.colors.surface}
        />
      </ThemedView>
      {/* Recurrence Settings - Only show when recurring is enabled */}
      {isRecurring && (
        <Fragment>
          {/* Every X Unit Row */}
          <ThemedView style={[styles.section, styles.sectionRow]}>
            <Text style={[styles.baseText, styles.sectionTitleText]}>{t('Every')}</Text>
            <Picker
              selectedValue={recurrence.interval}
              onValueChange={handleIntervalChange}
              style={[styles.picker, styles.intervalPicker]}
              itemStyle={styles.baseText}
            >
              {INTERVAL_OPTIONS.map((num) => (
                <Picker.Item key={num} label={num.toString()} value={num} />
              ))}
            </Picker>
            <Picker
              selectedValue={recurrence.unit}
              onValueChange={handleUnitChange}
              style={styles.picker}
              itemStyle={styles.baseText}
            >
              {Object.values(RecurrenceUnit).map((unit) => (
                <Picker.Item
                  key={unit}
                  value={unit}
                  label={tRecurrenceUnit(unit, { lowerCase: true })}
                />
              ))}
            </Picker>
          </ThemedView>
          {/* Days of Week Selector */}
          {recurrence.unit === RecurrenceUnit.WEEK && (
            <ThemedView style={styles.section}>
              <Text style={[styles.baseText, styles.sectionTitleText]}>{t('On')}</Text>
              <DaysOfWeekSelector
                selected={recurrence.daysOfWeek ?? []}
                onChange={handleDaysOfWeekChange}
              />
            </ThemedView>
          )}
          {/* Days of Month Selector */}
          {recurrence.unit === RecurrenceUnit.MONTH && (
            <ThemedView style={styles.section}>
              <Text style={[styles.baseText, styles.sectionTitleText]}>{t('On')}</Text>
              <DaysOfMonthSelector
                selected={recurrence.daysOfMonth ?? []}
                onChange={handleDaysOfMonthChange}
              />
            </ThemedView>
          )}
        </Fragment>
      )}
    </ThemedView>
  );
};

export default RecurrenceSelector;

interface StyleParams {
  userTextSize: UserTextSize;
}

const getStyles = createStyles<
  StyleRecord<
    'root' | 'section' | 'sectionRow',
    'sectionTitleText' | 'picker' | 'intervalPicker' | 'baseText' | 'sectionTitleTextRepeating'
  >,
  StyleParams
>({
  root: {
    gap: StaticTheme.spacing.sm,
  },
  baseText: {
    fontSize: ({ fonts }) => fonts.bodyLarge.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyLarge.fontWeight,
  },
  section: {
    gap: StaticTheme.spacing.sm,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitleText: {
    color: ({ colors }) => colors.outline,
  },
  sectionTitleTextRepeating: {
    marginRight: 'auto',
  },
  picker: {
    flex: 1,
    height: 130,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  intervalPicker: {
    flex: 0,
    width: 100,
  },
});
