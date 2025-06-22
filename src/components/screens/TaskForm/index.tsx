import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Text, TextInput } from 'react-native-paper';

import useAppTheme from '@/hooks/useAppTheme';
import { useUserTextSize } from '@/store/useUserStore';
import { StaticTheme } from '@/theme';
import { UserTextSize } from '@/types/user';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

import IconSymbol from '@/components/atoms/IconSymbol';
import ScreenContainer from '@/components/atoms/ScreenContainer';
import ThemedView from '@/components/atoms/ThemedView';

interface TaskFormData {
  title: string;
  icon: string;
  hour: string;
  minute: string;
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
  const taskId = params.id as string;

  const [formData, setFormData] = useState<TaskFormData>({
    title: (params.title as string) || '',
    icon: (params.icon as string) || '📝',
    hour: (params.hour as string) || '12',
    minute: (params.minute as string) || '00',
  });

  const handleInputChange = (field: keyof TaskFormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = useCallback(() => {
    // TODO: Save task to backend
    console.log('Saving task:', { id: taskId, ...formData });

    // Navigate back to home
    router.back();
  }, [formData, taskId, router]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const isFormValid =
    formData.title.trim().length > 0 &&
    formData.icon.trim().length > 0 &&
    parseInt(formData.hour) >= 0 &&
    parseInt(formData.hour) <= 23 &&
    parseInt(formData.minute) >= 0 &&
    parseInt(formData.minute) <= 59;

  return (
    <ScreenContainer style={styles.container}>
      <Text variant="headlineSmall" style={styles.headline}>
        {isEditMode ? t('Edit Task') : t('Add Task')}
      </Text>

      <ThemedView style={styles.form}>
        <TextInput
          label={t('Task Title')}
          value={formData.title}
          onChangeText={handleInputChange('title')}
          style={styles.input}
          mode="outlined"
        />

        <TextInput
          label={t('Icon')}
          value={formData.icon}
          onChangeText={handleInputChange('icon')}
          style={styles.input}
          mode="outlined"
          placeholder="📝"
        />

        <ThemedView style={styles.timeContainer}>
          <TextInput
            label={t('Hour')}
            value={formData.hour}
            onChangeText={handleInputChange('hour')}
            style={styles.timeInput}
            mode="outlined"
            keyboardType="numeric"
            maxLength={2}
          />
          <Text style={styles.timeSeparator}>:</Text>
          <TextInput
            label={t('Minute')}
            value={formData.minute}
            onChangeText={handleInputChange('minute')}
            style={styles.timeInput}
            mode="outlined"
            keyboardType="numeric"
            maxLength={2}
          />
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={handleCancel}
          style={styles.button}
          labelStyle={styles.buttonLabel}
        >
          {t('Cancel')}
        </Button>
        <Button
          mode="contained"
          onPress={handleSave}
          disabled={!isFormValid}
          style={styles.button}
          labelStyle={styles.buttonLabel}
          icon={({ color }) => <IconSymbol name="checkmark" color={color} size={16} />}
        >
          {t('Save')}
        </Button>
      </ThemedView>
    </ScreenContainer>
  );
};

export default TaskForm;

interface StyleParams {
  userTextSize: UserTextSize;
}

const getStyles = createStyles<
  StyleRecord<
    'button' | 'buttonContainer' | 'container' | 'form' | 'timeContainer',
    'headline' | 'buttonLabel' | 'input' | 'timeInput' | 'timeSeparator'
  >,
  StyleParams
>({
  button: {
    borderRadius: StaticTheme.borderRadius.s,
    flex: 1,
  },
  buttonContainer: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    gap: StaticTheme.spacing.md,
  },
  buttonLabel: {
    fontSize: ({ fonts }) => fonts.titleMedium.fontSize,
    fontWeight: ({ fonts }) => fonts.titleMedium.fontWeight,
    marginVertical: (_, { userTextSize }) =>
      userTextSize === UserTextSize.LARGE ? StaticTheme.spacing.xs * 5 : StaticTheme.spacing.md,
  },
  container: {
    gap: StaticTheme.spacing.md,
  },
  form: {
    backgroundColor: 'transparent',
    gap: StaticTheme.spacing.md,
  },
  headline: {
    paddingVertical: StaticTheme.spacing.xs,
  },
  input: {
    fontSize: ({ fonts }) => fonts.bodyLarge.fontSize,
  },
  timeContainer: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    gap: StaticTheme.spacing.sm,
  },
  timeInput: {
    flex: 1,
    fontSize: ({ fonts }) => fonts.bodyLarge.fontSize,
  },
  timeSeparator: {
    fontSize: ({ fonts }) => fonts.headlineMedium.fontSize,
    fontWeight: ({ fonts }) => fonts.headlineMedium.fontWeight,
  },
});
