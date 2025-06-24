import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { List, Text } from 'react-native-paper';

import useAppTheme from '@/hooks/useAppTheme';

import useUserDisplayModeTranslation from '@/hooks/useUserDisplayModeTranslation';
import useUserTextSizeTranslation from '@/hooks/useUserTextSizeTranslation';
import useUserStore from '@/store/useUserStore';
import type { Theme } from '@/theme';
import { StaticTheme } from '@/theme';
import { UserDisplayMode, UserTextSize } from '@/types/user';
import { createStyles } from '@/utils/createStyles';

import FormInput from '@/components/atoms/FormInput';
import ScreenContainer from '@/components/atoms/ScreenContainer';
import Select from '@/components/atoms/Select';

interface SectionGroupProps {
  title: string;
  children: React.ReactNode;
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
  const { tUserTextSize } = useUserTextSizeTranslation();
  const { tUserDisplayMode } = useUserDisplayModeTranslation();

  const userState = useUserStore((state) => state.user);
  const updateUserSettings = useUserStore((state) => state.updateUserSettings);

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
    (option: (typeof textSizeOptions)[number]) => {
      updateUserSettings({ textSize: option.value });
    },
    [updateUserSettings],
  );

  const handleDisplayModeSelect = useCallback(
    (option: (typeof displayModeOptions)[number]) => {
      updateUserSettings({ displayMode: option.value });
    },
    [updateUserSettings],
  );

  // TODO: Add login screen
  // eslint-disable-next-line i18next/no-literal-string
  if (!userState) return <Text>Login</Text>;
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
              displayValue={tUserTextSize(userState.settings.textSize)}
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
              displayValue={tUserDisplayMode(userState.settings.displayMode)}
              options={displayModeOptions}
              onSelect={handleDisplayModeSelect}
            />
          )}
        />
      </SectionGroup>
      {/* TODO: implement reset settings */}
      <SectionGroup title={t('Reminder')} subheaderStyle={styles.subheader}>
        {/* eslint-disable-next-line i18next/no-literal-string */}
        <List.Item title={'pending'} style={styles.listItem} />
      </SectionGroup>
      <SectionGroup title={t('Voice Assistant')} subheaderStyle={styles.subheader}>
        {/* eslint-disable-next-line i18next/no-literal-string */}
        <List.Item title={'pending'} style={styles.listItem} />
      </SectionGroup>
      <SectionGroup title={t('Account')} subheaderStyle={styles.subheader}>
        {/* eslint-disable-next-line i18next/no-literal-string */}
        <List.Item title={'pending'} style={styles.listItem} />
        <List.Item title={t('Logout')} style={styles.listItem} />
      </SectionGroup>
    </ScreenContainer>
  );
};

const getStyles = createStyles({
  listItem: {
    paddingRight: StaticTheme.spacing.sm,
    paddingVertical: StaticTheme.spacing.xs,
  },
  listItemLast: {
    borderBottomWidth: 0,
  },
  listItemTitle: {
    fontSize: (theme: Theme) => theme.fonts.bodyLarge.fontSize,
    lineHeight: (theme: Theme) => theme.fonts.bodyLarge.lineHeight,
  },
  subheader: {
    color: (theme: Theme) => theme.colors.outline,
    textTransform: 'uppercase',
    paddingTop: StaticTheme.spacing.sm,
    paddingVertical: StaticTheme.spacing.xs,
  },
});

export default SettingsScreen;
