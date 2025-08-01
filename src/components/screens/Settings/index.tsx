import { useRouter } from 'expo-router';
import { useCallback, useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { walkthroughable } from 'react-native-copilot';

import { Alert, View } from 'react-native';
import { List, Switch, TouchableRipple } from 'react-native-paper';

import { useLogout } from '@/api/auth';
import { useUpdateUserSettings } from '@/api/user';
import ROUTES from '@/constants/routes';
import useAppTheme from '@/hooks/useAppTheme';
import { useCopilotOnboarding } from '@/hooks/useCopilotOnboarding';
import useUserDisplayModeTranslation from '@/hooks/useUserDisplayModeTranslation';
import useUserTextSizeTranslation from '@/hooks/useUserTextSizeTranslation';
import useAuthStore from '@/store/useAuthStore';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import useUserStore from '@/store/useUserStore';
import { StaticTheme } from '@/theme';
import { Role, UserDisplayMode, UserTextSize } from '@/types/user';
import { createStyles, StyleRecord } from '@/utils/createStyles';

import FormInput from '@/components/atoms/FormInput';
import ScreenContainer from '@/components/atoms/ScreenContainer';
import Select from '@/components/atoms/Select';
import ThemedText from '@/components/atoms/ThemedText';
import CopilotProvider from '@/components/providers/CopilotProvider';
import SettingsCopilotStep, { CopilotStepName } from '@/components/screens/Settings/CopilotStep';

const CopilotView = walkthroughable(View);
const CopilotListItem = walkthroughable(List.Item);

interface SectionGroupProps {
  title: string;
  children: ReactNode;
  style?: object;
  subheaderStyle?: object;
}

const SectionGroup = ({ title, children, style, subheaderStyle }: SectionGroupProps) => (
  <List.Section style={style}>
    <List.Subheader style={subheaderStyle}>{title}</List.Subheader>
    {children}
  </List.Section>
);

const SettingsScreen = () => {
  const { t } = useTranslation('settings');
  const { t: tCommon } = useTranslation('common');

  const { tUserTextSize } = useUserTextSizeTranslation();
  const { tUserDisplayMode } = useUserDisplayModeTranslation();

  const token = useAuthStore((s) => s.token);
  const user = useUserStore((s) => s.user);

  const updateUserSettingsMutation = useUpdateUserSettings();

  const router = useRouter();
  const logoutMutation = useLogout();

  const theme = useAppTheme();
  const styles = getStyles(theme, { user });

  const textSizeOptions = useMemo(
    () =>
      Object.values(UserTextSize).map((value) => ({
        value,
        title: tUserTextSize(value),
      })),
    [tUserTextSize],
  );

  const displayModeOptions = useMemo(
    () =>
      Object.values(UserDisplayMode).map((value) => ({
        value,
        title: tUserDisplayMode(value),
      })),
    [tUserDisplayMode],
  );

  const handleTextSizeSelect = useCallback(
    ({ value }: { value: UserTextSize }) => {
      updateUserSettingsMutation.mutate({ textSize: value });
    },
    [updateUserSettingsMutation],
  );

  const handleDisplayModeSelect = useCallback(
    ({ value }: { value: UserDisplayMode }) => {
      updateUserSettingsMutation.mutate({ displayMode: value });
    },
    [updateUserSettingsMutation],
  );

  const handleNotificationPress = useCallback(() => {
    router.push({
      pathname: ROUTES.EDIT_NOTIFICATION,
      params: { from: ROUTES.SETTINGS },
    });
  }, [router]);

  const isAllowLocationSharing = useMemo(() => {
    if (!user || user.role !== Role.CARERECEIVER) return false;
    if (!token) return false;
    return user.settings.allowShareLocation;
  }, [user, token]);

  const handleLocationSharingPress = useCallback(
    (newAllowShareLocation: boolean) => {
      if (!user || user.role !== Role.CARERECEIVER) return;

      if (!token) {
        Alert.alert(t('Sign In Required'), t('Please sign in to use this feature.'));
      } else if (user.settings.linked.length > 0) {
        if (newAllowShareLocation) {
          Alert.alert(
            t('Share Location?'),
            t('Turn this on to let your mates see where you are.'),
            [
              {
                text: tCommon('Cancel'),
                style: 'cancel',
              },
              {
                text: tCommon('Confirm'),
                style: 'destructive',
                onPress: () => {
                  updateUserSettingsMutation.mutate({
                    allowShareLocation: newAllowShareLocation,
                  });
                },
              },
            ],
          );
        } else {
          Alert.alert(
            t('Stop Sharing Location?'),
            t('If you turn this off, your mates won’t be able to see where you are.'),
            [
              {
                text: tCommon('Cancel'),
                style: 'cancel',
              },
              {
                text: tCommon('Confirm'),
                style: 'destructive',
                onPress: () => {
                  updateUserSettingsMutation.mutate({
                    allowShareLocation: newAllowShareLocation,
                  });
                },
              },
            ],
          );
        }
      } else {
        Alert.alert(t('Location Sharing'), t('Connect with a mate first to share your location.'), [
          {
            text: tCommon('Cancel'),
            style: 'cancel',
          },
        ]);
      }
    },
    [t, tCommon, token, updateUserSettingsMutation, user],
  );

  const handleNamePress = useCallback(() => {
    router.push({
      pathname: ROUTES.EDIT_NAME,
      params: { from: ROUTES.SETTINGS },
    });
  }, [router]);

  const handleAccountAction = useCallback(() => {
    router.push({
      pathname: ROUTES.LOGIN,
      params: { from: ROUTES.SETTINGS },
    });
  }, [router]);

  const handleLogout = useCallback(() => {
    Alert.alert(t('Logout'), t('Are you sure you want to logout?'), [
      {
        text: tCommon('Cancel'),
        style: 'cancel',
      },
      {
        text: tCommon('Confirm'),
        style: 'destructive',
        onPress: () => {
          logoutMutation();
          router.push({
            pathname: ROUTES.LOGIN,
            params: { from: ROUTES.SETTINGS },
          });
        },
      },
    ]);
  }, [logoutMutation, router, t, tCommon]);

  const handleAccountLinkingPress = useCallback(() => {
    router.push({ pathname: ROUTES.ACCOUNT_LINKING, params: { from: ROUTES.SETTINGS } });
  }, [router]);

  const displayNotification = useMemo(() => {
    const reminder = user?.settings?.reminder;
    if (!reminder) return t('Off');

    const hasLinked = !!user?.settings?.linked?.length;

    let requiredCount = 2;
    if (hasLinked) requiredCount += 2;
    if (user.role === Role.CAREGIVER && hasLinked) requiredCount++;

    let count = 0;
    if (reminder.taskReminder) count++;
    if (reminder.overdueReminder.enabled) count++;
    if (reminder.safeZoneExitReminder) count++;
    if (reminder.taskCompletionNotification) count++;
    if (reminder.taskChangeNotification) count++;

    if (count >= requiredCount) return t('All');
    if (count === 0) return t('Off');
    return t('Partial');
  }, [t, user]);

  // Handle copilot
  const hasSeenOnboarding = useOnboardingStore((s) => s.hasSeenOnboarding);
  const hasVisitedSettings = useOnboardingStore((s) => s.hasVisitedSettings);

  useCopilotOnboarding({
    shouldShowCopilot: hasSeenOnboarding && !hasVisitedSettings,
    onStop: () => {
      useOnboardingStore.getState().setHasVisitedSettings(true);
    },
  });

  // TODO: Adjust layout for Large mode
  return (
    <ScreenContainer scrollable>
      <SectionGroup title={t('General')} subheaderStyle={styles.subheader}>
        <SettingsCopilotStep name={CopilotStepName.DISPLAY}>
          <CopilotView>
            <FormInput
              valueAlign="right"
              rightIconName="chevron.up.chevron.down"
              dense={false}
              label={t('Text Size')}
              render={() => (
                <Select
                  displayValue={tUserTextSize(user?.settings.textSize ?? UserTextSize.STANDARD)}
                  options={textSizeOptions}
                  onSelect={handleTextSizeSelect}
                />
              )}
            />
            <FormInput
              valueAlign="right"
              rightIconName="chevron.up.chevron.down"
              dense={false}
              divider={false}
              label={t('Display Mode')}
              render={() => (
                <Select
                  displayValue={tUserDisplayMode(
                    user?.settings.displayMode ?? UserDisplayMode.FULL,
                  )}
                  options={displayModeOptions}
                  onSelect={handleDisplayModeSelect}
                />
              )}
            />
          </CopilotView>
        </SettingsCopilotStep>
      </SectionGroup>
      <SectionGroup title={t('Notification')} subheaderStyle={styles.subheader}>
        <FormInput
          valueAlign="right"
          rightIconName="chevron.right"
          dense={false}
          label={t('Notification')}
          value={displayNotification}
          valueColor={theme.colors.primary}
          onPress={handleNotificationPress}
        />
      </SectionGroup>
      <SectionGroup title={t('Connect')} subheaderStyle={styles.subheader}>
        <View style={styles.connectHint}>
          <ThemedText variant="bodyMedium" color="outline" style={styles.connectHintText}>
            {t('No mates yet? Tap ')}
          </ThemedText>
          <TouchableRipple onPress={handleAccountLinkingPress}>
            <ThemedText variant="bodyMedium" color="primary" style={styles.connectHintText}>
              {t('here')}
            </ThemedText>
          </TouchableRipple>
          <ThemedText variant="bodyMedium" color="outline" style={styles.connectHintText}>
            {t(' to get started.')}
          </ThemedText>
        </View>
        <SettingsCopilotStep name={CopilotStepName.LINK_ACCOUNT}>
          <CopilotView>
            <FormInput
              valueAlign="right"
              rightIconName="chevron.right"
              dense={false}
              label={t('Mates')}
              value={user?.settings.linked?.length ? t('Connected') : '---'}
              valueColor={theme.colors.primary}
              onPress={handleAccountLinkingPress}
            />
          </CopilotView>
        </SettingsCopilotStep>
        {user?.role === Role.CARERECEIVER && (
          <FormInput
            valueAlign="right"
            rightIconName="chevron.right"
            dense={false}
            label={t('Allow Location Sharing')}
            render={() => (
              <Switch value={isAllowLocationSharing} onValueChange={handleLocationSharingPress} />
            )}
          />
        )}
      </SectionGroup>
      <SectionGroup title={t('Account')} subheaderStyle={styles.subheader}>
        <FormInput
          valueAlign="right"
          rightIconName="chevron.right"
          dense={false}
          label={t('Name')}
          value={user?.settings.name || '---'}
          valueColor={theme.colors.primary}
          onPress={handleNamePress}
        />
        {!token && (
          <SettingsCopilotStep name={CopilotStepName.LOGIN} active={!token}>
            <CopilotListItem
              title={tCommon('Login / Sign Up')}
              style={styles.buttonItem}
              containerStyle={styles.buttonContainer}
              contentStyle={styles.buttonContent}
              titleStyle={styles.signInText}
              onPress={handleAccountAction}
            />
          </SettingsCopilotStep>
        )}
        {token && (
          <List.Item
            title={t('Logout')}
            style={styles.buttonItem}
            containerStyle={styles.buttonContainer}
            contentStyle={styles.buttonContent}
            titleStyle={styles.logoutText}
            onPress={handleLogout}
          />
        )}
      </SectionGroup>
    </ScreenContainer>
  );
};

const SettingsScreenWithCopilot = () => (
  <CopilotProvider>
    <SettingsScreen />
  </CopilotProvider>
);

export default SettingsScreenWithCopilot;

const getStyles = createStyles<
  StyleRecord<
    'buttonItem' | 'buttonContainer' | 'buttonContent' | 'connectHint',
    'subheader' | 'signInText' | 'logoutText' | 'connectHintText'
  >
>({
  subheader: {
    color: ({ colors }) => colors.outline,
    textTransform: 'uppercase',
    paddingTop: StaticTheme.spacing.sm,
    paddingVertical: StaticTheme.spacing.xs,
    paddingHorizontal: 0,
  },
  buttonItem: {
    paddingVertical: StaticTheme.spacing.xs * 1.5,
  },
  buttonContainer: {
    marginVertical: 0,
  },
  buttonContent: {
    paddingLeft: 0,
    minHeight: 28,
  },
  signInText: {
    color: ({ colors }) => colors.primary,
    fontSize: ({ fonts }) => fonts.bodyLarge.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyLarge.fontWeight,
  },
  logoutText: {
    color: ({ colors }) => colors.error,
    fontSize: ({ fonts }) => fonts.bodyLarge.fontSize,
    fontWeight: ({ fonts }) => fonts.bodyLarge.fontWeight,
  },
  connectHint: {
    flexDirection: 'row',
    paddingBottom: StaticTheme.spacing.sm,
  },
  connectHintText: {
    fontStyle: 'italic',
  },
});
