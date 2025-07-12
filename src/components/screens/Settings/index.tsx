import { useRouter } from 'expo-router';
import { useCallback, useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Alert } from 'react-native';
import { List } from 'react-native-paper';

import { useLogout } from '@/api/auth';
import { useUpdateUserSettings } from '@/api/user';
import ROUTES from '@/constants/routes';
import useAppTheme from '@/hooks/useAppTheme';
import useRoleTranslation from '@/hooks/useRoleTranslation';
import useUserDisplayModeTranslation from '@/hooks/useUserDisplayModeTranslation';
import useUserTextSizeTranslation from '@/hooks/useUserTextSizeTranslation';
import useUserStore from '@/store/useUserStore';
import { StaticTheme } from '@/theme';
import { Role, UserDisplayMode, UserTextSize } from '@/types/user';
import { createStyles, StyleRecord } from '@/utils/createStyles';

import FormInput from '@/components/atoms/FormInput';
import ScreenContainer from '@/components/atoms/ScreenContainer';
import Select from '@/components/atoms/Select';

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
  const { tRole } = useRoleTranslation();

  const token = useUserStore((state) => state.token);
  const userState = useUserStore((state) => state.user);

  const updateUserSettingsMutation = useUpdateUserSettings();

  const router = useRouter();
  const logoutMutation = useLogout();

  const theme = useAppTheme();
  const styles = getStyles(theme, { userState });

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

  const handleRolePress = useCallback(() => {
    router.push({
      pathname: ROUTES.ROLE_SELECTION,
      params: { from: 'settings' },
    });
  }, [router]);

  const handleNamePress = useCallback(() => {
    router.push(ROUTES.EDIT_NAME);
  }, [router]);

  const handleAccountAction = useCallback(() => {
    router.push(ROUTES.LOGIN);
  }, [router]);

  const handleLogout = useCallback(() => {
    Alert.alert(t('Logout'), t('Are you sure you want to logout?'), [
      {
        text: tCommon('Confirm'),
        style: 'cancel',
        onPress: () => {
          logoutMutation();
          router.push(ROUTES.LOGIN);
        },
      },
      {
        text: tCommon('Cancel'),
        style: 'destructive',
      },
    ]);
  }, [logoutMutation, router, t, tCommon]);

  const handleAccountLinkingPress = useCallback(() => {
    router.push({ pathname: ROUTES.ACCOUNT_LINKING });
  }, [router]);

  // TODO: Add a section for reminder settings
  // TODO: Adjust layout for Large mode
  return (
    <ScreenContainer scrollable>
      <SectionGroup title={t('General')} subheaderStyle={styles.subheader}>
        <FormInput
          valueAlign="right"
          rightIconName="chevron.up.chevron.down"
          dense={false}
          label={t('Text Size')}
          render={() => (
            <Select
              displayValue={tUserTextSize(userState?.settings.textSize ?? UserTextSize.STANDARD)}
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
                userState?.settings.displayMode ?? UserDisplayMode.FULL,
              )}
              options={displayModeOptions}
              onSelect={handleDisplayModeSelect}
            />
          )}
        />
      </SectionGroup>
      <SectionGroup
        title={t('Account')}
        style={styles.sectionGroup}
        subheaderStyle={styles.subheader}
      >
        <FormInput
          valueAlign="right"
          rightIconName="chevron.right"
          dense={false}
          label={t('Name')}
          value={userState?.settings.name || '---'}
          valueColor={theme.colors.primary}
          onPress={handleNamePress}
        />
        <FormInput
          valueAlign="right"
          rightIconName="chevron.right"
          dense={false}
          label={t('Role')}
          value={tRole(userState?.role || Role.CARERECEIVER)}
          valueColor={theme.colors.primary}
          onPress={handleRolePress}
        />
        <FormInput
          valueAlign="right"
          rightIconName="chevron.right"
          dense={false}
          label={t('Linked Accounts')}
          value={userState?.settings.linked?.length ? t('Linked') : '---'}
          valueColor={theme.colors.primary}
          onPress={handleAccountLinkingPress}
        />
        {!token && (
          <List.Item
            title={tCommon('Sign In / Sign Up')}
            style={styles.buttonItem}
            containerStyle={styles.buttonContainer}
            contentStyle={styles.buttonContent}
            titleStyle={styles.signInText}
            onPress={handleAccountAction}
          />
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

const getStyles = createStyles<
  StyleRecord<
    'buttonItem' | 'buttonContainer' | 'buttonContent',
    'subheader' | 'signInText' | 'logoutText'
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
});

export default SettingsScreen;
