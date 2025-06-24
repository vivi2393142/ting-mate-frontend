import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Platform } from 'react-native';

import { Divider } from 'react-native-paper';
import EmojiPicker from 'rn-emoji-keyboard';

import useAppTheme from '@/hooks/useAppTheme';
import useRecurrenceText from '@/hooks/useRecurrenceText';
import { useMockTasks } from '@/store/useMockAPI';
import { useUserTextSize } from '@/store/useUserStore';
import { StaticTheme } from '@/theme';
import { RecurrenceRule, RecurrenceUnit, type ReminderTime, type TaskTemplate } from '@/types/task';
import { UserTextSize } from '@/types/user';
import { createStyles, type StyleRecord } from '@/utils/createStyles';
import { formatReminderTime } from '@/utils/taskUtils';

import FormInput from '@/components/atoms/FormInput';
import ScreenContainer from '@/components/atoms/ScreenContainer';
import ThemedButton from '@/components/atoms/ThemedButton';
import ThemedView from '@/components/atoms/ThemedView';
import RecurrenceSelector from '@/components/screens/TaskForm/RecurrenceSelector';

const now = new Date();
const nextHour = now.getMinutes() === 0 ? now.getHours() : now.getHours() + 1;

const defaultRecurrence: RecurrenceRule = {
  interval: 1,
  unit: RecurrenceUnit.DAY,
};

const defaultTaskFormData: TaskFormData = {
  title: '',
  icon: '📝',
  recurrence: defaultRecurrence,
  reminderTimeList: [{ reminderTime: { hour: nextHour, minute: 0 } }],
};

const checkHasChanges = (initFormData: TaskFormData | null, formData: TaskFormData | null) => {
  if (!initFormData || !formData) return false;

  // Check basic fields
  if (initFormData.title !== formData.title || initFormData.icon !== formData.icon) {
    return true;
  }

  // Check recurrence (deep compare)
  const a = initFormData.recurrence;
  const b = formData.recurrence;
  if (!a || !b) return true; // If either is undefined, consider it changed

  if (
    a.interval !== b.interval ||
    a.unit !== b.unit ||
    JSON.stringify(a.daysOfWeek ?? []) !== JSON.stringify(b.daysOfWeek ?? []) ||
    JSON.stringify(a.daysOfMonth ?? []) !== JSON.stringify(b.daysOfMonth ?? [])
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

interface TaskFormData extends Pick<TaskTemplate, 'title' | 'icon'> {
  recurrence: RecurrenceRule;
  reminderTimeList: { id?: string; reminderTime: ReminderTime }[];
}

// TODO: check validation
// TODO: check 'no recurrence rule' when 'off' instead of checking "interval === 0"
// TODO: make "repeat" display text not being hidden when too long
// TODO: hing "not valid" input
const TaskForm = () => {
  const { t } = useTranslation('taskForm');
  const { tRecurrenceText } = useRecurrenceText();

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
  const [showEmojiKeyboard, setShowEmojiKeyboard] = useState(false);
  const [showRecurrenceSelector, setShowRecurrenceSelector] = useState(false);
  const [isRecurring, setIsRecurring] = useState(true);

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

  const handleEmojiSelect = useCallback((emoji: { emoji: string }) => {
    setFormData((prev) => prev && { ...prev, icon: emoji.emoji });
    setShowEmojiKeyboard(false);
  }, []);

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

  // Recurrence handlers
  const handleRecurrenceChange = useCallback((recurrence: RecurrenceRule) => {
    setFormData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        recurrence,
      };
    });
  }, []);

  const handleRecurringToggle = useCallback((value: boolean) => {
    setIsRecurring(value);
    if (!value) {
      // Set to non-recurring (interval = 0)
      setFormData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          recurrence: {
            ...prev.recurrence,
            interval: 0,
          },
        };
      });
    } else {
      // Set to default recurring (every 1 day)
      setFormData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          recurrence: defaultRecurrence,
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

  // Get recurrence display text
  const recurrenceText = useMemo(() => {
    if (!formData) return '';
    if (formData.recurrence.interval === 0) {
      return t('Once');
    }
    return tRecurrenceText(formData.recurrence);
  }, [formData, tRecurrenceText, t]);

  // Initialize form data
  useEffect(() => {
    if (formData != null) return;

    if (isEditMode) {
      const editingTask = getTask(editTaskId);
      if (!editingTask) return; // TODO: handle error

      const newFormData: TaskFormData = {
        title: editingTask.title,
        icon: editingTask.icon,
        recurrence: editingTask.recurrence || defaultRecurrence,
        reminderTimeList: editingTask.reminders.map(({ id, reminderTime }) => ({
          id,
          reminderTime,
        })),
      };

      // Set recurring state based on interval
      setIsRecurring(newFormData.recurrence.interval > 0);
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
      <ScreenContainer isRoot={false} style={styles.screenContainer} scrollable>
        <ThemedView>
          <FormInput
            label={t('Title')}
            icon="text.justify.leading"
            value={formData?.title || ''}
            onChangeValue={handleInputChange('title')}
            placeholder={t('Add task title')}
          />
          <FormInput
            label={t('Icon')}
            icon="face.smiling"
            value={formData?.icon || ''}
            onPress={() => setShowEmojiKeyboard(true)}
            placeholder={t('Select icon')}
            readOnly
            rightIconName="chevron.up.chevron.down"
          />
          <EmojiPicker
            // TODO: auto select related emoji when user input
            open={showEmojiKeyboard}
            onEmojiSelected={handleEmojiSelect}
            onClose={() => setShowEmojiKeyboard(false)}
            enableSearchBar // TODO: if i18n is supported, this need to be localized
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
          {showTimePicker && <Divider />}
          {/* Recurrence Section */}
          <FormInput
            label={t('Repeat')}
            icon="repeat"
            value={recurrenceText}
            onPress={() => setShowRecurrenceSelector((prev) => !prev)}
            placeholder={t('Select recurrence')}
            rightIconName="chevron.up.chevron.down"
            divider={false}
            readOnly
          />
          {showRecurrenceSelector && formData && (
            <Fragment>
              <RecurrenceSelector
                recurrence={formData.recurrence}
                onChange={handleRecurrenceChange}
                isRecurring={isRecurring}
                onRecurringToggle={handleRecurringToggle}
                style={styles.recurrenceSelector}
              />
              <Divider style={styles.divider} />
            </Fragment>
          )}
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
  StyleRecord<'screenContainer' | 'deleteButton' | 'timePicker' | 'recurrenceSelector' | 'divider'>,
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
    marginTop: StaticTheme.spacing.md,
  },
  recurrenceSelector: {
    marginTop: StaticTheme.spacing.sm,
  },
  divider: {
    marginVertical: StaticTheme.spacing.sm,
  },
});
