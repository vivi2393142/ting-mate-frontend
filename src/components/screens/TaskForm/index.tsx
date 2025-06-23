import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Platform } from 'react-native';

import { Divider } from 'react-native-paper';

import useAppTheme from '@/hooks/useAppTheme';
import { useMockTasks } from '@/store/useMockAPI';
import { useUserTextSize } from '@/store/useUserStore';
import { StaticTheme } from '@/theme';
import { RecurrenceFrequency, type ReminderTime, type TaskTemplate } from '@/types/task';
import { UserTextSize } from '@/types/user';
import { createStyles, type StyleRecord } from '@/utils/createStyles';
import { formatReminderTime } from '@/utils/taskUtils';

import FormInput from '@/components/atoms/FormInput';
import ScreenContainer from '@/components/atoms/ScreenContainer';
import ThemedButton from '@/components/atoms/ThemedButton';
import ThemedView from '@/components/atoms/ThemedView';

const now = new Date();
const nextHour = now.getMinutes() === 0 ? now.getHours() : now.getHours() + 1;
const defaultTaskFormData: TaskFormData = {
  title: '',
  icon: '📝',
  recurrence: {
    frequency: RecurrenceFrequency.DAILY,
  },
  reminderTimeList: [{ reminderTime: { hour: nextHour, minute: 0 } }],
};

const checkHasChanges = (initFormData: TaskFormData | null, formData: TaskFormData | null) => {
  if (!initFormData || !formData) return false;

  // Check basic fields
  if (initFormData.title !== formData.title || initFormData.icon !== formData.icon) {
    return true;
  }

  // Check recurrence
  const { recurrence: initRecurrence } = initFormData;
  const { recurrence: currentRecurrence } = formData;
  if (
    initRecurrence.frequency !== currentRecurrence.frequency ||
    initRecurrence.interval !== currentRecurrence.interval ||
    initRecurrence.daysOfWeek !== currentRecurrence.daysOfWeek ||
    initRecurrence.dayOfMonth !== currentRecurrence.dayOfMonth
  ) {
    return true;
  }

  // Check reminder time
  const initReminder = initFormData.reminderTimeList?.[0];
  const currentReminder = formData.reminderTimeList?.[0];
  if (
    initReminder?.id !== currentReminder?.id ||
    initReminder?.reminderTime.hour !== currentReminder?.reminderTime.hour ||
    initReminder?.reminderTime.minute !== currentReminder?.reminderTime.minute
  ) {
    return true;
  }

  return false;
};

const checkIsFormValid = (formData: TaskFormData | null) => {
  if (!formData) return false;
  return formData.title !== '' && formData.icon !== '' && formData.reminderTimeList.length > 0;
};

interface TaskFormData extends Pick<TaskTemplate, 'title' | 'icon' | 'recurrence'> {
  reminderTimeList: { id?: string; reminderTime: ReminderTime }[];
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
  const { getTask, deleteTask, updateTask, createTask } = useMockTasks();

  const [initFormData, setInitFormData] = useState<TaskFormData | null>(null);
  const [formData, setFormData] = useState<TaskFormData | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const reminder = formData?.reminderTimeList?.[0];
  const reminderDate = useMemo(() => {
    if (!reminder) return dayjs().toDate();
    return dayjs()
      .hour(reminder.reminderTime.hour)
      .minute(reminder.reminderTime.minute)
      .second(0)
      .millisecond(0)
      .toDate();
  }, [reminder]);

  const handleInputChange = (field: keyof TaskFormData) => (value: string) => {
    setFormData((prev) => prev && { ...prev, [field]: value });
  };

