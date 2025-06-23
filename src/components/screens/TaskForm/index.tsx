import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { Divider } from 'react-native-paper';

import useAppTheme from '@/hooks/useAppTheme';
import { useUserTextSize } from '@/store/useUserStore';
import { StaticTheme } from '@/theme';
import { UserTextSize } from '@/types/user';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

import { useMockTasks } from '@/store/useMockAPI';
import { RecurrenceFrequency, type ReminderTime, type TaskTemplate } from '@/types/task';
import { formatReminderTime } from '@/utils/taskUtils';

import FormInput from '@/components/atoms/FormInput';
import ScreenContainer from '@/components/atoms/ScreenContainer';
import ThemedButton from '@/components/atoms/ThemedButton';
import ThemedView from '@/components/atoms/ThemedView';

interface TaskFormData extends Pick<TaskTemplate, 'title' | 'icon' | 'recurrence'> {
  reminderTimeList: ReminderTime[];
}

const TaskForm = () => {
  const { t } = useTranslation('taskForm');
  const router = useRouter();
  const params = useLocalSearchParams();
  const userTextSize = useUserTextSize();

  const theme = useAppTheme();
  const styleParams = useMemo(() => ({ userTextSize }), [userTextSize]);
  const styles = getStyles(theme, styleParams);

  const isEditMode = params.id !== undefined;
  const editTaskId = params.id as string;

  // TODO: remove mock tasks
  const { getTask } = useMockTasks();

  const [formData, setFormData] = useState<TaskFormData | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const reminderTime = formData?.reminderTimeList?.[0];
  const reminderDate = useMemo(() => {
    if (!reminderTime) return new Date();
    const d = new Date();
    d.setHours(reminderTime.hour);
    d.setMinutes(reminderTime.minute);
    d.setSeconds(0);
    d.setMilliseconds(0);
    return d;
  }, [reminderTime]);

  const handleInputChange = (field: keyof TaskFormData) => (value: string) => {
    setFormData((prev) => prev && { ...prev, [field]: value });
  };

  const handleTimeChange = useCallback(
    (_: DateTimePickerEvent, selectedDate?: Date) => {
      setShowTimePicker(false);
      if (selectedDate) {
        const hour = selectedDate.getHours();
        const minute = selectedDate.getMinutes();
        setFormData(
          (prev) =>
            prev && {
              ...prev,
              reminderTimeList: [{ hour, minute }],
            },
        );
      }
    },
    [setFormData, setShowTimePicker],
  );

  const handleSave = useCallback(() => {
    // TODO: Save task to backend
    console.log('isEditMode', isEditMode);
    console.log('Saving task:', { id: editTaskId, ...formData });

    // Navigate back to home
    router.back();
  }, [editTaskId, formData, isEditMode, router]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  // TODO: Add validation
  const isFormValid = true;

  useEffect(() => {
    if (formData != null) return;
    if (isEditMode) {
      const editingTask = getTask(editTaskId);
      setFormData({
        title: editingTask.title,
        icon: editingTask.icon,
        recurrence: editingTask.recurrence,
        reminderTimeList: editingTask.reminders.map((reminder) => reminder.reminderTime),
      });
    } else {
      const now = new Date();
      const nextHour = now.getMinutes() === 0 ? now.getHours() : now.getHours() + 1;
      setFormData({
        title: '',
        icon: '📝',
        recurrence: {
          frequency: RecurrenceFrequency.DAILY,
        },
        reminderTimeList: [{ hour: nextHour, minute: 0 }],
      });
    }
  }, [formData, editTaskId, getTask, isEditMode]);

  return (
    <Fragment>
      <Stack.Screen options={{ title: isEditMode ? t('Edit Task') : t('Add Task') }} />
      <ScreenContainer isRoot={false} style={styles.container}>
        <ThemedView>
          <FormInput
            label={t('Title')}
            icon="text.justify.leading"
            value={formData?.title || ''}
            onChangeValue={handleInputChange('title')}
            placeholder={t('Add task title')}
          />
          {/* TODO: add selects for the following inputs */}
          <FormInput
            label={t('Icon')}
            icon="face.smiling"
            value={formData?.icon || ''}
            onChangeValue={handleInputChange('icon')}
          />
          <FormInput
            label={t('Time')}
            icon="clock"
            value={reminderTime ? formatReminderTime(reminderTime) : ''}
            onPress={() => setShowTimePicker((prev) => !prev)}
            placeholder={t('Select time')}
            readOnly
            rightIconName="chevron.up.chevron.down"
          />
          {showTimePicker && (
            <DateTimePicker
              value={reminderDate}
              mode="time"
              is24Hour={true}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
            />
          )}
          <Divider />
          <FormInput
            label={t('Repeat')}
            icon="repeat"
            value={formData?.recurrence.frequency || ''}
            onChangeValue={handleInputChange('recurrence')}
            divider={false}
          />
        </ThemedView>
        <ThemedView style={styles.buttonContainer}>
          {/* TODO: add 'completed' button */}
          <ThemedButton mode="outlined" onPress={handleCancel}>
            {t('Cancel')}
          </ThemedButton>
          <ThemedButton onPress={handleSave} disabled={!isFormValid}>
            {t('Save')}
          </ThemedButton>
        </ThemedView>
      </ScreenContainer>
    </Fragment>
  );
};

export default TaskForm;

interface StyleParams {
  userTextSize: UserTextSize;
}

const getStyles = createStyles<
  StyleRecord<'container' | 'buttonContainer', 'chevronIcon'>,
  StyleParams
>({
  container: {
    gap: StaticTheme.spacing.md,
    paddingTop: StaticTheme.spacing.md,
  },
  buttonContainer: {
    backgroundColor: 'transparent',
    gap: StaticTheme.spacing.sm * 1.5,
    marginTop: StaticTheme.spacing.xs,
  },
  chevronIcon: {
    marginLeft: StaticTheme.spacing.xs,
  },
});
