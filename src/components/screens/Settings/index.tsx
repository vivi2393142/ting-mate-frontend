import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { StyleSheet, View } from 'react-native';
import { List, Text } from 'react-native-paper';

import useAppTheme from '@/hooks/useAppTheme';

import useUserTextSizeTranslation from '@/hooks/useUserTextSizeTranslation';
import useUserStore from '@/store/useUserStore';
import { UserTextSize } from '@/types/user';

import Select from '@/components/atoms/Select';
import ThemedView from '@/components/atoms/ThemedView';

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

  const theme = useAppTheme();

  const userState = useUserStore((state) => state.user);
  const updateUserSettings = useUserStore((state) => state.updateUserSettings);

  const styles = StyleSheet.create({
    listItem: {
      // TODO: only show bottom border if not last item
      borderBottomColor: theme.colors.outlineVariant,
      borderBottomWidth: 1,
      paddingRight: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    listItemTitle: {
      fontSize: theme.fonts.bodyLarge.fontSize,
      lineHeight: theme.fonts.bodyLarge.lineHeight,
    },
    subheader: {
      color: theme.colors.outline,
      paddingTop: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      textTransform: 'uppercase',
    },
  });

  const textSizeOptions = useMemo(
    () =>
      Object.values(UserTextSize).map((value) => ({
        value: value,
        title: tUserTextSize(value),
      })),
    [tUserTextSize],
  );

  const handleTextSizeSelect = useCallback(
    (option: (typeof textSizeOptions)[number]) => {
      updateUserSettings({ textSize: option.value });
    },
    [updateUserSettings],
  );

  // TODO: Add login screen
  // eslint-disable-next-line i18next/no-literal-string
  if (!userState) return <Text>Login</Text>;
  return (
    <ThemedView isRoot scrollable>
      <SectionGroup title={t('General')} subheaderStyle={styles.subheader}>
        <View>
          <List.Item
            title={t('Text Size')}
            right={() => (
              <Select
                displayValue={tUserTextSize(userState.settings.textSize)}
                options={textSizeOptions}
                onSelect={handleTextSizeSelect}
              />
            )}
            titleStyle={styles.listItemTitle}
            style={styles.listItem}
          />
        </View>
      </SectionGroup>
      {/* TODO: implement reset settings */}
      <SectionGroup title={t('Reminder')} subheaderStyle={styles.subheader}>
        <List.Item title={t('pending', { defaultValue: 'pending' })} style={styles.listItem} />
      </SectionGroup>
      <SectionGroup title={t('Voice Assistant')} subheaderStyle={styles.subheader}>
        <List.Item title={t('pending', { defaultValue: 'pending' })} style={styles.listItem} />
      </SectionGroup>
      <SectionGroup title={t('Account')} subheaderStyle={styles.subheader}>
        <List.Item title={t('pending', { defaultValue: 'pending' })} style={styles.listItem} />
        <List.Item title={t('Logout')} style={styles.listItem} />
      </SectionGroup>
    </ThemedView>
  );
};

export default SettingsScreen;
