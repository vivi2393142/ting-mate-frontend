import { Tabs, usePathname } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import useAppTheme from '@/hooks/useAppTheme';

import IconSymbol from '@/components/atoms/IconSymbol';
import VoiceCommandButton from '@/components/organisms/VoiceCommandButton';

const tabScreensSettings = [
  {
    name: 'connect',
    titleKey: 'Connect',
    iconName: 'person.2.fill',
  },
  {
    name: 'index',
    titleKey: 'Home',
    iconName: 'house.fill',
  },
  {
    name: 'settings',
    titleKey: 'Settings',
    iconName: 'gearshape.fill',
  },
] as const;

const TabLayout = () => {
  const { t } = useTranslation('common');
  const theme = useAppTheme();

  const pathName = usePathname();
  const isOnHomeScreen = pathName === '/';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      {tabScreensSettings.map(({ name, titleKey, iconName }) => {
        const showVoiceButton = name === 'index' && isOnHomeScreen;
        return (
          <Tabs.Screen
            key={name}
            name={name}
            options={{
              tabBarLabelStyle: {
                fontSize: theme.fonts.labelSmall.fontSize,
                lineHeight: theme.fonts.labelSmall.lineHeight,
              },
              title: showVoiceButton ? '' : t(titleKey),
              tabBarAccessibilityLabel: showVoiceButton ? '' : t(titleKey),
              tabBarIcon: ({ color }) =>
                showVoiceButton ? (
                  <VoiceCommandButton style={styles.floatingButton} />
                ) : (
                  <IconSymbol name={iconName} color={color} size={24} />
                ),
            }}
          />
        );
      })}
    </Tabs>
  );
};

export default TabLayout;

const styles = StyleSheet.create({
  floatingButton: {
    justifyContent: 'flex-end',
  },
});