  const handleTimeChange = useCallback((_: DateTimePickerEvent, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) {
      setFormData((prev) => {
        if (!prev) return null;

        return {
          ...prev,
          reminderTimeList: [
            {
              id: prev.reminderTimeList?.[0]?.id,
              reminderTime: {
                hour: selectedDate.getHours(),
                minute: selectedDate.getMinutes(),
              },
            },
          ],
        };
      });
    }
  }, []);

  const handleSave = useCallback(() => {
    if (!formData) return;

    const taskData = {
      title: formData.title,
      icon: formData.icon,
      recurrence: formData.recurrence,
    };

    if (isEditMode) {
      updateTask(editTaskId, {
        ...taskData,
        reminderTimeList: formData.reminderTimeList.map(({ id, reminderTime }) => ({
          id,
          reminderTime,
        })),
      });
    } else {
      createTask({
        ...taskData,
        reminderTimeList: formData.reminderTimeList.map(({ reminderTime }) => reminderTime),
      });
    }

    router.back();
  }, [editTaskId, formData, isEditMode, router, updateTask, createTask]);

  const handleCancel = useCallback(() => {
    const hasChanges = checkHasChanges(initFormData, formData);

    if (hasChanges) {
      Alert.alert(t('Discard Changes'), t('Are you sure you want to discard your changes?'), [
        {
          text: t('Cancel'),
          style: 'cancel',
        },
        {
          text: t('Discard'),
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]);
    } else {
      router.back();
    }
  }, [formData, initFormData, router, t]);

  const handleDeleteTask = useCallback(() => {
    Alert.alert(t('Delete Task'), t('Are you sure you want to delete this task?'), [
      {
        text: t('Cancel'),
        style: 'cancel',
      },
      {
        text: t('Delete'),
        style: 'destructive',
        onPress: () => {
          deleteTask(editTaskId);
          router.back();
        },
      },
    ]);
  }, [editTaskId, router, t, deleteTask]);

  const isFormValid = useMemo(() => checkIsFormValid(formData), [formData]);

  // Initialize form data
  useEffect(() => {
    if (formData != null) return;

    if (isEditMode) {
      const editingTask = getTask(editTaskId);
      if (!editingTask) return; // TODO: handle error

      const newFormData: TaskFormData = {
        title: editingTask.title,
        icon: editingTask.icon,
        recurrence: editingTask.recurrence,
        reminderTimeList: editingTask.reminders.map(({ id, reminderTime }) => ({
          id,
          reminderTime,
        })),
      };
      setInitFormData(newFormData);
      setFormData(newFormData);
    } else {
      setInitFormData(defaultTaskFormData);
      setFormData(defaultTaskFormData);
    }
  }, [formData, editTaskId, isEditMode, getTask]);

  return (
    <Fragment>
      <Stack.Screen
        options={{
          title: isEditMode ? t('Edit Task') : t('Add Task'),
          headerLeft: () => (
            <Button color={theme.colors.primary} onPress={handleCancel} title={t('Cancel')} />
          ),
          headerRight: () => (
            <Button
              color={theme.colors.primary}
              onPress={handleSave}
              title={isEditMode ? t('Save') : t('Done')}
              disabled={!isFormValid}
            />
          ),
        }}
      />
      <ScreenContainer isRoot={false} style={styles.screenContainer}>
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
            value={reminder ? formatReminderTime(reminder.reminderTime) : ''}
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
              style={styles.timePicker}
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
        {isEditMode && (
          <ThemedButton
            mode="outlined"
            onPress={handleDeleteTask}
            color="error"
            icon="trash"
            style={styles.deleteButton}
          >
            {t('Delete Task')}
          </ThemedButton>
        )}
      </ScreenContainer>
    </Fragment>
  );
};

export default TaskForm;

interface StyleParams {
  userTextSize: UserTextSize;
}

const getStyles = createStyles<
  StyleRecord<'screenContainer' | 'deleteButton' | 'timePicker'>,
  StyleParams
>({
  screenContainer: {
    gap: StaticTheme.spacing.md,
    paddingTop: StaticTheme.spacing.md,
  },
  timePicker: {
    alignSelf: 'center',
  },
  deleteButton: {
    backgroundColor: 'transparent',
    marginTop: StaticTheme.spacing.xs,
  },
});
