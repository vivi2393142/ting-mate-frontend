import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Platform } from 'react-native';
import { Divider } from 'react-native-paper';
import EmojiPicker from 'rn-emoji-keyboard';

import { useCreateTask, useDeleteTask, useGetTask, useUpdateTask } from '@/api/tasks';
import useAppTheme from '@/hooks/useAppTheme';
import useRecurrenceText from '@/hooks/useRecurrenceText';
import { useUserTextSize } from '@/store/useUserStore';
import { StaticTheme } from '@/theme';
import { type RecurrenceRule, RecurrenceUnit, type TaskFormData } from '@/types/task';
import { UserTextSize } from '@/types/user';
import { createStyles, type StyleRecord } from '@/utils/createStyles';
import { autoFillInvalidTaskFormData, formatReminderTime } from '@/utils/taskUtils';

import FormInput from '@/components/atoms/FormInput';
import ScreenContainer from '@/components/atoms/ScreenContainer';
import Skeleton from '@/components/atoms/Skeleton';
import ThemedButton from '@/components/atoms/ThemedButton';
import ThemedView from '@/components/atoms/ThemedView';
import RecurrenceSelector from '@/components/screens/TaskForm/RecurrenceSelector';

const now = new Date();
const nextHour = now.getMinutes() === 0 ? now.getHours() : now.getHours() + 1;

// Default recurrence rule is 'Daily'
const defaultRecurrence: RecurrenceRule = {
  interval: 1,
  unit: RecurrenceUnit.DAY,
};

const defaultTaskFormData: TaskFormData = {
  title: '',
  icon: '✅',
  recurrence: defaultRecurrence,
  reminderTime: { hour: nextHour, minute: 0 },
};

const checkHasChanges = (initFormData: TaskFormData | null, formData: TaskFormData | null) => {
  if (!initFormData || !formData) return false;

  // Check basic fields
  if (initFormData.title !== formData.title || initFormData.icon !== formData.icon) return true;

  // Check recurrence (deep compare)
  const a = initFormData.recurrence;
  const b = formData.recurrence;
  if (!a && !b) return false; // If both are undefined (both non-recurring), no change
  if (!a || !b) return true; // One is recurring, one is non-recurring, changed
  // Both are recurring, compare details
  if (
    a.interval !== b.interval ||
    a.unit !== b.unit ||
    JSON.stringify(a.daysOfWeek ?? []) !== JSON.stringify(b.daysOfWeek ?? []) ||
    JSON.stringify(a.daysOfMonth ?? []) !== JSON.stringify(b.daysOfMonth ?? [])
  ) {
    return true;
  }

  // Check reminder time
  const initReminder = initFormData.reminderTime;
  const currentReminder = formData.reminderTime;
  const hasReminderChanged =
    initReminder.hour !== currentReminder.hour || initReminder.minute !== currentReminder.minute;
  return hasReminderChanged;
};

