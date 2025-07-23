import { Stack, useRouter } from 'expo-router';
import { Fragment, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Alert, Button, View } from 'react-native';
import { Divider, Switch } from 'react-native-paper';

import { useUpdateUserSettings } from '@/api/user';
import ROUTES from '@/constants/routes';
import useAppTheme from '@/hooks/useAppTheme';
import useStackScreenOptionsHelper from '@/hooks/useStackScreenOptionsHelper';
import useUserStore from '@/store/useUserStore';
import { StaticTheme } from '@/theme';
import { Role } from '@/types/user';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

import FormInput from '@/components/atoms/FormInput';
import ScreenContainer from '@/components/atoms/ScreenContainer';
import Select from '@/components/atoms/Select';
import ThemedView from '@/components/atoms/ThemedView';

const DEFAULT_DELAY_MINUTE = 30;

const EditNotification = () => {
  const { t } = useTranslation('settings');
  const { t: tCommon } = useTranslation('common');
  const getStackScreenOptions = useStackScreenOptionsHelper();

  const theme = useAppTheme();
  const styles = getStyles(theme);

  const user = useUserStore((s) => s.user);
  const reminder = user?.settings?.reminder;

  const router = useRouter();
  const updateUserSettingsMutation = useUpdateUserSettings();

  const [taskReminder, setTaskReminder] = useState<boolean>(reminder?.taskReminder || false);
  const [overdueReminderEnabled, setOverdueReminderEnabled] = useState<boolean>(
    reminder?.overdueReminder?.enabled || false,
  );
  const [overdueReminderDelayMinutes, setOverdueReminderDelayMinutes] = useState<number>(
    reminder?.overdueReminder?.delayMinutes || DEFAULT_DELAY_MINUTE,
  );
  const [overdueReminderRepeat, setOverdueReminderRepeat] = useState<boolean>(
    reminder?.overdueReminder?.repeat || false,
  );
  const [safeZoneExitReminder, setSafeZoneExitReminder] = useState<boolean>(
    reminder?.safeZoneExitReminder || false,
  );
  const [taskCompletionNotification, setTaskCompletionNotification] = useState<boolean>(
    reminder?.taskCompletionNotification || false,
  );
  const [taskChangeNotification, setTaskChangeNotification] = useState<boolean>(
    reminder?.taskChangeNotification || false,
  );

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(() => {
    if (!user) return;

    setIsSaving(true);
    updateUserSettingsMutation.mutate(
      {
        reminder: {
          taskReminder,
          overdueReminder: {
            enabled: overdueReminderEnabled,
            delayMinutes: overdueReminderDelayMinutes,
            repeat: overdueReminderRepeat,
          },
          safeZoneExitReminder,
          taskCompletionNotification,
          taskChangeNotification,
        },
      },
      {
        onSuccess: () => {
          router.back();
        },
        onError: () => {
          Alert.alert(
            tCommon('Error'),
            t('Failed to update notification settings. Please try again.'),
          );
        },
        onSettled: () => {
          setIsSaving(false);
        },
      },
    );
  }, [
    user,
    updateUserSettingsMutation,
    taskReminder,
    overdueReminderEnabled,
    overdueReminderDelayMinutes,
    overdueReminderRepeat,
    safeZoneExitReminder,
    taskCompletionNotification,
    taskChangeNotification,
    router,
    tCommon,
    t,
  ]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const handleDelayMinutesSelect = useCallback(({ value }: { value: number }) => {
    setOverdueReminderDelayMinutes(value);
  }, []);

  const delayMinutesOptions = useMemo(
    () => [
      { value: 15, title: t('15 minutes') },
      { value: 30, title: t('30 minutes') },
      { value: 60, title: t('1 hour') },
    ],
    [t],
  );

  const displayDelayMinutes = useMemo(() => {
    const target = delayMinutesOptions.find(
      (option) => option.value === overdueReminderDelayMinutes,
    );
    return target?.title || overdueReminderDelayMinutes;
  }, [delayMinutesOptions, overdueReminderDelayMinutes]);

  return (
    <Fragment>
      <Stack.Screen
        options={{
          ...getStackScreenOptions({ title: ROUTES.EDIT_NOTIFICATION }),
          headerLeft: () => (
            <Button color={theme.colors.primary} onPress={handleCancel} title={tCommon('Cancel')} />
          ),
          headerRight: () => (
            <Button
              color={theme.colors.primary}
              onPress={handleSave}
              title={tCommon('Save')}
              disabled={isSaving}
            />
          ),
        }}
      />
      <ScreenContainer isRoot={false} style={styles.screenContainer}>
        <ThemedView>
          <FormInput
            valueAlign="right"
            rightIconName="chevron.right"
            dense={false}
            label={t('Task Reminder')}
            helperText={t("Notify when it's time to do a task.")}
            render={() => <Switch value={taskReminder} onValueChange={setTaskReminder} />}
          />
          <FormInput
            valueAlign="right"
            rightIconName="chevron.right"
            dense={false}
            label={t('Overdue Reminder')}
            helperText={t('Notify again if a task is not done on time.')}
            render={() => (
              <Switch value={overdueReminderEnabled} onValueChange={setOverdueReminderEnabled} />
            )}
            divider={!overdueReminderEnabled}
          />
          {overdueReminderEnabled && (
            <Fragment>
              <View style={{ paddingLeft: StaticTheme.spacing.lg }}>
                <Divider />
                <FormInput
                  valueAlign="right"
                  rightIconName="chevron.up.chevron.down"
                  dense={false}
                  label={t('Notify Me After')}
                  render={() => (
                    <Select
                      displayValue={displayDelayMinutes}
                      options={delayMinutesOptions}
                      onSelect={handleDelayMinutesSelect}
                    />
                  )}
                />
                <FormInput
                  valueAlign="right"
                  rightIconName="chevron.up.chevron.down"
                  dense={false}
                  label={t('Repeat Until Done')}
                  render={() => (
                    <Switch
                      value={overdueReminderRepeat}
                      onValueChange={setOverdueReminderRepeat}
                    />
                  )}
                  divider={false}
                />
              </View>
              <Divider />
            </Fragment>
          )}
          {user?.settings?.linked?.length && (
            <Fragment>
              <FormInput
                valueAlign="right"
                rightIconName="chevron.right"
                dense={false}
                label={t('Task Completion')}
                helperText={t('Notify when someone finishes a task.')}
                render={() => (
                  <Switch
                    value={taskCompletionNotification}
                    onValueChange={setTaskCompletionNotification}
                  />
                )}
              />
              <FormInput
                valueAlign="right"
                rightIconName="chevron.right"
                dense={false}
                label={t('Task Changes')}
                helperText={t('Notify when tasks are created, edited or deleted.')}
                render={() => (
                  <Switch
                    value={taskChangeNotification}
                    onValueChange={setTaskChangeNotification}
                  />
                )}
              />
              {user?.role === Role.CAREGIVER && (
                <FormInput
                  valueAlign="right"
                  rightIconName="chevron.right"
                  dense={false}
                  label={t('Safe Zone Alert')}
                  helperText={t(
                    "Notify when your companion leaves the safe zone. They'll need to enable location in 'Connect'.",
                  )}
                  render={() => (
                    <Switch value={safeZoneExitReminder} onValueChange={setSafeZoneExitReminder} />
                  )}
                />
              )}
            </Fragment>
          )}
        </ThemedView>
      </ScreenContainer>
    </Fragment>
  );
};

const getStyles = createStyles<StyleRecord<'screenContainer'>>({
  screenContainer: {
    gap: StaticTheme.spacing.md,
    paddingTop: StaticTheme.spacing.md,
  },
});

export default EditNotification;
