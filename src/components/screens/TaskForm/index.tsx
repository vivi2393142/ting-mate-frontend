import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import useAppTheme from '@/hooks/useAppTheme';
import { useUserTextSize } from '@/store/useUserStore';
import { StaticTheme } from '@/theme';
import { UserTextSize } from '@/types/user';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

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

  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    icon: '📝',
    recurrence: {
      frequency: RecurrenceFrequency.DAILY,
    },
    reminderTimeList: [],
  });

  const handleInputChange = (field: keyof TaskFormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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

  return (
    <ScreenContainer isRoot={false} style={styles.container}>
      <ThemedView>
        <FormInput
          label={t('Title')}
          icon="text.justify.leading"
          value={formData.title}
          onChangeValue={handleInputChange('title')}
        />
        {/* TODO: add selects for the following inputs */}
        <FormInput
          label={t('Icon')}
          icon="face.smiling"
          value={formData.icon}
          onChangeValue={handleInputChange('icon')}
        />
        <FormInput
          label={t('Time')}
          icon="clock"
          value={
            formData.reminderTimeList?.[0] ? formatReminderTime(formData.reminderTimeList[0]) : ''
          }
          onChangeValue={handleInputChange('reminderTimeList')}
        />
        <FormInput
          label={t('Repeat')}
          icon="repeat"
          value={formData.recurrence.frequency}
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
  );
};

export default TaskForm;

interface StyleParams {
  userTextSize: UserTextSize;
}

const getStyles = createStyles<StyleRecord<'buttonContainer' | 'container'>, StyleParams>({
  container: {
    gap: StaticTheme.spacing.md,
    paddingTop: StaticTheme.spacing.md,
  },
  buttonContainer: {
    backgroundColor: 'transparent',
    gap: StaticTheme.spacing.sm * 1.5,
    marginTop: StaticTheme.spacing.xs,
  },
});