const TaskForm = () => {
  const { t } = useTranslation('taskForm');
  const { t: tCommon } = useTranslation('common');
  const { tRecurrenceText } = useRecurrenceText();

  const router = useRouter();
  const params = useLocalSearchParams();
  const userTextSize = useUserTextSize();

  const theme = useAppTheme();
  const styleParams = useMemo(() => ({ userTextSize }), [userTextSize]);
  const styles = getStyles(theme, styleParams);

  const isEditMode = params.id !== undefined;
  const editTaskId = params.id as string;

  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const { data: editingTask, isLoading: isLoadingTask } = useGetTask(editTaskId, {
    enabled: isEditMode,
  });

  const [initFormData, setInitFormData] = useState<TaskFormData | null>(null);
  const [formData, setFormData] = useState<TaskFormData | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showEmojiKeyboard, setShowEmojiKeyboard] = useState(false);
  const [showRecurrenceSelector, setShowRecurrenceSelector] = useState(false);

  const reminderDate = useMemo(() => {
    if (!formData?.reminderTime) return dayjs().toDate();
    return dayjs()
      .hour(formData.reminderTime.hour)
      .minute(formData.reminderTime.minute)
      .second(0)
      .millisecond(0)
      .toDate();
  }, [formData?.reminderTime]);

  const handleTitleChange = useCallback((value: string) => {
    setFormData((prev) => prev && { ...prev, title: value });
  }, []);

  const handleOpenEmojiKeyboard = useCallback(() => {
    setShowEmojiKeyboard(true);
  }, []);

  const handleCloseEmojiKeyboard = useCallback(() => {
    setShowEmojiKeyboard(false);
  }, []);

  const handleEmojiSelect = useCallback((emoji: { emoji: string }) => {
    setFormData((prev) => prev && { ...prev, icon: emoji.emoji });
    setShowEmojiKeyboard(false);
  }, []);

  const handleToggleTimePicker = useCallback(() => {
    setShowTimePicker((prev) => !prev);
  }, []);

  const handleTimeChange = useCallback((_: DateTimePickerEvent, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (!selectedDate) return;
    setFormData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        reminderTime: {
          hour: selectedDate.getHours(),
          minute: selectedDate.getMinutes(),
        },
      };
    });
  }, []);

  // Recurrence handlers
  const handleToggleRecurrenceSelector = useCallback(() => {
    setShowRecurrenceSelector((prev) => !prev);
  }, []);

  const handleRecurrenceChange = useCallback((recurrence?: RecurrenceRule) => {
    setFormData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        recurrence,
      };
    });
  }, []);

  const handleRecurringToggle = useCallback((recurrence?: RecurrenceRule) => {
    setFormData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        recurrence: recurrence ? undefined : defaultRecurrence,
      };
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!formData) return;
    const validFormData = autoFillInvalidTaskFormData(formData);

    if (isEditMode) {
      updateTaskMutation.mutate(
        {
          taskId: editTaskId,
          updates: validFormData,
        },
        {
          onSuccess: () => {
            router.back();
            // TODO: notification - update too many notifications cause performance issue, change it to update only the changed task
            // await NotificationService.reinitializeAllLocalNotifications(updatedTasks);
          },
          onError: () => {
            Alert.alert('Error', t('Failed to update task. Please try again.'));
          },
        },
      );
    } else {
      createTaskMutation.mutate(validFormData, {
        onSuccess: () => {
          router.back();
          // TODO: notification - update too many notifications cause performance issue, change it to update only the changed task
          // await NotificationService.reinitializeAllLocalNotifications(updatedTasks);
        },
        onError: () => {
          Alert.alert('Error', t('Failed to create task. Please try again.'));
        },
      });
    }
  }, [formData, isEditMode, editTaskId, createTaskMutation, updateTaskMutation, router, t]);

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

  const handleDeleteTask = useCallback(async () => {
    Alert.alert(t('Delete Task'), t('Are you sure you want to delete this task?'), [
      {
        text: t('Cancel'),
        style: 'cancel',
      },
      {
        text: t('Delete'),
        style: 'destructive',
        onPress: async () => {
          deleteTaskMutation.mutate(editTaskId, {
            onSuccess: () => {
              // TODO: notification - update too many notifications cause performance issue, change it to update only the changed task
              // Reinitialize all next notifications after task deletion
              // const updatedTasks = getTasks();
              // await NotificationService.reinitializeAllLocalNotifications(updatedTasks);

              router.back();
            },
            onError: () => {
              Alert.alert('Error', t('Failed to delete task. Please try again.'));
            },
          });
        },
      },
    ]);
  }, [editTaskId, router, t, deleteTaskMutation]);

  // Get recurrence display text
  const recurrenceText = useMemo(() => {
    if (!formData) return '';
    if (!formData.recurrence) return t('Once');
    return tRecurrenceText(formData.recurrence);
  }, [formData, tRecurrenceText, t]);

  // Initialize form data
  useEffect(() => {
    if (formData != null) return;

    if (isEditMode) {
      if (isLoadingTask) return; // Wait for task to load
      if (!editingTask) return; // TODO: handle error

      const newFormData: TaskFormData = {
        title: editingTask.title,
        icon: editingTask.icon,
        recurrence: editingTask.recurrence,
        reminderTime: editingTask.reminderTime,
      };
      setInitFormData(newFormData);
      setFormData(newFormData);
    } else {
      setInitFormData(defaultTaskFormData);
      setFormData(defaultTaskFormData);
    }
  }, [formData, editTaskId, isEditMode, editingTask, isLoadingTask]);

  // Show loading indicator when fetching task data in edit mode
  if (isEditMode && isLoadingTask) {
    return (
      <Fragment>
        <Stack.Screen
          options={{
            title: t('Edit Task'),
            headerLeft: () => (
              <Button color={theme.colors.primary} onPress={handleCancel} title={t('Cancel')} />
            ),
          }}
        />
        <ScreenContainer isRoot={false} style={styles.screenContainer} scrollable>
          <ThemedView style={styles.loadingContainer}>
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} width={'100%'} height={40} />
            ))}
          </ThemedView>
        </ScreenContainer>
      </Fragment>
    );
  }

  // TODO: Show Skeleton when loading (globally)
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
              title={isEditMode ? tCommon('Save') : tCommon('Done')}
            />
          ),
        }}
      />
      <ScreenContainer isRoot={false} style={styles.screenContainer} scrollable>
        <ThemedView>
          <FormInput
            label={t('Title')}
            icon="text.justify.leading"
            placeholder={t('Add task title')}
            value={formData?.title || ''}
            onChangeValue={handleTitleChange}
          />
          <FormInput
            label={t('Icon')}
            icon="face.smiling"
            value={formData?.icon || ''}
            onPress={handleOpenEmojiKeyboard}
            placeholder={t('Select icon')}
            rightIconName="chevron.up.chevron.down"
          />
          <EmojiPicker
            // TODO: auto select related emoji when user input
            open={showEmojiKeyboard}
            onEmojiSelected={handleEmojiSelect}
            onClose={handleCloseEmojiKeyboard}
            enableSearchBar // TODO: if i18n is supported, this need to be localized
          />
          <FormInput
            label={t('Time')}
            icon="clock"
            rightIconName="chevron.up.chevron.down"
            placeholder={t('Select time')}
            value={formData?.reminderTime ? formatReminderTime(formData.reminderTime) : ''}
            valueColor={theme.colors.onSurfaceVariant}
            onPress={handleToggleTimePicker}
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
            rightIconName="chevron.up.chevron.down"
            placeholder={t('Select recurrence')}
            divider={false}
            value={recurrenceText}
            valueColor={theme.colors.onSurfaceVariant}
            onPress={handleToggleRecurrenceSelector}
          />
          {showRecurrenceSelector && formData && (
            <Fragment>
              <RecurrenceSelector
                recurrence={formData.recurrence}
                onChange={handleRecurrenceChange}
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
  StyleRecord<
    | 'screenContainer'
    | 'deleteButton'
    | 'timePicker'
    | 'recurrenceSelector'
    | 'divider'
    | 'loadingContainer'
  >,
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
    marginVertical: StaticTheme.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    gap: StaticTheme.spacing.sm,
    marginTop: StaticTheme.spacing.md,
  },
});
